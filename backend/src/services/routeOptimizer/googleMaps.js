/**
 * googleMaps.js
 * Wrapper around Google Maps Distance Matrix + Directions APIs.
 * Falls back to Haversine straight-line distance when the API key
 * is absent (useful for local dev / CI without billing enabled).
 */

const GMAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE = "https://maps.googleapis.com/maps/api";

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Haversine formula – returns distance in kilometres between two lat/lng pairs.
 */
function haversineKm(origin, destination) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(origin.lat)) *
      Math.cos(toRad(destination.lat)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function latLngStr({ lat, lng }) {
  return `${lat},${lng}`;
}

// ── public API ─────────────────────────────────────────────────────────────

/**
 * getDistance(origin, destination)
 * Returns driving distance in km between two {lat, lng} points.
 * Falls back to Haversine if no API key is configured.
 */
export async function getDistance(origin, destination) {
  if (!GMAPS_KEY) {
    return parseFloat(haversineKm(origin, destination).toFixed(2));
  }

  const url =
    `${BASE}/distancematrix/json` +
    `?origins=${latLngStr(origin)}` +
    `&destinations=${latLngStr(destination)}` +
    `&mode=driving` +
    `&key=${GMAPS_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Distance Matrix HTTP ${res.status}`);
  const data = await res.json();

  const element = data?.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") {
    // graceful fallback
    return parseFloat(haversineKm(origin, destination).toFixed(2));
  }

  return parseFloat((element.distance.value / 1000).toFixed(2)); // metres → km
}

/**
 * getETA(origin, destination)
 * Returns estimated travel time in minutes.
 * Falls back to distance / 30 km·h⁻¹ if no API key.
 */
export async function getETA(origin, destination) {
  if (!GMAPS_KEY) {
    const km = haversineKm(origin, destination);
    return Math.ceil((km / 30) * 60); // assume 30 km/h average
  }

  const url =
    `${BASE}/distancematrix/json` +
    `?origins=${latLngStr(origin)}` +
    `&destinations=${latLngStr(destination)}` +
    `&mode=driving` +
    `&departure_time=now` +
    `&key=${GMAPS_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Distance Matrix HTTP ${res.status}`);
  const data = await res.json();

  const element = data?.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") {
    const km = haversineKm(origin, destination);
    return Math.ceil((km / 30) * 60);
  }

  // prefer duration_in_traffic when available
  const seconds =
    element.duration_in_traffic?.value ?? element.duration?.value ?? 0;
  return Math.ceil(seconds / 60);
}

/**
 * getOptimizedRoute(stops)
 * stops: Array<{ lat, lng }>  – first element is the origin (robin location)
 * Returns { totalDistanceKm, totalTimeMin, legs, polyline }
 * Falls back to sequential Haversine sum when no API key.
 */
export async function getOptimizedRoute(stops) {
  if (stops.length < 2) {
    return { totalDistanceKm: 0, totalTimeMin: 0, legs: [], polyline: null };
  }

  if (!GMAPS_KEY) {
    // sequential fallback
    let totalDistanceKm = 0;
    let totalTimeMin = 0;
    const legs = [];

    for (let i = 0; i < stops.length - 1; i++) {
      const km = haversineKm(stops[i], stops[i + 1]);
      const mins = Math.ceil((km / 30) * 60);
      totalDistanceKm += km;
      totalTimeMin += mins;
      legs.push({ distanceKm: parseFloat(km.toFixed(2)), timeMin: mins });
    }

    return {
      totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
      totalTimeMin,
      legs,
      polyline: null,
    };
  }

  const origin      = latLngStr(stops[0]);
  const destination = latLngStr(stops[stops.length - 1]);
  const waypoints   = stops
    .slice(1, -1)
    .map(latLngStr)
    .join("|");

  const url =
    `${BASE}/directions/json` +
    `?origin=${origin}` +
    `&destination=${destination}` +
    (waypoints ? `&waypoints=optimize:true|${waypoints}` : "") +
    `&mode=driving` +
    `&key=${GMAPS_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions API HTTP ${res.status}`);
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(`Directions API error: ${data.status}`);
  }

  const route = data.routes[0];
  let totalDistanceKm = 0;
  let totalTimeMin    = 0;
  const legs = route.legs.map((leg) => {
    const km   = parseFloat((leg.distance.value / 1000).toFixed(2));
    const mins = Math.ceil(leg.duration.value / 60);
    totalDistanceKm += km;
    totalTimeMin    += mins;
    return { distanceKm: km, timeMin: mins };
  });

  return {
    totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
    totalTimeMin,
    legs,
    polyline: route.overview_polyline?.points ?? null,
  };
}
