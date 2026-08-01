
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mic, MicOff, Video, VideoOff, 
  MessageSquare, Users, Activity, 
  Zap, Heart, Shield, Sparkles,
  Maximize, Settings, Volume2, 
  Share2, Eye, TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { isFirebaseConfigured, db } from '../lib/firebase';
import DailyIframe from '@daily-co/daily-js';

const LiveResonancePortal = ({ user, session, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [resonanceLevel, setResonanceLevel] = useState(88);
  const [vibrationalStatus, setVibrationalStatus] = useState('Synchronizing...');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'System', text: 'Resonance established. Field is stable.', time: '10:00' },
    { id: 2, sender: 'Carissa (Healer)', text: 'Welcome to your deep alignment. Can you feel the crystal core pulsing?', time: '10:02' }
  ]);
  const [inputText, setInputText] = useState('');
  
  // Healer Specific States
  const isHealer = user?.role === 'healer' || user?.role === 'owner';
  const [isLive, setIsLive] = useState(false);
  const [seekerWaiting, setSeekerWaiting] = useState(true);
  const [seekerAdmitted, setSeekerAdmitted] = useState(false);

  // Gating & WebRTC States
  const [waitingRoomConsent, setWaitingRoomConsent] = useState(false);
  const [dailyCallFrame, setDailyCallFrame] = useState(null);

  useEffect(() => {
    if (isLive && seekerAdmitted && !dailyCallFrame) {
      const frame = DailyIframe.createFrame(document.getElementById('daily-video-container'), {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '24px'
        },
        showLeaveButton: false,
        showFullscreenButton: true
      });
      const roomName = session?.sessionCode || session?.stripeSessionId || 'test-resonance-field';
      frame.join({ url: `https://reikiandsage.daily.co/${roomName}` })
        .catch(err => {
          console.warn("Daily join failed (using mock feed fallback):", err);
        });
      setDailyCallFrame(frame);
    }

    return () => {
      if (dailyCallFrame) {
        dailyCallFrame.destroy();
      }
    };
  }, [isLive, seekerAdmitted, dailyCallFrame, session]);

  useEffect(() => {
    if (dailyCallFrame) {
      dailyCallFrame.setLocalAudio(!isMuted);
    }
  }, [isMuted, dailyCallFrame]);

  useEffect(() => {
    if (dailyCallFrame) {
      dailyCallFrame.setLocalVideo(!isVideoOff);
    }
  }, [isVideoOff, dailyCallFrame]);

  // Micro-interaction states
  const [hearts, setHearts] = useState([]);
  const [isAmplified, setIsAmplified] = useState(false);
  const [isPurifying, setIsPurifying] = useState(false);
  const [waveHeights, setWaveHeights] = useState(Array(16).fill(15));

  // Simulate resonance fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setResonanceLevel(prev => {
        const delta = (Math.random() - 0.5) * 2;
        return Math.min(100, Math.max(80, prev + delta));
      });
      
      const statuses = ['Holding Frequency', 'Amplifying', 'Stable', 'Harmonized'];
      if (Math.random() > 0.8) {
        setVibrationalStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 1. Audio Visualizer Pulse Simulator
  useEffect(() => {
    if (!isLive || !seekerAdmitted) return;
    const interval = setInterval(() => {
      setWaveHeights(prev => {
        return prev.map(() => {
          const min = isAmplified ? 35 : 12;
          const max = isAmplified ? 98 : 65;
          return Math.floor(Math.random() * (max - min)) + min;
        });
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isLive, seekerAdmitted, isAmplified]);

  // 2. Chat Simulator Bot
  useEffect(() => {
    if (!isLive || !seekerAdmitted) return;
    
    const seekerComments = [
      "So grateful to be part of this sanctuary today.",
      "I can feel the crystal frequency pulsing through the stream.",
      "My hands are tingling with warmth.",
      "The crown chakra pressure is gently releasing...",
      "Sending light and alignment to everyone here. 🙏",
      "Carissa, the visual alignments are incredibly clear today.",
      "Felt a deep release when we started the Amethyst protocol.",
      "Pure peace in this field."
    ];

    const seekerNames = [
      "Luna Rivers",
      "Gavin Thorne",
      "Estella Sky",
      "Zev Brooks"
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const name = seekerNames[Math.floor(Math.random() * seekerNames.length)];
        const text = seekerComments[Math.floor(Math.random() * seekerComments.length)];
        const newMsg = {
          id: Date.now() + Math.random(),
          sender: name,
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMsg]);
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [isLive, seekerAdmitted]);

  // 3. Micro-Interaction Handlers
  const handleGiveHeart = () => {
    const newHeart = {
      id: Date.now() + Math.random(),
      left: Math.random() * 60 + 20 // 20% to 80% left
    };
    setHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 3500);
  };

  const handleAmplify = () => {
    setIsAmplified(true);
    toast.success("Resonance amplified. Boosting frequency flow!");
    setTimeout(() => {
      setIsAmplified(false);
    }, 5000);
  };

  const handleOriginalPurify = () => {
    setIsPurifying(true);
    toast.success("Violet flame activated. Clearing energetic impurities.");
    setTimeout(() => {
      setIsPurifying(false);
    }, 4000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: user.name || 'Seeker',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 20000, // Highest priority
        background: '#05050a',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden'
      }}
    >
      {/* Background Visual Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at center, rgba(142, 68, 173, 0.2), transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        {/* Mock Stream Background - Calm moving visuals */}
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <img 
                src="/assets/amethyst_macro_realistic_1769877807331.png" 
                alt="Background" 
                className="ken-burns-active"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
            />
            {/* Overlay Grid / Scanlines */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 4px, 3px 100%',
                pointerEvents: 'none'
            }} />
        </div>
      </div>

      {/* Main Stream Area */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', padding: '1.5rem', gap: '1.5rem' }}>
        
        {/* Left Side: Video & Main Interface */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* Header Overlay */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="glass" style={{ padding: '0.4rem 1rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', background: isLive ? 'rgba(255,50,50,0.2)' : 'rgba(255,255,255,0.05)', border: isLive ? '1px solid rgba(255,50,50,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLive ? '#ff3e3e' : '#888', animation: isLive ? 'pulse 1.5s infinite' : 'none' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>{isLive ? 'LIVE RESONANCE' : 'PORTAL STANDBY'}</span>
                    </div>
                    {isLive && (
                        <div className="glass" style={{ padding: '0.4rem 1rem', borderRadius: '30px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                            <Users size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            {seekerAdmitted ? '1 Seeker Connected' : 'Waiting for Seeker...'}
                        </div>
                    )}
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="glass"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', color: '#fff', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </motion.button>
                </div>
            </div>

            {/* Central Immersive Feed Area */}
            <div style={{ flex: 1, position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Main Video Window */}
                <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                    
                    {/* Daily.co WebRTC Video Iframe Container */}
                    <div id="daily-video-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, display: (isLive && seekerAdmitted) ? 'block' : 'none' }} />

                    {/* Camera Feed HUD & Waiting Room Overlay */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: (isLive && seekerAdmitted) ? 'none' : 'auto' }}>
                         <div style={{ textAlign: 'center', width: '100%' }}>
                             {isLive && seekerAdmitted ? (
                               // Keep visualizer overlay in the corner of the stream or floating
                               <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', display: 'flex', alignItems: 'end', gap: '4px', height: '40px', width: '100px', zIndex: 10, pointerEvents: 'none' }}>
                                 {waveHeights.slice(0, 8).map((h, i) => (
                                   <motion.div
                                     key={i}
                                     animate={{ height: `${h / 2}%` }}
                                     transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                     style={{
                                       width: '4px',
                                       borderRadius: '2px',
                                       background: isAmplified ? '#d4af37' : '#8e44ad',
                                       transformOrigin: 'bottom'
                                     }}
                                   />
                                 ))}
                               </div>
                             ) : (
                               <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    style={{
                                        width: '240px', height: '240px',
                                        border: '1px dashed rgba(142, 68, 173, 0.3)',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative',
                                        margin: '0 auto'
                                    }}
                                >
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        style={{ width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(142, 68, 173, 0.4), transparent)', borderRadius: '50%' }}
                                    />
                                </motion.div>
                             )}

                             <h2 style={{ marginTop: '2rem', fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>
                                {!isLive ? 'INITIATE TRANSMISSION' : (seekerAdmitted ? 'RESONANCE ESTABLISHED' : 'WAITING FOR ADMISSION')}
                             </h2>

                             {/* Healer Dashboard Controls */}
                             {isHealer && !isLive && (
                                <button 
                                    onClick={() => {
                                        setIsLive(true);
                                        toast.success("Transmission initiated. Portal is now Live.");
                                    }}
                                    className="btn-primary" 
                                    style={{ marginTop: '2rem', padding: '1rem 2.5rem', borderRadius: '30px' }}
                                >
                                    START TRANSMISSION
                                </button>
                             )}
                             {isHealer && isLive && seekerWaiting && !seekerAdmitted && (
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="glass"
                                    style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--accent-gold)', display: 'inline-block' }}
                                >
                                    <p style={{ marginBottom: '1rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Seeker is waiting in the ether...</p>
                                    <button 
                                        onClick={() => {
                                            setSeekerAdmitted(true);
                                            setSeekerWaiting(false);
                                            toast.success("Seeker admitted to the Sanctuary.");
                                        }}
                                        className="btn-primary"
                                    >
                                        ADMIT SEEKER
                                    </button>
                                </motion.div>
                             )}

                             {/* Seeker Self-Guided Test Controls */}
                             {!isHealer && !isLive && (
                                <div style={{ marginTop: '2rem' }}>
                                   <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Practitioner has not initiated transmission yet.</p>
                                   <button 
                                       onClick={() => {
                                           setIsLive(true);
                                           toast.success("Simulating Healer going Live!");
                                       }}
                                       className="btn-primary" 
                                       style={{ padding: '0.8rem 2rem', borderRadius: '30px' }}
                                   >
                                       SIMULATE HEALER GOING LIVE
                                   </button>
                                </div>
                             )}
                             {!isHealer && isLive && !seekerAdmitted && (
                                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                   <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Practitioner is Live! Request entry into the Sanctuary.</p>
                                   
                                   {/* Waiting Room Consent Box */}
                                   <div style={{
                                     background: 'rgba(231, 76, 60, 0.08)',
                                     border: '1px solid rgba(231, 76, 60, 0.2)',
                                     borderRadius: '12px',
                                     padding: '1.25rem',
                                     maxWidth: '450px',
                                     textAlign: 'left',
                                     fontSize: '0.8rem',
                                     lineHeight: '1.5',
                                     color: 'rgba(255,255,255,0.8)',
                                     pointerEvents: 'auto'
                                   }}>
                                     <p style={{ fontWeight: '700', color: '#e74c3c', margin: '0 0 0.5rem 0' }}>
                                       ⚠️ Spiritual Wellness Notice
                                     </p>
                                     I confirm I am entering a spiritual wellness sanctuary. I understand this session is strictly non-medical and is not regulated or approved by the FDA. I understand that the healer does not diagnose, treat, or cure medical conditions.
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem' }}>
                                       <input 
                                         type="checkbox" 
                                         id="waiting-room-consent" 
                                         checked={waitingRoomConsent} 
                                         onChange={(e) => setWaitingRoomConsent(e.target.checked)} 
                                         style={{ cursor: 'pointer' }}
                                       />
                                       <label htmlFor="waiting-room-consent" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '0.78rem', color: '#fff' }}>
                                         I confirm and wish to enter.
                                       </label>
                                     </div>
                                   </div>

                                   <button 
                                       disabled={!waitingRoomConsent}
                                       onClick={async () => {
                                           if (isFirebaseConfigured() && session?.id) {
                                               try {
                                                   await db.updateBookingStatus(session.id, {
                                                       consentAccepted: true,
                                                       consentTimestamp: new Date().toISOString()
                                                   });
                                               } catch (err) {
                                                   console.error("Failed to save consent to Firestore:", err);
                                               }
                                           } else {
                                               const bookingsList = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
                                               const updated = bookingsList.map(b => b.id === session?.id ? { ...b, consentRecorded: true, consentTimestamp: new Date().toISOString() } : b);
                                               localStorage.setItem('aura_bookings', JSON.stringify(updated));
                                           }
                                           setSeekerAdmitted(true);
                                           setSeekerWaiting(false);
                                           toast.success("Admitted to Sanctuary!");
                                       }}
                                       className="btn-primary" 
                                       style={{ padding: '0.8rem 2.5rem', borderRadius: '30px', opacity: waitingRoomConsent ? 1 : 0.5 }}
                                   >
                                       ENTER SANCTUARY
                                   </button>
                                </div>
                             )}
                          </div>
                    </div>

                    {/* HUD - Bottom Left: Resonance Metadata */}
                    <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', zIndex: 10 }}>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', minWidth: '200px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Vibrational Sync</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{resonanceLevel.toFixed(1)}%</span>
                                <TrendingUp size={16} color="#00b894" />
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#00b894', fontWeight: '600' }}>
                                {vibrationalStatus}
                            </div>
                        </div>
                    </div>

                    {/* HUD - Top Right: Participant Bubble */}
                    <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
                        <div className="glass" style={{ width: '120px', height: '160px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--accent-gold)' }}>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carissa" alt="Healer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', padding: '5px', textAlign: 'center', fontSize: '0.7rem' }}>
                                CARISSA (HEALER)
                            </div>
                        </div>
                    </div>

                    {/* Floating Hearts Overlay */}
                    {hearts.map(h => (
                      <motion.div
                        key={h.id}
                        initial={{ y: '80vh', opacity: 1, scale: 0.8 }}
                        animate={{ y: '-20vh', opacity: 0, scale: [0.8, 1.3, 1] }}
                        transition={{ duration: 3.5, ease: 'easeOut' }}
                        style={{
                          position: 'absolute',
                          left: `${h.left}%`,
                          bottom: 0,
                          color: '#ff7675',
                          fontSize: '2.5rem',
                          pointerEvents: 'none',
                          zIndex: 12
                        }}
                      >
                        ❤️
                      </motion.div>
                    ))}

                    {/* Golden Ripples for AMPLIFY */}
                    <AnimatePresence>
                      {isAmplified && (
                        <motion.div
                          initial={{ scale: 0.3, opacity: 0.8 }}
                          animate={{ scale: 3.5, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                          style={{
                            position: 'absolute',
                            top: 'calc(50% - 100px)',
                            left: 'calc(50% - 100px)',
                            width: '200px',
                            height: '200px',
                            border: '4px solid var(--accent-gold)',
                            borderRadius: '50%',
                            boxShadow: '0 0 50px var(--accent-gold)',
                            pointerEvents: 'none',
                            zIndex: 8
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Violet Glow for PURIFY */}
                    <AnimatePresence>
                      {isPurifying && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.3, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 4, ease: "easeInOut" }}
                          style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'radial-gradient(circle, rgba(162, 155, 254, 0.4) 0%, rgba(142, 68, 173, 0.2) 100%)',
                            mixBlendMode: 'screen',
                            pointerEvents: 'none',
                            zIndex: 9
                          }}
                        />
                      )}
                    </AnimatePresence>
                </div>

                {/* Bottom Overlay Controls */}
                <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    padding: '1.5rem', 
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <ControlCircle icon={isMuted ? MicOff : Mic} onClick={() => setIsMuted(!isMuted)} status={isMuted ? 'danger' : 'active'} />
                        <ControlCircle icon={isVideoOff ? VideoOff : Video} onClick={() => setIsVideoOff(!isVideoOff)} status={isVideoOff ? 'danger' : 'active'} />
                    </div>
                    
                    <div className="glass" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', borderRadius: '30px' }}>
                         <IconButton icon={Heart} label="GIVE HEART" color="#ff7675" onClick={handleGiveHeart} />
                         <IconButton icon={Zap} label="AMPLIFY" color="var(--accent-gold)" onClick={handleAmplify} />
                         <IconButton icon={Sparkles} label="PURIFY" color="var(--accent-ethereal)" onClick={handleOriginalPurify} />
                    </div>

                     <div style={{ display: 'flex', gap: '1rem' }}>
                          <ControlCircle icon={MessageSquare} onClick={() => setShowChat(!showChat)} status={showChat ? 'active' : 'idle'} />
                          {isHealer && (
                             <ControlCircle 
                                icon={X} 
                                onClick={onClose} 
                                status="danger" 
                                title="End Session"
                             />
                          )}
                          {!isHealer && <ControlCircle icon={Maximize} />}
                     </div>
                </div>
            </div>
        </div>

        {/* Right Side: Chat Panel */}
        <AnimatePresence>
            {showChat && (
                <motion.div 
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    className="glass"
                    style={{
                        width: '350px',
                        borderRadius: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        background: 'rgba(255,255,255,0.02)'
                    }}
                >
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Portal Chat</h4>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>SECURE</span>
                    </div>

                    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'System' ? 'center' : 'flex-start' }}>
                                {msg.sender !== 'System' && (
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{msg.sender} • {msg.time}</span>
                                )}
                                <div style={{ 
                                    padding: '0.8rem 1rem', 
                                    borderRadius: msg.sender === 'System' ? '8px' : '15px 15px 15px 2px',
                                    background: msg.sender === 'System' ? 'rgba(255,255,255,0.05)' : 'rgba(142, 68, 173, 0.2)',
                                    fontSize: msg.sender === 'System' ? '0.75rem' : '0.9rem',
                                    fontStyle: msg.sender === 'System' ? 'italic' : 'normal',
                                    border: msg.sender === 'System' ? '1px dashed rgba(255,255,255,0.1)' : 'none',
                                    maxWidth: '90%'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text"
                                placeholder="Manifest a thought..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '30px',
                                    padding: '0.8rem 1.2rem',
                                    paddingRight: '3.5rem',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button 
                                type="submit"
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'var(--accent-gold)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <ArrowRight size={16} color="#000" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-spin {
            animation: spin 2s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

const ControlCircle = ({ icon, onClick, status = 'idle' }) => (
    <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            background: status === 'danger' ? '#ff7675' : (status === 'active' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'),
            color: (status === 'active' || status === 'danger') ? '#000' : '#fff',
            boxShadow: status === 'active' ? '0 0 20px rgba(212, 175, 55, 0.4)' : 'none'
        }}
    >
        {React.createElement(icon, { size: 24 })}
    </motion.button>
);

const IconButton = ({ icon, label, color, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
        onClick={onClick}
        className="glass"
        style={{
            border: 'none',
            background: 'transparent',
            padding: '8px 16px',
            borderRadius: '20px',
            color: color || '#fff',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
        }}
    >
        {React.createElement(icon, { size: 14 })}
        {label}
    </motion.button>
);

// Helper for chat direction
const ArrowRight = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

export default LiveResonancePortal;
