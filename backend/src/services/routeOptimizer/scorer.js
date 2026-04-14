/**
 * scorer.js
 *
 * priorityScore = 0.35 * expiryScore
 *               + 0.25 * robinToHotelScore   (closer hotel = better)
 *               + 0.20 * robinToWorkerScore   (closer workers = better)
 *               + 0.15 * demandScore          (more requests = better)
 *               + 0.05 * quantityScore
 */

const WEIGHTS = {
  expiry:         0.35,
  robinToHotel:   0.25,
  robinToWorker:  0.20,
  demand:         0.15,
  quantity:       0.05,
};

const EXPIRY_WINDOW_MINUTES = 120;
const MAX_DISTANCE_KM       = 50;
const MAX_QUANTITY          = 100;
export const DEMAND_RADIUS_KM = 5; // preferred radius (for logging/intent)

function clamp(v) { return Math.min(1, Math.max(0, v)); }

function computeExpiryScore(expiryTime) {
  const minutesLeft = (new Date(expiryTime) - Date.now()) / 60_000;
  if (minutesLeft <= 0) return 1.0;
  return clamp(1 - minutesLeft / EXPIRY_WINDOW_MINUTES);
}

function computeDistanceScore(distanceKm) {
  // We use a linear decay up to MAX_DISTANCE_KM, 
  // but we clamp at 0.01 instead of 0 for very far points 
  // to ensure they still have a non-zero priority for the "closest one" fallback.
  return Math.max(0.01, clamp(1 - distanceKm / MAX_DISTANCE_KM));
}

function computeQuantityScore(quantity) {
  return clamp(quantity / MAX_QUANTITY);
}

// Haversine — local copy to avoid circular imports
export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * scoreHotel(hotel, robinToHotelKm, foodWorkers, avgRobinToWorkerKm)
 *
 * @param {Object} hotel               – Food document
 * @param {number} robinToHotelKm      – Distance from robin to this hotel
 * @param {Array}  foodWorkers         – NightWorkerRequests for this specific food
 * @param {number} avgRobinToWorkerKm  – Average distance from robin to all requesting workers
 */
export function scoreHotel(hotel, robinToHotelKm, foodWorkers = [], avgRobinToWorkerKm = 0) {
  const expiryScore        = computeExpiryScore(hotel.expiryTime);
  const robinToHotelScore  = computeDistanceScore(robinToHotelKm);
  const robinToWorkerScore = computeDistanceScore(avgRobinToWorkerKm);
  const demandScore        = clamp(foodWorkers.length / 5);
  const quantityScore      = computeQuantityScore(hotel.quantity);

  const priorityScore =
    WEIGHTS.expiry        * expiryScore        +
    WEIGHTS.robinToHotel  * robinToHotelScore  +
    WEIGHTS.robinToWorker * robinToWorkerScore +
    WEIGHTS.demand        * demandScore        +
    WEIGHTS.quantity      * quantityScore;

  return {
    expiryScore:        parseFloat(expiryScore.toFixed(4)),
    robinToHotelScore:  parseFloat(robinToHotelScore.toFixed(4)),
    robinToWorkerScore: parseFloat(robinToWorkerScore.toFixed(4)),
    demandScore:        parseFloat(demandScore.toFixed(4)),
    quantityScore:      parseFloat(quantityScore.toFixed(4)),
    priorityScore:      parseFloat(priorityScore.toFixed(4)),
  };
}
