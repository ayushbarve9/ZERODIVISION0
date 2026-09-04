import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useCityIntelStore } from '../../state/useCityIntelStore';
import { CivicIssue } from '../../types/intelTypes';

export const IssueCharts = () => {
  const issues = useCityIntelStore(s => s.issues);
  const setSelectedCategory = useCityIntelStore(s => s.setSelectedCategory);

  const areaData = useMemo(() => {
    return Array.from({length: 10}).map((_, i) => ({
      name: `Day ${i+1}`,
      issues: Math.floor(Math.random() * 50) + 10
    }));
  }, []);

  const categoryData = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [issues]);

  return (
    <>
      <div className="panel-card">
        <div className="panel-card-title">Complaint Velocity</div>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }} />
              <Area type="monotone" dataKey="issues" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div className="panel-card-title">Issues by Category</div>
          <button style={{ background: 'transparent', color: 'var(--accent-blue)', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedCategory(null)}>Clear</button>
        </div>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <BarChart data={categoryData} onClick={(data) => {
                if(data && data.activeLabel) setSelectedCategory(data.activeLabel as string);
            }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};
