/**
 * User, Authority Dispatcher & Field Worker Domain Contracts
 * Part of @civic/shared-types
 */

import { GeoPoint } from './issue';

export type UserRole =
  | 'citizen'
  | 'field_worker'
  | 'authority_dispatcher'
  | 'city_director'
  | 'system_admin';

export type WorkerDutyStatus =
  | 'available'       // Ready to receive dispatch tasks
  | 'en_route'        // Dispatched, driving/traveling to location
  | 'on_site'         // Arrived at coordinates, conducting repairs
  | 'off_duty'        // Shift ended or on break
  | 'emergency_hold'; // Diverted to high-priority disaster

export interface WorkerTelemetry {
  workerId: string;
  location: GeoPoint;
  heading?: number;      // Compass heading in degrees (0 - 360)
  speedKmh?: number;     // Speed for ETA calculations
  batteryLevel?: number; // 0.0 - 1.0 (alert if low battery on field)
  lastPing: string;      // ISO 8601
}

export interface DepartmentSummary {
  id: string;
  name: string;
  code: 'ROADS' | 'WATER' | 'SANITATION' | 'ELECTRICAL' | 'ENVIRONMENT';
  activeWorkersCount: number;
  openIssuesCount: number;
}

export interface FieldWorker {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'field_worker';
  department: string;
  departmentCode: DepartmentSummary['code'];
  skills: string[]; // e.g. ['asphalt_patching', 'heavy_machinery', 'pipe_welding']
  dutyStatus: WorkerDutyStatus;
  currentLocation?: GeoPoint;
  currentAssignedIssueId?: string;
  completedTasksCountToday: number;
  averageResolutionMinutes: number;
  rating: number; // 1.0 - 5.0 citizen satisfaction
}

export interface Dispatcher {
  id: string;
  name: string;
  email: string;
  role: 'authority_dispatcher' | 'city_director' | 'system_admin';
  department: string;
  assignedZone: string;
}

export interface DispatchAssignment {
  id: string;
  issueId: string;
  ticketNumber: string;
  workerId: string;
  dispatcherId: string;
  assignedAt: string;
  acknowledgedAt?: string;
  targetResolutionDeadline: string;
  status: 'pending' | 'accepted' | 'declined' | 'en_route' | 'completed';
  notes?: string;
}

export interface ResolutionProofSubmission {
  issueId: string;
  workerId: string;
  afterPhotoUrl: string;
  notes: string;
  completionGeo: GeoPoint;
  partsUsed?: { name: string; quantity: number }[];
  submittedAt: string;
}
