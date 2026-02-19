import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import AvatarRenderer from './AvatarRenderer';
import PetAvatarRenderer from './PetAvatarRenderer';
import {
  Activity, Calendar, CheckCircle, ChevronRight, Heart, Key, Send, Settings, Shield, Sparkles, Star, X, Zap,
  Compass, TrendingUp, Clock, Flame, Award, Sun, Moon, Cloud, Leaf, Flower, Droplets, Wind, Waves, Snowflake,
  Bird, Bug, Fish, Trees, Mountain, Sunrise, Sunset, Microscope, FlaskConical, Binary, Fingerprint, Focus, Ghost,
  Gift, GlassWater, GraduationCap, Headphones, Landmark, Languages, Layout, LifeBuoy, Anchor, Aperture, Battery, Mic,
  Camera, PawPrint, Upload, ThumbsUp, Trophy, RefreshCw, Archive
} from 'lucide-react';
import { getZodiacSign, getAdvancedHoroscope } from '../utils/horoscopes';
import { aiKnowledgeBase } from './aiKnowledgeBase';
import GoldButler from '../utils/goldButler';
import ActionButler from '../utils/actionButler';
import PaymentLedger from '../utils/paymentLedger';
import GoldBankAudit from '../utils/goldBankAudit';
const SymbolPractice = React.lazy(() => import('./SymbolPractice'));

