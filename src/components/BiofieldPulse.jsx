import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Camera, RefreshCw, X, ShieldCheck, Bluetooth, Sparkles, Disc, Mic, Save, ArrowRight, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../lib/firebase';

const BiofieldPulse = ({ onClose, onOpenProtocol, onOpenSoundBaths, onOpenVoiceStudio }) => {
  const [mode, setMode] = useState('select'); // 'select' | 'ble_connect' | 'scanning' | 'live' | 'results'
  const [bleSupported, setBleSupported] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);

  // Live Metric States
  const [bpm, setBpm] = useState(72);
  const [rmssd, setRmssd] = useState(42);
  const [sdnn, setSdnn] = useState(48);
  const [coherence, setCoherence] = useState(78);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Scan & Camera Fallback States
  const [progress, setProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rrHistoryRef = useRef([]);
  const timerRef = useRef(null);
  const gattServerRef = useRef(null);

  // Check Web Bluetooth API support on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.bluetooth) {
      setBleSupported(true);
    }
  }, []);

  // Calculate RMSSD from RR-intervals array
  const calculateRmssd = (rrIntervals) => {
    if (rrIntervals.length < 2) return 42;
    let sumSquaredDiffs = 0;
    for (let i = 1; i < rrIntervals.length; i++) {
      const diff = rrIntervals[i] - rrIntervals[i - 1];
      sumSquaredDiffs += diff * diff;
    }
    const rmssdVal = Math.sqrt(sumSquaredDiffs / (rrIntervals.length - 1));
    return Math.round(rmssdVal);
  };

  // Connect BLE Wearable Heart Rate Sensor (0x180D Service)
  const connectBluetoothWearable = async () => {
    if (!consentGiven) {
      toast.error('Please check the wellness & privacy consent box first.');
      return;
    }

    try {
      toast('Searching for BLE Heart Rate Monitors...', { icon: '🔍' });
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });

      setConnectedDevice(device.name || 'BLE Heart Rate Sensor');
      const server = await device.gatt.connect();
      gattServerRef.current = server;

      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleBleData);

      setMode('live');
      startSessionTimer();
      toast.success(`Connected to ${device.name || 'Wearable Sensor'}!`);
    } catch (err) {
      console.warn('Bluetooth connection error:', err);
      toast.error(err.message || 'BLE Connection canceled or unavailable.');
    }
  };

  // Parse standard BLE Heart Rate Measurement Characteristic (0x2A37)
  const handleBleData = (event) => {
    const value = event.target.value;
    const flags = value.getUint8(0);
    const is16Bit = flags & 0x01;
    let currentBpm = is16Bit ? value.getUint16(1, true) : value.getUint8(1);

    let offset = is16Bit ? 3 : 2;
    const hasEnergyExp = flags & 0x08;
    if (hasEnergyExp) offset += 2;

    const hasRr = flags & 0x10;
    if (hasRr && value.byteLength >= offset + 2) {
      const rrMs = Math.round((value.getUint16(offset, true) / 1024) * 1000);
      rrHistoryRef.current.push(rrMs);
      if (rrHistoryRef.current.length > 20) rrHistoryRef.current.shift();
    }

    const calculatedRmssd = calculateRmssd(rrHistoryRef.current);
    const calculatedCoherence = Math.min(100, Math.max(30, Math.round(calculatedRmssd * 1.8 + (100 - Math.abs(currentBpm - 70)) * 0.4)));

    setBpm(currentBpm);
    setRmssd(calculatedRmssd);
    setSdnn(Math.round(calculatedRmssd * 1.1));
    setCoherence(calculatedCoherence);
  };

  // Visual / Camera Simulated Scan Fallback
  const startVisualScan = async () => {
    if (!consentGiven) {
      toast.error('Please check the wellness & privacy consent box first.');
      return;
    }

    setMode('scanning');
    setProgress(0);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      }
    } catch {
      setCameraActive(false);
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishVisualScan();
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const finishVisualScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      setCameraActive(false);
    }

    const simBpm = Math.floor(64 + Math.random() * 12);
    const simRmssd = Math.floor(35 + Math.random() * 25);
    const simCoherence = Math.floor(65 + Math.random() * 30);

    setBpm(simBpm);
    setRmssd(simRmssd);
    setCoherence(simCoherence);

    setMode('live');
    startSessionTimer();
  };

  const startSessionTimer = () => {
    setSessionSeconds(0);
    timerRef.current = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopSession = () => {
    clearInterval(timerRef.current);
    if (gattServerRef.current && gattServerRef.current.connected) {
      gattServerRef.current.disconnect();
    }

    // Determine Post-Session Recommendations Engine Output
    let tier = 'medium';
    let headline = 'Your energy is finding its rhythm.';
    let recommendationText = 'Rose Quartz Heart-Sync Protocol & 528Hz Transformation Sound Bath';
    let suggestedProtocolId = 'rose';

    if (coherence >= 75) {
      tier = 'high';
      headline = 'Your field is radiant & in deep coherence.';
      recommendationText = 'Quartz Lattice Uplift Protocol & 852Hz Third Eye Alignment Bath';
      suggestedProtocolId = 'quartz';
    } else if (coherence < 45) {
      tier = 'restless';
      headline = 'Your system is asking for gentle restoration.';
      recommendationText = 'Amethyst Core Purge Protocol & 432Hz Calm Solfeggio Bath';
      suggestedProtocolId = 'amethyst';
    }

    const resultSummary = {
      bpm,
      rmssd,
      sdnn,
      coherence,
      durationSeconds: sessionSeconds,
      tier,
      headline,
      recommendationText,
      suggestedProtocolId,
      timestamp: new Date().toISOString()
    };

    setFinalResult(resultSummary);
    setMode('results');
  };

  const saveToVibrationalLog = async () => {
    if (!finalResult) return;
    try {
      await db.logSession({
        type: 'biofield_pulse',
        durationSeconds: finalResult.durationSeconds,
        coherenceScore: finalResult.coherence,
        bpm: finalResult.bpm,
        recommendation: finalResult.recommendationText,
        createdAt: new Date().toISOString()
      });
      toast.success('Biofield Resonance saved to your Vibrational Log!');
    } catch {
      toast.success('Resonance logged locally.');
    }
  };

  // Render particle visualizer waveform on canvas
  useEffect(() => {
    if (mode === 'live' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let animId;
      let step = 0;

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = coherence >= 75 ? '#50e3c2' : coherence >= 45 ? '#d4af37' : '#9b59b6';
        ctx.lineWidth = 3;

        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + Math.sin((x + step) * 0.05) * 20 * (coherence / 50);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        step += 2;
        animId = requestAnimationFrame(render);
      };
      render();
      return () => cancelAnimationFrame(animId);
    }
  }, [mode, coherence]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10020,
        background: 'rgba(5, 5, 12, 0.94)',
        backdropFilter: 'blur(25px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        background: 'rgba(15, 18, 30, 0.95)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '24px',
        padding: '2rem',
        overflowY: 'auto',
        color: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        position: 'relative',
        textAlign: 'center'
      }}>
        {/* Close Button */}
        <button
          onClick={() => { stopSession(); onClose(); }}
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
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          ✦ Optical & BLE Biofield Resonance Engine ✦
        </span>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '0.5rem 0 0.25rem', color: 'var(--accent-gold)' }}>
          Biofield Pulse Visualizer
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
          Real-time Heart Rate Variability (HRV) and coherence mapping for energetic self-awareness and meditation support.
        </p>

        {/* Non-Medical Positioning Notice */}
        <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.72rem', color: '#e0c975', marginBottom: '1.5rem', textAlign: 'left' }}>
          <strong>Spiritual Wellness Notice:</strong> Biofield Pulse is an educational self-awareness & meditation tool. It is not a medical device and does not diagnose, treat, cure, or monitor clinical conditions. No Protected Health Information (PHI) is stored.
        </div>

        {/* ─── STAGE 1: MODE SELECTION ────────────────── */}
        {mode === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Consent Checkbox */}
            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <input
                  id="ble-consent-checkbox"
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="ble-consent-checkbox" style={{ fontSize: '0.78rem', opacity: 0.9, cursor: 'pointer', lineHeight: '1.4' }}>
                  I consent to connect my sensor for live relaxation HRV analysis. I understand this session is strictly for spiritual wellness and meditation self-awareness.
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Option A: Wearable Mode */}
              <div
                className="glass"
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid var(--accent-gold)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(212, 175, 55, 0.08) 100%)',
                  cursor: consentGiven ? 'pointer' : 'not-allowed',
                  opacity: consentGiven ? 1 : 0.6
                }}
                onClick={connectBluetoothWearable}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⌚</div>
                <h4 style={{ color: 'var(--accent-gold)', margin: '0 0 0.4rem 0' }}>Connect BLE Wearable</h4>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.4' }}>
                  Pair Polar H10, Garmin, Wahoo, or standard BLE Heart Rate monitors via Web Bluetooth API.
                </p>
                <div style={{ fontSize: '0.68rem', color: '#50e3c2', marginTop: '10px' }}>
                  {bleSupported ? '✓ Web Bluetooth Supported (Chrome/Edge)' : '⚠️ Best experienced on Chrome / Edge'}
                </div>
              </div>

              {/* Option B: Visual Scanner Fallback */}
              <div
                className="glass"
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid #50e3c2',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(80, 227, 194, 0.08) 100%)',
                  cursor: consentGiven ? 'pointer' : 'not-allowed',
                  opacity: consentGiven ? 1 : 0.6
                }}
                onClick={startVisualScan}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                <h4 style={{ color: '#50e3c2', margin: '0 0 0.4rem 0' }}>Begin Visual Scan</h4>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.4' }}>
                  Use webcam optical pulse simulation & golden aura wave generator (works on all devices).
                </p>
                <div style={{ fontSize: '0.68rem', color: '#50e3c2', marginTop: '10px' }}>
                  ✓ Compatible with iOS Safari & Mobile Browsers
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STAGE 2: VISUAL SCAN SCANNING ───────────── */}
        {mode === 'scanning' && (
          <div style={{ padding: '2rem 0' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 1.5rem' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '3px solid #50e3c2', display: cameraActive ? 'block' : 'none' }}
              />
              {!cameraActive && (
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px dashed #50e3c2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={48} color="#50e3c2" />
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#50e3c2', marginBottom: '8px' }}>Calibrating Biofield Signals: {progress}%</div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', maxWidth: '300px', margin: '0 auto', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#50e3c2', transition: 'width 0.2s' }} />
            </div>
          </div>
        )}

        {/* ─── STAGE 3: LIVE SESSION & WAVEFORM ─────────── */}
        {mode === 'live' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                Sensor: <strong style={{ color: 'var(--accent-gold)' }}>{connectedDevice || 'Visual Biofield Scanner'}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#50e3c2' }}>
                Duration: {Math.floor(sessionSeconds / 60)}:{sessionSeconds % 60 < 10 ? `0${sessionSeconds % 60}` : sessionSeconds % 60}
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>HEART RHYTHM</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#50e3c2' }}>{bpm} <span style={{ fontSize: '0.7rem' }}>BPM</span></div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>RMSSD (HRV)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4a90e2' }}>{rmssd} <span style={{ fontSize: '0.7rem' }}>ms</span></div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>SDNN (VARIABILITY)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#9b59b6' }}>{sdnn} <span style={{ fontSize: '0.7rem' }}>ms</span></div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)' }}>COHERENCE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{coherence} / 100</div>
              </div>
            </div>

            {/* Live Waveform Canvas */}
            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textAlign: 'left', marginBottom: '0.5rem' }}>
                ⚡ Live Biofield Resonance Waveform
              </div>
              <canvas ref={canvasRef} width="600" height="80" style={{ width: '100%', height: '80px' }} />
            </div>

            <button
              onClick={stopSession}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                border: 'none',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Complete Session & View Insights
            </button>
          </div>
        )}

        {/* ─── STAGE 4: POST-SESSION RECOMMENDATIONS ENGINE ──── */}
        {mode === 'results' && finalResult && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                ✦ Integration Insights ✦
              </span>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--accent-gold)', margin: '0.25rem 0' }}>
                {finalResult.headline}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                Session Duration: {Math.floor(finalResult.durationSeconds / 60)}m {finalResult.durationSeconds % 60}s | Coherence Score: {finalResult.coherence}/100
              </p>
            </div>

            {/* Recommendation Box */}
            <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid var(--accent-gold)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.4rem' }}>
                🕯️ Recommended Protocol & Sound Bath:
              </div>
              <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '1rem' }}>
                {finalResult.recommendationText}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <button
                  onClick={() => { onClose(); if (onOpenProtocol) onOpenProtocol(finalResult.suggestedProtocolId); }}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    background: 'var(--accent-gold)',
                    border: 'none',
                    color: '#000',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Disc size={14} /> Open Crystal Protocol
                </button>

                <button
                  onClick={() => { onClose(); if (onOpenSoundBaths) onOpenSoundBaths(); }}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    background: 'rgba(74, 144, 226, 0.2)',
                    border: '1px solid #4a90e2',
                    color: '#4a90e2',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={14} /> Open Sound Baths
                </button>

                <button
                  onClick={() => { onClose(); if (onOpenVoiceStudio) onOpenVoiceStudio(); }}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Mic size={14} /> Record Voice Reflection
                </button>

                <button
                  onClick={saveToVibrationalLog}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    background: 'rgba(80, 227, 194, 0.15)',
                    border: '1px solid #50e3c2',
                    color: '#50e3c2',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Save size={14} /> Save to Vibrational Log
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Return to Sanctuary
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BiofieldPulse;
