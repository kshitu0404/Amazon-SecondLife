export interface BundlingPrediction {
  region: string;
  expectedReturnsNextWeek: number;
  confidenceInterval: [number, number];
  recommendedReservedCapacityKg: number;
}

export function predictReturnsBundling(region: string, category: string): BundlingPrediction {
  // Simulate Time Series Forecasting (Prophet/LSTM)
  
  let baseReturns = 0;
  if (region.includes("Delhi NCR") || region.includes("Mumbai")) {
    baseReturns = 35;
  } else {
    baseReturns = 15;
  }

  if (category === "Electronics") {
    baseReturns = Math.floor(baseReturns * 1.5);
  }

  // Predict future returns based on historical 20% return rate for electronics in 7 days
  const expectedReturnsNextWeek = baseReturns + Math.floor(Math.random() * 10);
  
  // Reserve space: assume avg item is 1.5 kg
  const recommendedReservedCapacityKg = expectedReturnsNextWeek * 1.5;

  return {
    region,
    expectedReturnsNextWeek,
    confidenceInterval: [expectedReturnsNextWeek - 5, expectedReturnsNextWeek + 8],
    recommendedReservedCapacityKg: parseFloat(recommendedReservedCapacityKg.toFixed(1))
  };
}
