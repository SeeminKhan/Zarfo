import Food from "../hotel/hotel.model.js";
import Order from "../order/order.model.js";

// Fetch available food for user feed
export const getAvailableFood = async (filters = {}) => {
  const now = new Date();
  const gracePeriod = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12h grace

  const query = {
    isAvailable: true,
    status: "listed_for_sale",
    decision: "sell",
    expiryTime: { $gt: gracePeriod },
  };

  if (filters.category && filters.category !== "all") {
    query.category = { $regex: new RegExp(`^${filters.category}$`, "i") };
  }

  const foods = await Food.find(query)
    .populate({ path: "hotelId", select: "name", strictPopulate: false })
    .sort({ expiryTime: 1 });

  return foods.map((f) => ({
    _id: f._id,
    title: f.name,
    description: "",
    images: f.photo ? [f.photo] : [],
    discountedPrice: f.aiSuggestedPrice || 0,
    originalPrice: f.sellingPrice || 0,
    cuisine: "",
    hotelName: f.hotelId?.name || "Unknown Hotel",
    category: f.category,
    quantity: f.quantity,
    expiryTime: f.expiryTime,
  }));
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
