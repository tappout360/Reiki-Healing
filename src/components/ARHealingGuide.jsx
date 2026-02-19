import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Hand, Info, Sparkles, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './ARHealingGuide.css';

const ARHealingGuide = ({ onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [activeChakra, setActiveChakra] = useState('Heart');
  const [alignmentScore, setAlignmentScore] = useState(0);

  const chakras = [
    { name: 'Crown', color: '#8c7ae6', y: '15%' },
    { name: 'Third Eye', color: '#4834d4', y: '25%' },
    { name: 'Throat', color: '#00a8ff', y: '35%' },
    { name: 'Heart', color: '#4cd137', y: '45%' },
    { name: 'Solar Plexus', color: '#fbc531', y: '55%' },
    { name: 'Sacral', color: '#e67e22', y: '65%' },
    { name: 'Root', color: '#e84118', y: '75%' },
  ];

  useEffect(() => {
    async function setupCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: false 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        toast.error("Camera access is required for the AR experience.");
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Mock alignment logic
  useEffect(() => {
    const interval = setInterval(() => {
      setAlignmentScore(prev => {
        const target = Math.random() > 0.3 ? 95 : 40;
        return prev + (target - prev) * 0.1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentChakra = chakras.find(c => c.name === activeChakra);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="ar-guide-overlay"
    >
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="ar-guide-video"
      />

      {/* AR Overlays */}
      <div className="ar-guide-ar-layer">
        
        {/* Ghost Hands Overlay */}
        <AnimatePresence>
          <motion.div
            key={activeChakra}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="ar-guide-hands"
            style={{ top: currentChakra.y }}
          >
            <motion.div
              animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Hand size={120} color={currentChakra.color} strokeWidth={1} className="ar-guide-hand-icon" style={{ filter: `drop-shadow(0 0 20px ${currentChakra.color})` }} />
            </motion.div>
            <motion.div
               animate={{ x: [10, -10, 10], y: [5, -5, 5] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Hand size={120} color={currentChakra.color} strokeWidth={1} className="ar-guide-hand-icon" style={{ filter: `drop-shadow(0 0 20px ${currentChakra.color})`, transform: 'scaleX(-1)' }} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Pulse Target */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="ar-guide-pulse-ring"
          style={{ top: currentChakra.y, borderColor: currentChakra.color }}
        />
      </div>

      {/* UI Controls */}
      <div className="ar-guide-header">
        <div className="ar-guide-header-left">
          <div className="ar-guide-label">
            <Sparkles className="ar-guide-label-icon" size={20} />
            <span className="ar-guide-label-text">AR HEALING GUIDE</span>
          </div>
          <h2 className="ar-guide-title">Align with {activeChakra}</h2>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px', letterSpacing: '1px' }}>👑 Attain Level 100 for Master</div>
          
          <div className="ar-guide-chakra-list">
            {chakras.map(c => (
              <button
                key={c.name}
                onClick={() => setActiveChakra(c.name)}
                className={`ar-guide-chakra-pill ${
                  activeChakra === c.name 
                  ? 'ar-guide-chakra-pill--active' 
                  : 'ar-guide-chakra-pill--inactive'
                }`}
              >
                {c.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="ar-guide-close-btn">
          <X size={24} />
        </button>
      </div>

      {/* Bottom Status Bar */}
      <div className="ar-guide-bottom-bar">
        <div className="ar-guide-status-card">
          <div className="ar-guide-gauge">
            <svg>
              <circle
                cx="32" cy="32" r="28"
                className="ar-guide-gauge-bg"
              />
              <motion.circle
                cx="32" cy="32" r="28"
                className="ar-guide-gauge-fill"
                stroke={currentChakra.color}
                strokeDasharray={175.9}
                animate={{ strokeDashoffset: 175.9 - (175.9 * alignmentScore) / 100 }}
              />
            </svg>
            <span className="ar-guide-gauge-value">{Math.round(alignmentScore)}%</span>
          </div>
          <div>
            <div className="ar-guide-resonance-label">Resonance Match</div>
            <div className="ar-guide-resonance-status">
              {alignmentScore > 90 ? 'Perfect Alignment' : alignmentScore > 70 ? 'Strong Connection' : 'Seeking Frequency...'}
            </div>
          </div>
        </div>

        <div className="ar-guide-actions">
           <div className="ar-guide-bio-badge">
              <Activity size={20} className="ar-guide-bio-icon" />
              <div className="ar-guide-bio-text">BIO-FEEDBACK ACTIVE</div>
           </div>
           <button 
             className="ar-guide-complete-btn"
             onClick={() => toast.success("Hand positions calibrated. Session data logged.")}
           >
             COMPLETE PLACEMENT
           </button>
        </div>
      </div>

      {/* Info Tip */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2 }}
        className="ar-guide-tip"
      >
        <Info size={14} className="ar-guide-tip-icon" />
        <span className="ar-guide-tip-text">Place your physical hands over the glowing "ghost hands" to begin.</span>
      </motion.div>
    </motion.div>
  );
};

export default ARHealingGuide;
