/**
 * geocode.js
 * Converts a user address object to { lat, lng } coordinates.
 *
 * Uses:
 *   1. Google Maps Geocoding API  — if GOOGLE_MAPS_API_KEY is set
 *   2. Nominatim (OpenStreetMap)  — free fallback, no key needed
 *
 * Returns null if geocoding fails (non-fatal — user is still registered).
 */

const GMAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Build a single address string from the address object.
 * { houseNo, suburb, city, state } → "1 Main St, Malad, Mumbai, Maharashtra"
 */
function buildAddressString(address = {}) {
  return [address.houseNo, address.suburb, address.city, address.state]
    .filter(Boolean)
    .join(", ");
}

/**
 * Geocode via Google Maps Geocoding API.
 */
async function geocodeGoogle(addressStr) {
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?address=${encodeURIComponent(addressStr)}&key=${GMAPS_KEY}`;

  const res  = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error(`Google Geocoding: ${data.status}`);
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

/**
 * Geocode via Nominatim (OpenStreetMap) — free, no key.
 * Rate limit: 1 req/sec. Fine for registration flow.
 */
async function geocodeNominatim(addressStr) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(addressStr)}&format=json&limit=1`;

  const res  = await fetch(url, {
    headers: { "User-Agent": "Zarfo-App/1.0" }, // Nominatim requires a User-Agent
  });
  const data = await res.json();

  if (!data?.length) {
    throw new Error(`Nominatim: no results for "${addressStr}"`);
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}

/**
 * geocodeAddress(address)
 *
 * @param {Object} address  – { houseNo, suburb, city, state }
 * @returns {{ lat: number, lng: number } | null}
 */
export async function geocodeAddress(address) {
  const addressStr = buildAddressString(address);

  if (!addressStr) {
    console.warn("[geocode] Empty address — skipping geocoding.");
    return null;
  }

  console.log(`[geocode] Geocoding address: "${addressStr}"`);

  try {
    if (GMAPS_KEY) {
      const loc = await geocodeGoogle(addressStr);
      console.log(`[geocode] Google result: lat=${loc.lat}, lng=${loc.lng}`);
      return loc;
    }

    const loc = await geocodeNominatim(addressStr);
    console.log(`[geocode] Nominatim result: lat=${loc.lat}, lng=${loc.lng}`);
    return loc;
  } catch (err) {
    console.warn(`[geocode] Failed to geocode "${addressStr}": ${err.message}`);
    return null;
  }
}