const UserDashboard = ({ user, onClose, onUpdateUser, onNavigateToBooking, onNavigateToProtocols, onJoinLivePortal }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateConfirmPhrase, setDeactivateConfirmPhrase] = useState('');
  
  // Community & Feedback States
  const [stories, setStories] = useState(() => JSON.parse(localStorage.getItem('aura_stories') || '[]'));
  const [newStory, setNewStory] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  
  // Vibrational History
  const [vibrationalLogs, setVibrationalLogs] = useState(() => 
    JSON.parse(localStorage.getItem('vibrational_logs') || '[]')
  );
  
  // Settings States
  const [tempBirthDate, setTempBirthDate] = useState(user?.birthDate || '');
  const [isUpdatingAlignment, setIsUpdatingAlignment] = useState(false);

  const [isHandbookOpen, setIsHandbookOpen] = useState(false);
  const [currentIntention, setCurrentIntention] = useState(user?.currentIntention || 'Balance');
  const [waveNotes, setWaveNotes] = useState(() => JSON.parse(localStorage.getItem(`aura_wave_notes_${user?.email}`) || '{}'));
  const [activeNoteDay, setActiveNoteDay] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [vibeLevel, setVibeLevel] = useState(50);
  const [aiPrescription, setAiPrescription] = useState(null);
  const [isSyncingWearable, setIsSyncingWearable] = useState(false);

  // Avatar Customization
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [equippedAvatar, setEquippedAvatar] = useState(() =>
    JSON.parse(localStorage.getItem(`aura_equipped_${user?.email}`) || '{}')
  );
  const [avatarTitle, setAvatarTitle] = useState(() =>
    localStorage.getItem(`aura_avatar_title_${user?.email}`) || ''
  );
  const [avatarAura, setAvatarAura] = useState(() =>
    localStorage.getItem(`aura_avatar_aura_${user?.email}`) || ''
  );
  const [nameplateColor, setNameplateColor] = useState(() =>
    localStorage.getItem(`aura_nameplate_color_${user?.email}`) || ''
  );
  const [genderIdentity, setGenderIdentity] = useState(() =>
    localStorage.getItem(`aura_gender_${user?.email}`) || ''
  );


  // Account Number
  const [accountNumber] = useState(() => {
    const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    if (profile.accountNumber) return profile.accountNumber;
    const acct = `AUR-${String(10000 + Math.floor(Math.random() * 90000))}`;
    profile.accountNumber = acct;
    localStorage.setItem('user_profile', JSON.stringify(profile));
    return acct;
  });

  // ─── EXP & Level System ───
  const [exp, setExp] = useState(() => {
    const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    return profile.exp || 0;
  });
  const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100));
  const [level, setLevel] = useState(() => calculateLevel(exp));

  // ─── Rank Title System ───
  const getRankTitle = (lvl) => {
    if (lvl >= 150) return { title: 'Grandmaster', icon: '🌌', color: '#ff6b6b' };
    if (lvl >= 100) return { title: 'Master', icon: '👑', color: '#f39c12' };
    if (lvl >= 85) return { title: 'Transcended', icon: '🔱', color: '#a29bfe' };
    if (lvl >= 70) return { title: 'Ascended', icon: '🌟', color: '#fd79a8' };
    if (lvl >= 55) return { title: 'Sage', icon: '🧙', color: '#00cec9' };
    if (lvl >= 45) return { title: 'Elder', icon: '📜', color: '#fdcb6e' };
    if (lvl >= 35) return { title: 'Guardian', icon: '🛡️', color: '#00b894' };
    if (lvl >= 25) return { title: 'Channeler', icon: '⚡', color: '#e17055' };
    if (lvl >= 15) return { title: 'Adept', icon: '🔮', color: '#6c5ce7' };
    if (lvl >= 7) return { title: 'Seeker', icon: '🌀', color: '#0984e3' };
    if (lvl >= 3) return { title: 'Novice', icon: '🌱', color: '#55efc4' };
    return { title: 'Initiate', icon: '✨', color: 'rgba(255,255,255,0.5)' };
  };
  const currentRank = getRankTitle(level);
  const [checkinHistory, setCheckinHistory] = useState(() =>
    JSON.parse(localStorage.getItem(`aura_checkin_history_${user?.email}`) || '[]')
  );

  // Pet Portfolio (enhanced with level/exp/mood/accessories)
  const [pets, setPets] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(`aura_pets_${user?.email}`) || '[]');
    return saved.map(p => ({
      level: 1, exp: 0, mood: 'content', accessories: [],
      ...p
    }));
  });
  const [newPetName, setNewPetName] = useState('');
  const [newPetType, setNewPetType] = useState('dog');
  const [newPetNotes, setNewPetNotes] = useState('');
  const [showPetEquipModal, setShowPetEquipModal] = useState(null); // item awaiting pet selection

  // Engagement Likes
  const [storyLikes, setStoryLikes] = useState(() => JSON.parse(localStorage.getItem('aura_story_likes') || '{}'));
  const [myLikes, setMyLikes] = useState(() => JSON.parse(localStorage.getItem(`aura_my_likes_${user?.email}`) || '[]'));

  // Gold Economy
  const [goldBalance, setGoldBalance] = useState(() => {
    const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    return profile.gold || 0;
  });
  const [dailyCheckedIn, setDailyCheckedIn] = useState(() => {
    const lastCheckin = localStorage.getItem(`aura_checkin_${user?.email}`);
    return lastCheckin === new Date().toLocaleDateString();
  });
  const [checkinStreak, setCheckinStreak] = useState(() => {
    return parseInt(localStorage.getItem(`aura_streak_${user?.email}`) || '0');
  });
  const [showBuyGold, setShowBuyGold] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState(() =>
    JSON.parse(localStorage.getItem(`aura_purchased_${user?.email}`) || '[]')
  );
  const [healerGoldBank, setHealerGoldBank] = useState(() => {
    const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    return profile.healerGoldBank || 0;
  });
  const [droppedItems, setDroppedItems] = useState([]);
  const [mediaArchive, setMediaArchive] = useState(() =>
    JSON.parse(localStorage.getItem(`aura_media_archive_${user?.email}`) || '[]')
  );

  const saveToArchive = (mediaItem) => {
    const newItem = {
      ...mediaItem,
      id: mediaItem.id || `media_${Date.now()}`,
      savedAt: new Date().toISOString()
    };
    setMediaArchive(prev => {
      const updated = [newItem, ...prev];
      localStorage.setItem(`aura_media_archive_${user?.email}`, JSON.stringify(updated));
      return updated;
    });
    toast.success(`Saved to Sacred Archive: ${newItem.name || 'Media'}`, { icon: '📜' });
  };
  // Admin feature toggles (controlled from Admin Dashboard Settings)
  const featureToggles = JSON.parse(localStorage.getItem('aura_feature_toggles') || '{}');
  const goldSystemOn = featureToggles.goldSystemEnabled !== false;
  const dailyCheckinOn = featureToggles.dailyCheckinEnabled !== false;
  const painAnalysisOn = featureToggles.painAnalysisEnabled !== false;
  const goldStoreOn = featureToggles.goldStoreEnabled !== false;
  const buyGoldOn = featureToggles.buyGoldEnabled !== false;

  const logTransaction = (type, amount, balance, description) => {
    const txns = JSON.parse(localStorage.getItem(`aura_transactions_${user?.email}`) || '[]');
    txns.push({
      txnId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2,4).toUpperCase()}`,
      date: new Date().toISOString(),
      type,
      amount,
      balance,
      accountNumber,
      description
    });
    localStorage.setItem(`aura_transactions_${user?.email}`, JSON.stringify(txns));
  };

  const addGold = (amount, reason) => {
    const newBalance = goldBalance + amount;
    setGoldBalance(newBalance);
    const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    profile.gold = newBalance;
    localStorage.setItem('user_profile', JSON.stringify(profile));
    onUpdateUser({ ...user, gold: newBalance });
    logTransaction('earned', amount, newBalance, reason);
    toast.success(`+${amount} Gold — ${reason}`, { icon: '🪙' });
  };

  const spendGold = (amount, toHealerBank = false) => {
    if (goldBalance < amount) return false;
    const newBalance = goldBalance - amount;
    setGoldBalance(newBalance);
    
    const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    profile.gold = newBalance;
    
    if (toHealerBank) {
      const newBank = (profile.healerGoldBank || 0) + amount;
      profile.healerGoldBank = newBank;
      setHealerGoldBank(newBank);
      
      // Record in the tamper-proof Audit Ledger
      GoldBankAudit.recordAuditEntry({
        operation: 'DEPOSIT',
        amount,
        fromAccount: user?.email || 'ANONYMOUS',
        toAccount: 'HEALER_GOLD_BANK',
        reason: 'AI Avatar Generation/Upgrade Fee',
        authorizedBy: 'SYSTEM',
        metadata: { currentBalance: newBalance, bankBalance: newBank }
      });

      toast.success(`✨ ${amount} gold deposited to Healer Bank!`, { icon: '🏛️' });
    }

    localStorage.setItem('user_profile', JSON.stringify(profile));
    onUpdateUser({ ...user, gold: newBalance, healerGoldBank: profile.healerGoldBank });
    return newBalance;
  };

  // ─── EXP Functions ───
  // Daily XP cap: 5500 XP/day → Level 100 (Master) in ~6 months
  // Level 100 = 100² × 100 = 1,000,000 XP ÷ 180 days ≈ 5,556/day
  const DAILY_XP_CAP = 5500;
const getDailyXpKey = () => `aura_daily_xp_${user?.email}_${new Date().toISOString().slice(0, 10)}`;

const getDailyXpUsed = () => {
  return parseInt(localStorage.getItem(getDailyXpKey()) || '0');
};

const addExp = (amount, reason) => {
  // Enforce daily XP cap
  const dailyUsed = getDailyXpUsed();
  const remaining = Math.max(0, DAILY_XP_CAP - dailyUsed);
  if (remaining <= 0) {
    toast('Daily XP cap reached! Come back tomorrow.', { icon: '⏳', duration: 2000 });
    return;
  }
  const cappedAmount = Math.min(amount, remaining);
  // Track daily usage
  localStorage.setItem(getDailyXpKey(), String(dailyUsed + cappedAmount));

  const newExp = exp + cappedAmount;
  setExp(newExp);
  const newLevel = calculateLevel(newExp);
  const oldLevel = level;
  setLevel(newLevel);
  // Save to profile
  const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
  profile.exp = newExp;
  profile.level = newLevel;
  localStorage.setItem('user_profile', JSON.stringify(profile));
  // Level-up milestone bonuses
  if (newLevel > oldLevel) {
    const milestones = { 5: 100, 10: 250, 25: 500, 50: 1000 };
    const bonus = milestones[newLevel];
    if (bonus) {
      setTimeout(() => {
        addGold(bonus, `🏆 Level ${newLevel} Milestone Bonus!`);
        toast(`🎉 MILESTONE! Level ${newLevel} reached! +${bonus} Gold`, {
          duration: 5000,
          style: { background: 'linear-gradient(135deg, rgba(212,175,55,0.95), rgba(180,130,20,0.95))', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', border: '2px solid rgba(255,215,0,0.6)' }
        });
      }, 800);
    } else {
      toast(`⬆️ Level Up! You are now Level ${newLevel}`, { icon: '✨', duration: 3000 });
    }
  }
  // Notify if capped
  if (cappedAmount < amount) {
    toast(`XP capped for today (${DAILY_XP_CAP}/day). +${cappedAmount} XP applied.`, { icon: '⏳', duration: 3000 });
  }
  };

  const handleDailyCheckin = () => {
    if (dailyCheckedIn) return;
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem(`aura_checkin_${user.email}`);
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    const newStreak = lastDate === yesterday ? checkinStreak + 1 : 1;
    
    localStorage.setItem(`aura_checkin_${user.email}`, today);
    localStorage.setItem(`aura_streak_${user.email}`, newStreak.toString());
    setDailyCheckedIn(true);
    setCheckinStreak(newStreak);
    
    // Gold rewards: base 10 + streak bonus
    const streakBonus = Math.min(newStreak * 2, 50);
    const goldEarned = 10 + streakBonus;
    addGold(goldEarned, `Daily Ascension (${newStreak}-day streak)`);
    
    // EXP reward
    addExp(25, `Daily Check-In (Day ${newStreak})`);
    
    // Save to check-in history
    const history = [...checkinHistory, { date: today, streak: newStreak, gold: goldEarned, exp: 25 }];
    setCheckinHistory(history);
    localStorage.setItem(`aura_checkin_history_${user.email}`, JSON.stringify(history.slice(-90)));
    
    // Streak milestone bonuses
    const streakMilestones = { 7: 75, 14: 150, 30: 300, 60: 600, 100: 1000 };
    const milestoneBonus = streakMilestones[newStreak];
    if (milestoneBonus) {
      setTimeout(() => {
        addGold(milestoneBonus, `🔥 ${newStreak}-Day Streak Milestone!`);
        addExp(newStreak * 5, `Streak Milestone (${newStreak} days)`);
        toast(`🔥 ${newStreak}-DAY STREAK! +${milestoneBonus} Bonus Gold!`, {
          duration: 5000,
          style: { background: 'linear-gradient(135deg, rgba(231,76,60,0.95), rgba(192,57,43,0.95))', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', border: '2px solid rgba(255,100,80,0.5)' }
        });
      }, 1200);
    }
  };

  // ─── Symbol Practice Handler (EXP reward) ───
  const handleSymbolComplete = (result) => {
    if (result?.firstTime) {
      addExp(100, `Mastered ${result.symbolId} symbol`);
      addGold(25, 'Symbol First Mastery Bonus');
    } else {
      addExp(25, 'Symbol Practice');
      addGold(10, 'Symbol Practice');
    }
  };

  const equipAvatarItem = (item) => {
    const updated = { ...equippedAvatar, [item.avatarSlot]: item };
    setEquippedAvatar(updated);
    // Removed direct localStorage write to prevent race conditions with auto-save useEffect
  };

  const unequipAvatarSlot = (slot) => {
    const updated = { ...equippedAvatar };
    delete updated[slot];
    setEquippedAvatar(updated);
    // Removed direct localStorage write
  };

  const handlePurchaseItem = (item) => {
    if (purchasedItems.includes(item.id)) return toast('Already owned!', { icon: '✓' });
    const newBalance = spendGold(item.price);
    if (newBalance === false) return toast.error(`Not enough Gold. Need ${item.price}, have ${goldBalance}.`);
    const updated = [...purchasedItems, item.id];
    setPurchasedItems(updated);
    // Removed direct localStorage write — handled by useEffect
    // Log purchase transaction
    logTransaction('spent', item.price, newBalance, `Purchased: ${item.name}`);
    // Save full item data for archive access
    const archive = JSON.parse(localStorage.getItem(`aura_archive_${user.email}`) || '[]');
    archive.push({ ...item, purchasedAt: new Date().toISOString() });
    localStorage.setItem(`aura_archive_${user.email}`, JSON.stringify(archive));
    // EXP for purchasing
    addExp(10, `Purchased: ${item.name}`);
    // Auto-equip avatar items
    if (item.avatarSlot) {
      equipAvatarItem(item);
      toast.success(`Unlocked & equipped: ${item.name}!`, { icon: '🎉' });
    } else if (item.costumeSlots) {
      // Costume bundle - equip all items in the bundle
      for (const slot in item.costumeSlots) {
        equipAvatarItem({ ...item.costumeSlots[slot], avatarSlot: slot });
      }
      toast.success(`Unlocked & equipped: ${item.name} costume!`, { icon: '🎭' });
    } else if (item.petSlot) {
      // Pet item — show pet selection modal
      if (pets.length === 0) {
        toast('Add a companion first to equip pet accessories!', { icon: '🐾' });
      } else if (pets.length === 1) {
        equipPetAccessory(pets[0].id, item);
        toast.success(`${item.name} equipped on ${pets[0].name}!`, { icon: '🎀' });
      } else {
        setShowPetEquipModal(item);
      }
    } else {
      toast.success(`Unlocked: ${item.name}!`, { icon: '🎉' });
    }

    // NEW: Auto-add to AI Drop Box (AI tray) for generation
    if (item.avatarSlot || item.category === 'background' || item.category === 'action') {
      const newItem = {
        id: item.id,
        name: item.name,
        slot: item.avatarSlot || item.category,
        color: item.avatarStyle?.fill || '',
        icon: item.icon,
        avatarEmoji: item.avatarEmoji
      };
      setDroppedItems(prev => {
        if (prev.some(i => i.id === newItem.id)) return prev;
        return [...prev, newItem];
      });
      toast(`Synced ${item.name} with AI Generator Tray`, { icon: '🤖' });
    }
  };

  const [playingVideo, setPlayingVideo] = useState(null);

  // Today's Pain AI Analysis
  const [painInput, setPainInput] = useState('');
  const [painAnalysis, setPainAnalysis] = useState(null);
  const [isAnalyzingPain, setIsAnalyzingPain] = useState(false);

  const analyzePain = () => {
    if (!painInput.trim()) return;
    setIsAnalyzingPain(true);
    setPainAnalysis(null);
    // Simulate AI analysis delay
    setTimeout(() => {
      const input = painInput.toLowerCase();
      const analyses = [
        { keywords: ['head', 'migraine', 'temple', 'forehead'], area: 'Head / Crown', chakra: 'Crown Chakra (Sahasrara)', reikiTechnique: 'Place palms gently over the crown and temples for 5-10 minutes. Visualize violet light dissolving tension.', remedies: ['Peppermint oil applied to temples', 'Lavender tea before rest', 'Cold compress on forehead', 'Magnesium-rich foods (spinach, almonds)', 'Deep breathing in a dark, quiet room'] },
        { keywords: ['neck', 'throat', 'shoulder', 'tension'], area: 'Neck / Throat', chakra: 'Throat Chakra (Vishuddha)', reikiTechnique: 'Hover hands over the throat area. Channel blue healing light. Focus on releasing suppressed communication energy.', remedies: ['Warm salt water gargle', 'Chamomile tea with honey', 'Gentle neck stretches', 'Eucalyptus steam inhalation', 'Warm compress with lavender oil'] },
        { keywords: ['back', 'spine', 'lower back', 'lumbar', 'sciatica'], area: 'Back / Spine', chakra: 'Sacral Chakra (Svadhisthana)', reikiTechnique: 'Apply Reiki to the sacral area (lower back). Visualize warm orange energy flowing through the spine.', remedies: ['Turmeric golden milk (anti-inflammatory)', 'Epsom salt bath', 'Gentle yoga cat-cow stretches', 'Arnica gel on sore areas', 'Ginger compress on lower back'] },
        { keywords: ['stomach', 'digest', 'nausea', 'gut', 'abdomen', 'bloat'], area: 'Abdomen / Gut', chakra: 'Solar Plexus Chakra (Manipura)', reikiTechnique: 'Place both hands over the solar plexus (above navel). Channel warm yellow healing energy for 10 minutes.', remedies: ['Ginger or peppermint tea', 'Apple cider vinegar diluted in water', 'Fennel seed chewing', 'Probiotic-rich foods (yogurt, kimchi)', 'Warm water with lemon on empty stomach'] },
        { keywords: ['heart', 'chest', 'breath', 'anxiety', 'panic', 'stress'], area: 'Heart / Chest', chakra: 'Heart Chakra (Anahata)', reikiTechnique: 'Both hands over the heart center. Breathe deeply. Visualize green healing light expanding with each breath.', remedies: ['Box breathing (4-4-4-4 counts)', 'Ashwagandha tea for stress', 'Rose quartz placed over heart during rest', 'Lavender aromatherapy', 'Warm bath with Epsom salts and chamomile'] },
        { keywords: ['knee', 'joint', 'leg', 'hip', 'foot', 'ankle', 'walk'], area: 'Lower Body / Joints', chakra: 'Root Chakra (Muladhara)', reikiTechnique: 'Ground energy through the root chakra. Place hands on knees/joints. Visualize red stabilizing energy strengthening your foundation.', remedies: ['Turmeric paste compress', 'Gentle stretching and swimming', 'Apple cider vinegar wrap', 'Anti-inflammatory diet (omega-3 fish, berries)', 'Comfrey leaf poultice'] },
        { keywords: ['eye', 'vision', 'sinus', 'face'], area: 'Eyes / Third Eye', chakra: 'Third Eye Chakra (Ajna)', reikiTechnique: 'Gently cup palms over closed eyes. Channel indigo light through the third eye point for enhanced clarity and relief.', remedies: ['Cucumber slices over closed eyes', 'Bilberry or blueberry supplements', 'Warm compress for sinus relief', 'Saline nasal rinse', 'Eye exercises (20-20-20 rule)'] },
        { keywords: ['sleep', 'insomnia', 'tired', 'fatigue', 'exhaust', 'energy'], area: 'Whole Body / Vitality', chakra: 'All Chakras — Full Body Alignment', reikiTechnique: 'Full body scan Reiki. Start at the crown, move slowly to the feet. Spend extra time where you sense blockages. 20 minutes minimum.', remedies: ['Valerian root tea before bed', 'Magnesium glycinate supplement', 'No screens 1 hour before sleep', 'Lavender pillow spray', 'Grounding walk in nature (barefoot if possible)'] }
      ];
      
      let match = analyses.find(a => a.keywords.some(k => input.includes(k)));
      if (!match) {
        match = {
          area: 'General Wellness',
          chakra: 'Heart Chakra (Anahata) — Center of Healing',
          reikiTechnique: 'Full body self-Reiki: Place hands sequentially on crown, third eye, throat, heart, solar plexus, sacral, and root positions. Hold each for 3-5 minutes.',
          remedies: ['Anti-inflammatory turmeric golden milk', 'Deep breathing exercises (4-7-8 technique)', 'Warm Epsom salt bath with essential oils', 'Adequate hydration with lemon water', 'Gentle stretching or yoga']
        };
      }
      setPainAnalysis(match);
      setIsAnalyzingPain(false);
    }, 2000);
  };



  const handleAddPet = () => {
    if (!newPetName.trim()) return toast.error('Please name your companion.');
    // Resolve breed info if a premium breed was selected
    const storeItems = JSON.parse(localStorage.getItem('aura_shop_items') || '[]');
    const breedItem = storeItems.find(i => i.id === newPetType && i.petBreed);
    const pet = {
      id: Date.now().toString(),
      name: newPetName.trim(),
      type: breedItem ? breedItem.breedType : newPetType,
      breedName: breedItem ? breedItem.name : null,
      breedIcon: breedItem ? (breedItem.breedIcon || breedItem.icon) : null,
      breedId: breedItem ? breedItem.id : null,
      notes: newPetNotes.trim(),
      sessions: 0,
      level: 1,
      exp: 0,
      mood: 'happy',
      accessories: [],
      addedAt: new Date().toISOString()
    };
    const updated = [...pets, pet];
    setPets(updated);
    localStorage.setItem(`aura_pets_${user.email}`, JSON.stringify(updated));
    setNewPetName('');
    setNewPetNotes('');
    setNewPetType('dog');
    addExp(breedItem ? 25 : 15, `New companion: ${pet.name}${breedItem ? ` (${breedItem.name})` : ''}`);
    toast.success(`${pet.name}${breedItem ? ` the ${breedItem.name}` : ''} added to your Sanctuary! +${breedItem ? 25 : 15} EXP`, { icon: '🐾' });
  };

  const handleRemovePet = (petId) => {
    const updated = pets.filter(p => p.id !== petId);
    setPets(updated);
    localStorage.setItem(`aura_pets_${user.email}`, JSON.stringify(updated));
    toast.success('Companion released from the Sanctuary.');
  };

  // Pet care — gives pet EXP and improves mood
  const handlePetCare = (petId) => {
    const updated = pets.map(p => {
      if (p.id !== petId) return p;
      const newPetExp = (p.exp || 0) + 20;
      const petLevel = Math.floor(Math.sqrt(newPetExp / 50)) + 1;
      return {
        ...p,
        exp: newPetExp,
        level: petLevel,
        mood: 'happy',
        sessions: (p.sessions || 0) + 1,
        lastCared: new Date().toISOString()
      };
    });
    setPets(updated);
    localStorage.setItem(`aura_pets_${user.email}`, JSON.stringify(updated));
    addExp(15, 'Pet care session');
    toast.success('Healing session with your companion! +15 EXP', { icon: '💚' });
  };

  // Equip accessory to a specific pet
  const equipPetAccessory = (petId, item) => {
    const updated = pets.map(p => {
      if (p.id !== petId) return p;
      const accessories = [...(p.accessories || [])];
      if (!accessories.find(a => a.id === item.id)) {
        accessories.push({ id: item.id, name: item.name, emoji: item.petEmoji || item.icon });
      }
      return { ...p, accessories };
    });
    setPets(updated);
    localStorage.setItem(`aura_pets_${user.email}`, JSON.stringify(updated));
  };

  // Remove accessory from pet
  const unequipPetAccessory = (petId, itemId) => {
    const updated = pets.map(p => {
      if (p.id !== petId) return p;
      return { ...p, accessories: (p.accessories || []).filter(a => a.id !== itemId) };
    });
    setPets(updated);
    localStorage.setItem(`aura_pets_${user.email}`, JSON.stringify(updated));
    toast.success('Accessory removed.');
  };

  // Update avatar config


  // ─── Auto-Save System ───
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!user?.email) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const savedProfile = {
        ...profile,
        ...user,
        gold: goldBalance,
        exp,
        level,
        accountNumber,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('user_profile', JSON.stringify(savedProfile));
      localStorage.setItem(`aura_pets_${user.email}`, JSON.stringify(pets));
      localStorage.setItem(`aura_equipped_${user.email}`, JSON.stringify(equippedAvatar));
      localStorage.setItem(`aura_purchased_${user.email}`, JSON.stringify(purchasedItems));
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [goldBalance, exp, pets, equippedAvatar, purchasedItems]);

  const handleLikeStory = (storyId) => {
    if (myLikes.includes(storyId)) return toast('You already resonated with this story.', { icon: '💛' });
    const updatedLikes = { ...storyLikes, [storyId]: (storyLikes[storyId] || 0) + 1 };
    const updatedMyLikes = [...myLikes, storyId];
    setStoryLikes(updatedLikes);
    setMyLikes(updatedMyLikes);
    localStorage.setItem('aura_story_likes', JSON.stringify(updatedLikes));
    localStorage.setItem(`aura_my_likes_${user.email}`, JSON.stringify(updatedMyLikes));

    // Award RP to the story author
    const story = stories.find(s => s.id === storyId);
    if (story) {
      const rpBonus = Math.min(updatedLikes[storyId] || 1, 10);
      const newRP = (user.resonancePoints || 0) + rpBonus;
      onUpdateUser({ ...user, resonancePoints: newRP });
      toast.success(`+${rpBonus} RP from community resonance!`);
    }
  };

  // ─── Seed Master Catalog (Starters + Premium + Costumes) ───
  useEffect(() => {
    const MASTER_CATALOG = [
      // --- FREE STARTERS (Reliable Basics) ---
      { id: 'free_tshirt', name: 'Basic T-Shirt', icon: '👕', desc: 'A simple, comfortable tee.', price: 0, category: 'clothing', avatarSlot: 'chest', src: '/assets/amethyst_aura_realistic_1769877822836.png', avatarStyle: { fill: '#5b7fa5' }, enabled: true },
      { id: 'free_jeans',  name: 'Basic Jeans',   icon: '👖', desc: 'Simple blue jeans.', price: 0, category: 'clothing', avatarSlot: 'legs', src: '/assets/sage_protocol_dewy_sage_png_1770425158983.png', avatarStyle: { fill: '#3b5a85' }, enabled: true },
      { id: 'free_sandals',name: 'Handmade Sandals',icon: '👡', desc: 'Lightweight and natural.', price: 0, category: 'clothing', avatarSlot: 'feet', avatarStyle: { fill: '#8b5a2b' }, enabled: true },
      { id: 'free_amulet', name: 'Quartz Amulet', icon: '💎', desc: 'A small protective charm.', price: 0, category: 'jewelry', avatarSlot: 'neck', src: '/assets/quartz_macro_realistic_1769877835658.png', enabled: true },
      { id: 'free_bg_temple', name: 'Ether Temple', icon: '🏛️', desc: 'A peaceful meditation space.', price: 0, category: 'background', avatarSlot: 'background', src: '/assets/modern_healing_sanctuary_1769837644180.png', avatarStyle: { background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%)' }, enabled: true },

      // --- PREMIUM MYSTICAL WEARABLES (High Fidelity) ---
      { id: 'amethyst_robe', name: 'Amethyst Robe', icon: '🧙', desc: 'A robe woven from violet light.', price: 500, category: 'clothing', avatarSlot: 'chest', src: '/assets/amethyst_aura_realistic_1769877822836.png', rarity: 'rare', enabled: true },
      { id: 'sage_cloak', name: 'Sage Forest Cloak', icon: '🧥', desc: 'Infused with the scent of pine and peace.', price: 750, category: 'clothing', avatarSlot: 'chest', src: '/assets/sage_forest_smoke_1770425059439.png', rarity: 'rare', enabled: true },
      { id: 'healer_robe_gold', name: 'Golden Healer Regalia', icon: '✨', desc: 'The highest frequency garment available.', price: 1500, category: 'clothing', avatarSlot: 'chest', src: '/assets/rose_aura_realistic_1769877874595.png', rarity: 'epic', enabled: true },

      // --- SACRED ARTIFACTS (AI TRiggers) ---
      { id: 'crystal_staff', name: 'Resonance Staff', icon: '🪄', desc: 'Focuses healing energy.', price: 1200, category: 'jewelry', avatarSlot: 'hand_right', src: '/assets/reiki_crown_chakra_light_1770423834100.png', rarity: 'epic', enabled: true },
      { id: 'sacred_orb', name: 'Amethyst Core Orb', icon: '🔮', desc: 'A floating orb of pure resonance.', price: 1000, category: 'jewelry', avatarSlot: 'accessory', src: '/assets/amethyst_core_purge_macro_1769852056191.png', rarity: 'rare', enabled: true },

      // --- DIVINE ENVIRONMENTS ---
      { id: 'bg_crystal_cave', name: 'Crystal Sanctuary', icon: '💎', desc: 'Deep within a glowing cavern.', price: 300, category: 'background', avatarSlot: 'background', src: '/assets/sage_protocol_crystal_cave_1770441218348.png', enabled: true },
      { id: 'bg_ethereal_forest', name: 'Ethereal Forest', icon: '🌲', desc: 'A path through the spirit woods.', price: 300, category: 'background', avatarSlot: 'background', src: '/assets/forest_natural_path_intelligence_1770423845946.png', enabled: true },
      { id: 'bg_starry_night', name: 'Starry Night', icon: '🌌', desc: 'A vast cosmic night sky.', price: 200, category: 'background', avatarSlot: 'background', enabled: true },
      { id: 'bg_sacred_temple', name: 'Sacred Temple', icon: '🏛️', desc: 'An ancient spiritual temple.', price: 250, category: 'background', avatarSlot: 'background', enabled: true },

      // --- ACTIONS & EXPRESSIONS ---
      { id: 'act_praying', name: 'Sacred Prayer', icon: '🙏', desc: 'Action: A peaceful praying pose.', price: 150, category: 'action', avatarSlot: 'action', enabled: true },
      { id: 'act_channeling', name: 'Aura Channeling', icon: '⚡', desc: 'Action: Channeling pure light.', price: 200, category: 'action', avatarSlot: 'action', enabled: true },
      { id: 'exp_compassion', name: 'Compassion', icon: '💖', desc: 'Expression: Heart-centered love.', price: 100, category: 'expression', avatarSlot: 'expression', enabled: true },
      { id: 'exp_joyful', name: 'Pure Joy', icon: '😊', desc: 'Expression: Radiant joyful energy.', price: 100, category: 'expression', avatarSlot: 'expression', enabled: true },

      // --- BRANDED / OFFICIAL ITEMS ---
      { id: 'official_tee_rs', name: 'Ricky & Sage Official Tee', icon: '👕', desc: 'Premium branded apparel with resonance logo.', price: 50, category: 'clothing', avatarSlot: 'chest', src: '/assets/amethyst_aura_realistic_1769877822836.png', enabled: true },
      { id: 'zen_garden_rs', name: 'Zen Garden Sanctuary', icon: '🎋', desc: 'Official Ricky & Sage meditation background.', price: 100, category: 'background', avatarSlot: 'background', src: '/assets/forest_natural_path_standard_1770423851088.png', enabled: true },


      // --- HEADGEAR ---
      { id: 'sacred_diadem', name: 'Sacred Diadem', icon: '👑', desc: 'A crown of light.', price: 400, category: 'clothing', avatarSlot: 'head', src: '/assets/reiki_crown_chakra_light_1770423834100.png', rarity: 'rare', enabled: true },
      { id: 'ethereal_circlet', name: 'Ethereal Circlet', icon: '💍', desc: 'Focuses mental clarity.', price: 350, category: 'clothing', avatarSlot: 'head', rarity: 'rare', enabled: true },
      
      // --- SHOES ---
      { id: 'astral_sandals', name: 'Astral Sandals', icon: '👡', desc: 'Walk on stardust.', price: 200, category: 'clothing', avatarSlot: 'feet', rarity: 'common', enabled: true },
      { id: 'divine_boots', name: 'Divine Boots', icon: '👢', desc: 'Grounded in holiness.', price: 450, category: 'clothing', avatarSlot: 'feet', rarity: 'rare', enabled: true },

      // --- HAIRSTYLES ---
      { id: 'hair_flowing_light', name: 'Flowing Light', icon: '💇', desc: 'Energy hair.', price: 600, category: 'hair', avatarSlot: 'hair', rarity: 'rare', enabled: true },
      { id: 'hair_braids_wisdom', name: 'Braids of Wisdom', icon: '👱', desc: 'Ancient style.', price: 400, category: 'hair', avatarSlot: 'hair', rarity: 'common', enabled: true },

      // --- ABILITIES & EFFECTS ---
      { id: 'abi_chrono_vision', name: 'Chrono-Vision', icon: '👁️', desc: 'See through time.', price: 2000, category: 'ability', avatarSlot: 'ability', rarity: 'epic', enabled: true },
      { id: 'abi_aura_blast', name: 'Aura Blast', icon: '💥', desc: 'Release pure energy.', price: 1500, category: 'ability', avatarSlot: 'ability', rarity: 'epic', enabled: true },
    ];

    const AVATAR_SERVER_URL = 'http://127.0.0.1:3100'; // Using 127.0.0.1 for better cross-platform compatibility
    const CATALOG_VERSION = 6; // Incremented for expansion
    const storedVersion = parseInt(localStorage.getItem('aura_catalog_version') || '0');
    const existing = JSON.parse(localStorage.getItem('aura_shop_items') || '[]');

    if (storedVersion < CATALOG_VERSION || !existing.length) {
      console.log('Rebuilding Gold Store Catalog...');
      localStorage.setItem('aura_shop_items', JSON.stringify(MASTER_CATALOG));
      localStorage.setItem('aura_catalog_version', CATALOG_VERSION.toString());
      // Optional: don't wipe custom items if any existed, but here we want a fresh start per request
    }
  }, []);

  const availableIcons = [
    { name: 'Heart', Component: Heart, color: '#ff7675' },
    { name: 'Sparkles', Component: Sparkles, color: 'var(--accent-gold)' },
    { name: 'Zap', Component: Zap, color: '#f1c40f' },
    { name: 'Activity', Component: Activity, color: '#e74c3c' },
    { name: 'Shield', Component: Shield, color: '#3498db' },
    { name: 'Compass', Component: Compass, color: '#e67e22' },
    { name: 'Sun', Component: Sun, color: '#fbc531' },
    { name: 'Moon', Component: Moon, color: '#f5f6fa' },
    { name: 'Cloud', Component: Cloud, color: '#dcdde1' },
    { name: 'Leaf', Component: Leaf, color: '#44bd32' },
    { name: 'Flower', Component: Flower, color: '#e84393' },
    { name: 'Droplets', Component: Droplets, color: '#00a8ff' },
    { name: 'Wind', Component: Wind, color: '#9c88ff' },
    { name: 'Waves', Component: Waves, color: '#487eb0' },
    { name: 'Snowflake', Component: Snowflake, color: '#00d2d3' },
    { name: 'Bird', Component: Bird, color: '#9c88ff' },
    { name: 'Bug', Component: Bug, color: '#4cd137' },
    { name: 'Fish', Component: Fish, color: '#40739e' },
    { name: 'Trees', Component: Trees, color: '#2f3640' },
    { name: 'Mountain', Component: Mountain, color: '#718093' },
    { name: 'Sunrise', Component: Sunrise, color: '#e1b12c' },
    { name: 'Sunset', Component: Sunset, color: '#e84118' },
    { name: 'Microscope', Component: Microscope, color: '#8c7ae6' },
    { name: 'FlaskConical', Component: FlaskConical, color: '#c23616' },
    { name: 'Binary', Component: Binary, color: '#44bd32' },
    { name: 'Fingerprint', Component: Fingerprint, color: '#0097e6' },
    { name: 'Focus', Component: Focus, color: '#273c75' },
    { name: 'Ghost', Component: Ghost, color: '#f5f6fa' },
    { name: 'Gift', Component: Gift, color: '#e84118' },
    { name: 'GlassWater', Component: GlassWater, color: '#00a8ff' },
    { name: 'GraduationCap', Component: GraduationCap, color: '#8c7ae6' },
    { name: 'Headphones', Component: Headphones, color: '#2f3640' },
    { name: 'Landmark', Component: Landmark, color: '#dcdde1' },
    { name: 'Languages', Component: Languages, color: '#9c88ff' },
    { name: 'Layout', Component: Layout, color: '#38ada9' },
    { name: 'LifeBuoy', Component: LifeBuoy, color: '#eb4d4b' },
    { name: 'Anchor', Component: Anchor, color: '#718093' },
    { name: 'Aperture', Component: Aperture, color: '#f0932b' },
    { name: 'Battery', Component: Battery, color: '#6ab04c' },
    { name: 'Award', Component: Award, color: '#f9ca24' },
    { name: 'Flame', Component: Flame, color: '#eb4d4b' },
    { name: 'Star', Component: Star, color: '#ffbe76' }
  ];
  
  useEffect(() => {
    if (user?.birthDate) setTempBirthDate(user.birthDate);
  }, [user?.birthDate]);

  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('aura_user_prefs');
    return saved ? JSON.parse(saved) : {
      notifications: true,
      highFidelity: true,
      darkMode: true,
      isSafeMode: true
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

  const handleVibeCheck = () => {
    // Determine recommendation based on vibe level
    let rec = "";
    if (vibeLevel < 30) {
      rec = aiKnowledgeBase.faq.stress;
    } else if (vibeLevel < 60) {
      rec = aiKnowledgeBase.faq.grounding;
    } else if (vibeLevel < 85) {
      rec = aiKnowledgeBase.faq.brain;
    } else {
      rec = "Your resonance is peak. Broadcast this light to the field. Recommend: Frequency Amplification.";
    }

    setAiPrescription({
      text: rec,
      affirmation: aiKnowledgeBase.vibrational_tips[Math.floor(Math.random() * aiKnowledgeBase.vibrational_tips.length)]
    });
    toast.success("Aura AI has analyzed your field.");
  };

  const handleSyncWearable = () => {
    setIsSyncingWearable(true);
    setTimeout(() => {
      const mockHRV = Math.floor(Math.random() * 40 + 40); // 40-80ms
      setVibeLevel(mockHRV > 60 ? 80 : 40);
      setIsSyncingWearable(false);
      toast.success(`Sync complete. HRV detected: ${mockHRV}ms. Baseline recalibrated.`);
    }, 2000);
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

  // Mastery Path Calculations
  const resonancePoints = user?.resonancePoints || (user?.sessions || 0) * 150 + (user?.streak || 0) * 50;
  const masteryLevel = Math.floor(Math.sqrt(resonancePoints / 100)) + 1;
  const pointsToNextLevel = Math.pow(masteryLevel, 2) * 100;
  const pointsForCurrentLevel = Math.pow(masteryLevel - 1, 2) * 100;
  const progress = ((resonancePoints - pointsForCurrentLevel) / (pointsToNextLevel - pointsForCurrentLevel)) * 100;
  const isHealingTier = user?.subscription === 'healing' || user?.subscription === '3_month' || user?.subscription === '6_month' || user?.subscription === '12_month';

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
    }, 2000);
  };

  const handleSubmitStory = (e) => {
    e.preventDefault();
    if (!newStory.trim()) return toast.error("Please share a reflection before submitting.");
    
    setIsSubmittingStory(true);
    setTimeout(() => {
      const storyEntry = {
        id: Date.now().toString(),
        userName: user.name,
        userEmail: user.email,
        story: newStory,
        rating: newRating,
        status: 'pending',
        audioUrl: null, // Future integration hook for voice recordings
        timestamp: new Date().toISOString()
      };
      
      const updatedStories = [...JSON.parse(localStorage.getItem('aura_stories') || '[]'), storyEntry];
      setStories(updatedStories);
      localStorage.setItem('aura_stories', JSON.stringify(updatedStories));
      
      setNewStory('');
      setNewRating(5);
      setIsSubmittingStory(false);
      toast.success("Reflection sent to the Archive for resonance check.");
    }, 1500);
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
            {['Overview', 'My Avatar', 'Sacred Archive', 'Mastery', ...(goldSystemOn && goldStoreOn ? ['Gold Store'] : []), 'Pets', 'Vibrational Log', 'Schedule', ...(user?.subscription === 'healing' ? ['Community'] : []), 'My Reflections', 'Settings'].map(tab => (
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
            <div style={{
              width: '200px',
              height: '200px',
              borderRadius: '24px',
              margin: '0 auto 0.5rem',
              padding: '0',
              position: 'relative',
              overflow: 'hidden',
              ...(equippedAvatar.frame?.avatarStyle || {
                border: '2px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)'
              })
            }}>
                <AvatarRenderer equippedAvatar={equippedAvatar} compact userIdentity={genderIdentity} saveToArchive={saveToArchive} isSafeMode={prefs.isSafeMode} purchasedItems={purchasedItems} />
              </div>

              {/* ── Match My Pet — Companion Window ── */}
              {pets.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ fontSize: '0.5rem', color: 'rgba(212,175,55,0.5)', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase' }}>🐾 MY COMPANION</div>
                  <PetAvatarRenderer 
                    pet={pets[0]} 
                    ownerBg={equippedAvatar?.background} 
                    compact 
                    userEmail={user?.email} 
                    goldBalance={goldBalance}
                    spendGold={spendGold}
                  />
                  {pets.length > 1 && (
                    <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.2)' }}>+{pets.length - 1} more companion{pets.length > 2 ? 's' : ''}</div>
                  )}
                </div>
              )}
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.3rem 0' }}>{user.name}</h3>
            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--accent-gold)', marginBottom: '0.4rem', opacity: 0.7 }}>{accountNumber}</div>
            <span style={{ 
              fontSize: '0.75rem', 
              color: resonance?.color || 'var(--accent-gold)', 
              fontWeight: 'bold',
              background: `${resonance?.color || 'var(--accent-gold)'}22`,
              padding: '4px 12px',
              borderRadius: '20px',
              border: `1px solid ${resonance?.color || 'var(--accent-gold)'}44`
            }}>
              {user.subscription.toUpperCase()} MEMBER • Lvl {masteryLevel}
            </span>

            {/* ─── EXP / Level Progress Bar ─── */}
            <div style={{ marginTop: '1rem', width: '100%', maxWidth: '220px', margin: '1rem auto 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                  {currentRank.icon} Level {level} — {currentRank.title}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                  {exp} / {Math.pow(level + 1, 2) * 100} XP
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((exp / (Math.pow(level + 1, 2) * 100)) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: '3px',
                    background: level >= 25 ? 'linear-gradient(90deg, #f39c12, #e74c3c)' : level >= 10 ? 'linear-gradient(90deg, #9b59b6, #e74c3c)' : 'linear-gradient(90deg, var(--accent-gold), var(--accent-ethereal))',
                    boxShadow: '0 0 8px rgba(212,175,55,0.4)'
                  }}
                />
              </div>
              {level >= 5 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px', justifyContent: 'center' }}>
                  {[5, 10, 25, 50].filter(m => level >= m).map(m => (
                    <span key={m} style={{ fontSize: '0.55rem', background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)', padding: '1px 6px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }}>
                      Lvl {m} ✓
                    </span>
                  ))}
                </div>
              )}
            </div>
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

            {/* Mastery Path Card */}
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--accent-gold)33', background: 'rgba(212, 175, 55, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>Mastery Path</span>
                <Star size={16} color="var(--accent-gold)" />
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Level {masteryLevel} <span style={{fontSize: '0.7rem', color: currentRank.color, fontWeight: '600'}}>{currentRank.icon} {currentRank.title}</span></div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', margin: '0.75rem 0', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  style={{ height: '100%', background: 'var(--accent-gold)', borderRadius: '3px', boxShadow: '0 0 10px var(--accent-gold)66' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                <span>{resonancePoints} RP</span>
                <span>Next: {pointsToNextLevel} RP</span>
              </div>
            </div>

            {/* Milestone Badges */}
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Badges</span>
                <Award size={16} color="var(--accent-gold)" />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(() => {
                  const sessions = user.sessions || 0;
                  const streak = user.streak || 0;
                  const longestStreak = user.longestStreak || 0;
                  const goldBalance = user.gold || 0;
                  const archive = JSON.parse(localStorage.getItem(`aura_archive_${user?.email}`) || '[]');
                  const itemsOwned = archive.length;
                  const avatarSlotsUsed = Object.keys(equippedAvatar).filter(k => equippedAvatar[k]).length;
                  const checkins = checkinHistory.length;
                  const reikiTaps = parseInt(localStorage.getItem(`aura_reiki_taps_${user?.email}`) || '0');

                  const allBadges = [
                    // Session milestones
                    { label: 'First Light', desc: 'Complete 1 session', icon: '✨', earned: sessions >= 1 },
                    { label: 'Seeker', desc: 'Complete 3 sessions', icon: '🔮', earned: sessions >= 3 },
                    { label: 'Dedicated', desc: 'Complete 10 sessions', icon: '📿', earned: sessions >= 10 },
                    { label: 'Devoted', desc: 'Complete 25 sessions', icon: '🕯️', earned: sessions >= 25 },
                    { label: 'Enlightened', desc: '50 sessions', icon: '☀️', earned: sessions >= 50 },
                    // Streak milestones
                    { label: 'Flame Starter', desc: '3-day streak', icon: '🔥', earned: longestStreak >= 3 },
                    { label: 'Consistent', desc: '7-day streak', icon: '🎯', earned: longestStreak >= 7 },
                    { label: 'Unbreakable', desc: '14-day streak', icon: '⛓️', earned: longestStreak >= 14 },
                    { label: 'Eternal Flame', desc: '30-day streak', icon: '🌋', earned: longestStreak >= 30 },
                    // Gold milestones
                    { label: 'First Coin', desc: 'Earn 10 Gold', icon: '🪙', earned: goldBalance >= 10 },
                    { label: 'Investor', desc: 'Accumulate 500 Gold', icon: '💰', earned: goldBalance >= 500 },
                    { label: 'Treasure Hoard', desc: '2000 Gold', icon: '🏆', earned: goldBalance >= 2000 },
                    // Item collection
                    { label: 'Collector', desc: 'Own 5 items', icon: '🎁', earned: itemsOwned >= 5 },
                    { label: 'Hoarder', desc: 'Own 15 items', icon: '🗄️', earned: itemsOwned >= 15 },
                    { label: 'Curator', desc: 'Own 30 items', icon: '🏛️', earned: itemsOwned >= 30 },
                    // Avatar completionist
                    { label: 'Styled Up', desc: 'Equip 3 avatar slots', icon: '👗', earned: avatarSlotsUsed >= 3 },
                    { label: 'Fashionista', desc: 'Equip 8 avatar slots', icon: '💎', earned: avatarSlotsUsed >= 8 },
                    { label: 'Full Drip', desc: 'All 13 slots equipped', icon: '👑', earned: avatarSlotsUsed >= 13 },
                    // Check-in badges
                    { label: 'Regular', desc: '7 daily check-ins', icon: '📅', earned: checkins >= 7 },
                    { label: 'Habitual', desc: '30 check-ins', icon: '📆', earned: checkins >= 30 },
                    // Level badges
                    { label: 'Adept', desc: 'Reach Level 15', icon: '⚡', earned: level >= 15 },
                    { label: 'Guardian', desc: 'Reach Level 35', icon: '🛡️', earned: level >= 35 },
                    { label: 'Master', desc: 'Reach Level 100', icon: '👑', earned: level >= 100 },
                    { label: 'Grandmaster', desc: 'Reach Level 150', icon: '🌌', earned: level >= 150 },
                    // Distance Reiki
                    { label: 'Healer Touch', desc: '50 reiki taps', icon: '🌊', earned: reikiTaps >= 50 },
                  ];

                  return allBadges.map(badge => (
                    <div key={badge.label} title={`${badge.label} — ${badge.desc}`} style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem',
                      background: badge.earned ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${badge.earned ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}`,
                      opacity: badge.earned ? 1 : 0.3,
                      cursor: 'default', transition: 'all 0.3s',
                      position: 'relative'
                    }}>
                      {badge.icon}
                      {badge.earned && <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', fontSize: '0.5rem', background: '#2ecc71', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700' }}>✓</div>}
                    </div>
                  ));
                })()}
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

                {/* I Ascend Daily Check-In + Gold Balance */}
                {goldSystemOn && dailyCheckinOn && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                  <motion.div
                    className="glass"
                    whileHover={{ scale: 1.01 }}
                    style={{
                      padding: '1.5rem 2rem',
                      borderRadius: '20px',
                      background: dailyCheckedIn ? 'rgba(46,204,113,0.08)' : 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.03))',
                      border: `1px solid ${dailyCheckedIn ? 'rgba(46,204,113,0.25)' : 'rgba(212,175,55,0.25)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: dailyCheckedIn ? 'default' : 'pointer'
                    }}
                    onClick={handleDailyCheckin}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: dailyCheckedIn ? 'rgba(46,204,113,0.2)' : 'rgba(212,175,55,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                      }}>
                        {dailyCheckedIn ? '✅' : '🌅'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: dailyCheckedIn ? '#2ecc71' : 'var(--accent-gold)' }}>
                          {dailyCheckedIn ? 'Ascended Today!' : 'I Ascend ✦ Daily Check-In'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                          {dailyCheckedIn ? `${checkinStreak}-day streak • Come back tomorrow!` : `Tap to earn Gold • ${checkinStreak > 0 ? `${checkinStreak}-day streak` : 'Start your streak!'}`}
                        </div>
                      </div>
                    </div>
                    {!dailyCheckedIn && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.1)' }}
                      >
                        🪙 +10 Gold
                      </motion.div>
                    )}
                  </motion.div>

                  <div className="glass" style={{
                    padding: '1.5rem 2rem', borderRadius: '20px',
                    background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'rgba(212,175,55,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                      }}>🪙</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1.4rem', color: 'var(--accent-gold)' }}>🪙 {goldBalance}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>SANCTUARY GOLD</div>
                      </div>
                    </div>

                    {/* NEW: Healer Gold Bank Display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '10px 15px', borderRadius: '14px', background: 'rgba(155,89,182,0.1)', border: '1px solid rgba(155,89,182,0.2)' }}>
                      <div style={{ fontSize: '1.2rem' }}>🏛️</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: '#9b59b6' }}>🪙 {healerGoldBank}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>HEALER GOLD BANK</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('gold store')}
                        style={{
                          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                          color: 'var(--accent-gold)', padding: '6px 14px', borderRadius: '16px',
                          fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
                        }}
                      >Shop</motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowBuyGold(true)}
                        style={{
                          background: 'linear-gradient(135deg, var(--accent-gold), #e67e22)', border: 'none',
                          color: '#000', padding: '6px 14px', borderRadius: '16px',
                          fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
                        }}
                      >Buy Gold</motion.button>
                    </div>
                  </div>
                </div>
                )}

                {/* Today's Pain — AI Analysis Bubble */}
                {painAnalysisOn && (
                <div className="glass" style={{
                  padding: '2rem', borderRadius: '24px', marginBottom: '3rem',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'rgba(231,112,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                    }}>💆</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#e7816c' }}>Today's Pain</h4>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Describe how you feel — AI will suggest Reiki relief & natural remedies</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: painAnalysis ? '1.5rem' : 0 }}>
                    <input
                      type="text"
                      value={painInput}
                      onChange={e => setPainInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && analyzePain()}
                      placeholder="e.g. headache, lower back pain, anxiety, fatigue..."
                      style={{
                        flex: 1, padding: '0.8rem 1.2rem', borderRadius: '16px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={analyzePain}
                      disabled={isAnalyzingPain || !painInput.trim()}
                      style={{
                        padding: '0.8rem 1.5rem', borderRadius: '16px',
                        background: isAnalyzingPain ? 'rgba(255,255,255,0.05)' : 'rgba(231,112,76,0.15)',
                        border: '1px solid rgba(231,112,76,0.3)',
                        color: '#e7816c', fontSize: '0.85rem', fontWeight: '600',
                        cursor: isAnalyzingPain ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      {isAnalyzingPain ? <><RefreshCw size={14} className="animate-spin" /> Analyzing...</> : <><Sparkles size={14} /> Analyze</>}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {painAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                          {/* Reiki Recommendation */}
                          <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>🔮</span>
                              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>Reiki Relief</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem', letterSpacing: '1px' }}>AFFECTED AREA</div>
                            <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#fff' }}>{painAnalysis.area}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem', letterSpacing: '1px' }}>FOCUS CHAKRA</div>
                            <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>{painAnalysis.chakra}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem', letterSpacing: '1px' }}>TECHNIQUE</div>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>{painAnalysis.reikiTechnique}</p>
                          </div>

                          {/* Natural Remedies */}
                          <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(46,204,113,0.05)', border: '1px solid rgba(46,204,113,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>🌿</span>
                              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#2ecc71' }}>Natural Home Remedies</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              {painAnalysis.remedies.map((remedy, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <span style={{ color: '#2ecc71', fontSize: '0.7rem', marginTop: '3px' }}>●</span>
                                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{remedy}</span>
                                </div>
                              ))}
                            </div>
                            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '1rem', fontStyle: 'italic' }}>
                              These are wellness suggestions only. Always consult a healthcare provider for medical concerns.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                )}

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

                {/* Phase 5: Daily Vibe Check */}
                 <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', margin: 0 }}>
                        DAILY ENERGY CHECK-IN
                      </h4>
                      <button 
                        onClick={handleSyncWearable}
                        disabled={isSyncingWearable}
                        style={{
                          background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', padding: '4px 10px',
                          borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                        }}
                      >
                        <Battery size={12} className={isSyncingWearable ? 'animate-pulse' : ''} />
                        {isSyncingWearable ? 'SYNCING...' : 'SYNC WEARABLE (HRV)'}
                      </button>
                    </div>

                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                         <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>How does your field feel today?</span>
                         <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{vibeLevel}%</span>
                      </div>
                      
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={vibeLevel} 
                        onChange={(e) => setVibeLevel(e.target.value)}
                        style={{
                          width: '100%',
                          height: '6px',
                          background: `linear-gradient(90deg, #ff7675 0%, var(--accent-gold) 50%, #00b894 100%)`,
                          borderRadius: '3px',
                          appearance: 'none',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}>
                        <span>DEPLETED</span>
                        <span>RADIANT</span>
                      </div>

                      <button 
                        onClick={handleVibeCheck}
                        className="btn"
                        style={{ marginTop: '2rem', width: '100%', background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold' }}
                      >
                        ANALYZE RESONANCE
                      </button>

                      <AnimatePresence>
                        {aiPrescription && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            style={{ overflow: 'hidden', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}
                          >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                               <div className="p-3 rounded-xl bg-gold/10" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)' }}>
                                 <Compass size={24} />
                               </div>
                               <div>
                                 <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '1px' }}>AURA'S PRESCRIPTION</div>
                                 <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1rem' }}>{aiPrescription.text}</p>
                                 <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid var(--accent-gold)' }}>
                                    <h5 style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>DAILY AFFIRMATION</h5>
                                    <p style={{ fontStyle: 'italic', color: 'white' }}>"{aiPrescription.affirmation}"</p>
                                 </div>
                               </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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

            {activeTab === 'gold store' && (
              <motion.div
                key="gold-store"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>Gold Store</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Spend your Sanctuary Gold on exclusive content and rewards.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>🪙 {goldBalance}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>YOUR BALANCE</div>
                    </div>
                    {buyGoldOn && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowBuyGold(true)}
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-gold), #e67e22)', border: 'none',
                        color: '#000', padding: '10px 20px', borderRadius: '20px',
                        fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer'
                      }}
                    >+ Buy More Gold</motion.button>
                    )}
                  </div>
                </div>

                {/* Store Categories */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                  {(JSON.parse(localStorage.getItem('aura_shop_items') || '[]')).filter(item => item.enabled !== false).map(item => {
                    const owned = purchasedItems.includes(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -4 }}
                        className="glass"
                        style={{
                          padding: '1.5rem',
                          borderRadius: '20px',
                          background: owned ? 'rgba(46,204,113,0.05)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${owned ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.05)'}`,
                          display: 'flex', flexDirection: 'column', gap: '1rem',
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                          <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '10px' }}>{item.category.toUpperCase()}</span>
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{item.desc}</div>
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.9rem' }}>🪙 {item.price}</span>
                          <motion.button
                            whileHover={{ scale: owned ? 1 : 1.05 }}
                            whileTap={{ scale: owned ? 1 : 0.95 }}
                            onClick={() => handlePurchaseItem(item)}
                            disabled={owned}
                            style={{
                              background: owned ? 'rgba(46,204,113,0.15)' : 'rgba(212,175,55,0.15)',
                              border: `1px solid ${owned ? 'rgba(46,204,113,0.3)' : 'rgba(212,175,55,0.3)'}`,
                              color: owned ? '#2ecc71' : 'var(--accent-gold)',
                              padding: '6px 16px', borderRadius: '16px',
                              fontSize: '0.75rem', fontWeight: '600', cursor: owned ? 'default' : 'pointer'
                            }}
                          >
                            {owned ? '✓ Owned' : 'Purchase'}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* How to Earn Gold */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.1)' }}>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', letterSpacing: '2px', marginBottom: '1.5rem' }}>WAYS TO EARN GOLD</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {[
                      { icon: '🌅', name: 'Daily Check-In', reward: '10–60', desc: 'Streak bonus grows daily' },
                      { icon: '🧘', name: 'Complete Session', reward: '25', desc: 'Finish any protocol' },
                      { icon: '✍️', name: 'Share a Story', reward: '15', desc: 'Post in Community' },
                      { icon: '💛', name: 'Get Likes', reward: '5 each', desc: 'Others resonate with you' },
                      { icon: '📈', name: 'Level Up', reward: '50', desc: 'Gain a mastery level' },
                      { icon: '🐾', name: 'Pet Session', reward: '20', desc: 'Heal with your companion' },
                      { icon: '🔮', name: 'Symbol Tracing', reward: '10', desc: 'Practice sacred symbols' },
                      { icon: '🏆', name: 'Refer a Seeker', reward: '100', desc: 'Invite friends to join' }
                    ].map(way => (
                      <div key={way.name} style={{ textAlign: 'center', padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{way.icon}</div>
                        <div style={{ fontWeight: '600', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{way.name}</div>
                        <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: '700' }}>+{way.reward}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>{way.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'my avatar' && (
              <motion.div
                key="myavatar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>Character Sheet</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Customize your ethereal identity. Equip items, save outfits, and express yourself.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '2rem' }}>
                  {/* LEFT: Full-Body Avatar Preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Full-Body Portrait */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '28px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.15)', textAlign: 'center' }}>
                      <div style={{
                        width: '280px', height: '480px', borderRadius: '24px', margin: '0 auto 1.5rem',
                        border: equippedAvatar?.frame?.avatarStyle?.border || '3px solid rgba(212,175,55,0.3)',
                        overflow: 'hidden',
                        boxShadow: `0 0 40px rgba(212,175,55,0.2), ${equippedAvatar?.frame?.avatarStyle?.boxShadow || ''}`,
                        position: 'relative'
                      }}>
                        <AvatarRenderer 
                          equippedAvatar={equippedAvatar} 
                          showBuilder={showAvatarBuilder} 
                          onBuilderClose={() => setShowAvatarBuilder(false)} 
                          userIdentity={genderIdentity} 
                          goldBalance={goldBalance} 
                          spendGold={spendGold}
                          droppedItems={droppedItems}
                          setDroppedItems={setDroppedItems}
                          saveToArchive={saveToArchive}
                          isSafeMode={prefs.isSafeMode}
                          purchasedItems={purchasedItems}
                        />
                      </div>
                      {/* Customize Avatar Button */}
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(212,175,55,0.4)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAvatarBuilder(!showAvatarBuilder)}
                        style={{
                          margin: '0.75rem auto', padding: '8px 20px', borderRadius: '12px',
                          background: showAvatarBuilder ? 'rgba(212,175,55,0.2)' : 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
                          border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37',
                          cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          letterSpacing: '0.5px'
                        }}
                      >
                        🎨 {showAvatarBuilder ? 'Close Builder' : 'Customize Avatar'}
                      </motion.button>

                      {/* Store hint */}
                      <div style={{ marginBottom: '0.75rem', padding: '6px 12px', borderRadius: '10px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.12)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(212,175,55,0.7)' }}>🛍️ Visit the <strong>Gold Store</strong> for more clothing — some items are free!</span>
                      </div>

                      {/* Rank title */}
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: currentRank.color, fontWeight: '600', letterSpacing: '1px' }}>
                          {currentRank.icon} {currentRank.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{user?.name || 'Seeker'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>Level {level}</div>

                      {/* Gender / Identity Field */}
                      <div style={{ marginTop: '1rem' }}>
                        <label style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>IDENTITY</label>
                        <select
                          value={genderIdentity}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGenderIdentity(val);
                            localStorage.setItem(`aura_gender_${user?.email}`, val);
                            // Auto-set default skin on first identity selection
                            const currentSkin = localStorage.getItem('aura_avatar_skin');
                            if (!currentSkin) {
                              const skinMap = { 'Male': 'male', 'Female': 'light' };
                              if (skinMap[val]) localStorage.setItem('aura_avatar_skin', skinMap[val]);
                            }
                          }}
                          style={{ width: '100%', maxWidth: '200px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem', textAlign: 'center', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                        >
                          <option value="" style={{ background: '#1a1a2e' }}>How do you identify?</option>
                          <option value="Male" style={{ background: '#1a1a2e' }}>Male</option>
                          <option value="Female" style={{ background: '#1a1a2e' }}>Female</option>
                          <option value="Non-Binary" style={{ background: '#1a1a2e' }}>Non-Binary</option>
                          <option value="Other" style={{ background: '#1a1a2e' }}>Other</option>
                          <option value="Prefer not to say" style={{ background: '#1a1a2e' }}>Prefer not to say</option>
                        </select>
                      </div>

                      {/* Save Outfit */}
                      <div style={{ marginTop: '1rem' }}>
                        <button
                          onClick={() => {
                            const name = prompt('Name this outfit:');
                            if (!name) return;
                            const saved = JSON.parse(localStorage.getItem(`aura_outfits_${user?.email}`) || '[]');
                            saved.push({ name, slots: { ...equippedAvatar }, date: new Date().toISOString() });
                            localStorage.setItem(`aura_outfits_${user?.email}`, JSON.stringify(saved));
                            toast.success(`Outfit "${name}" saved!`);
                          }}
                          style={{ padding: '8px 20px', borderRadius: '12px', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.25)', color: '#2ecc71', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                        >
                          💾 Save Outfit
                        </button>
                        {/* Saved outfit chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', justifyContent: 'center' }}>
                          {(JSON.parse(localStorage.getItem(`aura_outfits_${user?.email}`) || '[]')).map((outfit, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)', fontSize: '0.65rem', color: 'var(--accent-gold)' }}>
                              <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setEquippedAvatar(outfit.slots);
                                  localStorage.setItem(`aura_equipped_${user?.email}`, JSON.stringify(outfit.slots));
                                  toast.success(`Loaded: ${outfit.name}`);
                                }}
                              >{outfit.name}</span>
                              <span
                                style={{ cursor: 'pointer', color: 'rgba(231,76,60,0.6)', fontSize: '0.7rem', marginLeft: '4px' }}
                                onClick={() => {
                                  const saved = JSON.parse(localStorage.getItem(`aura_outfits_${user?.email}`) || '[]');
                                  saved.splice(idx, 1);
                                  localStorage.setItem(`aura_outfits_${user?.email}`, JSON.stringify(saved));
                                  toast.success('Outfit deleted');
                                }}
                              >✕</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Avatar Stats Card */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.3)', margin: '0 0 1rem 0' }}>AVATAR STATS</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {[
                          { label: 'Level', value: level, color: 'var(--accent-gold)' },
                          { label: 'Total XP', value: exp, color: '#2ecc71' },
                          { label: 'Sessions', value: user?.totalSessions || 0, color: '#3498db' },
                          { label: 'Streak', value: `${user?.streak || 0}d`, color: '#e74c3c' },
                          { label: 'Gold', value: goldBalance, color: '#f1c40f' },
                          { label: 'Items', value: JSON.parse(localStorage.getItem(`aura_archive_${user?.email}`) || '[]').length, color: '#9b59b6' },
                        ].map(stat => (
                          <div key={stat.label} style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginTop: '2px' }}>{stat.label.toUpperCase()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Character Sheet — Equipment Slots + Inventory */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Equipment Slots — Character Sheet Grid */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <Award size={16} color="var(--accent-gold)" />
                        <h4 style={{ margin: 0, fontSize: '0.8rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)' }}>EQUIPMENT SLOTS</h4>
                        <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>{Object.keys(equippedAvatar).filter(k => equippedAvatar[k]).length}/13 equipped</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.6rem' }}>
                        {['headgear', 'frame', 'badge', 'backbling', 'aura', 'background', 'necklace', 'chest', 'hands', 'rings', 'tattoo', 'legs', 'feet'].map(slot => {
                          const item = equippedAvatar?.[slot];
                          return (
                            <div
                              key={slot}
                              onClick={() => {
                                if (item) {
                                  const updated = { ...equippedAvatar };
                                  delete updated[slot];
                                  setEquippedAvatar(updated);
                                  localStorage.setItem(`aura_equipped_${user?.email}`, JSON.stringify(updated));
                                  toast.success(`Unequipped ${item.name}`);
                                }
                              }}
                              style={{
                                padding: '0.65rem', borderRadius: '12px', textAlign: 'center',
                                background: item ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${item ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                cursor: item ? 'pointer' : 'default', transition: 'all 0.2s',
                                minHeight: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              {item ? (
                                <>
                                  <span style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{item.icon}</span>
                                  <div style={{ fontSize: '0.6rem', color: '#fff', fontWeight: '600' }}>{item.name}</div>
                                  <div style={{ fontSize: '0.5rem', color: 'rgba(231,76,60,0.5)', marginTop: '2px' }}>tap to unequip</div>
                                </>
                              ) : (
                                <>
                                  <div style={{ width: '28px', height: '28px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', opacity: 0.3, marginBottom: '2px' }}>✦</div>
                                  <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', textTransform: 'capitalize' }}>{slot}</div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inventory Split: Equipped vs Available */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <Shield size={16} color="var(--accent-gold)" />
                        <h4 style={{ margin: 0, fontSize: '0.8rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)' }}>INVENTORY</h4>
                      </div>
                      {(() => {
                        const archive = JSON.parse(localStorage.getItem(`aura_archive_${user?.email}`) || '[]');
                        const equippedIds = Object.values(equippedAvatar).filter(Boolean).map(i => i.id);
                        const inInventory = archive.filter(i => !equippedIds.includes(i.id));
                        const equipped = archive.filter(i => equippedIds.includes(i.id));

                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* Equipped column */}
                            <div>
                              <div style={{ fontSize: '0.65rem', color: '#2ecc71', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>⚔️ EQUIPPED ({equipped.length})</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                                {equipped.length === 0 ? (
                                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', padding: '8px', textAlign: 'center' }}>No items equipped</div>
                                ) : equipped.map(item => (
                                  <div key={item.name} style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px',
                                    borderRadius: '8px', background: 'rgba(46,204,113,0.05)', border: '1px solid rgba(46,204,113,0.1)',
                                    fontSize: '0.7rem', color: '#fff'
                                  }}>
                                    <span>{item.icon}</span>
                                    <span style={{ flex: 1 }}>{item.name}</span>
                                    <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', textTransform: 'capitalize' }}>{item.avatarSlot}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* In Inventory column */}
                            <div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>🎒 IN BAG ({inInventory.length})</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                                {inInventory.length === 0 ? (
                                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', padding: '8px', textAlign: 'center' }}>All items equipped!</div>
                                ) : inInventory.map(item => (
                                  <div
                                    key={item.name}
                                    onClick={() => equipAvatarItem(item)}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px',
                                      borderRadius: '8px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)',
                                      fontSize: '0.7rem', color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                  >
                                    <span>{item.icon}</span>
                                    <span style={{ flex: 1 }}>{item.name}</span>
                                    <span style={{ fontSize: '0.55rem', color: '#2ecc71' }}>Equip →</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Rank Titles */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <Shield size={16} color="var(--accent-gold)" />
                        <h4 style={{ margin: 0, fontSize: '0.8rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)' }}>RANK PROGRESSION</h4>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {[
                          { title: '✨ Initiate', lvl: 0 },
                          { title: '🌱 Novice', lvl: 3 },
                          { title: '🌀 Seeker', lvl: 7 },
                          { title: '🔮 Adept', lvl: 15 },
                          { title: '⚡ Channeler', lvl: 25 },
                          { title: '🛡️ Guardian', lvl: 35 },
                          { title: '📜 Elder', lvl: 45 },
                          { title: '🧙 Sage', lvl: 55 },
                          { title: '🌟 Ascended', lvl: 70 },
                          { title: '🔱 Transcended', lvl: 85 },
                          { title: '👑 Master', lvl: 100 },
                          { title: '🌌 Grandmaster', lvl: 150 },
                        ].map(rank => {
                          const unlocked = level >= rank.lvl;
                          const isActive = currentRank.title === rank.title.split(' ').slice(1).join(' ');
                          return (
                            <div
                              key={rank.title}
                              style={{
                                padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem',
                                background: isActive ? 'rgba(212,175,55,0.12)' : unlocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                border: `1px solid ${isActive ? 'rgba(212,175,55,0.3)' : unlocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
                                color: isActive ? 'var(--accent-gold)' : unlocked ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                                fontWeight: isActive ? '600' : '400'
                              }}
                            >
                              {unlocked ? rank.title : `🔒 Lvl ${rank.lvl}`}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'mastery' && (
              <motion.div
                key="mastery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>Mastery Sanctum</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {masteryLevel >= 100 ? '🌟 MASTER — You have transcended all ranks. Ultimate abilities unlocked.' : masteryLevel >= 50 ? '🏆 Grand Master — You may apply to become a Healer.' : `Advance to Level 50 to unlock Grand Master rank and Healer applications.`}
                    </p>
                  </div>
                  {/* Level Ring */}
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent-gold)" strokeWidth="6"
                        strokeDasharray={`${(Math.min(masteryLevel, 150) / 150) * 264} 264`}
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.4))' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{masteryLevel}</span>
                      <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>LEVEL</span>
                    </div>
                  </div>
                </div>

                {/* Rank Title Bar */}
                <div className="glass" style={{ padding: '1rem 2rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {masteryLevel >= 100 ? '🌟' : masteryLevel >= 50 ? '👑' : masteryLevel >= 25 ? '⚔️' : masteryLevel >= 10 ? '🔥' : '🌱'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                        {masteryLevel >= 100 ? 'Master' : masteryLevel >= 50 ? 'Grand Master' : masteryLevel >= 25 ? 'Adept Channeler' : masteryLevel >= 10 ? 'Awakened Practitioner' : 'Initiate Seeker'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                        {masteryLevel >= 100 ? 'All abilities unlocked • Sound tracing • Deep meditation' : masteryLevel >= 50 ? 'All standard abilities unlocked • Healer eligible • Next: Master at Level 100' : `Next rank at Level ${masteryLevel < 10 ? 10 : masteryLevel < 25 ? 25 : 50}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: '600' }}>
                    <Zap size={16} /> {user.resonancePoints || 0} RP
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  
                  {/* LEFT: Abilities Tree */}
                  <div>
                    <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '1.5rem' }}>ABILITY TREE</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { level: 1, name: 'Basic Meditation', icon: '🧘', desc: 'Foundation breathing techniques', tier: 'Initiate' },
                        { level: 5, name: 'Energy Sensing', icon: '✋', desc: 'Feel subtle energy fields', tier: 'Initiate' },
                        { level: 10, name: 'Distance Projection', icon: '🌐', desc: 'Send healing energy remotely', tier: 'Awakened' },
                        { level: 15, name: 'Crystal Attunement', icon: '💎', desc: 'Harmonize with crystal frequencies', tier: 'Awakened' },
                        { level: 20, name: 'Aura Reading', icon: '👁️', desc: 'Perceive bio-field colors', tier: 'Awakened' },
                        { level: 25, name: 'Aura Synthesis', icon: '🔮', desc: 'Merge and purify energy fields', tier: 'Adept' },
                        { level: 30, name: 'Chakra Mastery', icon: '⚡', desc: 'Full 7-chakra alignment control', tier: 'Adept' },
                        { level: 40, name: 'Sacred Geometry', icon: '📐', desc: 'Manifest protective patterns', tier: 'Adept' },
                        { level: 50, name: 'Master Attunement', icon: '👑', desc: 'Attune others to Reiki energy', tier: 'Grand Master' },
                        { level: 75, name: 'Ethereal Conduit', icon: '🌟', desc: 'Channel universal life force at will', tier: 'Grand Master' },
                        { level: 100, name: 'Sound Tracing', icon: '🔊', desc: 'Traceable worksheets generate harmonic sound effects', tier: 'Master' },
                        { level: 120, name: 'Deep Meditation Portal', icon: '🧿', desc: 'Unlocks extended guided meditation with binaural tones', tier: 'Master' },
                        { level: 150, name: 'Transcendent Healing', icon: '✨', desc: 'All abilities amplified — ultimate healer power', tier: 'Master' }
                      ].map((ability, i) => {
                        const unlocked = masteryLevel >= ability.level;
                        return (
                          <motion.div
                            key={ability.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass"
                            style={{
                              padding: '1rem 1.25rem',
                              borderRadius: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              opacity: unlocked ? 1 : 0.35,
                              background: unlocked ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.01)',
                              border: `1px solid ${unlocked ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)'}`,
                              cursor: unlocked ? 'pointer' : 'default',
                              transition: 'all 0.3s'
                            }}
                          >
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '12px',
                              background: unlocked ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.3rem', flexShrink: 0
                            }}>
                              {unlocked ? ability.icon : '🔒'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '600', fontSize: '0.9rem', color: unlocked ? '#fff' : 'rgba(255,255,255,0.5)' }}>{ability.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{ability.desc}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '0.65rem', color: unlocked ? '#2ecc71' : 'rgba(255,255,255,0.3)', fontWeight: 'bold', letterSpacing: '1px' }}>
                                {unlocked ? '✓ ACTIVE' : `LVL ${ability.level}`}
                              </div>
                              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{ability.tier}</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT: Symbol Practice + Photo Gallery */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Symbol Practice */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '32px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <Suspense fallback={<div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw className="animate-spin" /></div>}>
                          <SymbolPractice onComplete={handleSymbolComplete} masteryLevel={masteryLevel} />
                       </Suspense>
                    </div>

                    {/* Game Photo Gallery */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>SANCTUM GALLERY</h4>
                        <label style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
                          color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: '600'
                        }}>
                          <Camera size={14} />
                          Upload
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const gallery = JSON.parse(localStorage.getItem(`aura_gallery_${user.email}`) || '[]');
                              gallery.push({ id: Date.now(), src: reader.result, caption: 'Achievement', date: new Date().toISOString() });
                              localStorage.setItem(`aura_gallery_${user.email}`, JSON.stringify(gallery));
                              toast.success('Screenshot saved to gallery!');
                              setForceRefresh?.(prev => prev + 1);
                              window.dispatchEvent(new Event('storage'));
                            };
                            reader.readAsDataURL(file);
                          }} />
                        </label>
                      </div>
                      {(() => {
                        const gallery = JSON.parse(localStorage.getItem(`aura_gallery_${user.email}`) || '[]');
                        if (gallery.length === 0) return (
                          <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.4 }}>
                            <Camera size={30} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                            <p style={{ fontSize: '0.8rem' }}>Upload screenshots of your achievements, game moments, and healing milestones.</p>
                          </div>
                        );
                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            {gallery.slice(-9).map(img => (
                              <div key={img.id} style={{ aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <img src={img.src} alt={img.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Quick Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{user.totalSessions || 0}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>SESSIONS</div>
                      </div>
                      <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2ecc71' }}>
                          {[1,5,10,15,20,25,30,40,50,75].filter(l => masteryLevel >= l).length}/10
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>ABILITIES</div>
                      </div>
                    </div>
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
                 {/* Subscription gate */}
                 {user?.subscription !== 'healing' ? (
                   <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                     <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
                     <h2 style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", marginBottom: '0.5rem' }}>Community Access Required</h2>
                     <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
                       The Community Sanctuary is available exclusively to Healing tier subscribers. 
                       Upgrade your membership to connect with fellow practitioners, join events, and share your journey.
                     </p>
                     <button
                       className="btn btn-primary"
                       onClick={() => setActiveTab('settings')}
                       style={{ padding: '1rem 2.5rem', fontSize: '0.9rem' }}
                     >
                       👑 UPGRADE TO HEALING TIER
                     </button>
                   </div>
                 ) : (
                 <>
                 {/* Header */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                       <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>Community Sanctuary</h2>
                       <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '600px' }}>
                         Welcome to our healing community — a safe space for practitioners to connect, share experiences, 
                         attend events, and grow together on the path of vibrational alignment.
                       </p>
                    </div>
                    <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--accent-gold)' }}>
                       <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Global Resonance</div>
                       <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                          {(stories.filter(s => s.status === 'approved').reduce((acc, s) => acc + s.rating, 0) / Math.max(1, stories.filter(s => s.status === 'approved').length) || 5.0).toFixed(1)}
                          <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>/5.0</span>
                       </div>
                    </div>
                 </div>

                 {/* ─── Community Disclaimer ─── */}
                 <div style={{
                   padding: '1.25rem 1.5rem', borderRadius: '16px', marginBottom: '2rem',
                   background: 'rgba(231,76,60,0.04)', border: '1px solid rgba(231,76,60,0.15)',
                   display: 'flex', alignItems: 'flex-start', gap: '12px'
                 }}>
                   <div style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }}>⚠️</div>
                   <div>
                     <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#e74c3c', marginBottom: '0.4rem', letterSpacing: '1px' }}>COMMUNITY GUIDELINES & DISCLAIMER</div>
                     <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 0.5rem 0', lineHeight: '1.6' }}>
                       This community is <strong style={{ color: 'rgba(255,255,255,0.7)' }}>organized and run by fellow community members</strong>. 
                       The healer team reviews and approves events but does not control the topics discussed or the actions of individual users. 
                       <strong style={{ color: 'rgba(255,255,255,0.7)' }}> This is NOT a dating platform.</strong>
                     </p>
                     <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.5rem 0', lineHeight: '1.6' }}>
                       Users who engage in inappropriate, harassing, or disrespectful behavior will receive a warning. 
                       Continued violations or serious offenses will result in <strong style={{ color: '#e74c3c' }}>permanent removal and ban</strong> from the community.
                     </p>
                     <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                       By participating, you agree to treat all members with kindness and respect. Use the report button below if you experience any issues.
                     </p>
                   </div>
                 </div>

                 {/* ─── Events & Calendar + Report ─── */}
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                   {/* Upcoming Events */}
                   <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                       <h3 style={{ fontSize: '1rem', color: 'var(--accent-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                         📅 Upcoming Events
                       </h3>
                       <span style={{ fontSize: '0.6rem', background: 'rgba(46,204,113,0.1)', color: '#2ecc71', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(46,204,113,0.15)' }}>
                         Healer Approved
                       </span>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto' }}>
                       {(() => {
                         const savedEvents = JSON.parse(localStorage.getItem('aura_community_events') || 'null');
                         const events = savedEvents || [
                           { id: 'evt1', title: 'Group Meditation Circle', date: '2026-02-15', time: '7:00 PM', host: 'Chrissa', description: 'Guided group meditation focusing on heart chakra activation. All levels welcome.', spots: 12, signups: [] },
                           { id: 'evt2', title: 'Reiki Share & Practice', date: '2026-02-18', time: '6:30 PM', host: 'Healing Team', description: 'Practice giving and receiving Reiki in a safe, supportive environment.', spots: 8, signups: [] },
                           { id: 'evt3', title: 'Sound Bath Journey', date: '2026-02-22', time: '8:00 PM', host: 'Chrissa', description: 'Crystal singing bowls and tuning forks for deep vibrational healing.', spots: 15, signups: [] },
                           { id: 'evt4', title: 'New Moon Intention Setting', date: '2026-02-28', time: '7:30 PM', host: 'Community', description: 'Set powerful intentions under the new moon with collective energy amplification.', spots: 20, signups: [] },
                           { id: 'evt5', title: 'Chakra Balancing Workshop', date: '2026-03-05', time: '6:00 PM', host: 'Healing Team', description: 'Learn hands-on chakra balancing techniques for self and others.', spots: 10, signups: [] },
                         ];
                         if (!savedEvents) localStorage.setItem('aura_community_events', JSON.stringify(events));
                         const userEmail = user?.email || '';
                         return events.map(evt => {
                           const isSignedUp = (evt.signups || []).includes(userEmail);
                           const spotsLeft = evt.spots - (evt.signups || []).length;
                           return (
                             <div key={evt.id} style={{
                               padding: '1rem', borderRadius: '14px',
                               background: isSignedUp ? 'rgba(46,204,113,0.05)' : 'rgba(255,255,255,0.01)',
                               border: `1px solid ${isSignedUp ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.04)'}`,
                             }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                 <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>{evt.title}</div>
                                 <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{spotsLeft} spots left</span>
                               </div>
                               <div style={{ display: 'flex', gap: '8px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                 <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '6px', background: 'rgba(212,175,55,0.08)', color: 'var(--accent-gold)', border: '1px solid rgba(212,175,55,0.15)' }}>
                                   📅 {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                 </span>
                                 <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                   🕐 {evt.time}
                                 </span>
                                 <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                   👤 {evt.host}
                                 </span>
                               </div>
                               <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.6rem 0', lineHeight: '1.4' }}>{evt.description}</p>
                               <button
                                 onClick={() => {
                                   const allEvts = JSON.parse(localStorage.getItem('aura_community_events') || '[]');
                                   const idx = allEvts.findIndex(e => e.id === evt.id);
                                   if (idx === -1) return;
                                   if (isSignedUp) {
                                     allEvts[idx].signups = allEvts[idx].signups.filter(e => e !== userEmail);
                                     toast.success(`Unregistered from ${evt.title}`);
                                   } else {
                                     if (spotsLeft <= 0) return toast.error('This event is full.');
                                     allEvts[idx].signups = [...(allEvts[idx].signups || []), userEmail];
                                     toast.success(`🎉 Signed up for ${evt.title}!`, { duration: 4000 });
                                   }
                                   localStorage.setItem('aura_community_events', JSON.stringify(allEvts));
                                   setActiveTab('community'); // force re-render
                                 }}
                                 style={{
                                   width: '100%', padding: '0.5rem', borderRadius: '10px',
                                   background: isSignedUp ? 'rgba(231,76,60,0.08)' : 'rgba(46,204,113,0.1)',
                                   border: `1px solid ${isSignedUp ? 'rgba(231,76,60,0.2)' : 'rgba(46,204,113,0.2)'}`,
                                   color: isSignedUp ? '#e74c3c' : '#2ecc71',
                                   cursor: spotsLeft <= 0 && !isSignedUp ? 'not-allowed' : 'pointer',
                                   fontSize: '0.75rem', fontWeight: '600'
                                 }}
                               >
                                 {isSignedUp ? '✕ Cancel Registration' : spotsLeft <= 0 ? '⛔ Event Full' : '✓ Sign Up to Join'}
                               </button>
                             </div>
                           );
                         });
                       })()}
                     </div>
                   </div>

                   {/* Report / Complaint System */}
                   <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <h3 style={{ fontSize: '1rem', color: '#e74c3c', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       🛡️ Report a Concern
                     </h3>
                     <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1.25rem 0', lineHeight: '1.5' }}>
                       If you've experienced inappropriate behavior, harassment, or anything that violates community guidelines, 
                       please report it here. All reports are sent directly to the owner/healer team and handled confidentially.
                     </p>
                     <form onSubmit={(e) => {
                       e.preventDefault();
                       const form = e.target;
                       const type = form.reportType.value;
                       const details = form.reportDetails.value;
                       const offender = form.reportUser.value;
                       if (!details.trim()) return toast.error('Please describe the issue.');
                       const report = {
                         id: `rpt_${Date.now()}`,
                         type,
                         offender: offender || 'Not specified',
                         details,
                         reporterEmail: user?.email,
                         reporterName: user?.name || 'Anonymous',
                         timestamp: new Date().toISOString(),
                         status: 'pending'
                       };
                       const existing = JSON.parse(localStorage.getItem('aura_community_reports') || '[]');
                       existing.push(report);
                       localStorage.setItem('aura_community_reports', JSON.stringify(existing));
                       toast.success('Report submitted. The healer team will review it confidentially.', { icon: '🛡️', duration: 5000 });
                       form.reset();
                     }}>
                       <div style={{ marginBottom: '1rem' }}>
                         <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', letterSpacing: '1px' }}>TYPE OF CONCERN</label>
                         <select name="reportType" style={{
                           width: '100%', padding: '0.6rem', borderRadius: '10px',
                           background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                           color: '#fff', fontSize: '0.8rem'
                         }}>
                           <option value="harassment" style={{ background: '#0a0a14' }}>Harassment or Bullying</option>
                           <option value="inappropriate" style={{ background: '#0a0a14' }}>Inappropriate Content</option>
                           <option value="spam" style={{ background: '#0a0a14' }}>Spam or Solicitation</option>
                           <option value="dating" style={{ background: '#0a0a14' }}>Unwanted Romantic Advances</option>
                           <option value="safety" style={{ background: '#0a0a14' }}>Safety Concern</option>
                           <option value="other" style={{ background: '#0a0a14' }}>Other</option>
                         </select>
                       </div>
                       <div style={{ marginBottom: '1rem' }}>
                         <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', letterSpacing: '1px' }}>USER INVOLVED (OPTIONAL)</label>
                         <input name="reportUser" type="text" placeholder="Username or description of the person"
                           style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem' }}
                         />
                       </div>
                       <div style={{ marginBottom: '1rem' }}>
                         <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', letterSpacing: '1px' }}>DESCRIBE THE ISSUE</label>
                         <textarea name="reportDetails" placeholder="Please describe what happened in detail..."
                           style={{ width: '100%', height: '100px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '10px', resize: 'none', fontFamily: 'inherit', fontSize: '0.8rem' }}
                         />
                       </div>
                       <button type="submit" style={{
                         width: '100%', padding: '0.8rem', borderRadius: '12px',
                         background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)',
                         color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700',
                         letterSpacing: '1px'
                       }}>
                         🛡️ SUBMIT CONFIDENTIAL REPORT
                       </button>
                     </form>
                     {/* My previous reports */}
                     {(() => {
                       const myReports = JSON.parse(localStorage.getItem('aura_community_reports') || '[]').filter(r => r.reporterEmail === user?.email);
                       if (myReports.length === 0) return null;
                       return (
                         <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                           <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '0.5rem' }}>YOUR PREVIOUS REPORTS ({myReports.length})</div>
                           {myReports.slice(-3).reverse().map(r => (
                             <div key={r.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <div>
                                 <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{r.type.replace(/_/g, ' ')}</span>
                                 <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginLeft: '8px' }}>{new Date(r.timestamp).toLocaleDateString()}</span>
                               </div>
                               <span style={{
                                 fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px',
                                 background: r.status === 'resolved' ? 'rgba(46,204,113,0.1)' : 'rgba(243,156,18,0.1)',
                                 color: r.status === 'resolved' ? '#2ecc71' : '#f39c12',
                                 border: `1px solid ${r.status === 'resolved' ? 'rgba(46,204,113,0.2)' : 'rgba(243,156,18,0.2)'}`
                               }}>
                                 {r.status === 'resolved' ? '✓ Resolved' : '⏳ Under Review'}
                               </span>
                             </div>
                           ))}
                         </div>
                       );
                     })()}
                   </div>
                 </div>

                 {/* ─── Community Stories Section ─── */}
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
                                   <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                          onClick={() => handleLikeStory(story.id)}
                                          style={{
                                            background: myLikes.includes(story.id) ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${myLikes.includes(story.id) ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                            borderRadius: '20px', padding: '4px 12px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            color: myLikes.includes(story.id) ? 'var(--accent-gold)' : 'rgba(255,255,255,0.4)',
                                            fontSize: '0.75rem', fontWeight: '600', transition: 'all 0.2s'
                                          }}
                                        >
                                          <Heart size={12} fill={myLikes.includes(story.id) ? 'var(--accent-gold)' : 'none'} />
                                          {storyLikes[story.id] || 0}
                                        </button>
                                        {/* Report user button on each story */}
                                        <button
                                          onClick={() => {
                                            const reportUser = story.userName || 'Unknown';
                                            const concern = prompt(`Report concern about ${reportUser}?\n\nDescribe what happened:`);
                                            if (!concern) return;
                                            const report = {
                                              id: `rpt_${Date.now()}`, type: 'community_story',
                                              offender: reportUser, details: concern,
                                              reporterEmail: user?.email, reporterName: user?.name || 'Anonymous',
                                              timestamp: new Date().toISOString(), status: 'pending'
                                            };
                                            const existing = JSON.parse(localStorage.getItem('aura_community_reports') || '[]');
                                            existing.push(report);
                                            localStorage.setItem('aura_community_reports', JSON.stringify(existing));
                                            toast.success('Report submitted to healer team.', { icon: '🛡️' });
                                          }}
                                          title="Report this user"
                                          style={{
                                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '20px', padding: '4px 8px', cursor: 'pointer',
                                            color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', transition: 'all 0.2s'
                                          }}
                                        >
                                          🚩
                                        </button>
                                      </div>
                                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                                        {new Date(story.timestamp).toLocaleDateString()}
                                      </span>
                                   </div>
                                </div>
                             ))
                          )}
                       </div>
                    </div>
                 </div>
                 </>
                 )}
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

            {activeTab === 'pets' && (
              <motion.div
                key="pets"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>Companion Sanctuary</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem' }}>Raise, care for, and accessorize your companions. They level up with you!</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                  {/* Add Pet Form */}
                  <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(52,231,228,0.03)', border: '1px solid rgba(52,231,228,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                      <PawPrint size={20} color="#34e7e4" />
                      <h3 style={{ margin: 0, fontSize: '1rem', letterSpacing: '2px', color: '#34e7e4' }}>ADD COMPANION</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <input
                        type="text"
                        placeholder="Companion Name"
                        value={newPetName}
                        onChange={e => setNewPetName(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem' }}
                      />
                      {/* Breed Picker — Free + Premium */}
                      {(() => {
                        const freeTypes = [
                          { value: 'dog', icon: '🐕', label: 'Dog' },
                          { value: 'cat', icon: '🐈', label: 'Cat' },
                          { value: 'bird', icon: '🐦', label: 'Bird' },
                          { value: 'horse', icon: '🐴', label: 'Horse' },
                          { value: 'rabbit', icon: '🐇', label: 'Rabbit' },
                          { value: 'hamster', icon: '🐹', label: 'Hamster' },
                          { value: 'fish', icon: '🐠', label: 'Fish' },
                          { value: 'turtle', icon: '🐢', label: 'Turtle' },
                          { value: 'other', icon: '✨', label: 'Other' }
                        ];
                        const storeBreeds = (JSON.parse(localStorage.getItem('aura_shop_items') || '[]'))
                          .filter(i => i.petBreed && i.enabled !== false);
                        return (
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '0.1em' }}>SELECT TYPE / BREED</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: storeBreeds.length > 0 ? '8px' : 0 }}>
                              {freeTypes.map(t => (
                                <button
                                  key={t.value}
                                  onClick={() => setNewPetType(t.value)}
                                  style={{
                                    padding: '6px 12px', borderRadius: '10px', fontSize: '0.8rem',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    background: newPetType === t.value ? 'rgba(52,231,228,0.15)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${newPetType === t.value ? '#34e7e4' : 'rgba(255,255,255,0.08)'}`,
                                    color: newPetType === t.value ? '#34e7e4' : 'rgba(255,255,255,0.6)',
                                    boxShadow: newPetType === t.value ? '0 0 12px rgba(52,231,228,0.2)' : 'none'
                                  }}
                                >{t.icon} {t.label}</button>
                              ))}
                            </div>
                            {storeBreeds.length > 0 && (
                              <>
                                <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', marginBottom: '6px', letterSpacing: '0.1em' }}>✨ PREMIUM BREEDS</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {storeBreeds.map(breed => {
                                    const owned = purchasedItems.includes(breed.id);
                                    const isSelected = newPetType === breed.id;
                                    return (
                                      <button
                                        key={breed.id}
                                        onClick={() => {
                                          if (owned) {
                                            setNewPetType(breed.id);
                                          } else {
                                            toast(`${breed.name} is locked! Purchase from the Gold Store for ${breed.price} 🪙`, {
                                              icon: '🔒',
                                              style: { background: 'rgba(30,30,45,0.95)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }
                                            });
                                          }
                                        }}
                                        style={{
                                          padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem',
                                          cursor: owned ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                                          background: isSelected ? 'rgba(212,175,55,0.15)' : owned ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                          border: `1px solid ${isSelected ? 'var(--accent-gold)' : owned ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                                          color: isSelected ? 'var(--accent-gold)' : owned ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
                                          boxShadow: isSelected ? '0 0 12px rgba(212,175,55,0.2)' : 'none',
                                          opacity: owned ? 1 : 0.6
                                        }}
                                      >
                                        {breed.breedIcon || breed.icon} {breed.name} {!owned && <span style={{fontSize: '0.6rem'}}>🔒 {breed.price}🪙</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })()}
                      <textarea
                        placeholder="Health notes, conditions, personality..."
                        value={newPetNotes}
                        onChange={e => setNewPetNotes(e.target.value)}
                        rows={3}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
                      />
                      <button
                        onClick={handleAddPet}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <PawPrint size={16} /> Add to Sanctuary
                      </button>
                    </div>
                  </div>

                  {/* Pet Portfolio */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pets.length === 0 ? (
                      <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '24px', opacity: 0.5 }}>
                        <PawPrint size={40} style={{ margin: '0 auto 1rem', display: 'block', color: 'rgba(255,255,255,0.2)' }} />
                        <p>No companions registered yet.</p>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Add your fur baby to begin their healing journey.</p>
                      </div>
                    ) : (
                      pets.map(pet => {
                        const petEmojis = { dog: '🐕', cat: '🐈', bird: '🐦', horse: '🐴', rabbit: '🐇', hamster: '🐹', fish: '🐠', turtle: '🐢', other: '✨' };
                        // Pet evolution at level milestones
                        const evolvedEmojis = {
                          dog: { 1: '🐕', 5: '🐕‍🦺', 10: '🦮' },
                          cat: { 1: '🐈', 5: '🐈‍⬛', 10: '🦁' },
                          bird: { 1: '🐦', 5: '🦜', 10: '🦅' },
                          horse: { 1: '🐴', 5: '🐎', 10: '🦄' },
                          rabbit: { 1: '🐇', 5: '🐰', 10: '🌟' },
                          hamster: { 1: '🐹', 5: '🐿️', 10: '🦔' },
                          fish: { 1: '🐠', 5: '🐡', 10: '🐋' },
                          turtle: { 1: '🐢', 5: '🐊', 10: '🐉' },
                        };
                        const evolutions = evolvedEmojis[pet.type] || {};
                        const petLevel = pet.level || 1;
                        const petEmoji = pet.breedIcon || evolutions[petLevel >= 10 ? 10 : petLevel >= 5 ? 5 : 1] || petEmojis[pet.type] || '✨';
                        const moodEmojis = { happy: '😊', content: '😌', lonely: '😢' };
                        const petExpNext = Math.pow(petLevel, 2) * 50;
                        const petExpPercent = Math.min(((pet.exp || 0) / petExpNext) * 100, 100);

                        return (
                          <motion.div
                            key={pet.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass"
                            style={{ padding: '1.5rem', borderRadius: '20px', background: pet.breedId ? 'rgba(212,175,55,0.04)' : 'rgba(52,231,228,0.03)', border: `1px solid ${pet.breedId ? 'rgba(212,175,55,0.15)' : 'rgba(52,231,228,0.1)'}` }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ position: 'relative' }}>
                                  <span style={{ fontSize: '2.2rem' }}>{petEmoji}</span>
                                  {(pet.accessories || []).length > 0 && (
                                    <div style={{ position: 'absolute', top: '-6px', right: '-8px', display: 'flex', gap: '1px' }}>
                                      {pet.accessories.slice(0, 3).map((acc, i) => (
                                        <span key={i} style={{ fontSize: '0.7rem' }}>{acc.emoji}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#34e7e4' }}>
                                    {pet.name} {moodEmojis[pet.mood] || '😌'}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>
                                    {pet.breedName ? `${pet.breedName} (${pet.type})` : pet.type} • Lvl {petLevel} • {pet.sessions || 0} sessions
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handlePetCare(pet.id)}
                                  style={{ background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '10px', padding: '5px 10px', cursor: 'pointer', color: '#2ecc71', fontSize: '0.7rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Heart size={12} /> Care
                                </motion.button>
                                <button
                                  onClick={() => handleRemovePet(pet.id)}
                                  style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ff7675' }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Pet XP Bar */}
                            <div style={{ marginBottom: '0.5rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>Pet XP</span>
                                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{pet.exp || 0} / {petExpNext}</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${petExpPercent}%` }}
                                  style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, #34e7e4, #2ecc71)' }}
                                />
                              </div>
                            </div>

                            {/* Pet Accessories */}
                            {(pet.accessories || []).length > 0 && (
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                                {pet.accessories.map((acc, i) => (
                                  <span
                                    key={i}
                                    onClick={() => unequipPetAccessory(pet.id, acc.id)}
                                    title={`${acc.name} (click to remove)`}
                                    style={{ fontSize: '0.65rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', padding: '2px 8px', borderRadius: '10px', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                                  >
                                    {acc.emoji} {acc.name} ×
                                  </span>
                                ))}
                              </div>
                            )}

                            {pet.notes && (
                              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0.5rem 0 0 0', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                                {pet.notes}
                              </p>
                            )}
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Pet Equip Modal — appears when purchasing a pet item with multiple pets */}
                {showPetEquipModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setShowPetEquipModal(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={e => e.stopPropagation()}
                      className="glass"
                      style={{ padding: '2rem', borderRadius: '24px', maxWidth: '400px', width: '90%', background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(52,231,228,0.2)' }}
                    >
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#34e7e4' }}>🎀 Equip to which companion?</h3>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1.5rem 0' }}>
                        Choose which pet receives: <strong style={{ color: 'var(--accent-gold)' }}>{showPetEquipModal.name}</strong>
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {pets.map(pet => {
                          const petEmojis = { dog: '🐕', cat: '🐈', bird: '🐦', horse: '🐴', rabbit: '🐇', hamster: '🐹', fish: '🐠', turtle: '🐢', other: '✨' };
                          return (
                            <motion.button
                              key={pet.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                equipPetAccessory(pet.id, showPetEquipModal);
                                toast.success(`${showPetEquipModal.name} equipped on ${pet.name}!`, { icon: '🎀' });
                                setShowPetEquipModal(null);
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.8rem 1rem', borderRadius: '12px', background: 'rgba(52,231,228,0.05)', border: '1px solid rgba(52,231,228,0.15)', cursor: 'pointer', color: '#fff', fontSize: '0.9rem' }}
                            >
                              <span style={{ fontSize: '1.5rem' }}>{petEmojis[pet.type] || '✨'}</span>
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '600' }}>{pet.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Lvl {pet.level || 1} • {(pet.accessories || []).length} accessories</div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setShowPetEquipModal(null)}
                        style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Cancel
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'sacred archive' && (
              <motion.div
                key="archive"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>Sacred Archive</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Your collection of saved healing moments, generated avatars, and portal captures.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '12px' }}>
                    <button style={{ padding: '6px 16px', borderRadius: '8px', background: 'var(--accent-gold)', color: '#000', fontSize: '0.8rem', fontWeight: '700', border: 'none' }}>ALL MEDIA</button>
                    <button style={{ padding: '6px 16px', borderRadius: '8px', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: '600', border: 'none' }}>VIDEOS</button>
                    <button style={{ padding: '6px 16px', borderRadius: '8px', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: '600', border: 'none' }}>IMAGES</button>
                  </div>
                </div>

                {mediaArchive.length === 0 ? (
                  <div style={{ padding: '5rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Archive size={48} style={{ margin: '0 auto 1.5rem', display: 'block', opacity: 0.2 }} />
                    <h3 style={{ color: 'rgba(255,255,255,0.3)' }}>Your archive is empty.</h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem' }}>Save AI avatars or healing video clips to see them here.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {mediaArchive.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className="glass"
                        style={{ overflow: 'hidden', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <div style={{ aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                          {item.type === 'video' ? (
                            <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }} />
                          ) : (
                            <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                          )}
                          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.6rem', color: 'var(--accent-gold)', fontWeight: '700', textTransform: 'uppercase' }}>
                            {item.type}
                          </div>
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                          <div style={{ fontWeight: '700', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>Saved {new Date(item.savedAt).toLocaleDateString()}</div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a 
                              href={item.url} 
                              download={`${item.name}.${item.type === 'video' ? 'mp4' : 'png'}`}
                              style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }}
                            >
                              ⬇️ Download
                            </a>
                            <button 
                              onClick={() => {
                                if (!window.confirm('Remove from archive?')) return;
                                setMediaArchive(prev => {
                                  const updated = prev.filter(i => i.id !== item.id);
                                  localStorage.setItem(`aura_media_archive_${user?.email}`, JSON.stringify(updated));
                                  return updated;
                                });
                                toast.success('Removed from Sacred Archive');
                              }}
                              style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', color: '#e74c3c', cursor: 'pointer' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
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

                 {/* ─── Avatar Title & Nameplate (Healing Only) ─── */}
                 <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(138,43,226,0.03)', border: '1px solid rgba(138,43,226,0.15)', marginBottom: '2rem', position: 'relative' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                     <Star size={20} color="#8b5cf6" />
                     <h3 style={{ margin: 0, fontSize: '1rem', letterSpacing: '2px', color: '#8b5cf6' }}>TITLE & NAMEPLATE</h3>
                     {!isHealingTier && <span style={{ fontSize: '0.65rem', background: 'rgba(138,43,226,0.15)', padding: '3px 10px', borderRadius: '8px', color: '#8b5cf6' }}>🔒 Healing Tier</span>}
                   </div>
                   {isHealingTier ? (
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                       {/* Title Picker */}
                       <div>
                         <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>AVATAR TITLE</label>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                           {['', 'Sage', 'Oracle', 'Mystic', 'Guardian', 'Architect', 'Luminary', 'Wanderer', 'Shepherd', 'Alchemist', 'Dreamweaver', 'Seraphim', 'Zenith'].map(t => (
                             <button
                               key={t}
                               onClick={() => { setAvatarTitle(t); localStorage.setItem(`aura_avatar_title_${user.email}`, t); toast.success(t ? `Title set: ${t}` : 'Title removed'); }}
                               style={{
                                 padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer',
                                 background: avatarTitle === t ? 'rgba(138,43,226,0.15)' : 'rgba(255,255,255,0.03)',
                                 border: avatarTitle === t ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.08)',
                                 color: avatarTitle === t ? '#8b5cf6' : 'rgba(255,255,255,0.5)'
                               }}
                             >
                               {t || 'None'}
                             </button>
                           ))}
                         </div>
                       </div>
                       {/* Nameplate Color */}
                       <div>
                         <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>NAMEPLATE COLOR</label>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                           {[
                             { v: '', label: 'Default' },
                             { v: 'linear-gradient(135deg, #d4af37, #f5d060)', label: 'Gold' },
                             { v: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', label: 'Amethyst' },
                             { v: 'linear-gradient(135deg, #2ecc71, #27ae60)', label: 'Emerald' },
                             { v: 'linear-gradient(135deg, #3498db, #2980b9)', label: 'Sapphire' },
                             { v: 'linear-gradient(135deg, #e74c3c, #c0392b)', label: 'Ruby' },
                             { v: 'linear-gradient(135deg, #f39c12, #e67e22)', label: 'Amber' },
                             { v: 'linear-gradient(135deg, #1abc9c, #16a085)', label: 'Jade' },
                             { v: 'linear-gradient(135deg, #e91e63, #9c27b0)', label: 'Rose' }
                           ].map(c => (
                             <button
                               key={c.v}
                               onClick={() => { setNameplateColor(c.v); localStorage.setItem(`aura_nameplate_color_${user.email}`, c.v); }}
                               style={{
                                 padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer',
                                 background: c.v ? c.v : 'rgba(255,255,255,0.03)',
                                 border: nameplateColor === c.v ? '2px solid #fff' : '1px solid rgba(255,255,255,0.08)',
                                 color: '#fff', WebkitBackgroundClip: c.v ? 'unset' : 'unset'
                               }}
                             >
                               {c.label}
                             </button>
                           ))}
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                       <p>🔒 Upgrade to Healing tier to unlock custom titles, nameplate colors, and more.</p>
                     </div>
                   )}
                 </div>

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
                       <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent-gold)' }}>📦 My Purchases</h4>
                       {(() => {
                         const archive = JSON.parse(localStorage.getItem(`aura_archive_${user?.email}`) || '[]');
                         if (archive.length === 0) return (
                           <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: '1.5rem' }}>No purchases yet. Visit the Gold Store to find exclusive content!</p>
                         );
                         return (
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                             {archive.map((item, i) => (
                               <div key={item.id || i}>
                                 <div style={{
                                   display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                   padding: '1rem', borderRadius: '14px',
                                   background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'
                                 }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                     <span style={{ fontSize: '1.5rem' }}>{item.icon || '🎁'}</span>
                                     <div>
                                       <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</div>
                                       <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                                         {item.category} · Purchased {item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString() : 'recently'}
                                       </div>
                                     </div>
                                   </div>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                     {item.videoUrl && (
                                       <motion.button
                                         whileHover={{ scale: 1.05 }}
                                         whileTap={{ scale: 0.95 }}
                                         onClick={() => setPlayingVideo(playingVideo === item.id ? null : item.id)}
                                         style={{
                                           background: playingVideo === item.id ? 'rgba(231,76,60,0.15)' : 'rgba(212,175,55,0.15)',
                                           border: `1px solid ${playingVideo === item.id ? 'rgba(231,76,60,0.3)' : 'rgba(212,175,55,0.3)'}`,
                                           color: playingVideo === item.id ? '#e74c3c' : 'var(--accent-gold)',
                                           padding: '6px 14px', borderRadius: '14px',
                                           fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
                                         }}
                                       >{playingVideo === item.id ? '⏹ Close' : '▶ Watch'}</motion.button>
                                     )}
                                     <span style={{ color: '#2ecc71', fontSize: '0.75rem', fontWeight: '600' }}>✓ Owned</span>
                                   </div>
                                 </div>
                                 <AnimatePresence>
                                   {playingVideo === item.id && item.videoUrl && (
                                     <motion.div
                                       initial={{ opacity: 0, height: 0 }}
                                       animate={{ opacity: 1, height: 'auto' }}
                                       exit={{ opacity: 0, height: 0 }}
                                       style={{ overflow: 'hidden', borderRadius: '0 0 14px 14px', border: '1px solid rgba(212,175,55,0.2)', borderTop: 'none', marginTop: '-4px' }}
                                     >
                                       <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-gold)' }}>🎬 Now Playing: {item.name}</span>
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                              onClick={() => saveToArchive({ ...item, type: 'video', url: item.videoUrl })}
                                              style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px' }}
                                            >
                                              💾 Save Clip
                                            </button>
                                            <button onClick={() => setPlayingVideo(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                                          </div>
                                       </div>
                                       <video controls autoPlay style={{ width: '100%', display: 'block', background: '#000', maxHeight: '400px' }} src={item.videoUrl}>
                                         Your browser does not support the video tag.
                                       </video>
                                     </motion.div>
                                   )}
                                 </AnimatePresence>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>

                     {/* Transaction History */}
                     <div className="glass" style={{ gridColumn: '1 / -1', padding: '2rem', borderRadius: '24px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.15)' }}>
                       <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent-gold)' }}>📊 Gold Transaction History</h4>
                       {(() => {
                         const txns = JSON.parse(localStorage.getItem(`aura_transactions_${user?.email}`) || '[]').slice(-20).reverse();
                         if (txns.length === 0) return (
                           <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No transactions yet. Earn or spend Gold to see your ledger here.</p>
                         );
                         return (
                           <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                               <thead>
                                 <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                   <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>TXN ID</th>
                                   <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Date</th>
                                   <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Type</th>
                                   <th style={{ textAlign: 'right', padding: '8px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Amount</th>
                                   <th style={{ textAlign: 'right', padding: '8px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Balance</th>
                                   <th style={{ textAlign: 'left', padding: '8px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Description</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 {txns.map((txn, i) => (
                                   <tr key={txn.txnId || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                     <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{txn.txnId?.slice(0, 16) || '—'}</td>
                                     <td style={{ padding: '8px', color: 'rgba(255,255,255,0.5)' }}>{new Date(txn.date).toLocaleDateString()}</td>
                                     <td style={{ padding: '8px' }}>
                                       <span style={{
                                         padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '600',
                                         background: txn.type === 'earned' ? 'rgba(46,204,113,0.15)' : txn.type === 'gift' ? 'rgba(52,152,219,0.15)' : 'rgba(231,76,60,0.15)',
                                         color: txn.type === 'earned' ? '#2ecc71' : txn.type === 'gift' ? '#3498db' : '#e74c3c'
                                       }}>
                                         {txn.type === 'earned' ? '↑ Earned' : txn.type === 'gift' ? '🎁 Gift' : '↓ Spent'}
                                       </span>
                                     </td>
                                     <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: txn.type === 'spent' ? '#e74c3c' : '#2ecc71' }}>
                                       {txn.type === 'spent' ? '-' : '+'}{txn.amount} 🪙
                                     </td>
                                     <td style={{ padding: '8px', textAlign: 'right', color: 'var(--accent-gold)', fontWeight: '600' }}>{txn.balance} 🪙</td>
                                     <td style={{ padding: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{txn.description}</td>
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                           </div>
                         );
                       })()}
                     </div>

                     {/* ─── Billing & Receipts (Payment Ledger) ─── */}
                     <div className="glass" style={{ gridColumn: '1 / -1', padding: '2rem', borderRadius: '24px', background: 'rgba(46,204,113,0.03)', border: '1px solid rgba(46,204,113,0.15)' }}>
                       <h4 style={{ margin: '0 0 1rem 0', color: '#2ecc71' }}>🧾 Billing & Receipts</h4>
                       {(() => {
                         const userEmail = user?.email;
                         const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
                         const paymentTxns = PaymentLedger.getTransactions(userEmail);

                         return (
                           <>
                             {/* Active Subscription */}
                             {profile.subscription === 'healing' && (
                               <div style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', marginBottom: '1.5rem' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                   <div>
                                     <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Subscription</div>
                                     <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--accent-gold)', marginTop: '0.3rem' }}>👑 Healing Tier — {(profile.subscriptionDuration || '1_month').replace('_', ' ')}</div>
                                   </div>
                                   <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '8px', background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', color: '#2ecc71' }}>Active</span>
                                 </div>
                               </div>
                             )}

                             {/* Payment Transaction History */}
                             {paymentTxns.length === 0 ? (
                               <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No payment receipts yet.</p>
                             ) : (
                               <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                 {paymentTxns.slice(0, 20).map(txn => (
                                   <div key={txn.id} style={{
                                     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                     padding: '0.75rem 1rem', marginBottom: '0.4rem', borderRadius: '12px',
                                     background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
                                   }}>
                                     <div>
                                       <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '500' }}>{txn.description}</div>
                                       <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                                         {new Date(txn.createdAt).toLocaleDateString()} · {txn.paymentMethod}
                                       </div>
                                     </div>
                                     <div style={{ textAlign: 'right' }}>
                                       <div style={{ fontSize: '0.9rem', fontWeight: '600', color: txn.status === 'refunded' ? '#e74c3c' : '#2ecc71' }}>
                                         ${(txn.total || 0).toFixed(2)}
                                       </div>
                                       <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{txn.receiptId}</div>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             )}

                             <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: '0.75rem' }}>
                               Receipts contain no protected health information (HIPAA compliant). Refunds processed within 5-10 business days.
                             </p>
                           </>
                         );
                       })()}
                     </div>

                      {/* Full Avatar View — Full Body */}
                      <div className="glass" style={{ gridColumn: '1 / -1', padding: '2rem', borderRadius: '24px', background: 'rgba(138,43,226,0.03)', border: '1px solid rgba(138,43,226,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, color: '#a29bfe' }}>🎨 Full Avatar View</h4>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const outfitName = prompt('Name this outfit:');
                              if (!outfitName || !outfitName.trim()) return;
                              const savedOutfits = JSON.parse(localStorage.getItem(`aura_outfits_${user?.email}`) || '[]');
                              const outfit = { name: outfitName.trim(), slots: { ...equippedAvatar }, savedAt: new Date().toISOString() };
                              savedOutfits.push(outfit);
                              localStorage.setItem(`aura_outfits_${user.email}`, JSON.stringify(savedOutfits));
                              toast.success(`Outfit "${outfitName.trim()}" saved!`, { icon: '💾' });
                            }}
                            style={{
                              padding: '6px 16px', borderRadius: '10px', cursor: 'pointer',
                              background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)',
                              color: '#2ecc71', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >💾 Save Outfit</motion.button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem' }}>Equip items to each slot. Equipping a new item automatically replaces the current one.</p>

                        {/* Saved Outfits Quick-Loader */}
                        {(() => {
                          const savedOutfits = JSON.parse(localStorage.getItem(`aura_outfits_${user?.email}`) || '[]');
                          if (savedOutfits.length === 0) return null;
                          return (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'center' }}>Saved:</span>
                              {savedOutfits.map((outfit, i) => (
                                <div key={i} style={{ display: 'flex', gap: '2px' }}>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => {
                                      setEquippedAvatar(outfit.slots || {});
                                      localStorage.setItem(`aura_equipped_${user.email}`, JSON.stringify(outfit.slots || {}));
                                      toast.success(`Loaded outfit "${outfit.name}"`, { icon: '👗' });
                                    }}
                                    style={{
                                      padding: '3px 10px', borderRadius: '8px 0 0 8px', cursor: 'pointer',
                                      background: 'rgba(138,43,226,0.1)', border: '1px solid rgba(138,43,226,0.2)',
                                      color: '#a29bfe', fontSize: '0.7rem', fontWeight: '600'
                                    }}
                                  >{outfit.name}</motion.button>
                                  <button
                                    onClick={() => {
                                      const updated = savedOutfits.filter((_, idx) => idx !== i);
                                      localStorage.setItem(`aura_outfits_${user.email}`, JSON.stringify(updated));
                                      toast(`Deleted outfit "${outfit.name}"`, { icon: '🗑️' });
                                      // Force re-render
                                      setEquippedAvatar(prev => ({ ...prev }));
                                    }}
                                    style={{
                                      padding: '3px 6px', borderRadius: '0 8px 8px 0', cursor: 'pointer',
                                      background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)',
                                      color: '#e74c3c', fontSize: '0.6rem'
                                    }}
                                  >✕</button>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        
                        {/* Avatar Figure + Slots Layout */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
                          
                          {/* Left Slots */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                            {[
                              { slot: 'headgear', label: 'Headgear', icon: '🎭' },
                              { slot: 'necklace', label: 'Necklace', icon: '📿' },
                              { slot: 'chest', label: 'Chest', icon: '🛡️' },
                              { slot: 'hands', label: 'Hands', icon: '🤲' },
                              { slot: 'rings', label: 'Rings', icon: '💍' },
                              { slot: 'tattoo', label: 'Tattoo', icon: '🎨' },
                            ].map(s => {
                              const item = equippedAvatar[s.slot];
                              return (
                                <motion.div key={s.slot} whileHover={{ scale: 1.05 }} style={{
                                  width: '110px', padding: '0.5rem', borderRadius: '12px', textAlign: 'center',
                                  background: item ? 'rgba(138,43,226,0.12)' : 'rgba(255,255,255,0.02)',
                                  border: `1px solid ${item ? 'rgba(138,43,226,0.35)' : 'rgba(255,255,255,0.05)'}`,
                                  cursor: item ? 'pointer' : 'default', transition: 'all 0.2s'
                                }}
                                onClick={() => item && unequipAvatarSlot(s.slot)}
                                title={item ? `Click to unequip ${item.name}` : `${s.label} — empty`}
                                >
                                  <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{s.label}</div>
                                  <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{item?.avatarEmoji || item?.icon || s.icon}</div>
                                  <div style={{ fontSize: '0.6rem', color: item ? '#a29bfe' : 'rgba(255,255,255,0.15)', fontWeight: '600', marginTop: '2px' }}>{item?.name || 'Empty'}</div>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Center — Full-Body Avatar Figure */}
                          <div style={{
                            position: 'relative', width: '260px', height: '480px',
                            borderRadius: '20px', overflow: 'hidden',
                            background: equippedAvatar.background?.avatarStyle?.background || 'linear-gradient(180deg, rgba(138,43,226,0.06) 0%, rgba(138,43,226,0.02) 100%)',
                            border: '1px solid rgba(138,43,226,0.15)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                          }}>
                                 <AvatarRenderer 
                                   equippedAvatar={equippedAvatar} 
                                   isSafeMode={prefs.isSafeMode}
                                   purchasedItems={purchasedItems}
                                 />
                                {/* Bottom overlay for name/level */}
                                <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
                                  <div style={{
                                    fontSize: '0.9rem', fontWeight: '700', color: '#fff', letterSpacing: '0.05em',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                                  }}>{user?.name || user?.username || 'Seeker'}</div>
                                  <div style={{
                                    fontSize: '0.6rem', color: 'var(--accent-gold)',
                                    fontWeight: '700', letterSpacing: '0.15em'
                                  }}>LVL {level}</div>
                                </div>
                          </div>

                          {/* Right Slots */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                            {[
                              { slot: 'frame', label: 'Frame', icon: '🖼️' },
                              { slot: 'badge', label: 'Badge', icon: '🏅' },
                              { slot: 'backbling', label: 'Back Bling', icon: '🪽' },
                              { slot: 'background', label: 'Background', icon: '🌌' },
                              { slot: 'aura', label: 'Aura', icon: '✨' },
                              { slot: 'legs', label: 'Legs', icon: '👖' },
                              { slot: 'feet', label: 'Feet', icon: '🥾' },
                            ].map(s => {
                              const item = equippedAvatar[s.slot];
                              return (
                                <motion.div key={s.slot} whileHover={{ scale: 1.05 }} style={{
                                  width: '110px', padding: '0.5rem', borderRadius: '12px', textAlign: 'center',
                                  background: item ? 'rgba(138,43,226,0.12)' : 'rgba(255,255,255,0.02)',
                                  border: `1px solid ${item ? 'rgba(138,43,226,0.35)' : 'rgba(255,255,255,0.05)'}`,
                                  cursor: item ? 'pointer' : 'default', transition: 'all 0.2s'
                                }}
                                onClick={() => item && unequipAvatarSlot(s.slot)}
                                title={item ? `Click to unequip ${item.name}` : `${s.label} — empty`}
                                >
                                  <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{s.label}</div>
                                  <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{item?.avatarEmoji || item?.icon || s.icon}</div>
                                  <div style={{ fontSize: '0.6rem', color: item ? '#a29bfe' : 'rgba(255,255,255,0.15)', fontWeight: '600', marginTop: '2px' }}>{item?.name || 'Empty'}</div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        {/* ── EQUIPPED vs INVENTORY ── */}
                        {(() => {
                          const archive = JSON.parse(localStorage.getItem(`aura_archive_${user?.email}`) || '[]');
                          const avatarItems = archive.filter(item => item.avatarSlot);
                          if (avatarItems.length === 0) return (
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', textAlign: 'center' }}>Purchase avatar items from the Gold Store to customize your look!</p>
                          );
                          const equippedIds = Object.values(equippedAvatar).filter(Boolean).map(i => i.id);
                          const equippedItems = avatarItems.filter(i => equippedIds.includes(i.id));
                          const inventoryItems = avatarItems.filter(i => !equippedIds.includes(i.id));

                          const renderItemCard = (item) => {
                            const isEquipped = equippedIds.includes(item.id);
                            return (
                              <motion.button key={item.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('aura_item', JSON.stringify(item));
                                }}
                                onClick={() => {
                                  if (isEquipped) {
                                    unequipAvatarSlot(item.avatarSlot);
                                    toast(`${item.name} unequipped.`, { icon: '🔄' });
                                  } else {
                                    equipAvatarItem(item);
                                    toast.success(`${item.name} equipped!`, { icon: '⚡' });
                                  }
                                }}
                                style={{
                                  padding: '8px 14px', borderRadius: '12px', cursor: 'pointer',
                                  background: isEquipped ? 'rgba(138,43,226,0.15)' : 'rgba(255,255,255,0.03)',
                                  border: `1px solid ${isEquipped ? 'rgba(138,43,226,0.4)' : 'rgba(255,255,255,0.06)'}`,
                                  color: isEquipped ? '#a29bfe' : 'rgba(255,255,255,0.5)',
                                  fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
                                  transition: 'all 0.2s', minWidth: '120px'
                                }}
                              >
                                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                <div style={{ textAlign: 'left' }}>
                                  <div>{item.name}</div>
                                  <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>{item.avatarSlot}</div>
                                </div>
                                {isEquipped && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#2ecc71' }}>✓</span>}
                              </motion.button>
                            );
                          };

                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                              {/* Equipped Panel */}
                              <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(138,43,226,0.04)', border: '1px solid rgba(138,43,226,0.12)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                                  <span style={{ fontSize: '0.9rem' }}>⚔️</span>
                                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a29bfe', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Equipped ({equippedItems.length})</span>
                                </div>
                                {equippedItems.length === 0 ? (
                                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Nothing equipped yet</p>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {equippedItems.map(renderItemCard)}
                                  </div>
                                )}
                              </div>
                              {/* Inventory Panel */}
                              <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(212,175,55,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                                  <span style={{ fontSize: '0.9rem' }}>🎒</span>
                                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inventory ({inventoryItems.length})</span>
                                </div>
                                {inventoryItems.length === 0 ? (
                                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>All items are equipped!</p>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {inventoryItems.map(renderItemCard)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                     {/* Account Info */}
                     <div className="glass" style={{ gridColumn: '1 / -1', padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                       <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent-gold)' }}>🆔 Account Information</h4>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                         <div>
                           <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem' }}>Account Number</div>
                           <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: '700' }}>{accountNumber}</div>
                         </div>
                         <div>
                           <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem' }}>Gold Balance</div>
                           <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-gold)' }}>🪙 {goldBalance}</div>
                         </div>
                         <div>
                           <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem' }}>Email</div>
                           <div style={{ fontSize: '0.85rem' }}>{user?.email}</div>
                         </div>
                         <div>
                           <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem' }}>Total Transactions</div>
                           <div style={{ fontSize: '0.85rem' }}>{JSON.parse(localStorage.getItem(`aura_transactions_${user?.email}`) || '[]').length}</div>
                         </div>
                         <div style={{ gridColumn: 'span 2', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div>
                             <div style={{ fontSize: '0.85rem', fontWeight: '700', color: prefs.isSafeMode ? '#2ecc71' : 'var(--accent-gold)' }}>Safe Mode (AI Guidelines)</div>
                             <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                               {prefs.isSafeMode 
                                 ? '🛡️ AI generator will only accept self-photos and purchased items.' 
                                 : '🔓 Unrestricted uploads for experimental generation.'}
                             </div>
                           </div>
                           <motion.button
                             whileHover={{ scale: 1.05 }}
                             whileTap={{ scale: 0.95 }}
                             onClick={() => togglePref('isSafeMode')}
                             style={{
                               padding: '8px 20px', borderRadius: '16px',
                               background: prefs.isSafeMode ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.05)',
                               border: `1px solid ${prefs.isSafeMode ? 'rgba(46,204,113,0.3)' : 'rgba(255,255,255,0.1)'}`,
                               color: prefs.isSafeMode ? '#2ecc71' : 'rgba(255,255,255,0.5)',
                               fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
                             }}
                           >
                             {prefs.isSafeMode ? '🛡️ Enabled' : 'Disabled'}
                           </motion.button>
                         </div>
                       </div>
                     </div>

                     {/* ─── Cancel / Pending Subscription (Healing tier only) ─── */}
                     {user?.subscription === 'healing' && (
                       <div className="glass" style={{ gridColumn: '1 / -1', padding: '2rem', borderRadius: '24px', background: user?.cancellationDate ? 'rgba(231,76,60,0.05)' : 'rgba(243,156,18,0.05)', border: `1px solid ${user?.cancellationDate ? 'rgba(231,76,60,0.2)' : 'rgba(243,156,18,0.2)'}` }}>
                         {user?.cancellationDate ? (
                           /* Cancellation already pending — show status */
                           <>
                             <h4 style={{ margin: '0 0 0.5rem 0', color: '#e74c3c' }}>🔔 Cancellation Pending</h4>
                             <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                               Your subscription was cancelled on <strong style={{ color: '#fff' }}>{new Date(user.cancellationDate).toLocaleDateString()}</strong>.
                             </p>
                             <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
                               You retain full Healing-tier access until <strong style={{ color: 'var(--accent-gold)' }}>{new Date(user.subscriptionEndDate).toLocaleDateString()}</strong>. After this date, your account will revert to Seeker tier.
                             </p>
                             <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.15)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                               ⏳ {Math.max(0, Math.ceil((new Date(user.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))} days remaining
                             </div>
                           </>
                         ) : (
                           /* No cancellation yet — show cancel button */
                           <>
                             <h4 style={{ margin: '0 0 0.5rem 0', color: '#f39c12' }}>⚠️ Cancel Subscription</h4>
                             <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
                               Your paid month will remain active until its end date. After that, your account reverts to Seeker tier — losing dashboard, community, and advanced protocol access. Your progress is preserved.
                             </p>
                             <button
                               className="btn"
                               onClick={() => {
                                 if (!window.confirm('Are you sure you want to cancel your Healing subscription? You will keep access until your paid month ends, then revert to Seeker.')) return;

                                 // Calculate subscription end date (30 days from signup, or 30 days from now if no signup date)
                                 const signupDate = user.createdAt ? new Date(user.createdAt) : new Date();
                                 const now = new Date();
                                 // Find the next billing cycle end (30-day periods from signup)
                                 let endDate = new Date(signupDate);
                                 while (endDate <= now) {
                                   endDate.setDate(endDate.getDate() + 30);
                                 }

                                 const cancellationDate = now.toISOString();
                                 const subscriptionEndDate = endDate.toISOString();

                                 const updated = {
                                   ...user,
                                   cancellationDate,
                                   subscriptionEndDate
                                 };
                                 onUpdateUser(updated);

                                 // Log cancellation transaction via GoldButler for admin dashboard
                                 GoldButler.logTransaction(user.email, {
                                   type: 'subscription_cancellation',
                                   amount: 0,
                                   balance: GoldButler.getGoldBalance(user.email),
                                   accountNumber: GoldButler.getOrCreateAccountNumber(user.email),
                                   description: `Subscription cancelled. Active until ${new Date(subscriptionEndDate).toLocaleDateString()}. User: ${user.name} (${user.email})`
                                 });

                                 toast.success(`Subscription cancelled. You keep Healing access until ${new Date(subscriptionEndDate).toLocaleDateString()}.`);

                                 // Also dispatch to ActionButler for unified activity feed
                                 ActionButler.logSubscriptionCancel(user.email, new Date(subscriptionEndDate).toLocaleDateString(), user.name || user.email);
                               }}
                               style={{
                                 background: 'rgba(243,156,18,0.1)',
                                 border: '1px solid #f39c12',
                                 color: '#f39c12',
                                 cursor: 'pointer',
                                 fontWeight: '600'
                               }}
                             >
                               CANCEL MY SUBSCRIPTION
                             </button>
                           </>
                         )}
                       </div>
                     )}

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
                    title: "Avatar Customization",
                    desc: "Visit the 'My Avatar' tab to customize your appearance. Build your digital avatar, upload a photo, equip frames and badges from the Gold Store, and choose a title that reflects your rank."
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

      {/* Buy More Gold Modal */}
      <AnimatePresence>
        {showBuyGold && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 20001, background: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => setShowBuyGold(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass"
              style={{
                width: '600px', maxWidth: '95%', padding: '3rem',
                borderRadius: '32px', background: 'rgba(20,20,30,0.95)',
                border: '1px solid rgba(212,175,55,0.2)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🪙</div>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', fontFamily: "'Playfair Display', serif" }}>Acquire Sanctuary Gold</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Current balance: {goldBalance} Gold</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { amount: 100, price: '$0.99', bonus: '', popular: false },
                  { amount: 500, price: '$3.99', bonus: '+50 BONUS', popular: true },
                  { amount: 1200, price: '$7.99', bonus: '+200 BONUS', popular: false },
                  { amount: 3000, price: '$14.99', bonus: '+500 BONUS', popular: false }
                ].map(pkg => (
                  <motion.div
                    key={pkg.amount}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const bonusAmount = parseInt(pkg.bonus.replace(/\D/g, '')) || 0;
                      addGold(pkg.amount + bonusAmount, `Purchased ${pkg.price} Gold Pack`);
                      setShowBuyGold(false);
                    }}
                    style={{
                      padding: '1.5rem', borderRadius: '20px', cursor: 'pointer',
                      background: pkg.popular ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${pkg.popular ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}`,
                      textAlign: 'center', position: 'relative'
                    }}
                  >
                    {pkg.popular && (
                      <div style={{
                        position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--accent-gold)', color: '#000', padding: '2px 12px',
                        borderRadius: '10px', fontSize: '0.6rem', fontWeight: '800', letterSpacing: '1px'
                      }}>BEST VALUE</div>
                    )}
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>{pkg.amount.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Gold</div>
                    {pkg.bonus && <div style={{ fontSize: '0.7rem', color: '#2ecc71', fontWeight: '600', margin: '0.25rem 0' }}>{pkg.bonus}</div>}
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginTop: '0.5rem' }}>{pkg.price}</div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setShowBuyGold(false)}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem'
                }}
              >Maybe Later</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  </>
);
};

export default UserDashboard;
