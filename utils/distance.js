import postalCodes from './belgian-postal-codes.json';

const EARTH_RADIUS_KM = 6371;

const toRadians = (deg) => (deg * Math.PI) / 180;

/**
 * Great-circle distance between two lat/lng points, in kilometres.
 */
export const haversineKm = (a, b) => {
  if (!a || !b) return null;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

/**
 * Look up coordinates for a Belgian postal code.
 * Accepts strings or numbers; strips whitespace and non-digits.
 * Returns { lat, lng, place } or null when unknown.
 */
export const coordsForPostalCode = (code) => {
  if (code == null) return null;
  const key = String(code).replace(/\D/g, '').slice(0, 4);
  if (key.length !== 4) return null;
  const entry = postalCodes[key];
  if (!entry) return null;
  return { lat: entry[0], lng: entry[1], place: entry[2] };
};

/**
 * Format a distance in km for UI display. Rounds to a whole km above 10,
 * one decimal below.
 */
export const formatDistanceKm = (km) => {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 1) return '< 1 km';
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};
