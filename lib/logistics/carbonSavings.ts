export interface CarbonSavingsResult {
  normalPickupEmissionKg: number;
  sharedRouteEmissionKg: number;
  co2SavedKg: number;
}

export function calculateCarbonSavings(deviationDistanceKm: number): CarbonSavingsResult {
  // Traditional Pickup: Separate bike/van for ~8 km
  const normalPickupDistance = 8.0; 
  const emissionFactor = 0.1; // kg CO2 per km for a standard van

  const normalPickupEmissionKg = normalPickupDistance * emissionFactor;
  
  // Shared Pickup: Truck already moving, only extra detour matters
  const sharedRouteEmissionKg = deviationDistanceKm * emissionFactor;
  
  // Carbon Savings = Normal - Shared
  const co2SavedKg = Math.max(0, normalPickupEmissionKg - sharedRouteEmissionKg);

  return {
    normalPickupEmissionKg: parseFloat(normalPickupEmissionKg.toFixed(2)),
    sharedRouteEmissionKg: parseFloat(sharedRouteEmissionKg.toFixed(2)),
    co2SavedKg: parseFloat(co2SavedKg.toFixed(2))
  };
}
