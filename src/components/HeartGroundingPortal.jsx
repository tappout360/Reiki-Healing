import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, Volume2, VolumeX, RotateCcw, 
  Sparkles, Heart, Shield, Sliders, Music, Radio 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * HeartGroundingPortal — Dedicated 5-Minute Grounding & Heart Alignment Sanctuary
 * - Unique 5-Minute HD Video Stream (heart_grounding_5min.mp4)
 * - Soft 528Hz Solfeggio Tone with warm lowpass filtering (zero harshness)
 * - Layered ambient meditation music bed with independent volume control
 * - Dual volume sliders (Frequency Volume + Meditation Music Volume)
 */
export const HeartGroundingPortal = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [freqVolume, setFreqVolume] = useState(0.25); // Soft default
  const [musicVolume, setMusicVolume] = useState(0.60); // Comfortable music level
  const [freqMuted, setFreqMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const videoRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const oscSubRef = useRef(null);
  const freqGainRef = useRef(null);
  const filterRef = useRef(null);

  const TOTAL_DURATION = 300; // 5 minutes

  // Initialize and run warm soft 528Hz frequency
  const startSoftFrequency = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Master Gain for Frequency
      const fGain = ctx.createGain();
      const targetGain = freqMuted ? 0 : freqVolume * 0.12; // warm gentle baseline
      fGain.gain.setValueAtTime(0.0001, now);
      fGain.gain.linearRampToValueAtTime(Math.max(0.0001, targetGain), now + 2.0);
      freqGainRef.current = fGain;

      // Warm 2-pole Lowpass Filter: removes any harsh buzz/sibilance
      const warmFilter = ctx.createBiquadFilter();
      warmFilter.type = 'lowpass';
      warmFilter.frequency.setValueAtTime(580, now);
      warmFilter.Q.setValueAtTime(0.707, now);
      filterRef.current = warmFilter;

      // Layer 1: Pure 528Hz Fundamental Sine
      const mainOsc = ctx.createOscillator();
      mainOsc.type = 'sine';
      mainOsc.frequency.setValueAtTime(528, now);

      const mGain = ctx.createGain();
      mGain.gain.setValueAtTime(0.6, now);
      mainOsc.connect(mGain);
      mGain.connect(warmFilter);
      oscRef.current = mainOsc;

      // Layer 2: Soft Sub-Octave (264Hz) for grounding depth
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(264, now);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.25, now);
      subOsc.connect(subGain);
      subGain.connect(warmFilter);
      oscSubRef.current = subOsc;

      // Connect Filter -> Gain -> Destination
      warmFilter.connect(fGain);
      fGain.connect(ctx.destination);

      mainOsc.start(now);
      subOsc.start(now);
    } catch {
      // audio context fallback
    }
  };

  const stopSoftFrequency = () => {
    if (freqGainRef.current && audioCtxRef.current) {
      try {
        const now = audioCtxRef.current.currentTime;
        freqGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.8);
        setTimeout(() => {
          if (oscRef.current) {
            try { oscRef.current.stop(); } catch {}
            oscRef.current = null;
          }
          if (oscSubRef.current) {
            try { oscSubRef.current.stop(); } catch {}
            oscSubRef.current = null;
          }
        }, 850);
      } catch {}
    }
  };

  // Update frequency volume dynamically
  useEffect(() => {
    if (freqGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const target = freqMuted ? 0.0001 : Math.max(0.0001, freqVolume * 0.12);
      try {
        freqGainRef.current.gain.linearRampToValueAtTime(target, now + 0.15);
      } catch {}
    }
  }, [freqVolume, freqMuted]);

  // Update video/music volume dynamically
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = musicMuted ? 0 : musicVolume;
    }
  }, [musicVolume, musicMuted]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (videoRef.current) videoRef.current.pause();
      stopSoftFrequency();
    } else {
      setIsPlaying(true);
      if (videoRef.current) videoRef.current.play();
      startSoftFrequency();
    }
  };

  // Start on mount, cleanup on unmount
  useEffect(() => {
    startSoftFrequency();
    return () => {
      stopSoftFrequency();
    };
  }, []);

  // Sync elapsed time with video
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setElapsedSeconds(Math.floor(videoRef.current.currentTime));
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * TOTAL_DURATION;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setElapsedSeconds(Math.floor(newTime));
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, (elapsedSeconds / TOTAL_DURATION) * 100);

  // Active phase caption
  const getPhaseName = () => {
    if (elapsedSeconds < 60) return 'Phase 1: Sacred Center Arrival';
    if (elapsedSeconds < 120) return 'Phase 2: Somatic Root Discharge';
    if (elapsedSeconds < 180) return 'Phase 3: 528Hz Emerald Heart Coherence';
    if (elapsedSeconds < 240) return 'Phase 4: Dorsal Expansion & Compassion';
    return 'Phase 5: Golden Biofield Seal & Stillness';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(5, 6, 12, 0.96)',
      backdropFilter: 'blur(25px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '920px',
        background: '#0a0c16',
        border: '1.5px solid rgba(212, 175, 55, 0.45)',
        borderRadius: '26px',
        padding: '1.75rem',
        color: '#fff',
        boxShadow: '0 30px 90px rgba(0,0,0,0.95), 0 0 50px rgba(80, 227, 194, 0.12)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={() => {
            stopSoftFrequency();
            onClose();
          }}
          type="button"
          aria-label="Close portal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            transition: 'all 0.2s ease'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            <Sparkles size={13} color="var(--accent-gold)" />
            ✦ Unique 5-Minute Sacred Experience ✦
          </div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.85rem', margin: '0.25rem 0', color: '#fff' }}>
            5-Minute Grounding &amp; Heart Alignment
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#50e3c2', margin: 0, fontWeight: '600' }}>
            {getPhaseName()} • 528Hz Solfeggio &amp; Ambient Sanctuary
          </p>
        </div>

        {/* Video Player Container */}
        <div style={{
          position: 'relative',
          borderRadius: '18px',
          overflow: 'hidden',
          aspectRatio: '16/9',
          background: '#000',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 15px 45px rgba(0,0,0,0.85)',
          marginBottom: '1.25rem'
        }}>
          <video
            ref={videoRef}
            src="/assets/heart_grounding_5min.mp4"
            autoPlay
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              setIsPlaying(false);
              stopSoftFrequency();
              toast.success('✨ 5-Minute Heart & Grounding Alignment complete.');
            }}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />

          {/* Floating Phase Pill */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(80, 227, 194, 0.4)',
            color: '#50e3c2',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Heart size={13} fill="#50e3c2" />
            {getPhaseName().split(':')[1] || 'Heart Alignment'}
          </div>

          {/* Scrubbable Progress Bar */}
          <div 
            onClick={handleSeek}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'rgba(255,255,255,0.2)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--accent-gold), #50e3c2)',
              transition: 'width 0.2s linear'
            }} />
          </div>
        </div>

        {/* Dual Sound Controls Box: Frequency + Meditation Music */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Sliders size={16} />
              Acoustic Resonance &amp; Music Sliders
            </div>
            <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#fff', fontWeight: 'bold' }}>
              {formatTime(elapsedSeconds)} / {formatTime(TOTAL_DURATION)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Slider 1: Soft Heart Frequency (528Hz) */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(80, 227, 194, 0.2)',
              borderRadius: '14px',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#50e3c2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={14} /> 528Hz Soft Heart Frequency
                </span>
                <button
                  type="button"
                  onClick={() => setFreqMuted(!freqMuted)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: freqMuted ? '#ff7675' : '#50e3c2',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold'
                  }}
                >
                  {freqMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  {freqMuted ? 'Muted' : `${Math.round(freqVolume * 100)}%`}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={freqVolume}
                onChange={(e) => {
                  setFreqVolume(parseFloat(e.target.value));
                  if (freqMuted) setFreqMuted(false);
                }}
                style={{
                  width: '100%',
                  accentColor: '#50e3c2',
                  cursor: 'pointer',
                  height: '6px',
                  borderRadius: '3px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
                <span>Subtle / Whisper</span>
                <span>Balanced</span>
                <span>Deep Resonance</span>
              </div>
            </div>

            {/* Slider 2: Soft Background Meditation Music */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '14px',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Music size={14} /> Ambient Meditation Music
                </span>
                <button
                  type="button"
                  onClick={() => setMusicMuted(!musicMuted)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: musicMuted ? '#ff7675' : 'var(--accent-gold)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold'
                  }}
                >
                  {musicMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  {musicMuted ? 'Muted' : `${Math.round(musicVolume * 100)}%`}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicVolume}
                onChange={(e) => {
                  setMusicVolume(parseFloat(e.target.value));
                  if (musicMuted) setMusicMuted(false);
                }}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-gold)',
                  cursor: 'pointer',
                  height: '6px',
                  borderRadius: '3px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
                <span>Soft Pad</span>
                <span>Optimal Harmony</span>
                <span>Immersive Bed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Transport & Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={togglePlay}
            style={{
              padding: '12px 32px',
              borderRadius: '30px',
              background: isPlaying ? 'rgba(255,255,255,0.1)' : 'var(--accent-gold)',
              color: isPlaying ? '#fff' : '#000',
              border: isPlaying ? '1px solid rgba(255,255,255,0.3)' : 'none',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: isPlaying ? 'none' : '0 6px 25px rgba(212, 175, 55, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#000" />}
            {isPlaying ? 'Pause Session' : 'Resume Session'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                setElapsedSeconds(0);
                if (!isPlaying) togglePlay();
              }
            }}
            style={{
              padding: '12px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Restart Session"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Wellness safe-harbor compliance */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '0.75rem 1.25rem',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: '1.5'
        }}>
          🛡️ <strong>Spiritual Wellness Notice:</strong> The 5-Minute Grounding &amp; Heart Alignment transmission is offered solely for daily mindfulness, acoustic relaxation, and personal spiritual equilibrium. Reiki is a spiritual wellness practice; healers do not diagnose or treat medical conditions.
        </div>
      </div>
    </div>
  );
};

export default HeartGroundingPortal;
