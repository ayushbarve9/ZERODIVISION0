import React, { useState } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { useCityIntelStore } from '../../state/useCityIntelStore';
import { WardData } from '../../types/intelTypes';

export const WardBoundariesLayer = () => {
  const wards = useCityIntelStore(s => s.wards);
  const setSelectedWard = useCityIntelStore(s => s.setSelectedWard);
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);

  const getStyle = (ward: WardData, isHovered: boolean, anyHovered: boolean) => {
    let color = '#10b981';
    let fillOpacity = 0.08;
    
    if (ward.healthScore < 60) {
      color = '#ef4444';
      fillOpacity = 0.2;
    } else if (ward.healthScore <= 80) {
      color = '#f59e0b';
      fillOpacity = 0.12;
    }

    if (anyHovered && !isHovered) {
      fillOpacity = 0.02;
      color = 'rgba(255,255,255,0.2)';
    }

    return {
      color,
      fillColor: color,
      fillOpacity: isHovered ? fillOpacity * 1.5 : fillOpacity,
      weight: isHovered ? 3 : 2,
      dashArray: ward.healthScore < 60 && !isHovered ? '10, 10' : undefined // "pulsing" effect representation
    };
  };

  const getPolygonPositions = (bounds: [[number, number], [number, number]]) => {
    const [[swLat, swLng], [neLat, neLng]] = bounds;
    return [
      [swLat, swLng],
      [neLat, swLng],
      [neLat, neLng],
      [swLat, neLng]
    ] as [number, number][];
  };

  return (
    <>
      {wards.map(ward => {
        const isHovered = hoveredWard === ward.id;
        const anyHovered = hoveredWard !== null;
        
        return (
          <Polygon
            key={ward.id}
            positions={getPolygonPositions(ward.bounds)}
            pathOptions={getStyle(ward, isHovered, anyHovered)}
            eventHandlers={{
              mouseover: () => setHoveredWard(ward.id),
              mouseout: () => setHoveredWard(null),
              click: () => setSelectedWard(ward.id)
            }}
          >
            <Tooltip direction="top" opacity={1} className="ward-tooltip" sticky>
              <div style={{ background: 'var(--bg-panel)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '8px', minWidth: '200px', fontFamily: 'Inter' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--accent-blue)' }}>[{ward.name.toUpperCase()}]</strong>
                  <span style={{ fontWeight: 'bold' }}>Health: <span style={{ color: ward.healthScore > 80 ? '#10b981' : ward.healthScore > 60 ? '#f59e0b' : '#ef4444' }}>{ward.healthScore}/100</span></span>
                </div>
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Open Issues: <strong>{ward.totalIssues}</strong></div>
                  <div>Population: <strong>240k</strong></div>
                  <div>Top Complaint: <strong>Potholes</strong></div>
                </div>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
};
