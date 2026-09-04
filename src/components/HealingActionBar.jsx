import React, { useState } from 'react';

const HealingActionBar = ({ onActivate, onJoinPortal }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="healing-action-bar-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        margin: '0 auto',
        width: '100%',
        maxWidth: '620px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem'
      }}
    >
      {/* Pulse Effect Aura */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isHovered ? '320px' : '280px',
        height: '50px',
        background: 'radial-gradient(circle, rgba(142, 68, 173, 0.3) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        filter: 'blur(10px)',
        zIndex: -1,
        animation: 'auraPulse 3s infinite ease-in-out'
      }}></div>

      {/* Main Glass Bar */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%'
      }}>
          <button
            onClick={onActivate}
            style={{
              flex: '1 1 180px',
              maxWidth: '280px',
              background: 'rgba(20, 20, 30, 0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50px',
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: isHovered 
                ? '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(142, 68, 173, 0.4)' 
                : '0 5px 15px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: '24px', height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8e44ad, #3498db)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <div style={{width: '60%', height: '60%', background: '#fff', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
              <span style={{fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase'}}>Consult Aura</span>
              <span style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)'}}>AI REIKI GUIDE</span>
            </div>
          </button>

          <button
            onClick={onJoinPortal}
            style={{
              flex: '1 1 180px',
              maxWidth: '280px',
              background: 'rgba(212, 175, 55, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '50px',
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--accent-gold)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{fontSize: '1.2rem', flexShrink: 0}}>🔑</div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
              <span style={{fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase'}}>Enter Portal</span>
              <span style={{fontSize: '0.6rem', color: 'rgba(212, 175, 55, 0.8)'}}>SESSION CODE</span>
            </div>
          </button>
      </div>

      {/* Floating tooltip only on hover */}
      <div style={{
        opacity: isHovered ? 1 : 0,
        transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.3s ease',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.8)',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        pointerEvents: 'none'
      }}>
        "I sense your energy. How can I assist?"
      </div>

      <style>{`
        @keyframes auraPulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HealingActionBar;
