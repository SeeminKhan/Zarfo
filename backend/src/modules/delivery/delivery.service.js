/**
 * delivery.service.js
 * Full delivery lifecycle:
 *   acceptRoute  → creates Delivery record, marks NightWorkerRequests as assigned
 *   confirmPickup → marks Delivery as picked_up
 *   completeDelivery → marks Delivery delivered, updates Orders + NightWorkerRequests
 *   getHotelDeliveries → hotel sees all deliveries for their food
 *   getRobinActiveDelivery → robin resumes active delivery after page refresh
 */

import Delivery           from "./delivery.model.js";
import Food               from "../hotel/hotel.model.js";
import Order              from "../order/order.model.js";
import NightWorkerRequest from "../nightworker/worker.model.js";
import User               from "../auth/auth.model.js";

// ── Accept a route (robin taps "Start Delivery") ──────────────────────────
export const acceptRoute = async (robinId, route) => {
  const { workerIds, routeSnapshot } = route;
  const snap   = routeSnapshot ?? route;
  const foodId = snap.foodId ?? snap.hotelId;

  console.log(`[delivery.service] acceptRoute: robin=${robinId}, foodId=${foodId}, workerRequestIds=${workerIds?.length}`);

  const food = await Food.findById(foodId);
  if (!food) throw new Error(`Food not found: ${foodId}`);

  // workerIds from the frontend are NightWorkerRequest._ids
  // Resolve them to actual User _ids for recipientIds
  const workerRequests = await NightWorkerRequest.find({
    _id:    { $in: workerIds ?? [] },
    status: { $in: ["pending", "assigned"] },
  });

  const userIds = workerRequests.map((r) => r.workerId);

  // Find Orders for these users for this food
  const orders = await Order.find({
    userId: { $in: userIds },
    foodId: food._id,
    status: { $in: ["pending_pickup", "on_the_way"] },
  });

  console.log(`[delivery.service] Found ${workerRequests.length} worker requests, ${userIds.length} users, ${orders.length} orders`);

  const delivery = await Delivery.create({
    robinId,
    hotelId:          food.hotelId,
    foodId:           food._id,
    recipientIds:     userIds,                              // actual User _ids
    workerRequestIds: workerRequests.map((r) => r._id),
    orderIds:         orders.map((o) => o._id),
    routeSnapshot,
    status:           "assigned",
  });

  await NightWorkerRequest.updateMany(
    { _id: { $in: workerRequests.map((r) => r._id) } },
    { $set: { status: "assigned", assignedRobin: robinId } }
  );

  console.log(`[delivery.service] Delivery created: ${delivery._id}`);
  return delivery;
};

// ── Confirm pickup (robin taps "Confirm Pickup") ──────────────────────────
export const confirmPickup = async (deliveryId, robinId) => {
  const delivery = await Delivery.findOne({ _id: deliveryId, robinId });
  if (!delivery) throw new Error("Delivery not found or not assigned to you.");
  if (delivery.status !== "assigned") throw new Error(`Cannot confirm pickup — status is "${delivery.status}".`);

  delivery.status     = "picked_up";
  delivery.pickedUpAt = new Date();
  await delivery.save();

  // Sync Order status to "on_the_way" so user/worker can see it
  // Update by stored IDs first, then broad fallback by foodId
  if (delivery.orderIds?.length) {
    await Order.updateMany(
      { _id: { $in: delivery.orderIds } },
      { $set: { status: "on_the_way", deliveryAgentId: robinId } }
    );
    console.log(`[delivery.service] Orders updated to on_the_way by ID: ${delivery.orderIds.length}`);
  }

  // Broad fallback — catches orders not in orderIds
  const pickupFallback = await Order.updateMany(
    { foodId: delivery.foodId, status: "pending_pickup" },
    { $set: { status: "on_the_way", deliveryAgentId: robinId } }
  );
  console.log(`[delivery.service] Orders updated to on_the_way by foodId fallback: ${pickupFallback.modifiedCount}`);

  console.log(`[delivery.service] Pickup confirmed: delivery=${deliveryId}`);
  return delivery;
};

