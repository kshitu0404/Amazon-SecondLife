export interface PricingResult {
  suggestedPrice: number;
  demandScorePercent: number;
  suggestedAction: string;
}

export interface UpgradeROI {
  currentPrice: number;
  potentialUpgradedPrice: number;
  materialCost: number;
  netProfitIncrease: number;
  recommendedActionPlan: string;
}

const ADJUSTED_DAMAGE_PENALTY_RATES: Record<string, number> = {
  'Pristine': 0.0,
  'Box Damaged': 0.15,
  'Minor Scratches': 0.30,
  'Severe Damage': 0.70
};

export const REPAIR_MATERIAL_COSTS: Record<string, number> = {
  'Pristine': 0,
  'Box Damaged': 150,
  'Minor Scratches': 250,
  'Severe Damage': 350
};

/**
 * Mathematically simulates an XGBoost / Random Forest dynamic pricing matrix.
 */
export function calculateDynamicResalePrice(
  baseMarketPrice: number,
  damageLevel: string,
  ageMonths: number,
  nearbyDemandCount: number
): PricingResult {
  
  // 1. Base Depreciation: Exponential decay over item age
  const monthlyDecayRate = 0.02;
  const maxAgeDepreciation = 0.80;
  let agePenalty = 1 - Math.pow((1 - monthlyDecayRate), ageMonths);
  if (agePenalty > maxAgeDepreciation) agePenalty = maxAgeDepreciation;
  
  const priceAfterAge = baseMarketPrice * (1 - agePenalty);

  // 2. Damage Penalty Tier
  const damagePenaltyMultiplier = ADJUSTED_DAMAGE_PENALTY_RATES[damageLevel] || 0.50;
  const priceAfterDamage = priceAfterAge * (1 - damagePenaltyMultiplier);

  // 3. Proximity / Scarcity Bonus
  const maxDemandBonus = 0.10;
  const demandThreshold = 20; 
  let proximityBonus = (nearbyDemandCount / demandThreshold) * maxDemandBonus;
  if (proximityBonus > maxDemandBonus) proximityBonus = maxDemandBonus;
  
  // Final calculation
  let suggestedPrice = priceAfterDamage * (1 + proximityBonus);
  
  // Sanity floor bounds (don't go below 10% of base price)
  if (suggestedPrice < baseMarketPrice * 0.10) {
    suggestedPrice = baseMarketPrice * 0.10;
  }

  // Calculate generic 0-100 demand score percent
  let demandScore = (proximityBonus / maxDemandBonus) * 80;
  if (damageLevel === 'Pristine') demandScore += 20;
  if (damageLevel === 'Box Damaged') demandScore += 10;
  if (demandScore > 100) demandScore = 100;

  // Determine Suggested Action
  let suggestedAction = "Relist Immediately";
  if (damageLevel === 'Severe Damage' && suggestedPrice < 10) {
    suggestedAction = "Recycle / Liquidate";
  } else if (demandScore < 30) {
    suggestedAction = "Hold for Demand / Relist Below Market";
  }

  return {
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
    demandScorePercent: Math.round(demandScore),
    suggestedAction
  };
}

/**
 * Predictive Upgrade ROI Calculator.
 * Compares current "As-Is" resale price against a simulated "Upgraded" pristine price.
 */
export function calculateUpgradeROI(
  baseMarketPrice: number,
  currentDamageLevel: string,
  ageMonths: number
): UpgradeROI {
  // Current "As-Is" Price (without scarcity bonus for baseline comparison)
  const asIsPricing = calculateDynamicResalePrice(baseMarketPrice, currentDamageLevel, ageMonths, 0);
  const currentPrice = asIsPricing.suggestedPrice;

  // Potential "Upgraded" Pristine Price (without scarcity bonus)
  const upgradedPricing = calculateDynamicResalePrice(baseMarketPrice, 'Pristine', ageMonths, 0);
  const potentialUpgradedPrice = upgradedPricing.suggestedPrice;

  // Material Overhead Cost based on the current damage level
  const materialCost = REPAIR_MATERIAL_COSTS[currentDamageLevel] || 0;

  // Net Profit Increase after subtracting the flat material cost
  const netProfitIncrease = Math.round((potentialUpgradedPrice - currentPrice - materialCost) * 100) / 100;

  let recommendedActionPlan = "Sell As-Is";
  if (netProfitIncrease > 0) {
    recommendedActionPlan = "Highly Recommended to Repair";
  } else if (netProfitIncrease === 0 && currentDamageLevel !== 'Pristine') {
    recommendedActionPlan = "Marginal ROI - Proceed with Caution";
  }

  return {
    currentPrice,
    potentialUpgradedPrice,
    materialCost,
    netProfitIncrease,
    recommendedActionPlan
  };
}
