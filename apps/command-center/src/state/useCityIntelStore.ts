import { create } from 'zustand';
import { CivicIssue, CivicAlert, Worker, WardData } from '../types/intelTypes';
import { apiClient } from '../services/apiClient';

interface CityIntelState {
  issues: CivicIssue[];
  workers: Worker[];
  alerts: CivicAlert[];
  wards: WardData[];
  incidentMode: boolean;
  selectedCategory: string | null;
  selectedWard: string | null;
  selectedIssueId: string | null;
  playbackTime: '24h' | '7d' | '30d' | 'live';
  simulatedTimestamp: number | null;
  isScrubbing: boolean;
  focusLocation: [number, number] | null;
  mapBounds: any | null; // Leaflet bounds object
  
  // Actions
  fetchInitialData: () => Promise<void>;
  addIssue: (issue: CivicIssue) => void;
  updateIssue: (issue: CivicIssue) => void;
  addAlert: (alert: CivicAlert) => void;
  updateWorkerLocation: (worker: Worker) => void;
  updateWard: (wardId: string, updates: Partial<WardData>) => void;
  toggleIncidentMode: () => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedWard: (wardId: string | null) => void;
  setSelectedIssueId: (issueId: string | null) => void;
  setPlaybackTime: (time: '24h' | '7d' | '30d' | 'live') => void;
  setSimulatedTimestamp: (timestamp: number | null) => void;
  setIsScrubbing: (isScrubbing: boolean) => void;
  setFocusLocation: (loc: [number, number] | null) => void;
  setMapBounds: (bounds: any) => void;
  resetStore: () => void;
}

export const useCityIntelStore = create<CityIntelState>((set, get) => ({
  issues: [],
  workers: [],
  alerts: [],
  wards: [
    { id: 'W-C', name: 'Ward C', healthScore: 91, status: 'Optimal', totalIssues: 12, center: [40.73, -73.98], bounds: [[40.72, -73.99], [40.74, -73.97]] },
    { id: 'W-A', name: 'Ward A', healthScore: 84, status: 'Stable', totalIssues: 45, center: [40.75, -74.00], bounds: [[40.74, -74.01], [40.76, -73.99]] },
    { id: 'W-D', name: 'Ward D', healthScore: 76, status: 'Attention Needed', totalIssues: 67, center: [40.71, -74.02], bounds: [[40.70, -74.03], [40.72, -74.01]] },
    { id: 'W-B', name: 'Ward B', healthScore: 62, status: 'Critical Blackspot', totalIssues: 124, center: [40.69, -73.98], bounds: [[40.68, -73.99], [40.70, -73.97]] },
  ],
  incidentMode: false,
  selectedCategory: null,
  selectedWard: null,
  selectedIssueId: null,
  playbackTime: 'live',
  simulatedTimestamp: null,
  isScrubbing: false,
  focusLocation: null,
  mapBounds: null,

  fetchInitialData: async () => {
    try {
      const [issues, workers, alerts] = await Promise.all([
        apiClient.getIssues(),
        apiClient.getWorkers(),
        apiClient.getAlerts()
      ]);
      set({ issues, workers, alerts });
    } catch (error) {
      console.error('Error fetching initial data', error);
    }
  },

  addIssue: (issue) => set((state) => ({ issues: [...state.issues, issue] })),
  
  updateIssue: (updatedIssue) => set((state) => ({
    issues: state.issues.map(i => i.issueId === updatedIssue.issueId ? updatedIssue : i)
  })),

  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),

  updateWorkerLocation: (updatedWorker) => set((state) => ({
    workers: state.workers.map(w => w.workerId === updatedWorker.workerId ? updatedWorker : w)
  })),

  updateWard: (wardId, updates) => set((state) => ({
    wards: state.wards.map(w => w.id === wardId ? { ...w, ...updates } : w)
  })),

  toggleIncidentMode: () => set((state) => {
    const newMode = !state.incidentMode;
    if (newMode) {
      document.documentElement.classList.add('incident-mode');
    } else {
      document.documentElement.classList.remove('incident-mode');
    }
    return { incidentMode: newMode };
  }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  setSelectedWard: (wardId) => set({ selectedWard: wardId }),
  
  setSelectedIssueId: (issueId) => set({ selectedIssueId: issueId }),

  setPlaybackTime: (time) => set({ playbackTime: time }),

  setSimulatedTimestamp: (timestamp) => set({ simulatedTimestamp: timestamp }),

  setIsScrubbing: (isScrubbing) => set({ isScrubbing }),

  setFocusLocation: (loc) => set({ focusLocation: loc }),
  
  setMapBounds: (bounds) => set({ mapBounds: bounds }),

  resetStore: () => set({
    issues: [],
    alerts: [],
    incidentMode: false,
    selectedCategory: null,
    selectedWard: null,
    selectedIssueId: null,
    playbackTime: 'live',
    simulatedTimestamp: null,
    isScrubbing: false,
    focusLocation: null,
    wards: [
      { id: 'W-C', name: 'Ward C', healthScore: 91, status: 'Optimal', totalIssues: 12, center: [40.73, -73.98], bounds: [[40.72, -73.99], [40.74, -73.97]] },
      { id: 'W-A', name: 'Ward A', healthScore: 84, status: 'Stable', totalIssues: 45, center: [40.75, -74.00], bounds: [[40.74, -74.01], [40.76, -73.99]] },
      { id: 'W-D', name: 'Ward D', healthScore: 76, status: 'Attention Needed', totalIssues: 67, center: [40.71, -74.02], bounds: [[40.70, -74.03], [40.72, -74.01]] },
      { id: 'W-B', name: 'Ward B', healthScore: 62, status: 'Critical Blackspot', totalIssues: 124, center: [40.69, -73.98], bounds: [[40.68, -73.99], [40.70, -73.97]] },
    ]
  })
}));
