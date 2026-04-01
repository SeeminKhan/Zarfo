// Outcome logging service - business logic for tracking predictions
import Outcome from './outcome.model.js';
import Food from '../hotel/hotel.model.js';

/**
 * Log initial ML prediction when food is listed
 */
export const logPrediction = async (foodId, predictionData, features, hotelId) => {
  try {
    const outcome = await Outcome.create({
      foodId,
      hotelId,
      prediction: {
        decision: predictionData.decision?.toLowerCase() || 'sell',
        suggestedPrice: predictionData.suggested_price || predictionData.suggestedPrice,
        timeLeftAtPrediction: predictionData.time_left || features.timeLeft,
        discountPercent: predictionData.discount_percent || predictionData.discountPercent,
        confidence: predictionData.confidence || null,
      },
      features: {
        category: features.category,
        quantity: features.quantity,
        originalPrice: features.originalPrice,
        shelfLife: features.shelfLife,
        prepTime: features.prepTime,
        expiryTime: features.expiryTime,
      },
      loggedAt: new Date(),
    });
    
    return outcome;
  } catch (error) {
    console.error('Error logging prediction:', error);
    throw error;
  }
};

/**
 * Update outcome when food is sold
 */
export const logSaleOutcome = async (foodId, saleData) => {
  try {
    const outcome = await Outcome.findOne({ foodId }).sort({ createdAt: -1 });
    
    if (!outcome) {
      throw new Error('No prediction found for this food item');
    }
    
    const timeToSell = saleData.soldAt 
      ? (new Date(saleData.soldAt) - outcome.loggedAt) / (1000 * 60 * 60) 
      : null;
    
    outcome.actualOutcome = {
      decision: 'sold',
      finalPrice: saleData.finalPrice,
      soldAt: saleData.soldAt || new Date(),
      timeToSell,
      quantitySold: saleData.quantitySold || outcome.features.quantity,
      quantityWasted: outcome.features.quantity - (saleData.quantitySold || outcome.features.quantity),
    };
    
    // Calculate metrics
    outcome.metrics = {
      predictionAccurate: outcome.prediction.decision === 'sell',
      priceAcceptance: Math.abs(saleData.finalPrice - outcome.prediction.suggestedPrice) < 10,
      wasteReduction: ((saleData.quantitySold || outcome.features.quantity) / outcome.features.quantity) * 100,
      revenueGenerated: saleData.finalPrice * (saleData.quantitySold || outcome.features.quantity),
    };
    
    outcome.outcomeResolvedAt = new Date();
    
    await outcome.save();
    return outcome;
  } catch (error) {
    console.error('Error logging sale outcome:', error);
    throw error;
  }
};

/**
 * Update outcome when food is donated
 */
export const logDonationOutcome = async (foodId, donationData) => {
  try {
    const outcome = await Outcome.findOne({ foodId }).sort({ createdAt: -1 });
    
    if (!outcome) {
      throw new Error('No prediction found for this food item');
    }
    
    outcome.actualOutcome = {
      decision: 'donated',
      finalPrice: 0,
      soldAt: donationData.donatedAt || new Date(),
      quantitySold: donationData.quantityDonated || outcome.features.quantity,
      quantityWasted: outcome.features.quantity - (donationData.quantityDonated || outcome.features.quantity),
    };
    
    outcome.metrics = {
      predictionAccurate: outcome.prediction.decision === 'donate',
      priceAcceptance: null,
      wasteReduction: ((donationData.quantityDonated || outcome.features.quantity) / outcome.features.quantity) * 100,
      revenueGenerated: 0,
    };
    
    outcome.outcomeResolvedAt = new Date();
    
    await outcome.save();
    return outcome;
  } catch (error) {
    console.error('Error logging donation outcome:', error);
    throw error;
  }
};

/**
 * Update outcome when food is wasted
 */
export const logWasteOutcome = async (foodId) => {
  try {
    const outcome = await Outcome.findOne({ foodId }).sort({ createdAt: -1 });
    
    if (!outcome) {
      throw new Error('No prediction found for this food item');
    }
    
    outcome.actualOutcome = {
      decision: 'wasted',
      finalPrice: 0,
      soldAt: new Date(),
      quantitySold: 0,
      quantityWasted: outcome.features.quantity,
    };
    
    outcome.metrics = {
      predictionAccurate: false,
      priceAcceptance: false,
      wasteReduction: 0,
      revenueGenerated: 0,
    };
    
    outcome.outcomeResolvedAt = new Date();
    
    await outcome.save();
    return outcome;
  } catch (error) {
    console.error('Error logging waste outcome:', error);
    throw error;
  }
};

/**
 * Get analytics for a hotel
 */
export const getHotelAnalytics = async (hotelId, dateRange = {}) => {
  try {
    const query = { hotelId };
    
    if (dateRange.start || dateRange.end) {
      query.loggedAt = {};
      if (dateRange.start) query.loggedAt.$gte = new Date(dateRange.start);
      if (dateRange.end) query.loggedAt.$lte = new Date(dateRange.end);
    }
    
    const outcomes = await Outcome.find(query);
    
    const analytics = {
      totalPredictions: outcomes.length,
      resolved: outcomes.filter(o => o.outcomeResolvedAt).length,
      pending: outcomes.filter(o => !o.outcomeResolvedAt).length,
      accuracy: {
        total: 0,
        sell: 0,
        donate: 0,
      },
      revenue: {
        total: 0,
        average: 0,
      },
      wasteReduction: {
        average: 0,
        totalSaved: 0,
        totalWasted: 0,
      },
    };
    
    const resolved = outcomes.filter(o => o.outcomeResolvedAt);
    
    if (resolved.length > 0) {
      const accurate = resolved.filter(o => o.metrics.predictionAccurate).length;
      analytics.accuracy.total = (accurate / resolved.length) * 100;
      
      analytics.revenue.total = resolved.reduce((sum, o) => sum + (o.metrics.revenueGenerated || 0), 0);
      analytics.revenue.average = analytics.revenue.total / resolved.length;
      
      const wasteReductions = resolved.map(o => o.metrics.wasteReduction || 0);
      analytics.wasteReduction.average = wasteReductions.reduce((a, b) => a + b, 0) / wasteReductions.length;
      analytics.wasteReduction.totalSaved = resolved.reduce((sum, o) => sum + (o.actualOutcome.quantitySold || 0), 0);
      analytics.wasteReduction.totalWasted = resolved.reduce((sum, o) => sum + (o.actualOutcome.quantityWasted || 0), 0);
    }
    
    return analytics;
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
};

/**
 * Get training data for model retraining
 */
export const getTrainingData = async (limit = 1000) => {
  try {
    const outcomes = await Outcome.find({ outcomeResolvedAt: { $ne: null } })
      .sort({ outcomeResolvedAt: -1 })
      .limit(limit)
      .lean();
    
    return outcomes.map(o => ({
      // Features
      category: o.features.category,
      quantity: o.features.quantity,
      originalPrice: o.features.originalPrice,
      shelfLife: o.features.shelfLife,
      timeLeftAtPrediction: o.prediction.timeLeftAtPrediction,
      
      // Labels
      actualDecision: o.actualOutcome.decision,
      finalPrice: o.actualOutcome.finalPrice,
      wasSold: o.actualOutcome.decision === 'sold',
      
      // Metadata
      timestamp: o.loggedAt,
    }));
  } catch (error) {
    console.error('Error getting training data:', error);
    throw error;
  }
};
