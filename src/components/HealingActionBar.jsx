import React, { useState } from 'react';

const HealingActionBar = ({ onActivate }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="healing-action-bar-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      {/* Pulse Effect Aura */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isHovered ? '320px' : '280px',
        height: '60px',
        background: 'radial-gradient(circle, rgba(142, 68, 173, 0.4) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        filter: 'blur(10px)',
        zIndex: -1,
        animation: 'auraPulse 3s infinite ease-in-out'
      }}></div>

      {/* Main Glass Bar */}
      <button
        onClick={onActivate}
        style={{
          background: 'rgba(20, 20, 30, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '50px',
          padding: '0.8rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: isHovered 
            ? '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(142, 68, 173, 0.4)' 
            : '0 5px 15px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
          minWidth: '250px'
        }}
      >
        {/* Holographic Icon */}
        <div style={{
          width: '30px', height: '30px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8e44ad, #3498db)',
          boxShadow: '0 0 10px #8e44ad',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'spinSlow 10s linear infinite'
        }}>
          <div style={{width: '60%', height: '60%', background: '#fff', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <span style={{
            fontSize: '0.9rem', 
            fontWeight: '700', 
            letterSpacing: '1px',
            textTransform: 'uppercase',
            background: 'linear-gradient(90deg, #fff, #a0d8ef)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Consult Aura
          </span>
          <span style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)'}}>
            AI REIKI GUIDE • ONLINE
          </span>
        </div>

        {/* Status Indicator */}
        <div style={{
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: '#2ecc71',
          boxShadow: '0 0 5px #2ecc71',
          marginLeft: 'auto'
        }}></div>
      </button>

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
