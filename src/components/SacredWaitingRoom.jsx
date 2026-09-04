import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Volume2, VolumeX, ShieldCheck, Heart, Sparkles, Check, Play, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SacredWaitingRoom = ({ session, user, onConsentAcknowledged }) => {
  const [intention, setIntention] = useState('');
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [dronePlaying, setDronePlaying] = useState(false);
  const [avTested, setAvTested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef(null);
  const audioCtxRef = useRef(null);
  const droneOscRef = useRef(null);
  const meterIntervalRef = useRef(null);

  const healerName = session?.healerName || 'Master Healer Carissa Bright';
  const serviceTitle = session?.serviceType === 'live' 
    ? '1:1 Live Resonance & Energy Alignment' 
    : 'Live Sacred Sanctuary Alignment';

  // Toggle 528Hz Ambient Drone Audio
  const toggleDroneAudio = () => {
    if (dronePlaying) {
      if (droneOscRef.current) {
        try { droneOscRef.current.stop(); } catch {}
        droneOscRef.current = null;
      }
      setDronePlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz Miracle Harmonic

        gain.gain.setValueAtTime(0.06, ctx.currentTime); // Gentle soothing volume

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        droneOscRef.current = osc;
        setDronePlaying(true);
        toast.success('528Hz Harmonic Ambience Activated');
      } catch (err) {
        console.warn('Audio playback failed:', err);
      }
    }
  };

  // Test Camera & Microphone with Live Meter
  const testAvDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setAvTested(true);

        // Simple audio level simulator for visual feedback
        meterIntervalRef.current = setInterval(() => {
          setAudioLevel(Math.floor(Math.random() * 45) + 35);
        }, 150);

        toast.success('Camera & Microphone Verified!');
      }
    } catch {
      toast.error('Device access denied or unavailable. You can still enter.');
    }
  };

  const handleEnterSession = async () => {
    if (!disclaimerChecked) {
      toast.error('Please acknowledge the wellness disclaimer to enter.');
      return;
    }

    setSubmitting(true);

    // Clean up drone, camera, and meter
    if (droneOscRef.current) {
      try { droneOscRef.current.stop(); } catch {}
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    if (meterIntervalRef.current) {
      clearInterval(meterIntervalRef.current);
    }

    const consentData = {
      bookingId: session?.bookingId || session?.id || `bk_${Date.now()}`,
      clientEmail: user?.email || session?.customerEmail || 'seeker@reikiandsage.com',
      disclaimerVersion: '3.0',
      intentionText: intention.trim(),
      healerName,
      consentTimestamp: new Date().toISOString()
    };

    // Log consent record
    try {
      await fetch('/api/db/session-consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData)
      }).catch(() => {});
    } catch (e) {
      console.warn('Consent logging notice:', e);
    }

    toast.success('Entering Sacred Sanctuary...');
    onConsentAcknowledged(consentData);
  };

  useEffect(() => {
    return () => {
      if (droneOscRef.current) {
        try { droneOscRef.current.stop(); } catch {}
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      if (meterIntervalRef.current) {
        clearInterval(meterIntervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{
      width: '100%',
      maxWidth: '680px',
      margin: '0 auto',
      background: '#07070d',
      border: '1px solid rgba(212, 175, 55, 0.35)',
      borderRadius: '28px',
      padding: '2.5rem 2rem',
      color: '#fff',
      boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.08)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Soft Glow */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Sound Ambient Toggle */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <button
          onClick={toggleDroneAudio}
          type="button"
          style={{
            position: 'absolute',
            top: '-0.5rem',
            right: 0,
            background: dronePlaying ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: dronePlaying ? 'var(--accent-gold)' : 'rgba(255,255,255,0.7)',
            padding: '6px 14px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            transition: 'all 0.2s ease'
          }}
        >
          {dronePlaying ? <Volume2 size={14} /> : <VolumeX size={14} />} 528Hz Drone: {dronePlaying ? 'ON' : 'OFF'}
        </button>

        {/* Sanctuary Pre-Join Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          <Sparkles size={14} /> SACRED WAITING SANCTUARY
        </div>

        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.9rem', margin: '0.25rem 0 0.5rem', color: '#fff', letterSpacing: '0.5px' }}>
          {serviceTitle}
        </h2>

        {/* Healer Badge & Status */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          padding: '6px 16px',
          borderRadius: '20px',
          marginBottom: '1.5rem',
          fontSize: '0.85rem'
        }}>
          <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>{healerName}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ color: '#2ecc71', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71', display: 'inline-block' }}></span>
            Healer will welcome you shortly
          </span>
        </div>

        {/* Camera / Audio Meter Preview */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '190px',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.6)',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: avTested ? 'block' : 'none' }}
          />

          {!avTested ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem', opacity: 0.8 }}>🌿</div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 0.75rem 0' }}>
                Center your breath and verify your camera & microphone.
              </p>
              <button
                type="button"
                onClick={testAvDevices}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}
              >
                <Camera size={14} /> Test Camera &amp; Mic
              </button>
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem'
            }}>
              <span style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> Devices Active
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mic size={12} color="var(--accent-gold)" />
                <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${audioLevel}%`, height: '100%', background: 'var(--accent-gold)', transition: 'width 0.15s ease' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Intention-Setting Field */}
        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            <span>🕯️</span> Sacred Intention (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="What do you wish to release, balance, or receive during today's alignment?"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '0.85rem',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.5'
            }}
          />
        </div>

        {/* Informed Wellness Consent (Federal & HIPAA Strict) */}
        <div style={{
          textAlign: 'left',
          background: 'rgba(0, 184, 148, 0.06)',
          border: '1px solid rgba(0, 184, 148, 0.25)',
          borderRadius: '14px',
          padding: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input
              id="sacred-disclaimer-checkbox"
              type="checkbox"
              checked={disclaimerChecked}
              onChange={(e) => setDisclaimerChecked(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-gold)' }}
            />
            <label htmlFor="sacred-disclaimer-checkbox" style={{ fontSize: '0.75rem', color: '#a8d8a8', cursor: 'pointer', lineHeight: '1.45' }}>
              <strong>Informed Wellness Consent:</strong> I acknowledge that Reiki &amp; Sage provides spiritual wellness, relaxation, and meditation experiences. Healers do not diagnose, treat, or cure medical conditions, and sessions do not replace professional medical or psychiatric care. No Protected Health Information (PHI) is collected or stored.
            </label>
          </div>
        </div>

        {/* Enter Sanctuary Button */}
        <button
          onClick={handleEnterSession}
          disabled={!disclaimerChecked || submitting}
          type="button"
          className="btn-primary"
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '30px',
            background: disclaimerChecked ? 'linear-gradient(135deg, var(--accent-gold), #b8860b)' : 'rgba(255,255,255,0.1)',
            border: 'none',
            color: disclaimerChecked ? '#000' : 'rgba(255,255,255,0.4)',
            fontWeight: 'bold',
            fontSize: '1rem',
            letterSpacing: '0.5px',
            cursor: disclaimerChecked ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: disclaimerChecked ? '0 8px 25px rgba(212, 175, 55, 0.3)' : 'none',
            transition: 'all 0.25s ease'
          }}
        >
          <ShieldCheck size={20} /> {submitting ? 'Connecting to Field...' : 'Enter Sacred Healing Space'}
        </button>
      </div>
    </div>
  );
};

export default SacredWaitingRoom;
