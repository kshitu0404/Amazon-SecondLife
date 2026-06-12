export interface HealthCard {
  cosmeticScore: number; // out of 10
  batteryHealth: number | null; // percentage, or null if not applicable
  purchaseDate: string;
  estimatedUsageDuration: string; // e.g., "18 months"
  returnHistory: string[];
  warrantyStatus: string; // e.g., "Expired", "6 Months Left"
  sustainabilityRating: number; // out of 5 stars
  estimatedResaleValue: number;
}

export type RoutingType = 'relist' | 'peer_exchange' | 'refurbishment' | 'donation' | 'recycling';

export interface RoutingResult {
  route: RoutingType;
  reasoning: string;
  expectedRecoveryValue: number;
  costSavings: number;
  confidenceLevel: number; // percentage (e.g. 94)
}

export interface AIAnalysis {
  conditionScore: number; // out of 100
  scratchDetection: string; // e.g. "Micro-scratches on back bezel (0.2mm)"
  damageAssessment: string; // e.g. "No structure damage detected"
  missingPartsAssessment: string; // e.g. "Includes original power adapter, USB-C cable. Missing box."
  confidenceScore: number; // percentage
  overallRecommendation: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  condition: 'like_new' | 'very_good' | 'good' | 'acceptable';
  conditionNotes: string;
  image: string;
  originalPrice: number;
  resalePrice: number;
  co2SavedKg: number;
  wasteDivertedKg: number;
  packagingSavedCount: number;
  milesAvoided: number;
  healthCard: HealthCard;
  aiAnalysis: AIAnalysis;
  routing: RoutingResult;
  status: 'available' | 'sold' | 'processing';
  sellerName?: string;
  sellerRating?: number;
}

export interface SustainabilityImpact {
  totalCo2SavedKg: number;
  totalWasteDivertedKg: number;
  totalMilesAvoided: number;
  totalPackagingSavedCount: number;
  monthlyCo2Trend: { month: string; amount: number }[];
  categoryDistribution: { name: string; percentage: number }[];
}
