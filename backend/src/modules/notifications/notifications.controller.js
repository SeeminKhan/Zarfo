/**
 * notifications.controller.js
 * GET /api/notifications
 *
 * Returns role-specific notifications for the authenticated user.
 * Each notification: { id, type, title, message, time, read, icon }
 */

import Food               from "../hotel/hotel.model.js";
import Order              from "../order/order.model.js";
import Delivery           from "../delivery/delivery.model.js";
import NightWorkerRequest from "../nightworker/worker.model.js";
import User               from "../auth/auth.model.js";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Hotel notifications ────────────────────────────────────────────────────
async function getHotelNotifications(userId) {
  const notifications = [];
  const now = new Date();

  // 1. Food expiring soon (within 60 min)
  const expiringSoon = await Food.find({
    hotelId:     userId,
    isAvailable: true,
    expiryTime:  { $gt: now, $lt: new Date(now.getTime() + 60 * 60 * 1000) },
  }).sort({ expiryTime: 1 }).limit(5).lean();

  expiringSoon.forEach((f) => {
    const mins = Math.round((new Date(f.expiryTime) - now) / 60000);
    notifications.push({
      id:      `expiry-${f._id}`,
      type:    "warning",
      title:   "Food expiring soon",
      message: `${f.name} expires in ${mins} min`,
      time:    timeAgo(f.createdAt),
      read:    false,
    });
  });

  // 2. Recent deliveries for this hotel's food
  const recentDeliveries = await Delivery.find({ hotelId: userId })
    .populate("foodId", "name")
    .sort({ updatedAt: -1 }).limit(5).lean();

  recentDeliveries.forEach((d) => {
    if (d.status === "delivered") {
      notifications.push({
        id:      `delivery-${d._id}`,
        type:    "success",
        title:   "Food delivered",
        message: `${d.foodId?.name || "Food"} was successfully delivered`,
        time:    timeAgo(d.deliveredAt || d.updatedAt),
        read:    false,
      });
    } else if (d.status === "picked_up") {
      notifications.push({
        id:      `pickup-${d._id}`,
        type:    "info",
        title:   "Food picked up",
        message: `${d.foodId?.name || "Food"} was picked up by a Robin`,
        time:    timeAgo(d.pickedUpAt || d.updatedAt),
        read:    false,
      });
    }
  });

  // 3. Pending orders for this hotel
  const pendingOrders = await Order.find({ hotelId: userId, status: "pending_pickup" })
    .populate("foodId", "name").sort({ createdAt: -1 }).limit(3).lean();

  pendingOrders.forEach((o) => {
    notifications.push({
      id:      `order-${o._id}`,
      type:    "info",
      title:   "New order pending",
      message: `${o.foodId?.name || "Food"} ordered — awaiting pickup`,
      time:    timeAgo(o.createdAt),
      read:    false,
    });
  });

  return notifications.slice(0, 8);
}

// ── User notifications ─────────────────────────────────────────────────────
async function getUserNotifications(userId) {
  const notifications = [];

  const orders = await Order.find({ userId })
    .populate("foodId", "name")
    .sort({ updatedAt: -1 }).limit(8).lean();

  orders.forEach((o) => {
    if (o.status === "delivered") {
      notifications.push({
        id:      `order-${o._id}`,
        type:    "success",
        title:   "Order delivered",
        message: `${o.foodId?.name || "Your order"} has been delivered`,
        time:    timeAgo(o.deliveryTime || o.updatedAt),
        read:    false,
      });
    } else if (o.status === "on_the_way") {
      notifications.push({
        id:      `order-${o._id}`,
        type:    "info",
        title:   "Order on the way",
        message: `${o.foodId?.name || "Your order"} is on its way to you`,
        time:    timeAgo(o.updatedAt),
        read:    false,
      });
    } else if (o.status === "pending_pickup") {
      notifications.push({
        id:      `order-${o._id}`,
        type:    "pending",
        title:   "Order confirmed",
        message: `${o.foodId?.name || "Your order"} is waiting for a Robin`,
        time:    timeAgo(o.createdAt),
        read:    false,
      });
    }
  });

  return notifications.slice(0, 8);
}

// ── Worker notifications ───────────────────────────────────────────────────
async function getWorkerNotifications(userId) {
  const notifications = [];

  const requests = await NightWorkerRequest.find({ workerId: userId })
    .populate("foodId", "name")
    .sort({ updatedAt: -1 }).limit(8).lean();

  requests.forEach((r) => {
    if (r.status === "delivered") {
      notifications.push({
        id:      `req-${r._id}`,
        type:    "success",
        title:   "Meal delivered",
        message: `${r.foodId?.name || "Your meal"} was delivered to you`,
        time:    timeAgo(r.updatedAt),
        read:    false,
      });
    } else if (r.status === "assigned") {
      notifications.push({
        id:      `req-${r._id}`,
        type:    "info",
        title:   "Robin assigned",
        message: `A Robin has been assigned to deliver ${r.foodId?.name || "your meal"}`,
        time:    timeAgo(r.updatedAt),
        read:    false,
      });
    } else if (r.status === "pending") {
      notifications.push({
        id:      `req-${r._id}`,
        type:    "pending",
        title:   "Request received",
        message: `Your request for ${r.foodId?.name || "food"} is pending`,
        time:    timeAgo(r.createdAt),
        read:    false,
      });
    }
  });

  // Also check available donation food
  const now = new Date();
  const available = await Food.find({
    isAvailable: true,
    status:      "listed_for_donation",
    expiryTime:  { $gt: now },
  }).sort({ expiryTime: 1 }).limit(3).lean();

  if (available.length) {
    notifications.unshift({
      id:      "available-food",
      type:    "info",
      title:   `${available.length} free meal${available.length > 1 ? "s" : ""} available`,
      message: `${available[0].name} and more are available tonight`,
      time:    "now",
      read:    false,
    });
  }

  return notifications.slice(0, 8);
}

