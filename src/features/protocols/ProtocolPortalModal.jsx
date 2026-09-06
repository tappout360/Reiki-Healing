import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Maximize, Minimize, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ProtocolPortalModal = ({
  protocol,
  videoIndex = 0,
  timeLeft = 600,
  isPaused = false,
  onTogglePause,
  onClose,
  volume = 50,
  onVolumeChange,
  binauralEnabled = false,
  onToggleBinaural,
  binauralCarrier = 432,
  onChangeBinauralCarrier,
  binauralBeat = 6,
  onChangeBinauralBeat,
  binauralVolume = 30,
  onChangeBinauralVolume,
  isPremiumUser = false,
  onUpgrade,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Error attempting to enable fullscreen:', err.message);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Error attempting to exit fullscreen:', err.message);
      });
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!protocol) return null;

  return (
    <div id="protocol-portal-root" className="healing-portal-overlay fade-in" style={{ zIndex: 10005 }}>
      <div className="portal-content">
        <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10, display: 'flex', gap: '1rem' }}>
          <button
            className="close-portal"
            style={{ position: 'static', width: '45px', height: '45px', fontSize: '1.5rem' }}
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <button
            className="close-portal"
            style={{ position: 'static', width: '45px', height: '45px', fontSize: '2rem' }}
            onClick={onClose}
            aria-label="Close Portal"
          >
            ×
          </button>
        </div>

        <div className="video-background" style={{ overflow: 'hidden' }}>
          {Array.isArray(protocol.video) ? (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {protocol.video.map((src, idx) => {
                const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');
                if (isVideo) {
                  return (
                    <video
                      key={src}
                      src={`/assets/${src}`}
                      autoPlay={idx === videoIndex && !isPaused}
                      loop
                      muted
                      playsInline
                      style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        opacity: idx === videoIndex ? 1 : 0,
                        transition: 'opacity 2.5s ease-in-out',
                        pointerEvents: 'none'
                      }}
                    />
                  );
                }
                return (
                  <img
                    key={src}
                    src={`/assets/${src}`}
                    alt="Healing Visual"
                    className={idx === videoIndex ? 'active' : ''}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      opacity: idx === videoIndex ? 1 : 0,
                      transform: idx === videoIndex
                        ? (isPaused ? 'scale(1.05) translate(-0.2%, -0.2%)' : 'scale(1.15) translate(-0.5%, -0.5%)')
                        : 'scale(1.02)',
                      transition: isPaused
                        ? 'opacity 2.5s ease-in-out, transform 20s ease-out'
                        : 'opacity 2.5s ease-in-out, transform 8.5s ease-out',
                      pointerEvents: 'none'
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <img
              src={`/assets/${protocol.video}`}
              alt="Healing Visual"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        <div className="healing-ui">
          <div className="glass healing-status">
            <div style={{ color: protocol.color, fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '1px' }}>
              {protocol.name} ACTIVE
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '300', color: 'white', margin: '0.5rem 0', fontFamily: 'monospace', letterSpacing: '2px', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
              {formatTime(timeLeft)}
            </div>
            <div style={{ marginTop: '0.5rem', width: '100%', maxWidth: '160px', margin: '0.5rem auto' }}>
              <label style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '3px', display: 'block' }}>
                Resonance Intensity
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={onVolumeChange}
                style={{ width: '100%', accentColor: protocol.color, cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <button
                onClick={onTogglePause}
                className="glass"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', margin: '0 auto', color: 'white',
                  transition: 'all 0.3s ease'
                }}
              >
                {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
              </button>
            </div>
            <div className="frequency-visualizer">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`bar ${isPaused ? 'paused' : ''}`} style={{ animationDelay: `${i * 0.1}s`, backgroundColor: protocol.color }}></div>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', opacity: '0.7', marginTop: '0.5rem' }}>
              Maximum Crystal Core Power Healing Effect Engaged...
            </p>

            {/* Binaural Beats Mixer */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', width: '100%' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', color: 'var(--accent-gold)' }}>
                <input
                  type="checkbox"
                  checked={binauralEnabled}
                  onChange={(e) => {
                    onToggleBinaural(e.target.checked);
                    if (e.target.checked && !isPremiumUser) {
                      toast.error("Upgrade to Guardian Tier to customize Solfeggio frequencies!");
                    }
                  }}
                  style={{ accentColor: 'var(--accent-gold)' }}
                />
                Binaural Beats Layer {!isPremiumUser && "🔒"}
              </label>

              {binauralEnabled && (
                <div style={{ position: 'relative' }}>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      marginTop: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      textAlign: 'left',
                      filter: !isPremiumUser ? 'blur(4px)' : 'none',
                      pointerEvents: !isPremiumUser ? 'none' : 'auto'
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '0.65rem', opacity: 0.8, display: 'block', marginBottom: '2px' }}>
                        Binaural Volume: {binauralVolume}%
                      </label>
                      <input
                        type="range" min="0" max="100" value={binauralVolume}
                        onChange={(e) => onChangeBinauralVolume(parseInt(e.target.value, 10))}
                        style={{ width: '100%', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.65rem', opacity: 0.8, display: 'block', marginBottom: '2px' }}>
                          Carrier Freq: {binauralCarrier}Hz
                        </label>
                        <input
                          type="range" min="200" max="800" value={binauralCarrier}
                          onChange={(e) => onChangeBinauralCarrier(parseInt(e.target.value, 10))}
                          style={{ width: '100%', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.65rem', opacity: 0.8, display: 'block', marginBottom: '2px' }}>
                          Brainwave State
                        </label>
                        <select
                          value={binauralBeat}
                          onChange={(e) => onChangeBinauralBeat(parseFloat(e.target.value))}
                          className="glass"
                          style={{ width: '100%', padding: '4px', fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', background: 'rgba(0,0,0,0.6)', color: 'white' }}
                        >
                          <option value="2">2 Hz (Delta - Deep Sleep)</option>
                          <option value="6">6 Hz (Theta - Meditation)</option>
                          <option value="10">10 Hz (Alpha - Relaxation)</option>
                          <option value="15">15 Hz (Beta - Focus)</option>
                          <option value="30">30 Hz (Gamma - Cosmic Peak)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                  {!isPremiumUser && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '10px',
                      border: '1px solid rgba(212,175,55,0.1)'
                    }}>
                      <Shield size={16} color="var(--accent-gold)" style={{ marginBottom: '4px', filter: 'drop-shadow(0 0 5px rgba(212,175,55,0.5))' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--accent-gold)', letterSpacing: '1px' }}>GUARDIAN TIER REQUIRED</span>
                      <span
                        onClick={onUpgrade}
                        style={{ fontSize: '0.65rem', color: '#fff', textDecoration: 'underline', cursor: 'pointer', marginTop: '2px', fontWeight: '500' }}
                      >
                        Upgrade to Customize Solfeggio
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolPortalModal;
