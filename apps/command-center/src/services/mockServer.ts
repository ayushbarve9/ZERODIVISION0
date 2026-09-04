import { v4 as uuidv4 } from 'uuid';
import { CivicIssue, CivicAlert, DepartmentPerformance, Worker } from '../types/intelTypes';

// Clean Zero-State Data
export const mockIssues: CivicIssue[] = [];
export const mockWorkers: Worker[] = [];
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
    // Zero-state: No auto-generated mock spam
    if (this.interval) return;
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
