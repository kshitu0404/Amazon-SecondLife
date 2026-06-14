export interface AnomalyOutput {
  anomaly_score: number; // 0-100
  top_factors: string[];
}

export function evaluateAnomalyScore(userId: string, currentCategory: string, returnsInCurrentCategory: number): AnomalyOutput {
  // Simulate an Isolation Forest model detecting behavioral anomalies
  
  let anomaly_score = Math.floor(Math.random() * 15); // Base background noise
  const top_factors: string[] = [];

  // Abnormal return volume in a specific category (e.g., 15 electronics returns/month)
  if (returnsInCurrentCategory > 10) {
    anomaly_score += 65;
    top_factors.push(`Anomalous category velocity (${returnsInCurrentCategory} ${currentCategory} returns recent)`);
  } else if (returnsInCurrentCategory > 5) {
    anomaly_score += 35;
    top_factors.push(`High category velocity (${returnsInCurrentCategory} ${currentCategory} returns)`);
  }

  anomaly_score = Math.min(anomaly_score, 100);

  return {
    anomaly_score,
    top_factors
  };
}
