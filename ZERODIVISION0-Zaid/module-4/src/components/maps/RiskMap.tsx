import React from 'react';
import { Polygon } from 'react-leaflet';

export const RiskMap = () => {
  // Mock high-risk polygon area
  const highRiskZone: [number, number][] = [
    [40.75, -74.05],
    [40.76, -74.02],
    [40.73, -73.98],
    [40.71, -74.03],
  ];

  return (
    <Polygon 
      positions={highRiskZone} 
      pathOptions={{ color: 'var(--accent-red)', fillColor: 'var(--accent-red)', fillOpacity: 0.3, dashArray: '10, 10' }} 
    />
  );
};
