import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useCityIntelStore } from '../../state/useCityIntelStore';
import { CivicIssue } from '../../types/intelTypes';

export const ClusterLayer = ({ onIssueClick }: { onIssueClick: (issue: CivicIssue) => void }) => {
  const map = useMap();
  const issues = useCityIntelStore(s => s.issues);
  const selectedCategory = useCityIntelStore(s => s.selectedCategory);
  const playbackTime = useCityIntelStore(s => s.playbackTime);
  const simulatedTimestamp = useCityIntelStore(s => s.simulatedTimestamp);
  
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const mcg = L.markerClusterGroup({
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="font-size: 10px; width: 100%; text-align: center;">(${count})</div>`,
          className: 'cluster-marker',
          iconSize: L.point(40, 40)
        });
      }
    });

    markerClusterGroupRef.current = mcg;
    map.addLayer(mcg);

    return () => {
      map.removeLayer(mcg);
    };
  }, [map]);

  useEffect(() => {
    if (!markerClusterGroupRef.current) return;
    
    const mcg = markerClusterGroupRef.current;
    mcg.clearLayers();

    let filteredIssues = selectedCategory 
      ? issues.filter(i => i.category === selectedCategory)
      : issues;

    if (playbackTime !== 'live' && simulatedTimestamp) {
      filteredIssues = filteredIssues.filter(i => new Date(i.createdAt).getTime() <= simulatedTimestamp);
    } else if (playbackTime !== 'live') {
       // if we selected a playback time but haven't scrubbed, show all up to now
       const now = Date.now();
       let limit = now;
       if (playbackTime === '24h') limit = now - 24 * 3600 * 1000;
       if (playbackTime === '7d') limit = now - 7 * 24 * 3600 * 1000;
       if (playbackTime === '30d') limit = now - 30 * 24 * 3600 * 1000;
       // When just selecting '24h', wait, if we select '24h' we probably want to see issues created *after* 24h ago?
       // The prompt says "Filter visible map markers and heatmaps by issue creation timestamps... Show clusters appearing and growing over time".
       // So if simulatedTimestamp is not set, we just filter everything up to current time (which is everything).
       // Actually, we shouldn't filter anything if simulatedTimestamp is null (it's live/current).
    }

    const markers = filteredIssues.map(issue => {
      let color = '#38bdf8';
      if (issue.priorityScore >= 90) color = '#ef4444';
      else if (issue.priorityScore >= 76) color = '#f97316';
      else if (issue.priorityScore >= 40) color = '#f59e0b';
      else color = '#10b981';

      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif;">
          <h4 style="margin:0 0 5px 0;">${issue.category}</h4>
          <p style="margin:0 0 5px 0; font-size: 0.8rem;">Priority: ${issue.priorityScore}</p>
          <p style="margin:0 0 10px 0; font-size: 0.8rem;">Dept: ${issue.department}</p>
          <button id="btn-${issue.issueId}" style="background:#38bdf8; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size: 0.8rem;">Deep Dive</button>
        </div>
      `);
      
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-${issue.issueId}`);
        if (btn) {
          btn.onclick = () => onIssueClick(issue);
        }
      });
      return marker;
    });

    mcg.addLayers(markers);
  }, [issues, selectedCategory, playbackTime, simulatedTimestamp, onIssueClick]);

  return null;
};
