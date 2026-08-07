import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Sparkles, X, Maximize2, Minimize2, ChevronUp, ChevronDown, Disc, ChevronLeft, ChevronRight, Sliders } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CHAKRA_VIDEOS = [
  {
    id: 'root',
    name: 'Root Chakra (Muladhara)',
    freq: 396,
    freqLabel: '396 Hz',
    color: '#ff4757',
    image: '/assets/root_chakra.jpg',
    element: 'Earth & Volcanic Ruby',
    intent: 'Liberation from Fear & Deep Physical Grounding',
    desc: 'Encodes 396Hz Solfeggio resonance to clear subconscious fears and anchor biofield stability.'
  },
  {
    id: 'sacral',
    name: 'Sacral Chakra (Svadhisthana)',
    freq: 417,
    freqLabel: '417 Hz',
    color: '#ffa502',
    image: '/assets/sacral_chakra.jpg',
    element: 'Fluid Amber Water',
    intent: 'Emotional Transmutation & Creative Awakening',
    desc: 'Encodes 417Hz Solfeggio frequency to dissolve emotional blockages and ignite creative flow.'
  },
  {
    id: 'solar',
    name: 'Solar Plexus (Manipura)',
    freq: 528,
    freqLabel: '528 Hz',
    color: '#eccc68',
    image: '/assets/solar_chakra.jpg',
    element: 'Golden Solar Plasma',
    intent: 'Personal Sovereignty & Transformation',
    desc: 'The 528Hz Miracle Tone. Promotes cellular renewal, inner power, and core alignment.'
  },
  {
    id: 'heart',
    name: 'Heart Chakra (Anahata)',
    freq: 639,
    freqLabel: '639 Hz',
    color: '#2ed573',
    image: '/assets/heart_chakra.jpg',
    element: 'Emerald Quantum Lotus',
    intent: 'Unconditional Love & Interconnectedness',
    desc: 'Harmonizes interpersonal relationships and opens the heart center to boundless empathy.'
  },
  {
    id: 'throat',
    name: 'Throat Chakra (Vishuddha)',
    freq: 741,
    freqLabel: '741 Hz',
    color: '#1e90ff',
    image: '/assets/throat_chakra.jpg',
    element: 'Azure Soundwave Vortex',
    intent: 'Authentic Expression & Spiritual Truth',
    desc: 'Purifies cognitive static, encouraging clear self-expression and intuitive vocal truth.'
  },
  {
    id: 'thirdeye',
    name: 'Third Eye (Ajna)',
    freq: 852,
    freqLabel: '852 Hz',
    color: '#3742fa',
    image: '/assets/third_eye_chakra.jpg',
    element: 'Indigo Cosmic Galaxy',
    intent: 'Higher Awareness & Cosmic Vision',
    desc: 'Returns the mind to divine order, heightening intuition and spiritual perception.'
  },
  {
    id: 'crown',
    name: 'Crown Chakra (Sahasrara)',
    freq: 963,
    freqLabel: '963 Hz',
    color: '#70a1ff',
    image: '/assets/crown_chakra.jpg',
    element: 'Supernova Prism Lotus',
    intent: 'Divine Consciousness & Oneness',
    desc: 'Encodes 963Hz pure Solfeggio tone to reconnect your biofield with universal source light.'
  }
];

