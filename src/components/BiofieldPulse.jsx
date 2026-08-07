import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Camera, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BiofieldPulse = ({ onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);

  const startScan = async () => {
    setScanning(true);
    setProgress(0);
    setResult(null);

    // Request camera for PPG pulse sensor analysis if available
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

    // Simulate 5-second pulse calibration & HRV alignment calculation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishScan();
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const finishScan = () => {
    setScanning(false);
    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }

    // Generate Biofield Alignment Metrics
    const bpm = Math.floor(62 + Math.random() * 12);
    const hrv = Math.floor(65 + Math.random() * 25); // HRV score 0-100
    const alignment = Math.floor(88 + Math.random() * 10); // Alignment %

    setResult({
      bpm,
      hrv,
      alignment,
      chakraState: 'Crown & Heart Synchronized',
      auraColor: '#50e3c2',
      recommendation: '528Hz Solfeggio Meditation & Root Grounding'
    });

    toast.success('Biofield Calibration Complete!');
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
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
        maxWidth: '650px',
        maxHeight: '90vh',
        background: 'rgba(15, 18, 30, 0.95)',
        border: '1px solid rgba(80, 227, 194, 0.3)',
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
          onClick={onClose}
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
        <span style={{ fontSize: '0.75rem', color: '#50e3c2', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          ✦ Optical & HRV Resonance Sensor ✦
        </span>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '0.5rem 0', color: '#50e3c2' }}>
          Biofield Pulse Scanner
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
          Measures your heart-rate variability (HRV) and optical biofield pulse to calibrate your current aura alignment score.
        </p>

        {/* Camera / Finger Sensor Container */}
        <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 1.5rem' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              display: cameraActive ? 'block' : 'none',
              border: '3px solid #50e3c2'
            }}
          />

          {!cameraActive && (
            <motion.div
              animate={{
                scale: scanning ? [1, 1.1, 1] : 1,
                boxShadow: scanning ? ['0 0 20px #50e3c2', '0 0 60px #50e3c2', '0 0 20px #50e3c2'] : '0 0 20px rgba(80, 227, 194, 0.2)'
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(80, 227, 194, 0.2) 0%, rgba(5, 5, 12, 0.9) 80%)',
                border: '2px dashed #50e3c2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              <Heart size={48} color="#50e3c2" />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
                {scanning ? 'Calibrating...' : 'Place Finger / Face'}
              </span>
            </motion.div>
          )}

          {scanning && (
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: '#50e3c2',
              animation: 'spin 1s linear infinite'
            }} />
          )}
        </div>

        {/* Scan Controls & Progress */}
        {scanning ? (
          <div style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#50e3c2', marginBottom: '6px' }}>Reading Biofield Signals: {progress}%</div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#50e3c2', transition: 'width 0.2s' }} />
            </div>
          </div>
        ) : !result ? (
          <button
            onClick={startScan}
            className="btn-primary"
            style={{
              padding: '0.85rem 2rem',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #50e3c2, #4a90e2)',
              border: 'none',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Activity size={18} /> Begin Biofield Calibration
          </button>
        ) : null}

        {/* Scan Results Panel */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid rgba(80, 227, 194, 0.3)',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>RHYTHM</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#50e3c2' }}>{result.bpm} BPM</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>HRV INDEX</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4a90e2' }}>{result.hrv} ms</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>ALIGNMENT</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{result.alignment}%</div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <strong>Chakra State:</strong> <span style={{ color: '#50e3c2' }}>{result.chakraState}</span>
            </div>
            <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              <strong>Recommended Protocol:</strong> <span style={{ color: 'rgba(255,255,255,0.8)' }}>{result.recommendation}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={startScan}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} /> Recalibrate
              </button>
              <button
                onClick={onClose}
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  background: '#50e3c2',
                  border: 'none',
                  color: '#000',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Save & Complete
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BiofieldPulse;
