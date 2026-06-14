import { evaluateBehavioralFraud, BehavioralFeatures } from './behavioralModel';
import { evaluateImageFraud } from './imageFraudModel';
import { evaluateAnomalyScore } from './anomalyEngine';
import { evaluateTrustScore } from './trustScore';

export interface FraudDecision {
  final_fraud_score: number; // 0-100
  decision_tier: 'AUTO_APPROVE' | 'REQUEST_PROOF' | 'MANUAL_REVIEW' | 'HOLD_REFUND';
  confidence: number;
  explanations: string[];
  sub_scores: {
    behavioral: number;
    vision: number;
    anomaly: number;
    trust: number;
    trust_level: string;
  };
}

export function calculateEnsembleFraudScore(
  userId: string,
  productCategory: string,
  claimNotes: string,
  imageUrl: string,
  behavioralContext?: Partial<BehavioralFeatures>,
  forceFraudSim: boolean = false
): FraudDecision {
  
  // 1. Run Behavioral Model
  const bModel = evaluateBehavioralFraud(userId, behavioralContext);
  
  // 2. Run CV Model
  const cvModel = evaluateImageFraud(imageUrl, claimNotes, productCategory, forceFraudSim);
  
  // 3. Run Anomaly Engine
  const returnsInCat = forceFraudSim ? 12 : (behavioralContext?.category_return_ratio ? Math.floor(behavioralContext.category_return_ratio * 10) : 2);
  const aModel = evaluateAnomalyScore(userId, productCategory, returnsInCat);
  
  // 4. Run Trust Score
  const trustEvents: any[] = [];
  if (forceFraudSim) trustEvents.push({ type: 'fraud_suspicion', count: 1 });
  else trustEvents.push({ type: 'normal_purchase', count: 5 });
  const tModel = evaluateTrustScore(forceFraudSim ? 60 : 80, trustEvents);

  // Combine Scores via Ensemble Equation
  // FraudScore = 0.4(B) + 0.3(CV) + 0.2(A) + 0.1(Inverse T)
  const bScore = bModel.fraud_probability;
  const cvScore = cvModel.fraud_probability;
  const aScore = aModel.anomaly_score;
  const tInverse = 100 - tModel.score; // Lower trust = higher fraud score
  
  const finalScore = Math.round((0.4 * bScore) + (0.3 * cvScore) + (0.2 * aScore) + (0.1 * tInverse));
  
  // Combine Explanations (XAI)
  const explanations = [
    ...bModel.top_factors,
    ...cvModel.top_factors,
    ...aModel.top_factors,
  ];
  
  if (tModel.level === 'Restricted' || tModel.level === 'Watchlist') {
    explanations.push(`Account Trust Level is ${tModel.level} (Score: ${tModel.score})`);
  }

  // Final Decision Tier
  // 0–30 → auto approve
  // 31–60 → request more proof
  // 61–80 → manual review
  // 81–100 → hold refund temporarily
  let decision_tier: FraudDecision['decision_tier'] = 'AUTO_APPROVE';
  if (finalScore > 80) decision_tier = 'HOLD_REFUND';
  else if (finalScore > 60) decision_tier = 'MANUAL_REVIEW';
  else if (finalScore > 30) decision_tier = 'REQUEST_PROOF';

  // Overall Confidence (average of all models + slight noise)
  const avgConfidence = Math.round((cvModel.confidence + 95 + 90) / 3);

  return {
    final_fraud_score: finalScore,
    decision_tier,
    confidence: avgConfidence,
    explanations,
    sub_scores: {
      behavioral: bScore,
      vision: cvScore,
      anomaly: aScore,
      trust: tModel.score,
      trust_level: tModel.level
    }
  };
}
