import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCityIntelStore } from '../../state/useCityIntelStore';
import './intelligence.css';

interface Props {
  onClose: () => void;
}

export const TransparencyModal: React.FC<Props> = ({ onClose }) => {
  const issues = useCityIntelStore(s => s.issues);
  const total = issues.length || 1;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const resolutionRate = Math.round((resolved / total) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-content glass-panel"
        style={{ width: '600px', maxWidth: '90vw' }}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <h2>Public Transparency Portal</h2>
        <p style={{ marginTop: '-10px', marginBottom: '20px', color: 'var(--text-muted)' }}>Aggregate Civic Performance Data (Last 30 Days)</p>

        <div className="diagnostic-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="diag-card">
            <h4>Total Complaints</h4>
            <div className="score">{total}</div>
          </div>
          <div className="diag-card">
            <h4>Resolved</h4>
            <div className="score" style={{ color: '#10b981' }}>{resolutionRate}%</div>
          </div>
          <div className="diag-card">
            <h4>Avg Resolution</h4>
            <div className="score" style={{ color: '#38bdf8' }}>2.4<span style={{fontSize: '1rem', color: '#94a3b8'}}> days</span></div>
          </div>
          <div className="diag-card">
            <h4>Citizen Trust</h4>
            <div className="score" style={{ color: '#10b981' }}>88<span style={{fontSize: '1rem', color: '#94a3b8'}}>/100</span></div>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Top Performing Wards</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600 }}>1. Ward C</span>
              <span style={{ color: '#10b981' }}>98% Resolved (Avg 1.2 days)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600 }}>2. Ward A</span>
              <span style={{ color: '#10b981' }}>91% Resolved (Avg 1.8 days)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600 }}>3. Ward D</span>
              <span style={{ color: '#f59e0b' }}>76% Resolved (Avg 3.1 days)</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