const ChakraVideoVisualizer = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(2); // Default to Solar Plexus (528Hz)
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [binauralTheta, setBinauralTheta] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsMinimized, setControlsMinimized] = useState(false);

  const activeChakra = CHAKRA_VIDEOS[currentIndex];

  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const binauralOscRef = useRef(null);
  const gainNodeRef = useRef(null);
  const canvasRef = useRef(null);

  // Web Audio Context Initialization
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const startAudioResonance = () => {
    initAudio();
    stopAudioResonance();

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // Primary Sine Oscillator matching Chakra Solfeggio Frequency
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(activeChakra.freq, now);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(activeChakra.freq * 2.2, now);

    osc.connect(filter);
    filter.connect(masterGain);
    osc.start();
    oscRef.current = osc;

    // Binaural Theta Layer (6Hz Offset)
    if (binauralTheta) {
      const bOsc = ctx.createOscillator();
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(activeChakra.freq + 6, now);

      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(volume * 0.35, now);

      bOsc.connect(bGain);
      bGain.connect(ctx.destination);
      bOsc.start();
      binauralOscRef.current = bOsc;
    }

    setIsPlaying(true);
    toast.success(`Resonating ${activeChakra.name} @ ${activeChakra.freqLabel}`);
  };

  const stopAudioResonance = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch {}
      oscRef.current = null;
    }
    if (binauralOscRef.current) {
      try { binauralOscRef.current.stop(); } catch {}
      binauralOscRef.current = null;
    }
    setIsPlaying(false);
  };

  // Update volume in real-time
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Handle active chakra change during play
  useEffect(() => {
    if (isPlaying) {
      startAudioResonance();
    }
  }, [currentIndex, binauralTheta]);

  // 60FPS Canvas Energy Wave Overlay Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let angle = 0;

    const render = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 600;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : 350;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        angle += 0.03;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.6 + Math.sin(angle) * 15;

        // Draw Pulsating Aura Wave Ring
        ctx.strokeStyle = activeChakra.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, activeChakra]);

  useEffect(() => {
    return () => {
      stopAudioResonance();
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10050,
        background: 'rgba(5, 5, 12, 0.94)',
        backdropFilter: 'blur(30px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? 0 : '1.5rem'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: isFullscreen ? '100vw' : '850px',
        height: isFullscreen ? '100vh' : 'auto',
        maxHeight: isFullscreen ? '100vh' : '90vh',
        background: 'rgba(12, 14, 28, 0.96)',
        border: isFullscreen ? 'none' : '2px solid var(--accent-gold)',
        borderRadius: isFullscreen ? 0 : '24px',
        padding: isFullscreen ? '2rem' : '1.75rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        position: 'relative',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: activeChakra.color, letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              ✦ 8K Solfeggio Video &amp; Sound Engine ✦
            </span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', margin: 0, color: activeChakra.color }}>
              {activeChakra.name}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Maximize2 size={18} />
            </button>

            <button
              onClick={() => { stopAudioResonance(); onClose(); }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Real-Video Graphic Display Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: isFullscreen ? '60vh' : '360px',
          borderRadius: '20px',
          overflow: 'hidden',
          border: `2px solid ${activeChakra.color}`,
          marginBottom: '1.25rem',
          boxShadow: `0 0 40px ${activeChakra.color}33`
        }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={activeChakra.id}
              src={activeChakra.image}
              alt={activeChakra.name}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1.0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </AnimatePresence>

          {/* 60FPS Energy Overlay Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none'
            }}
          />

          {/* Controls Badge Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            background: 'rgba(5, 5, 15, 0.85)',
            backdropFilter: 'blur(15px)',
            borderRadius: '14px',
            padding: '0.85rem 1rem',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: activeChakra.color }}>
                {activeChakra.freqLabel} — {activeChakra.intent}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                Element: {activeChakra.element}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setControlsMinimized(!controlsMinimized)}
                title={controlsMinimized ? "Restore Controls" : "Minimize Controls"}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '0.55rem 0.85rem',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {controlsMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {controlsMinimized ? 'Restore Controls' : 'Hide Controls'}
              </button>

              <button
                onClick={isPlaying ? stopAudioResonance : startAudioResonance}
                className="btn-primary"
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '30px',
                  background: isPlaying ? '#ff4757' : `linear-gradient(135deg, ${activeChakra.color}, #000)`,
                  border: 'none',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause Audio' : 'Play 8K Resonance'}
              </button>
            </div>
          </div>
        </div>

        {/* Minimizable Bottom Controls (Carousel & Volume Sliders) */}
        {!controlsMinimized ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* 7-Chakra Navigation Carousel Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                onClick={() => setCurrentIndex((currentIndex - 1 + CHAKRA_VIDEOS.length) % CHAKRA_VIDEOS.length)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
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
                <ChevronLeft size={20} />
              </button>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
            {CHAKRA_VIDEOS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setCurrentIndex(i)}
                style={{
                  padding: '0.65rem 0.25rem',
                  borderRadius: '12px',
                  border: currentIndex === i ? `2px solid ${c.color}` : '1px solid rgba(255,255,255,0.1)',
                  background: currentIndex === i ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: c.color }}>{c.freqLabel}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.name.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((currentIndex + 1) % CHAKRA_VIDEOS.length)}
            style={{
              background: 'rgba(255,255,255,0.06)',
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
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Audio Layers & Volume Sliders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '14px' }}>
          <button
            onClick={() => setBinauralTheta(!binauralTheta)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: binauralTheta ? 'rgba(80, 227, 194, 0.15)' : 'transparent',
              color: binauralTheta ? '#50e3c2' : 'rgba(255,255,255,0.6)',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Disc size={16} /> 6Hz Theta Waves: {binauralTheta ? 'ON' : 'OFF'}
          </button>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <VolumeX size={16} color="rgba(255,255,255,0.5)" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: activeChakra.color, cursor: 'pointer' }}
            />
          </div>
        </div>
        </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default ChakraVideoVisualizer;
