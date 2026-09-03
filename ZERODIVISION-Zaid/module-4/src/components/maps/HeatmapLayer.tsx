import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { useCityIntelStore } from '../../state/useCityIntelStore';

export const HeatmapLayer = () => {
  const map = useMap();
  const issues = useCityIntelStore(s => s.issues);
  const selectedCategory = useCityIntelStore(s => s.selectedCategory);
  const playbackTime = useCityIntelStore(s => s.playbackTime);
  const simulatedTimestamp = useCityIntelStore(s => s.simulatedTimestamp);
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    let filteredIssues = selectedCategory 
      ? issues.filter(i => i.category === selectedCategory)
      : issues;

    if (playbackTime !== 'live' && simulatedTimestamp) {
      filteredIssues = filteredIssues.filter(i => new Date(i.createdAt).getTime() <= simulatedTimestamp);
    }

    const heatPoints = filteredIssues.map(i => [i.latitude, i.longitude, i.priorityScore / 100]);
    
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // @ts-ignore
    const heatLayer = L.heatLayer(heatPoints, { radius: 25, blur: 15, maxZoom: 17, gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' } });
    heatLayerRef.current = heatLayer;
    map.addLayer(heatLayer);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, issues, selectedCategory, playbackTime, simulatedTimestamp]);

  return null;
};
