import React from 'react';
import { Flame } from 'lucide-react';

export const StreakCard = ({ streak = 0, longestStreak = 0 }) => {
  return (
    <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Healing Streak</span>
        <Flame size={16} color="#e17055" />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: streak >= 7 ? '#f39c12' : streak >= 3 ? '#e17055' : 'var(--text-main)' }}>
          {streak}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>days</span>
      </div>
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5, 6, 7].map(d => (
          <div key={d} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: d <= streak
              ? 'linear-gradient(90deg, #e17055, #f39c12)'
              : 'rgba(255,255,255,0.1)'
          }} />
        ))}
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
        Best: {longestStreak} days
      </div>
    </div>
  );
};

export default StreakCard;
