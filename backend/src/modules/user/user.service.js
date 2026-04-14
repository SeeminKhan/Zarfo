import Food               from "../hotel/hotel.model.js";
import Order              from "../order/order.model.js";
import NightWorkerRequest from "../nightworker/worker.model.js";
import User               from "../auth/auth.model.js";
import Delivery           from "../delivery/delivery.model.js";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000/predict";

export const getAvailableFood = async (filters = {}) => {
  const now = new Date();
  const foods = await Food.find({
    isAvailable: true,
    status:      "listed_for_sale",
    expiryTime:  { $gt: now },
  }).populate({ path: "hotelId", select: "name" });

  console.log("[user.service] getAvailableFood: " + foods.length + " items found in DB");

  const processedFoods = await Promise.all(foods.map(async (f) => {
    const pDate = new Date(f.prepTime);
    const eDate = new Date(f.expiryTime);
    const pad = (n) => String(n).padStart(2, "0");
    const formatDate = (d) => d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate());
    const formatTime = (d) => pad(d.getHours()) + ":" + pad(d.getMinutes());

    const aiPayload = {
      FoodName: f.name, Category: f.category || "other",
      PrepDate: formatDate(pDate), PrepTime: formatTime(pDate),
      ExpiryDate: formatDate(eDate), ExpiryTime: formatTime(eDate),
      Quantity: parseFloat(f.quantity), Price: parseFloat(f.sellingPrice),
    };

    let finalDisplayPrice = f.aiSuggestedPrice != null ? f.aiSuggestedPrice : f.sellingPrice;

    try {
      const res = await fetch(FASTAPI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiPayload),
      });
      if (!res.ok) throw new Error("FastAPI " + res.status);
      const data = await res.json();
      console.log("[user.service] AI for " + f.name + ": decision=" + data.decision);
      if (data.decision === "DONATE") {
        finalDisplayPrice = f.sellingPrice;
      } else {
        finalDisplayPrice = data.suggested_price != null ? data.suggested_price : f.sellingPrice;
        // Use updateOne to avoid photo validation error
        await Food.updateOne({ _id: f._id }, { $set: { aiSuggestedPrice: finalDisplayPrice } });
      }
    } catch (err) {
      console.warn("[user.service] AI unreachable for " + f.name + ": " + err.message);
      finalDisplayPrice = f.aiSuggestedPrice != null ? f.aiSuggestedPrice : f.sellingPrice;
    }

    return {
      _id: f._id,
      title: f.name,
      discountedPrice: finalDisplayPrice != null ? finalDisplayPrice : f.sellingPrice,
      originalPrice: f.sellingPrice,
      hotelName: f.hotelId ? f.hotelId.name : "Zarfo Partner",
      category: f.category,
      quantity: f.quantity,
      expiryTime: f.expiryTime,
      images: f.photo ? [f.photo] : [],
      description: "",
    };
  }));

  const availableItems = processedFoods.filter(Boolean);
  console.log("[user.service] Returning " + availableItems.length + " items to user feed.");
  return availableItems;
};

export const placeOrder = async (userId, foodId) => {
  const food = await Food.findById(foodId).lean();
  if (!food || food.status !== "listed_for_sale" || !food.isAvailable) {
    throw new Error("Food is not available for purchase.");
  }

  const userDoc = await User.findById(userId).select("location name").lean();
  console.log("[user.service] placeOrder: userId=" + userId + " food=" + food.name);
  console.log("[user.service] User location: " + JSON.stringify(userDoc ? userDoc.location : null));

  const price = parseFloat(food.aiSuggestedPrice != null ? food.aiSuggestedPrice : (food.sellingPrice != null ? food.sellingPrice : 0)) || 0;

  const order = await Order.create({
    userId,
    hotelId: food.hotelId,
    foodId,
    quantity: 1,
    price,
    totalAmount: price,
    status: "pending_pickup",
  });
  console.log("[user.service] Order created: " + order._id);

  // Create NightWorkerRequest so robin optimizer can route to this user
  const existing = await NightWorkerRequest.findOne({ workerId: userId, status: "pending", foodId: foodId });
  if (!existing) {
    const loc = (userDoc && userDoc.location && userDoc.location.lat)
      ? { lat: userDoc.location.lat, lng: userDoc.location.lng }
      : null;
    if (!loc) console.warn("[user.service] User " + userId + " has no location.");
    const req = await NightWorkerRequest.create({ workerId: userId, needFood: true, location: loc, foodId: foodId, status: "pending" });
    console.log("[user.service] NightWorkerRequest created: " + req._id + " foodId=" + foodId);
  }

  // Mark food as sold using updateOne — avoids photo required validation
  await Food.updateOne({ _id: foodId }, { $set: { isAvailable: false, status: "sold" } });
  console.log("[user.service] Food " + foodId + " marked as sold.");
  return order;
};

