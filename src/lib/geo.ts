/**
 * Calculates the great-circle distance between two points on the earth
 * using the Haversine formula (in meters).
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Returns human-readable distance (e.g. "350 m" or "2.4 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Estimates travel time in minutes based on distance.
 * Straight-line estimate: ~20 km/h average urban speed + 3 minutes walking/parking buffer.
 */
export function estimateTravelTimeMinutes(distanceMeters: number): number {
  const distanceKm = distanceMeters / 1000;
  const urbanSpeedKmh = 20; // 20 km/h urban commuting average
  const drivingMinutes = (distanceKm / urbanSpeedKmh) * 60;
  const parkingAndBufferMinutes = 3;
  return Math.max(2, Math.ceil(drivingMinutes + parkingAndBufferMinutes));
}

/**
 * Checks if a user is within the 500-meter proximity threshold for a 100% weighted vote.
 */
export function isWithinProximityRadius(
  userLat: number,
  userLng: number,
  masjidLat: number,
  masjidLng: number,
  radiusMeters: number = 500
): { inRadius: boolean; distanceMeters: number } {
  const distance = calculateDistanceMeters(userLat, userLng, masjidLat, masjidLng);
  return {
    inRadius: distance <= radiusMeters,
    distanceMeters: distance,
  };
}
