export interface PriorityScoringFeatures {
  route_match_score: number; // 0-100 (how close the deviation is)
  profit_margin_score: number; // 0-100 (item value vs pickup cost)
  fraud_risk_inverse: number; // 0-100 (100 - fraud score)
  urgency: number; // 0-100
  carbon_saving_score: number; // 0-100
}

export function calculatePickupPriority(features: PriorityScoringFeatures): number {
  // Simulate XGBoost Classifier priority output based on heuristic weights
  
  // Weights
  const wRoute = 0.30;
  const wProfit = 0.20;
  const wFraud = 0.20;
  const wUrgency = 0.15;
  const wCarbon = 0.15;

  const priority_score = 
    (features.route_match_score * wRoute) +
    (features.profit_margin_score * wProfit) +
    (features.fraud_risk_inverse * wFraud) +
    (features.urgency * wUrgency) +
    (features.carbon_saving_score * wCarbon);

  return Math.round(priority_score);
}
