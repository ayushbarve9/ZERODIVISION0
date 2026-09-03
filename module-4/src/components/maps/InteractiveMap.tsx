import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap, Polygon, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useCityIntelStore } from '../../state/useCityIntelStore';
import { ClusterLayer } from './ClusterLayer';
import { HeatmapLayer } from './HeatmapLayer';
import { WorkerMap } from './WorkerMap';
import { RiskMap } from './RiskMap';
import { WardBoundariesLayer } from './WardBoundariesLayer';
import { WhyThisModal } from '../intelligence/WhyThisModal';
import { CivicIssue } from '../../types/intelTypes';

const MapBoundsUpdater = () => {
  const setMapBounds = useCityIntelStore(s => s.setMapBounds);
  const map = useMapEvents({
    moveend: () => setMapBounds(map.getBounds())
  });
  useEffect(() => { setMapBounds(map.getBounds()); }, [map, setMapBounds]);
  return null;
};

const MapWardFocuser = () => {
  const map = useMap();
  const selectedWard = useCityIntelStore(s => s.selectedWard);
  
  useEffect(() => {
    if (selectedWard) {
      // Hardcode ward bounds matching the WardsTab data
      const wardBounds: Record<string, [[number, number], [number, number]]> = {
        'W-C': [[40.72, -73.99], [40.74, -73.97]],
        'W-A': [[40.74, -74.01], [40.76, -73.99]],
        'W-D': [[40.70, -74.03], [40.72, -74.01]],
        'W-B': [[40.68, -73.99], [40.70, -73.97]]
      };
      
      const bounds = wardBounds[selectedWard];
      if (bounds) {
        map.flyToBounds(bounds, { duration: 1.5 });
      }
    } else {
      // Optional: return to default center
      // map.flyTo([40.7128, -74.0060], 13);
    }
  }, [selectedWard, map]);
  
  return null;
};

const MapFlyFocuser = () => {
  const map = useMap();
  const focusLocation = useCityIntelStore(s => s.focusLocation);

  useEffect(() => {
    if (focusLocation) {
      map.flyTo(focusLocation, 16, { duration: 1.5 });
    }
  }, [focusLocation, map]);

  return null;
};

const MapFix = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      map.setView([40.7128, -74.0060], 13);
    }, 250);
  }, [map]);
  return null;
};

export const InteractiveMap = () => {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showRisk, setShowRisk] = useState(false);
  const [showBlackspots, setShowBlackspots] = useState(false);
  
  const { incidentMode, toggleIncidentMode, issues, selectedIssueId, setSelectedIssueId } = useCityIntelStore();
  const selectedIssue = issues.find(i => i.issueId === selectedIssueId) || null;

  useEffect(() => {
    if (incidentMode) {
      document.body.classList.add('incident-mode');
    } else {
      document.body.classList.remove('incident-mode');
    }
  }, [incidentMode]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className="map-controls-overlay">
        <button onClick={() => setShowHeatmap(!showHeatmap)} className="map-control-btn">
          {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
        </button>
        <button onClick={() => setShowRisk(!showRisk)} className="map-control-btn">
          {showRisk ? 'Hide Risk Zones' : 'Show Risk Zones'}
        </button>
        <button onClick={() => setShowBlackspots(!showBlackspots)} className="map-control-btn" style={{ borderColor: showBlackspots ? '#ef4444' : '' }}>
          {showBlackspots ? 'Hide Blackspots' : 'Show Blackspots'}
        </button>
        <button onClick={toggleIncidentMode} className={`map-control-btn ${incidentMode ? 'incident-mode-btn' : ''}`}>
          {incidentMode ? 'EXIT INCIDENT MODE' : 'ENTER INCIDENT MODE'}
        </button>
      </div>

      {incidentMode && (
        <div className="incident-stats-overlay">
          <div className="incident-stat-pill">
            <span className="incident-stat-label">Affected Pop</span>
            <span className="incident-stat-value">14,200</span>
          </div>
          <div className="incident-stat-pill">
            <span className="incident-stat-label">Deployed</span>
            <span className="incident-stat-value">42 Active</span>
          </div>
          <div className="incident-stat-pill">
            <span className="incident-stat-label">Urgent</span>
            <span className="incident-stat-value">15 Critical</span>
          </div>
        </div>
      )}
      
      <MapContainer center={[40.7128, -74.0060]} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapBoundsUpdater />
        <MapFix />
        <MapWardFocuser />
        <MapFlyFocuser />
        
        <WardBoundariesLayer />

        {!showHeatmap && <ClusterLayer onIssueClick={(issue) => setSelectedIssueId(issue.issueId)} />}
        {showHeatmap && <HeatmapLayer />}
        <WorkerMap />
        {showRisk && <RiskMap />}
        
        {showBlackspots && (
          <Polygon 
            positions={[
              [40.69, -73.98], [40.68, -73.97], [40.695, -73.97], [40.698, -73.99]
            ]} 
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, weight: 2 }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter', fontWeight: 500, color: '#ef4444' }}>
                Civic Blackspot: 7 recurring failures in past 60 days. Chronic drainage failure detected.
              </div>
            </Popup>
          </Polygon>
        )}
      </MapContainer>

      {selectedIssue && (
        <WhyThisModal issue={selectedIssue} onClose={() => setSelectedIssueId(null)} />
      )}
    </div>
  );
};
