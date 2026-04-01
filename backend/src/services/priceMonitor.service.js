// Real-time price monitoring service
import Food from '../modules/hotel/hotel.model.js';
import { getAIDecision } from '../modules/hotel/hotel.service.js';
import { emitPriceUpdate, emitStatusChange, emitAgentDecision } from '../utils/socket.js';

/**
 * Monitor a single food item and emit updates
 */
export const monitorFoodItem = async (foodId) => {
  try {
    const food = await Food.findById(foodId);
    
    if (!food || !food.isAvailable) {
      return null;
    }

    const now = new Date();
    const timeLeft = (new Date(food.expiryTime) - now) / (1000 * 60 * 60);

    // If expired, mark as wasted
    if (timeLeft <= 0) {
      food.status = 'wasted';
      food.isAvailable = false;
      await food.save({ validateBeforeSave: false });
      
      emitStatusChange(food.hotelId, foodId, 'wasted', {
        message: 'Item expired and marked as wasted',
      });
      
      return { status: 'wasted', timeLeft: 0 };
    }

    // Get fresh AI decision
    const prepDate = new Date(food.prepTime);
    const aiDecision = await getAIDecision({
      FoodName: food.name,
      Category: food.category,
      PrepDate: prepDate.toISOString().split('T')[0],
      PrepTime: prepDate.toTimeString().slice(0, 5),
      ExpiryDate: new Date(food.expiryTime).toISOString().split('T')[0],
      ExpiryTime: new Date(food.expiryTime).toTimeString().slice(0, 5),
      Quantity: food.quantity,
      Price: food.sellingPrice || 100,
    });

    // Update food item with new AI suggestion
    const previousPrice = food.aiSuggestedPrice;
    const previousDecision = food.decision;
    
    food.aiSuggestedPrice = aiDecision.suggested_price || aiDecision.suggestedPrice;
    food.decision = aiDecision.decision?.toLowerCase() || 'sell';
    
    // Check if decision changed
    if (previousDecision !== food.decision) {
      if (food.decision === 'donate') {
        food.status = 'listed_for_donation';
        emitAgentDecision(food.hotelId, foodId, {
          decision: 'donate',
          reason: aiDecision.explanation || 'Time threshold reached',
          timeLeft,
        });
      }
    }
    
    // Save with validation disabled for monitoring updates
    await food.save({ validateBeforeSave: false });

    // Emit price update via WebSocket
    emitPriceUpdate(foodId, {
      suggestedPrice: food.aiSuggestedPrice,
      decision: food.decision,
      timeLeft: aiDecision.time_left || timeLeft,
      discountPercent: aiDecision.discount_percent || aiDecision.discountPercent,
      explanation: aiDecision.explanation,
      priceChanged: previousPrice !== food.aiSuggestedPrice,
      decisionChanged: previousDecision !== food.decision,
    });

    return {
      foodId,
      decision: food.decision,
      suggestedPrice: food.aiSuggestedPrice,
      timeLeft,
    };
  } catch (error) {
    console.error(`Error monitoring food ${foodId}:`, error);
    return null;
  }
};

/**
 * Monitor all active food items for a hotel
 */
export const monitorHotelItems = async (hotelId) => {
  try {
    const activeItems = await Food.find({
      hotelId,
      isAvailable: true,
      status: { $in: ['listed_for_sale', 'listed_for_donation'] },
    });

    const results = await Promise.all(
      activeItems.map(item => monitorFoodItem(item._id))
    );

    return results.filter(r => r !== null);
  } catch (error) {
    console.error(`Error monitoring hotel ${hotelId}:`, error);
    return [];
  }
};

/**
 * Start monitoring all active items (call this on server start)
 */
export const startGlobalMonitoring = (intervalMinutes = 5) => {
  console.log(`Starting global food monitoring (every ${intervalMinutes} minutes)`);
  
  const monitorAll = async () => {
    try {
      const activeItems = await Food.find({
        isAvailable: true,
        status: { $in: ['listed_for_sale', 'listed_for_donation'] },
      });

      console.log(`Monitoring ${activeItems.length} active food items`);
      
      for (const item of activeItems) {
        await monitorFoodItem(item._id);
        // Small delay to avoid overwhelming the AI service
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error in global monitoring:', error);
    }
  };

  // Run immediately on start
  monitorAll();
  
  // Then run on interval
  const interval = setInterval(monitorAll, intervalMinutes * 60 * 1000);
  
  return interval;
};
