import React, { useState, useEffect } from 'react';

export const StardustBackground = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        top: (Math.random() * 100) + '%',
        left: (Math.random() * 100) + '%',
        delay: (Math.random() * 5) + 's',
        opacity: Math.random() * 0.5 + 0.2
      }))
    );
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="stardust"
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
            opacity: star.opacity
          }}
        />
      ))}
    </div>
  );
};

export default StardustBackground;
