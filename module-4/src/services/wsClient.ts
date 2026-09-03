import { server, mockIssues, mockAlerts, mockWorkers } from './mockServer';
import { CivicIssue, CivicAlert, DepartmentPerformance, Worker } from '../types/intelTypes';

export const wsClient = {
  connect: () => {
    console.log('WS Client connecting...');
    server.start();
  },
  disconnect: () => {
    console.log('WS Client disconnecting...');
    server.stop();
  },
  subscribe: (channel: string, callback: (data: any) => void) => {
    server.on(channel, callback);
    return () => server.off(channel, callback);
  }
};
