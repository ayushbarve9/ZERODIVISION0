import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { useCityIntelStore } from '../../state/useCityIntelStore';

export const MapScrubber = () => {
  const { 
    playbackTime, 
    setPlaybackTime, 
    simulatedTimestamp, 
    setSimulatedTimestamp, 
    isScrubbing, 
    setIsScrubbing 
  } = useCityIntelStore();
  
  const [speed, setSpeed] = useState<1 | 5>(1);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isScrubbing) {
      if (!simulatedTimestamp) {
        const now = Date.now();
        let start = now;
        if (playbackTime === '24h') start = now - 24 * 3600 * 1000;
        else if (playbackTime === '7d') start = now - 7 * 24 * 3600 * 1000;
        else if (playbackTime === '30d') start = now - 30 * 24 * 3600 * 1000;
        setSimulatedTimestamp(start);
      }
      
      intervalRef.current = window.setInterval(() => {
        const prev = useCityIntelStore.getState().simulatedTimestamp;
        if (!prev) {
          setSimulatedTimestamp(Date.now());
          return;
        }
        
        // increment by 1 hour (or 5 hours if speed 5x) per tick (tick = 50ms)
        const multiplier = playbackTime === '30d' ? 5 : 1;
        const inc = (3600 * 1000) * speed * multiplier;
        const next = prev + inc;
        
        if (next >= Date.now()) {
          setIsScrubbing(false);
          setSimulatedTimestamp(null); // back to live
        } else {
          setSimulatedTimestamp(next);
        }
      }, 50);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isScrubbing, speed, playbackTime, simulatedTimestamp, setSimulatedTimestamp, setIsScrubbing]);

  const handleTogglePlay = () => {
    if (playbackTime === 'live') return;
    setIsScrubbing(!isScrubbing);
  };

  const getFormatDate = (ts: number) => {
    return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const now = Date.now();
  const getStart = () => {
    if (playbackTime === '24h') return now - 24*3600*1000;
    if (playbackTime === '7d') return now - 7*24*3600*1000;
    if (playbackTime === '30d') return now - 30*24*3600*1000;
    return now;
  };
  const start = getStart();
  const range = now - start;
  const progress = simulatedTimestamp ? Math.min(100, Math.max(0, ((simulatedTimestamp - start) / range) * 100)) : 100;

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '65%',
      background: 'rgba(13, 21, 39, 0.85)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px',
      padding: '10px 20px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['24h', '7d', '30d', 'live'].map((t) => (
          <button 
            key={t}
            onClick={() => {
              setPlaybackTime(t as any);
              setIsScrubbing(false);
              setSimulatedTimestamp(null);
            }}
            style={{
              background: playbackTime === t ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', opacity: playbackTime === 'live' ? 0.3 : 1, pointerEvents: playbackTime === 'live' ? 'none' : 'auto' }}>
        <button onClick={handleTogglePlay} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {isScrubbing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        
        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative' }}>
          {simulatedTimestamp && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              background: 'var(--accent-blue)',
              width: `${progress}%`,
              transition: 'width 0.1s linear'
            }} />
          )}
        </div>

        <button onClick={() => setSpeed(speed === 1 ? 5 : 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
          {speed}x
        </button>
      </div>

      {simulatedTimestamp && (
        <div style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-blue)', color: '#070b14', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          Simulated Time: {getFormatDate(simulatedTimestamp)}
        </div>
      )}
    </div>
  );
};
