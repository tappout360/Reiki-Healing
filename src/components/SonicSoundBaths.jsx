import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Sparkles, X, Clock, Disc } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SOLFEGGIO_FREQUENCIES = [
  { freq: 432, name: '432 Hz', title: 'Universal Harmony & Calm', color: '#4a90e2', desc: 'Encodes natural acoustic resonance, soothing anxiety and aligning the physical biofield.' },
  { freq: 528, name: '528 Hz', title: 'Transformation & DNA Repair', color: '#50e3c2', desc: 'The Miracle Tone. Promotes cellular regeneration, deep peace, and emotional clarity.' },
  { freq: 639, name: '639 Hz', title: 'Heart Connection & Compassion', color: '#e67e22', desc: 'Harmonizes interpersonal relationships, opening the heart chakra to unconditional empathy.' },
  { freq: 741, name: '741 Hz', title: 'Intuition & Awakening', color: '#9b59b6', desc: 'Purifies energy centers, encouraging self-expression and spiritual awakening.' },
  { freq: 852, name: '852 Hz', title: 'Third Eye & Divine Order', color: '#f1c40f', desc: 'Clears cognitive static, returning the mind to higher spiritual awareness.' }
];

const SonicSoundBaths = ({ onClose }) => {
  const [selectedFreq, setSelectedFreq] = useState(SOLFEGGIO_FREQUENCIES[1]); // 528Hz default
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [binauralEnabled, setBinauralEnabled] = useState(true);
  const [natureRain, setNatureRain] = useState(false);
  const [bowlHarmonics, setBowlHarmonics] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);

  const audioCtxRef = useRef(null);
  const mainOscRef = useRef(null);
  const binauralOscRef = useRef(null);
  const gainNodeRef = useRef(null);
  const rainNoiseRef = useRef(null);
  const bowlIntervalRef = useRef(null);

  // Initialize Web Audio Context
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const startSoundBath = () => {
    initAudio();
    stopSoundBath(); // Clear any existing oscillators

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // 1. Primary Solfeggio Sine Oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(selectedFreq.freq, now);

    // Warm Low-pass filter for smooth organic tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(selectedFreq.freq * 2, now);

    osc.connect(filter);
    filter.connect(masterGain);
    osc.start();
    mainOscRef.current = osc;

    // 2. Binaural Beats Layer (Theta Wave 6Hz offset)
    if (binauralEnabled) {
      const binauralOsc = ctx.createOscillator();
      binauralOsc.type = 'sine';
      binauralOsc.frequency.setValueAtTime(selectedFreq.freq + 6, now); // 6Hz Theta offset

      const binauralGain = ctx.createGain();
      binauralGain.gain.setValueAtTime(volume * 0.4, now);

      binauralOsc.connect(binauralGain);
      binauralGain.connect(ctx.destination);
      binauralOsc.start();
      binauralOscRef.current = binauralOsc;
    }

    // 3. Ambient Rain Synthesizer (White noise + Bandpass filter)
    if (natureRain) {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1000, now);
      noiseFilter.Q.setValueAtTime(0.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.15, now);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start();
      rainNoiseRef.current = whiteNoise;
    }

    setIsPlaying(true);
    toast.success(`Resonating at ${selectedFreq.name}`);
  };

  const stopSoundBath = () => {
    if (mainOscRef.current) {
      try { mainOscRef.current.stop(); } catch {}
      mainOscRef.current = null;
    }
    if (binauralOscRef.current) {
      try { binauralOscRef.current.stop(); } catch {}
      binauralOscRef.current = null;
    }
    if (rainNoiseRef.current) {
      try { rainNoiseRef.current.stop(); } catch {}
      rainNoiseRef.current = null;
    }
    setIsPlaying(false);
  };

  // Play Crystal Bowl chime
  const strikeSingingBowl = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const bowlOsc = ctx.createOscillator();
    const bowlGain = ctx.createGain();

    bowlOsc.type = 'sine';
    bowlOsc.frequency.setValueAtTime(selectedFreq.freq * 1.5, now);

    bowlGain.gain.setValueAtTime(0, now);
    bowlGain.gain.linearRampToValueAtTime(0.5, now + 0.1);
    bowlGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

    bowlOsc.connect(bowlGain);
    bowlGain.connect(ctx.destination);

    bowlOsc.start(now);
    bowlOsc.stop(now + 4.5);
    toast('✨ Crystal Bowl Struck', { icon: '🔔' });
  };

  // Handle Volume Change
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Handle Frequency Change during play
  useEffect(() => {
    if (isPlaying) {
      startSoundBath();
    }
  }, [selectedFreq, binauralEnabled, natureRain]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSoundBath();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10020,
        background: 'rgba(5, 5, 12, 0.92)',
        backdropFilter: 'blur(25px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        background: 'rgba(15, 18, 30, 0.95)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '24px',
        padding: '2rem',
        overflowY: 'auto',
        color: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={() => { stopSoundBath(); onClose(); }}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
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
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            ✦ Solfeggio & Crystal Resonance Studio ✦
          </span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '0.5rem 0', color: selectedFreq.color }}>
            Sonic Sound Baths
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', maxWidth: '550px', margin: '0 auto' }}>
            Real-time organic Web Audio acoustic resonance generator. Select a sacred Solfeggio frequency to balance biofield energy centers.
          </p>
        </div>

        {/* Visual Resonance Wave Sphere */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <motion.div
            animate={{
              scale: isPlaying ? [1, 1.15, 1] : 1,
              boxShadow: isPlaying
                ? [`0 0 30px ${selectedFreq.color}`, `0 0 70px ${selectedFreq.color}`, `0 0 30px ${selectedFreq.color}`]
                : `0 0 20px rgba(255,255,255,0.1)`
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${selectedFreq.color} 0%, rgba(0,0,0,0.8) 80%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={isPlaying ? stopSoundBath : startSoundBath}
          >
            {isPlaying ? <Pause size={40} color="#fff" /> : <Play size={40} color="#fff" style={{ marginLeft: '6px' }} />}
          </motion.div>
        </div>

        {/* Frequency Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {SOLFEGGIO_FREQUENCIES.map((f) => (
            <button
              key={f.freq}
              onClick={() => setSelectedFreq(f)}
              style={{
                padding: '0.85rem 0.5rem',
                borderRadius: '14px',
                border: selectedFreq.freq === f.freq ? `2px solid ${f.color}` : '1px solid rgba(255,255,255,0.1)',
                background: selectedFreq.freq === f.freq ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: f.color }}>{f.name}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>{f.title.split('&')[0]}</div>
            </button>
          ))}
        </div>

        {/* Selected Frequency Details */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', borderLeft: `4px solid ${selectedFreq.color}` }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: selectedFreq.color }}>{selectedFreq.name} — {selectedFreq.title}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', lineHeight: '1.4' }}>{selectedFreq.desc}</div>
        </div>

        {/* Audio Layer Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setBinauralEnabled(!binauralEnabled)}
            style={{
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: binauralEnabled ? 'rgba(80, 227, 194, 0.15)' : 'rgba(0,0,0,0.3)',
              color: binauralEnabled ? '#50e3c2' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.85rem'
            }}
          >
            <Disc size={16} /> 6Hz Theta Waves: {binauralEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setNatureRain(!natureRain)}
            style={{
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: natureRain ? 'rgba(74, 144, 226, 0.15)' : 'rgba(0,0,0,0.3)',
              color: natureRain ? '#4a90e2' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.85rem'
            }}
          >
            <Sparkles size={16} /> Soft Rain Ambience: {natureRain ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={strikeSingingBowl}
            style={{
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1px solid var(--accent-gold)',
              background: 'rgba(212, 175, 55, 0.15)',
              color: 'var(--accent-gold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}
          >
            🔔 Strike Singing Bowl
          </button>
        </div>

        {/* Master Volume & Main Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <VolumeX size={18} color="rgba(255,255,255,0.6)" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: selectedFreq.color, cursor: 'pointer' }}
          />
          <Volume2 size={18} color={selectedFreq.color} />

          <button
            onClick={isPlaying ? stopSoundBath : startSoundBath}
            className="btn-primary"
            style={{
              padding: '0.8rem 1.75rem',
              borderRadius: '30px',
              background: isPlaying ? '#e74c3c' : `linear-gradient(135deg, ${selectedFreq.color}, #000)`,
              border: 'none',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? 'Stop Sound Bath' : 'Begin Resonance'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SonicSoundBaths;
