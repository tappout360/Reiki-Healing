import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Sparkles, Wind, Shield, Sun, Play, Pause, 
  RotateCcw, X, CheckCircle, ChevronDown, Volume2, VolumeX, Sliders 
} from 'lucide-react';
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
    title: 'Centered Stillness',
    subtitle: 'Protective Biofield Boundary & Seal',
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [volume, setVolume] = useState(0.25); // Soft default
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const filterRef = useRef(null);

  // Soft Warm Sound Generator with Lowpass Filter
  const startTone = (freq) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Soft Warm Lowpass Filter: eliminates harsh high buzz
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(520, freq * 1.1), now);
      filter.Q.setValueAtTime(0.707, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const targetGain = isMuted ? 0.0001 : Math.max(0.0001, volume * 0.08);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(targetGain, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);

      oscRef.current = osc;
      gainRef.current = gain;
      filterRef.current = filter;
    } catch {
      // audio context fallback
    }
  };

  const stopTone = () => {
    if (gainRef.current && audioCtxRef.current) {
      try {
        gainRef.current.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.4);
        setTimeout(() => {
          if (oscRef.current) {
            try { oscRef.current.stop(); } catch {}
            oscRef.current = null;
          }
        }, 450);
      } catch {
        // cleanup
      }
    }
  };

  // Dynamically adjust frequency volume
  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const targetGain = isMuted ? 0.0001 : Math.max(0.0001, volume * 0.08);
      try {
        gainRef.current.gain.linearRampToValueAtTime(targetGain, now + 0.1);
      } catch {}
    }
  }, [volume, isMuted]);

  // Practice selection via dropdown
  const selectPractice = (practice) => {
    stopTone();
    setActivePractice(practice);
    setIsPlaying(false);
    setSecondsRemaining(practice.duration);
    setBreathPhase('inhale');
    setBreathCountdown(practice.inhale);
    setIsDropdownOpen(false);
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
      background: 'rgba(5, 5, 10, 0.96)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '620px',
        background: '#090a14',
        border: '1.5px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '26px',
        padding: '2rem 1.75rem',
        color: '#fff',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 40px rgba(212, 175, 55, 0.1)',
        position: 'relative'
      }}>
        {/* Close Button */}
        {onClose && (
          <button
            onClick={() => { stopTone(); onClose(); }}
            type="button"
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Title Header */}
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

        {/* Practice Selection Dropdown Window (Replaces overflowing pills) */}
        <div style={{ position: 'relative', marginBottom: '1.5rem', zIndex: 30 }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.75rem', 
            color: 'var(--accent-gold)', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            marginBottom: '6px' 
          }}>
            Select Alignment Practice:
          </label>
          
          {/* Dropdown Trigger Window */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(212, 175, 55, 0.45)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: '#fff',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              boxShadow: isDropdownOpen ? '0 0 20px rgba(212, 175, 55, 0.25)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `${activePractice.color}20`,
                border: `1px solid ${activePractice.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconComponent size={18} color={activePractice.color} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{activePractice.title}</span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    background: 'rgba(212, 175, 55, 0.2)', 
                    color: 'var(--accent-gold)',
                    fontWeight: 'bold'
                  }}>
                    {Math.round(activePractice.duration / 60 * 10) / 10} min
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activePractice.subtitle} • {activePractice.frequency}Hz
                </div>
              </div>
            </div>

            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ flexShrink: 0, marginLeft: '8px', color: 'var(--accent-gold)' }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </button>

          {/* Expandable Dropdown Menu Window */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '8px',
                  background: '#0e111d',
                  border: '1.5px solid rgba(212, 175, 55, 0.5)',
                  borderRadius: '18px',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.9), 0 0 25px rgba(212,175,55,0.15)',
                  overflow: 'hidden',
                  zIndex: 50,
                  maxHeight: '320px',
                  overflowY: 'auto'
                }}
              >
                {MICRO_PRACTICES.map((p, idx) => {
                  const PIcon = p.icon;
                  const isSelected = p.id === activePractice.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectPractice(p)}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                        borderBottom: idx === MICRO_PRACTICES.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: `${p.color}20`,
                          border: `1px solid ${p.color}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <PIcon size={16} color={p.color} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ 
                            fontWeight: isSelected ? '700' : '600', 
                            fontSize: '0.88rem', 
                            color: isSelected ? 'var(--accent-gold)' : '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{idx + 1}. {p.title}</span>
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.7)'
                            }}>
                              {p.duration < 120 ? `${p.duration}s` : `${p.duration / 60} min`}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
                            {p.subtitle} • {p.frequency}Hz
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginLeft: '8px' }} />
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Practice Card & Breathing Pulsar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          padding: '1.75rem 1.25rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          position: 'relative'
        }}>
          {/* Animated Pulsing Sphere */}
          <div style={{
            position: 'relative',
            width: '130px',
            height: '130px',
            margin: '0 auto 1.25rem',
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
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.85)',
                border: `2px solid ${activePractice.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                boxShadow: `0 0 25px ${activePractice.color}40`
              }}
            >
              <IconComponent size={30} color={activePractice.color} />
            </motion.div>
          </div>

          {/* Breath Instruction */}
          <div style={{ marginBottom: '0.85rem' }}>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: activePractice.color,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '4px'
            }}>
              {isPlaying ? (breathPhase === 'inhale' ? `✦ Inhale Light (${breathCountdown}s) ✦` : `✦ Exhale & Release (${breathCountdown}s) ✦`) : activePractice.title}
            </div>
            <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5', maxWidth: '440px', margin: '0 auto' }}>
              {activePractice.instruction}
            </p>
          </div>

          {/* Time Remaining */}
          <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff', marginBottom: '1rem' }}>
            {formatTime(secondsRemaining)}
          </div>

          {/* Transport Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center', marginBottom: '1.25rem' }}>
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

          {/* Soft Healing Frequency Volume Slider */}
          <div style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '8px 14px',
            maxWidth: '380px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isMuted ? '#ff7675' : 'var(--accent-gold)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
              title={isMuted ? 'Unmute Frequency' : 'Mute Frequency'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', marginBottom: '3px' }}>
                <span>Soft {activePractice.frequency}Hz Frequency</span>
                <span>{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-gold)',
                  cursor: 'pointer',
                  height: '4px'
                }}
              />
            </div>
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
