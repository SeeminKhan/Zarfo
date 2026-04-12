/**
 * optimizedRoute.controller.js
 * GET /api/delivery/tasks/optimized
 *
 * Returns prioritised delivery routes for the authenticated robin.
 */

import Food               from "../hotel/hotel.model.js";
import NightWorkerRequest from "../nightworker/worker.model.js";
import Order              from "../order/order.model.js";
import Delivery           from "../delivery/delivery.model.js";
import { optimizeRoute }  from "../../services/routeOptimizer/index.js";

export const getOptimizedRoutes = async (req, res, next) => {
  try {
    const robin = req.user;
    console.log(`\n========== [optimizedRoute] START ==========`);
    console.log(`[optimizedRoute] Robin: id=${robin._id}, name=${robin.name}, role=${robin.role}`);
    console.log(`[optimizedRoute] Robin location raw:`, JSON.stringify(robin.location));

    // ── 1. Validate robin has a location ──────────────────────────────
    if (!robin.location?.lat || !robin.location?.lng) {
      console.warn(`[optimizedRoute] FAIL: Robin has no location. location=${JSON.stringify(robin.location)}`);
      return res.status(400).json({
        error: "Robin location is not set. Please update your location before requesting routes.",
      });
    }
    console.log(`[optimizedRoute] Robin location OK: lat=${robin.location.lat}, lng=${robin.location.lng}`);

    // ── 2. Fetch active donation food ─────────────────────────────────
    const now = new Date();

    // Find food IDs that already have an active delivery (assigned or picked_up)
    const activeDeliveries = await Delivery
      .find({ status: { $in: ["assigned", "picked_up"] } })
      .select("foodId")
      .lean();
    const activeFoodIds = new Set(activeDeliveries.map((d) => d.foodId?.toString()).filter(Boolean));
    console.log(`[optimizedRoute] Food IDs with active deliveries (excluded): ${[...activeFoodIds].join(", ") || "none"}`);

    const donationFood = await Food.find({
      isAvailable: true,
      status:      "listed_for_donation",
      expiryTime:  { $gt: now },
    })
      .select("name location hotelId expiryTime quantity category decision status isAvailable")
      .lean();

    const pendingOrders = await Order
      .find({ status: "pending_pickup" })
      .populate({
        path:   "foodId",
        select: "name location hotelId expiryTime quantity category status isAvailable",
      })
      .lean();

    const saleFood = pendingOrders
      .map((o) => o.foodId)
      .filter((f) => f && new Date(f.expiryTime) > now);

    const seenIds  = new Set(donationFood.map((f) => f._id.toString()));
    const combined = [...donationFood];
    saleFood.forEach((f) => {
      if (!seenIds.has(f._id.toString())) {
        seenIds.add(f._id.toString());
        combined.push(f);
      }
    });

    // Remove food that already has an active delivery in progress
    const hotels = combined.filter((h) => !activeFoodIds.has(h._id.toString()));
    console.log(`[optimizedRoute] Food listings found: ${hotels.length} (${donationFood.length} donation + ${saleFood.length} sale with pending orders)`);
    hotels.forEach((h, i) => {
      console.log(`[optimizedRoute]   Food[${i}]: id=${h._id}, name=${h.name}, decision=${h.decision}, status=${h.status}, isAvailable=${h.isAvailable}, location=${JSON.stringify(h.location)}, expiryTime=${h.expiryTime}`);
    });

    // ── 3. Fetch pending worker/user requests grouped by foodId ──────────
    const foodObjectIds = hotels.map((h) => h._id);

    const workerRequests = await NightWorkerRequest.find({
      status: "pending",   // only truly unassigned requests
      foodId: { $in: foodObjectIds },
    })
      .populate("workerId", "name location")
      .lean();

    console.log(`[optimizedRoute] Worker requests found: ${workerRequests.length} (linked to available food)`);
    workerRequests.forEach((w, i) => {
      console.log(`[optimizedRoute]   Worker[${i}]: id=${w._id}, foodId=${w.foodId}, location=${JSON.stringify(w.location)}, worker=${w.workerId?.name}`);
    });

    // Group requests by foodId string for O(1) lookup
    const workersByFood = {};
    workerRequests.forEach((req) => {
      const fid = req.foodId?.toString();
      if (!fid) return;
      if (!workersByFood[fid]) workersByFood[fid] = [];
      workersByFood[fid].push(req);
    });

    console.log(`[optimizedRoute] workersByFood keys: ${Object.keys(workersByFood).join(", ")}`);
    console.log(`[optimizedRoute] hotel _ids: ${hotels.map(h => h._id.toString()).join(", ")}`);

    // Only keep hotels that have at least one pending request
    const hotelsWithDemand = hotels.filter((h) => {
      const key = h._id.toString();
      const has = (workersByFood[key]?.length ?? 0) > 0;
      console.log(`[optimizedRoute] Hotel "${h.name}" (${key}): hasRequests=${has}`);
      return has;
    });

    if (!hotelsWithDemand.length) {
      console.warn(`[optimizedRoute] No food has pending worker requests — no routes to build.`);
      return res.status(200).json({
        message: "No pending requests for available food. Workers must request food first.",
        routes:  [],
      });
    }

    // Flatten workers for the optimizer — each worker carries their foodId
    const workers = workerRequests;

    // ── 4. Run optimiser ───────────────────────────────────────────────
    console.log(`[optimizedRoute] Running optimizer: ${hotelsWithDemand.length} hotels with demand, ${workers.length} worker requests`);
    const routes = await optimizeRoute(robin, hotelsWithDemand, workers, workersByFood);
    console.log(`[optimizedRoute] Optimizer returned ${routes.length} route(s).`);

    if (!routes.length) {
      console.warn(`[optimizedRoute] Optimizer returned 0 routes — likely no workers within 5km of any hotel.`);
      console.warn(`[optimizedRoute] Check: hotel locations vs worker locations vs MATCH_RADIUS_KM=5`);
    }

    routes.forEach((r, i) => {
      console.log(`[optimizedRoute]   Route[${i}]: hotel=${r.hotelName}, workers=${r.mealsServed}, score=${r.priorityScore}, risk=${r.expiryRisk}, dist=${r.totalDistance}km`);
    });

    console.log(`[optimizedRoute] ========== END ==========\n`);

    return res.status(200).json({
      robin:       { id: robin._id, name: robin.name, location: robin.location },
      totalRoutes: routes.length,
      routes,
    });
  } catch (err) {
    console.error("[optimizedRoute] UNHANDLED ERROR:", err.message);
    console.error(err.stack);
    next(err);
  }
};
