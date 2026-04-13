/**
 * routeOptimizer/index.js
 *
 * optimizeRoute(robin, hotels, workers, workersByFood)
 *
 * Key change from v1:
 *   - workers are now grouped by foodId (workersByFood map)
 *   - each hotel is only matched to workers who requested THAT specific food
 *   - scoring now includes robin→worker average distance
 */

import { scoreHotel, haversineKm, DEMAND_RADIUS_KM } from "./scorer.js";
import { buildAllRoutes }          from "./routerBuilder.js";
import { getDistance }             from "./googleMaps.js";

/**
 * @param {Object} robin          – User doc { _id, location: { lat, lng } }
 * @param {Array}  hotels         – Food docs that have at least one pending request
 * @param {Array}  workers        – All NightWorkerRequest docs (status=pending, with foodId)
 * @param {Object} workersByFood  – Map of foodId → [NightWorkerRequest]
 */
export async function optimizeRoute(robin, hotels, workers, workersByFood = {}) {
  if (!robin?.location?.lat || !robin?.location?.lng) {
    throw new Error("Robin location is required for route optimisation.");
  }
  if (!hotels.length) return [];

  // ── Step 1: Score every hotel ──────────────────────────────────────────
  const distanceResults = await Promise.allSettled(
    hotels.map((hotel) => {
      const hotelLoc = hotel.location ?? hotel.hotelId?.location;
      if (!hotelLoc?.lat || !hotelLoc?.lng) {
        console.warn(`[optimizer] Hotel "${hotel.name}" has NO location — skipping.`);
        return Promise.resolve(null);
      }
      return getDistance(robin.location, hotelLoc);
    })
  );

  const scoredHotels = hotels
    .map((hotel, i) => {
      const result   = distanceResults[i];
      const hotelLoc = hotel.location ?? hotel.hotelId?.location;

      let robinToHotelKm;
      if (result.status === "fulfilled" && result.value !== null) {
        robinToHotelKm = result.value;
      } else if (hotelLoc?.lat && hotelLoc?.lng) {
        robinToHotelKm = haversineKm(robin.location, hotelLoc);
      } else {
        return null;
      }

      // Workers who specifically requested this food
      const foodWorkers = workersByFood[hotel._id.toString()] ?? [];

      // Average robin→worker distance (used in scoring)
      const avgRobinToWorkerKm = computeAvgWorkerDistance(robin.location, foodWorkers);

      const scores = scoreHotel(hotel, robinToHotelKm, foodWorkers, avgRobinToWorkerKm);
      console.log(
        `[optimizer] "${hotel.name}": robinToHotel=${robinToHotelKm.toFixed(2)}km, ` +
        `avgWorkerDist=${avgRobinToWorkerKm.toFixed(2)}km, ` +
        `requests=${foodWorkers.length}, priority=${scores.priorityScore}`
      );

      return { hotel, distanceKm: robinToHotelKm, scores, foodWorkers };
    })
    .filter(Boolean)
    .sort((a, b) => b.scores.priorityScore - a.scores.priorityScore);

  console.log(`[optimizer] ${scoredHotels.length} hotel(s) scored.`);

  // ── Step 2: Build matched entries (workers already scoped per hotel) ───
  // No radius filtering needed here — workers already requested this specific food.
  // We just sort by distance from hotel and cap at 5.
  const matchedEntries = scoredHotels.map(({ hotel, distanceKm, scores, foodWorkers }) => {
    const hotelLoc = hotel.location ?? hotel.hotelId?.location;

    const sorted = foodWorkers
      .filter((w) => w.location?.lat && w.location?.lng)  // must have location to be routed to
      .map((w) => ({ worker: w, km: haversineKm(hotelLoc, w.location) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 5);

    if (sorted.length === 0 && foodWorkers.length > 0) {
      console.warn(`[optimizer] "${hotel.name}" has ${foodWorkers.length} request(s) but none have location set — skipping.`);
    }

    console.log(`[optimizer] "${hotel.name}" → ${sorted.length} worker(s) matched (${foodWorkers.length} total requests)`);
    sorted.forEach(({ worker, km }) => {
      if (km > DEMAND_RADIUS_KM) {
        console.log(`[optimizer]   MATCH FALLBACK: Worker ${worker._id} is ${km.toFixed(2)}km away (preferred < ${DEMAND_RADIUS_KM}km)`);
      }
    });
    return { hotel, distanceKm, scores, matchedWorkers: sorted.map((s) => s.worker) };
  });

  // ── Step 3: Build route objects ────────────────────────────────────────
  const routes = await buildAllRoutes(robin, matchedEntries);
  return routes;
}

// ── helpers ────────────────────────────────────────────────────────────────

function computeAvgWorkerDistance(robinLocation, workers) {
  const withLoc = workers.filter((w) => w.location?.lat && w.location?.lng);
  if (!withLoc.length) return 0;
  const total = withLoc.reduce((sum, w) => sum + haversineKm(robinLocation, w.location), 0);
  return total / withLoc.length;
}
