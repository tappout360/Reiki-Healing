import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  Activity, Calendar, CheckCircle, ChevronRight, Key, Send, Settings, Shield, Sparkles, Star, X, Zap,
  Compass, TrendingUp, Clock, Flame, Award, Mic
} from 'lucide-react';
import { getZodiacSign, getAdvancedHoroscope } from '../utils/horoscopes';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const UserDashboard = ({ user, onClose, onUpdateUser, onNavigateToBooking, onNavigateToProtocols, onJoinLivePortal }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateConfirmPhrase, setDeactivateConfirmPhrase] = useState('');
  
  // Community & Feedback States
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  
  // Vibrational History
  const [vibrationalLogs, setVibrationalLogs] = useState([]);

  // Load stories and logs from Firebase or localStorage
  useEffect(() => {
    const loadData = async () => {
      if (isFirebaseConfigured() && user?.id) {
        try {
          const [storiesData, logsData] = await Promise.all([
            db.getApprovedStories(),
            db.getSessionLogs(user.id)
          ]);
          setStories(storiesData);
          setVibrationalLogs(logsData);
        } catch (err) {
          console.error('Error loading dashboard data:', err);
        }
      } else {
        setStories(JSON.parse(localStorage.getItem('aura_stories') || '[]'));
        setVibrationalLogs(JSON.parse(localStorage.getItem('vibrational_logs') || '[]'));
      }
    };
    loadData();
  }, [user?.id]);
  
  // Settings States
  const [tempBirthDate, setTempBirthDate] = useState(user?.birthDate || '');
  const [isUpdatingAlignment, setIsUpdatingAlignment] = useState(false);

  const [isHandbookOpen, setIsHandbookOpen] = useState(false);
  const [currentIntention, setCurrentIntention] = useState(user?.currentIntention || 'Balance');
  const [waveNotes, setWaveNotes] = useState(() => JSON.parse(localStorage.getItem(`aura_wave_notes_${user?.email}`) || '{}'));
  const [activeNoteDay, setActiveNoteDay] = useState(null);
  const [noteText, setNoteText] = useState('');


  
  useEffect(() => {
    if (user?.birthDate) setTempBirthDate(user.birthDate);
  }, [user?.birthDate]);

  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('aura_user_prefs');
    return saved ? JSON.parse(saved) : {
      notifications: true,
      highFidelity: true,
      darkMode: true
    };
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem('aura_user_prefs', JSON.stringify(prefs));
  }, [prefs]);

  const togglePref = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} preference updated.`);
  };

  const handleUpdateAlignment = () => {
    setIsUpdatingAlignment(true);
    setTimeout(() => {
      onUpdateUser({ ...user, birthDate: tempBirthDate });
      setIsUpdatingAlignment(false);
      toast.success('Celestial alignment recalibrated.');
    }, 1500);
  };

  const handleUpdateIntention = (intention) => {
    setCurrentIntention(intention);
    onUpdateUser({ ...user, currentIntention: intention });
    toast.success(`Resonance focal point set to: ${intention}`);
  };

  const handleSaveWaveNote = () => {
    const updatedNotes = { ...waveNotes, [activeNoteDay]: noteText };
    setWaveNotes(updatedNotes);
    localStorage.setItem(`aura_wave_notes_${user.email}`, JSON.stringify(updatedNotes));
    setActiveNoteDay(null);
    setNoteText('');
    toast.success('Observation recorded in your bio-archive.');
  };
  
  if (!user) return null;

  const sign = getZodiacSign(user.birthDate);
  const resonance = sign ? getAdvancedHoroscope(sign.name) : null;

  // Dynamic Data Calculation
  const auraPurity = Math.min(100, 85 + (user.sessions || 0) * 1.5);
  
  const generateBioFieldHistory = () => {
    const base = [
      { day: 'Mon', level: 65, color: '#ff7675' },
      { day: 'Tue', level: 78, color: '#fdcb6e' },
      { day: 'Wed', level: 72, color: '#e17055' },
      { day: 'Thu', level: 85, color: '#00b894' },
      { day: 'Fri', level: 92, color: '#00cec9' },
      { day: 'Sat', level: 88, color: '#0984e3' },
      { day: 'Sun', level: auraPurity, color: resonance?.color || '#6c5ce7' },
    ];
    return base;
  };

  const bioFieldHistory = generateBioFieldHistory();

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
    }, 2000);
  };

  const handleSubmitStory = async (e) => {
    e.preventDefault();
    if (!newStory.trim()) return toast.error("Please share a reflection before submitting.");
    
    setIsSubmittingStory(true);
    try {
      const storyEntry = {
        userName: user.name,
        story: newStory,
        rating: newRating,
        userId: isFirebaseConfigured() ? auth.getUser()?.uid || null : null,
      };

      if (isFirebaseConfigured()) {
        await db.submitStory(storyEntry);
      } else {
        const existing = JSON.parse(localStorage.getItem('aura_stories') || '[]');
        localStorage.setItem('aura_stories', JSON.stringify([...existing, { ...storyEntry, id: Date.now().toString(), status: 'pending', timestamp: new Date().toISOString() }]));
        setStories([...existing, storyEntry]);
      }

      setNewStory('');
      setNewRating(5);
      toast.success("Reflection sent to the Archive for resonance check.");
    } catch (error) {
      console.error("Story submission failed:", error);
      toast.error("Could not submit reflection. Please try again.");
    } finally {
      setIsSubmittingStory(false);
    }
  };

  return (
    <>
      <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10010, // Increased to clearly stay above all other modals/modals
        background: 'rgba(5, 5, 12, 0.94)', // Further adjusted for visibility
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Background Animated Aura */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            background: `radial-gradient(circle at center, ${resonance?.color || 'var(--accent-gold)'}66 0%, transparent 70%)`,
            filter: 'blur(100px)'
          }}
        />
      </div>

      {/* Header Bar */}
      <div style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-ethereal))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
          }}>
            <Shield size={20} color="#000" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.5px' }}>
              SANCTUARY CORE
            </h2>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Secure Personal Archive
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', marginRight: '2rem' }}>
            {['Overview', 'Vibrational Log', 'Schedule', 'Community', 'My Reflections', 'Settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === tab.toLowerCase() ? 'var(--accent-gold)' : 'rgba(255,255,255,0.4)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '0.5rem 0'
                }}
              >
                {tab}
                {activeTab === tab.toLowerCase() && (
                  <motion.div 
                    layoutId="activeTab"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--accent-gold)',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </button>
            ))}
           </div>
          
          <motion.button
            whileHover={{ scale: 1.1, background: 'rgba(212, 175, 55, 0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsHandbookOpen(true)}
            style={{
              background: 'none',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '20px',
              padding: '6px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'var(--accent-gold)',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginRight: '1rem'
            }}
          >
            <Compass size={14} />
            HANDBOOK
          </motion.button>

          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            <X size={20} />
          </motion.button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Bio Stats */}
        <div style={{
          width: '320px',
          padding: '2rem',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.01)'
        }}>
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            {/* Profile area — pending rebuild */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '100%',
              margin: '0 auto 1.5rem',
              padding: '6px',
              border: '2px solid rgba(212, 175, 55, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.03)'
            }}>
              <Sparkles size={48} color="var(--accent-gold)" style={{ opacity: 0.6 }} />
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>{user.name}</h3>
            <span style={{ 
              fontSize: '0.75rem', 
              color: resonance?.color || 'var(--accent-gold)', 
              fontWeight: 'bold',
              background: `${resonance?.color || 'var(--accent-gold)'}22`,
              padding: '4px 12px',
              borderRadius: '20px',
              border: `1px solid ${resonance?.color || 'var(--accent-gold)'}44`
            }}>
              {user.subscription.toUpperCase()} MEMBER
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Total Alignment</span>
                <TrendingUp size={16} color="var(--accent-gold)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{auraPurity.toFixed(1)}%</div>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.75rem', color: '#00b894' }}>+2.4%</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>from last cycle</span>
              </div>
            </div>

            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Active Sessions</span>
                <Clock size={16} color="var(--accent-ethereal)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{user.sessions || 4}</div>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Next resonance in 4 days</span>
              </div>
            </div>

            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Aura Strength</span>
                <Activity size={16} color="#e17055" />
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '0.75rem 0' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${auraPurity}%` }}
                  style={{ height: '100%', background: `linear-gradient(90deg, #e17055, ${resonance?.color || '#6c5ce7'})`, borderRadius: '2px' }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{auraPurity.toFixed(0)}% Purity</span>
            </div>

            {/* Healing Streak Card */}
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Healing Streak</span>
                <Flame size={16} color="#e17055" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: (user.streak || 0) >= 7 ? '#f39c12' : (user.streak || 0) >= 3 ? '#e17055' : 'var(--text-main)' }}>
                  {user.streak || 0}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>days</span>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '4px' }}>
                {[1,2,3,4,5,6,7].map(d => (
                  <div key={d} style={{
                    flex: 1, height: '4px', borderRadius: '2px',
                    background: d <= (user.streak || 0) 
                      ? 'linear-gradient(90deg, #e17055, #f39c12)' 
                      : 'rgba(255,255,255,0.1)'
                  }} />
                ))}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                Best: {user.longestStreak || 0} days
              </div>
            </div>

            {/* Milestone Badges */}
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Badges</span>
                <Award size={16} color="var(--accent-gold)" />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: 'First Light', threshold: 1, icon: '✨' },
                  { label: 'Seeker', threshold: 3, icon: '🔮' },
                  { label: 'Adept', threshold: 5, icon: '⚡' },
                  { label: 'Master', threshold: 10, icon: '👑' },
                ].map(badge => {
                  const earned = (user.sessions || 0) >= badge.threshold;
                  return (
                    <div key={badge.label} title={`${badge.label} — ${badge.threshold} sessions`} style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem',
                      background: earned ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${earned ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}`,
                      opacity: earned ? 1 : 0.3,
                      cursor: 'default'
                    }}>
                      {badge.icon}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Center - Dashboards Content */}
        <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                  <div>
                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontFamily: "'Playfair Display', serif" }}>
                      Welcome back seeker.
                    </h1>
                    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
                      {[
                        { icon: <Flame size={14} />, label: `${user.streak || 0}-Day Streak`, color: '#e17055' },
                        { icon: <Zap size={14} />, label: 'Peak Frequency', color: 'var(--accent-gold)' },
                        { icon: <Shield size={14} />, label: 'Field Protected', color: '#00b894' }
                      ].map((achievement, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + (idx * 0.1) }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: `${achievement.color}15`,
                            border: `1px solid ${achievement.color}44`,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            color: achievement.color,
                            fontWeight: '600'
                          }}
                        >
                          {achievement.icon} {achievement.label}
                        </motion.div>
                      ))}
                    </div>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '600px' }}>
                      Your bio-field is showing exceptional resonance today. The galactic current is flowing through your heart chakra.
                    </p>
                  </div>
                  <button 
                    className="btn"
                    onClick={handleCalibrate}
                    style={{
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid var(--accent-gold)',
                      color: 'var(--accent-gold)',
                      padding: '1rem 2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <Zap size={18} className={isCalibrating ? 'animate-spin' : ''} />
                    {isCalibrating ? 'CALIBRATING...' : 'INSTANT REALIGNMENT'}
                  </button>
                </div>

                {/* Resonance Intention Selector */}
                <div style={{ marginBottom: '3rem' }}>
                   <h4 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '1.5rem' }}>
                     CURRENT RESONANCE FOCAL POINT
                   </h4>
                   <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {['Balance', 'Anxiety Relief', 'Creative Flow', 'Physical Vitality', 'Spiritual Clarity'].map(intention => (
                        <motion.button
                          key={intention}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateIntention(intention)}
                          style={{
                            background: currentIntention === intention ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${currentIntention === intention ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}`,
                            padding: '10px 20px',
                            borderRadius: '12px',
                            color: currentIntention === intention ? 'var(--accent-gold)' : 'rgba(255,255,255,0.6)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {currentIntention === intention && <CheckCircle size={14} />}
                          {intention.toUpperCase()}
                        </motion.button>
                      ))}
                   </div>
                </div>

                {/* Dashboard Grid Content */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                  {/* Resonance History Chart (Visual Mockup) */}
                  <div className="glass" style={{ 
                    gridColumn: '1 / -1', 
                    padding: '2rem', 
                    borderRadius: '24px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <h4 style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px' }}>
                      BIO-FIELD HARMONY CHART
                    </h4>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 2rem' }}>
                         {bioFieldHistory.map((data, i) => (
                           <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', flex: 1, position: 'relative' }}>
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${data.level * 1.5}px` }}
                                transition={{ delay: i * 0.1, duration: 1 }}
                                whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                                onClick={() => {
                                  setActiveNoteDay(data.day);
                                  setNoteText(waveNotes[data.day] || '');
                                }}
                                style={{ 
                                  width: '40px', 
                                  background: `linear-gradient(to top, ${data.color}22, ${data.color})`,
                                  borderRadius: '8px 8px 4px 4px',
                                  boxShadow: `0 0 20px ${data.color}33`,
                                  border: `1px solid ${data.color}44`,
                                  cursor: 'pointer'
                                }}
                              />
                              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{data.day}</span>
                              {waveNotes[data.day] && (
                                <div style={{
                                  position: 'absolute',
                                  top: '-10px',
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: 'var(--accent-gold)',
                                  boxShadow: '0 0 10px var(--accent-gold)'
                                }} />
                              )}
                           </div>
                         ))}
                      </div>

                      {/* Note Editor Overlay */}
                      <AnimatePresence>
                        {activeNoteDay && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                              marginTop: '2rem',
                              padding: '1.5rem',
                              background: 'rgba(0,0,0,0.3)',
                              borderRadius: '16px',
                              border: '1px solid rgba(212, 175, 55, 0.3)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <h5 style={{ margin: 0, color: 'var(--accent-gold)' }}>Daily Bio-Archive: {activeNoteDay}</h5>
                              <button onClick={() => setActiveNoteDay(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                                <X size={16} />
                              </button>
                            </div>
                            <textarea 
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Describe your energetic state or any observations..."
                              style={{
                                width: '100%',
                                height: '80px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                padding: '10px',
                                fontSize: '0.9rem',
                                resize: 'none',
                                marginBottom: '1rem'
                              }}
                            />
                            <button 
                              className="btn btn-primary" 
                              onClick={handleSaveWaveNote}
                              style={{ width: '100%', padding: '0.8rem', fontSize: '0.8rem' }}
                            >
                              RECORD OBSERVATION
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </div>

                  {/* Galactic News / Reading */}
                  <div className="glass" style={{ 
                    padding: '2rem', 
                    borderRadius: '24px',
                    background: resonance ? `linear-gradient(135deg, rgba(255,255,255,0.02), ${resonance.color}22)` : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${resonance?.color || 'rgba(255,255,255,0.05)'}44`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                       <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
                         <Compass size={24} color={resonance?.color || 'var(--accent-gold)'} />
                       </div>
                       <div>
                         <h4 style={{ margin: 0 }}>Daily Alchemical Advice</h4>
                         <span style={{ fontSize: '0.7rem', color: resonance?.color || 'var(--accent-gold)' }}>Transiting through {resonance?.name}</span>
                       </div>
                    </div>
                    <p style={{ lineHeight: '1.8', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)' }}>
                      "{resonance?.message || "The stars are quiet today, gathering energy for your next expansion."}"
                    </p>
                    <button 
                      onClick={onNavigateToProtocols}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: resonance?.color || 'var(--accent-gold)', 
                        padding: 0, 
                        fontWeight: '600', 
                        fontSize: '0.9rem', 
                        marginTop: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      EXPLORE MATCHED PROTOCOLS <TrendingUp size={16} />
                    </button>
                  </div>

                  {/* Upcoming Journey */}
                  <div className="glass" style={{ 
                    padding: '2rem', 
                    borderRadius: '24px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                       <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
                         <Calendar size={24} color="var(--accent-ethereal)" />
                       </div>
                       <div>
                         <h4 style={{ margin: 0 }}>Vibrational Itinerary</h4>
                         <span style={{ fontSize: '0.7rem', color: 'var(--accent-ethereal)' }}>Synchronized Events</span>
                       </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ textAlign: 'center', width: '40px' }}>
                             <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>FEB</div>
                             <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>12</div>
                          </div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Rose Quartz Rehearsal</div>
                              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Digital Portal Transmission</div>
                           </div>
                           <button 
                             onClick={() => onJoinLivePortal({ id: 1, title: 'Rose Quartz Rehearsal' })}
                             className="btn"
                             style={{ 
                               fontSize: '0.7rem', 
                               padding: '5px 12px', 
                               background: 'var(--accent-gold)', 
                               color: '#000',
                               fontWeight: 'bold',
                               borderRadius: '20px'
                             }}
                           >
                             JOIN
                           </button>
                        </div>
                        <motion.div 
                         whileHover={{ x: 5, background: 'rgba(255,255,255,0.02)' }}
                         style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                         onClick={() => onJoinLivePortal({ id: 2, title: 'Amethyst Attunement' })}
                        >
                           <div style={{ textAlign: 'center', width: '40px' }}>
                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>FEB</div>
                              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>24</div>
                           </div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Amethyst Attunement</div>
                              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>High-Frequency Stream</div>
                           </div>
                           <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '2px 8px', borderRadius: '10px' }}>
                             ENTER
                           </div>
                        </motion.div>
                    </div>

                    <button 
                      className="btn"
                      onClick={onNavigateToBooking}
                      style={{ 
                        width: '100%', 
                        marginTop: '2rem', 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.85rem'
                      }}
                    >
                      SCHEDULE NEW SESSION
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'vibrational log' && (
              <motion.div
                key="vibrational log"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                 <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>Vibrational Signature History</h2>
                 <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem' }}>Review your journey through the spectrum of consciousness.</p>
                 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {vibrationalLogs.length === 0 ? (
                      <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                        Your vibrational history is currently clear. Complete a protocol to begin your archive.
                      </div>
                    ) : (
                      vibrationalLogs.map((log) => (
                        <div key={log.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '2rem', background: 'rgba(255,255,255,0.01)' }}>
                           <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
                           <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{log.protocolName} Calibration</div>
                              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>+{log.hzGain}hz</div>
                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>NET GAIN</div>
                           </div>
                           <ChevronRight size={20} color="rgba(255,255,255,0.2)" />
                        </div>
                      ))
                    )}
                 </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                 <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>Vibrational Itinerary</h2>
                 <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem' }}>Your upcoming appointments and portal transmissions.</p>
                 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {(() => {
                        const allBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
                        const myBookings = allBookings.filter(b => b.client.email === user.email);
                        
                        if (myBookings.length === 0) {
                            return <div style={{padding: '3rem', textAlign: 'center', opacity: 0.5}}>No upcoming sessions found in the ether.</div>;
                        }

                        return myBookings.map(b => (
                            <div key={b.id} className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: b.sessionCode ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center', background: b.sessionCode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(160, 210, 235, 0.1)', padding: '1rem', borderRadius: '16px', border: b.sessionCode ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(160, 210, 235, 0.2)' }}>
                                        <div style={{ fontSize: '0.8rem', color: b.sessionCode ? 'var(--accent-gold)' : 'var(--accent-ethereal)' }}>{new Date(b.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{new Date(b.date).getDate()}</div>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{b.type}</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', margin: '5px 0' }}>{b.time} • Status: {b.status.toUpperCase()}</p>
                                        {b.sessionCode && (
                                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Key size={14} color="var(--accent-gold)" />
                                                <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '2px' }}>{b.sessionCode}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {b.sessionCode && b.status === 'accepted' && (
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={() => onJoinLivePortal(b)}
                                            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                        >
                                            JOIN PORTAL
                                        </button>
                                    )}
                                    <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>RESCHEDULE</button>
                                </div>
                            </div>
                        ));
                    })()}
                  </div>

                 <button 
                  className="btn btn-primary" 
                  onClick={onNavigateToBooking}
                  style={{ marginTop: '3rem', width: '100%', padding: '1.2rem' }}
                 >
                   SCHEDULE NEW RESONANCE SESSION
                 </button>
              </motion.div>
            )}

            {activeTab === 'community' && (
              <motion.div
                key="community"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                 {/* Header with Stats */}
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                           <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>Community Echoes</h2>
                           <p style={{ color: 'rgba(255,255,255,0.5)' }}>Vibrational reflections from the collective sanctuary.</p>
                        </div>
                        <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--accent-gold)' }}>
                           <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Global Resonance</div>
                           <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                              {(stories.filter(s => s.status === 'approved').reduce((acc, s) => acc + s.rating, 0) / Math.max(1, stories.filter(s => s.status === 'approved').length) || 5.0).toFixed(1)}
                              <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>/5.0</span>
                           </div>
                        </div>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }}>
                    {/* Submission Form */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)' }}>
                       <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Sparkles size={20} /> Share Your Story
                       </h3>
                       <form onSubmit={handleSubmitStory}>
                          <div style={{ marginBottom: '1.5rem' }}>
                             <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>SYSTEM RATING</label>
                             <div style={{ display: 'flex', gap: '8px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                   <Star 
                                      key={star}
                                      size={24}
                                      onClick={() => setNewRating(star)}
                                      fill={newRating >= star ? 'var(--accent-gold)' : 'none'}
                                      stroke={newRating >= star ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)'}
                                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                   />
                                ))}
                             </div>
                          </div>
                          <div style={{ marginBottom: '1.5rem' }}>
                             <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>YOUR REFLECTION</label>
                             <textarea 
                                value={newStory}
                                onChange={(e) => setNewStory(e.target.value)}
                                placeholder="How has your frequency shifted? Share your experience..."
                                style={{ 
                                   width: '100%', 
                                   height: '150px', 
                                   background: 'rgba(0,0,0,0.3)', 
                                   border: '1px solid rgba(255,255,255,0.1)', 
                                   color: '#fff', 
                                   padding: '1rem', 
                                   borderRadius: '12px',
                                   resize: 'none',
                                   fontFamily: 'inherit'
                                }}
                             />
                           </div>

                           <div style={{ 
                              marginBottom: '1.5rem', 
                              padding: '1rem', 
                              borderRadius: '12px', 
                              background: 'rgba(255,255,255,0.02)', 
                              border: '1px dashed rgba(255,255,255,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                           }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                 <Mic size={18} color="rgba(255,255,255,0.3)" />
                                 <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Voice Resonance (Coming Soon)</span>
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', opacity: 0.5, fontStyle: 'italic' }}>Ready for future audio hooks...</div>
                           </div>
                          <button 
                             type="submit"
                             disabled={isSubmittingStory}
                             className="btn btn-primary"
                             style={{ width: '100%', padding: '1rem' }}
                          >
                             {isSubmittingStory ? 'TRANSMITTING...' : 'SUBMIT TO ARCHIVE'}
                          </button>
                       </form>
                    </div>

                    {/* Community Feed */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                       <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', marginBottom: '0.5rem' }}>RECENT ECHOES</h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                          {stories.filter(s => s.status === 'approved').length === 0 ? (
                             <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontStyle: 'italic' }}>
                                No stories have resonated publicly yet. Be the first to share.
                             </div>
                          ) : (
                             stories.filter(s => s.status === 'approved').sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map(story => (
                                <div key={story.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent-gold)' }}>{story.userName}</span>
                                      <div style={{ display: 'flex', gap: '2px' }}>
                                         {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={story.rating > i ? 'var(--accent-gold)' : 'none'} stroke={story.rating > i ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)'} />
                                         ))}
                                      </div>
                                   </div>
                                   <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
                                      "{story.story}"
                                   </p>
                                   <div style={{ marginTop: '0.8rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
                                      {new Date(story.timestamp).toLocaleDateString()}
                                   </div>
                                </div>
                             ))
                          )}
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'my reflections' && (
              <motion.div
                key="my reflections"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>My Reflections</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem' }}>Track the journey of your submitted stories through the sanctuary.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stories.filter(s => s.userEmail === user.email).length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                      You haven't shared any reflections yet. Visit the Community tab to share your first story.
                    </div>
                  ) : (
                    stories.filter(s => s.userEmail === user.email).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map(story => (
                      <div key={story.id} className="glass" style={{ 
                        padding: '1.5rem', borderRadius: '16px', 
                        background: 'rgba(255,255,255,0.01)',
                        borderLeft: `4px solid ${story.status === 'approved' ? '#2ecc71' : story.status === 'archived' ? '#e74c3c' : '#f39c12'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(story.rating)].map((_, i) => (
                              <Star key={i} size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />
                            ))}
                          </div>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
                            padding: '3px 10px', borderRadius: '20px',
                            background: story.status === 'approved' ? 'rgba(46, 204, 113, 0.15)' : story.status === 'archived' ? 'rgba(231, 76, 60, 0.15)' : 'rgba(243, 156, 18, 0.15)',
                            color: story.status === 'approved' ? '#2ecc71' : story.status === 'archived' ? '#e74c3c' : '#f39c12',
                            border: `1px solid ${story.status === 'approved' ? '#2ecc7144' : story.status === 'archived' ? '#e74c3c44' : '#f39c1244'}`
                          }}>
                            {story.status === 'approved' ? '✓ Live' : story.status === 'archived' ? '✗ Archived' : '⏳ Pending Review'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', margin: '0 0 0.8rem 0', fontStyle: 'italic' }}>
                          "{story.story}"
                        </p>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
                          {new Date(story.timestamp).toLocaleDateString()} at {new Date(story.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                 <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>Personal Calibration</h2>
                 <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem' }}>Adjust your terrestrial data and spiritual preferences.</p>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                          <Star size={20} color="var(--accent-gold)" />
                          <h4 style={{ margin: 0 }}>Celestial Data</h4>
                       </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>BIRTH DATE</label>
                          <input 
                            type="date" 
                            value={tempBirthDate} 
                            onChange={(e) => setTempBirthDate(e.target.value)}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '8px' }}
                          />
                       </div>
                       <button 
                        className="btn" 
                        onClick={handleUpdateAlignment}
                        disabled={isUpdatingAlignment}
                        style={{ width: '100%', background: 'var(--accent-gold)', color: '#000', fontSize: '0.9rem' }}
                       >
                         {isUpdatingAlignment ? 'RECALIBRATING...' : 'UPDATE ALIGNMENT'}
                       </button>
                    </div>

                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                          <Settings size={20} color="var(--accent-ethereal)" />
                          <h4 style={{ margin: 0 }}>Aura Preferences</h4>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <span style={{ fontSize: '1rem' }}>Enable Healing Notifications</span>
                             <div 
                              onClick={() => togglePref('notifications')}
                              style={{ 
                                width: '45px', height: '24px', 
                                background: prefs.notifications ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', 
                                borderRadius: '12px', position: 'relative', cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                             >
                                <motion.div 
                                  animate={{ x: prefs.notifications ? 21 : 2 }}
                                  style={{ position: 'absolute', top: '2px', width: '20px', height: '20px', background: prefs.notifications ? '#000' : '#fff', borderRadius: '50%' }} 
                                />
                             </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <span style={{ fontSize: '1rem' }}>High Fidelity Audio</span>
                             <div 
                              onClick={() => togglePref('highFidelity')}
                              style={{ 
                                width: '45px', height: '24px', 
                                background: prefs.highFidelity ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', 
                                borderRadius: '12px', position: 'relative', cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                             >
                                <motion.div 
                                  animate={{ x: prefs.highFidelity ? 21 : 2 }}
                                  style={{ position: 'absolute', top: '2px', width: '20px', height: '20px', background: prefs.highFidelity ? '#000' : '#fff', borderRadius: '50%' }} 
                                />
                             </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <span style={{ fontSize: '1rem' }}>Dark Mode Resonance</span>
                             <div 
                              onClick={() => togglePref('darkMode')}
                              style={{ 
                                width: '45px', height: '24px', 
                                background: prefs.darkMode ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', 
                                borderRadius: '12px', position: 'relative', cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                             >
                                <motion.div 
                                  animate={{ x: prefs.darkMode ? 21 : 2 }}
                                  style={{ position: 'absolute', top: '2px', width: '20px', height: '20px', background: prefs.darkMode ? '#000' : '#fff', borderRadius: '50%' }} 
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="glass" style={{ gridColumn: '1 / -1', padding: '2rem', borderRadius: '24px', background: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.2)' }}>
                       <h4 style={{ margin: '0 0 1rem 0', color: '#ff7675' }}>Danger Zone</h4>
                       <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>Permanently disconnect your bio-field from the sanctuary. This action cannot be undone.</p>
                       
                       <AnimatePresence mode="wait">
                         {!isDeactivating ? (
                           <motion.button 
                            key="init"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="btn" 
                            onClick={() => setIsDeactivating(true)}
                            style={{ background: 'rgba(255,118,117,0.1)', border: '1px solid #ff7675', color: '#ff7675' }}
                           >
                             DEACTIVATE RESONANCE
                           </motion.button>
                         ) : (
                           <motion.div 
                            key="confirm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,100,100,0.3)' }}
                           >
                             <p style={{ color: '#ff7675', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '1rem' }}>⚠️ SECONDARY PROTOCOL REQUIRED</p>
                             <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>To verify terminal dissociation, please type <span style={{ color: '#fff', fontWeight: 'bold' }}>DEACTIVATE</span> below:</p>
                             <input 
                                type="text"
                                placeholder="Type here..."
                                value={deactivateConfirmPhrase}
                                onChange={(e) => setDeactivateConfirmPhrase(e.target.value.toUpperCase())}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,100,100,0.5)', color: '#fff', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}
                             />
                             <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                  className="btn" 
                                  disabled={deactivateConfirmPhrase !== 'DEACTIVATE'}
                                  onClick={() => {
                                    localStorage.clear();
                                    window.location.reload();
                                  }}
                                  style={{ 
                                    flex: 1, 
                                    background: deactivateConfirmPhrase === 'DEACTIVATE' ? '#ff7675' : 'rgba(255,118,117,0.1)', 
                                    color: deactivateConfirmPhrase === 'DEACTIVATE' ? '#000' : 'rgba(255,118,117,0.5)',
                                    cursor: deactivateConfirmPhrase === 'DEACTIVATE' ? 'pointer' : 'not-allowed'
                                  }}
                                >
                                  TERMINATE BIO-FIELD
                                </button>
                                <button 
                                  className="btn" 
                                  onClick={() => {
                                    setIsDeactivating(false);
                                    setDeactivateConfirmPhrase('');
                                  }}
                                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                                >
                                  CANCEL
                                </button>
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer / Status Bar */}
      <div style={{
        padding: '1rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.3)'
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
           <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00b894' }} />
              AURA ANALYTICS ONLINE
           </span>
           <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={12} />
              ENCRYPTED BIOMETRIC TUNNEL
           </span>
        </div>
        <div>
           LAST SYNC: JUST NOW
        </div>
      </div>

      {/* Avatar/Icon Picker removed — pending profile system rebuild */}

      <AnimatePresence>
        {isHandbookOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 30000,
              background: 'rgba(5, 5, 12, 0.98)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(30px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              style={{
                width: '95%',
                maxWidth: '700px',
                maxHeight: '85vh',
                background: '#0a0a0f',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '32px',
                padding: '3rem',
                boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
                overflowY: 'auto',
                position: 'relative'
              }}
            >
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                onClick={() => setIsHandbookOpen(false)}
                style={{
                  position: 'absolute',
                  top: '2rem',
                  right: '2rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff'
                }}
              >
                <X size={20} />
              </motion.button>

              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  padding: '12px', 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, var(--accent-gold), #e67e22)',
                  marginBottom: '1.5rem',
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)'
                }}>
                  <Compass size={32} color="#000" />
                </div>
                <h2 style={{ fontSize: '2.5rem', margin: 0, fontFamily: "'Playfair Display', serif" }}>Sanctuary Handbook</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
                  Codex of Ethereal Laws
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {[
                  {
                    icon: <Activity size={24} color="#00cec9" />,
                    title: "Bio-Field Resonance",
                    desc: "Every healing protocol engagement elevates your base frequency. Consistency purifies your aura, unlocking deeper levels of insight and higher-order vibrational stats."
                  },
                  {
                    icon: <Flame size={24} color="#e17055" />,
                    title: "Healing Streaks",
                    desc: "Maintaining a daily resonance practice triggers exponential growth. Streaks of 3, 7, and 30 days grant 'Flame of Awareness' multipliers, intensifying your healing potency."
                  },
                  {
                    icon: <Award size={24} color="var(--accent-gold)" />,
                    title: "Ascension Badges",
                    desc: "As your total frequency reaches critical mass, you ascend through the five tiers: First Light, Seeker, Adept, Master, and ultimately, The Architect."
                  },
                  {
                    icon: <Send size={24} color="#9c88ff" />,
                    title: "Community Echoes",
                    desc: "Sharing your soul reflections in the public sanctuary feeds the collective aura. Approved stories grant 'Global Resonance' points, connecting your field to others."
                  },
                  {
                    icon: <Sparkles size={24} color="#fbc531" />,
                    title: "Vibrational Tuning",
                    desc: "Your profile is your energetic signature. A new profile system is being calibrated to better represent your vibrational identity."
                  }
                ].map((rule, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
                  >
                    <div style={{ 
                      padding: '12px', 
                      borderRadius: '12px', 
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {rule.icon}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#fff' }}>{rule.title}</h4>
                      <p style={{ margin: 0, lineHeight: '1.6', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                        {rule.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={() => setIsHandbookOpen(false)}
                style={{ width: '100%', marginTop: '4rem', padding: '1.2rem' }}
              >
                I ASCEND
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </>
);
};

export default UserDashboard;
