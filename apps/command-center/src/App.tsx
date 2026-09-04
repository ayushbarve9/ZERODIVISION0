import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCityIntelStore } from './state/useCityIntelStore';
import { wsClient } from './services/wsClient';
import { InteractiveMap } from './components/maps/InteractiveMap';
import { MapScrubber } from './components/maps/MapScrubber';
import { AlertFeed } from './components/alerts/AlertFeed';
import { AnalyticsPane } from './components/analytics/AnalyticsPane';
import { TransparencyModal } from './components/intelligence/TransparencyModal';
import './index.css';

function App() {
  const { fetchInitialData, addIssue, updateWorkerLocation, addAlert, resetStore, setFocusLocation, setSelectedIssueId, updateWard, toggleIncidentMode, workers } = useCityIntelStore();
  const [showTransparency, setShowTransparency] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(true);

  useEffect(() => {
    fetchInitialData();
    wsClient.connect();

    const unsubIssue = wsClient.subscribe('issue:created', addIssue);
    const unsubWorker = wsClient.subscribe('worker:location', updateWorkerLocation);
    const unsubCrit = wsClient.subscribe('alert:critical', addAlert);
    const unsubSla = wsClient.subscribe('sla:breach', addAlert);

    return () => {
      unsubIssue();
      unsubWorker();
      unsubCrit();
      unsubSla();
      wsClient.disconnect();
    };
  }, [fetchInitialData, addIssue, updateWorkerLocation, addAlert]);

  const handleExport = (type: 'csv' | 'json') => {
    const data = useCityIntelStore.getState().issues;
    let blob;
    if (type === 'json') {
      blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } else {
      const csv = 'IssueID,Category,Status\n' + data.map(i => `${i.issueId},${i.category},${i.status}`).join('\n');
      blob = new Blob([csv], { type: 'text/csv' });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civic-intelligence.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDemoScenario = (type: string) => {
    if (type === 'monsoon') {
      const center = [40.69, -73.98];
      for (let i = 0; i < 18; i++) {
        addIssue({
          issueId: uuidv4(),
          category: 'Water Leakage',
          latitude: center[0] + (Math.random() - 0.5) * 0.02,
          longitude: center[1] + (Math.random() - 0.5) * 0.02,
          priorityScore: 85,
          duplicateCount: 1,
          status: 'Reported',
          department: 'Water & Power',
          communityImpact: 90,
          riskLevel: 'High',
          slaDeadline: new Date(Date.now() + 4 * 3600000).toISOString(),
          isRecurring: false,
          address: 'Ward B Sector',
          createdAt: new Date().toISOString()
        });
      }
      addAlert({
        id: uuidv4(),
        type: 'MASS_COMPLAINT',
        title: 'Monsoon Water Main Burst',
        message: '18 complaints received from Ward B within 5 minutes. Major water main failure.',
        timestamp: new Date().toISOString(),
        location: { lat: center[0], lng: center[1] }
      });
      updateWard('W-B', { healthScore: 48, status: 'Critical Blackspot' });
      setFocusLocation([center[0], center[1]]);
    } else if (type === 'hazard') {
      const issueId = uuidv4();
      const lat = 40.75;
      const lng = -73.99;
      addIssue({
        issueId,
        category: 'Road Damage',
        latitude: lat,
        longitude: lng,
        priorityScore: 98,
        duplicateCount: 3,
        status: 'Reported',
        department: 'Public Works',
        communityImpact: 95,
        riskLevel: 'Critical',
        slaDeadline: new Date(Date.now() - 3600000).toISOString(),
        isRecurring: true,
        address: 'Transit Zone A',
        createdAt: new Date().toISOString()
      });
      addAlert({
        id: uuidv4(),
        type: 'SLA_BREACH',
        title: 'Critical Road Hazard & SLA Breach',
        message: 'Priority 98 road collapse near transit zone has breached SLA by 1 hour.',
        timestamp: new Date().toISOString(),
        location: { lat, lng }
      });
      setFocusLocation([lat, lng]);
      setTimeout(() => setSelectedIssueId(issueId), 1500); // Wait for flyTo
    } else if (type === 'drill') {
      toggleIncidentMode();
      addAlert({
        id: uuidv4(),
        type: 'EMERGENCY',
        title: 'City Incident Drill Activated',
        message: 'Emergency protocols engaged. All non-essential tasks paused.',
        timestamp: new Date().toISOString()
      });
      // Set all workers to active and move them
      workers.forEach(w => {
        updateWorkerLocation({
          ...w,
          status: 'Active',
          latitude: w.latitude + (Math.random() - 0.5) * 0.05,
          longitude: w.longitude + (Math.random() - 0.5) * 0.05
        });
      });
    } else if (type === 'reset') {
      resetStore();
      fetchInitialData();
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <div style={{
        height: '50px',
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 2000,
        position: 'relative'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', background: 'var(--accent-blue)', borderRadius: '50%' }}></div>
          City Intelligence & Command Center
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
            <button style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fcd34d', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
              ⚡ Demo Scenarios ▾
            </button>
            <div className="dropdown-content" style={{ display: 'none', position: 'absolute', right: 0, background: 'var(--bg-card)', minWidth: '220px', boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.5)', zIndex: 1, border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleDemoScenario('monsoon'); }} style={{ color: 'var(--text-main)', padding: '12px 16px', textDecoration: 'none', display: 'block', fontSize: '13px' }}>1. Monsoon Water Main Burst</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleDemoScenario('hazard'); }} style={{ color: 'var(--text-main)', padding: '12px 16px', textDecoration: 'none', display: 'block', fontSize: '13px' }}>2. Critical Road Hazard</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleDemoScenario('drill'); }} style={{ color: 'var(--text-main)', padding: '12px 16px', textDecoration: 'none', display: 'block', fontSize: '13px' }}>3. City Incident Drill</a>
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
              <a href="#" onClick={(e) => { e.preventDefault(); handleDemoScenario('reset'); }} style={{ color: '#ef4444', padding: '12px 16px', textDecoration: 'none', display: 'block', fontSize: '13px' }}>Reset Database</a>
            </div>
          </div>

          <button onClick={() => setShowTransparency(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
            Public Transparency
          </button>
          
          <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
            <button style={{ background: 'var(--accent-blue)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
              Export Data ▾
            </button>
            <div className="dropdown-content" style={{ display: 'none', position: 'absolute', right: 0, background: 'var(--bg-card)', minWidth: '160px', boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)', zIndex: 1, border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleExport('csv'); }} style={{ color: 'var(--text-main)', padding: '12px 16px', textDecoration: 'none', display: 'block' }}>Export CSV</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleExport('json'); }} style={{ color: 'var(--text-main)', padding: '12px 16px', textDecoration: 'none', display: 'block' }}>Export JSON</a>
              <a href="#" onClick={(e) => { e.preventDefault(); window.print(); }} style={{ color: 'var(--text-main)', padding: '12px 16px', textDecoration: 'none', display: 'block' }}>Print PDF Report</a>
            </div>
            {/* Simple CSS hack for dropdown via inline style hover wouldn't work easily without external CSS, so we'll just add a small style tag here */}
            <style>{`.dropdown:hover .dropdown-content { display: block !important; } .dropdown-content a:hover { background-color: rgba(255,255,255,0.1); }`}</style>
          </div>
        </div>
      </div>

      <div className="dashboard-main" style={{ height: 'calc(100vh - 50px)' }}>
        <div className="map-pane">
          {showBanner && (
            <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', padding: '8px 16px', borderRadius: '20px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px', backdropFilter: 'blur(4px)' }}>
              <span>🤖 AI Recommendation: Inspect Road Section B-14 (5 recurring potholes detected; high failure probability).</span>
              <button onClick={() => setShowBanner(false)} style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '16px' }}>×</button>
            </div>
          )}
          <InteractiveMap />
          <MapScrubber />
        </div>

      <div className="analytics-pane">
        <AnalyticsPane />
      </div>
      
      <div className="sidebar-pane">
        <AlertFeed />
      </div>
      </div>
      
      {showTransparency && <TransparencyModal onClose={() => setShowTransparency(false)} />}
    </>
  );
}

export default App;
