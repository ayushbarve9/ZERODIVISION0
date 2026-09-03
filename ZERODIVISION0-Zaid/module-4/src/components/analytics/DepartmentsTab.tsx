import React from 'react';
import { useCityIntelStore } from '../../state/useCityIntelStore';
import { DepartmentPerformance, WorkerPerformance } from '../../types/intelTypes';

export const DepartmentsTab = () => {
  const issues = useCityIntelStore(s => s.issues);
  
  // Calculate dynamic SLA compliance
  const total = issues.length || 1;
  const breaches = issues.filter(i => new Date(i.slaDeadline) < new Date() && i.status !== 'Resolved').length;
  const complianceRate = Math.round(((total - breaches) / total) * 100);

  // Mock department matrix
  const departments: DepartmentPerformance[] = [
    { department: 'Roads & Bridges', totalAssigned: 142, resolvedPercentage: 78, avgResolutionDays: 3.2, slaBreachRate: 12 },
    { department: 'Water & Sanitation', totalAssigned: 89, resolvedPercentage: 91, avgResolutionDays: 1.4, slaBreachRate: 4 },
    { department: 'Electrical', totalAssigned: 64, resolvedPercentage: 85, avgResolutionDays: 2.1, slaBreachRate: 8 },
  ];

  // Mock worker performance
  const topWorkers: WorkerPerformance[] = [
    { workerId: 'w1', name: 'James T.', department: 'Roads', tasksAssigned: 42, tasksCompleted: 39, avgTurnaroundDays: 1.8 },
    { workerId: 'w2', name: 'Sarah M.', department: 'Water', tasksAssigned: 28, tasksCompleted: 28, avgTurnaroundDays: 1.1 },
    { workerId: 'w3', name: 'Marcus R.', department: 'Electrical', tasksAssigned: 35, tasksCompleted: 31, avgTurnaroundDays: 2.0 },
  ];

  return (
    <>
      <div className="panel-card">
        <div className="panel-card-title">Department Leaderboard</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {departments.map(dept => (
            <div key={dept.department} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>{dept.department}</span>
                <span style={{ color: 'var(--accent-blue)', fontSize: '12px' }}>{dept.avgResolutionDays} days avg</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>{dept.resolvedPercentage}% Resolved</span>
                <span>•</span>
                <span>{dept.totalAssigned} Active</span>
                <span>•</span>
                <span style={{ color: dept.slaBreachRate > 10 ? '#ef4444' : 'inherit' }}>{dept.slaBreachRate}% Breach Rate</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px' }}>
                <div style={{ width: `${dept.resolvedPercentage}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-title">SLA Compliance</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `4px solid ${complianceRate < 80 ? '#ef4444' : '#10b981'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
            {complianceRate}%
          </div>
          <div>
            <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{complianceRate}% Within SLA</div>
            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{100 - complianceRate}% Late / Breached</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
              {breaches} imminent breaches (&lt;2 hours remaining)
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-title">Worker Performance</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {topWorkers.map(w => (
            <div key={w.workerId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>{w.name} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>- {w.department}</span></div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{w.tasksCompleted} / {w.tasksAssigned} Tasks</div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--accent-blue)' }}>{w.avgTurnaroundDays}d avg</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-title">Resolution Quality</div>
        <div style={{ display: 'flex', gap: '4px', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ flex: 72, background: '#10b981' }} title="Excellent (72%)" />
          <div style={{ flex: 18, background: '#f59e0b' }} title="Good (18%)" />
          <div style={{ flex: 10, background: '#ef4444' }} title="Needs Review (10%)" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span><span style={{ color: '#10b981' }}>●</span> Excellent (72%)</span>
          <span><span style={{ color: '#f59e0b' }}>●</span> Good (18%)</span>
          <span><span style={{ color: '#ef4444' }}>●</span> Review (10%)</span>
        </div>
      </div>
    </>
  );
};
