/**
 * Types for Civic AI Vision & Authenticity Platform (ZERODIVISION0)
 */

export type CivicCategory =
  | 'pothole'
  | 'road_damage'
  | 'water_leak'
  | 'drainage'
  | 'garbage'
  | 'street_light'
  | 'fallen_tree'
  | 'illegal_parking'
  | 'hazard'
  | 'non_civic_irrelevant';

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export type IssueStatus =
  | 'Unassigned'
  | 'Assigned'
  | 'In Progress'
  | 'On Site'
  | 'Pending Citizen Verification'
  | 'Resolved'
  | 'Disputed';

export interface DetectionBox {
  label: string;
  category: CivicCategory;
  confidence: number;
  // normalized [ymin, xmin, ymax, xmax]
  bbox: [number, number, number, number];
  areaRatio: number;
  severityWeight?: number;
  severityContribution: number;
}

export interface AuthenticityReport {
  isAiGenerated: boolean;
  confidence: number;
  authenticityLabel: 'authentic' | 'suspicious' | 'ai_generated' | 'non_civic';
  indicators: string[];
  metadataIntegrity: boolean;
  analysisSummary: string;
  isCivicHazard?: boolean;
  opticalEntropy?: number;
  fftAnomalyRatio?: number;
}

export interface AiVisionAnalysis {
  model: string;
  category: CivicCategory;
  visualSeverityScore: number; // 0 - 100
  overallConfidence: number;
  detections: DetectionBox[];
  annotatedImageUrl?: string;
  authenticity: AuthenticityReport;
  processingTimeMs: number;
  isCivicHazard?: boolean;
}

export interface PriorityScoreBreakdown {
  visualSeverityScore: number;
  proximityScore: number;
  duplicateMultiplier: number;
  slaAgeFactor: number;
  weatherHazardFactor: number;
  totalScore: number;
  computedLevel: PriorityLevel;
}

export interface CivicIssue {
  id: string;
  trackingNumber: string;
  title: string;
  category: CivicCategory;
  description: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    neighborhood: string;
  };
  status: IssueStatus;
  reportedAt: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  clusterId?: string;
  duplicateCount?: number;
  priorityScore: PriorityScoreBreakdown;
  aiAnalysis?: AiVisionAnalysis;
  resolutionProof?: {
    beforeImageUrl: string;
    afterImageUrl: string;
    resolvedAt: string;
    verifiedByAi: boolean;
    severityReductionPercent: number;
    notes: string;
  };
}

export interface PresetImage {
  id: string;
  name: string;
  category: CivicCategory;
  tag: 'Real Camera' | 'AI Synthetic' | 'Random Non-Civic';
  tagColor: 'emerald' | 'rose' | 'amber';
  url: string;
  expectedOutcome: string;
}