export const getUserOrders = async (userId) => {
  const orders = await Order.find({ userId })
    .populate({
      path: "foodId",
      select: "name sellingPrice hotelId status",
      populate: { path: "hotelId", select: "name", strictPopulate: false },
    })
    .populate("deliveryAgentId", "name location")
    .sort({ createdAt: -1 });

  // Enrich with delivery info for each order
  const enriched = await Promise.all(orders.map(async (o) => {
    const userId = o.userId;

    // Find delivery by orderId first, then fallback to userId+foodId
    let delivery = await Delivery
      .findOne({ orderIds: o._id })
      .populate("robinId", "name location")
      .lean();

    if (!delivery && o.foodId?._id) {
      delivery = await Delivery
        .findOne({ recipientIds: userId, foodId: o.foodId._id })
        .populate("robinId", "name location")
        .lean();
    }

    // Also try matching via NightWorkerRequest
    if (!delivery && o.foodId?._id) {
      const nwr = await NightWorkerRequest.findOne({ workerId: userId, foodId: o.foodId._id }).lean();
      if (nwr) {
        delivery = await Delivery
          .findOne({ workerRequestIds: nwr._id })
          .populate("robinId", "name location")
          .lean();
      }
    }

    const robinName     = delivery?.robinId?.name || o.deliveryAgentId?.name || null;
    const robinLocation = delivery?.robinId?.location || null;

    // Compute ETA from pickedUpAt if available (rough estimate)
    let eta = null;
    if (delivery?.pickedUpAt && delivery.status === "picked_up") {
      const elapsed   = (Date.now() - new Date(delivery.pickedUpAt)) / 60000;
      const estimated = (delivery.routeSnapshot?.estimatedTime ?? 20);
      eta = Math.max(0, Math.round(estimated - elapsed));
    }

    // Use Delivery status as source of truth — it's always up to date
    // Order.status may lag if the broad fallback didn't catch it
    let resolvedStatus = o.status;
    if (delivery) {
      if (delivery.status === "delivered")  resolvedStatus = "delivered";
      else if (delivery.status === "picked_up") resolvedStatus = "on_the_way";
      else if (delivery.status === "assigned")  resolvedStatus = resolvedStatus === "pending_pickup" ? "pending_pickup" : resolvedStatus;
    }

    // Also sync the Order in DB if it's out of date (fire-and-forget)
    if (resolvedStatus !== o.status) {
      Order.updateOne({ _id: o._id }, { $set: { status: resolvedStatus } }).catch(() => {});
    }

    return {
      _id:          o._id,
      foodName:     o.foodId?.name || "Unknown",
      hotelName:    o.foodId?.hotelId?.name || "Unknown Hotel",
      price:        o.price || 0,
      status:       resolvedStatus,
      createdAt:    o.createdAt,
      deliveredAt:  delivery?.deliveredAt || null,
      pickedUpAt:   delivery?.pickedUpAt || null,
      driver:       robinName,
      robinLocation,
      eta,
      rated:        !!o.rating,
      rating:       o.rating || null,
    };
  }));

  return enriched;
};