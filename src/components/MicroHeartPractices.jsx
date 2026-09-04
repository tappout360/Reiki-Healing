import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Wind, Shield, Sun, Play, Pause, RotateCcw, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const MICRO_PRACTICES = [
  {
    id: 'heart_breath',
    title: 'Heart Breath',
    subtitle: 'Heart-Rate Coherence',
    duration: 120, // 2 mins
    inhale: 4,
    exhale: 6,
    icon: Wind,
    color: '#50e3c2',
    frequency: 528,
    instruction: 'Inhale gently for 4 seconds, feeling breath move directly into your heart center. Exhale softly for 6 seconds, releasing all accumulated tension.'
  },
  {
    id: 'hand_of_love',
    title: 'Hand of Love',
    subtitle: 'Somatic Chest Grounding',
    duration: 90, // 1.5 mins
    inhale: 4,
    exhale: 4,
    icon: Heart,
    color: '#ff7675',
    frequency: 639,
    instruction: 'Rest your right palm directly over the center of your chest. Feel the natural warmth of your hand meeting your heartbeat. You are safe here.'
  },
  {
    id: 'earth_holds_me',
    title: 'Earth Holds Me',
    subtitle: 'Root & Biofield Discharge',
    duration: 120, // 2 mins
    inhale: 5,
    exhale: 5,
    icon: Sun,
    color: '#d4af37',
    frequency: 432,
    instruction: 'Visualize heavy, stagnant energy flowing down through your spine, legs, and soles into the patient Earth below. The ground receives and neutralizes all excess.'
  },
  {
    id: 'receiving_love',
    title: 'Receiving Love',
    subtitle: 'Dorsal Heart Expansion',
    duration: 90, // 1.5 mins
    inhale: 4,
    exhale: 6,
    icon: Sparkles,
    color: '#a29bfe',
    frequency: 528,
    instruction: 'Breathe into the space behind your shoulder blades. Soften your armor. Allow unconditional warmth from the universe to flow in through your back.'
  },
  {
    id: 'heart_seal',
    title: 'Heart Seal',
    subtitle: 'Protective Biofield Boundary',
    duration: 60, // 1 min
    inhale: 4,
    exhale: 4,
    icon: Shield,
    color: '#fdcb6e',
    frequency: 741,
    instruction: 'Visualize a soft sphere of golden light wrapping around your aura. Seal this peace into your cells before returning to the world.'
  }
];