// ── Robin notifications ────────────────────────────────────────────────────
async function getRobinNotifications(userId) {
  const notifications = [];

  // Active/recent deliveries
  const deliveries = await Delivery.find({ robinId: userId })
    .populate("foodId", "name")
    .sort({ updatedAt: -1 }).limit(5).lean();

  deliveries.forEach((d) => {
    if (d.status === "delivered") {
      notifications.push({
        id:      `del-${d._id}`,
        type:    "success",
        title:   "Delivery completed",
        message: `${d.foodId?.name || "Food"} delivered to ${d.recipientIds?.length || 0} recipient(s)`,
        time:    timeAgo(d.deliveredAt || d.updatedAt),
        read:    false,
      });
    } else if (d.status === "picked_up") {
      notifications.push({
        id:      `del-${d._id}`,
        type:    "info",
        title:   "Pickup confirmed",
        message: `You picked up ${d.foodId?.name || "food"} — head to drop location`,
        time:    timeAgo(d.pickedUpAt || d.updatedAt),
        read:    false,
      });
    } else if (d.status === "assigned") {
      notifications.push({
        id:      `del-${d._id}`,
        type:    "pending",
        title:   "Route assigned",
        message: `New delivery route for ${d.foodId?.name || "food"} is ready`,
        time:    timeAgo(d.createdAt),
        read:    false,
      });
    }
  });

  // Pending worker requests (new demand)
  const pendingCount = await NightWorkerRequest.countDocuments({ status: "pending" });
  if (pendingCount > 0) {
    notifications.unshift({
      id:      "pending-requests",
      type:    "info",
      title:   `${pendingCount} pending request${pendingCount > 1 ? "s" : ""}`,
      message: "Workers are waiting for food — check optimized routes",
      time:    "now",
      read:    false,
    });
  }

  return notifications.slice(0, 8);
}

// ── Admin notifications ────────────────────────────────────────────────────
async function getAdminNotifications() {
  const notifications = [];
  const now = new Date();

  // Expiring food
  const expiring = await Food.find({
    isAvailable: true,
    expiryTime:  { $gt: now, $lt: new Date(now.getTime() + 30 * 60 * 1000) },
  }).countDocuments();

  if (expiring > 0) {
    notifications.push({
      id:      "expiring",
      type:    "warning",
      title:   `${expiring} item${expiring > 1 ? "s" : ""} expiring in 30 min`,
      message: "Urgent: food needs to be redistributed immediately",
      time:    "now",
      read:    false,
    });
  }

  // Active deliveries
  const activeDeliveries = await Delivery.find({ status: { $in: ["assigned", "picked_up"] } })
    .populate("robinId", "name").sort({ createdAt: -1 }).limit(3).lean();

  activeDeliveries.forEach((d) => {
    notifications.push({
      id:      `admin-del-${d._id}`,
      type:    "info",
      title:   `Delivery ${d.status === "picked_up" ? "in transit" : "assigned"}`,
      message: `Robin ${d.robinId?.name || "unknown"} — ${d.status.replace("_", " ")}`,
      time:    timeAgo(d.updatedAt),
      read:    false,
    });
  });

  // New users today
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const newUsers = await User.countDocuments({ createdAt: { $gte: todayStart } });
  if (newUsers > 0) {
    notifications.push({
      id:      "new-users",
      type:    "success",
      title:   `${newUsers} new registration${newUsers > 1 ? "s" : ""} today`,
      message: "New users joined the Zarfo platform",
      time:    "today",
      read:    false,
    });
  }

  // Pending worker requests
  const pending = await NightWorkerRequest.countDocuments({ status: "pending" });
  if (pending > 0) {
    notifications.push({
      id:      "pending-workers",
      type:    "warning",
      title:   `${pending} unserved request${pending > 1 ? "s" : ""}`,
      message: "Workers are waiting — no Robin assigned yet",
      time:    "now",
      read:    false,
    });
  }

  return notifications.slice(0, 8);
}

// ── Main handler ───────────────────────────────────────────────────────────
export const getNotifications = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let notifications = [];

    if (role === "hotel")  notifications = await getHotelNotifications(_id);
    else if (role === "user")   notifications = await getUserNotifications(_id);
    else if (role === "worker") notifications = await getWorkerNotifications(_id);
    else if (role === "robin")  notifications = await getRobinNotifications(_id);
    else if (role === "admin")  notifications = await getAdminNotifications();

    res.json({ count: notifications.filter((n) => !n.read).length, notifications });
  } catch (err) {
    console.error("[notifications] Error:", err.message);
    next(err);
  }
};
