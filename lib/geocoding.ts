import * as h3 from 'h3-js';

export interface GeoLocation {
  lat: number;
  lng: number;
  h3_index: string;
}

/**
 * Mocks an external Geocoding API (like Google Maps Geocoding).
 * In a production environment, you would call your map provider's API.
 */
export async function geocodeAddress(address: string): Promise<GeoLocation> {
  // Simulating network delay for realistic behavior
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!address || address.trim() === '') {
    throw new Error('Address string cannot be empty.');
  }

  // MOCK: Generate deterministic but semi-random coordinates based on address length
  // We'll anchor around a central location (e.g., Bangalore, India) for demo purposes
  const baseLat = 12.9716;
  const baseLng = 77.5946;

  // Simple hash for deterministic offset
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate an offset of roughly +/- 0.05 degrees (~5.5km)
  const offsetLat = (hash % 1000) / 20000;
  const offsetLng = ((hash * 13) % 1000) / 20000;

  const lat = baseLat + offsetLat;
  const lng = baseLng + offsetLng;

  // Generate H3 index at resolution 8 (~700m hexagon)
  // Resolution 8 is optimal for hyperlocal on-demand delivery routing
  const h3_index = h3.latLngToCell(lat, lng, 8);

  return { lat, lng, h3_index };
}

/**
 * Validates if an H3 index is structurally valid
 */
export function isValidH3(index: string): boolean {
  return h3.isValidCell(index);
}
