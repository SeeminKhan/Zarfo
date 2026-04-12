/**
 * routerBuilder.js
 * Builds the final route objects for each hotel → worker(s) pair.
 *
 * Each route:
 * {
 *   hotelId, workerIds,
 *   totalDistance, estimatedTime,
 *   expiryRisk, mealsServed, priorityScore,
 *   steps: [{ type: "pickup"|"drop", location, label }]
 * }
 */

import { getOptimizedRoute } from "./googleMaps.js";

/**
 * expiryRisk – human-readable urgency label.
 */
function classifyExpiryRisk(expiryTime) {
  const minutesLeft = (new Date(expiryTime) - Date.now()) / 60_000;
  if (minutesLeft <= 0)   return "expired";
  if (minutesLeft <= 30)  return "critical";
  if (minutesLeft <= 60)  return "high";
  if (minutesLeft <= 120) return "medium";
  return "low";
}

/**
 * buildRoute(robin, matchedEntry)
 *
 * @param {Object} robin         – User document with .location { lat, lng }
 * @param {Object} matchedEntry  – { hotel, distanceKm, scores, matchedWorkers }
 * @returns {Object|null}        – Route object or null if no workers matched
 */
export async function buildRoute(robin, matchedEntry) {
  const { hotel, distanceKm, scores, matchedWorkers } = matchedEntry;

  if (!matchedWorkers.length) return null;

  const hotelLocation = hotel.location ?? hotel.hotelId?.location;
  if (!hotelLocation?.lat || !hotelLocation?.lng) return null;

  // Build ordered stops: robin → hotel (pickup) → each worker (drop)
  const stops = [
    robin.location,                                    // start: robin
    hotelLocation,                                     // pickup
    ...matchedWorkers.map((w) => w.location),          // drops
  ];

  // Call Google Maps (or fallback) for the full multi-stop route
  const { totalDistanceKm, totalTimeMin, legs } =
    await getOptimizedRoute(stops);

  // Build step-by-step instructions
  const steps = [
    {
      type:     "pickup",
      location: hotelLocation,
      label:    `Pick up from hotel: ${hotel.name}`,
      legIndex: 0,
    },
    ...matchedWorkers.map((w, i) => ({
      type:     "drop",
      location: w.location,
      label:    `Drop off to worker: ${w.workerId?.name ?? w._id}`,
      legIndex: i + 1,
    })),
  ];

  return {
    hotelId:       hotel._id,   // Food document _id (used by acceptRoute)
    foodId:        hotel._id,   // explicit alias so acceptRoute is unambiguous
    hotelName:     hotel.name,
    workerIds:     matchedWorkers.map((w) => w._id),
    totalDistance: totalDistanceKm,
    estimatedTime: totalTimeMin,
    expiryRisk:    classifyExpiryRisk(hotel.expiryTime),
    mealsServed:   matchedWorkers.length,
    priorityScore: scores.priorityScore,
    scores,
    steps,
    legs,
  };
}

/**
 * buildAllRoutes(robin, matchedEntries)
 * Processes all matched entries concurrently, filters nulls, sorts by priority.
 */
export async function buildAllRoutes(robin, matchedEntries) {
  const settled = await Promise.allSettled(
    matchedEntries.map((entry) => buildRoute(robin, entry))
  );

  const routes = settled
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value);

  // Sort: highest priorityScore first; tie-break on expiryRisk severity
  const riskOrder = { critical: 0, high: 1, medium: 2, low: 3, expired: 4 };
  routes.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore)
      return b.priorityScore - a.priorityScore;
    return (riskOrder[a.expiryRisk] ?? 5) - (riskOrder[b.expiryRisk] ?? 5);
  });

  return routes;
}
