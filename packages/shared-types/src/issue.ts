/**
 * Civic Issue Domain Contracts
 * Part of @civic/shared-types
 */

export type CivicCategory =
  | 'pothole'
  | 'water_leak'
  | 'garbage'
  | 'street_light'
  | 'drainage'
  | 'fallen_tree'
  | 'illegal_parking'
  | 'road_damage'
  | 'hazard'
  | 'other';

export type IssueStatus =
  | 'reported'          // Citizen submitted, pending AI/authority triage
  | 'acknowledged'      // Authority verified, queued for dispatch
  | 'assigned'          // Field worker dispatched
  | 'in_progress'       // Worker on site, actively repairing
  | 'work_completed'    // Worker submitted 'after' photo & proof
  | 'verified_resolved' // Authority or citizen verified resolution
  | 'rejected';         // Spam, duplicate, or out of jurisdiction

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy?: number; // In meters from HTML5 Geolocation API
  address?: string;
  landmark?: string;
}

export interface AiDetectionBox {
  label: string;
  category: CivicCategory;
  confidence: number;
  /** Normalized bounding box coordinates [ymin, xmin, ymax, xmax] (0.0 to 1.0) */
  bbox: [number, number, number, number];
  /** Bounding box area relative to whole image (0.0 to 1.0) */
  areaRatio: number;
  /** Severity weighting factor applied to this detection */
  severityWeight: number;
  /** Individual detection contribution to visual severity score (0 - 100) */
  severityContribution: number;
}

export interface AiImageAuthenticityCheck {
  /** True if the image shows high-confidence signatures of synthetic/generative AI */
  isAiGenerated: boolean;
  /** Probability (0.0 - 1.0) that the image is synthetic / AI-generated */
  confidence: number;
  /** Verdict label */
  authenticityLabel: 'authentic' | 'suspicious' | 'ai_generated';
  /** Detected markers, e.g. frequency artifacts, missing camera EXIF, generative AI tags */
  indicators: string[];
  /** Camera hardware & capture metadata integrity */
  metadataIntegrity: boolean;
  /** Detailed human-readable analysis summary */
  analysisSummary: string;
}

export interface AiVisionAnalysis {
  model: string; // e.g. 'yolo11n-civic'
  category: CivicCategory;
  /** Computed visual damage severity score S (0 - 100) */
  visualSeverityScore: number;
  overallConfidence: number;
  detections: AiDetectionBox[];
  /** Base64 data URL or storage URL with YOLOv11 bounding box annotations */
  annotatedImageUrl?: string;
  /** AI-generated / synthetic image authenticity audit */
  authenticity: AiImageAuthenticityCheck;
  processingTimeMs: number;
}

export interface IssueMedia {
  id: string;
  url: string;
  thumbnailUrl?: string;
  phase: 'before' | 'in_progress' | 'after';
  capturedAt: string; // ISO 8601
  capturedLocation?: GeoPoint;
  classificationLabels?: string[];
  aiConfidence?: number;
  aiAnalysis?: AiVisionAnalysis;
}

export interface PriorityScoreBreakdown {
  /** AI-derived severity (0 - 100) based on image damage magnitude */
  severityScore: number;
  /** Proximity to critical infra like hospitals, schools, transit arteries (0 - 100) */
  proximityScore: number;
  /** Duplicate report count multiplier (e.g., 1x, 1.5x, 2.2x) */
  duplicateMultiplier: number;
  /** Escalation score based on elapsed wait time vs SLA target */
  slaAgeFactor: number;
  /** Environmental risk modifier (e.g., torrential rain + deep pothole) */
  weatherHazardFactor: number;
  /** Weighted composite priority score (0 - 100) */
  totalScore: number;
  /** Mapped categorical priority level */
  computedLevel: PriorityLevel;
}

export interface DuplicateCluster {
  id: string;
  /** Primary / original report anchor ID */
  rootIssueId: string;
  /** All grouped report IDs */
  memberIssueIds: string[];
  /** Geographic centroid of clustered reports */
  centroid: GeoPoint;
  /** Radius of reports clustered (must be within Haversine < 30m constraint) */
  radiusMeters: number;
  /** Category of the cluster */
  category: CivicCategory;
  /** Aggregated duplicate count */
  totalReports: number;
  /** Clustering confidence (0.0 to 1.0) */
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface SLATracking {
  expectedResolutionHours: number;
  deadline: string; // ISO 8601
  isBreached: boolean;
  timeRemainingMinutes: number;
  breachSeverity?: 'none' | 'warning' | 'critical';
}

export interface CivicIssue {
  id: string;
  ticketNumber: string; // e.g. "CIV-2026-0892"
  title: string;
  description: string;
  category: CivicCategory;
  status: IssueStatus;
  priority: PriorityLevel;
  priorityBreakdown: PriorityScoreBreakdown;
  location: GeoPoint;
  
  /** Citizen reporter info (anonymized for public feeds) */
  citizenId?: string;
  citizenName?: string;
  citizenContactMasked?: string;
  
  /** Visual evidence (before repair, in-progress, after resolution) */
  media: IssueMedia[];
  
  /** Duplicate clustering linkage */
  clusterId?: string;
  isDuplicate: boolean;
  duplicateCount: number;
  
  /** SLA and Assignment metrics */
  sla: SLATracking;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedDepartment?: string;
  
  /** Community validation */
  upvotes: number;
  hasCitizenConfirmedResolution?: boolean;

  /** AI-Generated / Authenticity status */
  isAiGeneratedFlag?: boolean;
  aiAuthenticity?: AiImageAuthenticityCheck;

  /** Audit Timestamps */
  createdAt: string;
  acknowledgedAt?: string;
  assignedAt?: string;
  inProgressAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  updatedAt: string;
}

export interface DuplicateCheckRequest {
  latitude: number;
  longitude: number;
  category: CivicCategory;
  /** Threshold in meters (default: 30) */
  thresholdMeters?: number;
}

export interface DuplicateCheckResponse {
  isDuplicateDetected: boolean;
  matchedClusterId?: string;
  matchedIssue?: Pick<CivicIssue, 'id' | 'ticketNumber' | 'title' | 'category' | 'status' | 'location' | 'media'>;
  distanceMeters: number;
  warningMessage?: string;
}
