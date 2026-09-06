import React, { useState } from 'react';

export const AuraClouds = () => {
  const [clouds, setClouds] = useState([
    { id: 1, top: '15%', left: '10%', size: 100, color: 'rgba(160, 210, 235, 0.4)', poof: false },
    { id: 2, top: '45%', left: '85%', size: 150, color: 'rgba(229, 179, 187, 0.4)', poof: false },
    { id: 3, top: '75%', left: '15%', size: 120, color: 'rgba(212, 175, 55, 0.3)', poof: false },
    { id: 4, top: '25%', left: '70%', size: 80, color: 'rgba(142, 68, 173, 0.4)', poof: false },
    { id: 5, top: '65%', left: '60%', size: 140, color: 'rgba(160, 210, 235, 0.3)', poof: false },
  ]);

  const handlePoof = (id) => {
    setClouds(prev => prev.map(c => c.id === id ? { ...c, poof: true } : c));
    setTimeout(() => {
      setClouds(prev => prev.filter(c => c.id !== id));
      setTimeout(() => {
        const newCloud = {
          id: Date.now(),
          top: `${Math.random() * 80 + 10}%`,
          left: `${Math.random() * 80 + 10}%`,
          size: Math.random() * 70 + 80,
          color: ['rgba(160, 210, 235, 0.4)', 'rgba(229, 179, 187, 0.4)', 'rgba(212, 175, 55, 0.3)', 'rgba(142, 68, 173, 0.4)'][Math.floor(Math.random() * 4)],
          poof: false
        };
        setClouds(curr => [...curr, newCloud]);
      }, 3000);
    }, 6000);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {clouds.map(cloud => (
        <div
          key={cloud.id}
          className={`aura-cloud gentle-drift ${cloud.poof ? 'cloud-poof' : ''}`}
          onClick={() => handlePoof(cloud.id)}
          style={{
            top: cloud.top,
            left: cloud.left,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
            background: cloud.color,
            borderRadius: '50%',
            boxShadow: `0 0 40px ${cloud.color}`,
          }}
        />
      ))}
    </div>
  );
};

export default AuraClouds;
