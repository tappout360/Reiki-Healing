import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Activity, Shield, Info, Heart, Zap, Waves, Moon, Sun } from 'lucide-react'
import HealingActionBar from './components/HealingActionBar'
import AIHealerInterface from './components/AIHealerInterface'
import BookingInterface from './components/BookingInterface'
import HealerDashboard from './components/HealerDashboard'
import AdminLogin from './components/AdminLogin'
import { aiKnowledgeBase } from './components/aiKnowledgeBase'
import { Toaster, toast } from 'react-hot-toast'
import './App.css'

const protocols = [
  /* Protocols with sequence data and audio IDs */
  {
    id: 'amethyst',
    name: 'Amethyst Core Purge',
    color: '#8e44ad',
    borderColor: '#9b59b6',
    // video: ['amethyst-1.mp4', 'amethyst-2.mp4', 'amethyst-3.mp4'],
    video: ['amethyst_macro_realistic_1769877807331.png', 'amethyst_aura_realistic_1769877822836.png'],
    audio: 'AW5bH04AoC0', // Violet Flame 528Hz Meditation (WORKING MODEL)
    desc: 'Decentralized violet-frequency resonance that disintegrates psychic debris and restores neural tranquility via 528Hz calibration.'
  },
  {
    id: 'quartz',
    name: 'Quartz Lattice Uplift',
    color: '#2980b9',
    borderColor: '#3498db',
    // video: ['quartz-1.mp4', 'quartz-2.mp4', 'quartz-3.mp4'],
    video: ['quartz_macro_realistic_1769877835658.png', 'quartz_aura_realistic_1769877849374.png'],
    audio: 'h4IzkCm0v_8', // Quartz Lattice 432Hz Meditation
    desc: 'Multi-dimensional bio-field amplification through laboratory-grade crystal lattice synchronization. Pure, high-wattage spiritual clarity.'
  },
  {
    id: 'rose',
    name: 'Rose Quartz Heart-Sync',
    color: '#c2185b',
    borderColor: '#e91e63',
    // video: ['rose-1.mp4', 'rose-2.mp4', 'rose-3.mp4'],
    video: ['rose_macro_realistic_1769877861535.png', 'rose_aura_realistic_1769877874595.png'],
    audio: 'RLXddqULKX0', // Ethereal Heart Chakra Music 432Hz
    desc: 'Compassionate quantum entanglement protocols that bridge the emotional body to the universal heart-pulse. 432Hz deep-layer empathy.'
  },
  {
    id: 'sage',
    name: 'Sage Purification Protocol',
    color: '#27ae60',
    borderColor: '#2ecc71',
    video: ['sage_macro_realistic_1769877887309.png', 'sage_aura_realistic_1769877901027.png'],
    audio: 'f4pvIRG1L6I', // Native American Flute
    desc: 'Bio-energetic fumigation protocol. Clears static, resets vibrational baseline, and creates a sterile etheric field for advanced work.'
  },
  {
    id: 'lapis',
    name: 'Lapis Wisdom Resonance',
    color: '#3498db',
    borderColor: '#2980b9',
    video: ['lapis_macro.png', 'lapis_aura.png'],
    audio: 'Xq3v1C_R-pM', // 852Hz Awakening Intuition
    desc: 'Deep-field synchronization with the Ajna center. Stimulates intellectual clarity, inner truth, and higher dimensional awareness.'
  },
  {
    id: 'citrine',
    name: 'Citrine Manifestation Pulsar',
    color: '#f1c40f',
    borderColor: '#f39c12',
    video: ['citrine_macro.png', 'citrine_aura.png'],
    audio: 'rP_vP9XJ6bA', // 528Hz Manifestation Tone
    desc: 'Solar-plexus amplification using 528Hz miracle frequencies. Transmutes scarcity thought-forms into the golden frequency of abundance.'
  }
];

