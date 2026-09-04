import { create } from 'zustand';

export type IssueStatus =
  | 'Unassigned'
  | 'Assigned'
  | 'In Progress'
  | 'On Site'
  | 'Pending Citizen Verification'
  | 'Disputed'
  | 'Resolved';

export interface IssueCoords {
  lat: number;
  lng: number;
}

export interface IssuePhotos {
  reported: string; // Citizen original photo
  before?: string;   // Worker on-site initial photo
  after?: string;    // Worker completion verification photo
}

export interface VerificationMetrics {
  locationMatch: boolean; // GPS within 15m of complaint
  timeMatch: boolean;     // Live capture timestamp integrity verified
  geofenceVarianceMeters?: number;
  exifTimestamp?: string;
  hardwareHash?: string;
}

export interface WorkerRef {
  id: string;
  name: string;
  initials: string;
  department?: string;
  avatarInitials?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  locationString: string;
  priorityScore: number; // 0 - 100
  status: IssueStatus;
  slaDeadline: string;   // ISO 8601 string
  worker?: WorkerRef | null;
  workerId?: string;
  coords: IssueCoords;
  photos: IssuePhotos;
  verificationMetrics: VerificationMetrics;
  aiAnalysis?: {
    model: string;
    category: string;
    visualSeverityScore: number;
    overallConfidence: number;
    detections: Array<{
      label: string;
      confidence: number;
      bbox: [number, number, number, number];
      severityContribution: number;
    }>;
    annotatedImageUrl?: string;
    authenticity: {
      isAiGenerated: boolean;
      confidence: number;
      authenticityLabel: 'authentic' | 'suspicious' | 'ai_generated';
      indicators: string[];
      metadataIntegrity: boolean;
      analysisSummary: string;
    };
  };
  notes?: string;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerInfo {
  id: string;
  name: string;
  initials: string;
  department: string;
  skills: string[];
  activeTasks: number;
}

export interface IssueStoreState {
  issues: Issue[];
  currentWorkerId: string;
  availableWorkers: WorkerInfo[];

  // Mutator Actions
  addIssue: (issue: Issue) => void;
  clearIssues: () => void;
  assignIssue: (id: string, workerId: string) => void;
  smartAssign: (id: string) => void;
  updateStatus: (id: string, status: IssueStatus) => void;
  submitResolution: (id: string, photos: Partial<IssuePhotos>, notes?: string) => void;
  rejectWorkerProof: (id: string, reason?: string) => void;
  forceResolve: (id: string, reason?: string) => void;
}

export const INITIAL_WORKERS: WorkerInfo[] = [
  {
    id: 'WRK-007',
    name: 'Alex Rivera',
    initials: 'AR',
    department: 'Roads & Infrastructure',
    skills: ['Pothole Repair', 'Asphalt Resurfacing'],
    activeTasks: 0,
  },
  {
    id: 'WRK-014',
    name: 'Samantha Chen',
    initials: 'SC',
    department: 'Water & Utilities',
    skills: ['Pipe Welding', 'Valve Replacement'],
    activeTasks: 0,
  },
  {
    id: 'WRK-022',
    name: 'Marcus Brody',
    initials: 'MB',
    department: 'Sanitation & Environment',
    skills: ['Biohazard Cleanup', 'Bulk Waste'],
    activeTasks: 0,
  },
  {
    id: 'WRK-031',
    name: 'Elena Rostova',
    initials: 'ER',
    department: 'Electrical & Lighting',
    skills: ['Grid Repair', 'Transformer Diagnostics'],
    activeTasks: 0,
  },
];

export const INITIAL_ISSUES: Issue[] = [];

export const useIssueStore = create<IssueStoreState>((set, get) => ({
  issues: [],
  currentWorkerId: 'WRK-007',
  availableWorkers: INITIAL_WORKERS,

  addIssue: (newIssue: Issue) => {
    set((state) => ({
      issues: [newIssue, ...state.issues],
    }));
  },

  clearIssues: () => {
    set({ issues: [] });
  },

  assignIssue: (id: string, workerId: string) => {
    const worker = get().availableWorkers.find((w) => w.id === workerId);
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              worker: worker
                ? {
                    id: worker.id,
                    name: worker.name,
                    initials: worker.initials,
                    avatarInitials: worker.initials,
                    department: worker.department,
                  }
                : { id: workerId, name: workerId, initials: workerId.slice(-2), avatarInitials: workerId.slice(-2) },
              workerId,
              status: 'Assigned',
              updatedAt: new Date().toISOString(),
            }
          : issue
      ),
    }));
  },

  smartAssign: (id: string) => {
    const workers = get().availableWorkers;
    const bestWorker = [...workers].sort((a, b) => a.activeTasks - b.activeTasks)[0];
    if (bestWorker) {
      get().assignIssue(id, bestWorker.id);
    }
  },

  updateStatus: (id: string, status: IssueStatus) => {
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status,
              updatedAt: new Date().toISOString(),
            }
          : issue
      ),
    }));
  },

  // Directly sets status to 'Pending Citizen Verification' (bypassing Admin)
  submitResolution: (id: string, photos: Partial<IssuePhotos>, notes?: string) => {
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status: 'Pending Citizen Verification',
              photos: {
                ...issue.photos,
                ...photos,
              },
              verificationMetrics: {
                locationMatch: true,
                timeMatch: true,
                geofenceVarianceMeters: 3.1,
                exifTimestamp: new Date().toISOString(),
                hardwareHash: 'SEC-CAM-LIVE-' + Math.floor(10000 + Math.random() * 90000),
              },
              notes: notes || issue.notes,
              updatedAt: new Date().toISOString(),
            }
          : issue
      ),
    }));
  },

  rejectWorkerProof: (id: string, reason?: string) => {
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status: 'In Progress',
              notes: reason
                ? `${issue.notes ? issue.notes + ' | ' : ''}Proof Rejected by Admin: ${reason}`
                : issue.notes,
              updatedAt: new Date().toISOString(),
            }
          : issue
      ),
    }));
  },

  forceResolve: (id: string, reason?: string) => {
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status: 'Resolved',
              notes: `${issue.notes ? issue.notes + ' | ' : ''}Force Resolved (Admin Override): ${reason || 'GPS/Hardware verification confirmed complete public repair.'}`,
              updatedAt: new Date().toISOString(),
            }
          : issue
      ),
    }));
  },
}));
