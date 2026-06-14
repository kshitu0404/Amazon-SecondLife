// Types for the multi-image AI inspection workflow

export const ANGLE_LABELS = ['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom'] as const;
export type AngleLabel = typeof ANGLE_LABELS[number];

export interface UploadedImage {
  id: string;
  file: File;
  preview: string; // data URL
  angle: AngleLabel;
}

export interface InspectionDefect {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  likely_location: string;
}

export interface AngleAnalysis {
  angle: string;
  observations: string;
  coverage_status: 'good' | 'partial' | 'missing';
}

export interface ResaleImpact {
  estimated_value_change: string;
  notes: string;
}

export interface SustainabilityImpact {
  estimated_co2_saved: string;
  estimated_waste_diverted: string;
  notes: string;
}

export type LifecycleStatus = 
  | 'UPLOADED'
  | 'INSPECTED'
  | 'ROUTED'
  | 'LISTED'
  | 'SOLD'
  | 'DONATED'
  | 'RECYCLED'
  | 'ARCHIVED'
  | 'MANUAL_REVIEW';

export interface StatusEvent {
  status: LifecycleStatus;
  timestamp: string;
  note?: string;
  actor: string;
}

export interface ProductJourney {
  _id?: string;
  runId: string;
  productName: string;
  category: string;
  conditionNotes: string;
  uploadedImages: string[]; // base64 strings or URLs
  inspectionReport: InspectionReport;
  routingResult?: any;
  lifecycleStatus: LifecycleStatus;
  statusHistory: StatusEvent[];
  createdAt: string;
  updatedAt: string;
  buyerOrRecipient?: string;
  ownerLabel?: string;
  finalOutcome?: string;
}

export type FinalRecommendation = 'relist' | 'refurbish' | 'donate' | 'recycle' | 'exchange';

export interface InspectionReport {
  product_name: string;
  overall_condition_score: number;      // 0–100
  confidence_score: number;             // 0–100
  summary: string;
  defects: InspectionDefect[];
  angle_analysis: AngleAnalysis[];
  missing_images_needed: string[];
  final_recommendation: FinalRecommendation;
  reasoning: string;
  next_actions: string[];
  resale_impact: ResaleImpact;
  sustainability_impact: SustainabilityImpact;
}

export interface InspectionApiResponse {
  success: boolean;
  report?: InspectionReport;
  runId?: string;
  error?: string;
  setup_message?: string;
}
