import React, { useState } from 'react';
import { ExecutiveSummary } from './ExecutiveSummary';
import { CivicHealth } from './CivicHealth';
import { IssueCharts } from './IssueCharts';
import { DepartmentsTab } from './DepartmentsTab';
import { WardsTab } from './WardsTab';

type TabView = 'Overview' | 'Departments & SLAs' | 'Wards & Health';

export const AnalyticsPane = () => {
  const [activeTab, setActiveTab] = useState<TabView>('Overview');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Sticky Tab Header */}
      <div style={{ 
        position: 'sticky', 
        top: '-1.25rem', 
        background: 'var(--bg-panel)', 
        zIndex: 10,
        padding: '1.25rem 0',
        marginBottom: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '10px'
      }}>
        {['Overview', 'Departments & SLAs', 'Wards & Health'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabView)}
            style={{
              background: activeTab === tab ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === tab ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: `1px solid ${activeTab === tab ? 'var(--accent-blue)' : 'transparent'}`,
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
        {activeTab === 'Overview' && (
          <>
            <ExecutiveSummary />
            <CivicHealth />
            <IssueCharts />
          </>
        )}
        
        {activeTab === 'Departments & SLAs' && <DepartmentsTab />}
        
        {activeTab === 'Wards & Health' && <WardsTab />}
      </div>
    </div>
  );
};
