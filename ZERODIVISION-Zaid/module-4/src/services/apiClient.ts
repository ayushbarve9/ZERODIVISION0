import { mockIssues, mockAlerts, mockWorkers } from './mockServer';
import { CivicIssue, CivicAlert, DepartmentPerformance, Worker } from '../types/intelTypes';

// Mock REST API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
  getIssues: async (): Promise<CivicIssue[]> => {
    await delay(300);
    return [...mockIssues];
  },
  getAlerts: async (): Promise<CivicAlert[]> => {
    await delay(200);
    return [...mockAlerts];
  },
  getWorkers: async (): Promise<Worker[]> => {
    await delay(250);
    return [...mockWorkers];
  },
  getDepartmentPerformance: async (): Promise<DepartmentPerformance[]> => {
    await delay(400);
    return [
      { department: 'Public Works', totalAssigned: 120, resolvedPercentage: 75, avgResolutionDays: 2.5, slaBreachRate: 10 },
      { department: 'Sanitation', totalAssigned: 300, resolvedPercentage: 92, avgResolutionDays: 1.2, slaBreachRate: 2 },
      { department: 'Water & Power', totalAssigned: 80, resolvedPercentage: 85, avgResolutionDays: 3.0, slaBreachRate: 5 }
    ];
  }
};
