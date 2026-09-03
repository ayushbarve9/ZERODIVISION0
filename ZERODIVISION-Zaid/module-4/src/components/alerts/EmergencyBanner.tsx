import React from 'react';
import { useCityIntelStore } from '../../state/useCityIntelStore';
import { AlertTriangle } from 'lucide-react';
import './alerts.css';

export const EmergencyBanner = () => {
  const { incidentMode, toggleIncidentMode } = useCityIntelStore();

  return (
    <div className={`emergency-banner ${incidentMode ? 'active' : ''}`}>
      <button className="incident-toggle-btn" onClick={toggleIncidentMode}>
        <AlertTriangle size={24} />
        {incidentMode ? 'EXIT CIVIC INCIDENT MODE' : 'ENTER CIVIC INCIDENT MODE'}
      </button>
      {incidentMode && (
        <div className="incident-stats">
          <span>Affected Population: <strong>14,200</strong></span>
          <span>Workers Deployed: <strong>42</strong></span>
          <span>Urgent Reports: <strong>15</strong></span>
        </div>
      )}
    </div>
  );
};
