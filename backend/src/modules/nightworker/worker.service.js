import Food from "../hotel/hotel.model.js";
import Order from "../order/order.model.js";

// 1. show donation-only food
export const getDonationFood = async (filters = {}) => {
  const now = new Date();

  const query = {
    isAvailable: true,
    status: "listed_for_donation",
    decision: "donate",
    expiryTime: { $gt: now }
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
    images: f.photo ? [f.photo] : [],
    hotelName: f.hotelId?.name || "Unknown Hotel",
    category: f.category,
    quantity: f.quantity,
    expiryTime: f.expiryTime,
  }));
};

// 2. Worker "books" the meal (free)
// Request food (no cart) => create order directly
export const requestFood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { foodId, quantity = 1 } = req.body;

    // 1️⃣ Get food details
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // 2️⃣ Check availability
    if (!food.isAvailable || food.quantity < quantity) {
      return res.status(400).json({ message: "Not enough quantity available" });
    }

    // 3️⃣ Auto-calculate price
    const price = food.sellingPrice ?? 0;
    const totalAmount = price * quantity;

    // 4️⃣ Create order
    const order = await Order.create({
      userId,
      hotelId: food.hotelId,
      foodId,
      quantity,
      price,
      totalAmount,
      status: "pending_pickup",
    });

    // 5️⃣ Reduce food quantity
    food.quantity -= quantity;

    // If quantity becomes 0, mark it sold/donated
    if (food.quantity <= 0) {
      food.isAvailable = false;
      food.status = food.sellingPrice ? "sold" : "donated";
    }

    await food.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error("Order request error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const placeDonationOrder = async (workerId, foodId) => {
  const food = await Food.findById(foodId);

  if (!food || food.status !== "listed_for_donation" || !food.isAvailable) {
    throw new Error("Food is not available for donation.");
  }

  // Donation food is free — set required order fields
  const price = 0;
  const quantity = 1;
  const totalAmount = 0;

  const order = await Order.create({
    userId: workerId,
    hotelId: food.hotelId,   // REQUIRED
    foodId,
    quantity,
    price,
    totalAmount,
    type: "donation",
    status: "pending_pickup",
  });

  // After requesting the meal → mark the food unavailable
  food.isAvailable = false;
  food.status = "donated";
  await food.save();

  return order;
};

// 3. Worker order history
export const getWorkerOrders = async (workerId) => {
  const orders = await Order.find({ userId: workerId})
    .populate({
      path: "foodId",
      select: "name hotelId",
      populate: { path: "hotelId", select: "name" },
    })
    .sort({ createdAt: -1 });

  return orders.map((order) => ({
    _id: order._id,
    foodName: order.foodId?.name || "Unknown",
    hotelName: order.foodId?.hotelId?.name || "Unknown Hotel",
    status: order.status,
    driver: order.driverName || "Not assigned",
    eta: order.eta || null,
    createdAt: order.createdAt,
  }));
};
