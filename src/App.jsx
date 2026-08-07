import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Activity, Shield, Info, Heart, Zap, Waves, Moon, Sun, 
  LogOut, Lock, Clock, Quote, Star, MessageSquare, Play, Pause, Maximize, Minimize,
  Home, Grid, Compass, User, Shuffle, BookOpen, Bell, ArrowRight, Calendar
} from 'lucide-react'
import { aiKnowledgeBase } from './components/aiKnowledgeBase'
import { Toaster, toast } from 'react-hot-toast'
import { UserDashboardInline } from './components/UserDashboardInline'
import { auth, db, isFirebaseConfigured } from './lib/firebase'
import { loadGamificationState, saveGamificationState, processSessionComplete, syncToFirestore } from './utils/gamification'
import './App.css'
import './components/AuraGuide.css'

// Robust Lazy Load Helper (Auto-reloads if bundle hash changes across Vercel deployments)
const safeLazy = (importFn) =>
  lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.warn('Dynamic import failed, reloading to fetch latest deployment bundle:', error);
      window.location.reload();
      return { default: () => null };
    }
  });

const HealingActionBar = safeLazy(() => import('./components/HealingActionBar'));
const AIHealerInterface = safeLazy(() => import('./components/AIHealerInterface'));
const BookingInterface = safeLazy(() => import('./components/BookingInterface'));
const HealerDashboard = safeLazy(() => import('./components/HealerDashboard'));
const StaffHealerDashboard = safeLazy(() => import('./components/StaffHealerDashboard'));
const AdminLogin = safeLazy(() => import('./components/AdminLogin'));
const ScienceModal = safeLazy(() => import('./components/ScienceModal'));
const AuraGuide = safeLazy(() => import('./components/AuraGuide'));
const SignupFlow = safeLazy(() => import('./components/SignupFlow'));
const Login = safeLazy(() => import('./components/Login'));
const HealerApplicationModal = safeLazy(() => import('./components/HealerApplicationModal'));
const UserDashboard = safeLazy(() => import('./components/UserDashboard'));
const LiveResonancePortal = safeLazy(() => import('./components/LiveResonancePortal'));
const JoinPortalModal = safeLazy(() => import('./components/JoinPortalModal'));
const MyStoriesPortal = safeLazy(() => import('./components/MyStoriesPortal'));
const SubscriptionPage = safeLazy(() => import('./components/SubscriptionPage'));
const LegalModal = safeLazy(() => import('./components/LegalModal'));
const LearnSection = safeLazy(() => import('./components/LearnSection'));
const SonicSoundBaths = safeLazy(() => import('./components/SonicSoundBaths'));
const BiofieldPulse = safeLazy(() => import('./components/BiofieldPulse'));
const VoiceReflectionStudio = safeLazy(() => import('./components/VoiceReflectionStudio'));
import DuckingAudioPlayer from './components/DuckingAudioPlayer';
import BillingForm from './components/BillingForm';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

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
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.5 + 0.2
      }))
    );
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="stardust"
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
            opacity: star.opacity
          }}
        />
      ))}
    </div>
  );
};

const getRandomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const protocols = [
  /* Protocols with sequence data and audio IDs */
  {
    id: 'amethyst',
    name: 'Amethyst Core Purge',
    color: '#8e44ad',
    borderColor: '#9b59b6',
    isImmersive: true,
    active: true,
    duration: 600,
    video: [
      'amethyst_resonance.png',
      'amethyst_aura_realistic_1769877822836.png',
      'sage_protocol_cosmic_alignment_1770424972911.png',
      'amethyst_core_purge_macro_1769852056191.png',
      'amethyst_macro_realistic_1769877807331.png',
      'amethyst_core_purge_aura_1769852069785.png',
      'hero-energy.png',
      'compassion-glow.png',
      'crystal-resonance.png',
      'quartz_lattice_field_1769852099553.png',
      'quartz_lattice_macro_1769852085365.png',
      'energy-portal.png',
      'reiki_crown_chakra_light_1770423834100.png'
    ],
    audio: '', // Violet Flame 528Hz Meditation
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
    active: true,
    duration: 600,
    video: [
      'quartz_resonance.png',
      'quartz_macro_realistic_1769877835658.png',
      'quartz_aura_realistic_1769877849374.png',
      'quartz_lattice_macro_1769852085365.png',
      'quartz_lattice_field_1769852099553.png',
      'reiki_crown_chakra_light_1770423834100.png',
      'sage_protocol_crystal_cave_1770441218348.png',
      'sage_sacred_purify_1770423875666.png'
    ],
    audio: '', // Quartz Lattice 432Hz Meditation
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
    active: true,
    duration: 600,
    video: [
      'rose_resonance.png',
      'rose_macro_realistic_1769877861535.png',
      'rose_aura_realistic_1769877874595.png',
      'rose_quartz_macro_1769852112446.png',
      'rose_quartz_field_1769852125920.png',
      'compassion-glow.png',
      'sage_protocol_heart_emerald_1770425202896.png',
      'sage_protocol_heart_resonance_1770424959673.png',
      'sage_protocol_heart_glow_1770425071893.png'
    ],
    audio: '', // Ethereal Heart Chakra Music 432Hz
    voice: '/assets/rose_meditation_voice.mp3',
    desc: 'Advanced 10-minute heart-centered journey. Facilitates deep emotional release and compassion through soft radiance and harmonic heart-sync.',
    tier: 'basic'
  },
  {
    id: 'lapis',
    name: 'Lapis Wisdom Resonance',
    color: '#3498db',
    borderColor: '#2980b9',
    isImmersive: true,
    active: true,
    duration: 600,
    video: [
      'lapis_resonance.png',
      'lapis_macro.png',
      'lapis_aura.png',
      'sage_protocol_cosmic_alignment_1770424972911.png',
      'sage_protocol_starlight_ocean_v2_1770441141710.png',
      'sage_protocol_seagulls_sky_1770425239432.png',
      'sage_protocol_purge_1770423911044.png',
      'forest_natural_path_intelligence_1770423845946.png'
    ],
    audio: '', // 852Hz Awakening Intuition (Fixed)
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
    active: false,
    duration: 600,
    video: [
      'citrine_macro.png',
      'citrine_aura.png',
      'sage_protocol_macro_gold_1770425190644.png',
      'sage_ocean_sunrise_1770425017610.png',
      'hero-energy.png',
      'energy-portal.png',
      'sage_protocol_reiki_light_1770423936670.png',
      'sage_protocol_sunrise_ocean_1770425084382.png',
      'reiki_crown_chakra_light_1770423834100.png'
    ],
    audio: '', // Solar Plexus 528Hz
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
    active: false,
    duration: 600,
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
    audio: '', // Native American Flute (Background)
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
    active: false,
    duration: 900,
    video: [
      'reiki_crown_chakra_light_1770423834100.png',
      'energy-portal.png',
      'sage_protocol_reiki_light_1770423936670.png',
      'amethyst_core_purge_aura_1769852069785.png',
      'sage_protocol_cosmic_alignment_1770424972911.png',
      'sage_protocol_crystal_cave_1770441218348.png',
      'sage_protocol_heart_glow_1770425071893.png',
      'hero-energy.png',
      'sage_protocol_starlight_ocean_v2_1770441141710.png',
      'sage_sacred_purify_1770423875666.png'
    ],
    audio: '', // Ambient 528Hz background music
    voice: '/assets/reiki_meditation_voice.mp3',
    desc: 'Immersive 15-minute guided Reiki healing journey. Carissa\'s gentle voice leads you through universal life force energy alignment and deep restoration.',
    tier: 'advanced'
  },
  {
    id: 'celestial',
    name: 'Celestial Fantasia',
    color: '#1a1a4e',
    borderColor: '#4a2f8a',
    isImmersive: true,
    active: false,
    duration: 900,
    video: [
      'sage_protocol_cosmic_alignment_1770424972911.png',
      'energy-portal.png',
      'amethyst_core_purge_aura_1769852069785.png',
      'sage_protocol_starlight_ocean_v2_1770441141710.png',
      'sage_protocol_crystal_cave_1770441218348.png',
      'reiki_crown_chakra_light_1770423834100.png',
      'quartz_lattice_field_1769852099553.png',
      'rose_quartz_field_1769852125920.png',
      'sage_protocol_heart_glow_1770425071893.png',
      'hero-energy.png'
    ],
    audio: '', // Ambient orchestral/ethereal background music
    voice: '/assets/celestial_meditation_voice.mp3',
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
                                duration: 4 + (i % 3) * 0.8,
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





function AppContent() {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageDropdownState, setShowLanguageDropdownState] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(() => {
    return localStorage.getItem('aura_disclaimer_accepted') === 'true';
  });
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem('aura_theme') || 'dark');
  const [scrolled, setScrolled] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [showPortal, setShowPortal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAIInterface, setShowAIInterface] = useState(false);
  const [showAuraGuide, setShowAuraGuide] = useState(false);
  const [showScience, setShowScience] = useState(false); // Science Modal
  const [showMeditationModal, setShowMeditationModal] = useState(false); // Guided Meditation Modal
  const [showHealerDashboard, setShowHealerDashboard] = useState(false); // Admin access
  const [showAdminLogin, setShowAdminLogin] = useState(false); // NEW: Staff/Admin login
  const [showLegalModal, setShowLegalModal] = useState(null); // 'terms' | 'privacy' | 'disclaimer' | null
  const [showSoundBaths, setShowSoundBaths] = useState(false);
  const [showBiofieldPulse, setShowBiofieldPulse] = useState(false);
  const [showVoiceReflectionStudio, setShowVoiceReflectionStudio] = useState(false);
  const [showLayoutDropdown, setShowLayoutDropdown] = useState(false); // Dropdown for viewport mode
  const [bookingType, setBookingType] = useState(null); 
  const [videoIndex, setVideoIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [volume, setVolume] = useState(50);
  const [binauralEnabled, setBinauralEnabled] = useState(false);
  const [binauralCarrier, setBinauralCarrier] = useState(432);
  const [binauralBeat, setBinauralBeat] = useState(6);
  const [binauralVolume, setBinauralVolume] = useState(30);
  // NEW: User Account State
  const [user, setUser] = useState(null);
  const isPremiumUser = user && (
    user.subscription === 'healing' || 
    user.subscriptionStatus === 'active' || 
    ['healer', 'admin', 'owner'].includes(user.role?.toLowerCase())
  );
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
  const [meditationConsent, setMeditationConsent] = useState(false);
  const [meditationConsentPending, setMeditationConsentPending] = useState(false);

  // NEW: Tablet/Mobile App Shell States
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w <= 768) return 'mobile';
      if (w <= 1023) return 'tablet';
    }
    return 'desktop';
  });
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'protocols' | 'learning' | 'ai-guide' | 'dashboard'
  const [protocolList, setProtocolList] = useState(() => {
    const saved = localStorage.getItem('aura_protocols_active');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return protocols.map(p => ({
          ...p,
          active: Object.prototype.hasOwnProperty.call(parsed, p.id) ? parsed[p.id] : p.active
        }));
      } catch {
        return protocols;
      }
    }
    return protocols;
  });

  const handleToggleProtocol = (id) => {
    const updated = protocolList.map(p => p.id === id ? { ...p, active: !p.active } : p);
    setProtocolList(updated);
    
    // Save to local storage
    const activeMap = {};
    updated.forEach(p => { activeMap[p.id] = p.active; });
    localStorage.setItem('aura_protocols_active', JSON.stringify(activeMap));
    
    // Sync to Firestore if configured
    if (isFirebaseConfigured()) {
      db.updateSettings('protocols', activeMap)
        .then(() => toast.success("Gemstone Core status updated in cloud."))
        .catch(err => console.error("Failed to sync protocols to Firestore:", err));
    } else {
      toast.success("Protocol status updated locally.");
    }
  };

  // Auto-reset selectedProtocol if it becomes deactivated
  useEffect(() => {
    if (selectedProtocol) {
      const current = protocolList.find(p => p.id === selectedProtocol);
      if (!current || !current.active) {
        const firstActive = protocolList.find(p => p.active);
        setSelectedProtocol(firstActive ? firstActive.id : null);
      }
    }
  }, [protocolList, selectedProtocol]);


  // NEW: PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstruction, setShowIOSInstruction] = useState(false);

  // Gamification State
  const [gamificationState, setGamificationState] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(null);

  const currentProtocol = protocolList.find(p => p.id === selectedProtocol);
  const activeProtocols = protocolList.filter(p => p.active);

  const selectRandomProtocol = () => {
    const available = activeProtocols.filter(p => p.id !== selectedProtocol);
    if (available.length > 0) {
      const random = getRandomItem(available);
      setSelectedProtocol(random.id);
      toast.success(`🎲 Random selection: ${random.name}`);
    }
  };

  const videoSrc = Array.isArray(currentProtocol?.video) 
    ? currentProtocol.video[videoIndex] 
    : currentProtocol?.video;

  // Auto-detect device on resize (orientation changes etc.)
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w <= 768) setViewMode('mobile');
      else if (w <= 1023) setViewMode('tablet');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Detect iOS
    const isIpadOrIphone = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(isIpadOrIphone);

    // If not already running as installed app
    if (!isStandalone) {
      if (isIpadOrIphone) {
        setShowInstallBanner(true);
      } else {
        // Check if global event has already fired
        if (window.deferredPrompt) {
          setDeferredPrompt(window.deferredPrompt);
          setShowInstallBanner(true);
        }

        const handlePrompt = (e) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setShowInstallBanner(true);
        };
        window.addEventListener('beforeinstallprompt', handlePrompt);
        window.onBeforeInstallPrompt = handlePrompt;

        return () => {
          window.removeEventListener('beforeinstallprompt', handlePrompt);
          window.onBeforeInstallPrompt = null;
        };
      }
    }
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured()) {
      db.getSettings('protocols')
        .then(savedActiveMap => {
          if (savedActiveMap) {
            setProtocolList(prevList => prevList.map(p => ({
              ...p,
              active: Object.prototype.hasOwnProperty.call(savedActiveMap, p.id) ? savedActiveMap[p.id] : p.active
            })));
            
            // Sync local storage
            localStorage.setItem('aura_protocols_active', JSON.stringify(savedActiveMap));
          }
        })
        .catch(err => console.error("Failed to load active protocols from Firestore:", err));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingStatus = params.get('booking');
    const sessionId = params.get('session_id');

    if (bookingStatus === 'success') {
      const tentative = localStorage.getItem('tentative_booking');
      if (tentative) {
        try {
          const booking = JSON.parse(tentative);
          if (!sessionId || booking.sessionId === sessionId) {
            const finalBooking = {
              id: Date.now(),
              type: booking.serviceType === 'onsite' ? 'On-Site Session' : 'Live Portal Session',
              serviceType: booking.serviceType,
              date: booking.date,
              time: booking.time,
              client: { name: booking.name, email: booking.email, phone: booking.phone },
              status: 'confirmed',
              paymentStatus: 'paid',
              stripeSessionId: booking.sessionId,
              created: new Date().toISOString()
            };

            const bookingsList = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
            if (!bookingsList.some(b => b.stripeSessionId === booking.sessionId)) {
              localStorage.setItem('aura_bookings', JSON.stringify([...bookingsList, finalBooking]));
            }

            const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
            if (!clients.some(c => c.email.toLowerCase() === booking.email.toLowerCase())) {
              clients.push({
                name: booking.name,
                email: booking.email,
                phone: booking.phone,
                lastBooking: booking.date
              });
              localStorage.setItem('aura_clients', JSON.stringify(clients));
            }

            toast.success("Booking confirmed! Check your email for confirmation.", { duration: 6000 });
            localStorage.removeItem('tentative_booking');
          }
        } catch (e) {
          console.error("Failed to recover tentative booking:", e);
        }
      } else {
        toast.success("Booking successful!");
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (bookingStatus === 'cancelled') {
      toast.error("Booking cancelled. Your biofield alignment was not charged.");
      localStorage.removeItem('tentative_booking');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured()) {
      // Firebase auth state listener — reactive login/logout
      const unsubscribe = auth.onAuthStateChange(async (firebaseUser) => {
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

  // Handle Stripe Membership Checkout redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');
    
    if (checkoutStatus === 'success') {
      const updateMembership = async () => {
        if (isFirebaseConfigured() && user?.id) {
          try {
            toast.success("Membership activated! Welcome, Guardian.");
            const updatedProfile = await db.updateProfile(user.id, {
              subscription: 'healing',
              subscriptionStatus: 'active'
            });
            setUser(updatedProfile);
            localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
          } catch (err) {
            console.error("Failed to update profile in Firestore:", err);
          }
        } else if (!isFirebaseConfigured() && user) {
          toast.success("Membership activated! Welcome, Guardian.");
          const updatedUser = { 
            ...user, 
            subscription: 'healing',
            subscriptionStatus: 'active'
          };
          setUser(updatedUser);
          localStorage.setItem('user_profile', JSON.stringify(updatedUser));
        }
      };
      
      updateMembership();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (checkoutStatus === 'cancelled') {
      toast.error("Checkout cancelled. Your biofield alignment was not altered.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  // ─── Reusable Logout Handler ───
  const handleLogout = useCallback(async () => {
    try {
      if (isFirebaseConfigured()) await auth.signOut();
    } catch { /* ignore signout errors */ }
    setUser(null);
    localStorage.removeItem('user_profile');
  }, []);

  // ─── 15-Minute Session Auto-Logout (Idle Timer) ───
  useEffect(() => {
    if (!user) return; // Only active when logged in

    const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    const WARNING_BEFORE = 60 * 1000; // Warn 1 minute before logout
    let idleTimer = null;
    let warningTimer = null;

    const resetTimers = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (warningTimer) clearTimeout(warningTimer);

      // Warning toast at 14 minutes
      warningTimer = setTimeout(() => {
        toast('⏳ Your session will expire in 1 minute due to inactivity.', {
          icon: '🔒',
          duration: 8000,
          style: {
            background: 'rgba(20, 20, 40, 0.95)',
            color: '#d4af37',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '16px'
          }
        });
      }, SESSION_TIMEOUT - WARNING_BEFORE);

      // Auto-logout at 15 minutes
      idleTimer = setTimeout(() => {
        handleLogout();
        toast.success('Session ended due to inactivity. Your energy field is safely sealed. 🔒', { duration: 5000 });
      }, SESSION_TIMEOUT);
    };

    // Activity events that reset the idle timer
    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimers, { passive: true }));

    // Start the initial timer
    resetTimers();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (warningTimer) clearTimeout(warningTimer);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimers));
    };
  }, [user, handleLogout]);

  // Load gamification state for subscribers
  useEffect(() => {
    if (user?.email && (user.subscription === 'healing' || user.role === 'owner')) {
      const state = loadGamificationState(user.email);
      setGamificationState(state);
    } else {
      setGamificationState(null);
    }
  }, [user]);

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
      const currentProto = protocolList.find(p => p.id === selectedProtocol);
      if (Array.isArray(currentProto?.video)) {
        const interval = setInterval(() => {
          if (!isPaused) {
            setVideoIndex(prev => (prev + 1) % currentProto.video.length);
          }
        }, 8000);
        return () => clearInterval(interval);
      }
    }
  }, [showPortal, selectedProtocol, isPaused, protocolList]);

  // Control native HTML5 video play/pause states based on portal status and isPaused
  useEffect(() => {
    const videoElements = document.querySelectorAll('.video-background video');
    videoElements.forEach(video => {
      if (showPortal && !isPaused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [showPortal, isPaused, videoIndex]);

  // Set default carrier/beat frequencies for protocols
  useEffect(() => {
    if (selectedProtocol) {
      const protocolFreqs = {
        amethyst: { carrier: 528, beat: 6 },
        quartz: { carrier: 432, beat: 6 },
        rose: { carrier: 432, beat: 10 },
        lapis: { carrier: 528, beat: 10 },
        citrine: { carrier: 528, beat: 15 },
        sage: { carrier: 432, beat: 6 },
        reiki: { carrier: 528, beat: 6 },
        celestial: { carrier: 432, beat: 10 }
      };
      const settings = protocolFreqs[selectedProtocol] || { carrier: 432, beat: 6 };
      setBinauralCarrier(settings.carrier);
      setBinauralBeat(settings.beat);
    }
  }, [selectedProtocol]);

  const handleUpdateUser = (updatedProfile) => {
    setUser(updatedProfile);
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
    
    // Also update client archive
    const currentClients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    const updatedClients = currentClients.map(c => c.email === updatedProfile.email ? updatedProfile : c);
    localStorage.setItem('aura_clients', JSON.stringify(updatedClients));

    // Update Firestore if configured
    if (isFirebaseConfigured() && updatedProfile.id) {
      const { id: _, ...data } = updatedProfile;
      db.updateProfile(updatedProfile.id, data).catch(err => {
        console.error("Firestore profile update failed:", err);
      });
    }
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

  const handleProtocolEnd = useCallback(() => {
    setShowPortal(false);
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'protocol_completed', {
        protocol_id: selectedProtocol,
        protocol_name: protocolList.find(p => p.id === selectedProtocol)?.name || selectedProtocol
      });
    }
    if (!user) return;

    const currentProto = protocolList.find(p => p.id === selectedProtocol);
    const hzGainVal = parseFloat((Math.random() * 5 + 10).toFixed(1));
    const newLog = {
      id: Date.now(),
      protocolId: selectedProtocol,
      protocolName: currentProto?.name,
      timestamp: new Date().toISOString(),
      hzGain: hzGainVal
    };

    // Save to logs
    const logs = JSON.parse(localStorage.getItem('vibrational_logs') || '[]');
    localStorage.setItem('vibrational_logs', JSON.stringify([newLog, ...logs].slice(0, 50)));

    // Log to Firebase if configured
    if (isFirebaseConfigured() && user.id) {
      db.logSession({
        userId: user.id,
        protocolId: selectedProtocol,
        protocolName: currentProto?.name,
        timestamp: new Date().toISOString(),
        hzGain: hzGainVal
      }).catch(err => console.error("Firestore session logging failed:", err));
    }

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

    // ── Gamification: Process session completion ──
    if (gamificationState && (user.subscription === 'healing' || user.role === 'owner')) {
      const hzGain = newLog.hzGain;
      const result = processSessionComplete(gamificationState, selectedProtocol, hzGain);
      result.updatedState.currentStreak = currentStreak;
      result.updatedState.longestStreak = Math.max(currentStreak, result.updatedState.longestStreak);
      setGamificationState(result.updatedState);
      saveGamificationState(user.email, result.updatedState);
      if (isFirebaseConfigured()) {
        const uid = auth.getUser()?.uid;
        syncToFirestore(db, uid, result.updatedState);
      }
      for (const badge of result.newBadges) {
        setTimeout(() => {
          toast((t) => (
            <div className="badge-unlock-toast" onClick={() => toast.dismiss(t.id)}>
              <span style={{ fontSize: '2rem' }}>{badge.icon}</span>
              <div>
                <div style={{ fontWeight: '700', color: '#d4af37' }}>Badge Unlocked!</div>
                <div style={{ fontSize: '0.85rem' }}>{badge.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#00b894' }}>+{badge.xp} XP</div>
              </div>
            </div>
          ), { duration: 4000, style: { background: 'transparent', boxShadow: 'none', padding: 0 } });
        }, 500);
      }
      if (result.leveledUp && result.newLevel) {
        setTimeout(() => {
          setShowLevelUp(result.newLevel);
          setTimeout(() => setShowLevelUp(null), 5000);
        }, result.newBadges.length > 0 ? 2000 : 500);
      }
    }
  }, [user, selectedProtocol, gamificationState, setUser, setGamificationState, setShowLevelUp, protocolList]);

  // Sync session duration timer (countdown clock)
  useEffect(() => {
    if (showPortal && currentProtocol) {
      setTimeLeft(currentProtocol.duration || 600);
    }
  }, [showPortal, currentProtocol]);

  useEffect(() => {
    if (showPortal && !isPaused && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showPortal && timeLeft === 0) {
      handleProtocolEnd();
    }
  }, [showPortal, isPaused, timeLeft, handleProtocolEnd]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    const element = document.getElementById('protocol-portal-root');
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(() => {
        toast.error("Fullscreen resonance blocked by browser.");
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };






  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstruction(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else {
      toast.error("Install prompt not available. You can install it directly via your browser's menu (e.g. click the install icon in the address bar).");
    }
  };

  const renderInstallBanner = () => {
    return (
      <div className="container" style={{ margin: '2rem auto', position: 'relative', zIndex: 10 }}>
        <div className="glass" style={{
          padding: '2.25rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.25rem',
          border: '1px solid rgba(160, 210, 235, 0.22)',
          background: 'rgba(10, 10, 20, 0.45)',
          borderRadius: '28px',
          boxShadow: '0 12px 45px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem' }}>📥</span>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'Playfair Display', color: 'var(--accent-ethereal)' }}>{t('installTitle')}</h3>
          </div>
          <p style={{ fontSize: '0.85rem', opacity: 0.85, maxWidth: '600px', lineHeight: '1.6' }}>
            {t('installDesc')}
          </p>
          <button 
            onClick={handleInstallClick} 
            className="btn btn-primary"
            style={{ padding: '0.8rem 2.5rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '30px' }}
          >
            <Sparkles size={16} /> {t('installButton')}
          </button>
        </div>
      </div>
    );
  };

  const renderIOSInstructionModal = () => {
    if (!showIOSInstruction) return null;
    return (
      <div className="booking-overlay" style={{ backdropFilter: 'blur(10px)', zIndex: 10006 }} onClick={() => setShowIOSInstruction(false)}>
        <div className="booking-modal glass" style={{ maxWidth: '400px', padding: '2.5rem', textAlign: 'center', border: '1px solid rgba(160, 210, 235, 0.3)', borderRadius: '28px' }} onClick={e => e.stopPropagation()}>
          <button onClick={() => setShowIOSInstruction(false)} className="booking-close">×</button>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
          <h3 style={{ color: 'var(--accent-ethereal)', fontFamily: 'Playfair Display', fontSize: '1.5rem', marginBottom: '1rem' }}>Install on iOS Safari</h3>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.6', marginBottom: '1.5rem', textAlign: 'left' }}>
            To install Reiki & Sage on your iPhone or iPad, follow these simple steps using the Safari browser:
          </p>
          <ol style={{ textAlign: 'left', fontSize: '0.85rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem', opacity: 0.9 }}>
            <li>Tap the <strong>Share</strong> button <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>📤</span> in Safari.</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong> <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>➕</span>.</li>
            <li>Tap <strong>Add</strong> in the top right corner to confirm.</li>
          </ol>
          <button onClick={() => setShowIOSInstruction(false)} className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', borderRadius: '20px' }}>
            Got It
          </button>
        </div>
      </div>
    );
  };

  // ─── Mobile/Tablet UI Render Helpers ───
  const renderHeroSection = (isMobileLayout = false) => {
    return (
      <section className="hero" style={isMobileLayout ? { padding: '3.5rem 1rem 1.5rem 1rem' } : {}}>
        <div className="container">
          <div style={isMobileLayout ? { display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'center' } : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p style={{ fontSize: isMobileLayout ? '1.05rem' : '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: isMobileLayout ? '100%' : '500px' }}>
                Experience the convergence of ancient wisdom and futuristic energy medicine. Our advanced Reiki system harmonizes your biofield with surgical precision.
              </p>
              
              {user && !isMobileLayout && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.5rem' }} onClick={() => document.getElementById('user-dashboard-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold' }}>
                    {user.name.charAt(0)}
                  </div>
                  {user.name}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1.25rem', flexDirection: isMobileLayout ? 'column' : 'row', alignItems: 'center', justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: isMobileLayout ? '100%' : 'auto', justifyContent: 'center', padding: '0.8rem 1.8rem' }}
                  onClick={() => {
                    if (!user) {
                      const newState = !showSignupFlow;
                      setShowSignupFlow(newState);
                      if (newState) {
                        if (isMobileLayout) {
                          setActiveTab('dashboard');
                          setShowSignupFlow(true);
                        } else {
                          setTimeout(() => {
                            document.getElementById('signup-flow-section')?.scrollIntoView({ behavior: 'smooth' });
                          }, 300);
                        }
                      }
                    } else {
                      // Logged in user: scroll to scheduling section
                      const element = document.getElementById('mobile-service');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      } else if (isMobileLayout) {
                        setActiveTab('home');
                        setTimeout(() => {
                          document.getElementById('mobile-service')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }
                  }}
                >
                  <Zap size={18} /> {user ? 'Book a Session' : (showSignupFlow ? 'Close Application' : 'Start Your Journey')}
                </button>
                
                {!user && (
                  <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>
                    Already registered?{' '}
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
                  style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', width: isMobileLayout ? '100%' : 'auto', padding: '0.8rem 1.8rem' }}
                  onClick={() => setShowScience(true)}
                >
                  See the Science
                </button>
              </div>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1, ease: "easeOut" }}
               style={{ position: 'relative', width: '100%' }}
            >
              <div className="glass" style={{ padding: '0', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 0 40px rgba(160, 210, 235, 0.15)' }}>
                <img 
                  src="/assets/hero-energy.png" 
                  alt="Ethereal Energy Flow" 
                  style={{ width: '100%', height: isMobileLayout ? '280px' : '500px', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', padding: '10px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                onClick={() => setShowMyStories(true)}
              >
                <Sparkles color="var(--accent-gold)" size={16} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  const renderDailyResonance = (isMobileLayout = false) => {
    return (
      <div className="container" style={{ marginTop: isMobileLayout ? '0rem' : '-4rem', padding: '1rem', position: 'relative', zIndex: 10 }}>
        <DailyFrequency />
      </div>
    );
  };

  const renderPhilosophySection = (isMobileLayout = false) => {
    return (
      <section id="about" style={{ backgroundColor: 'var(--bg-section)', padding: isMobileLayout ? '3rem 1rem' : '8rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: isMobileLayout ? '2rem' : '4rem' }}>
            <h2 style={{ fontSize: isMobileLayout ? '2rem' : '3rem', color: 'var(--text-main)' }}>{t('compassionTitle')}</h2>
            <div style={{ width: '60px', height: '3px', background: 'var(--accent-compassion)', margin: '1rem auto' }}></div>
          </div>
          
          <div style={isMobileLayout ? { display: 'flex', flexDirection: 'column', gap: '2rem' } : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div className="glass" style={{ position: 'relative', height: isMobileLayout ? '260px' : '500px', overflow: 'hidden', borderRadius: '24px' }}>
              <img 
                src="/assets/compassion-glow.png" 
                alt="Compassion Glow" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', color: 'var(--accent-compassion)', textAlign: isMobileLayout ? 'center' : 'left' }}>{t('compassionHeading')}</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ display: 'block', fontSize: '1.1rem' }}>{t('compassionCalibTitle')}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('compassionCalibDesc')}</span>
                </li>
                <li style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(229, 179, 187, 0.08)', borderRadius: '15px', borderLeft: '4px solid var(--accent-compassion)' }}>
                  <strong style={{ display: 'block', fontSize: '1.1rem' }}>{t('compassionFlowTitle')}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('compassionFlowDesc')}</span>
                </li>
                <li>
                  <strong style={{ display: 'block', fontSize: '1.1rem' }}>{t('compassionConnectionTitle')}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('compassionConnectionDesc')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderGuidedMeditationSection = (isMobileLayout = false) => {
    return (
      <section id="guided-meditation-section" style={{ padding: isMobileLayout ? '3rem 1rem' : '6rem 0', backgroundColor: 'var(--bg-section-alt)' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobileLayout ? '2.5rem' : '4rem' }}>
            <h2 style={{ fontSize: isMobileLayout ? '2rem' : '3rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Guided Meditation Journey
            </h2>
            <div style={{ width: '60px', height: '3px', background: 'var(--accent-gold)', margin: '1rem auto' }}></div>
            <p style={{ color: 'var(--accent-gold)', fontSize: isMobileLayout ? '0.9rem' : '1.1rem', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              The Golden Horizon Quest – Manifestation Adventure
            </p>
          </div>
          
          <div className="glass" style={{ padding: isMobileLayout ? '1rem' : '2.5rem', borderRadius: '24px', border: '1px solid rgba(212, 175, 55, 0.25)', background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.05) 0%, transparent 80%)', backdropFilter: 'blur(10px)', boxShadow: '0 0 40px rgba(212, 175, 55, 0.05)', position: 'relative', overflow: 'hidden' }}>
            <div 
              style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.6)', aspectRatio: '16/9', background: '#000', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
              onClick={() => {
                if (!user) {
                  toast.error("Please log in or create an account to start the Guided Meditation.");
                  setShowLoginModal(true);
                } else {
                  setShowMeditationModal(true);
                }
              }}
            >
              <img 
                src="/assets/hero-energy.png" 
                alt="Meditation Poster"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65, display: 'block', transition: 'transform 0.5s ease' }}
              />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <motion.div 
                  whileHover={{ scale: 1.15 }}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 30px var(--accent-gold)', color: '#000', cursor: 'pointer', marginBottom: '1.5rem' }}
                >
                  {user ? (
                    <Play fill="#000" size={32} style={{ marginLeft: '6px' }} />
                  ) : (
                    <Lock size={32} />
                  )}
                </motion.div>
                <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {user ? "Begin Quest" : "Log In to Play"}
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: isMobileLayout ? '0.95rem' : '1.1rem', color: 'var(--text-muted)', lineHeight: '1.7', maxWidth: '750px', margin: '0 auto' }}>
                Embark on a transformative journey guided by Carissa. Align your intentions, activate your inner light, and manifest your highest potential. Click play to open the immersive video portal and begin your alignment.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderMeditationModal = () => {
    return (
      <div 
        className="healing-portal-overlay fade-in" 
        style={{ 
          position: 'fixed', 
          top: 0, left: 0, 
          width: '100vw', height: '100vh', 
          zIndex: 9999, 
          background: 'rgba(5, 5, 10, 0.95)', 
          backdropFilter: 'blur(20px)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        <div style={{ position: 'relative', width: '90%', maxWidth: '700px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 0 50px rgba(212, 175, 55, 0.15)', background: '#0a0a0f', padding: '3rem' }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
            <button 
              className="close-portal" 
              style={{ 
                position: 'static', 
                width: '45px', height: '45px', 
                fontSize: '2rem', 
                background: 'rgba(0,0,0,0.5)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '50%', 
                color: 'white', 
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }} 
              onClick={() => {
                setShowMeditationModal(false);
                setMeditationConsent(false);
                setMeditationConsentPending(false);
              }}
            >
              ×
            </button>
          </div>

          {!meditationConsent ? (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-gold)', marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>
                Wellness Consent & Disclaimer
              </h3>
              <div style={{
                background: 'rgba(231, 76, 60, 0.08)',
                border: '1px solid rgba(231, 76, 60, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left',
                fontSize: '0.85rem',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                <p style={{ fontWeight: '700', color: '#e74c3c', marginBottom: '0.5rem' }}>
                  ⚠️ Spiritual Wellness Notice
                </p>
                The Guided Meditation Journey is designed for relaxation, stress management, and personal spiritual growth. It is not a medical device, diagnosis, or clinical treatment, and it is not regulated or approved by the FDA. Reiki is a complementary therapy and is not a substitute for professional medical or mental health care.
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left', marginBottom: '2rem' }}>
                <input 
                  type="checkbox" 
                  id="meditation-consent-checkbox" 
                  checked={meditationConsentPending}
                  onChange={(e) => setMeditationConsentPending(e.target.checked)}
                  style={{ marginTop: '4px', cursor: 'pointer' }}
                />
                <label htmlFor="meditation-consent-checkbox" style={{ fontSize: '0.8rem', opacity: 0.8, cursor: 'pointer', userSelect: 'none', color: '#fff' }}>
                  I understand and agree that this is a spiritual wellness practice, not a clinical treatment, and I wish to proceed.
                </label>
              </div>
              <button 
                onClick={() => setMeditationConsent(true)}
                disabled={!meditationConsentPending}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', opacity: meditationConsentPending ? 1 : 0.5 }}
              >
                Proceed to Sanctuary Video
              </button>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ aspectRatio: '16/9', width: '100%', background: '#000' }}>
                <video 
                  src="/assets/the_golden_horizon_quest.mp4" 
                  controls 
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  disablePictureInPicture
                  autoPlay 
                  preload="auto"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProtocolsSection = (isMobileLayout = false) => {
    return (
      <section id="protocols-section" style={{ backgroundColor: 'var(--bg-section)', padding: isMobileLayout ? '2.5rem 1rem' : '8rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobileLayout ? '2rem' : '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{t('protocolsHeading')}</h2>
          <p style={{ marginBottom: isMobileLayout ? '1rem' : '2rem', opacity: '0.7', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('protocolsSub')}</p>
          
          {/* Random Protocol Button */}
          <div style={{ marginBottom: isMobileLayout ? '1.5rem' : '2rem' }}>
            <button
              onClick={selectRandomProtocol}
              className="btn"
              style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid var(--accent-gold)',
                color: 'var(--accent-gold)',
                padding: '0.6rem 1.5rem',
                borderRadius: '30px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.3s ease'
              }}
            >
              <Shuffle size={16} /> {t('protocolsRandom')}
            </button>
          </div>

          {/* Gemstone Core Sync Section */}
          <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
            <div className="glass portal-frame" style={{ padding: '0.75rem', background: 'rgba(212, 175, 55, 0.1)', border: '2px solid var(--accent-gold)', borderRadius: '20px' }}>
              <img 
                src="/assets/energy-portal.png" 
                alt="Gemstone Energy Portal" 
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }}
              />
              <div className="core-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '20px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{
                    backgroundColor: selectedProtocol ? 'var(--accent-gold)' : '#ccc', 
                    borderColor: selectedProtocol ? 'var(--accent-gold)' : '#ccc', 
                    cursor: selectedProtocol ? 'pointer' : 'not-allowed',
                    padding: '0.6rem 1.5rem',
                    fontSize: '0.85rem',
                    display: 'block'
                  }}
                  onClick={() => selectedProtocol && setShowPortal(true)}
                  disabled={!selectedProtocol}
                >
                  {selectedProtocol ? t('coreButtonSync') : t('coreButtonSelect')}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobileLayout ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            {activeProtocols.map((protocol) => (
              <div 
                key={protocol.id}
                className={`glass card-hover ${selectedProtocol === protocol.id ? 'protocol-selected' : ''}`} 
                style={{
                  padding: isMobileLayout ? '1.5rem' : '2.5rem', 
                  borderBottom: `6px solid ${protocol.borderColor}`,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  border: selectedProtocol === protocol.id ? `2px solid ${protocol.color}` : '1px solid var(--glass-border)',
                  borderRadius: '20px'
                }}
                onClick={() => setSelectedProtocol(protocol.id)}
              >
                <div style={{
                  height: '160px', 
                  overflow: 'hidden', 
                  borderRadius: '12px', 
                  marginBottom: '1rem',
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
                  />
                  {protocol.isImmersive && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'var(--accent-gold)',
                      color: '#000',
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      padding: '3px 8px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                      <Clock size={10} /> {protocol.duration / 60} {t('protocolMin')}
                    </div>
                  )}
                </div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: protocol.color }}>{t('name_' + protocol.id)}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{t('desc_' + protocol.id)}</p>
                {selectedProtocol === protocol.id && (
                  <div style={{ marginTop: '1rem', color: protocol.color, fontWeight: '700', fontSize: '0.8rem' }}>{t('protocolSelected')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );

  };

  const renderSchedulingSection = (isMobileLayout = false) => {
    return (
      <section id="mobile-service" style={{ background: 'var(--bg-section-alt)', padding: isMobileLayout ? '3.5rem 1rem' : '8rem 0' }}>
        <div className="container">
          <div style={isMobileLayout ? { display: 'flex', flexDirection: 'column', gap: '2rem' } : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={isMobileLayout ? { textAlign: 'center' } : {}}>
              <h3 style={{ fontSize: isMobileLayout ? '1.8rem' : '2.2rem', marginBottom: '1.25rem', color: 'var(--text-main)', fontFamily: 'Playfair Display' }}>The Advanced Resonance Model</h3>
              <p style={{ fontSize: isMobileLayout ? '0.9rem' : '1.1rem', marginBottom: '2.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                The sanctuary now comes to you. Our advanced mobile systems allow us to calibrate your energy field in the comfort of your own space, using our proprietary portable resonance technology.
              </p>
              
              {/* HIPAA Rules Text */}
              <div className="glass" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #00b894', background: 'rgba(0, 184, 148, 0.04)', borderRadius: '0 12px 12px 0', marginBottom: '2.5rem', textAlign: 'left' }}>
                <p style={{ fontSize: '0.75rem', color: '#a8d8a8', margin: 0, lineHeight: '1.5' }}>
                  <strong>🛡️ Privacy Protection:</strong> We do not ask for or collect health/medical information. Reiki is a spiritual wellness practice; healers do not diagnose, prescribe, or provide medical advice.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobileLayout ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                <div 
                  className="glass card-hover" 
                  style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}
                  onClick={() => setBookingType('onsite')}
                >
                  <div style={{ fontSize: '2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>🚚</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.25rem' }}>On-Site Alignment</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>$150 • Home/Office Visit (15% Deposit)</div>
                </div>
                <div 
                  className="glass card-hover" 
                  style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}
                  onClick={() => setBookingType('portal')}
                >
                  <div style={{ fontSize: '2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>⚡</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.25rem' }}>Live Video Portal</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>$88 • Secure Video Alignment Session</div>
                </div>
              </div>
            </div>
            
            <div className="glass" style={{ padding: '0', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', display: isMobileLayout ? 'none' : 'block' }}>
              <img 
                src="/assets/crystal-resonance.png" 
                alt="Crystal Resonance Technology" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>
    );
  };

  useEffect(() => {
    if (!disclaimerAccepted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [disclaimerAccepted]);

  const renderLanguageDropdown = () => {
    const langNames = {
      en: "English",
      es: "Español",
      zh: "中文",
      pt: "Português",
      ja: "日本語",
      fr: "Français"
    };

    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowLanguageDropdownState(!showLanguageDropdownState)}
          className="glass"
          style={{
            background: 'rgba(20, 20, 30, 0.5)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: 'var(--text-main)',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
        >
          <span>🌐</span>
          <span>{langNames[language]}</span>
          <span style={{ fontSize: '0.65rem', transform: showLanguageDropdownState ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
        </button>
        
        {showLanguageDropdownState && (
          <div className="glass" style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            right: 0,
            background: theme === 'dark' ? 'rgba(25, 25, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 100000,
            overflow: 'hidden',
            minWidth: '130px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {Object.entries(langNames).map(([code, name]) => (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code);
                  setShowLanguageDropdownState(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: language === code ? 'var(--accent-gold)' : 'var(--text-main)',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: language === code ? '700' : 'normal',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(212, 175, 55, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderGatingDisclaimerModal = () => {
    return (
      <div className="gating-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: theme === 'dark' ? 'rgba(10, 10, 15, 0.75)' : 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
        overflowY: 'auto'
      }}>
        <div className="glass" style={{
          maxWidth: '650px',
          width: '100%',
          padding: '2.5rem',
          borderRadius: '24px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          background: theme === 'dark' ? 'rgba(20, 20, 30, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          color: 'var(--text-main)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'Playfair Display', color: 'var(--accent-gold)', margin: 0 }}>
              {t('disclaimerTitle')}
            </h2>
            {renderLanguageDropdown()}
          </div>
          
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '40vh', overflowY: 'auto', paddingRight: '0.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.1)', paddingBottom: '1rem' }}>
            <p style={{ fontWeight: '600', color: 'var(--accent-gold)', margin: 0 }}>
              {t('footerDisclaimerTitle')}
            </p>
            <p style={{ margin: 0 }}>
              {t('disclaimerFDA')}
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', borderLeft: '3px solid var(--accent-gold)', paddingLeft: '0.75rem', fontStyle: 'italic' }}>
              {t('disclaimerHIPAA')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="gating-disclaimer-checkbox" 
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
              style={{ 
                marginTop: '0.25rem', 
                width: '18px', 
                height: '18px', 
                cursor: 'pointer',
                accentColor: 'var(--accent-gold)'
              }}
            />
            <label htmlFor="gating-disclaimer-checkbox" style={{ fontSize: '0.85rem', cursor: 'pointer', lineHeight: '1.4' }}>
              {t('disclaimerCheck')}
            </label>
          </div>

          <button
            onClick={() => {
              if (checkboxChecked) {
                setDisclaimerAccepted(true);
                localStorage.setItem('aura_disclaimer_accepted', 'true');
                if (typeof window.gtag === 'function') {
                  window.gtag('event', 'disclaimer_accepted');
                }
                toast.success("Welcome to the Reiki & Sage Sanctuary.");
              } else {
                toast.error("Please acknowledge the disclaimer to enter.");
              }
            }}
            disabled={!checkboxChecked}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1rem', 
              fontWeight: '700',
              cursor: checkboxChecked ? 'pointer' : 'not-allowed',
              opacity: checkboxChecked ? 1 : 0.5,
              background: checkboxChecked ? 'var(--accent-gold)' : 'rgba(212, 175, 55, 0.2)',
              color: checkboxChecked ? 'black' : 'var(--text-main)',
              border: 'none',
              borderRadius: '30px',
              boxShadow: checkboxChecked ? '0 4px 15px rgba(212, 175, 55, 0.3)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {t('disclaimerButton')}
          </button>
        </div>
      </div>
    );
  };

  const renderLayoutSwitcher = () => {
    const activeLabel = {
      desktop: '💻 Desktop',
      tablet: '📟 Tablet',
      mobile: '📱 Mobile'
    }[viewMode];

    return (
      <div 
        className="layout-switcher-dropdown"
        style={{
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <button
          onClick={() => setShowLayoutDropdown(!showLayoutDropdown)}
          className="glass"
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            background: 'rgba(10, 10, 15, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--text-main)',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <span>{activeLabel}</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{showLayoutDropdown ? '▼' : '▲'}</span>
        </button>

        <AnimatePresence>
          {showLayoutDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="glass"
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: 0,
                width: '160px',
                background: 'rgba(10, 10, 15, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                zIndex: 10003
              }}
            >
              {[
                { mode: 'desktop', label: '💻 Desktop' },
                { mode: 'tablet', label: '📟 Tablet' },
                { mode: 'mobile', label: '📱 Mobile' }
              ].map((item) => (
                <button
                  key={item.mode}
                  onClick={() => {
                    setViewMode(item.mode);
                    setShowLayoutDropdown(false);
                  }}
                  style={{
                    background: viewMode === item.mode ? 'linear-gradient(135deg, var(--accent-ethereal), var(--accent-neon))' : 'none',
                    border: 'none',
                    color: viewMode === item.mode ? 'white' : 'var(--text-main)',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (viewMode !== item.mode) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (viewMode !== item.mode) {
                      e.currentTarget.style.background = 'none';
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderComingSoonSection = (isMobileLayout = false) => {
    const handlePwaInstall = () => {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            toast.success('App installed to home screen!');
          }
          window.deferredPrompt = null;
        });
      } else {
        toast('To install, tap Share (iOS) or Menu (Android) and select "Add to Home Screen".', { icon: '📱' });
      }
    };

    return (
      <section id="coming-soon" style={{ backgroundColor: 'var(--bg-section-alt)', padding: isMobileLayout ? '3rem 1rem' : '6rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>✦ Live Sanctuary Expansion Suite ✦</span>
          <h2 style={{ fontSize: isMobileLayout ? '1.8rem' : '2.5rem', fontFamily: 'Playfair Display', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Sanctuary Interactive Experience</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Unlock the full dimension of your spiritual journey through our live interactive healing tools:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobileLayout ? '1fr' : 'repeat(4, 1fr)', gap: '1.5rem', textAlign: 'left' }}>
            {/* Mobile PWA Card */}
            <div 
              className="glass" 
              style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--accent-gold)', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(212, 175, 55, 0.05) 100%)', position: 'relative', cursor: 'pointer' }}
              onClick={handlePwaInstall}
            >
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-gold)', color: '#000', fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Now Live!</span>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>📱</div>
              <h4 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem', fontSize: '1rem' }}>Mobile PWA App</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                Install our standalone mobile sanctuary app on iOS & Android for one-tap offline access.
              </p>
            </div>

            {/* Voice Reflections Studio Card */}
            <div 
              className="glass" 
              style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--accent-gold)', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(212, 175, 55, 0.05) 100%)', position: 'relative', cursor: 'pointer' }}
              onClick={() => setShowVoiceReflectionStudio(true)}
            >
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-gold)', color: '#000', fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Now Live!</span>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>🎙️</div>
              <h4 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem', fontSize: '1rem' }}>Voice Reflections</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                Record and share 60-second spiritual audio alignment journals with seekers and guides worldwide.
              </p>
            </div>
            
            {/* Biofield Pulse Card */}
            <div 
              className="glass" 
              style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #50e3c2', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(80, 227, 194, 0.05) 100%)', position: 'relative', cursor: 'pointer' }}
              onClick={() => setShowBiofieldPulse(true)}
            >
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#50e3c2', color: '#000', fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Now Live!</span>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>⌚</div>
              <h4 style={{ color: '#50e3c2', marginBottom: '0.5rem', fontSize: '1rem' }}>Biofield Pulse</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                Optical heart-rate variability (HRV) sensor & aura resonance scanner to map your energy field.
              </p>
            </div>

            {/* Sonic Sound Baths Card */}
            <div 
              className="glass" 
              style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #4a90e2', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(74, 144, 226, 0.05) 100%)', position: 'relative', cursor: 'pointer' }}
              onClick={() => setShowSoundBaths(true)}
            >
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#4a90e2', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Now Live!</span>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>🌀</div>
              <h4 style={{ color: '#4a90e2', marginBottom: '0.5rem', fontSize: '1rem' }}>Sonic Sound Baths</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                Interactive 432Hz & 528Hz Solfeggio frequency generator with crystal singing bowls & rain.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderMobileTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            {renderHeroSection(true)}
            {renderDailyResonance(true)}
            {showInstallBanner && renderInstallBanner()}
            {renderSchedulingSection(true)}
            {renderPhilosophySection(true)}
            {renderGuidedMeditationSection(true)}
            {renderComingSoonSection(true)}
            
            {/* Mobile Footer */}
            <footer style={{ padding: '2rem 1.5rem 8rem 1.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto', background: 'rgba(0,0,0,0.1)' }}>
              {/* Mobile Wellness Disclaimer */}
              <div style={{
                fontSize: '0.7rem', 
                color: 'var(--text-muted)', 
                lineHeight: '1.5', 
                marginBottom: '1.5rem', 
                padding: '1rem', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '10px', 
                background: 'rgba(0,0,0,0.2)',
                textAlign: 'left'
              }}>
                <strong>{t('complianceDisclaimerTitle')}</strong> {t('complianceDisclaimerText')}
              </div>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '1rem' }}>© 2026 Reiki & Sage Healing Arts.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '0.75rem', opacity: 0.8, flexWrap: 'wrap' }}>
                <span onClick={() => setShowLegalModal('terms')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Terms</span>
                <span>|</span>
                <span onClick={() => setShowLegalModal('privacy')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Privacy</span>
                <span>|</span>
                <span onClick={() => setShowLegalModal('disclaimer')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Disclaimer</span>
                <span>|</span>
                <span onClick={() => setShowAdminLogin(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Staff</span>
                <span>|</span>
                <span onClick={() => {
                  if (!user) {
                    toast.error("Please log in to apply.");
                    setShowLoginModal(true);
                  } else {
                    setShowHealerApp(true);
                  }
                }} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Apply as Healer</span>
              </div>
            </footer>
          </>
        );
      case 'protocols':
        return renderProtocolsSection(true);
      case 'ai-guide':
        if (!isPremiumUser) {
          return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 125px)', padding: '2rem', textAlign: 'center' }}>
              <div className="glass" style={{ maxWidth: '500px', padding: '3rem', borderRadius: '32px', border: '1px solid rgba(212, 175, 55, 0.25)', background: 'rgba(10, 10, 15, 0.8)' }}>
                <Shield size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.4))' }} />
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>AI Aura & Biofield Guide</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                  Unlock Carissa's digital twin to analyze your chakra alignment, log energy shifts, and receive personalized spiritual remedies.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={() => setShowSubscriptionPage(true)}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '1rem' }}
                  >
                    UPGRADE TO GUARDIAN TIER
                  </button>
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="btn" 
                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)' }}
                  >
                    RETURN HOME
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 125px)' }}>
            <Suspense fallback={<LoadingSpinner />}>
              <AIHealerInterface 
                user={user} 
                onClose={() => setActiveTab('home')} 
                inlineMode={true}
              />
            </Suspense>
          </div>
        );
      case 'learning':
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 125px)' }}>
            <Suspense fallback={<LoadingSpinner />}>
              <LearnSection isMobileLayout={true} />
            </Suspense>
          </div>
        );
      case 'dashboard':
        return (
          <div style={{ padding: '1.5rem 1rem', flex: 1 }}>
            {user ? (
              <UserDashboardInline 
                user={user} 
                onUpdateUser={handleUpdateUser}
                onOpenFullDashboard={() => {
                  if (user.subscription === 'healing' || user.role === 'owner') {
                    setShowUserFullDashboard(true);
                  } else {
                    toast.error("Guardian status required for Full Dashboard view.");
                    setShowSubscriptionPage(true);
                  }
                }}
                onNavigateToBooking={() => {
                  setActiveTab('home');
                  toast.success("Scroll to appointment section below.");
                }}
                onNavigateToProtocols={() => setActiveTab('protocols')}
                onUpgrade={() => setShowSubscriptionPage(true)}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '350px', textAlign: 'center', gap: '1.5rem' }}>
                <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 15px rgba(212,175,55,0.4))' }}>🧘</div>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem' }}>Seeker Sanctuary Dashboard</h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.7, maxWidth: '260px' }}>Log in to view your daily alignment, healing history, and manage your sessions.</p>
                <button 
                  onClick={() => setShowLoginModal(true)} 
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 2rem', fontSize: '0.9rem' }}
                >
                  Log In to Sanctuary
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderMobileTabletShell = () => {
    const mainAppContent = (
      <div className="device-screen">
        {/* Mobile top header bar */}
        <header className="mobile-header">
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}>Reiki & Sage</a>
          <div className="mobile-header-actions">
            <div style={{ display: 'inline-flex', alignItems: 'center', marginRight: '0.25rem' }}>
              {renderLanguageDropdown()}
            </div>
            <button 
              onClick={toggleTheme}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center'
              }}
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <button 
                onClick={() => {
                  const isDemo = !isFirebaseConfigured();
                  const isOwner = user.role === 'owner' && (isDemo || ['carissabright@gmail.com', 'jasonmounts77@yahoo.com'].includes(user.email?.toLowerCase()));
                  if (isOwner) {
                    setShowHealerDashboard(true);
                  } else {
                    setActiveTab('dashboard');
                  }
                }}
                style={{
                  background: 'none', border: '1px solid var(--accent-gold)', cursor: 'pointer',
                  color: 'var(--accent-gold)', padding: '0.3rem 0.75rem', borderRadius: '15px',
                  fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Sparkles size={10} /> {user.name.split(' ')[0]}
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                style={{
                  background: 'none', border: '1px solid var(--accent-gold)', cursor: 'pointer',
                  color: 'var(--accent-gold)', padding: '0.3rem 0.75rem', borderRadius: '15px',
                  fontSize: '0.65rem'
                }}
              >
                {t('navLogIn')}
              </button>
            )}
          </div>
        </header>

        {/* Tab content area */}
        <div className="tab-content-container">
          {renderMobileTabContent()}
        </div>

        {/* Bottom navigation bar */}
        <nav className="bottom-nav">
          <button className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <div className="bottom-nav-icon-wrapper">
              <Home size={20} />
              {activeTab === 'home' && <div className="bottom-nav-dot"></div>}
            </div>
            <span>Home</span>
          </button>
          <button className={`bottom-nav-item ${activeTab === 'protocols' ? 'active' : ''}`} onClick={() => setActiveTab('protocols')}>
            <div className="bottom-nav-icon-wrapper">
              <Grid size={20} />
              {activeTab === 'protocols' && <div className="bottom-nav-dot"></div>}
            </div>
            <span>{t('navProtocols')}</span>
          </button>
          <button className={`bottom-nav-item ${activeTab === 'ai-guide' ? 'active' : ''}`} onClick={() => setActiveTab('ai-guide')}>
            <div className="bottom-nav-icon-wrapper">
              <Sparkles size={20} />
              {activeTab === 'ai-guide' && <div className="bottom-nav-dot"></div>}
            </div>
            <span>AI Guide</span>
          </button>
          <button className={`bottom-nav-item ${activeTab === 'learning' ? 'active' : ''}`} onClick={() => setActiveTab('learning')}>
            <div className="bottom-nav-icon-wrapper">
              <BookOpen size={20} />
              {activeTab === 'learning' && <div className="bottom-nav-dot"></div>}
            </div>
            <span>{t('navLearning')}</span>
          </button>
          <button className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <div className="bottom-nav-icon-wrapper">
              <User size={20} />
              {activeTab === 'dashboard' && <div className="bottom-nav-dot"></div>}
            </div>
            <span>Dashboard</span>
          </button>
        </nav>
      </div>
    );

    return (
      <div className={`app theme-${theme}`} style={{ 
        background: theme === 'dark' 
          ? 'radial-gradient(circle at 50% -20%, #1a1a2e 0%, #0a0a0f 100%)' 
          : 'radial-gradient(circle at 50% -20%, #fffafa 0%, #ffeef2 100%)',
        minHeight: '100vh',
        color: 'var(--text-main)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        <Toaster position="top-center" />
        {renderIOSInstructionModal()}
        <Suspense fallback={null}>
          <AnimatePresence>
            {showLegalModal && (
              <LegalModal initialTab={showLegalModal} onClose={() => setShowLegalModal(null)} />
            )}
          </AnimatePresence>
        </Suspense>
        
        {/* Floating Layout Switcher for Desktop Preview */}
        {renderLayoutSwitcher()}

        {/* Immersive Playback Portal */}
        {showPortal && currentProtocol && (
          <div id="protocol-portal-root" className="healing-portal-overlay fade-in" style={{ zIndex: 10005 }}>
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
              <div className="video-background" style={{ overflow: 'hidden' }}>
                {Array.isArray(currentProtocol.video) ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {currentProtocol.video.map((src, idx) => {
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
                ) : videoSrc?.endsWith('.mp4') ? (
                  <video 
                    autoPlay={!isPaused}
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
                    src={videoSrc ? `https://www.youtube.com/embed/${videoSrc}?autoplay=${isPaused ? 0 : 1}&mute=1&controls=0&loop=1&playlist=${videoSrc}` : ""} 
                    title="Healing Audio" 
                    frameBorder="0" 
                    id="healing-audio-iframe"
                    style={{ border: 'none', pointerEvents: 'none' }}
                  ></iframe>
                )}
              </div>
              <div className="healing-ui">
                <div className="glass healing-status">
                  <div style={{ color: currentProtocol.color, fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '1px' }}>
                    {currentProtocol.name} ACTIVE
                  </div>
                  {/* Countdown Timer */}
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
                      onChange={handleVolumeChange}
                      style={{ width: '100%', accentColor: currentProtocol.color, cursor: 'pointer' }}
                    />
                  </div>
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
                      <div key={i} className={`bar ${isPaused ? 'paused' : ''}`} style={{ animationDelay: `${i * 0.1}s`, backgroundColor: currentProtocol.color }}></div>
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
                          setBinauralEnabled(e.target.checked);
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
                              onChange={(e) => setBinauralVolume(parseInt(e.target.value))}
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
                                onChange={(e) => setBinauralCarrier(parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                              />
                            </div>
                            
                            <div>
                              <label style={{ fontSize: '0.65rem', opacity: 0.8, display: 'block', marginBottom: '2px' }}>
                                Brainwave State
                              </label>
                              <select 
                                value={binauralBeat} 
                                onChange={(e) => setBinauralBeat(parseFloat(e.target.value))}
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
                              onClick={() => setShowSubscriptionPage(true)} 
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
            {/* Audio Player */}
            <DuckingAudioPlayer 
              musicSrc={currentProtocol.audio ? `https://www.youtube.com/embed/${currentProtocol.audio}?autoplay=1&mute=0&enablejsapi=1&origin=${window.location.origin}` : ""}
              ambientSrc={currentProtocol.ambient}
              voiceSrc={currentProtocol.voice}
              isPlaying={showPortal && !isPaused}
              volume={volume}
              binauralEnabled={binauralEnabled}
              binauralCarrier={binauralCarrier}
              binauralBeat={binauralBeat}
              binauralVolume={binauralVolume}
              onEnded={handleProtocolEnd}
            />
          </div>
        )}

        {/* Modals & Subpages */}
        <Suspense fallback={null}>
          {showAdminLogin && (
            <AdminLogin 
              onClose={() => setShowAdminLogin(false)}
              onLogin={() => {
                const profile = JSON.parse(localStorage.getItem('user_profile'));
                setUser(profile);
                setShowAdminLogin(false);
                setShowHealerDashboard(true);
                toast.success(`Welcome back, ${profile.name}`);
              }}
            />
          )}
          {showScience && <ScienceModal onClose={() => setShowScience(false)} />}
          {showHealerDashboard && (
            <HealerDashboard 
              onClose={() => setShowHealerDashboard(false)} 
              onJoinPortal={(session) => {
                setShowHealerDashboard(false);
                setActiveSession(session);
                setShowLivePortal(true);
              }}
              protocols={protocolList}
              onToggleProtocol={handleToggleProtocol}
            />
          )}
          {showSubscriptionPage && <SubscriptionPage onClose={() => setShowSubscriptionPage(false)} user={user} onUpdateUser={handleUpdateUser} />}
          {showAuraGuide && <AuraGuide onClose={() => setShowAuraGuide(false)} user={user} onUpdateUser={handleUpdateUser} />}
          {showSignupFlow && !user && (
            <SignupFlow
              onComplete={(profile) => {
                setUser(profile);
                localStorage.setItem('user_profile', JSON.stringify(profile));
                setShowSignupFlow(false);
                toast.success(`Welcome to the sanctuary, ${profile.name}!`);
              }}
              onCancel={() => setShowSignupFlow(false)}
            />
          )}
          {showLoginModal && (
            <Login 
              onLoginSuccess={(loggedInUser) => {
                setUser(loggedInUser);
                localStorage.setItem('user_profile', JSON.stringify(loggedInUser));
                setShowLoginModal(false);
                toast.success(`Welcome back, ${loggedInUser.name}!`);
              }}
              onClose={() => setShowLoginModal(false)}
              onSignupClick={() => {
                setShowLoginModal(false);
                setShowSignupFlow(true);
                setActiveTab('dashboard');
              }}
            />
          )}
          {showHealerApp && <HealerApplicationModal onClose={() => setShowHealerApp(false)} user={user} />}
          {showLivePortal && <LiveResonancePortal session={activeSession} onClose={() => setShowLivePortal(false)} user={user} />}
          {showJoinPortalModal && <JoinPortalModal onClose={() => setShowJoinPortalModal(false)} onJoin={(session) => {
            setActiveSession(session);
            setShowLivePortal(true);
            setShowJoinPortalModal(false);
          }} />}
          {showMyStories && <MyStoriesPortal onClose={() => setShowMyStories(false)} user={user} />}
          {showMeditationModal && renderMeditationModal()}
        </Suspense>

        {/* Device Bezel Simulator Wrapper */}
        <div className="device-container">
          <div className={`device-frame mode-${viewMode}`}>
            {viewMode === 'mobile' && <div className="device-island"></div>}
            {mainAppContent}
          </div>
        </div>
        {!disclaimerAccepted && renderGatingDisclaimerModal()}
      </div>
    );
  };

  if (viewMode !== 'desktop') {
    return renderMobileTabletShell();
  }

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
      
      {/* Floating Layout Switcher for Desktop Preview */}
      {renderLayoutSwitcher()}

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
                /* Cinematic Image/Video Player */
                <div style={{width: '100%', height: '100%', position: 'relative'}}>
                   {currentProtocol.video.map((src, idx) => {
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
                  src={videoSrc ? `https://www.youtube.com/embed/${videoSrc}?autoplay=${isPaused ? 0 : 1}&mute=1&controls=0&loop=1&playlist=${videoSrc}` : ""} // Control autoplay
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
                    src={currentProtocol.audio ? `https://www.youtube.com/embed/${currentProtocol.audio}?autoplay=${isPaused ? 0 : 1}&mute=1&loop=1&playlist=${currentProtocol.audio}&enablejsapi=1&origin=${window.location.origin}` : ""} // Control autoplay
                    frameBorder="0" 
                    allow="autoplay; encrypted-media; fullscreen"
                    style={{opacity: 0.01}}
                  ></iframe>
                </div>
              )}

              {currentProtocol.isImmersive && (
                <DuckingAudioPlayer 
                  musicSrc={currentProtocol.audio ? `https://www.youtube.com/embed/${currentProtocol.audio}?autoplay=1&mute=0&enablejsapi=1&origin=${window.location.origin}` : ""} // Simplified for mock
                  ambientSrc={currentProtocol.ambient}
                  voiceSrc={currentProtocol.voice}
                  isPlaying={showPortal && !isPaused}
                  volume={volume}
                  binauralEnabled={binauralEnabled}
                  binauralCarrier={binauralCarrier}
                  binauralBeat={binauralBeat}
                  binauralVolume={binauralVolume}
                  onEnded={handleProtocolEnd}
                />
              )}
            </div>
            <div className="healing-ui">
              <div className="glass healing-status">
                <div style={{color: currentProtocol.color, fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem', letterSpacing: '1px'}}>
                  {currentProtocol.name} ACTIVE
                </div>
                {/* Countdown Timer */}
                <div style={{ fontSize: '1.8rem', fontWeight: '300', color: 'white', margin: '0.5rem 0', fontFamily: 'monospace', letterSpacing: '2px', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                  {formatTime(timeLeft)}
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

                {/* Binaural Beats Mixer */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', width: '100%' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', color: 'var(--accent-gold)' }}>
                    <input 
                      type="checkbox" 
                      checked={binauralEnabled} 
                      onChange={(e) => {
                        setBinauralEnabled(e.target.checked);
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
                            onChange={(e) => setBinauralVolume(parseInt(e.target.value))}
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
                              onChange={(e) => setBinauralCarrier(parseInt(e.target.value))}
                              style={{ width: '100%', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                            />
                          </div>
                          
                          <div>
                            <label style={{ fontSize: '0.65rem', opacity: 0.8, display: 'block', marginBottom: '2px' }}>
                              Brainwave State
                            </label>
                            <select 
                              value={binauralBeat} 
                              onChange={(e) => setBinauralBeat(parseFloat(e.target.value))}
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
                            onClick={() => setShowSubscriptionPage(true)} 
                            style={{ fontSize: '0.65rem', color: '#fff', textDecoration: 'underline', cursor: 'pointer', marginTop: '2px', fontWeight: '500' }}
                          >
                            Upgrade to Customize Solfeggio
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
            <a href="#about" style={{ marginLeft: '1.5rem' }}>{t('navPhilosophy')}</a>
            <a href="#guided-meditation-section" style={{ marginLeft: '0.8rem', marginRight: '1rem' }}>{t('navMeditation')}</a>
            <a href="#mobile-service" style={{ marginLeft: '0.8rem', marginRight: '1rem' }}>{t('navScheduling')}</a>
            <a href="#protocols-section" style={{ marginLeft: '0.8rem', marginRight: '1rem' }}>{t('navProtocols')}</a>
            <a href="#learning-section" style={{ marginLeft: '0.8rem', marginRight: '1rem' }}>{t('navLearning')}</a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setShowMyStories(true); }} 
              style={{ marginLeft: '0.8rem', marginRight: '2rem', cursor: 'pointer' }}
            >
              {t('navReflections')}
            </a>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginLeft: '0.8rem', marginRight: '1rem' }}>
              {renderLanguageDropdown()}
            </div>
            
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
                  {t('navLogIn')}
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
                          await handleLogout();
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
                {t('navConsultAura')}
              </button>
              
              <button 
                onClick={() => document.getElementById('mobile-service').scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-primary" 
                style={{ padding: '0.6rem 1.5rem' }}
              >
                {t('navSetAppointment')}
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
                {t('heroSub')}
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
                  <Zap size={18} /> {user && (user.subscription === 'healing' || user.role === 'owner') 
                    ? (language === 'es' ? 'Acceder al Santuario' : language === 'zh' ? '进入避难所' : language === 'pt' ? 'Acessar Santuário' : language === 'ja' ? 'サンクチュアリに入る' : language === 'fr' ? 'Accéder au Sanctuaire' : 'Access Sanctuary') 
                    : user 
                      ? (language === 'es' ? 'Actualizar Resonancia' : language === 'zh' ? '升级共鸣' : language === 'pt' ? 'Atualizar Ressonância' : language === 'ja' ? '共振のアップグレード' : language === 'fr' ? 'Améliorer la Résonance' : 'Upgrade Resonance') 
                      : (showSignupFlow 
                        ? (language === 'es' ? 'Cerrar Solicitud' : language === 'zh' ? '关闭申请' : language === 'pt' ? 'Fechar Inscrição' : language === 'ja' ? '閉じる' : language === 'fr' ? 'Fermer l\'inscription' : 'Close Application') 
                        : t('heroCTAStart'))}
                </button>
                
                {!user && (
                  <p style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.9rem' }}>
                    {t('heroAlreadyAccount')}{' '}
                    <span 
                      onClick={() => setShowLoginModal(true)}
                      style={{ 
                        color: 'var(--accent-gold)', 
                        cursor: 'pointer', 
                        textDecoration: 'underline' 
                      }}
                    >
                      {t('heroLogin')}
                    </span>
                  </p>
                )}
                <button 
                  className="btn" 
                  style={{background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)'}}
                  onClick={() => setShowScience(true)}
                >
                  {t('heroCTAScience')}
                </button>
              </div>
              <p style={{ 
                fontSize: '0.72rem', 
                opacity: 0.65, 
                marginTop: '1.25rem', 
                color: 'var(--text-muted)', 
                maxWidth: '520px', 
                lineHeight: '1.4', 
                textAlign: 'left' 
              }}>
                {language === 'es' ? 'Reiki & Sage ofrece servicios generales de bienestar espiritual, meditación y relajación. No ofrecemos tratamientos médicos, diagnósticos ni servicios clínicos.' :
                 language === 'zh' ? 'Reiki & Sage 提供通用精神健康、冥想和放松服务。我们不提供任何医疗、诊断或临床治疗服务。' :
                 language === 'pt' ? 'Reiki & Sage oferece serviços gerais de bem-estar espiritual, meditação e relaxamento. Não oferecemos tratamentos médicos, diagnósticos ou serviços clínicos.' :
                 language === 'ja' ? 'Reiki & Sageは一般的なスピリチュアルウェルネス、瞑想、リラクゼーションサービスを提供しています。医療行為、診断、臨床サービスは提供していません。' :
                 language === 'fr' ? 'Reiki & Sage propose des services généraux de bien-être spirituel, de méditation et de relaxation. Nous ne proposons pas de traitements médicaux, de diagnostics ou de services cliniques.' :
                 'Reiki & Sage provides general spiritual wellness, meditation, and relaxation services. We do not offer medical treatments, diagnoses, or clinical services.'}
              </p>
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


      <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
        <DailyFrequency />
      </div>

      {showInstallBanner && renderInstallBanner()}

      {renderPhilosophySection(false)}
      
      {renderGuidedMeditationSection(false)}

      <section id="mobile-service" style={{background: 'var(--bg-section-alt)'}}>
        <div className="container">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center'}}>
            <div>
              <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)'}}>{t('resonanceTitle')}</h3>
              <p style={{fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-main)'}}>
                {t('resonanceDesc')}
              </p>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                  <div 
                    className="glass card-hover" 
                    style={{padding: '1.5rem', textAlign: 'center', cursor: 'pointer'}}
                    onClick={() => setBookingType('onsite')}
                  >
                    <div style={{fontSize: '1.5rem', color: 'var(--accent-gold)', marginBottom: '0.5rem'}}>🚚</div>
                    <div style={{fontWeight: '600', color: 'var(--text-main)'}}>{t('resonanceOnSite')}</div>
                  </div>
                  <div 
                    className="glass card-hover" 
                    style={{padding: '1.5rem', textAlign: 'center', cursor: 'pointer', color: 'var(--text-main)'}}
                    onClick={() => setBookingType('portal')}
                  >
                    <div style={{fontSize: '1.5rem', color: 'var(--accent-gold)', marginBottom: '0.5rem'}}>⚡</div>
                    <div style={{fontWeight: '600', color: 'var(--text-main)'}}>{t('resonancePortable')}</div>
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

      {renderProtocolsSection(false)}

      <section id="learning-section" style={{ backgroundColor: 'var(--bg-primary)', padding: '4rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Suspense fallback={<LoadingSpinner />}>
            <LearnSection isMobileLayout={false} />
          </Suspense>
        </div>
      </section>

      {renderComingSoonSection(false)}

      {/* Science Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        {showScience && <ScienceModal onClose={() => setShowScience(false)} />}
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

      {showMeditationModal && renderMeditationModal()}

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
                onSubmit={() => {
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

      {user && (user.role === 'admin' || user.role === 'owner') && (!isFirebaseConfigured() || ['carissabright@gmail.com', 'jasonmounts77@yahoo.com'].includes(user.email?.toLowerCase())) && (
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
      
      <footer style={{padding: '4rem 0 9rem 0', textAlign: 'left', backgroundColor: 'var(--bg-section-alt)', color: 'var(--text-main)', borderTop: '1px solid rgba(255,255,255,0.05)'}}>
        <div className="container" style={{maxWidth: '1200px', margin: '0 2rem'}}>
          <h2 style={{color: 'var(--accent-ethereal)', marginBottom: '0.5rem', letterSpacing: '2px'}}>Reiki & Sage</h2>
          <p style={{opacity: '0.8', marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem'}}>
            The future of healing is compassionate, advanced, and uniquely yours.
          </p>
          {/* Desktop Wellness Disclaimer */}
          <div style={{
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            lineHeight: '1.6', 
            marginBottom: '2rem', 
            padding: '1.25rem', 
            border: '1px solid rgba(255,255,255,0.05)', 
            borderRadius: '12px', 
            background: 'rgba(0,0,0,0.1)'
          }}>
            <strong>{t('complianceDisclaimerTitle')}</strong> {t('complianceDisclaimerText')}
          </div>
          <div style={{fontSize: '0.8rem', opacity: '0.6', color: 'var(--text-muted)', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px', flexWrap: 'wrap'}}>
            <span>© 2026 Reiki & Sage Healing Arts. All rights reserved.</span>
            <span>|</span>
            <span
              onClick={() => setShowLegalModal('terms')}
              style={{cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-muted)'}}
            >
              Terms
            </span>
            <span>|</span>
            <span
              onClick={() => setShowLegalModal('privacy')}
              style={{cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-muted)'}}
            >
              Privacy
            </span>
            <span>|</span>
            <span
              onClick={() => setShowLegalModal('disclaimer')}
              style={{cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-muted)'}}
            >
              Disclaimer
            </span>
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
          !isPremiumUser ? (
            <div 
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', zIndex: 11000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(15px)'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={{
                  width: '100%', maxWidth: '500px', background: '#0a0a0f',
                  padding: '3rem', borderRadius: '32px', border: '1px solid rgba(212, 175, 55, 0.3)',
                  position: 'relative', textAlign: 'center'
                }}
              >
                <button 
                  onClick={() => setShowAIInterface(false)}
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}
                >
                  ✕
                </button>
                <Shield size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.4))' }} />
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>Guardian Tier Required</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                  The AI Aura & Biofield Guide is reserved for members of our Guardian Tier. Upgrade to access Carissa's digital twin and receive advanced metaphysical alignments.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      setShowAIInterface(false);
                      setShowSubscriptionPage(true);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem' }}
                  >
                    UPGRADE NOW
                  </button>
                  <button 
                    onClick={() => setShowAIInterface(false)}
                    className="btn"
                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)' }}
                  >
                    CLOSE
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <AIHealerInterface 
              user={user} 
              onClose={() => setShowAIInterface(false)} 
              onOpenBooking={() => setBookingType('portable')}
              onOpenLogin={() => setShowLoginModal(true)}
              onApply={() => setShowHealerApp(true)}
            />
          )
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
          {showUserFullDashboard && user && (
            <UserDashboard 
              gamificationState={gamificationState}
              user={user}
              onClose={() => setShowUserFullDashboard(false)}
              onUpdateUser={handleUpdateUser}
              onNavigateToBooking={() => {
                setShowUserFullDashboard(false);
                setBookingType('portable');
                setTimeout(() => {
                  document.getElementById('mobile-service')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
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

      {/* Healer Dashboard (Master Owner vs Staff Healer) */}
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence>
          {showHealerDashboard && user?.role === 'healer' && (
            <StaffHealerDashboard
              user={user}
              onLogout={() => {
                setShowHealerDashboard(false);
                setUser(null);
                localStorage.removeItem('user_profile');
                toast.success('Signed out of Staff Dashboard');
              }}
              onLaunchVideoRoom={(bookingSession) => {
                setShowHealerDashboard(false);
                setActiveSession(bookingSession);
                setShowLivePortal(true);
              }}
            />
          )}
          {showHealerDashboard && user?.role !== 'healer' && (
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

      {/* Legal Modal (Terms, Privacy, Disclaimer) */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {showLegalModal && (
            <LegalModal
              initialTab={showLegalModal}
              onClose={() => setShowLegalModal(null)}
            />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Sonic Sound Baths Modal */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {showSoundBaths && (
            <SonicSoundBaths onClose={() => setShowSoundBaths(false)} />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Biofield Pulse Modal */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {showBiofieldPulse && (
            <BiofieldPulse 
              onClose={() => setShowBiofieldPulse(false)} 
              onOpenProtocol={(protoId) => {
                const proto = protocols.find(p => p.id === protoId) || protocols[0];
                setSelectedProtocol(proto);
                setShowPortal(true);
              }}
              onOpenSoundBaths={() => setShowSoundBaths(true)}
              onOpenVoiceStudio={() => setShowVoiceReflectionStudio(true)}
            />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Voice Reflection Studio Modal */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {showVoiceReflectionStudio && (
            <VoiceReflectionStudio 
              onClose={() => setShowVoiceReflectionStudio(false)}
              onSubmitted={() => setShowMyStories(true)}
            />
          )}
        </AnimatePresence>
      </Suspense>

      {/* iOS Safari PWA Install Modal */}
      {renderIOSInstructionModal()}

      {/* Level-Up Celebration Overlay */}
      {showLevelUp && (
        <div className="level-up-overlay" onClick={() => setShowLevelUp(null)}>
          <div className="level-up-card">
            <div className="level-up-icon">⚡</div>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display', color: '#d4af37', marginBottom: '0.5rem' }}>
              Level Up!
            </h2>
            <div style={{ fontSize: '1.5rem', color: showLevelUp.color, fontWeight: '700', marginBottom: '0.5rem' }}>
              {showLevelUp.name}
            </div>
            <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)' }}>
              Level {showLevelUp.level}
            </div>
            <button
              onClick={() => setShowLevelUp(null)}
              className="btn btn-primary"
              style={{ marginTop: '2rem', padding: '0.8rem 2.5rem' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Gating Disclaimer Modal */}
      {!disclaimerAccepted && renderGatingDisclaimerModal()}

    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App
