import React, { useEffect, useRef } from 'react';

export const LightbodyCanvas = ({ auraPurity = 85, activeColor = '#d4af37' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 40 + Math.sin(angle) * 4;

      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      gradient.addColorStop(0, activeColor);
      gradient.addColorStop(0.6, activeColor + '66');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      angle += 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [auraPurity, activeColor]);

  return (
    <div style={{
      width: '120px',
      height: '120px',
      borderRadius: '100%',
      margin: '0 auto 1.5rem',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(5,5,12,0.6)',
      boxShadow: '0 0 25px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      border: '2px solid rgba(212, 175, 55, 0.2)'
    }}>
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        style={{ width: '120px', height: '120px', display: 'block' }}
      />
    </div>
  );
};

export default LightbodyCanvas;
