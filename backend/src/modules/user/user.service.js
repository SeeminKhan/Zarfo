import Food from "../hotel/hotel.model.js";
import Order from "../order/order.model.js";
import axios from "axios";

export const getAvailableFood = async (filters = {}) => {
  const foods = await Food.find({ isAvailable: true, status: "listed_for_sale" })
    .populate({ path: "hotelId", select: "name" });

  console.log(`Found ${foods.length} available items listed for sale.`);

  const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000/predict";

  const processedFoods = await Promise.all(foods.map(async (f) => {
    const pDate = new Date(f.prepTime);
    const eDate = new Date(f.expiryTime);

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formatTime = (d) => {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const aiPayload = {
      FoodName: f.name,
      Category: f.category || "other",
      PrepDate: formatDate(pDate),
      PrepTime: formatTime(pDate),
      ExpiryDate: formatDate(eDate),
      ExpiryTime: formatTime(eDate),
      Quantity: parseFloat(f.quantity),
      Price: parseFloat(f.sellingPrice)          
    };

    let finalDisplayPrice = f.sellingPrice;

    try {
      const { data } = await axios.post(FASTAPI_URL, aiPayload);

      if (data.decision === "DONATE") {
        console.log(`AI decided to DONATE (hiding from feed): ${f.name}`);
        return null; // Hide if donated
      }

      finalDisplayPrice = data.suggested_price;

      // Update DB so the order uses the same AI price
      f.aiSuggestedPrice = finalDisplayPrice;
      await f.save();

    } catch (err) {
      console.error(`AI Agent unreachable for ${f.name}, showing original price. Error: ${err.message}`);
    }

    return {
      _id: f._id,
      title: f.name,
      discountedPrice: finalDisplayPrice, 
      originalPrice: f.sellingPrice,
      hotelName: f.hotelId?.name || "Zarfo Partner",
      expiryTime: f.expiryTime,
      images: f.photo ? [f.photo] : [],
      description: ""
    };
  }));

  const availableItems = processedFoods.filter(item => item !== null);
  console.log(`Returning ${availableItems.length} items to user feed.`);
  return availableItems;
};

// Place order for a food item
export const placeOrder = async (userId, foodId) => {
  const food = await Food.findById(foodId);

  if (!food || food.status !== "listed_for_sale" || !food.isAvailable) {
    throw new Error("Food is not available for purchase.");
  }

  const order = await Order.create({
    userId,
    foodId,
    status: "pending_pickup",
  });

  // Mark food as sold
  food.isAvailable = false;
  food.status = "sold";
  await food.save();

  return order;
};

// Fetch orders for a logged-in user
export const getUserOrders = async (userId) => {
  // Populate foodId, then populate hotelId inside food
  const orders = await Order.find({ userId })
    .populate({
      path: "foodId",
      select: "name discountedPrice hotelId",
      populate: { path: "hotelId", select: "name", strictPopulate: false },
    })
    .sort({ createdAt: -1 });

  return orders.map((order) => ({
    _id: order._id,
    foodName: order.foodId?.name || "Unknown",
    hotelName: order.foodId?.hotelId?.name || "Unknown Hotel",
    price: order.foodId?.discountedPrice || 0,
    status: order.status,
    createdAt: order.createdAt,
    driver: order.driverName || "Not assigned",
    eta: order.eta || null,
  }));
};