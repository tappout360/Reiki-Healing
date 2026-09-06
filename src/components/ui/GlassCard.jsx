import React from 'react';

export const GlassCard = ({ children, className = '', style = {}, onClick, ...props }) => {
  return (
    <div
      className={`glass ${className}`}
      onClick={onClick}
      style={{
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.03)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
