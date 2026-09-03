import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCityIntelStore } from '../../state/useCityIntelStore';
import { CivicIssue } from '../../types/intelTypes';
import { InfrastructureGraph } from './InfrastructureGraph';
import './intelligence.css';

interface Props {
  issue: CivicIssue;
  onClose: () => void;
}

export const WhyThisModal: React.FC<Props> = ({ issue, onClose }) => {
  const { updateIssue } = useCityIntelStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApprove = () => {
    updateIssue({ ...issue, status: 'In Progress' });
    setToastMessage('Recommended action approved. Work order dispatched.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-content glass-panel"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <h2>AI Diagnostic: {issue.category}</h2>
        <p style={{ marginTop: '-10px', marginBottom: '20px' }}>Issue ID: {issue.issueId.substring(0, 8)} | Address: {issue.address}</p>

        <div className="diagnostic-grid">
          <div className="diag-card">
            <h4>Priority Score</h4>
            <div className="score">{issue.priorityScore}<span style={{fontSize: '1rem', color: '#94a3b8'}}>/100</span></div>
          </div>
          <div className="diag-card">
            <h4>Duplicate Reports</h4>
            <div className="score">{issue.duplicateCount}</div>
          </div>
          <div className="diag-card">
            <h4>Community Impact</h4>
            <div className="score">{issue.communityImpact}<span style={{fontSize: '1rem', color: '#94a3b8'}}>/100</span></div>
          </div>
          <div className="diag-card">
            <h4>Risk Level</h4>
            <div className={`score risk-${issue.riskLevel.toLowerCase()}`}>{issue.riskLevel}</div>
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h3>Issue Lifecycle</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}><div style={{ width: '12px', height: '12px', background: '#38bdf8', borderRadius: '50%', margin: '0 auto 4px' }} />Reported</div>
            <div style={{ flex: 1, height: '2px', background: 'rgba(56, 189, 248, 0.3)', margin: '0 8px' }} />
            <div style={{ textAlign: 'center' }}><div style={{ width: '12px', height: '12px', background: '#38bdf8', borderRadius: '50%', margin: '0 auto 4px' }} />AI Analyzed</div>
            <div style={{ flex: 1, height: '2px', background: 'rgba(56, 189, 248, 0.3)', margin: '0 8px' }} />
            <div style={{ textAlign: 'center' }}><div style={{ width: '12px', height: '12px', background: '#38bdf8', borderRadius: '50%', margin: '0 auto 4px' }} />Clustered (x{issue.duplicateCount})</div>
            <div style={{ flex: 1, height: '2px', background: 'rgba(56, 189, 248, 0.3)', margin: '0 8px' }} />
            <div style={{ textAlign: 'center' }}><div style={{ width: '12px', height: '12px', background: issue.status !== 'Reported' ? '#38bdf8' : 'rgba(255,255,255,0.1)', borderRadius: '50%', margin: '0 auto 4px' }} />Dispatched</div>
            <div style={{ flex: 1, height: '2px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 8px' }} />
            <div style={{ textAlign: 'center' }}><div style={{ width: '12px', height: '12px', background: issue.status === 'Resolved' ? '#10b981' : 'rgba(255,255,255,0.1)', borderRadius: '50%', margin: '0 auto 4px' }} />Repaired</div>
            <div style={{ flex: 1, height: '2px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 8px' }} />
            <div style={{ textAlign: 'center' }}><div style={{ width: '12px', height: '12px', background: issue.status === 'Resolved' ? '#10b981' : 'rgba(255,255,255,0.1)', borderRadius: '50%', margin: '0 auto 4px' }} />Verified</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
            <h4 style={{ color: '#fca5a5', margin: '0 0 8px 0', fontSize: '12px' }}>Impact of Inaction Projection</h4>
            <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
              If unresolved for 7 days: <strong style={{ color: '#ef4444' }}>+{issue.communityImpact * 24} people affected</strong><br/>
              Est. Repair Cost: <strong style={{ color: '#ef4444' }}>+45%</strong>
            </div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px' }}>
            <h4 style={{ color: '#bae6fd', margin: '0 0 8px 0', fontSize: '12px' }}>Repair Durability & Verification</h4>
            <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
              Community Confirmations: <strong style={{ color: '#38bdf8' }}>14 citizens</strong> verified this issue.<br/>
              Historical Repair Durability: <strong style={{ color: '#38bdf8' }}>78 days</strong> before recurrence.
            </div>
          </div>
        </div>

        <div className="graph-container">
          <h3>Root Cause Analysis</h3>
          <p>The AI engine predicts the following dependencies based on historical failure rates.</p>
          <InfrastructureGraph />
        </div>

        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-panel)', border: '1px solid var(--accent-blue)', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🤖</span> AI Dispatch Recommendations & ROI Projection
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Option A (Quick Tactical Fix)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Surface Patching</div>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '12px', color: 'var(--text-main)' }}>
                <li>Est. Cost: <strong>$450</strong></li>
                <li>Resolution ETA: <strong>4 Hours</strong></li>
                <li>Recurrence Risk: <strong style={{ color: '#ef4444' }}>68% (High)</strong></li>
              </ul>
            </div>
            
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '6px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '10px', background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>RECOMMENDED</div>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: '#10b981' }}>Option B (Root-Cause Remediation)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Sub-surface Pipe Sealing + Road Relay</div>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '12px', color: 'var(--text-main)' }}>
                <li>Est. Cost: <strong>$2,800</strong></li>
                <li>Resolution ETA: <strong>36 Hours</strong></li>
                <li>Recurrence Risk: <strong style={{ color: '#10b981' }}>4% (Low)</strong></li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
            {toastMessage && <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 500 }}>{toastMessage}</div>}
            <button 
              onClick={handleApprove}
              disabled={issue.status !== 'Reported'}
              style={{
                background: issue.status === 'Reported' ? 'var(--accent-blue)' : 'var(--bg-panel)',
                color: '#fff',
                border: issue.status === 'Reported' ? 'none' : '1px solid var(--border-subtle)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: issue.status === 'Reported' ? 'pointer' : 'not-allowed',
                opacity: issue.status === 'Reported' ? 1 : 0.5
              }}
            >
              Approve Recommended Action
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
