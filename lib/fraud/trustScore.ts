export interface TrustScoreOutput {
  score: number;
  level: 'Trusted' | 'Normal' | 'Watchlist' | 'Restricted';
}

export function evaluateTrustScore(
  initialScore: number = 75,
  events: { type: 'normal_purchase' | 'legit_return' | 'fraud_suspicion' | 'confirmed_fraud', count: number }[]
): TrustScoreOutput {
  
  let score = initialScore;

  // Apply reinforcement-style dynamic adjustments
  for (const event of events) {
    switch (event.type) {
      case 'normal_purchase':
        score += (2 * event.count);
        break;
      case 'legit_return':
        score -= (1 * event.count);
        break;
      case 'fraud_suspicion':
        score -= (15 * event.count);
        break;
      case 'confirmed_fraud':
        score -= (40 * event.count);
        break;
    }
  }

  // Bound score
  score = Math.max(0, Math.min(100, score));

  let level: TrustScoreOutput['level'] = 'Normal';
  if (score >= 90) level = 'Trusted';
  else if (score >= 70) level = 'Normal';
  else if (score >= 40) level = 'Watchlist';
  else level = 'Restricted';

  return {
    score,
    level
  };
}
