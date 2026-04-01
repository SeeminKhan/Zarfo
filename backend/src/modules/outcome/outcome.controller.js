// Outcome logging controller - HTTP handlers
import * as outcomeService from './outcome.service.js';

/**
 * GET /api/outcome/analytics/:hotelId
 * Get analytics for a specific hotel
 */
export const getAnalytics = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;
    
    const dateRange = {};
    if (startDate) dateRange.start = startDate;
    if (endDate) dateRange.end = endDate;
    
    const analytics = await outcomeService.getHotelAnalytics(hotelId, dateRange);
    
    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/outcome/training-data
 * Get training data for model retraining (admin only)
 */
export const getTrainingData = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const data = await outcomeService.getTrainingData(parseInt(limit) || 1000);
    
    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/outcome/sale/:foodId
 * Log sale outcome
 */
export const logSale = async (req, res) => {
  try {
    const { foodId } = req.params;
    const saleData = req.body;
    
    const outcome = await outcomeService.logSaleOutcome(foodId, saleData);
    
    res.json({
      success: true,
      message: 'Sale outcome logged successfully',
      data: outcome,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/outcome/donation/:foodId
 * Log donation outcome
 */
export const logDonation = async (req, res) => {
  try {
    const { foodId } = req.params;
    const donationData = req.body;
    
    const outcome = await outcomeService.logDonationOutcome(foodId, donationData);
    
    res.json({
      success: true,
      message: 'Donation outcome logged successfully',
      data: outcome,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/outcome/waste/:foodId
 * Log waste outcome
 */
export const logWaste = async (req, res) => {
  try {
    const { foodId } = req.params;
    
    const outcome = await outcomeService.logWasteOutcome(foodId);
    
    res.json({
      success: true,
      message: 'Waste outcome logged successfully',
      data: outcome,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
