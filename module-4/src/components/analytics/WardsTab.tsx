import React, { useMemo } from 'react';
import { useCityIntelStore } from '../../state/useCityIntelStore';
import { WardData } from '../../types/intelTypes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WardsTab = () => {
  const setSelectedWard = useCityIntelStore(s => s.setSelectedWard);
  const selectedWard = useCityIntelStore(s => s.selectedWard);
  const wards = useCityIntelStore(s => s.wards);

  const chartData = wards.map(w => ({ name: w.name, issues: w.totalIssues }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Optimal': return '#10b981';
      case 'Stable': return '#38bdf8';
      case 'Attention Needed': return '#f59e0b';
      case 'Critical Blackspot': return '#ef4444';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <>
      <div className="panel-card">
        <div className="panel-card-title">Civic Health Leaderboard</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {wards.map((ward, idx) => (
            <div 
              key={ward.id}
              onClick={() => setSelectedWard(ward.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: selectedWard === ward.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedWard === ward.id ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>{idx + 1}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{ward.name}</div>
                  <div style={{ fontSize: '11px', color: getStatusColor(ward.status) }}>{ward.status}</div>
                </div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{ward.healthScore}<span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-title">Issues by Ward</div>
        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="issues" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-title">Predictive Risk Analytics</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
          
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>REPAIR DURABILITY</div>
            <div><span style={{ color: 'var(--accent-blue)' }}>Potholes:</span> 78 days avg durability before recurrence.</div>
          </div>
          
          <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: '4px' }}>
            <span style={{ fontWeight: 'bold', color: '#fca5a5' }}>⚠️ Predictive Risk:</span> High probability of road degradation in Ward B due to monsoon drainage backup.
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>IMPACT OF INACTION PROJECTION</div>
            <div>If Ward B water leak remains unaddressed for 7 days: <span style={{ color: '#ef4444', fontWeight: 600 }}>+1,240 citizens impacted</span>, estimated repair cost increases by 45%.</div>
          </div>

        </div>
      </div>
    </>
  );
};
