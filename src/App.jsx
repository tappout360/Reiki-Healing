import React, { useEffect, useState, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Activity, Shield, Info, Heart, Zap, Waves, Moon, Sun, 
  LogOut, Lock, Clock, Quote, Star, MessageSquare, Play, Pause, Maximize, Minimize 
} from 'lucide-react'
import { aiKnowledgeBase } from './components/aiKnowledgeBase'
import { Toaster, toast } from 'react-hot-toast'
import { UserDashboardInline } from './components/UserDashboardInline'
import { auth, db, isFirebaseConfigured } from './lib/firebase'
import './App.css'
import './components/AuraGuide.css'

// Lazy Load Heavy Components for Performance
const HealingActionBar = lazy(() => import('./components/HealingActionBar'));
const AIHealerInterface = lazy(() => import('./components/AIHealerInterface'));
const BookingInterface = lazy(() => import('./components/BookingInterface'));
const HealerDashboard = lazy(() => import('./components/HealerDashboard'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const ScienceModal = lazy(() => import('./components/ScienceModal'));
const AuraGuide = lazy(() => import('./components/AuraGuide'));
const SignupFlow = lazy(() => import('./components/SignupFlow')); // NEW: Single-page signup
const Login = lazy(() => import('./components/Login'));
const HealerApplicationModal = lazy(() => import('./components/HealerApplicationModal'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const LiveResonancePortal = lazy(() => import('./components/LiveResonancePortal'));
const JoinPortalModal = lazy(() => import('./components/JoinPortalModal'));
const MyStoriesPortal = lazy(() => import('./components/MyStoriesPortal'));
const SubscriptionPage = lazy(() => import('./components/SubscriptionPage'));
import DuckingAudioPlayer from './components/DuckingAudioPlayer';
import BillingForm from './components/BillingForm';

// Loading Fallback
const LoadingSpinner = () => (
  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem'}}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Sparkles size={24} color="var(--accent-gold)" />
    </motion.div>
  </div>
);

const AuraClouds = () => {
  const [clouds, setClouds] = useState([
    { id: 1, top: '15%', left: '10%', size: 100, color: 'rgba(160, 210, 235, 0.4)', poof: false },
    { id: 2, top: '45%', left: '85%', size: 150, color: 'rgba(229, 179, 187, 0.4)', poof: false },
    { id: 3, top: '75%', left: '15%', size: 120, color: 'rgba(212, 175, 55, 0.3)', poof: false },
    { id: 4, top: '25%', left: '70%', size: 80, color: 'rgba(142, 68, 173, 0.4)', poof: false },
    { id: 5, top: '65%', left: '60%', size: 140, color: 'rgba(160, 210, 235, 0.3)', poof: false },
  ]);

  const handlePoof = (id) => {
    setClouds(prev => prev.map(c => c.id === id ? { ...c, poof: true } : c));
    setTimeout(() => {
      setClouds(prev => prev.filter(c => c.id !== id));
      // Respawn after a delay
      setTimeout(() => {
        const newCloud = {
          id: Date.now(),
          top: `${Math.random() * 80 + 10}%`,
          left: `${Math.random() * 80 + 10}%`,
          size: Math.random() * 70 + 80,
          color: ['rgba(160, 210, 235, 0.4)', 'rgba(229, 179, 187, 0.4)', 'rgba(212, 175, 55, 0.3)', 'rgba(142, 68, 173, 0.4)'][Math.floor(Math.random() * 4)],
          poof: false
        };
        setClouds(curr => [...curr, newCloud]);
      }, 3000);
    }, 6000);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {clouds.map(cloud => (
        <div
          key={cloud.id}
          className={`aura-cloud gentle-drift ${cloud.poof ? 'cloud-poof' : ''}`}
          onClick={() => handlePoof(cloud.id)}
          style={{
            top: cloud.top,
            left: cloud.left,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
            background: cloud.color,
            borderRadius: '50%',
            boxShadow: `0 0 40px ${cloud.color}`,
          }}
        />
      ))}
    </div>
  );
};

const Stardust = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="stardust"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random() * 0.5 + 0.2
          }}
        />
      ))}
    </div>
  );
};

