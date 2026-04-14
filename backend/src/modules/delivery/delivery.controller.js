import {
  acceptRoute,
  confirmPickup,
  completeDelivery,
  getHotelDeliveries,
  getRobinActiveDelivery,
  getRobinDeliveryHistory,
  getAvailableTasksForRobin,
} from "./delivery.service.js";
import Order    from "../order/order.model.js";
import Delivery from "./delivery.model.js";
import User     from "../auth/auth.model.js";

// GET /api/delivery/tasks/available  (robin)
export const getAvailableTasks = async (req, res, next) => {
  try {
    const tasks = await getAvailableTasksForRobin();
    res.status(200).json(tasks);
  } catch (err) { next(err); }
};

// POST /api/delivery/tasks/accept  (robin)
// Body: { hotelId, foodId, workerIds, routeSnapshot }
export const acceptTask = async (req, res, next) => {
  try {
    const robinId = req.user._id;
    const { hotelId, foodId, workerIds, routeSnapshot } = req.body;

    if (!foodId) return res.status(400).json({ error: "foodId is required." });

    console.log(`[delivery.controller] acceptTask: robin=${robinId}, food=${foodId}, workers=${workerIds?.length}`);

    const delivery = await acceptRoute(robinId, { hotelId, foodId, workerIds, routeSnapshot });
    res.status(201).json({ message: "Route accepted. Delivery started.", delivery });
  } catch (err) { next(err); }
};

// POST /api/delivery/tasks/pickup  (robin)
// Body: { deliveryId }
export const confirmPickupHandler = async (req, res, next) => {
  try {
    const robinId    = req.user._id;
    const { deliveryId } = req.body;
    if (!deliveryId) return res.status(400).json({ error: "deliveryId is required." });

    console.log(`[delivery.controller] confirmPickup: robin=${robinId}, delivery=${deliveryId}`);
    const delivery = await confirmPickup(deliveryId, robinId);
    res.status(200).json({ message: "Pickup confirmed.", delivery });
  } catch (err) { next(err); }
};

// POST /api/delivery/tasks/complete  (robin)
// Body: { deliveryId }
export const completeDeliveryHandler = async (req, res, next) => {
  try {
    const robinId    = req.user._id;
    const { deliveryId } = req.body;
    if (!deliveryId) return res.status(400).json({ error: "deliveryId is required." });

    console.log(`[delivery.controller] completeDelivery: robin=${robinId}, delivery=${deliveryId}`);
    const delivery = await completeDelivery(deliveryId, robinId);
    res.status(200).json({ message: "Delivery completed.", delivery });
  } catch (err) { next(err); }
};

// GET /api/delivery/tasks/active  (robin) — resume after page refresh
export const getActiveDelivery = async (req, res, next) => {
  try {
    const delivery = await getRobinActiveDelivery(req.user._id);
    res.status(200).json({ delivery: delivery ?? null });
  } catch (err) { next(err); }
};

// GET /api/delivery/hotel  (hotel) — hotel sees their deliveries
export const getHotelDeliveriesHandler = async (req, res, next) => {
  try {
    const hotelId   = req.user._id;
    const deliveries = await getHotelDeliveries(hotelId);
    console.log(`[delivery.controller] getHotelDeliveries: hotel=${hotelId}, count=${deliveries.length}`);
    res.status(200).json(deliveries);
  } catch (err) { next(err); }
};

// GET /api/delivery/robin/history  (robin)
export const getRobinHistoryHandler = async (req, res, next) => {
  try {
    const history = await getRobinDeliveryHistory(req.user._id);
    res.status(200).json(history);
  } catch (err) { next(err); }
};
export const updateStatus = async (req, res, next) => {
  try {
    const { deliveryId, status } = req.body;
    if (status === "picked_up")  return confirmPickupHandler(req, res, next);
    if (status === "delivered")  return completeDeliveryHandler(req, res, next);
    res.status(400).json({ error: "Use /tasks/pickup or /tasks/complete instead." });
  } catch (err) { next(err); }
};

// POST /api/delivery/rate  (user or worker)
export const rateDelivery = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;
    const userId = req.user._id;
    if (!orderId) return res.status(400).json({ error: "orderId is required." });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "rating must be 1-5." });
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (order.status !== "delivered") return res.status(400).json({ error: "Can only rate delivered orders." });
    if (order.rating) return res.status(400).json({ error: "Already rated." });
    order.rating = rating;
    order.ratingComment = comment || null;
    order.ratedAt = new Date();
    await order.save();
    console.log(`[delivery.controller] Order ${orderId} rated ${rating}/5 by user ${userId}`);
    res.json({ message: "Rating submitted. Thank you!", rating });
  } catch (err) { next(err); }
};

// GET /api/delivery/contact/:orderId  (user or worker)
export const getContactInfo = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const order = await Order.findOne({ _id: orderId, userId }).lean();
    if (!order) return res.status(404).json({ error: "Order not found." });
    const delivery = await Delivery.findOne({
      $or: [
        { orderIds: order._id },
        { recipientIds: userId, foodId: order.foodId },
      ],
    }).populate("robinId", "name email location").lean();
    if (!delivery?.robinId) return res.json({ message: "Robin not yet assigned.", robin: null });
    res.json({
      robin: { name: delivery.robinId.name, location: delivery.robinId.location || null },
      deliveryStatus: delivery.status,
    });
  } catch (err) { next(err); }
};

// POST /api/delivery/tasks/photo  (robin)
export const uploadProof = async (req, res, next) => {
  try {
    const robinId = req.user._id;
    const { deliveryId, type, photo } = req.body;
    if (!deliveryId || !type || !photo) return res.status(400).json({ error: "deliveryId, type, and photo are required." });
    const delivery = await Delivery.findOne({ _id: deliveryId, robinId });
    if (!delivery) return res.status(404).json({ error: "Delivery not found." });
    if (type === "pickup") delivery.pickupProof = photo;
    else delivery.deliveryProof = photo;
    await delivery.save();
    console.log(`[delivery.controller] Photo uploaded for delivery ${deliveryId}, type=${type}`);
    res.json({ message: "Photo uploaded successfully." });
  } catch (err) { next(err); }
};
