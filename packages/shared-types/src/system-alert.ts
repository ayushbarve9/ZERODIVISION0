/**
 * System Alerts & Spatial Root-Cause Graph Contracts
 * Part of @civic/shared-types
 */

import { CivicCategory, GeoPoint, PriorityLevel } from './issue';
import { DepartmentSummary } from './user-worker';

export type AlertSeverity = 'info' | 'warning' | 'urgent' | 'emergency';

export type AlertType =
  | 'sla_breach_imminent'    // Issue within 15% of SLA deadline expiration
  | 'sla_breached'            // SLA deadline passed
  | 'cluster_spike'           // Unusually rapid duplicates within 30m (< 15 mins)
  | 'infrastructure_cascade'  // Related failure (e.g., water main break -> road sinkhole)
  | 'hazard_detected'         // Critical public safety risk (live wire, chemical, cave-in)
  | 'worker_sos'              // Field worker panic button / unresponsive
  | 'resource_depletion';     // 0 available workers in zone with pending high-priority issues

export interface SystemAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  
  /** Entity references */
  issueId?: string;
  clusterId?: string;
  affectedIssueIds?: string[];
  departmentCode?: DepartmentSummary['code'];
  
  /** Spatial context */
  location?: GeoPoint;
  zone?: string;
  
  /** Triage state */
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  
  createdAt: string;
}

/**
 * Data contracts for React Flow Root-Cause Topology
 * Consumed by Module 4 (City Command Center)
 */
export type RootCauseNodeType =
  | 'infrastructure_asset' // e.g. Water Main Pipe #401, Substation B
  | 'primary_failure'      // e.g. Ruptured Conduit
  | 'cascading_issue'      // e.g. Pothole / Road Cave-in
  | 'citizen_cluster'      // e.g. 14 Citizen Inquiries
  | 'dispatch_team';       // e.g. Emergency Water Crew #2

export interface RootCauseNodeData {
  label: string;
  category?: CivicCategory;
  priority?: PriorityLevel;
  severity?: AlertSeverity;
  status?: string;
  incidentCount?: number;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface RootCauseGraphNode {
  id: string;
  type: RootCauseNodeType | string;
  position: { x: number; y: number };
  data: RootCauseNodeData;
}

export interface RootCauseGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, string | number>;
}

export interface RootCauseGraph {
  incidentId: string;
  title: string;
  nodes: RootCauseGraphNode[];
  edges: RootCauseGraphEdge[];
  summary: string;
  generatedAt: string;
}
