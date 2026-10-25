import { LOCATIONS } from '../data/locations';

// Nearest WA-08 community to a { lat, lon } point, with its distance in miles.
export function nearestLocation(point) {
  return LOCATIONS.map((l) => ({ loc: l, mi: distanceMiles(point, l) })).sort((a, b) => a.mi - b.mi)[0];
}

// Great-circle distance in miles between two { lat, lon } points.
export function distanceMiles(a, b) {
  const R = 3958.8; // Earth radius, miles
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
