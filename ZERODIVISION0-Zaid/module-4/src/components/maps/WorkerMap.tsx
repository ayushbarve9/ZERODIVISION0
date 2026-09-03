import React from 'react';
import { Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useCityIntelStore } from '../../state/useCityIntelStore';

export const WorkerMap = () => {
  const workers = useCityIntelStore(s => s.workers);

  const getWorkerIcon = (heading: number) => {
    return L.divIcon({
      className: 'worker-marker',
      html: `
        <div style="transform: rotate(${heading}deg); background: var(--accent-neon, #38bdf8); width: 16px; height: 16px; border-radius: 50% 50% 0 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(56, 189, 248, 0.8);"></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  return (
    <>
      {workers.map(w => {
        // Generate mock route stops for active workers
        const isActive = w.status === 'Active';
        const routeStops: [number, number][] = isActive ? [
          [w.latitude, w.longitude],
          [w.latitude + 0.002, w.longitude + 0.003],
          [w.latitude + 0.005, w.longitude - 0.001],
          [w.latitude + 0.001, w.longitude - 0.004]
        ] : [];

        return (
          <React.Fragment key={w.workerId}>
            <Marker position={[w.latitude, w.longitude]} icon={getWorkerIcon(w.heading)}>
              <Popup>
                <div style={{ fontFamily: 'Inter' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{w.name}</h4>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem' }}>Dept: {w.department}</p>
                  <p style={{ margin: '0', fontSize: '0.8rem', color: isActive ? '#10b981' : '#f59e0b' }}>
                    Status: {w.status}
                  </p>
                </div>
              </Popup>
            </Marker>
            
            {isActive && (
              <Polyline 
                positions={routeStops} 
                pathOptions={{ color: '#38bdf8', weight: 2, dashArray: '5, 10', className: 'animated-route' }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent={false}>
                  <div style={{ fontWeight: 600, color: '#0369a1' }}>Optimized Route: Saves 2.4 km (18 mins)</div>
                </Tooltip>
              </Polyline>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