export const MicroHeartPractices = ({ onClose }) => {
  const [activePractice, setActivePractice] = useState(MICRO_PRACTICES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(MICRO_PRACTICES[0].duration);
  const [breathPhase, setBreathPhase] = useState('inhale'); // 'inhale' | 'exhale'
  const [breathCountdown, setBreathCountdown] = useState(MICRO_PRACTICES[0].inhale);

  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // Sound generator
  const startTone = (freq) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch {
      // audio context fallback
    }
  };

  const stopTone = () => {
    if (gainRef.current && audioCtxRef.current) {
      try {
        gainRef.current.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.5);
        setTimeout(() => {
          if (oscRef.current) {
            oscRef.current.stop();
            oscRef.current = null;
          }
        }, 500);
      } catch {
        // cleanup
      }
    }
  };

  // Practice selection
  const selectPractice = (practice) => {
    stopTone();
    setActivePractice(practice);
    setIsPlaying(false);
    setSecondsRemaining(practice.duration);
    setBreathPhase('inhale');
    setBreathCountdown(practice.inhale);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopTone();
    } else {
      setIsPlaying(true);
      startTone(activePractice.frequency);
    }
  };

  const resetPractice = () => {
    stopTone();
    setIsPlaying(false);
    setSecondsRemaining(activePractice.duration);
    setBreathPhase('inhale');
    setBreathCountdown(activePractice.inhale);
  };

  // Timer & Breath Engine
  useEffect(() => {
    let timer = null;
    let breathTimer = null;

    if (isPlaying && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            stopTone();
            setIsPlaying(false);
            toast.success(`✨ ${activePractice.title} integration complete.`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      breathTimer = setInterval(() => {
        setBreathCountdown(prev => {
          if (prev <= 1) {
            setBreathPhase(curr => {
              const next = curr === 'inhale' ? 'exhale' : 'inhale';
              return next;
            });
            return breathPhase === 'inhale' ? activePractice.exhale : activePractice.inhale;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (breathTimer) clearInterval(breathTimer);
    };
  }, [isPlaying, secondsRemaining, breathPhase, activePractice]);

  useEffect(() => {
    return () => {
      stopTone();
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const IconComponent = activePractice.icon;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(5, 5, 10, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        background: '#090a12',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '26px',
        padding: '2rem 1.75rem',
        color: '#fff',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.08)',
        position: 'relative'
      }}>
        {/* Close */}
        {onClose && (
          <button
            onClick={() => { stopTone(); onClose(); }}
            type="button"
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
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
            <X size={18} />
          </button>
        )}

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            ✦ Light Daily Energy Care ✦
          </span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', margin: '0.25rem 0', color: '#fff' }}>
            Micro Heart Practices
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            1–2 minute somatic and biofield alignments. Free and open to all seekers.
          </p>
        </div>

        {/* Practice Selection Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '1.75rem',
          scrollbarWidth: 'none'
        }}>
          {MICRO_PRACTICES.map((p) => {
            const PIcon = p.icon;
            const isSelected = p.id === activePractice.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPractice(p)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.04)',
                  border: isSelected ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                  color: isSelected ? 'var(--accent-gold)' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <PIcon size={14} color={isSelected ? 'var(--accent-gold)' : 'rgba(255,255,255,0.6)'} />
                {p.title}
              </button>
            );
          })}
        </div>

        {/* Active Practice Card & Breathing Pulsar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          {/* Animated Pulsing Sphere */}
          <div style={{
            position: 'relative',
            width: '140px',
            height: '140px',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <motion.div
              animate={{
                scale: isPlaying ? (breathPhase === 'inhale' ? 1.35 : 0.85) : 1,
                opacity: isPlaying ? (breathPhase === 'inhale' ? 0.9 : 0.4) : 0.6
              }}
              transition={{
                duration: breathPhase === 'inhale' ? activePractice.inhale : activePractice.exhale,
                ease: 'easeInOut'
              }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${activePractice.color} 0%, transparent 70%)`,
                filter: 'blur(12px)',
                pointerEvents: 'none'
              }}
            />

            <motion.div
              animate={{
                scale: isPlaying ? (breathPhase === 'inhale' ? 1.2 : 0.9) : 1
              }}
              transition={{
                duration: breathPhase === 'inhale' ? activePractice.inhale : activePractice.exhale,
                ease: 'easeInOut'
              }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.8)',
                border: `2px solid ${activePractice.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                boxShadow: `0 0 25px ${activePractice.color}40`
              }}
            >
              <IconComponent size={32} color={activePractice.color} />
            </motion.div>
          </div>

          {/* Breath Instruction */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: activePractice.color,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '4px'
            }}>
              {isPlaying ? (breathPhase === 'inhale' ? `✦ Inhale Light (${breathCountdown}s) ✦` : `✦ Exhale & Release (${breathCountdown}s) ✦`) : 'Centered Stillness'}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto' }}>
              {activePractice.instruction}
            </p>
          </div>

          {/* Time Remaining */}
          <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff', marginBottom: '1.25rem' }}>
            {formatTime(secondsRemaining)}
          </div>

          {/* Control Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={togglePlay}
              style={{
                padding: '10px 24px',
                borderRadius: '25px',
                background: isPlaying ? 'rgba(255,255,255,0.1)' : 'var(--accent-gold)',
                color: isPlaying ? '#fff' : '#000',
                border: isPlaying ? '1px solid rgba(255,255,255,0.3)' : 'none',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isPlaying ? 'none' : '0 4px 20px rgba(212, 175, 55, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} fill="#000" />}
              {isPlaying ? 'Pause' : 'Begin Practice'}
            </button>

            <button
              type="button"
              onClick={resetPractice}
              style={{
                padding: '10px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Reset timer"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>
          🛡️ Spiritual wellness tool designed for daily mindfulness and relaxation. Non-medical.
        </div>
      </div>
    </div>
  );
};

export default MicroHeartPractices;
