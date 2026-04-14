import express from "express";
import {
  getAvailableTasks,
  acceptTask,
  confirmPickupHandler,
  completeDeliveryHandler,
  getActiveDelivery,
  getHotelDeliveriesHandler,
  getRobinHistoryHandler,
  rateDelivery,
  getContactInfo,
  uploadProof,
} from "./delivery.controller.js";
import { getOptimizedRoutes } from "./optimizedRoute.controller.js";
import { protect }    from "../../middlewares/auth.js";
import { checkRole }  from "../../middlewares/checkRole.js";

const router = express.Router();

// ── Robin routes ──────────────────────────────────────────────────────────
router.get( "/tasks/available", protect, checkRole("robin"), getAvailableTasks);
router.get( "/tasks/optimized", protect, checkRole("robin"), getOptimizedRoutes);
router.get( "/tasks/active",    protect, checkRole("robin"), getActiveDelivery);
router.get( "/robin/history",   protect, checkRole("robin"), getRobinHistoryHandler);
router.post("/tasks/accept",    protect, checkRole("robin"), acceptTask);
router.post("/tasks/pickup",    protect, checkRole("robin"), confirmPickupHandler);
router.post("/tasks/complete",  protect, checkRole("robin"), completeDeliveryHandler);
router.post("/tasks/photo",     protect, checkRole("robin"), uploadProof);

// ── Hotel routes ──────────────────────────────────────────────────────────
router.get( "/hotel", protect, checkRole("hotel"), getHotelDeliveriesHandler);

// ── User / Worker routes ──────────────────────────────────────────────────
router.post("/rate",              protect, rateDelivery);
router.get( "/contact/:orderId",  protect, getContactInfo);

export default router;
