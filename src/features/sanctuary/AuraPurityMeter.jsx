import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';

export const AuraPurityMeter = ({ purity = 92.4, color = '#6c5ce7' }) => {
  return (
    <>
      <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Total Alignment</span>
          <TrendingUp size={16} color="var(--accent-gold)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{Number(purity).toFixed(1)}%</div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '0.75rem', color: '#00b894' }}>+2.4%</span>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>from last cycle</span>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Aura Strength</span>
          <Activity size={16} color="#e17055" />
        </div>
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '0.75rem 0' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${purity}%` }}
            style={{ height: '100%', background: `linear-gradient(90deg, #e17055, ${color})`, borderRadius: '2px' }}
          />
        </div>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{Number(purity).toFixed(0)}% Purity</span>
      </div>
    </>
  );
};

export default AuraPurityMeter;