const protocols = [
  /* Protocols with sequence data and audio IDs */
  {
    id: 'amethyst',
    name: 'Amethyst Core Purge',
    color: '#8e44ad',
    borderColor: '#9b59b6',
    isImmersive: true,
    video: [
      'amethyst_aura_realistic_1769877822836.png',
      'sage_protocol_cosmic_alignment_1770424972911.png',
      'amethyst_core_purge_macro_1769852056191.png',
      'amethyst_macro_realistic_1769877807331.png',
      'amethyst_core_purge_aura_1769852069785.png',
      'reiki_hero_ethereal_energy_1769837619855.png',
      'compassion_healing_glow_1769837632078.png',
      'crystal_resonance_tech_1769838808831.png',
      'quartz_lattice_field_1769852099553.png',
      'quartz_lattice_macro_1769852085365.png',
      'gemstone_energy_portal_1769839144418.png',
      'reiki_crown_chakra_light_1770423834100.png'
    ],
    audio: 'AW5bH04AoC0', // Violet Flame 528Hz Meditation
    voice: '/assets/amethyst_meditation_voice.mp3', // Mock path for voiceover
    desc: 'Advanced 10-minute deep-field purification. Disintegrates psychic debris and restores neural tranquility via the sacred Violet Flame.',
    tier: 'advanced'
  },
  {
    id: 'quartz',
    name: 'Quartz Lattice Uplift',
    color: '#2980b9',
    borderColor: '#3498db',
    isImmersive: true,
    video: [
      'quartz_macro_realistic_1769877835658.png',
      'quartz_aura_realistic_1769877849374.png',
      'quartz_lattice_macro_1769852085365.png',
      'quartz_lattice_field_1769852099553.png',
      'reiki_crown_chakra_light_1770423834100.png',
      'sage_protocol_crystal_cave_1770441218348.png',
      'sage_sacred_purify_1770423875666.png'
    ],
    audio: 'h4IzkCm0v_8', // Quartz Lattice 432Hz Meditation
    voice: '/assets/quartz_meditation_voice.mp3',
    desc: 'Advanced 10-minute structural alignment. Amplifies mental focus and crystalline clarity through a multi-dimensional bio-field uplift.',
    tier: 'advanced'
  },
  {
    id: 'rose',
    name: 'Rose Quartz Heart-Sync',
    color: '#c2185b',
    borderColor: '#e91e63',
    isImmersive: true,
    video: [
      'rose_macro_realistic_1769877861535.png',
      'rose_aura_realistic_1769877874595.png',
      'rose_quartz_macro_1769852112446.png',
      'rose_quartz_field_1769852125920.png',
      'compassion_healing_glow_1769837632078.png',
      'sage_protocol_heart_emerald_1770425202896.png',
      'sage_protocol_heart_resonance_1770424959673.png',
      'sage_protocol_heart_glow_1770425071893.png'
    ],
    audio: 'RLXddqULKX0', // Ethereal Heart Chakra Music 432Hz
    voice: '/assets/rose_meditation_voice.mp3',
    desc: 'Advanced 10-minute heart-centered journey. Facilitates deep emotional release and compassion through soft radiance and harmonic heart-sync.',
    tier: 'advanced'
  },
  {
    id: 'lapis',
    name: 'Lapis Wisdom Resonance',
    color: '#3498db',
    borderColor: '#2980b9',
    isImmersive: true,
    video: [
      'lapis_macro.png',
      'lapis_aura.png',
      'sage_protocol_cosmic_alignment_1770424972911.png',
      'sage_protocol_starlight_ocean_v2_1770441141710.png',
      'sage_protocol_seagulls_sky_1770425239432.png',
      'sage_protocol_purge_1770423911044.png',
      'forest_natural_path_intelligence_1770423845946.png'
    ],
    audio: 'thRVM2ZcuaY', // 852Hz Awakening Intuition (Fixed)
    voice: '/assets/lapis_meditation_voice.mp3',
    desc: 'Advanced 10-minute intuition awakening. Deep-field synchronization for intellectual clarity, inner truth, and higher dimensional awareness.',
    tier: 'basic'
  },
  {
    id: 'citrine',
    name: 'Citrine Manifestation',
    color: '#f1c40f',
    borderColor: '#d4af37',
    isImmersive: true,
    video: [
      'citrine_macro.png',
      'citrine_aura.png',
      'sage_protocol_macro_gold_1770425190644.png',
      'sage_ocean_sunrise_1770425017610.png',
      'hero-energy.png',
      'gemstone_energy_portal_1769839144418.png', // Switched to energy portal for sacred geometry feel
      'sage_protocol_reiki_light_1770423936670.png',
      'sage_protocol_sunrise_ocean_1770425084382.png',
      'reiki_crown_chakra_light_1770423834100.png'
    ],
    audio: 'AW5bH04AoC0', // Solar Plexus 528Hz
    voice: '/assets/citrine_meditation_voice.mp3',
    desc: 'Advanced 10-minute solar-plexus alchemy. Uses the "Merchant\'s Stone" frequency and Sacred Geometry (Flower of Life) to align willpower with divine abundance.',
    tier: 'advanced'
  },
  {
    id: 'sage',
    name: 'Sage Purification Protocol',
    color: '#27ae60',
    borderColor: '#2ecc71',
    isImmersive: true,
    video: [
      'sage_protocol_shoreline_1770441338466.png',
      'sage_smoke_ethereal_cleansing_1770423820855.png',
      'sage_protocol_beach_sunset_1770441204371.png',
      'sage_protocol_forest_clearing_1770424946816.png',
      'sage_protocol_heart_resonance_1770424959673.png',
      'sage_reiki_hands_1770425030680.png',
      'sage_protocol_zen_stones_1770425096886.png',
      'sage_protocol_crystal_cave_1770441218348.png',
      'sage_protocol_reiki_light_1770423936670.png',
      'reiki_crown_chakra_light_1770423834100.png',
      'sage_protocol_dewy_sage_1770425226526.png',
      'sage_protocol_sunrise_ocean_1770425084382.png'
    ],
    audio: 'f4pvIRG1L6I', // Native American Flute (Background)
    voice: '/assets/sage_meditation_voice.mp3', // Mock path for voiceover
    desc: 'Advanced 10-minute immersive meditation. Clears deep-seated stress and resets vibrational baseline through sacred smoke and ocean resonance.',
    tier: 'advanced'
  },
  {
    id: 'reiki',
    name: 'Reiki Sacred Alignment',
    color: '#f39c12',
    borderColor: '#e67e22',
    isImmersive: true,
    video: [
      'reiki_crown_chakra_light_1770423834100.png',
      'gemstone_energy_portal_1769839144418.png',
      'sage_protocol_reiki_light_1770423936670.png',
      'amethyst_core_purge_aura_1769852069785.png',
      'sage_protocol_cosmic_alignment_1770424972911.png',
      'sage_protocol_crystal_cave_1770441218348.png',
      'sage_protocol_heart_glow_1770425071893.png',
      'reiki_hero_ethereal_energy_1769837619855.png',
      'sage_protocol_starlight_ocean_v2_1770441141710.png',
      'sage_sacred_purify_1770423875666.png'
    ],
    audio: 'AW5bH04AoC0', // Ambient 528Hz background music (ducks when Carissa's voice plays)
    voice: '/assets/reiki_meditation_voice.mp3', // Carissa's recorded voiceover — place MP3 here
    desc: 'Immersive 15-minute guided Reiki healing journey. Carissa\'s gentle voice leads you through universal life force energy alignment and deep restoration.',
    tier: 'advanced'
  },
  {
    id: 'celestial',
    name: 'Celestial Fantasia',
    color: '#1a1a4e',
    borderColor: '#4a2f8a',
    isImmersive: true,
    video: [
      'sage_protocol_cosmic_alignment_1770424972911.png',
      'gemstone_energy_portal_1769839144418.png',
      'amethyst_core_purge_aura_1769852069785.png',
      'sage_protocol_starlight_ocean_v2_1770441141710.png',
      'sage_protocol_crystal_cave_1770441218348.png',
      'reiki_crown_chakra_light_1770423834100.png',
      'quartz_lattice_field_1769852099553.png',
      'rose_quartz_field_1769852125920.png',
      'sage_protocol_heart_glow_1770425071893.png',
      'hero-energy.png'
    ],
    audio: 'thRVM2ZcuaY', // Ambient orchestral/ethereal background music (ducks when Carissa's voice plays)
    voice: '/assets/celestial_meditation_voice.mp3', // Carissa's recorded voiceover — place MP3 here
    desc: '15-minute cinematic "Zodiac Awakening" — Carissa guides you through a Fantasia-inspired orchestra of gemstones, constellations, and healing aura.',
    tier: 'advanced'
  }
];

