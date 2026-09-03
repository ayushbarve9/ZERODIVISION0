import { v4 as uuidv4 } from 'uuid';
import { CivicIssue, CivicAlert, DepartmentPerformance, Worker } from '../types/intelTypes';

// Initial Mock Data
export const mockIssues: CivicIssue[] = Array.from({ length: 200 }).map(() => ({
  issueId: uuidv4(),
  category: ['Pothole', 'Garbage', 'Streetlight', 'Water Leakage', 'Road Damage'][Math.floor(Math.random() * 5)] as any,
  latitude: 40.7128 + (Math.random() - 0.5) * 0.1, // Near NY
  longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
  priorityScore: Math.floor(Math.random() * 100),
  duplicateCount: Math.floor(Math.random() * 10),
  status: ['Reported', 'In Progress', 'Resolved'][Math.floor(Math.random() * 3)] as any,
  department: ['Public Works', 'Sanitation', 'Water & Power'][Math.floor(Math.random() * 3)],
  communityImpact: Math.floor(Math.random() * 100),
  riskLevel: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)] as any,
  slaDeadline: new Date(Date.now() + (Math.random() * 10 - 5) * 86400000).toISOString(),
  isRecurring: Math.random() > 0.8,
  address: `${Math.floor(Math.random() * 9999)} Mock St, City`,
  createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString()
}));

export const mockWorkers: Worker[] = Array.from({ length: 20 }).map(() => ({
  workerId: uuidv4(),
  name: `Worker ${Math.floor(Math.random() * 100)}`,
  department: ['Public Works', 'Sanitation', 'Water & Power'][Math.floor(Math.random() * 3)],
  latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
  longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
  status: ['Active', 'OnBreak', 'Inactive'][Math.floor(Math.random() * 3)] as any,
  assignedTasks: [],
  heading: Math.floor(Math.random() * 360)
}));

export const mockAlerts: CivicAlert[] = [];

type EventHandler = (data: any) => void;

class MockServer {
  private listeners: Record<string, EventHandler[]> = {};
  private interval: any = null;

  on(event: string, handler: EventHandler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  off(event: string, handler: EventHandler) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(h => h !== handler);
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(h => h(data));
    }
  }

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.simulateEvent();
    }, 3000); // Emit event every 3 seconds
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  private simulateEvent() {
    const r = Math.random();
    if (r < 0.3) {
      // New Issue
      const newIssue: CivicIssue = {
        issueId: uuidv4(),
        category: 'Pothole',
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
        priorityScore: Math.floor(Math.random() * 100),
        duplicateCount: 1,
        status: 'Reported',
        department: 'Public Works',
        communityImpact: 50,
        riskLevel: 'Medium',
        slaDeadline: new Date(Date.now() + 86400000).toISOString(),
        isRecurring: false,
        address: 'New Location',
        createdAt: new Date().toISOString()
      };
      mockIssues.push(newIssue);
      this.emit('issue:created', newIssue);
    } else if (r < 0.5) {
      // Worker moving
      if (mockWorkers.length > 0) {
        const worker = mockWorkers[Math.floor(Math.random() * mockWorkers.length)];
        if (worker.status === 'Active') {
            worker.latitude += (Math.random() - 0.5) * 0.005;
            worker.longitude += (Math.random() - 0.5) * 0.005;
            worker.heading = (worker.heading + (Math.random() * 40 - 20)) % 360;
            this.emit('worker:location', worker);
        }
      }
    } else {
      // Generate one of 10 alerts
      const alertTypes: CivicAlert['type'][] = [
        'CRITICAL', 'DUPLICATE', 'MASS_COMPLAINT', 'SLA_WARNING', 
        'SLA_BREACH', 'RECURRING', 'BLACKSPOT', 'SUSPICIOUS_ACTIVITY', 
        'RESOLUTION_REJECTED', 'EMERGENCY'
      ];
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      let title = '';
      let message = '';
      
      switch (type) {
        case 'CRITICAL':
          title = 'Critical Safety Hazard';
          message = 'Collapsed manhole reported. Immediate dispatch required.';
          break;
        case 'DUPLICATE':
          title = 'Reports Clustered';
          message = '7 citizen reports merged for Pothole #ISS-842.';
          break;
        case 'MASS_COMPLAINT':
          title = 'Complaint Spike Detected';
          message = '42 complaints received from Ward C within 30 minutes. Possible water main failure.';
          break;
        case 'SLA_WARNING':
          title = 'SLA Warning';
          message = 'Issue #ISS-1024 has 1.5 hours remaining before SLA breach.';
          break;
        case 'SLA_BREACH':
          title = 'SLA Breach';
          message = 'Issue #ISS-991 has exceeded maximum SLA resolution deadline.';
          break;
        case 'RECURRING':
          title = 'Recurring Issue Detected';
          message = 'Pothole at Location X reported 4 times post-repair.';
          break;
        case 'BLACKSPOT':
          title = 'New Civic Blackspot';
          message = 'Ward B flagged as active civic blackspot. Chronic drainage failure.';
          break;
        case 'SUSPICIOUS_ACTIVITY':
          title = 'Suspicious Reporting Burst';
          message = 'Anomalous reporting burst detected from single IP/device cluster.';
          break;
        case 'RESOLUTION_REJECTED':
          title = 'Resolution Rejected';
          message = 'Citizen rejected repair verification for Issue #ISS-412.';
          break;
        case 'EMERGENCY':
          title = 'City Emergency Declared';
          message = 'Incident mode triggered by command staff. All non-essential tasks paused.';
          break;
      }
      
      const newAlert: CivicAlert = {
        id: uuidv4(),
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        location: { lat: 40.7128 + (Math.random() - 0.5) * 0.1, lng: -74.0060 + (Math.random() - 0.5) * 0.1 }
      };
      
      mockAlerts.push(newAlert);
      if (type === 'CRITICAL' || type === 'EMERGENCY') {
          this.emit('alert:critical', newAlert);
      } else if (type === 'SLA_BREACH' || type === 'SLA_WARNING') {
          this.emit('sla:breach', newAlert);
      } else {
          // Just piggyback on alert:critical for the mock to reach the store
          this.emit('alert:critical', newAlert);
      }
    }
  }
}

export const server = new MockServer();
