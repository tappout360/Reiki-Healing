import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Volume2, VolumeX, ShieldCheck, Heart, Sparkles, Check, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SacredWaitingRoom = ({ session, user, onConsentAcknowledged }) => {
  const [intention, setIntention] = useState('');
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [dronePlaying, setDronePlaying] = useState(false);
  const [avTested, setAvTested] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef(null);
  const audioCtxRef = useRef(null);
  const droneOscRef = useRef(null);

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
        osc.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz Miracle Tone

        gain.gain.setValueAtTime(0.08, ctx.currentTime); // Gentle low volume

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        droneOscRef.current = osc;
        setDronePlaying(true);
        toast.success('528Hz Ambient Drone Activated');
      } catch (err) {
        console.warn('Audio playback failed:', err);
      }
    }
  };

  // Test Camera & Microphone
  const testAvDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setAvTested(true);
        toast.success('Camera & Microphone Verified!');
      }
    } catch {
      toast.error('Device access denied. You can still join the session.');
    }
  };

  const handleEnterSession = async () => {
    if (!disclaimerChecked) {
      toast.error('Please acknowledge the wellness disclaimer to enter.');
      return;
    }

    setSubmitting(true);

    // Stop drone and camera test
    if (droneOscRef.current) {
      try { droneOscRef.current.stop(); } catch {}
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }

    const consentData = {
      bookingId: session?.bookingId || session?.id || `bk_${Date.now()}`,
      clientEmail: user?.email || session?.customerEmail || 'seeker@reikiandsage.com',
      disclaimerVersion: '2.1',
      intentionText: intention.trim(),
      consentTimestamp: new Date().toISOString()
    };

    // Log consent record to MongoDB / API
    try {
      await fetch('/api/db/session-consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData)
      }).catch(() => {});
    } catch (e) {
      console.warn('Consent logging network notice:', e);
    }

    toast.success('Entering Sacred Healing Sanctuary...');
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
    };
  }, []);

  return (
    <div style={{
      width: '100%',
      maxWidth: '700px',
      margin: '0 auto',
      background: 'rgba(10, 10, 20, 0.95)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '24px',
      padding: '2rem',
      color: '#fff',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
      textAlign: 'center',
      position: 'relative'
    }}>
      {/* Sound Toggle */}
      <button
        onClick={toggleDroneAudio}
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          background: dronePlaying ? 'rgba(80, 227, 194, 0.2)' : 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: dronePlaying ? '#50e3c2' : 'rgba(255,255,255,0.7)',
          padding: '6px 12px',
          borderRadius: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem'
        }}
      >
        {dronePlaying ? <Volume2 size={14} /> : <VolumeX size={14} />} 528Hz Drone: {dronePlaying ? 'ON' : 'OFF'}
      </button>

      {/* Header */}
      <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
        ✦ Sacred Sanctuary Pre-Join ✦
      </span>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', margin: '0.5rem 0 0.25rem', color: 'var(--accent-gold)' }}>
        {session?.serviceType === 'live' ? 'Live Video Energy Healing Session' : 'Rose Quartz Resonance Session'}
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
        Carissa Bright (Master Healer) will admit you into the live resonance room shortly.
      </p>

      {/* Camera / Device Preview */}
      <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(0,0,0,0.5)', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: avTested ? 'block' : 'none' }}
        />
        {!avTested && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
            <button
              onClick={testAvDevices}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Camera size={14} /> Test Camera & Microphone
            </button>
          </div>
        )}
      </div>

      {/* Intention-Setting Field */}
      <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          🕯️ Intention Setting (Optional)
        </label>
        <textarea
          rows="2"
          placeholder="What do you wish to release, balance, or receive during today's session?"
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: '0.85rem',
            resize: 'none'
          }}
        />
      </div>

      {/* Compliance & Consent Gate */}
      <div style={{
        textAlign: 'left',
        background: 'rgba(0,184,148,0.05)',
        border: '1px solid rgba(0,184,148,0.25)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <input
            id="sacred-disclaimer-checkbox"
            type="checkbox"
            checked={disclaimerChecked}
            onChange={(e) => setDisclaimerChecked(e.target.checked)}
            style={{ marginTop: '3px', cursor: 'pointer', width: '16px', height: '16px' }}
          />
          <label htmlFor="sacred-disclaimer-checkbox" style={{ fontSize: '0.75rem', color: '#a8d8a8', cursor: 'pointer', lineHeight: '1.4' }}>
            <strong>Informed Wellness Consent & Scope Disclaimer:</strong> I acknowledge that Reiki & Sage provides spiritual energy balancing and mindfulness practices. Sessions are non-medical, complementary, and do not diagnose, treat, or replace professional medical or mental health care. No Protected Health Information (PHI) is collected or stored in compliance with privacy regulations.
          </label>
        </div>
      </div>

      {/* Enter Action */}
      <button
        onClick={handleEnterSession}
        disabled={!disclaimerChecked || submitting}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '0.9rem',
          borderRadius: '30px',
          background: disclaimerChecked ? 'linear-gradient(135deg, var(--accent-gold), #b8860b)' : 'rgba(255,255,255,0.1)',
          border: 'none',
          color: disclaimerChecked ? '#000' : 'rgba(255,255,255,0.4)',
          fontWeight: 'bold',
          fontSize: '1rem',
          cursor: disclaimerChecked ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <ShieldCheck size={20} /> {submitting ? 'Entering Sanctuary...' : 'I Understand & Enter Sacred Space'}
      </button>
    </div>
  );
};

export default SacredWaitingRoom;
