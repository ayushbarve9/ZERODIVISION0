/**
 * Master REST & WebSocket API Contracts
 * Defines the contract exposed by Module 2 (Backend) and consumed by Modules 1, 3, 4.
 * Part of @civic/shared-types
 */

import {
  AiVisionAnalysis,
  CivicCategory,
  CivicIssue,
  DuplicateCluster,
  GeoPoint,
  IssueStatus,
  PriorityLevel,
} from './issue';
import { ResolutionProofSubmission, WorkerDutyStatus, WorkerTelemetry } from './user-worker';
import { RootCauseGraph, SystemAlert } from './system-alert';

/* ==========================================================================
   MODULE 1: CITIZEN PORTAL CONTRACTS (Person A)
   Strict Boundary: Ingestion & Feed only. No priority logic calculation.
   ========================================================================== */

export interface CreateIssuePayload {
  title: string;
  description: string;
  category: CivicCategory;
  location: GeoPoint;
  mediaBase64?: string; // Captured via HTML5 Camera API
  mediaUrl?: string;
  citizenName?: string;
  citizenPhone?: string;
}

export interface CreateIssueResponse {
  success: boolean;
  issue: CivicIssue;
  isClusteredWithExisting: boolean;
  clusterId?: string;
  duplicateWarning?: string;
}

export interface DuplicatePreflightQuery {
  latitude: number;
  longitude: number;
  category: CivicCategory;
  radiusMeters?: number; // Defaults to 30m if omitted
}

export interface DuplicateCandidate {
  id: string;
  ticketNumber: string;
  title: string;
  category: CivicCategory;
  status: IssueStatus;
  distanceMeters: number;
  thumbnailUrl?: string;
  reportedAgoMinutes: number;
}

export interface DuplicatePreflightResponse {
  hasDuplicateNearby: boolean;
  matchedCandidates: DuplicateCandidate[];
  recommendedAction: 'interrupt_modal' | 'allow_submit';
}

export interface CommunityFeedQuery {
  northEast?: { lat: number; lng: number };
  southWest?: { lat: number; lng: number };
  category?: CivicCategory;
  status?: IssueStatus;
  limit?: number;
  page?: number;
}

export interface CommunityFeedResponse {
  total: number;
  page: number;
  issues: Array<
    Pick<
      CivicIssue,
      | 'id'
      | 'ticketNumber'
      | 'title'
      | 'category'
      | 'status'
      | 'location'
      | 'media'
      | 'upvotes'
      | 'createdAt'
      | 'completedAt'
    >
  >;
}

/* ==========================================================================
   MODULE 3: AUTHORITY DISPATCH & WORKER CONTRACTS (Person C)
   Strict Boundary: State Mutators. Owns Reported -> Assigned -> Resolved.
   ========================================================================== */

export interface TriageListQuery {
  status?: IssueStatus;
  priority?: PriorityLevel;
  category?: CivicCategory;
  department?: string;
  sortBy?: 'priorityScore' | 'slaDeadline' | 'createdAt' | 'duplicateCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TriageListResponse {
  total: number;
  issues: CivicIssue[];
  criticalSlaCount: number;
  availableWorkersCount: number;
}

export interface AssignIssuePayload {
  issueId: string;
  workerId: string;
  targetDeadlineHours?: number;
  dispatcherNotes?: string;
}

export interface UpdateIssueStatusPayload {
  status: IssueStatus;
  notes?: string;
  workerId?: string;
  rejectionReason?: string;
}

export interface WorkerLocationPingPayload {
  workerId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speedKmh?: number;
  batteryLevel?: number;
}

export interface SubmitVerificationPayload extends ResolutionProofSubmission {}

/* ==========================================================================
   MODULE 4: CITY COMMAND CENTER CONTRACTS (Person D)
   Strict Boundary: Read-only consumer. Zero data generation.
   ========================================================================== */

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number; // 0.1 to 1.0 (weighted by priority score + cluster size)
}

export interface SpatialMapResponse {
  activeClusters: DuplicateCluster[];
  individualIssues: Array<
    Pick<
      CivicIssue,
      | 'id'
      | 'ticketNumber'
      | 'title'
      | 'category'
      | 'status'
      | 'priority'
      | 'location'
      | 'sla'
    >
  >;
  heatmapPoints: HeatmapPoint[];
  activeWorkerLocations: WorkerTelemetry[];
}

export interface CityMetricsResponse {
  totalActiveIssues: number;
  resolvedToday: number;
  averageResolutionHours: number;
  overallSlaAdherencePercent: number; // e.g. 94.2%
  categoryBreakdown: Record<CivicCategory, number>;
  departmentPerformance: Array<{
    department: string;
    resolvedCount: number;
    openCount: number;
    slaAdherencePercent: number;
  }>;
}

/* ==========================================================================
   MODULE 2: AI VISION & YOLOv11 DAMAGE ANALYSIS CONTRACTS
   ========================================================================== */

export interface AnalyzeImagePayload {
  /** Base64 encoded image string (data:image/jpeg;base64,...) */
  imageBase64?: string;
  /** Public or presigned image URL */
  imageUrl?: string;
  /** Optional category hint submitted by citizen */
  categoryHint?: CivicCategory;
  /** Optional location metadata for proximity hazard context */
  location?: GeoPoint;
}

export interface AnalyzeImageResponse {
  success: boolean;
  analysis: AiVisionAnalysis;
  warningAlert?: string;
}

export interface VerifyResolutionAiPayload {
  beforeImageUrl: string;
  afterImageUrl: string;
  category: CivicCategory;
}

export interface VerifyResolutionAiResponse {
  isResolved: boolean;
  confidence: number;
  beforeSeverityScore: number;
  afterSeverityScore: number;
  severityReductionPercent: number;
  remainingHazardCount: number;
  notes: string;
}

/* ==========================================================================
   WEBSOCKET CHANNELS & TYPED PAYLOADS (Socket.io)
   ========================================================================== */

export interface ServerToClientEvents {
  // New issue ingested by citizen
  'issue:created': (data: CivicIssue) => void;
  // Duplicate cluster created or members added (< 30m Haversine)
  'issue:clustered': (data: { cluster: DuplicateCluster; newIssueId: string }) => void;
  // Status mutation (reported -> assigned -> in_progress -> work_completed -> verified)
  'issue:status_changed': (data: {
    issueId: string;
    oldStatus: IssueStatus;
    newStatus: IssueStatus;
    updatedAt: string;
    updatedBy?: string;
  }) => void;
  // Live worker GPS telemetry stream
  'worker:telemetry': (data: WorkerTelemetry) => void;
  // Worker duty status changes
  'worker:status_changed': (data: { workerId: string; status: WorkerDutyStatus }) => void;
  // High-priority system alert (SLA breach, hazard spike, cascade)
  'alert:broadcast': (alert: SystemAlert) => void;
  // Root-cause graph dynamically generated / updated
  'command:graph_updated': (graph: RootCauseGraph) => void;
}

export interface ClientToServerEvents {
  // Field worker mobile GPS heartbeat
  'worker:ping_location': (telemetry: WorkerLocationPingPayload) => void;
  // Command center subscribing to specific spatial bounding box
  'command:subscribe_zone': (zoneId: string) => void;
  // Acknowledge system alert
  'alert:acknowledge': (data: { alertId: string; acknowledgedBy: string }) => void;
}
