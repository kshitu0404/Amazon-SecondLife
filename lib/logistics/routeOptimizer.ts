export interface RouteMatchResult {
  pickupPossible: boolean;
  date: string;
  slot: string;
  vanId: string;
  deviationDistanceKm: number;
  remainingCapacityKg: number;
  savingsInr: number;
  skipWarehouse: boolean;
}

export function findNearestDeliveryRoute(
  userLocation: string,
  itemWeightKg: number,
  localBuyerExists: boolean = false
): RouteMatchResult {
  // Simulate Route Optimization & Graph Search (Nearest Neighbor)
  const pickupPossible = true;
  
  // Simulate Vehicle Capacity Prediction (Max 100kg, Used 82kg)
  const maxCapacity = 100;
  const usedCapacity = 82;
  const remainingCapacityKg = maxCapacity - usedCapacity;
  
  // Check if item fits
  if (itemWeightKg > remainingCapacityKg) {
    return {
      pickupPossible: false,
      date: "",
      slot: "",
      vanId: "",
      deviationDistanceKm: 0,
      remainingCapacityKg,
      savingsInr: 0,
      skipWarehouse: false
    };
  }

  // Simulate Route Deviation Cost Calculator
  const normalPickupCost = 120; // INR
  const deviationDistanceKm = 2.4; 
  const fuelCostPerKm = 9; // INR
  const deviationCost = deviationDistanceKm * fuelCostPerKm;
  const savingsInr = normalPickupCost - deviationCost;

  // Warehouse Bypass Decision Engine
  // Customer -> Driver -> Local Buyer
  const skipWarehouse = localBuyerExists;

  return {
    pickupPossible,
    date: "Tomorrow",
    slot: "2 PM - 5 PM",
    vanId: "VAN-MH-14-882",
    deviationDistanceKm,
    remainingCapacityKg,
    savingsInr,
    skipWarehouse
  };
}
