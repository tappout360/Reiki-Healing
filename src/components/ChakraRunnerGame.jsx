import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Play, RotateCcw, Zap, Shield, Star, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * ChakraRunnerGame — AAA Arcade Canvas Minigame for Reiki & Sage
 * Navigation: Drag touch or Left/Right Arrow Keys
 * Objective: Collect 528Hz Solfeggio Orbs & Crystals while dodging static barriers
 */
const ChakraRunnerGame = ({ onClose, onAddXp }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('START'); // 'START' | 'PLAYING' | 'GAMEOVER'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('chakra_runner_high_score') || '0'));
  const [health, setHealth] = useState(3);
  const [shieldActive, setShieldActive] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  // Game Engine State Refs
  const engineRef = useRef({
    playerX: 200,
    playerY: 450,
    playerRadius: 18,
    isDragging: false,
    orbs: [],
    obstacles: [],
    particles: [],
    score: 0,
    health: 3,
    shield: false,
    speed: 4,
    frameCount: 0
  });

  // Audio FX Synthesis using Web Audio API
  const playSound = (freq, type = 'sine', duration = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  const startGame = () => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 400;

    engineRef.current = {
      playerX: width / 2,
      playerY: 460,
      playerRadius: 18,
      isDragging: false,
      orbs: [],
      obstacles: [],
      particles: [],
      score: 0,
      health: 3,
      shield: false,
      speed: 4,
      frameCount: 0
    };

    setScore(0);
    setHealth(3);
    setShieldActive(false);
    setGameState('PLAYING');
    playSound(528, 'sine', 0.3); // 528Hz Solfeggio start chime
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Canvas Resize
    canvas.width = Math.min(window.innerWidth - 32, 450);
    canvas.height = 540;
    engineRef.current.playerX = canvas.width / 2;

    // Controls: Keydown & Mouse/Touch
    const handleKeyDown = (e) => {
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        engineRef.current.playerX = Math.max(25, engineRef.current.playerX - 28);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        engineRef.current.playerX = Math.min(canvas.width - 25, engineRef.current.playerX + 28);
      }
    };

    const handlePointerMove = (e) => {
      if (gameState !== 'PLAYING') return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      if (x > 15 && x < canvas.width - 15) {
        engineRef.current.playerX = x;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('touchmove', handlePointerMove);

    // 60FPS Game Loop
    const render = () => {
      if (gameState === 'PLAYING') {
        const eng = engineRef.current;
        eng.frameCount++;
        eng.speed = 4 + Math.floor(eng.score / 200) * 0.5;

        // Clear Canvas Background (Deep Cosmic Void)
        ctx.fillStyle = '#090a14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Cosmic Tunnel Grid Lines
        ctx.strokeStyle = 'rgba(123, 44, 191, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Spawn Solfeggio Orbs (Gold & Cyan)
        if (eng.frameCount % 25 === 0) {
          eng.orbs.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: -20,
            radius: 12,
            type: Math.random() > 0.85 ? 'SHIELD' : Math.random() > 0.6 ? 'GOLD' : 'SOLFEGGIO',
            color: Math.random() > 0.85 ? '#00F5D4' : Math.random() > 0.6 ? '#FFD700' : '#50e3c2'
          });
        }

        // Spawn Static Barriers
        if (eng.frameCount % 45 === 0) {
          eng.obstacles.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: -25,
            width: 45 + Math.random() * 30,
            height: 16
          });
        }

        // Update & Render Particles
        for (let i = eng.particles.length - 1; i >= 0; i--) {
          const p = eng.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.02;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
          if (p.alpha <= 0) eng.particles.splice(i, 1);
        }

        // Update & Render Orbs
        for (let i = eng.orbs.length - 1; i >= 0; i--) {
          const orb = eng.orbs[i];
          orb.y += eng.speed;

          // Render Orb Glow
          const grad = ctx.createRadialGradient(orb.x, orb.y, 2, orb.x, orb.y, orb.radius * 1.8);
          grad.addColorStop(0, orb.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius * 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = orb.color;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();

          // Collision Detection with Player
          const dist = Math.hypot(orb.x - eng.playerX, orb.y - eng.playerY);
          if (dist < orb.radius + eng.playerRadius) {
            if (orb.type === 'SHIELD') {
              eng.shield = true;
              setShieldActive(true);
              playSound(852, 'sine', 0.25);
              toast('🛡️ Energy Shield Activated!', { icon: '🛡️' });
            } else if (orb.type === 'GOLD') {
              eng.score += 100;
              playSound(639, 'triangle', 0.18);
            } else {
              eng.score += 50;
              playSound(528, 'sine', 0.12);
            }

            // Burst Particles
            for (let p = 0; p < 12; p++) {
              eng.particles.push({
                x: orb.x,
                y: orb.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 4 + 2,
                color: orb.color,
                alpha: 1.0
              });
            }

            setScore(eng.score);
            eng.orbs.splice(i, 1);
          } else if (orb.y > canvas.height + 20) {
            eng.orbs.splice(i, 1);
          }
        }

        // Update & Render Static Obstacles
        for (let i = eng.obstacles.length - 1; i >= 0; i--) {
          const obs = eng.obstacles[i];
          obs.y += eng.speed;

          // Render Hazard Barrier
          ctx.fillStyle = '#ff7675';
          ctx.shadowColor = '#ff7675';
          ctx.shadowBlur = 15;
          ctx.fillRect(obs.x - obs.width / 2, obs.y, obs.width, obs.height);
          ctx.shadowBlur = 0;

          // Collision Check
          const playerLeft = eng.playerX - eng.playerRadius;
          const playerRight = eng.playerX + eng.playerRadius;
          const playerTop = eng.playerY - eng.playerRadius;
          const playerBottom = eng.playerY + eng.playerRadius;

          const obsLeft = obs.x - obs.width / 2;
          const obsRight = obs.x + obs.width / 2;
          const obsTop = obs.y;
          const obsBottom = obs.y + obs.height;

          if (playerRight > obsLeft && playerLeft < obsRight && playerBottom > obsTop && playerTop < obsBottom) {
            playSound(150, 'sawtooth', 0.3);

            if (eng.shield) {
              eng.shield = false;
              setShieldActive(false);
              toast('🛡️ Shield Absorbed Collision!', { icon: '💥' });
            } else {
              eng.health -= 1;
              setHealth(eng.health);
              toast.error('⚡ Static Interference Damage!');

              if (eng.health <= 0) {
                setGameState('GAMEOVER');
                const xpGain = Math.floor(eng.score * 1.5);
                setEarnedXp(xpGain);
                if (onAddXp) onAddXp(xpGain);

                if (eng.score > highScore) {
                  setHighScore(eng.score);
                  localStorage.setItem('chakra_runner_high_score', eng.score.toString());
                  toast.success(`🎉 NEW HIGH SCORE: ${eng.score}!`);
                }
              }
            }
            eng.obstacles.splice(i, 1);
          } else if (obs.y > canvas.height + 30) {
            eng.obstacles.splice(i, 1);
          }
        }

        // Draw Player Glowing Energy Orb
        const pGrad = ctx.createRadialGradient(eng.playerX, eng.playerY, 2, eng.playerX, eng.playerY, eng.playerRadius * 2);
        pGrad.addColorStop(0, eng.shield ? '#00F5D4' : '#FFD700');
        pGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(eng.playerX, eng.playerY, eng.playerRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = eng.shield ? '#00F5D4' : '#FFD700';
        ctx.beginPath();
        ctx.arc(eng.playerX, eng.playerY, eng.playerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('touchmove', handlePointerMove);
    };
  }, [gameState, highScore]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10040,
        background: 'rgba(5, 5, 12, 0.92)',
        backdropFilter: 'blur(25px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(12, 14, 26, 0.95)',
        border: '2px solid var(--accent-gold)',
        borderRadius: '24px',
        padding: '1.5rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        position: 'relative',
        textAlign: 'center',
        color: '#fff'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#00F5D4', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            ✦ AAA Arcade Minigame ✦
          </span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', margin: '0.2rem 0', color: 'var(--accent-gold)' }}>
            Chakra Energy Runner
          </h2>
        </div>

        {/* Game Canvas Overlay Area */}
        <div style={{ position: 'relative', margin: '0 auto', width: '100%', maxWidth: '450px' }}>
          <canvas
            ref={canvasRef}
            style={{
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'block',
              margin: '0 auto',
              touchAction: 'none'
            }}
          />

          {/* HUD Overlay */}
          {gameState === 'PLAYING' && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ background: 'rgba(0,0,0,0.7)', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1rem', border: '1px solid var(--accent-gold)' }}>
                ⭐ {score} PTS
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} style={{ fontSize: '1.2rem', opacity: i < health ? 1 : 0.25 }}>
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* START SCREEN */}
          {gameState === 'START' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 10, 20, 0.88)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔮</div>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>Ready to Channel Energy?</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', maxWidth: '300px', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                Drag your energy orb to collect 528Hz Solfeggio Orbs &amp; Crystals while dodging red static barriers!
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
                🏆 Personal High Score: {highScore} PTS
              </div>
              <button
                onClick={startGame}
                className="btn-primary"
                style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Play size={20} /> Start Game
              </button>
            </div>
          )}

          {/* GAMEOVER SCREEN */}
          {gameState === 'GAMEOVER' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 10, 20, 0.92)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✨</div>
              <h3 style={{ fontSize: '1.5rem', color: '#50e3c2', marginBottom: '0.2rem' }}>Harmonic Alignment Complete!</h3>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--accent-gold)', margin: '0.5rem 0' }}>
                {score} PTS
              </div>
              <div style={{ background: 'rgba(80, 227, 194, 0.15)', border: '1px solid #50e3c2', padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem', color: '#50e3c2', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                🎉 +{earnedXp} Battle Pass XP Granted!
              </div>
              <button
                onClick={startGame}
                className="btn-primary"
                style={{ padding: '0.85rem 2.5rem', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RotateCcw size={18} /> Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChakraRunnerGame;
