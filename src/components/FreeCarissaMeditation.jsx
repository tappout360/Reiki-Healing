import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Sparkles, Heart, Award, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * FreeCarissaMeditation — Free Home Screen Guided Meditation Player
 * Featuring Master Healer Carissa Bright's voice & 528Hz Solfeggio ambience.
 * Open & Free for ALL visitors and Free Tier users.
 */
const FreeCarissaMeditation = ({ onOpenSubscription, onOpenGuidedMeditation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  const toggleMeditation = () => {
    if (onOpenGuidedMeditation) {
      onOpenGuidedMeditation();
      return;
    }
    if (isPlaying) {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch {}
        oscRef.current = null;
      }
      setIsPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime);
        gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
      } catch {}

      setIsPlaying(true);
      toast.success('🧘 Carissa’s Free 5-Minute Guided Meditation Active');
    }
  };

  return (
    <div className="glass" style={{
      width: '100%',
      maxWidth: '1100px',
      margin: '2rem auto',
      padding: '2rem',
      borderRadius: '24px',
      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(80, 227, 194, 0.08), rgba(12, 14, 28, 0.95))',
      border: '2px solid var(--accent-gold)',
      boxShadow: '0 15px 45px rgba(212, 175, 55, 0.25)',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
        {/* Left Column: Media Preview */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
          <img
            src="/assets/heart_chakra.jpg"
            alt="Carissa Bright Guided Meditation"
            style={{ width: '100%', height: '220px', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 90%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMeditation}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: isPlaying ? '#ff4757' : 'var(--accent-gold)',
                border: 'none',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 25px var(--accent-gold)'
              }}
            >
              {isPlaying ? <Pause size={28} color="#fff" /> : <Play size={28} color="#000" style={{ marginLeft: '4px' }} />}
            </motion.button>
          </div>
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', color: '#50e3c2', fontWeight: 'bold', border: '1px solid #50e3c2' }}>
            ✦ FREE FOR ALL SEEKERS ✦
          </div>
        </div>

        {/* Right Column: Information & Controls */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            ✦ Free Daily Sacred Alignment ✦
          </div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', margin: '0 0 0.5rem 0', color: '#fff' }}>
            5-Minute Grounding &amp; Heart Alignment
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#50e3c2', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            Guided by Master Healer Carissa Bright • 528Hz Solfeggio Tone
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            Experience Master Healer Carissa Bright's signature voice grounding transmission paired with organic 528Hz Solfeggio acoustic resonance. Completely free for all visitors.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={toggleMeditation}
              className="btn-primary"
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? 'Pause Free Guided Session' : 'Play Free Guided Session'}
            </button>

            {onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.9)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '30px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✨ View Seeker Tiers ($11/mo)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeCarissaMeditation;
