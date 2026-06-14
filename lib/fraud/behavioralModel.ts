export interface BehavioralFeatures {
  returns_last_90_days: number;
  refund_amount_last_90_days: number;
  high_value_returns: number;
  avg_days_before_return: number;
  account_age_days: number;
  purchase_frequency: number;
  category_return_ratio: number;
  failed_previous_returns: number;
  replacement_requests: number;
  seller_disputes: number;
}

export interface BehavioralOutput {
  fraud_probability: number;
  risk_level: 'Low' | 'Medium' | 'High';
  top_factors: string[];
}

export function evaluateBehavioralFraud(userId: string, features?: Partial<BehavioralFeatures>): BehavioralOutput {
  // Simulate an ML classifier (like XGBoost) by using a weighted heuristic on synthetic or provided data
  const data: BehavioralFeatures = {
    returns_last_90_days: features?.returns_last_90_days ?? Math.floor(Math.random() * 5),
    refund_amount_last_90_days: features?.refund_amount_last_90_days ?? Math.floor(Math.random() * 500),
    high_value_returns: features?.high_value_returns ?? 0,
    avg_days_before_return: features?.avg_days_before_return ?? 14,
    account_age_days: features?.account_age_days ?? Math.floor(Math.random() * 1000) + 30,
    purchase_frequency: features?.purchase_frequency ?? 2,
    category_return_ratio: features?.category_return_ratio ?? 0.1,
    failed_previous_returns: features?.failed_previous_returns ?? 0,
    replacement_requests: features?.replacement_requests ?? 0,
    seller_disputes: features?.seller_disputes ?? 0,
  };

  let fraud_probability = 5; // Base probability (5%)
  const top_factors: string[] = [];

  if (data.returns_last_90_days > 4) {
    fraud_probability += 30;
    top_factors.push(`${data.returns_last_90_days} returns in 90 days`);
  }
  
  if (data.high_value_returns > 2) {
    fraud_probability += 25;
    top_factors.push(`${data.high_value_returns} high-value returns`);
  }

  if (data.category_return_ratio > 0.6) {
    fraud_probability += 15;
    top_factors.push(`High category return ratio (${Math.round(data.category_return_ratio * 100)}%)`);
  }

  if (data.account_age_days < 30) {
    fraud_probability += 20;
    top_factors.push(`New account (${data.account_age_days} days old)`);
  }

  if (data.seller_disputes > 0) {
    fraud_probability += 25;
    top_factors.push(`${data.seller_disputes} seller disputes on record`);
  }

  // Cap probability at 100
  fraud_probability = Math.min(fraud_probability, 100);

  let risk_level: 'Low' | 'Medium' | 'High' = 'Low';
  if (fraud_probability > 75) risk_level = 'High';
  else if (fraud_probability > 40) risk_level = 'Medium';

  return {
    fraud_probability,
    risk_level,
    top_factors
  };
}
