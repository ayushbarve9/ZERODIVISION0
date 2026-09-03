import React from 'react';
import { useCityIntelStore } from '../../state/useCityIntelStore';

export const CivicHealth = () => {
  const issues = useCityIntelStore((state) => state.issues);
  
  const total = issues.length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="panel-card">
      <div className="panel-card-title">System Overview</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL ISSUES</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{total}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RESOLUTION RATE</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: resolutionRate > 50 ? '#10b981' : '#f59e0b' }}>
            {resolutionRate}%
          </div>
        </div>
      </div>
    </div>
  );
};
