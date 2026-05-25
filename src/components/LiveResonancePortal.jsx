
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

const LiveResonancePortal = ({ user, onClose }) => {
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
                    {/* Simulated Camera Feed */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <div style={{ textAlign: 'center' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                style={{
                                    width: '300px', height: '300px',
                                    border: '1px dashed rgba(142, 68, 173, 0.3)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative'
                                }}
                            >
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    style={{ width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(142, 68, 173, 0.4), transparent)', borderRadius: '50%' }}
                                />
                            </motion.div>
                             <h2 style={{ marginTop: '2rem', fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>
                                {!isLive ? 'INITIATE TRANSMISSION' : (seekerAdmitted ? 'RESONANCE ESTABLISHED' : 'WAITING FOR ADMISSION')}
                             </h2>
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
                                    style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--accent-gold)' }}
                                >
                                    <p style={{ marginBottom: '1rem', color: 'var(--accent-gold)' }}>Seeker is waiting in the ether...</p>
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
                         </div>
                    </div>

                    {/* HUD - Bottom Left: Resonance Metadata */}
                    <div style={{ position: 'absolute', bottom: '2rem', left: '2rem' }}>
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
                    <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                        <div className="glass" style={{ width: '120px', height: '160px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--accent-gold)' }}>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carissa" alt="Healer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', padding: '5px', textAlign: 'center', fontSize: '0.7rem' }}>
                                CARISSA (HEALER)
                            </div>
                        </div>
                    </div>
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
                         <IconButton icon={Heart} label="GIVE HEART" color="#ff7675" />
                         <IconButton icon={Zap} label="AMPLIFY" color="var(--accent-gold)" />
                         <IconButton icon={Sparkles} label="PURIFY" color="var(--accent-ethereal)" />
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

const IconButton = ({ icon, label, color }) => (
    <motion.button
        whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
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
