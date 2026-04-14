import Food               from "../hotel/hotel.model.js";
import Order              from "../order/order.model.js";
import NightWorkerRequest from "./worker.model.js";
import User               from "../auth/auth.model.js";
import Delivery           from "../delivery/delivery.model.js";

// ── 1. Browse donation food ────────────────────────────────────────────────
export const getDonationFood = async (filters = {}) => {
  const now = new Date();

  const query = {
    isAvailable: true,
    status:      "listed_for_donation",
    expiryTime:  { $gt: now },
  };

  if (filters.category && filters.category !== "all") {
    query.category = { $regex: new RegExp(`^${filters.category}$`, "i") };
  }

  const foods = await Food.find(query)
    .populate({ path: "hotelId", select: "name location", strictPopulate: false })
    .sort({ expiryTime: 1 });

  console.log(`[worker.service] getDonationFood: found ${foods.length} items`);

  return foods.map((f) => ({
    _id:        f._id,
    title:      f.name,
    images:     f.photo ? [f.photo] : [],
    hotelName:  f.hotelId?.name || "Unknown Hotel",
    category:   f.category,
    quantity:   f.quantity,
    expiryTime: f.expiryTime,
  }));
};

// ── 2. Worker requests a donation meal ────────────────────────────────────
//
// This does TWO things:
//   a) Creates an Order (worker's booking record)
//   b) Creates / reuses a NightWorkerRequest so the route optimizer
//      can see this worker as "pending" demand for a robin to serve.
//
// Food is NOT marked unavailable here — the robin still needs to pick it up.
// It will be marked donated when the robin confirms delivery.
//
export const placeDonationOrder = async (workerId, foodId) => {
  const food = await Food.findById(foodId);

  if (!food) {
    throw new Error("Food not found.");
  }
  if (food.status !== "listed_for_donation" || !food.isAvailable) {
    throw new Error("Food is not available for donation.");
  }

  // Fetch worker's stored location so the route optimizer can match them
  const workerUser = await User.findById(workerId).select("location name").lean();
  console.log(`[worker.service] placeDonationOrder: worker=${workerId} (${workerUser?.name}), food=${foodId} (${food.name})`);
  console.log(`[worker.service] Worker location: ${JSON.stringify(workerUser?.location)}`);

  // a) Create the Order record
  const order = await Order.create({
    userId:      workerId,
    hotelId:     food.hotelId,
    foodId,
    quantity:    1,
    price:       0,
    totalAmount: 0,
    status:      "pending_pickup",
  });
  console.log(`[worker.service] Order created: ${order._id}`);

  // b) Create a NightWorkerRequest if one doesn't already exist for this worker
  const existing = await NightWorkerRequest.findOne({ workerId, status: "pending" });

  if (existing) {
    console.log(`[worker.service] Worker already has pending NightWorkerRequest: ${existing._id}`);
  } else {
    const loc = workerUser?.location?.lat
      ? { lat: workerUser.location.lat, lng: workerUser.location.lng }
      : null;

    if (!loc) {
      console.warn(`[worker.service] Worker ${workerId} has no location set — route optimizer may not match them.`);
    }

    const req = await NightWorkerRequest.create({
      workerId,
      needFood: true,
      location: loc,
      foodId:   food._id,   // ← link to the specific food requested
      status:   "pending",
    });
    console.log(`[worker.service] NightWorkerRequest created: ${req._id}, foodId=${food._id}, location=${JSON.stringify(loc)}`);
  }

  return order;
};

// ── 3. Worker order history ───────────────────────────────────────────────
export const getWorkerOrders = async (workerId) => {
  const orders = await Order.find({ userId: workerId })
    .populate({
      path:     "foodId",
      select:   "name hotelId",
      populate: { path: "hotelId", select: "name" },
    })
    .populate("deliveryAgentId", "name location")
    .sort({ createdAt: -1 });

  const enriched = await Promise.all(orders.map(async (o) => {
    const userId = o.userId;

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

    // Also try matching by NightWorkerRequest workerId
    if (!delivery && o.foodId?._id) {
      const nwr = await NightWorkerRequest.findOne({ workerId, foodId: o.foodId._id }).lean();
      if (nwr) {
        delivery = await Delivery
          .findOne({ workerRequestIds: nwr._id })
          .populate("robinId", "name location")
          .lean();
      }
    }

    const robinName     = delivery?.robinId?.name || o.deliveryAgentId?.name || null;
    const robinLocation = delivery?.robinId?.location || null;

    let eta = null;
    if (delivery?.pickedUpAt && delivery.status === "picked_up") {
      const elapsed   = (Date.now() - new Date(delivery.pickedUpAt)) / 60000;
      const estimated = delivery.routeSnapshot?.estimatedTime ?? 20;
      eta = Math.max(0, Math.round(estimated - elapsed));
    }

    // Use Delivery status as source of truth
    let resolvedStatus = o.status;
    if (delivery) {
      if (delivery.status === "delivered")  resolvedStatus = "delivered";
      else if (delivery.status === "picked_up") resolvedStatus = "on_the_way";
    }

    // Sync Order in DB if out of date (fire-and-forget)
    if (resolvedStatus !== o.status) {
      Order.updateOne({ _id: o._id }, { $set: { status: resolvedStatus } }).catch(() => {});
    }

    return {
      _id:          o._id,
      foodName:     o.foodId?.name || "Unknown",
      hotelName:    o.foodId?.hotelId?.name || "Unknown Hotel",
      status:       resolvedStatus,
      createdAt:    o.createdAt,
      deliveredAt:  delivery?.deliveredAt || null,
      pickedUpAt:   delivery?.pickedUpAt || null,
      driver:       robinName,
      robinLocation,
      eta,
    };
  }));

  return enriched;
};