// ── Complete delivery (robin taps "Complete Delivery") ────────────────────
export const completeDelivery = async (deliveryId, robinId) => {
  const delivery = await Delivery.findOne({ _id: deliveryId, robinId });
  if (!delivery) throw new Error("Delivery not found or not assigned to you.");
  if (delivery.status !== "picked_up") throw new Error(`Cannot complete — status is "${delivery.status}".`);

  delivery.status      = "delivered";
  delivery.deliveredAt = new Date();
  await delivery.save();

  console.log(`[delivery.service] completeDelivery: deliveryId=${deliveryId}, orderIds=${JSON.stringify(delivery.orderIds)}, recipientIds=${JSON.stringify(delivery.recipientIds)}, foodId=${delivery.foodId}`);

  // Update all Orders to "delivered" — by stored IDs first
  if (delivery.orderIds?.length) {
    const r1 = await Order.updateMany(
      { _id: { $in: delivery.orderIds } },
      { $set: { status: "delivered", deliveryTime: new Date(), deliveryAgentId: robinId } }
    );
    console.log(`[delivery.service] Orders updated by ID: ${r1.modifiedCount}`);
  }

  // Broad fallback: find ALL pending/on_the_way orders for this food
  // This catches cases where orderIds was empty at accept time
  const broadFallback = await Order.updateMany(
    {
      foodId: delivery.foodId,
      status: { $in: ["pending_pickup", "on_the_way"] },
    },
    { $set: { status: "delivered", deliveryTime: new Date(), deliveryAgentId: robinId } }
  );
  console.log(`[delivery.service] Orders updated by foodId broad fallback: ${broadFallback.modifiedCount}`);

  // Also update by userId + foodId for extra safety
  if (delivery.recipientIds?.length && delivery.foodId) {
    const r2 = await Order.updateMany(
      {
        userId: { $in: delivery.recipientIds },
        foodId: delivery.foodId,
        status: { $in: ["pending_pickup", "on_the_way"] },
      },
      { $set: { status: "delivered", deliveryTime: new Date(), deliveryAgentId: robinId } }
    );
    console.log(`[delivery.service] Orders updated by userId+foodId: ${r2.modifiedCount}`);
  }

  // Update NightWorkerRequests to "delivered"
  // Use both stored IDs and workerId+foodId fallback to ensure nothing is missed
  const recipientIds = delivery.recipientIds ?? [];
  const foodId       = delivery.foodId;

  if (delivery.workerRequestIds?.length) {
    await NightWorkerRequest.updateMany(
      { _id: { $in: delivery.workerRequestIds } },
      { $set: { status: "delivered" } }
    );
    console.log(`[delivery.service] NightWorkerRequests updated by ID: ${delivery.workerRequestIds.length}`);
  }

  // Fallback: also update by workerId + foodId to catch any that slipped through
  if (recipientIds.length && foodId) {
    const result = await NightWorkerRequest.updateMany(
      {
        workerId: { $in: recipientIds },
        foodId:   foodId,
        status:   { $in: ["pending", "assigned"] },
      },
      { $set: { status: "delivered" } }
    );
    console.log(`[delivery.service] NightWorkerRequests updated by workerId+foodId fallback: ${result.modifiedCount}`);
  }

  // Mark food as donated/sold using updateOne to skip photo validation
  await Food.updateOne(
    { _id: delivery.foodId },
    { $set: { isAvailable: false, status: delivery.routeSnapshot?.decision === "donate" ? "donated" : "sold" } }
  );
  console.log(`[delivery.service] Food ${delivery.foodId} marked as complete.`);

  return delivery;
};

// ── Hotel: get all deliveries for their food ──────────────────────────────
export const getHotelDeliveries = async (hotelId) => {
  const deliveries = await Delivery.find({ hotelId })
    .populate("robinId",      "name location")
    .populate("foodId",       "name category quantity expiryTime status")
    .populate("recipientIds", "name")   // User docs
    .sort({ createdAt: -1 })
    .lean();

  return Promise.all(deliveries.map(async (d) => {
    // If recipientIds is empty, fall back to Order.userId for this delivery
    let recipients = (d.recipientIds || []).map((r) => ({ id: r._id, name: r.name }));

    if (!recipients.length && d.orderIds?.length) {
      const orders = await Order.find({ _id: { $in: d.orderIds } })
        .populate("userId", "name")
        .lean();
      recipients = orders.map((o) => ({ id: o.userId?._id, name: o.userId?.name || "Unknown" }));
    }

    return {
      _id:          d._id,
      status:       d.status,
      foodName:     d.foodId?.name || "Unknown",
      foodCategory: d.foodId?.category,
      quantity:     d.foodId?.quantity,
      expiryTime:   d.foodId?.expiryTime,
      robinName:    d.robinId?.name || "Not assigned",
      robinId:      d.robinId?._id,
      recipients,
      mealsServed:  recipients.length || d.recipientIds?.length || 0,
      pickedUpAt:   d.pickedUpAt,
      deliveredAt:  d.deliveredAt,
      createdAt:    d.createdAt,
      route:        d.routeSnapshot,
    };
  }));
};

// ── Robin: get their active delivery (for page refresh resume) ────────────
export const getRobinActiveDelivery = async (robinId) => {
  const delivery = await Delivery.findOne({
    robinId,
    status: { $in: ["assigned", "picked_up"] },
  })
    .populate("foodId",       "name category quantity location hotelId")
    .populate("recipientIds", "name location")
    .sort({ createdAt: -1 })
    .lean();

  return delivery;
};

// ── Robin: get completed delivery history ─────────────────────────────────
export const getRobinDeliveryHistory = async (robinId) => {
  const deliveries = await Delivery.find({
    robinId,
    status: { $in: ["delivered", "cancelled"] },
  })
    .populate("foodId",       "name category quantity expiryTime")
    .populate("recipientIds", "name")
    .sort({ createdAt: -1 })
    .lean();

  return deliveries.map((d) => ({
    _id:          d._id,
    status:       d.status,
    foodName:     d.foodId?.name || "Unknown",
    foodCategory: d.foodId?.category,
    mealsServed:  (d.recipientIds || []).length,
    recipients:   (d.recipientIds || []).map((r) => ({ id: r._id, name: r.name })),
    totalDistance: d.routeSnapshot?.totalDistance ?? null,
    deliveredAt:  d.deliveredAt,
    createdAt:    d.createdAt,
  }));
};

// ── Legacy: get unassigned tasks ──────────────────────────────────────────
export const getAvailableTasksForRobin = async () => {
  return Delivery.find({ status: "assigned" })
    .populate("foodId",    "name category")
    .populate("robinId",   "name")
    .lean();
};
