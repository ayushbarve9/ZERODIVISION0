export interface CivicIssue {
  issueId: string;
  category: 'Pothole' | 'Garbage' | 'Streetlight' | 'Water Leakage' | 'Road Damage';
  latitude: number;
  longitude: number;
  priorityScore: number;
  duplicateCount: number;
  status: 'Reported' | 'In Progress' | 'Resolved' | 'Rejected';
  department: string;
  workerId?: string;
  communityImpact: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  slaDeadline: string;
  isRecurring: boolean;
  address: string;
  createdAt: string;
}

export interface CivicAlert {
  id: string;
  type: 'CRITICAL' | 'DUPLICATE' | 'MASS_COMPLAINT' | 'SLA_WARNING' | 'SLA_BREACH' | 'RECURRING' | 'BLACKSPOT' | 'SUSPICIOUS_ACTIVITY' | 'RESOLUTION_REJECTED' | 'EMERGENCY';
  title: string;
  message: string;
  timestamp: string;
  associatedIssueId?: string;
  location?: { lat: number; lng: number };
}

export interface DepartmentPerformance {
  department: string;
  totalAssigned: number;
  resolvedPercentage: number;
  avgResolutionDays: number;
  slaBreachRate: number;
}

export interface Worker {
  workerId: string;
  name: string;
  department: string;
  latitude: number;
  longitude: number;
  status: 'Active' | 'OnBreak' | 'Inactive';
  assignedTasks: string[];
  heading: number;
}

export interface WardData {
  id: string;
  name: string;
  healthScore: number;
  status: 'Optimal' | 'Stable' | 'Attention Needed' | 'Critical Blackspot';
  totalIssues: number;
  center: [number, number];
  bounds: [[number, number], [number, number]];
}

export interface WorkerPerformance {
  workerId: string;
  name: string;
  department: string;
  tasksAssigned: number;
  tasksCompleted: number;
  avgTurnaroundDays: number;
}
