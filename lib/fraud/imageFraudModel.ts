export interface ImageFraudOutput {
  duplicate_image_detected: boolean;
  duplicate_matches: number;
  damage_detected: boolean;
  claim_matches_image: boolean;
  wrong_product_probability: number;
  confidence: number;
  fraud_probability: number; // 0-100
  top_factors: string[];
}

export function evaluateImageFraud(
  imageUrl: string, 
  claimType: string, 
  productCategory: string,
  forceFraud: boolean = false
): ImageFraudOutput {
  
  const top_factors: string[] = [];
  let fraud_probability = 5;
  
  // Simulate pHash duplicate checking
  const duplicate_matches = forceFraud ? Math.floor(Math.random() * 3) + 1 : 0;
  const duplicate_image_detected = duplicate_matches > 0;
  
  if (duplicate_image_detected) {
    fraud_probability += 50;
    top_factors.push(`Duplicate image detected (Matches: ${duplicate_matches})`);
  }

  // Simulate Damage Verification AI (CLIP / Vision API)
  let damage_detected = false;
  let claim_matches_image = true;
  
  if (claimType.toLowerCase().includes('damage') || claimType.toLowerCase().includes('broken')) {
    if (forceFraud) {
      damage_detected = false;
      claim_matches_image = false;
      fraud_probability += 35;
      top_factors.push('Damage claim mismatch (No damage detected by Vision AI)');
    } else {
      damage_detected = true;
      claim_matches_image = true;
    }
  }

  // Simulate Siamese Network Product Verification (Wrong Product Detection)
  const wrong_product_probability = forceFraud ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 10);
  
  if (wrong_product_probability > 70) {
    fraud_probability += 45;
    top_factors.push(`Wrong Product Probability: ${wrong_product_probability}% (Siamese Network Mismatch)`);
  }

  fraud_probability = Math.min(fraud_probability, 100);

  return {
    duplicate_image_detected,
    duplicate_matches,
    damage_detected,
    claim_matches_image,
    wrong_product_probability,
    confidence: 91 + Math.floor(Math.random() * 8), // 91-98%
    fraud_probability,
    top_factors
  };
}
