/**
 * matcher.js
 * Matches hotels with the nearest pending worker requests.
 *
 * Strategy:
 *  - For each hotel, find all workers within MATCH_RADIUS_KM.
 *  - Sort matched workers by distance (closest first).
 *  - Cap at MAX_WORKERS_PER_HOTEL to keep routes manageable.
 *  - A worker can only be matched to ONE hotel (greedy first-come assignment).
 */

import { haversineKm, DEMAND_RADIUS_KM } from "./scorer.js";

const MATCH_RADIUS_KM       = DEMAND_RADIUS_KM; // 5 km default
const MAX_WORKERS_PER_HOTEL = 5;

/**
 * matchHotelsToWorkers(scoredHotels, workers)
 *
 * @param {Array} scoredHotels  – [{ hotel, distanceKm, scores }] sorted by priorityScore desc
 * @param {Array} workers       – NightWorkerRequest documents with .location populated
 *
 * @returns {Array} [{ hotel, distanceKm, scores, matchedWorkers: [workerDoc] }]
 */
export function matchHotelsToWorkers(scoredHotels, workers) {
  const assignedWorkerIds = new Set();

  return scoredHotels.map(({ hotel, distanceKm, scores }) => {
    const hotelLocation = hotel.location ?? hotel.hotelId?.location;

    if (!hotelLocation?.lat || !hotelLocation?.lng) {
      console.warn(`[matcher] Hotel "${hotel.name}" skipped — no location.`);
      return { hotel, distanceKm, scores, matchedWorkers: [] };
    }

    // Log every worker's distance from this hotel
    workers.forEach((w) => {
      if (!w.location?.lat || !w.location?.lng) {
        console.warn(`[matcher]   Worker ${w._id} has NO location — cannot match.`);
        return;
      }
      const km = haversineKm(hotelLocation, w.location);
      const withinRadius = km <= MATCH_RADIUS_KM;
      const alreadyAssigned = assignedWorkerIds.has(w._id.toString());
      console.log(`[matcher]   Worker ${w._id} → hotel "${hotel.name}": dist=${km.toFixed(3)}km, withinRadius=${withinRadius}, alreadyAssigned=${alreadyAssigned}`);
    });

    const eligible = workers
      .filter((w) => {
        if (assignedWorkerIds.has(w._id.toString())) return false;
        if (!w.location?.lat || !w.location?.lng)    return false;
        const km = haversineKm(hotelLocation, w.location);
        return km <= MATCH_RADIUS_KM;
      })
      .map((w) => ({ worker: w, km: haversineKm(hotelLocation, w.location) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, MAX_WORKERS_PER_HOTEL);

    eligible.forEach(({ worker }) => assignedWorkerIds.add(worker._id.toString()));

    console.log(`[matcher] Hotel "${hotel.name}" matched ${eligible.length} worker(s).`);
    return { hotel, distanceKm, scores, matchedWorkers: eligible.map(({ worker }) => worker) };
  });
}
