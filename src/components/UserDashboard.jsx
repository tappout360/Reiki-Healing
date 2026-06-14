import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  Activity, Calendar, CheckCircle, ChevronRight, Key, Send, Settings, Shield, Sparkles, Star, X, Zap,
  Compass, TrendingUp, Clock, Flame, Award, Mic, Square, Trash2, Play, Pause
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getZodiacSign, getAdvancedHoroscope } from '../utils/horoscopes';
import { auth, db, isFirebaseConfigured, firestore } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { BADGES, BADGE_CATEGORIES, getLevel, getLevelProgress, getNextLevel, getStats, getBadgesByCategory } from '../utils/gamification';

const UserDashboard = ({ user, onClose, onUpdateUser, onNavigateToBooking, onNavigateToProtocols, onJoinLivePortal, gamificationState }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(1);
  const [calibRegistry, setCalibRegistry] = useState('heart'); // chakra register
  const [calibFlow, setCalibFlow] = useState(3); // 1-5 rating
  const [calibIntention, setCalibIntention] = useState('Balance');
  const [isSubmittingCalibration, setIsSubmittingCalibration] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateConfirmPhrase, setDeactivateConfirmPhrase] = useState('');
  
  // Presence & Resonance States
  const [onlineSeekers, setOnlineSeekers] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [collectivePulseActive, setCollectivePulseActive] = useState(false);
  
  // Community & Feedback States
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  
  // Voice Recording & Playback States
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBase64, setVoiceBase64] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [playingStoryId, setPlayingStoryId] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const previewAudioRef = useRef(null);
  const feedAudioRef = useRef(null);
  const canvasRef = useRef(null);

  // Start Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setVoiceBase64(reader.result);
        };

        // Close stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Failed to access microphone:", err);
      toast.error("Microphone access denied or unsupported.");
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
  };

  // Preview Audio
  const togglePreviewAudio = () => {
    if (isPlayingPreview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      if (voiceBase64) {
        const audio = new Audio(voiceBase64);
        audio.onended = () => setIsPlayingPreview(false);
        previewAudioRef.current = audio;
        audio.play().catch(e => console.error("Audio playback error:", e));
        setIsPlayingPreview(true);
      }
    }
  };

  // Discard Recording
  const discardRecording = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setVoiceBase64('');
    setIsPlayingPreview(false);
    setRecordingDuration(0);
  };

  // Play Story Voice Reflection in Feed
  const toggleFeedAudio = (storyId, voiceData) => {
    if (playingStoryId === storyId) {
      if (feedAudioRef.current) {
        feedAudioRef.current.pause();
      }
      setPlayingStoryId(null);
    } else {
      if (feedAudioRef.current) {
        feedAudioRef.current.pause();
      }
      const audio = new Audio(voiceData);
      audio.onended = () => setPlayingStoryId(null);
      feedAudioRef.current = audio;
      audio.play().catch(e => console.error("Feed audio playback error:", e));
      setPlayingStoryId(storyId);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if (feedAudioRef.current) feedAudioRef.current.pause();
    };
  }, []);

  // Dynamic Lightbody Particle Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Config based on user stats
    const particleCount = Math.min(120, 40 + (user.sessions || 0) * 3);
    const resonanceColor = calibRegistry === 'root' ? '#ff7675'
                         : calibRegistry === 'sacral' ? '#fdcb6e'
                         : calibRegistry === 'solar' ? '#f1c40f'
                         : calibRegistry === 'heart' ? '#2ecc71'
                         : calibRegistry === 'throat' ? '#3498db'
                         : calibRegistry === 'crown' ? '#9b59b6'
                         : 'var(--accent-gold)';

    // Parse hex or variable color
    const baseColor = resonanceColor.startsWith('var') ? '#d4af37' : resonanceColor;

    // Create particles
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 40;
      particles.push({
        x: canvas.width / 2 + Math.cos(angle) * distance,
        y: canvas.height / 2 + Math.sin(angle) * distance,
        angle: angle,
        distance: distance,
        speed: 0.01 + Math.random() * 0.02,
        size: 0.8 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.8,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw central energy core (glowing gradient)
      const coreGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 45
      );
      coreGradient.addColorStop(0, `${baseColor}22`);
      coreGradient.addColorStop(0.5, `${baseColor}05`);
      coreGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 45, 0, Math.PI * 2);
      ctx.fill();

      // Draw outer gold boundary circle
      ctx.strokeStyle = `${baseColor}22`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 54, 0, Math.PI * 2);
      ctx.stroke();

      // Draw particles orbiting
      particles.forEach((p) => {
        // Orbit logic
        p.angle += p.speed;
        
        // Dynamic breathing scale (breathe cycle)
        const breathe = Math.sin(time) * 4;
        const radius = p.distance + breathe;

        const x = canvas.width / 2 + Math.cos(p.angle) * radius;
        const y = canvas.height / 2 + Math.sin(p.angle) * radius;

        // Particle pulse
        const opacity = Math.abs(Math.sin(time * 2 + p.pulseOffset)) * p.opacity;

        ctx.fillStyle = baseColor;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [user.sessions, calibRegistry]);

  // Live Resonance Presence & Listener
  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe = null;
    let heartbeatInterval = null;

    if (isFirebaseConfigured()) {
      // 1. Write current user presence document
      const userPresenceRef = doc(firestore, 'presence', user.id);
      
      const writePresence = async () => {
        try {
          await setDoc(userPresenceRef, {
            uid: user.id,
            name: user.name || user.displayName || 'Anonymous Seeker',
            email: user.email || '',
            activeChakra: calibRegistry || 'crown',
            resonanceScore: user.resonanceScore || 50,
            lastActive: Date.now()
          });
        } catch (err) {
          console.error("Error setting presence:", err);
        }
      };

      // Write immediately
      writePresence();

      // Set heartbeat interval (every 20 seconds)
      heartbeatInterval = setInterval(writePresence, 20000);

      // 2. Setup onSnapshot listener for presence collection
      const presenceQuery = collection(firestore, 'presence');
      unsubscribe = onSnapshot(presenceQuery, (snapshot) => {
        const seekers = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Filter out users who haven't updated in 60 seconds
          if (data.lastActive && Date.now() - data.lastActive < 60000) {
            seekers.push({
              id: doc.id,
              ...data
            });
          }
        });
        setOnlineSeekers(seekers);
      }, (error) => {
        console.error("Error listening to presence:", error);
      });

      // Cleanup presence on unmount
      return () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (unsubscribe) unsubscribe();
        deleteDoc(userPresenceRef).catch(err => console.error("Error deleting presence:", err));
      };
    } else {
      // Offline Simulation mode
      const mockNames = [
        { name: "Luna Rivers", chakra: "third_eye", score: 92 },
        { name: "Gavin Thorne", chakra: "solar", score: 85 },
        { name: "Estella Sky", chakra: "heart", score: 98 },
        { name: "Zev Brooks", chakra: "root", score: 78 },
        { name: "Aria Breeze", chakra: "throat", score: 88 },
        { name: "Carissa (Healer)", chakra: "crown", score: 100 },
        { name: "Leo Solar", chakra: "sacral", score: 82 }
      ];

      // Format mock seekers
      const initialSeekers = mockNames.map((item, idx) => ({
        id: `mock-${idx}`,
        uid: `mock-${idx}`,
        name: item.name,
        activeChakra: item.chakra,
        resonanceScore: item.score,
        lastActive: Date.now(),
        // Assign random coordinates
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60
      }));

      // Add current user
      const currentUserSeeker = {
        id: user.id || 'current-user',
        uid: user.id || 'current-user',
        name: user.name || 'You (Seeker)',
        email: user.email,
        activeChakra: calibRegistry,
        resonanceScore: user.resonanceScore || 50,
        lastActive: Date.now(),
        x: 50,
        y: 50,
        isSelf: true
      };

      setOnlineSeekers([currentUserSeeker, ...initialSeekers]);

      const interval = setInterval(() => {
        setOnlineSeekers(prev => {
          return prev.map(seeker => {
            if (seeker.isSelf) {
              return {
                ...seeker,
                activeChakra: calibRegistry,
                resonanceScore: user.resonanceScore || 50
              };
            }
            const driftX = (Math.random() - 0.5) * 5;
            const driftY = (Math.random() - 0.5) * 5;
            const scoreDelta = (Math.random() - 0.5) * 4;
            return {
              ...seeker,
              x: Math.min(85, Math.max(15, (seeker.x || 50) + driftX)),
              y: Math.min(85, Math.max(15, (seeker.y || 50) + driftY)),
              resonanceScore: Math.min(100, Math.max(50, Math.floor(seeker.resonanceScore + scoreDelta)))
            };
          });
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user?.id, calibRegistry, user?.resonanceScore]);

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
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass" style={{ 
          background: 'rgba(5, 5, 12, 0.95)', 
          border: '1px solid var(--accent-gold)', 
          padding: '1rem', 
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
        }}>
          <p style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 'bold' }}>{data.date}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#fff' }}>
            Resonance: <span style={{ color: 'var(--accent-gold)' }}>{data.frequency} Hz</span>
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            Protocol: {data.protocol} (+{data.hzGain}Hz)
          </p>
        </div>
      );
    }
    return null;
  };

  const chartData = vibrationalLogs.length > 0 
    ? [...vibrationalLogs]
        .reverse()
        .map((log, index) => {
          const cumulativeHz = 432 + [...vibrationalLogs]
            .reverse()
            .slice(0, index + 1)
            .reduce((sum, l) => sum + parseFloat(l.hzGain || 0), 0);
          return {
            date: log.timestamp ? new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Calibration',
            frequency: parseFloat(cumulativeHz.toFixed(1)),
            hzGain: parseFloat(log.hzGain || 0),
            protocol: log.protocolName || 'Calibration'
          };
        })
    : [
        { date: 'Mon', frequency: 432, hzGain: 0, protocol: 'Baseline' },
        { date: 'Tue', frequency: 445, hzGain: 13, protocol: 'Rose Quartz Sync' },
        { date: 'Wed', frequency: 457, hzGain: 12, protocol: 'Amethyst Purge' },
        { date: 'Thu', frequency: 472, hzGain: 15, protocol: 'Citrine Manifestation' },
        { date: 'Fri', frequency: 488, hzGain: 16, protocol: 'Lapis Throat Calibration' },
        { date: 'Sat', frequency: 502, hzGain: 14, protocol: 'Quartz Lattice Uplift' },
        { date: 'Sun', frequency: 518, hzGain: 16, protocol: 'Celestial Alignment' }
      ];

  const handleStartCalibration = () => {
    setCalibrationStep(1);
    setCalibRegistry('heart');
    setCalibFlow(3);
    setCalibIntention(user?.currentIntention || 'Balance');
    setShowCalibrationModal(true);
  };

  const handleSubmitCalibration = async () => {
    setIsSubmittingCalibration(true);
    
    // Calculate new resonance score
    const flowMultiplier = calibFlow; // 1 to 5
    const registryBonus = calibRegistry === 'crown' ? 5 : calibRegistry === 'heart' ? 4 : calibRegistry === 'third_eye' ? 3 : 2;
    const computedScore = Math.min(100, 50 + (flowMultiplier * 8) + registryBonus);

    const hzGain = parseFloat((calibFlow * 2.5 + Math.random() * 2 + 5).toFixed(1));

    const newCalibrationLog = {
      id: Date.now(),
      protocolId: 'daily_calibration',
      protocolName: `Daily Calibration (${calibRegistry.toUpperCase()})`,
      timestamp: new Date().toISOString(),
      hzGain: hzGain,
      notes: `Intention: ${calibIntention}. Chakra Focus: ${calibRegistry.toUpperCase()}. Flow quality: ${calibFlow}/5.`
    };

    try {
      // 1. Log to Firebase if configured
      if (isFirebaseConfigured() && user?.id) {
        await db.logSession({
          userId: user.id,
          protocolId: 'daily_calibration',
          protocolName: newCalibrationLog.protocolName,
          timestamp: newCalibrationLog.timestamp,
          hzGain: newCalibrationLog.hzGain,
          notes: newCalibrationLog.notes
        });
      }

      // 2. Local logs update
      const existingLogs = JSON.parse(localStorage.getItem('vibrational_logs') || '[]');
      const updatedLogs = [newCalibrationLog, ...existingLogs].slice(0, 50);
      localStorage.setItem('vibrational_logs', JSON.stringify(updatedLogs));
      setVibrationalLogs(updatedLogs);

      // 3. Update User Profile properties
      const updatedUser = {
        ...user,
        resonanceScore: computedScore,
        currentIntention: calibIntention,
        sessions: (user.sessions || 0) + 1
      };
      
      onUpdateUser(updatedUser);

      // 4. Milestone/Achievement toasts
      toast.success(`✨ Calibration complete! Resonance score updated to: ${computedScore}`);
      
      setShowCalibrationModal(false);
    } catch (err) {
      console.error("Failed to complete Daily Calibration:", err);
      toast.error("An error occurred during calibration. Please try again.");
    } finally {
      setIsSubmittingCalibration(false);
    }
  };

  const handleSubmitStory = async (e) => {
    e.preventDefault();
    if (!newStory.trim() && !voiceBase64) return toast.error("Please share a reflection or record a voice note before submitting.");
    
    setIsSubmittingStory(true);
    try {
      const storyEntry = {
        userName: user.name,
        userEmail: user.email,
        story: newStory,
        rating: newRating,
        voiceData: voiceBase64 || null,
        userId: isFirebaseConfigured() ? auth.getUser()?.uid || null : null,
      };

      if (isFirebaseConfigured()) {
        await db.submitStory(storyEntry);
      } else {
        const existing = JSON.parse(localStorage.getItem('aura_stories') || '[]');
        const localEntry = { ...storyEntry, id: Date.now().toString(), status: 'pending', timestamp: new Date().toISOString() };
        localStorage.setItem('aura_stories', JSON.stringify([...existing, localEntry]));
        setStories([...existing, localEntry]);
      }

      setNewStory('');
      setNewRating(5);
      discardRecording();
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
            {['Overview', 'Vibrational Log', 'Achievements', 'Schedule', 'Live Resonance', 'Community', 'My Reflections', 'Settings'].map(tab => (
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
            {/* Dynamic Lightbody Canvas */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '100%',
              margin: '0 auto 1.5rem',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5,5,12,0.6)',
              boxShadow: '0 0 25px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              border: '2px solid rgba(212, 175, 55, 0.2)'
            }}>
              <canvas 
                ref={canvasRef} 
                width={120} 
                height={120} 
                style={{ 
                  width: '120px', 
                  height: '120px',
                  display: 'block'
                }} 
              />
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

            {/* XP Level & Progress */}
            {gamificationState && (
              <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Aura Level</span>
                  <Award size={16} color={getLevel(gamificationState.xp).color} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: '700', color: getLevel(gamificationState.xp).color }}>
                    {getLevel(gamificationState.xp).name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Lv.{getLevel(gamificationState.xp).level}</span>
                </div>
                <div className="xp-bar-container" style={{ marginBottom: '6px' }}>
                  <div
                    className="xp-bar-fill"
                    style={{
                      width: `${getLevelProgress(gamificationState.xp)}%`,
                      background: `linear-gradient(90deg, ${getLevel(gamificationState.xp).color}, var(--accent-gold))`
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                  <span>{gamificationState.xp} XP</span>
                  <span>{getNextLevel(gamificationState.xp) ? `${getNextLevel(gamificationState.xp).xpRequired} XP` : 'MAX'}</span>
                </div>
                {/* Mini badge row */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {gamificationState.earnedBadges.slice(-6).map(id => {
                    const badge = BADGES.find(b => b.id === id);
                    return badge ? (
                      <div key={id} title={badge.name} style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        {badge.icon}
                      </div>
                    ) : null;
                  })}
                  {gamificationState.earnedBadges.length === 0 && (
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>Complete protocols to earn badges</span>
                  )}
                </div>
              </div>
            )}
            {/* Fallback: old badge display when gamification is not active */}
            {!gamificationState && (
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
            )}
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
                    onClick={handleStartCalibration}
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
                    <Zap size={18} />
                    DAILY CALIBRATION
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
                       <div style={{ height: '220px', width: '100%' }}>
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart 
                              data={chartData} 
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                              onClick={(data) => {
                                if (data && data.activePayload && data.activePayload.length) {
                                  const clickedData = data.activePayload[0].payload;
                                  setActiveNoteDay(clickedData.date);
                                  setNoteText(waveNotes[clickedData.date] || '');
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                               <defs>
                                  <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.4}/>
                                     <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0.0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                               <XAxis 
                                  dataKey="date" 
                                  stroke="rgba(255,255,255,0.3)" 
                                  fontSize={10} 
                                  tickLine={false} 
                                  axisLine={false}
                               />
                               <YAxis 
                                  stroke="rgba(255,255,255,0.3)" 
                                  fontSize={10} 
                                  tickLine={false} 
                                  axisLine={false}
                                  domain={['dataMin - 10', 'dataMax + 10']}
                               />
                               <Tooltip content={<CustomTooltip />} />
                               <Area 
                                  type="monotone" 
                                  dataKey="frequency" 
                                  stroke="var(--accent-gold)" 
                                  strokeWidth={2}
                                  fillOpacity={1} 
                                  fill="url(#colorFreq)" 
                                />
                            </AreaChart>
                         </ResponsiveContainer>
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

            {activeTab === 'achievements' && gamificationState && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>Ascension Achievements</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
                  Your journey through the realms of healing — {getStats(gamificationState).earnedBadges} of {getStats(gamificationState).totalBadges + getStats(gamificationState).earnedHidden} badges earned.
                </p>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
                  <div className="gamification-stat">
                    <div className="gamification-stat-value" style={{ color: getLevel(gamificationState.xp).color }}>{gamificationState.xp}</div>
                    <div className="gamification-stat-label">Total XP</div>
                  </div>
                  <div className="gamification-stat">
                    <div className="gamification-stat-value" style={{ color: '#e17055' }}>{gamificationState.totalSessions}</div>
                    <div className="gamification-stat-label">Sessions</div>
                  </div>
                  <div className="gamification-stat">
                    <div className="gamification-stat-value" style={{ color: '#00cec9' }}>{Math.round(gamificationState.totalHzGain)}</div>
                    <div className="gamification-stat-label">Total Hz</div>
                  </div>
                  <div className="gamification-stat">
                    <div className="gamification-stat-value" style={{ color: '#d4af37' }}>{getStats(gamificationState).completionPercent}%</div>
                    <div className="gamification-stat-label">Complete</div>
                  </div>
                </div>

                {/* Badge Categories */}
                {Object.entries(getBadgesByCategory(gamificationState.earnedBadges)).map(([categoryKey, category]) => (
                  <div key={categoryKey} style={{ marginBottom: '2.5rem' }}>
                    <div className="badge-category-header">
                      <div className="badge-category-icon" style={{ background: `${category.color}22`, border: `1px solid ${category.color}44` }}>
                        {category.icon}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{category.label}</h4>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                          {category.badges.filter(b => b.earned).length}/{category.badges.filter(b => !b.hidden || b.earned).length} unlocked
                        </span>
                      </div>
                    </div>
                    <div className="badge-grid">
                      {category.badges.filter(b => !b.hidden || b.earned).map(badge => (
                        <motion.div
                          key={badge.id}
                          className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
                          whileHover={{ scale: badge.earned ? 1.05 : 1.02 }}
                        >
                          {badge.earned && <div className="badge-xp-tag">+{badge.xp} XP</div>}
                          <div className="badge-icon" style={{ background: badge.earned ? `${category.color}22` : 'rgba(255,255,255,0.03)' }}>
                            {badge.icon}
                          </div>
                          <div className="badge-name">{badge.name}</div>
                          <div className="badge-desc">{badge.desc}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
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
                        const myBookings = allBookings.filter(b => {
                            const email = b.client?.email || b.customerEmail || '';
                             return user?.email && email.toLowerCase() === user.email.toLowerCase();
                         });
                        
                        if (myBookings.length === 0) {
                            return <div style={{padding: '3rem', textAlign: 'center', opacity: 0.5}}>No upcoming sessions found in the ether.</div>;
                        }

                        return myBookings.map(b => (
                            <div key={b.id} className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: b.sessionCode ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center', background: b.sessionCode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(160, 210, 235, 0.1)', padding: '1rem', borderRadius: '16px', border: b.sessionCode ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(160, 210, 235, 0.2)' }}>
                                        <div style={{ fontSize: '0.8rem', color: b.sessionCode ? 'var(--accent-gold)' : 'var(--accent-ethereal)' }}>{new Date(b.date || b.bookingDate).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{new Date(b.date || b.bookingDate).getDate()}</div>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{b.type || (b.serviceType === 'onsite' || b.sessionType === 'visit' ? 'On-Site Session' : 'Live Portal Session')}</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', margin: '5px 0' }}>{b.time || b.bookingTime || b.timeSlot} • Status: {b.status.toUpperCase()}</p>
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

            {activeTab === 'live resonance' && (() => {
              const getChakraDetails = (id) => {
                const list = {
                  root: { name: 'Root Chakra', color: '#ff7675', symbol: '🔴' },
                  sacral: { name: 'Sacral Chakra', color: '#fdcb6e', symbol: '🟠' },
                  solar: { name: 'Solar Plexus', color: '#f1c40f', symbol: '🟡' },
                  heart: { name: 'Heart Chakra', color: '#2ecc71', symbol: '🟢' },
                  throat: { name: 'Throat Chakra', color: '#3498db', symbol: '🔵' },
                  crown: { name: 'Crown Chakra', color: '#9b59b6', symbol: '🟣' }
                };
                return list[id] || { name: 'Universal Aura', color: 'var(--accent-gold)', symbol: '✨' };
              };

              return (
                <motion.div
                  key="live-resonance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <style>{`
                    @keyframes pulse-dash {
                      to { stroke-dashoffset: -40; }
                    }
                    @keyframes float-node {
                      0% { transform: translate(-50%, -50%) translateY(0px); }
                      50% { transform: translate(-50%, -50%) translateY(-6px); }
                      100% { transform: translate(-50%, -50%) translateY(0px); }
                    }
                    @keyframes pulse-glow {
                      0% { box-shadow: 0 0 10px var(--glow-color), inset 0 0 5px var(--glow-color); }
                      50% { box-shadow: 0 0 25px var(--glow-color), inset 0 0 10px var(--glow-color); }
                      100% { box-shadow: 0 0 10px var(--glow-color), inset 0 0 5px var(--glow-color); }
                    }
                    @keyframes ripple-out {
                      0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
                      100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
                    }
                    .seeker-node {
                      position: absolute;
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      border-radius: 50%;
                      background: rgba(10, 10, 15, 0.95);
                      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      z-index: 10;
                    }
                    .seeker-node:hover {
                      transform: translate(-50%, -50%) scale(1.15) !important;
                      z-index: 100;
                    }
                    .seeker-node-tooltip {
                      position: absolute;
                      bottom: 110%;
                      left: 50%;
                      transform: translateX(-50%);
                      background: rgba(10, 10, 15, 0.95);
                      border: 1px solid var(--border-color);
                      padding: 8px 12px;
                      border-radius: 12px;
                      font-size: 0.75rem;
                      white-space: nowrap;
                      pointer-events: none;
                      opacity: 0;
                      transition: opacity 0.2s ease;
                      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                      z-index: 200;
                    }
                    .seeker-node:hover .seeker-node-tooltip {
                      opacity: 1;
                    }
                  `}</style>

                  {/* Header with Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>Resonance Portal</h2>
                      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Observe and entangle with seekers currently aligned in the sanctuary field.</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Seekers Aligned</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71', display: 'inline-block', boxShadow: '0 0 10px #2ecc71' }}></span>
                          {onlineSeekers.length}
                        </div>
                      </div>
                      
                      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid var(--accent-gold)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Field Freq (Avg)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                          {onlineSeekers.length > 0 
                            ? Math.round(onlineSeekers.reduce((acc, s) => acc + (s.resonanceScore || 50), 0) / onlineSeekers.length * 1.5 + 432)
                            : 432}
                          <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '2px' }}>Hz</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '3rem' }}>
                    {/* Circular Map Box */}
                    <div>
                      <div 
                        className="glass"
                        style={{
                          background: 'radial-gradient(circle, rgba(18, 12, 30, 0.95) 0%, rgba(5, 3, 10, 0.98) 100%)',
                          border: '1px solid rgba(212, 175, 55, 0.15)',
                          position: 'relative',
                          overflow: 'hidden',
                          height: '420px',
                          borderRadius: '24px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.8), inset 0 0 40px rgba(212,175,55,0.05)'
                        }}
                      >
                        {/* Connections SVG */}
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                          {onlineSeekers.map((seeker, idx) => {
                            const total = onlineSeekers.length;
                            const angle = (idx / Math.max(1, total)) * 2 * Math.PI;
                            const posX = seeker.x !== undefined ? seeker.x : (50 + 35 * Math.cos(angle));
                            const posY = seeker.y !== undefined ? seeker.y : (50 + 35 * Math.sin(angle));
                            
                            return (
                              <g key={`lines-${seeker.id}`}>
                                {/* Pulse line to center */}
                                <line 
                                  x1="50%" y1="50%" 
                                  x2={`${posX}%`} y2={`${posY}%`} 
                                  stroke="rgba(212, 175, 55, 0.15)" 
                                  strokeWidth="1.5" 
                                  strokeDasharray="5,6" 
                                  style={{
                                    animation: 'pulse-dash 5s linear infinite',
                                    animationDirection: seeker.isSelf ? 'normal' : 'reverse'
                                  }}
                                />
                                
                                {/* Connection to neighboring seeker */}
                                {idx > 0 && (() => {
                                  const prev = onlineSeekers[idx - 1];
                                  const prevAngle = ((idx - 1) / total) * 2 * Math.PI;
                                  const prevX = prev.x !== undefined ? prev.x : (50 + 35 * Math.cos(prevAngle));
                                  const prevY = prev.y !== undefined ? prev.y : (50 + 35 * Math.sin(prevAngle));
                                  return (
                                    <line 
                                      x1={`${prevX}%`} y1={`${prevY}%`} 
                                      x2={`${posX}%`} y2={`${posY}%`} 
                                      stroke="rgba(255, 255, 255, 0.04)" 
                                      strokeWidth="1"
                                    />
                                  );
                                })()}
                              </g>
                            );
                          })}
                        </svg>

                        {/* Ripples */}
                        {ripples.map(ripple => (
                          <div 
                            key={ripple.id}
                            style={{
                              position: 'absolute',
                              left: `${ripple.x}%`,
                              top: `${ripple.y}%`,
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: `2px solid ${ripple.color}`,
                              transform: 'translate(-50%, -50%)',
                              animation: 'ripple-out 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
                              pointerEvents: 'none'
                            }}
                          />
                        ))}

                        {/* Global Pulse Ripple */}
                        {collectivePulseActive && (
                          <div 
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: '50%',
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              border: '3px solid var(--accent-gold)',
                              transform: 'translate(-50%, -50%)',
                              animation: 'ripple-out 2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
                              pointerEvents: 'none'
                            }}
                          />
                        )}

                        {/* Central Sanctuary Core Node */}
                        <div 
                          onClick={() => {
                            setCollectivePulseActive(true);
                            setTimeout(() => setCollectivePulseActive(false), 2000);
                            toast.success("Collective Resonance Pulse broadcasted to all active seekers!");
                          }}
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, #d4af37 0%, #1a1a2e 90%)',
                            border: '2px solid var(--accent-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 25px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                            zIndex: 20
                          }}
                        >
                          <Sparkles color="#000" size={24} style={{ animation: 'spin 20s linear infinite' }} />
                        </div>

                        {/* Seeker Nodes */}
                        {onlineSeekers.map((seeker, idx) => {
                          const total = onlineSeekers.length;
                          const angle = (idx / Math.max(1, total)) * 2 * Math.PI;
                          const posX = seeker.x !== undefined ? seeker.x : (50 + 35 * Math.cos(angle));
                          const posY = seeker.y !== undefined ? seeker.y : (50 + 35 * Math.sin(angle));
                          
                          const chakra = getChakraDetails(seeker.activeChakra);
                          const initials = seeker.name
                            ? seeker.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : 'S';

                          return (
                            <div 
                              key={seeker.id}
                              className="seeker-node"
                              onClick={() => {
                                const clickX = seeker.x !== undefined ? seeker.x : posX;
                                const clickY = seeker.y !== undefined ? seeker.y : posY;
                                
                                const newRipple = {
                                  id: Date.now(),
                                  x: clickX,
                                  y: clickY,
                                  color: chakra.color
                                };
                                setRipples(prev => [...prev, newRipple]);
                                setTimeout(() => {
                                  setRipples(prev => prev.filter(r => r.id !== newRipple.id));
                                }, 1500);

                                toast.success(`Resonating with ${seeker.name} (${chakra.name})`);
                              }}
                              style={{
                                left: `${posX}%`,
                                top: `${posY}%`,
                                width: '45px',
                                height: '45px',
                                border: `2px solid ${chakra.color}`,
                                '--glow-color': chakra.color,
                                animation: `float-node ${4 + (idx % 3)}s ease-in-out infinite, pulse-glow 3s ease-in-out infinite`,
                                boxShadow: `0 0 15px ${chakra.color}66`
                              }}
                            >
                              <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>
                                {initials}
                              </span>
                              
                              {/* Hover Tooltip */}
                              <div className="seeker-node-tooltip" style={{ '--border-color': chakra.color }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {seeker.name} {seeker.isSelf && <span style={{ color: 'var(--accent-gold)', fontSize: '0.65rem' }}>(You)</span>}
                                </div>
                                <div style={{ color: chakra.color, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>{chakra.symbol}</span> {chakra.name} Aligned
                                </div>
                                <div style={{ opacity: 0.6, fontSize: '0.65rem' }}>
                                  Frequency: {Math.round((seeker.resonanceScore || 50) * 1.5 + 432)} Hz
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <p style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.5, marginTop: '1rem', fontStyle: 'italic' }}>
                        Click the central Sanctuary Core to broadcast a collective pulse, or click a seeker to synchronize fields.
                      </p>
                    </div>

                    {/* Sidebar Seekers Registry & Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--accent-gold)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Collective Registry
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '5px' }}>
                          {onlineSeekers.map((seeker, idx) => {
                            const chakra = getChakraDetails(seeker.activeChakra);
                            const initials = seeker.name
                              ? seeker.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                              : 'S';
                            return (
                              <div 
                                key={seeker.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.6rem 0.8rem',
                                  borderRadius: '12px',
                                  background: seeker.isSelf ? 'rgba(212, 175, 55, 0.05)' : 'rgba(255,255,255,0.02)',
                                  border: seeker.isSelf ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(255,255,255,0.03)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: `1.5px solid ${chakra.color}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    background: 'rgba(0,0,0,0.2)'
                                  }}>
                                    {initials}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                                      {seeker.name} {seeker.isSelf && <span style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>(You)</span>}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: chakra.color, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <span>{chakra.symbol}</span> {chakra.name}
                                    </div>
                                  </div>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                    {Math.round((seeker.resonanceScore || 50) * 1.5 + 432)}Hz
                                  </span>
                                  
                                  {!seeker.isSelf && (
                                    <button
                                      onClick={() => {
                                        const clickX = seeker.x !== undefined ? seeker.x : (50 + 35 * Math.cos((idx / onlineSeekers.length) * 2 * Math.PI));
                                        const clickY = seeker.y !== undefined ? seeker.y : (50 + 35 * Math.sin((idx / onlineSeekers.length) * 2 * Math.PI));
                                        
                                        const newRipple = {
                                          id: Date.now(),
                                          x: clickX,
                                          y: clickY,
                                          color: chakra.color
                                        };
                                        setRipples(prev => [...prev, newRipple]);
                                        setTimeout(() => {
                                          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
                                        }, 1500);
                                        toast.success(`Resonance pulse sent to ${seeker.name.split(' ')[0]}!`);
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-gold)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0.7,
                                        transition: 'opacity 0.2s'
                                      }}
                                      title="Send Resonance Wave"
                                    >
                                      <Zap size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Resonance Analytics
                        </h3>
                        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                            <span>Entanglement Factor:</span>
                            <span style={{ color: 'var(--accent-ethereal)', fontWeight: 'bold' }}>
                              {onlineSeekers.length > 3 ? 'HIGH RESONANCE' : 'SYNCHRONIZING'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                            <span>Dominant Center:</span>
                            {(() => {
                              const chakraCounts = onlineSeekers.reduce((acc, s) => {
                                acc[s.activeChakra] = (acc[s.activeChakra] || 0) + 1;
                                return acc;
                              }, {});
                              let maxCount = 0;
                              let domChakra = 'crown';
                              Object.entries(chakraCounts).forEach(([k, v]) => {
                                if (v > maxCount) {
                                  maxCount = v;
                                  domChakra = k;
                                }
                              });
                              const ch = getChakraDetails(domChakra);
                              return (
                                <span style={{ color: ch.color, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  {ch.symbol} {ch.name.split(' ')[0]}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Streams / Active Portals Section */}
                  <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Activity size={20} /> Active Sanctuary Streams
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212, 175, 55, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'inline-block', background: 'rgba(233, 30, 99, 0.1)', border: '1px solid rgba(233, 30, 99, 0.3)', color: '#e91e63', fontSize: '0.65rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                            LIVE NOW
                          </div>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '4px' }}>Amethyst Attunement</h4>
                          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Carissa Bright • 96 Seekers Listening</p>
                        </div>
                        <button 
                          onClick={() => onJoinLivePortal({ id: 2, title: 'Amethyst Attunement' })}
                          className="btn btn-primary" 
                          style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem' }}
                        >
                          JOIN STREAM
                        </button>
                      </div>

                      <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
                        <div>
                          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                            SCHEDULED (8:00 PM)
                          </div>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '4px' }}>Rose Quartz Rehearsal</h4>
                          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Collective Heart-Opening Session</p>
                        </div>
                        <button 
                          onClick={() => onJoinLivePortal({ id: 1, title: 'Rose Quartz Rehearsal' })}
                          className="btn" 
                          style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', padding: '0.6rem 1.2rem' }}
                        >
                          SET REMINDER
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

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
                               border: '1px solid rgba(212, 175, 55, 0.15)',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'space-between'
                            }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <Mic size={18} color={isRecording ? 'var(--accent-gold)' : 'rgba(255,255,255,0.5)'} />
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                     {isRecording 
                                       ? `Recording (${recordingDuration}s / 60s)` 
                                       : voiceBase64 
                                         ? 'Voice Reflection Recorded' 
                                         : 'Record Voice Reflection'}
                                  </span>
                               </div>
                               <div style={{ display: 'flex', gap: '10px' }}>
                                  {isRecording ? (
                                     <button
                                        type="button"
                                        onClick={stopRecording}
                                        style={{ background: '#e74c3c', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                                     >
                                        <Square size={14} />
                                     </button>
                                  ) : voiceBase64 ? (
                                     <>
                                        <button
                                           type="button"
                                           onClick={togglePreviewAudio}
                                           style={{ background: 'var(--accent-gold)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'black' }}
                                        >
                                           {isPlayingPreview ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
                                        </button>
                                        <button
                                           type="button"
                                           onClick={discardRecording}
                                           style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                                        >
                                           <Trash2 size={14} />
                                        </button>
                                     </>
                                  ) : (
                                     <button
                                        type="button"
                                        onClick={startRecording}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                                     >
                                        <Mic size={14} />
                                     </button>
                                  )}
                               </div>
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
                                   {story.voiceData && (
                                       <div style={{
                                          background: 'rgba(255,255,255,0.03)',
                                          border: '1px solid rgba(212, 175, 55, 0.15)',
                                          borderRadius: '12px',
                                          padding: '0.8rem 1rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '12px',
                                          marginTop: '1rem',
                                          marginBottom: '0.5rem'
                                       }}>
                                          <button
                                             type="button"
                                             onClick={() => toggleFeedAudio(story.id, story.voiceData)}
                                             style={{
                                                background: 'var(--accent-gold)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: 'black'
                                             }}
                                          >
                                             {playingStoryId === story.id ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
                                          </button>
                                          <div style={{ flex: 1 }}>
                                             <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Voice Reflection</div>
                                             <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden', position: 'relative' }}>
                                                <motion.div
                                                   animate={{ width: playingStoryId === story.id ? '100%' : '0%' }}
                                                   transition={{ duration: playingStoryId === story.id ? 60 : 0, ease: 'linear' }}
                                                   style={{
                                                      background: 'var(--accent-gold)',
                                                      height: '100%',
                                                      width: '0%'
                                                   }}
                                                />
                                             </div>
                                          </div>
                                       </div>
                                    )}
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
                        {story.voiceData && (
                           <div style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(212, 175, 55, 0.15)',
                              borderRadius: '12px',
                              padding: '0.8rem 1rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginBottom: '0.8rem'
                           }}>
                              <button
                                 type="button"
                                 onClick={() => toggleFeedAudio(story.id, story.voiceData)}
                                 style={{
                                    background: 'var(--accent-gold)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'black'
                                 }}
                              >
                                 {playingStoryId === story.id ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
                              </button>
                              <div style={{ flex: 1 }}>
                                 <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Voice Reflection</div>
                                 <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden', position: 'relative' }}>
                                    <motion.div
                                       animate={{ width: playingStoryId === story.id ? '100%' : '0%' }}
                                       transition={{ duration: playingStoryId === story.id ? 60 : 0, ease: 'linear' }}
                                       style={{
                                          background: 'var(--accent-gold)',
                                          height: '100%',
                                          width: '0%'
                                       }}
                                    />
                                 </div>
                              </div>
                           </div>
                        )}
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

      {/* Daily Calibration Modal */}
      <AnimatePresence>
        {showCalibrationModal && (
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
              background: 'rgba(5, 5, 12, 0.96)',
              zIndex: 10020,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              backdropFilter: 'blur(15px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass"
              style={{
                maxWidth: '600px',
                width: '100%',
                padding: '3rem',
                borderRadius: '32px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 0 50px rgba(212, 175, 55, 0.1)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setShowCalibrationModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>

              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '1.5rem', textAlign: 'center' }}>
                ✦ Daily Calibration Cycle ✦
              </span>

              {/* Progress Indicator */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '3rem' }}>
                {[1, 2, 3].map(step => (
                  <div 
                    key={step} 
                    style={{ 
                      flex: 1, 
                      height: '4px', 
                      background: calibrationStep >= step ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', 
                      borderRadius: '2px',
                      transition: 'all 0.3s ease'
                    }} 
                  />
                ))}
              </div>

              {/* Step 1: Chakra Focus */}
              {calibrationStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 style={{ fontSize: '1.6rem', fontFamily: 'Playfair Display', marginBottom: '1rem', color: '#fff' }}>
                    Where does your awareness rest today?
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                    Select the chakra center that feels most active or requires harmonization.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}>
                    {[
                      { id: 'root', name: 'Root Chakra', color: '#ff7675', symbol: '🔴' },
                      { id: 'sacral', name: 'Sacral Chakra', color: '#fdcb6e', symbol: '🟠' },
                      { id: 'solar', name: 'Solar Plexus', color: '#f1c40f', symbol: '🟡' },
                      { id: 'heart', name: 'Heart Chakra', color: '#2ecc71', symbol: '🟢' },
                      { id: 'throat', name: 'Throat Chakra', color: '#3498db', symbol: '🔵' },
                      { id: 'crown', name: 'Crown Chakra', color: '#9b59b6', symbol: '🟣' }
                    ].map(chakra => (
                      <button
                        key={chakra.id}
                        type="button"
                        onClick={() => setCalibRegistry(chakra.id)}
                        style={{
                          background: calibRegistry === chakra.id ? `${chakra.color}22` : 'rgba(255,255,255,0.02)',
                          border: calibRegistry === chakra.id ? `1px solid ${chakra.color}` : '1px solid rgba(255,255,255,0.05)',
                          padding: '1.2rem',
                          borderRadius: '16px',
                          color: calibRegistry === chakra.id ? chakra.color : 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{chakra.symbol}</span>
                        {chakra.name}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCalibrationStep(2)}
                    style={{ width: '100%', padding: '1rem' }}
                  >
                    CONTINUE PROTOCOL
                  </button>
                </motion.div>
              )}

              {/* Step 2: Energetic Flow */}
              {calibrationStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 style={{ fontSize: '1.6rem', fontFamily: 'Playfair Display', marginBottom: '1rem', color: '#fff' }}>
                    How is your current energetic flow?
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem', fontSize: '0.9rem' }}>
                    Rate your vibrational register from sluggish (1) to radiant and coherent (5).
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '4rem' }}>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setCalibFlow(rating)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transform: calibFlow === rating ? 'scale(1.2)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Star 
                          size={40}
                          fill={calibFlow >= rating ? 'var(--accent-gold)' : 'none'}
                          stroke={calibFlow >= rating ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)'}
                        />
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setCalibrationStep(1)}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '1rem' }}
                    >
                      BACK
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setCalibrationStep(3)}
                      style={{ flex: 2, padding: '1rem' }}
                    >
                      CONTINUE PROTOCOL
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Set Intention */}
              {calibrationStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 style={{ fontSize: '1.6rem', fontFamily: 'Playfair Display', marginBottom: '1rem', color: '#fff' }}>
                    State your focal intention
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                    Direct your spiritual energy toward a specific realignment outcome.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '3rem' }}>
                    {['Balance', 'Anxiety Relief', 'Creative Flow', 'Physical Vitality', 'Spiritual Clarity'].map(intention => (
                      <button
                        key={intention}
                        type="button"
                        onClick={() => setCalibIntention(intention)}
                        style={{
                          background: calibIntention === intention ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.02)',
                          border: calibIntention === intention ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.05)',
                          padding: '1.2rem 2rem',
                          borderRadius: '16px',
                          color: calibIntention === intention ? 'var(--accent-gold)' : 'rgba(255,255,255,0.6)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {intention.toUpperCase()}
                        {calibIntention === intention && <CheckCircle size={18} />}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setCalibrationStep(2)}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '1rem' }}
                    >
                      BACK
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingCalibration}
                      className="btn btn-primary"
                      onClick={handleSubmitCalibration}
                      style={{ flex: 2, padding: '1rem' }}
                    >
                      {isSubmittingCalibration ? 'TRANSMITTING...' : 'ALIGN BIOFIELD'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </>
);
};

export default UserDashboard;