const positiveAffirmations = [
  "You are a radiant being of light.",
  "Your potential is limitless.",
  "You are deeply loved and cherished.",
  "Your presence makes the world brighter.",
  "You are worthy of all good things.",
  "Your heart is pure gold.",
  "You are a masterpiece in motion.",
  "Your spirit is unbreakable.",
  "You are enough, exactly as you are.",
  "Your energy heals those around you."
];

function DailyFrequency() {
  const [tip, setTip] = useState('');
  const [affirmation, setAffirmation] = useState('');

  useEffect(() => {
    const tips = aiKnowledgeBase.vibrational_tips || [];
    setTip(tips[Math.floor(Math.random() * tips.length)]);
    setAffirmation(positiveAffirmations[Math.floor(Math.random() * positiveAffirmations.length)]);
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
      <p style={{ fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '300', marginBottom: '1.5rem' }}>"{tip}"</p>
      
      {/* Secondary Positive Affirmation */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
         <p style={{ fontSize: '1rem', color: 'var(--accent-ethereal)', fontWeight: '500', letterSpacing: '0.5px' }}>
           ✨ {affirmation} ✨
         </p>
      </div>
    </motion.div>
  );
}

const SacredReflections = () => {
  const [reflections, setReflections] = useState([]);

  useEffect(() => {
    const stories = JSON.parse(localStorage.getItem('aura_stories') || '[]');
    setReflections(stories.filter(s => s.status === 'approved'));
  }, []);

  if (reflections.length === 0) return null;

  return (
    <section id="reflections" style={{ padding: '8rem 0', background: 'var(--bg-section-alt)', overflow: 'hidden', position: 'relative' }}>
        <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h2 style={{ fontSize: '3rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Sacred Reflections</h2>
                <div style={{ width: '60px', height: '3px', background: 'var(--accent-gold)', margin: '1rem auto' }}></div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Echoes of awakening from the global collective.</p>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', position: 'relative' }}>
                {reflections.map((story, i) => (
                    <motion.div
                        key={story.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                            duration: 0.8, 
                            delay: i * 0.2,
                            scale: { type: "spring", stiffness: 100 },
                            y: {
                                duration: 4 + Math.random() * 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        }}
                        animate={{
                            y: [0, -15, 0],
                        }}
                        whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.2 } }}
                        className="glass card-hover"
                        style={{
                            padding: '3rem',
                            borderRadius: '50%',
                            width: '320px',
                            height: '320px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 80%)',
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            cursor: 'default',
                            boxShadow: '0 0 30px rgba(212, 175, 55, 0.05)'
                        }}
                    >
                        <Quote size={24} style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', opacity: 0.4 }} />
                        <p style={{ fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                           "{story.story.length > 130 ? story.story.substring(0, 127) + '...' : story.story}"
                        </p>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {story.userName}
                        </div>
                        <div style={{ display: 'flex', gap: '3px', marginTop: '8px' }}>
                             {[...Array(story.rating)].map((_, i) => (
                                <Star key={i} size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />
                             ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
        
        {/* Decorative Ethereal Elements */}
        <div style={{ position: 'absolute', top: '20%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(155, 89, 182, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
    </section>
  );
};


function App() {
  const [theme, setTheme] = useState(localStorage.getItem('aura_theme') || 'dark');
  const [scrolled, setScrolled] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [showPortal, setShowPortal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAIInterface, setShowAIInterface] = useState(false);
  const [showAuraGuide, setShowAuraGuide] = useState(false);
  const [showScience, setShowScience] = useState(false); // Science Modal
  const [showHealerDashboard, setShowHealerDashboard] = useState(false); // Admin access
  const [showAdminLogin, setShowAdminLogin] = useState(false); // NEW: Staff/Admin login
  const [bookingType, setBookingType] = useState(null); 
  const [videoIndex, setVideoIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  // NEW: User Account State
  const [user, setUser] = useState(null);
  const [showSignupFlow, setShowSignupFlow] = useState(false); // NEW: Single-page signup flow
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubscriptionPage, setShowSubscriptionPage] = useState(false); // Dedicated Page
  const [showHealerApp, setShowHealerApp] = useState(false); // NEW: Healer Application
const [showUserFullDashboard, setShowUserFullDashboard] = useState(false); // NEW: Full User Dashboard
const [activeSession, setActiveSession] = useState(null); // Active Live Session
const [showLivePortal, setShowLivePortal] = useState(false);
const [showJoinPortalModal, setShowJoinPortalModal] = useState(false);
const [showMyStories, setShowMyStories] = useState(false);
const [healerAppsEnabled, setHealerAppsEnabled] = useState(localStorage.getItem('aura_applications_enabled') !== 'false');
const [showCheckoutModal, setShowCheckoutModal] = useState(false);


  useEffect(() => {
    if (isFirebaseConfigured()) {
      // Firebase auth state listener — reactive login/logout
      const unsubscribe = auth.onAuthStateChange(async (event, firebaseUser) => {
        if (firebaseUser) {
          try {
            const profile = await db.getProfile(firebaseUser.uid);
            if (profile) {
              setUser(profile);
              localStorage.setItem('user_profile', JSON.stringify(profile));
            } else {
              // Auth exists but no profile yet (signup in progress)
              setUser({
                name: firebaseUser.displayName || '',
                email: firebaseUser.email,
                role: 'seeker',
                status: 'Active'
              });
            }
          } catch (err) {
            console.error('Error loading profile:', err);
          }
        } else {
          setUser(null);
          localStorage.removeItem('user_profile');
        }
      });
      return () => unsubscribe();
    } else {
      // Fallback: localStorage for local dev
      try {
        const savedUser = localStorage.getItem('user_profile');
        if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        localStorage.removeItem('user_profile');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('aura_theme', newTheme);
    toast.success(`Switching to ${newTheme} resonance...`);
  };

  // NEW: Volume Handler
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    const iframe = document.getElementById('healing-audio-iframe');
    if (iframe) {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'setVolume',
        args: [newVolume]
      }), 'https://www.youtube.com');
    }
  };

  // Auto-rotate visuals every 8 seconds for meditative flow
  useEffect(() => {
    if (showPortal && selectedProtocol) {
      const currentProto = protocols.find(p => p.id === selectedProtocol);
      if (Array.isArray(currentProto.video)) {
        const interval = setInterval(() => {
          if (!isPaused) {
            setVideoIndex(prev => (prev + 1) % currentProto.video.length);
          }
        }, 8000);
        return () => clearInterval(interval);
      }
    }
  }, [showPortal, selectedProtocol]);

  const handleUpdateUser = (updatedProfile) => {
    setUser(updatedProfile);
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
    
    // Also update client archive
    const currentClients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    const updatedClients = currentClients.map(c => c.email === updatedProfile.email ? updatedProfile : c);
    localStorage.setItem('aura_clients', JSON.stringify(updatedClients));
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showPortal) {
      setVideoIndex(0);
      setIsPaused(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, [showPortal]);

  const toggleFullscreen = () => {
    const element = document.getElementById('protocol-portal-root');
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => {
        toast.error("Fullscreen resonance blocked by browser.");
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProtocolEnd = () => {
    setShowPortal(false);
    if (!user) return;

    const currentProto = protocols.find(p => p.id === selectedProtocol);
    const newLog = {
      id: Date.now(),
      protocolId: selectedProtocol,
      protocolName: currentProto?.name,
      timestamp: new Date().toISOString(),
      hzGain: (Math.random() * 5 + 10).toFixed(1)
    };

    // Save to logs
    const logs = JSON.parse(localStorage.getItem('vibrational_logs') || '[]');
    localStorage.setItem('vibrational_logs', JSON.stringify([newLog, ...logs].slice(0, 50)));

    // --- Healing Streak Calculation ---
    const today = new Date().toDateString();
    const streakData = JSON.parse(localStorage.getItem('healing_streak') || '{}');
    let currentStreak = streakData.streak || 0;
    const lastDate = streakData.lastDate;

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        currentStreak += 1; // Consecutive day
      } else if (!lastDate) {
        currentStreak = 1; // First ever session
      } else {
        currentStreak = 1; // Streak broken, reset
      }
      localStorage.setItem('healing_streak', JSON.stringify({ streak: currentStreak, lastDate: today, longestStreak: Math.max(currentStreak, streakData.longestStreak || 0) }));
    }

    // Update user session count and streak
    const updatedUser = {
      ...user,
      sessions: (user.sessions || 0) + 1,
      streak: currentStreak,
      longestStreak: Math.max(currentStreak, user.longestStreak || 0)
    };
    setUser(updatedUser);
    localStorage.setItem('user_profile', JSON.stringify(updatedUser));
    
    // Streak milestone toasts
    if (currentStreak === 3) toast.success('🔥 3-Day Healing Streak! Your aura is intensifying.');
    else if (currentStreak === 7) toast.success('✨ 7-Day Mastery Streak! You are radiating pure light.');
    else if (currentStreak === 30) toast.success('👑 30-Day Ascension Streak! Legendary status achieved.');
    else toast.success(`${currentProto?.name} integration complete. Frequency elevated.`);
  };


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
      <Stardust />
      {showPortal && currentProtocol && (
        <div id="protocol-portal-root" className="healing-portal-overlay fade-in">
          <div className="portal-content">
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10, display: 'flex', gap: '1rem' }}>
              <button 
                className="close-portal" 
                style={{ position: 'static', width: '45px', height: '45px', fontSize: '1.5rem' }} 
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
              <button 
                className="close-portal" 
                style={{ position: 'static', width: '45px', height: '45px', fontSize: '2rem' }} 
                onClick={() => setShowPortal(false)}
              >
                ×
              </button>
            </div>
            <div className="video-background" style={{overflow: 'hidden'}}>
              {Array.isArray(currentProtocol.video) ? (
                /* Cinematic Image Sequence Player (Ken Burns Effect) */
                <div style={{width: '100%', height: '100%', position: 'relative'}}>
                   {currentProtocol.video.map((src, idx) => (
                     <img 
                      key={src}
                       src={`/assets/${src}`}
                       alt="Healing Visual"
                       className={`${idx === videoIndex ? 'ken-burns-active' : ''} ${isPaused ? 'paused' : ''}`}
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
                  autoPlay={!isPaused} // Control autoplay based on isPaused
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
                  src={`https://www.youtube.com/embed/${videoSrc}?autoplay=${isPaused ? 0 : 1}&mute=1&controls=0&loop=1&playlist=${videoSrc}`} // Control autoplay
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
                    src={`https://www.youtube.com/embed/${currentProtocol.audio}?autoplay=${isPaused ? 0 : 1}&mute=1&loop=1&playlist=${currentProtocol.audio}&enablejsapi=1&origin=${window.location.origin}`} // Control autoplay
                    frameBorder="0" 
                    allow="autoplay; encrypted-media; fullscreen"
                    style={{opacity: 0.01}}
                  ></iframe>
                </div>
              )}

              {currentProtocol.isImmersive && (
                <DuckingAudioPlayer 
                  musicSrc={`https://www.youtube.com/embed/${currentProtocol.audio}?autoplay=1&mute=0&enablejsapi=1&origin=${window.location.origin}`} // Simplified for mock
                  ambientSrc={currentProtocol.ambient}
                  voiceSrc={currentProtocol.voice}
                  isPlaying={showPortal && !isPaused}
                  volume={volume}
                  onEnded={handleProtocolEnd}
                />
              )}
            </div>
            <div className="healing-ui">
              <div className="glass healing-status">
                <div style={{color: currentProtocol.color, fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '1px'}}>
                  {currentProtocol.name} ACTIVE
                </div>
                
                {/* Volume Control */}
                <div style={{marginTop: '0.5rem', width: '100%', maxWidth: '160px', margin: '0.5rem auto'}}>
                  <label style={{fontSize: '0.7rem', opacity: 0.7, marginBottom: '3px', display: 'block'}}>
                    Resonance Intensity
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume} 
                    onChange={handleVolumeChange}
                    style={{
                      width: '100%',
                      accentColor: currentProtocol.color,
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Pause/Play Control */}
                <div style={{ marginBottom: '0.8rem' }}>
                  <button 
                    onClick={() => setIsPaused(!isPaused)}
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
                    <div key={i} className={`bar ${isPaused ? 'paused' : ''}`} style={{animationDelay: `${i * 0.1}s`, backgroundColor: currentProtocol.color}}></div>
                  ))}
                </div>
                <p style={{fontSize: '0.75rem', opacity: '0.7', marginTop: '0.5rem'}}>
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
                      const unMuteIframe = () => {
                        const commands = [
                          { event: 'command', func: 'unMute' },
                          { event: 'command', func: 'setVolume', args: [volume] },
                          { event: 'command', func: 'playVideo' }
                        ];
                        commands.forEach(cmd => {
                          iframe.contentWindow.postMessage(JSON.stringify(cmd), 'https://www.youtube.com');
                        });
                      };

                      const currentSrc = iframe.src;
                      if (currentSrc.includes('mute=1')) {
                        iframe.src = currentSrc.replace('mute=1', 'mute=0');
                      }
                      
                      // Aggressive unmuting over several seconds to catch reloads
                      unMuteIframe();
                      [500, 1000, 2000, 3000].forEach(delay => {
                        setTimeout(unMuteIframe, delay);
                      });
                      
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
                    <h3 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Initiating Protocol...</h3>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '1rem' }}>Browser security requires manual activation for audio resonance.</p>
                    <div className="btn-primary" style={{ display: 'inline-block' }}>MATCH FREQUENCY</div>
                    
                    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                      <p style={{ color: 'var(--accent-ethereal)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        "Resonance calibrated. You may now enter the field."
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
        <div className="container nav-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="#" className="logo">Reiki & Sage</a>
          </div>

          <div className="nav-links">
            <a href="#about" style={{ marginLeft: '1.5rem' }}>Philosophy</a>
            <a href="#protocols" style={{ marginLeft: '0.8rem', marginRight: '2rem' }}>Protocols</a>
            <button 
                onClick={() => setShowSubscriptionPage(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-main)', fontSize: '1rem', fontFamily: 'inherit' 
                }}
            >
                Membership
            </button>
            
            <button 
              onClick={toggleTheme}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center'
              }}
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Symmetrical Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginLeft: '1.5rem', alignItems: 'center' }}>
              
              {/* Login / Profile Relocated Here */}
              {!user ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--accent-gold)',
                    cursor: 'pointer',
                    color: 'var(--accent-gold)',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    letterSpacing: '1px'
                  }}
                >
                  LOG IN
                </button>
              ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        if (user.subscription === 'healing' || user.role === 'owner') {
                          setShowUserFullDashboard(true);
                        } else {
                          toast.error("Guardian status required for Full Dashboard view.");
                          setShowSubscriptionPage(true);
                        }
                      }}
                      style={{
                        background: 'none', border: '1px solid var(--accent-gold)', cursor: 'pointer',
                        color: 'var(--accent-gold)', padding: '0.4rem 1rem', borderRadius: '20px',
                        fontSize: '0.75rem', letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                        opacity: (user.subscription === 'healing' || user.role === 'owner') ? 1 : 0.6
                      }}
                    >
                      <Sparkles size={14} /> {user.username || user.email}
                    </button>
                    <button 
                      onClick={async () => {
                          try {
                            if (isFirebaseConfigured()) await auth.signOut();
                          } catch (e) { /* ignore signout errors */ }
                          setUser(null);
                          localStorage.removeItem('user_profile');
                          toast.success('Disconnected peacefully.');
                      }}
                      style={{
                        background: 'none', border: '1px solid rgba(255,100,100,0.3)', cursor: 'pointer',
                        color: '#ff7675', padding: '0.4rem 0.6rem', borderRadius: '20px',
                        fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center'
                      }}
                      title="Log Out"
                    >
                      <LogOut size={12} />
                    </button>
                  </div>
              )}

              <button 
                onClick={() => setShowAuraGuide(true)}
                style={{
                  background: 'none', border: '1px solid var(--accent-ethereal)', cursor: 'pointer',
                  color: 'var(--accent-ethereal)', padding: '0.6rem 1.25rem', borderRadius: '20px',
                  fontSize: '0.8rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                CONSULT AURA
              </button>
              
              <button 
                onClick={() => document.getElementById('mobile-service').scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-primary" 
                style={{ padding: '0.6rem 1.5rem' }}
              >
                Set Appointment
              </button>
            </div>

          </div>
        </div>
      </nav>

      <div style={{ padding: '0.5rem 0', backgroundColor: 'var(--bg-section)' }}>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', width: '80%', margin: '0 auto 1.5rem auto' }}></div>
        <Suspense fallback={null}>
          <HealingActionBar 
            onActivate={() => setShowAIInterface(true)} 
            onJoinPortal={() => setShowJoinPortalModal(true)}
          />
        </Suspense>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', width: '80%', margin: '1.5rem auto 0 auto' }}></div>
      </div>

      <section className="hero">
        <div className="container">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center'}}>
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p style={{fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '500px'}}>
                Experience the convergence of ancient wisdom and futuristic energy medicine. Our advanced Reiki system harmonizes your biofield with surgical precision.
              </p>
              
              {user && (
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.5rem'}} onClick={() => document.getElementById('user-dashboard-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold'}}>
                    {user.name.charAt(0)}
                  </div>
                  {user.name}
                </div>
              )}

              <div style={{display: 'flex', gap: '1.5rem'}}>
                <button 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  onClick={() => {
                    if (!user) {
                        // Toggle logic for signup flow
                        const newState = !showSignupFlow;
                        setShowSignupFlow(newState);
                        if (newState) {
                          setTimeout(() => {
                            document.getElementById('signup-flow-section')?.scrollIntoView({ behavior: 'smooth' });
                          }, 300);
                        }
                    } else if (user.subscription === 'healing' || user.role === 'owner') {
                        // Scroll to protocols
                        document.getElementById('protocols-section').scrollIntoView({ behavior: 'smooth' });
                    } else {
                        setShowSubscriptionPage(true);
                    }
                  }}
                >
                  <Zap size={18} /> {user && (user.subscription === 'healing' || user.role === 'owner') ? 'Access Sanctuary' : user ? 'Upgrade Resonance' : (showSignupFlow ? 'Close Application' : 'Start Your Journey')}
                </button>
                
                {!user && (
                  <p style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.9rem' }}>
                    Already have an account?{' '}
                    <span 
                      onClick={() => setShowLoginModal(true)}
                      style={{ 
                        color: 'var(--accent-gold)', 
                        cursor: 'pointer', 
                        textDecoration: 'underline' 
                      }}
                    >
                      Log In
                    </span>
                  </p>
                )}
                <button 
                  className="btn" 
                  style={{background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)'}}
                  onClick={() => setShowScience(true)}
                >
                  See the Science
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
                style={{ position: 'absolute', top: '-20px', right: '-20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', padding: '15px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                onClick={() => setShowMyStories(true)}
              >
                <Sparkles color="var(--accent-gold)" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {showSignupFlow && !user && (
        <SignupFlow
          onComplete={(profile) => {
            setUser(profile);
            localStorage.setItem('user_profile', JSON.stringify(profile));
            setShowSignupFlow(false);
            
            // Add to client archive immediately
            const currentClients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
            if (!currentClients.find(c => c.email === profile.email)) {
              localStorage.setItem('aura_clients', JSON.stringify([...currentClients, profile]));
            }

            toast.success(`Welcome to the sanctuary, ${profile.name}!`);
            
            // Scroll to user dashboard
            setTimeout(() => {
              document.getElementById('user-dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
          }}
          onCancel={() => setShowSignupFlow(false)}
        />
      )}

      {/* User Dashboard Inline - Appears after login */}
      <UserDashboardInline 
        user={user}
        onOpenFullDashboard={() => {
          if (user.subscription === 'healing' || user.role === 'owner') {
            setShowUserFullDashboard(true);
          } else {
            toast.error("Guardian status required for Full Dashboard view.");
            setShowSubscriptionPage(true);
          }
        }}
        onUpdateUser={handleUpdateUser}
        onNavigateToBooking={() => document.getElementById('mobile-service')?.scrollIntoView({ behavior: 'smooth' })}
        onNavigateToProtocols={() => document.getElementById('protocols-section')?.scrollIntoView({ behavior: 'smooth' })}
        onUpgrade={() => setShowSubscriptionPage(true)}
      />

      <AnimatePresence>
        {showUserFullDashboard && user && (
          <Suspense fallback={null}>
            <UserDashboard 
              user={user} 
              onClose={() => setShowUserFullDashboard(false)} 
              onUpdateUser={handleUpdateUser}
              onNavigateToBooking={() => {
                setShowUserFullDashboard(false);
                document.getElementById('mobile-service')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onNavigateToProtocols={() => {
                setShowUserFullDashboard(false);
                document.getElementById('protocols-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onJoinLivePortal={(session) => {
                setActiveSession(session);
                setShowLivePortal(true);
              }}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
        <DailyFrequency />
      </div>

      <section id="about" style={{backgroundColor: 'var(--bg-section)'}}>
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: '4rem'}}>
            <h2 style={{fontSize: '3rem', color: 'var(--text-main)'}}>Complete Compassion & Caring</h2>
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

      <section id="protocols-section" style={{backgroundColor: 'var(--bg-section)'}}>
        <div className="container" style={{textAlign: 'center'}}>
          <h2 style={{fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)'}}>Advanced Harmonization Protocols</h2>
          <p style={{marginBottom: '4rem', opacity: '0.7', color: 'var(--text-muted)'}}>Select a protocol below to synchronize with the Gemstone Core.</p>
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
                onClick={() => {
                  if (protocol.tier === 'advanced' && (!user || user.subscription !== 'healing')) {
                      toast.error("Advanced Protocol Locked. Upgrade to access.");
                      setShowSubscriptionPage(true); // Direct to plan page
                      return;
                  }
                  setSelectedProtocol(protocol.id);
                }}
              >
                <div style={{
                  height: '200px', 
                  overflow: 'hidden', 
                  borderRadius: '12px', 
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative'
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
                  {protocol.isImmersive && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'var(--accent-gold)',
                      color: '#000',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                      <Clock size={10} /> 10 MIN IMMERSION
                    </div>
                  )}
                </div>
                <h4 style={{fontSize: '1.5rem', marginBottom: '1rem', color: protocol.color}}>{protocol.name}</h4>
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>{protocol.desc}</p>
                {selectedProtocol === protocol.id && (
                  <div style={{marginTop: '1.5rem', color: protocol.color, fontWeight: '700'}}>PROTOCOL SELECTED</div>
                )}
                {protocol.tier === 'advanced' && (!user || user.subscription !== 'healing') && (
                    <div style={{
                        position: 'absolute', top: '1rem', right: '1rem', 
                        background: 'rgba(0,0,0,0.6)', padding: '0.5rem', borderRadius: '50%'
                    }}>
                        <Lock size={24} color="#bdc3c7" />
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Login Modal */}
      <Suspense fallback={null}>
        {showAdminLogin && (
          <AdminLogin 
            onLogin={() => {
              setShowAdminLogin(false);
              setShowHealerDashboard(true);
              toast.success("Welcome back, Healer.");
            }} 
            onClose={() => setShowAdminLogin(false)} 
          />
        )}
      </Suspense>

      {/* Science Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        {showScience && <ScienceModal onClose={() => setShowScience(false)} />}
      </Suspense>

      {/* Admin Dashboard */}
      <Suspense fallback={<LoadingSpinner />}>
        {showHealerDashboard && (
          <HealerDashboard 
            onClose={() => setShowHealerDashboard(false)} 
            onJoinPortal={(session) => {
              setActiveSession(session);
              setShowLivePortal(true);
            }}
          />
        )}
      </Suspense>

      {/* Dedicated Subscription Page */}
      <Suspense fallback={<LoadingSpinner />}>
        {showSubscriptionPage && (
            <SubscriptionPage 
                onClose={() => setShowSubscriptionPage(false)}
                onUpgrade={() => {
                    if (user) {
                        setShowSubscriptionPage(false);
                        setShowCheckoutModal(true);
                    } else {
                        setShowSubscriptionPage(false);
                        setShowSignupFlow(true);
                        toast.error("Please create an account to upgrade.");
                    }
                }}
            />
        )}
      </Suspense>

      {/* Sacred Energy Exchange Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.9)', zIndex: 11000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(20px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              style={{
                width: '100%', maxWidth: '500px', background: '#0a0a0f',
                padding: '3rem', borderRadius: '32px', border: '1px solid rgba(212, 175, 55, 0.3)',
                position: 'relative'
              }}
            >
              <button 
                onClick={() => setShowCheckoutModal(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}
              >
                ✕
              </button>
              <BillingForm 
                buttonText="ACTIVATE RESONANCE"
                onSubmit={(data) => {
                  toast.loading("Verifying energetic credentials...");
                  setTimeout(() => {
                    const updatedUser = { 
                      ...user, 
                      subscription: 'healing',
                      role: user.role || 'user' // Ensure role exists
                    };
                    setUser(updatedUser);
                    localStorage.setItem('user_profile', JSON.stringify(updatedUser));
                    
                    // Update client list for healers
                    const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
                    const updatedClients = clients.map(c => c.email === user.email ? updatedUser : c);
                    localStorage.setItem('aura_clients', JSON.stringify(updatedClients));
                    
                    setShowCheckoutModal(false);
                    toast.dismiss();
                    toast.success("Resonance Field Expanded. Welcome, Guardian.");
                  }, 2500);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {user && (user.role === 'admin' || user.role === 'owner') && (
        <div 
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9000
          }}
          className="fade-in"
        >
          <button
            onClick={() => setShowHealerDashboard(true)}
            style={{
              background: 'rgba(20, 20, 30, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '12px 24px',
              borderRadius: '30px',
              color: 'var(--accent-gold)',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '2px 10px 30px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', gap: '8px',
              letterSpacing: '1px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'var(--accent-gold)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '2px 15px 40px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--accent-gold)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '2px 10px 30px rgba(0,0,0,0.4)';
            }}
          >
            <Shield size={16} /> HEALER DASHBOARD
          </button>
        </div>
      )}

      <SacredReflections />
      
      <footer style={{padding: '4rem 0', textAlign: 'left', backgroundColor: 'var(--bg-section-alt)', color: 'var(--text-main)', borderTop: '1px solid rgba(255,255,255,0.05)'}}>
        <div className="container" style={{maxWidth: '1200px', margin: '0 2rem'}}>
          <h2 style={{color: 'var(--accent-ethereal)', marginBottom: '0.5rem', letterSpacing: '2px'}}>Reiki & Sage</h2>
          <p style={{opacity: '0.8', marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem'}}>
            The future of healing is compassionate, advanced, and uniquely yours.
          </p>
          <div style={{fontSize: '0.8rem', opacity: '0.6', color: 'var(--text-muted)', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px', flexWrap: 'wrap'}}>
            <span>© 2026 Reiki & Sage Healing Arts. All rights reserved.</span>
            <span>|</span>
            <span 
              onClick={() => setShowAdminLogin(true)}
              style={{cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-muted)'}}
            >
              Staff
            </span>
            {healerAppsEnabled && (
              <>
                <span>|</span>
                <span 
                  onClick={() => {
                    if (!user) {
                      toast.error("Please log in to apply.");
                      setShowLoginModal(true);
                    } else {
                      setShowHealerApp(true);
                    }
                  }}
                  style={{cursor: 'pointer', textDecoration: 'underline', color: 'var(--accent-gold)'}}
                >
                  Apply to be a Healer
                </span>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Styles moved to App.css */}


      {/* AI Healer Components */}
      <Suspense fallback={null}>
        {showAIInterface && (
          <AIHealerInterface 
            user={user} 
            onClose={() => setShowAIInterface(false)} 
            onOpenBooking={() => setBookingType('portable')}
            onOpenLogin={() => setShowLoginModal(true)}
            onApply={() => setShowHealerApp(true)}
          />
        )}
      </Suspense>
      
      {/* Aura Consultation Guide Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        {showAuraGuide && (
          <AuraGuide 
            onClose={() => setShowAuraGuide(false)} 
            onConsult={() => {
              setShowAuraGuide(false);
              setShowAIInterface(true);
            }}
          />
        )}
      </Suspense>

      {/* Science Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        {showScience && <ScienceModal onClose={() => setShowScience(false)} />}
      </Suspense>
      
      {/* Subscription & Signup Modals */}
      <Suspense fallback={<LoadingSpinner />}>


        {showLoginModal && (
          <Login
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={(profile) => {
              setUser(profile);
              setShowLoginModal(false);
              
              // Smooth scroll to top of homepage per user request
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
            }}
          />
        )}

        {/* OLD SIGNUP MODAL - COMPLETELY REMOVED */}
        
      </Suspense>

      {/* Healer Application Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        {showHealerApp && (
          <HealerApplicationModal 
            user={user} 
            onClose={() => setShowHealerApp(false)} 
          />
        )}
      </Suspense>

      {/* Live Resonance Portal Overlay */}
      <Suspense fallback={<LoadingSpinner />}>
        {showLivePortal && (
          <LiveResonancePortal 
            user={user}
            session={activeSession}
            onClose={() => setShowLivePortal(false)}
          />
        )}
      </Suspense>

      {/* Collective Reverie (My Stories) Portal */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {showMyStories && (
            <MyStoriesPortal onClose={() => setShowMyStories(false)} />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Booking Interface */}
      <Suspense fallback={<LoadingSpinner />}>
        {bookingType && (
          <BookingInterface 
            type={bookingType} 
            onClose={() => setBookingType(null)} 
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        <AnimatePresence>
          {showJoinPortalModal && (
            <JoinPortalModal 
              onClose={() => setShowJoinPortalModal(false)}
              onJoin={(session) => {
                setActiveSession(session);
                setShowLivePortal(true);
              }}
            />
          )}
        </AnimatePresence>
      </Suspense>
      <Suspense fallback={null}>
        <AnimatePresence>
          {showUserFullDashboard && (
            <UserDashboard 
              user={user}
              onClose={() => setShowUserFullDashboard(false)}
              onUpdateUser={handleUpdateUser}
              onNavigateToBooking={() => {
                setShowUserFullDashboard(false);
                setBookingType('portable');
              }}
              onNavigateToProtocols={() => {
                setShowUserFullDashboard(false);
                document.getElementById('protocols-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onJoinLivePortal={(session) => {
                setShowUserFullDashboard(false);
                setActiveSession(session);
                setShowLivePortal(true);
              }}
            />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Healer Dashboard (Immersive Management) */}
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence>
          {showHealerDashboard && (
            <HealerDashboard 
              onClose={() => setShowHealerDashboard(false)} 
              healerAppsEnabled={healerAppsEnabled}
              onToggleHealerApps={(val) => {
                setHealerAppsEnabled(val);
                localStorage.setItem('aura_applications_enabled', val);
              }}
              onJoinPortal={(session) => {
                setShowHealerDashboard(false);
                setActiveSession(session);
                setShowLivePortal(true);
              }}
            />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Admin/Staff Login Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence>
          {showAdminLogin && (
            <AdminLogin 
              onClose={() => setShowAdminLogin(false)}
              onLogin={() => {
                // Fetch the newly logged in admin profile
                const profile = JSON.parse(localStorage.getItem('user_profile'));
                setUser(profile);
                setShowAdminLogin(false);
                setShowHealerDashboard(true);
                toast.success(`Welcome back, ${profile.name}`);
              }}
            />
          )}
        </AnimatePresence>
      </Suspense>

    </div>
  )
}

export default App
