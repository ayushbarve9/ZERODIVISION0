import React, { useState, useEffect } from 'react';
import { useCityIntelStore } from '../../state/useCityIntelStore';

export const ExecutiveSummary = () => {
  const issues = useCityIntelStore(s => s.issues);
  const total = issues.length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const criticalOpen = issues.filter(i => i.riskLevel === 'Critical' && i.status !== 'Resolved').length;
  
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayAudio = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const text = `Executive Briefing. Today, we have received ${total} complaints. ${resolved} issues have been resolved, but ${criticalOpen} critical issues remain open. Ward B shows the highest complaint velocity, up 38 percent. There are 3 active SLA breaches requiring immediate escalation. A total of 18,420 citizens are currently impacted across the city.`;

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to get a decent English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="panel-card" style={{
      transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      boxShadow: isPlaying ? '0 0 15px rgba(56, 189, 248, 0.4)' : 'none',
      borderColor: isPlaying ? 'var(--accent-blue)' : 'var(--border-subtle)'
    }}>
      <div className="panel-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Executive Daily Civic Summary</span>
        <button 
          onClick={handlePlayAudio}
          style={{
            background: isPlaying ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isPlaying ? '#38bdf8' : 'var(--border-subtle)'}`,
            color: isPlaying ? '#38bdf8' : 'var(--text-muted)',
            padding: '4px 8px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isPlaying ? '🔊 PLAYING BRIEFING' : '🔊 LISTEN AI BRIEFING'}
        </button>
      </div>
      
      <ul style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        color: 'var(--text-muted)',
        fontSize: '12.5px'
      }}>
        <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-blue)' }}>•</span>
          {total} new complaints received today
        </li>
        <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-green, #10b981)' }}>•</span>
          {resolved} issues resolved | <span style={{ color: '#ef4444' }}>{criticalOpen} critical remain</span>
        </li>
        <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-blue)' }}>•</span>
          Ward B: Highest complaint velocity (+38%)
        </li>
        <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ef4444' }}>•</span>
          3 SLA breaches require immediate escalation
        </li>
      </ul>

      <div style={{
        marginTop: '10px',
        padding: '12px',
        background: 'rgba(56, 189, 248, 0.05)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '6px'
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL CITIZENS IMPACTED</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}>
          18,420
        </div>
        <div style={{ display: 'inline-block', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
          Highest Impact: Ward B (4,821 people)
        </div>
      </div>
    </div>
  );
};
