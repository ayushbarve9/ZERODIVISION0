import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCityIntelStore } from '../../state/useCityIntelStore';
import { CivicAlert } from '../../types/intelTypes';

export const AlertFeed = () => {
  const alerts = useCityIntelStore((state) => state.alerts);
  const setFocusLocation = useCityIntelStore((state) => state.setFocusLocation);

  const getAlertStyle = (type: CivicAlert['type']) => {
    switch (type) {
      case 'CRITICAL':
      case 'EMERGENCY':
        return { borderColor: '#ef4444', icon: '🚨' };
      case 'SLA_BREACH':
      case 'RESOLUTION_REJECTED':
        return { borderColor: '#f97316', icon: '⚠️' };
      case 'SLA_WARNING':
        return { borderColor: '#eab308', icon: '⏳' };
      case 'BLACKSPOT':
        return { borderColor: '#d946ef', icon: '⚫' };
      case 'MASS_COMPLAINT':
        return { borderColor: '#ec4899', icon: '📈' };
      case 'RECURRING':
        return { borderColor: '#3b82f6', icon: '🔄' };
      case 'SUSPICIOUS_ACTIVITY':
        return { borderColor: '#06b6d4', icon: '🕵️' };
      case 'DUPLICATE':
      default:
        return { borderColor: '#64748b', icon: '📑' };
    }
  };

  const handleAlertClick = (alert: CivicAlert) => {
    if (alert.location) {
      setFocusLocation([alert.location.lat, alert.location.lng]);
    }
  };

  return (
    <>
      <div className="alerts-header">Live Alerts</div>
      <div className="alerts-feed-container">
        <AnimatePresence>
          {alerts.map(alert => {
            const style = getAlertStyle(alert.type);
            return (
              <motion.div 
                key={alert.id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="alert-card"
                style={{ borderLeftColor: style.borderColor, cursor: alert.location ? 'pointer' : 'default' }}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="alert-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{style.icon}</span> {alert.title}
                </div>
                <div className="alert-desc">{alert.message}</div>
                <div className="alert-timestamp">{new Date(alert.timestamp).toLocaleTimeString()}</div>
              </motion.div>
            );
          })}
          {alerts.length === 0 && (
             <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>No active alerts.</p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