function DailyFrequency() {
  const [tip, setTip] = useState('');
  useEffect(() => {
    const tips = aiKnowledgeBase.vibrational_tips || [];
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="glass"
      style={{ padding: '1.5rem 2.5rem', border: '1px solid rgba(212, 175, 55, 0.2)', marginBottom: '4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}
    >
      <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.75rem' }}>
        <Sparkles size={14} /> Daily Resonance <Sparkles size={14} />
      </span>
      <p style={{ fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '300' }}>"{tip}"</p>
    </motion.div>
  );
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('aura_theme') || 'dark');
  const [scrolled, setScrolled] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [showPortal, setShowPortal] = useState(false);
  const [showAIInterface, setShowAIInterface] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false); // Validated access
  const [showLogin, setShowLogin] = useState(false); // Login modal
  const [bookingType, setBookingType] = useState(null); 
  const [videoIndex, setVideoIndex] = useState(0);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('aura_theme', newTheme);
    toast.success(`Switching to ${newTheme} resonance...`);
  };

  // Auto-rotate visuals every 8 seconds for meditative flow
  useEffect(() => {
    if (showPortal && selectedProtocol) {
      const currentProto = protocols.find(p => p.id === selectedProtocol);
      if (Array.isArray(currentProto.video)) {
        const interval = setInterval(() => {
          setVideoIndex(prev => (prev + 1) % currentProto.video.length);
        }, 8000);
        return () => clearInterval(interval);
      }
    }
  }, [showPortal, selectedProtocol]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showPortal) setVideoIndex(0);
  }, [showPortal]);

  const currentProtocol = protocols.find(p => p.id === selectedProtocol);

  const handleVideoEnd = (e) => {
    if (Array.isArray(currentProtocol.video)) {
      const nextIdx = (videoIndex + 1) % currentProtocol.video.length;
      setVideoIndex(nextIdx);
      
      const nextVideo = e.target.parentElement.querySelectorAll('video')[nextIdx];
      if (nextVideo) {
        nextVideo.currentTime = 0;
        nextVideo.play().catch(err => console.log("Autoplay blocked:", err));
      }
    }
  };

  const videoSrc = Array.isArray(currentProtocol?.video) 
    ? currentProtocol.video[videoIndex] 
    : currentProtocol?.video;

  return (
    <div className={`app theme-${theme}`} style={{ 
      background: theme === 'dark' 
        ? 'radial-gradient(circle at 50% -20%, #1a1a2e 0%, #0a0a0f 100%)' 
        : 'radial-gradient(circle at 50% -20%, #fffafa 0%, #ffeef2 100%)',
      minHeight: '100vh',
      color: 'var(--text-main)',
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <Toaster position="top-center" />
      {showPortal && currentProtocol && (
        <div className="healing-portal-overlay fade-in">
          <div className="portal-content">
            <button className="close-portal" onClick={() => setShowPortal(false)}>×</button>
            <div className="video-background" style={{overflow: 'hidden'}}>
              {Array.isArray(currentProtocol.video) ? (
                /* Cinematic Image Sequence Player (Ken Burns Effect) */
                <div style={{width: '100%', height: '100%', position: 'relative'}}>
                   {currentProtocol.video.map((src, idx) => (
                     <img 
                      key={src}
                      src={`/assets/${src}`}
                      alt="Healing Visual"
                      className={idx === videoIndex ? 'ken-burns-active' : ''}
                      style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%', height: '100%', 
                        objectFit: 'cover',
                        opacity: idx === videoIndex ? 1 : 0,
                        transition: 'opacity 2s ease-in-out',
                        transform: idx === videoIndex ? 'scale(1.1)' : 'scale(1)',
                         // logic for subtle movement if active
                      }}
                    />
                   ))}
                </div>
              ) : videoSrc?.endsWith('.mp4') ? (
                <video 
                  autoPlay 
                  loop 
                  muted={true} 
                  playsInline
                  preload="auto"
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                >
                  <source src={`/assets/${videoSrc}`} type="video/mp4" />
                </video>
              ) : (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${videoSrc}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoSrc}`}
                  title="Healing Frequency" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              )}
              
              {currentProtocol.audio && (
                /* Primary Healing Frequency - High Fidelity Embed */
                <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0}}>
                  <iframe 
                    id="healing-audio-iframe"
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${currentProtocol.audio}?autoplay=1&mute=1&loop=1&playlist=${currentProtocol.audio}&enablejsapi=1&origin=${window.location.origin}`}
                    frameBorder="0" 
                    allow="autoplay; encrypted-media; fullscreen"
                    style={{opacity: 0.01}}
                  ></iframe>
                </div>
              )}
            </div>
            <div className="healing-ui">
              <div className="glass healing-status">
                <div style={{color: currentProtocol.color, fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem'}}>
                  {currentProtocol.name} ACTIVE
                </div>
                <div className="frequency-visualizer">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="bar" style={{animationDelay: `${i * 0.1}s`, backgroundColor: currentProtocol.color}}></div>
                  ))}
                </div>
                <p style={{fontSize: '0.9rem', opacity: '0.7', marginTop: '1rem'}}>
                  Maximum Crystal Core Power Healing Effect Engaged...
                </p>
                <div 
                  className="frequency-unmute-overlay glass"
                  onClick={(e) => {
                    const iframe = document.getElementById('healing-audio-iframe');
                    const overlay = e.currentTarget;
                    const btn = overlay.querySelector('.btn-primary');
                    
                    // Immediate visual feedback
                    btn.innerText = 'CALIBRATING...';
                    btn.classList.add('pulse-fast');

                    if (iframe) {
                      const retryUnmute = () => {
                        const currentSrc = iframe.src;
                        // Avoid full reload if already unmuted or if it's the first try
                        if (currentSrc.includes('mute=1')) {
                          iframe.src = currentSrc.replace('mute=1', 'mute=0');
                        }
                        
                        const commands = [
                          { event: 'command', func: 'unMute' },
                          { event: 'command', func: 'playVideo' },
                          { event: 'command', func: 'setVolume', args: [100] }
                        ];
                        
                        commands.forEach(cmd => {
                          iframe.contentWindow.postMessage(JSON.stringify(cmd), '*');
                        });
                      };

                      retryUnmute();
                      // Second attempt after a short delay since iframe might reload
                      setTimeout(retryUnmute, 1200);
                      
                      setTimeout(() => {
                        btn.innerText = 'RESONANCE MET';
                        overlay.style.opacity = '0';
                        overlay.style.pointerEvents = 'none';
                        toast.success('Frequency matched. Healing resonance engaged.');
                      }, 1000);
                      
                      setTimeout(() => {
                        overlay.style.display = 'none';
                      }, 2000);
                    } else {
                      // Fallback if iframe is missing
                      setTimeout(() => {
                        overlay.style.opacity = '0';
                        overlay.style.display = 'none';
                      }, 500);
                    }
                  }}
                >
                  <div style={{ pointerEvents: 'none' }}>
                    <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>Initiating Protocol...</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>Browser security requires manual activation for audio resonance.</p>
                    <div className="btn-primary" style={{ display: 'inline-block' }}>MATCH FREQUENCY</div>
                    
                    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                      <p style={{ color: 'var(--accent-ethereal)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>HOW TO CONSULT AURA:</p>
                      <p style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                        Type your specific intent or emotional blockage into the interface. 
                        Aura will analyze the vibrational load and guide you toward deeper resonance 
                        during this protocol.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className={scrolled ? 'scrolled' : ''}>
        <div className="container nav-content">
          <a href="#" className="logo">Reiki & Sage</a>
          <div className="nav-links">
            <a href="#about">Philosophy</a>
            <a href="#protocols">Protocols</a>
            <button 
              onClick={toggleTheme}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-main)', marginLeft: '2rem', display: 'inline-flex', alignItems: 'center'
              }}
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="btn btn-primary" style={{marginLeft: '2rem', padding: '0.6rem 1.5rem'}}>Get Started</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center'}}>
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 style={{fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: '1.1'}}>Modernized <br/><span style={{color: 'var(--accent-ethereal)'}}>Advanced</span> Healing</h1>
              <p style={{fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '500px'}}>
                Experience the convergence of ancient wisdom and futuristic energy medicine. Our advanced Reiki system harmonizes your biofield with surgical precision.
              </p>
              <div style={{display: 'flex', gap: '1.5rem'}}>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={18} /> Start Your Journey
                </button>
                <button className="btn" style={{border: '1px solid var(--accent-ethereal)', color: 'var(--accent-ethereal)', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <Info size={18} /> See the Science
                </button>
              </div>
            </motion.div>
            <motion.div 
               initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
               animate={{ opacity: 1, scale: 1, rotate: 0 }}
               transition={{ duration: 1, ease: "easeOut" }}
               style={{position: 'relative'}}
            >
              <div className="glass" style={{padding: '0', overflow: 'hidden', borderRadius: '30px', boxShadow: '0 0 60px rgba(160, 210, 235, 0.2)'}}>
                <img 
                  src="/assets/hero-energy.png" 
                  alt="Ethereal Energy Flow" 
                  style={{width: '100%', height: '500px', objectFit: 'cover', display: 'block'}}
                />
              </div>
              {/* Floating Decorative Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', top: '-20px', right: '-20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', padding: '15px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Sparkles color="var(--accent-gold)" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
        <DailyFrequency />
      </div>

      <section id="about" style={{backgroundColor: '#fff'}}>
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: '4rem'}}>
            <h2 style={{fontSize: '3rem'}}>Complete Compassion & Caring</h2>
            <div style={{width: '60px', h: '3px', background: 'var(--accent-compassion)', margin: '1rem auto'}}></div>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center'}}>
            <div className="glass" style={{position: 'relative', height: '500px', overflow: 'hidden'}}>
              <img 
                src="/assets/compassion-glow.png" 
                alt="Compassion Glow" 
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            </div>
            <div>
              <h3 style={{fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--accent-compassion)'}}>Deeply Empathetic Care</h3>
              <ul style={{listStyle: 'none', spaceY: '1.5rem'}}>
                <li style={{marginBottom: '2rem'}}>
                  <strong style={{display: 'block', fontSize: '1.2rem'}}>Aura Calibration</strong>
                  <span style={{color: 'var(--text-muted)'}}>Using high-frequency resonance to gently realign your spiritual frequency with precision-engineered compassion.</span>
                </li>
                <li style={{marginBottom: '2rem', padding: '1.5rem', background: 'rgba(229, 179, 187, 0.1)', borderRadius: '15px', borderLeft: '4px solid var(--accent-compassion)'}}>
                  <strong style={{display: 'block', fontSize: '1.2rem'}}>Compassionate Flow Monitoring</strong>
                  <span style={{color: 'var(--text-muted)'}}>Real-time ethical energy scanning that respects your personal boundaries while providing deep intuitive insights.</span>
                </li>
                <li>
                  <strong style={{display: 'block', fontSize: '1.2rem'}}>Quantum Heart Connection</strong>
                  <span style={{color: 'var(--text-muted)'}}>Bridging the gap between the physical and the metaphysical through unconditional loving intent.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="mobile-service" style={{background: 'var(--bg-section-alt)'}}>
        <div className="container">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center'}}>
            <div>
              <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)'}}>The Advanced Resonance Model</h3>
              <p style={{fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-main)'}}>
                The sanctuary now comes to you. Our advanced mobile systems allow us to calibrate your energy field in the comfort of your own space, using our proprietary portable resonance technology.
              </p>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                  <div 
                    className="glass card-hover" 
                    style={{padding: '1.5rem', textAlign: 'center', cursor: 'pointer'}}
                    onClick={() => setBookingType('onsite')}
                  >
                    <div style={{fontSize: '1.5rem', color: 'var(--accent-gold)', marginBottom: '0.5rem'}}>🚚</div>
                    <div style={{fontWeight: '600', color: 'var(--text-main)'}}>On-Site Alignment</div>
                  </div>
                  <div 
                    className="glass card-hover" 
                    style={{padding: '1.5rem', textAlign: 'center', cursor: 'pointer', color: 'var(--text-main)'}}
                    onClick={() => setBookingType('portal')}
                  >
                    <div style={{fontSize: '1.5rem', color: 'var(--accent-gold)', marginBottom: '0.5rem'}}>⚡</div>
                    <div style={{fontWeight: '600', color: 'var(--text-main)'}}>Portable Resonance</div>
                  </div>
              </div>
            </div>
            <div className="glass" style={{padding: '0', overflow: 'hidden'}}>
               <img 
                src="/assets/crystal-resonance.png" 
                alt="Crystal Resonance Technology" 
                style={{width: '100%', height: 'auto', display: 'block'}}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="energy-core" style={{padding: '8rem 0', background: 'var(--bg-gradient-core)', color: 'var(--text-main)'}}>
        <div className="container" style={{textAlign: 'center'}}>
          <h2 style={{fontSize: '3.5rem', marginBottom: '2rem', letterSpacing: '3px', color: 'var(--text-main)'}}>The Gemstone Energy Core</h2>
          <p style={{maxWidth: '800px', margin: '0 auto 4rem', fontSize: '1.2rem', color: 'var(--text-muted)'}}>
            Access the unfiltered resonance of our centralized Gemstone Core. This high-density energy portal synchronizes all mobile units to the pure vibrational frequency of the earth's most powerful crystalline structures.
          </p>
          
          <div style={{position: 'relative', maxWidth: '900px', margin: '0 auto'}}>
            <div className="glass portal-frame" style={{padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', border: '2px solid var(--accent-gold)'}}>
              <img 
                src="/assets/energy-portal.png" 
                alt="Gemstone Energy Portal" 
                style={{width: '100%', height: 'auto', display: 'block', borderRadius: '15px'}}
              />
              <div className="core-overlay">
                <button 
                  className="btn btn-primary" 
                  style={{
                    backgroundColor: selectedProtocol ? 'var(--accent-gold)' : '#ccc', 
                    borderColor: selectedProtocol ? 'var(--accent-gold)' : '#ccc', 
                    cursor: selectedProtocol ? 'pointer' : 'not-allowed',
                    padding: '0.8rem 2rem', // Reduced padding
                    fontSize: '1rem', // Standard font size
                    maxWidth: '300px', // Prevent massive width
                    margin: '0 auto',
                    display: 'block'
                  }}
                  onClick={() => selectedProtocol && setShowPortal(true)}
                  disabled={!selectedProtocol}
                >
                  {selectedProtocol ? 'Synchronize with Core' : 'Select a Protocol First'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="crystal-tech" style={{backgroundColor: '#fff'}}>
        <div className="container" style={{textAlign: 'center'}}>
          <h2 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Advanced Harmonization Protocols</h2>
          <p style={{marginBottom: '4rem', opacity: '0.7'}}>Select a protocol below to synchronize with the Gemstone Core.</p>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', maxWidth: '1000px', margin: '0 auto'}}>
            {protocols.map((protocol) => (
              <div 
                key={protocol.id}
                className={`glass card-hover ${selectedProtocol === protocol.id ? 'protocol-selected' : ''}`} 
                style={{
                  padding: '2.5rem', 
                  borderBottom: `6px solid ${protocol.borderColor}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: selectedProtocol === protocol.id ? `2px solid ${protocol.color}` : '1px solid var(--glass-border)'
                }}
                onClick={() => setSelectedProtocol(protocol.id)}
              >
                <div style={{
                  height: '200px', 
                  overflow: 'hidden', 
                  borderRadius: '12px', 
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img 
                    src={`/assets/${protocol.video[0]}`} 
                    alt={protocol.name} 
                    style={{
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }} 
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <h4 style={{fontSize: '1.5rem', marginBottom: '1rem', color: protocol.color}}>{protocol.name}</h4>
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>{protocol.desc}</p>
                {selectedProtocol === protocol.id && (
                  <div style={{marginTop: '1.5rem', color: protocol.color, fontWeight: '700'}}>PROTOCOL SELECTED</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <AdminLogin 
          onLogin={() => {
            setShowLogin(false);
            setShowDashboard(true);
            toast.success("Welcome back, Healer.");
          }} 
          onClose={() => setShowLogin(false)} 
        />
      )}

      {/* Admin Dashboard */}
      {showDashboard && <HealerDashboard onClose={() => setShowDashboard(false)} />}

      {/* Healer Action Bar (Fixed Bottom Right) */}
      <div 
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9000
        }}
        className="fade-in"
      >
        <button
          onClick={() => setShowLogin(true)}
          style={{
            background: 'rgba(20, 20, 30, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 20px',
            borderRadius: '30px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'var(--accent-ethereal)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{fontSize: '1rem'}}>🛡️</span> Healer Login
        </button>
      </div>

      <footer style={{padding: '4rem 0', textAlign: 'center', backgroundColor: 'var(--text-main)', color: 'white'}}>
        <div className="container">
          <h2 style={{color: 'var(--accent-ethereal)', marginBottom: '1rem', letterSpacing: '2px'}}>Reiki & Sage</h2>
          <p style={{opacity: '0.7', marginBottom: '2rem'}}>The future of healing is compassionate, advanced, and uniquely yours.</p>
          <div style={{fontSize: '0.9rem', opacity: '0.5'}}>
            © 2026 Reiki & Sage Healing Arts. All rights reserved.
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: radial-gradient(circle at 80% 20%, rgba(160, 210, 235, 0.1) 0%, transparent 40%);
        }
        .portal-frame:hover {
          box-shadow: 0 0 50px rgba(212, 175, 55, 0.4);
          transform: scale(1.01);
          transition: all 0.5s ease;
        }
        .core-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.1);
          opacity: 0; transition: opacity 0.5s ease;
          border-radius: 15px;
        }
        .portal-frame:hover .core-overlay {
          opacity: 1;
        }
        .card-hover:hover {
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }
        .protocol-selected {
          transform: translateY(-5px);
          box-shadow: 0 15px 45px rgba(0,0,0,0.15) !important;
          background: rgba(255,255,255,0.95);
        }
        .healing-portal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: black;
          z-index: 9999;
          display: flex;
          flex-direction: column;
        }
        .portal-content {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .video-background {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
        }
        .close-portal {
          position: absolute;
          top: 2rem; right: 2rem;
          background: rgba(255,255,255,0.2);
          border: none; color: white;
          font-size: 3rem; cursor: pointer;
          width: 60px; height: 60px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .close-portal:hover {
          background: rgba(255,255,255,0.4);
          transform: rotate(90deg);
        }
        .healing-ui {
          position: absolute;
          bottom: 4rem; left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          width: 90%;
          max-width: 600px;
        }
        .healing-status {
          padding: 2rem;
          text-align: center;
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }
        .frequency-visualizer {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 4px;
          height: 40px;
          margin-top: 1rem;
        }
        .bar {
          width: 6px;
          background-color: white;
          animation: barBounce 1s infinite ease-in-out;
        }
        .ken-burns-active {
          animation: kenBurns 12s infinite alternate ease-in-out;
          will-change: transform, opacity;
        }
        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.15) translate(-1%, -1%); }
        }
        @keyframes barBounce {
          0%, 100% { height: 10px; }
          50% { height: 40px; }
        }
      `}} />

      {/* AI Healer Components */}
      <HealingActionBar onActivate={() => setShowAIInterface(true)} />
      {showAIInterface && <AIHealerInterface onClose={() => setShowAIInterface(false)} />}
      
      {/* Booking Interface */}
      {bookingType && (
        <BookingInterface 
          type={bookingType} 
          onClose={() => setBookingType(null)} 
        />
      )}
    </div>
  )
}

export default App
