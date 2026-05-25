/**
 * Gamification Engine — Reiki & Sage Healing Sanctuary
 * 
 * Central system for badges, XP, levels, and achievement tracking.
 * Data persists to localStorage (instant) + Firestore (cross-device sync).
 * All features are subscriber-gated (Healing tier only).
 */

// ═══════════════════════════════════════════
// BADGE DEFINITIONS
// ═══════════════════════════════════════════

export const BADGE_CATEGORIES = {
  SESSION: { label: 'Session Milestones', icon: '🔮', color: '#8e44ad' },
  STREAK: { label: 'Streak Achievements', icon: '🔥', color: '#e17055' },
  CRYSTAL: { label: 'Crystal Mastery', icon: '💎', color: '#00cec9' },
  EXPLORATION: { label: 'Exploration', icon: '🌙', color: '#6c5ce7' },
  SPECIAL: { label: 'Special & Hidden', icon: '⭐', color: '#d4af37' },
  DAILY: { label: 'Daily Dedication', icon: '☀️', color: '#fdcb6e' }
};

export const BADGES = [
  // ── Session Milestones ──
  { id: 'first_light',      name: 'First Light',        category: 'SESSION', icon: '✨', threshold: 1,   xp: 50,   desc: 'Complete your first healing protocol.' },
  { id: 'seeker',            name: 'Seeker',             category: 'SESSION', icon: '🔮', threshold: 3,   xp: 100,  desc: 'Complete 3 healing protocols.' },
  { id: 'adept',             name: 'Adept',              category: 'SESSION', icon: '⚡', threshold: 5,   xp: 150,  desc: 'Complete 5 healing protocols.' },
  { id: 'master_healer',     name: 'Master Healer',      category: 'SESSION', icon: '👑', threshold: 10,  xp: 300,  desc: 'Complete 10 healing protocols.' },
  { id: 'sage_elder',        name: 'Sage Elder',         category: 'SESSION', icon: '🌿', threshold: 25,  xp: 500,  desc: 'Complete 25 healing protocols.' },
  { id: 'ascended_one',      name: 'Ascended One',       category: 'SESSION', icon: '🕊️', threshold: 50,  xp: 1000, desc: 'Complete 50 healing protocols.' },
  { id: 'cosmic_architect',  name: 'Cosmic Architect',   category: 'SESSION', icon: '🌌', threshold: 100, xp: 2500, desc: 'Complete 100 healing protocols.' },

  // ── Streak Achievements ──
  { id: 'ember_keeper',   name: 'Ember Keeper',    category: 'STREAK', icon: '🕯️', threshold: 3,  xp: 75,   desc: 'Maintain a 3-day healing streak.' },
  { id: 'flame_walker',   name: 'Flame Walker',    category: 'STREAK', icon: '🔥', threshold: 7,  xp: 200,  desc: 'Maintain a 7-day healing streak.' },
  { id: 'inferno_soul',   name: 'Inferno Soul',    category: 'STREAK', icon: '💥', threshold: 14, xp: 400,  desc: 'Maintain a 14-day healing streak.' },
  { id: 'eternal_flame',  name: 'Eternal Flame',   category: 'STREAK', icon: '🌋', threshold: 30, xp: 1000, desc: 'Maintain a 30-day healing streak.' },
  { id: 'phoenix_reborn', name: 'Phoenix Reborn',  category: 'STREAK', icon: '🦅', threshold: 60, xp: 2000, desc: 'Maintain a 60-day healing streak.' },

  // ── Crystal Mastery ──
  { id: 'amethyst_initiate', name: 'Amethyst Initiate', category: 'CRYSTAL', icon: '💜', threshold: 3, protocol: 'amethyst', xp: 150, desc: 'Complete 3 Amethyst Core Purge sessions.' },
  { id: 'rose_heart',        name: 'Rose Heart',        category: 'CRYSTAL', icon: '💗', threshold: 3, protocol: 'rose',     xp: 150, desc: 'Complete 3 Rose Quartz Heart-Sync sessions.' },
  { id: 'quartz_mind',       name: 'Quartz Mind',       category: 'CRYSTAL', icon: '💠', threshold: 3, protocol: 'quartz',   xp: 150, desc: 'Complete 3 Quartz Lattice Uplift sessions.' },
  { id: 'sage_spirit',       name: 'Sage Spirit',       category: 'CRYSTAL', icon: '🍃', threshold: 3, protocol: 'sage',     xp: 150, desc: 'Complete 3 Sage Purification sessions.' },
  { id: 'lapis_oracle',      name: 'Lapis Oracle',      category: 'CRYSTAL', icon: '🔵', threshold: 3, protocol: 'lapis',    xp: 150, desc: 'Complete 3 Lapis Wisdom Resonance sessions.' },
  { id: 'citrine_alchemist', name: 'Citrine Alchemist', category: 'CRYSTAL', icon: '🟡', threshold: 3, protocol: 'citrine',  xp: 150, desc: 'Complete 3 Citrine Manifestation sessions.' },
  { id: 'crystal_collector', name: 'Crystal Collector',  category: 'CRYSTAL', icon: '💎', threshold: 8, xp: 500, desc: 'Complete at least 1 session with ALL 8 protocols.' },

  // ── Exploration ──
  { id: 'night_owl',      name: 'Night Owl',       category: 'EXPLORATION', icon: '🦉', xp: 75,  desc: 'Complete a session after 10 PM.' },
  { id: 'dawn_seeker',    name: 'Dawn Seeker',     category: 'EXPLORATION', icon: '🌅', xp: 75,  desc: 'Complete a session before 6 AM.' },
  { id: 'story_teller',   name: 'Story Teller',    category: 'EXPLORATION', icon: '📖', xp: 100, desc: 'Submit a community reflection.' },
  { id: 'aura_consulter', name: 'Aura Consulter',  category: 'EXPLORATION', icon: '🤖', xp: 50,  desc: 'Consult the Aura Guide AI assistant.' },

  // ── Special & Hidden ──
  { id: 'founding_member',   name: 'Founding Member',   category: 'SPECIAL', icon: '🏛️', xp: 500,  desc: 'Created your account in the founding year.', hidden: true },
  { id: 'frequency_master',  name: 'Frequency Master',  category: 'SPECIAL', icon: '📡', xp: 300,  desc: 'Accumulate 500+ total Hz gain.', hidden: true },
  { id: 'sacred_geometry',   name: 'Sacred Geometry',   category: 'SPECIAL', icon: '✡️', xp: 1000, desc: 'Complete 7 sessions in 7 days using all unique protocols.', hidden: true },
  { id: 'weekend_warrior',   name: 'Weekend Warrior',   category: 'SPECIAL', icon: '⚔️', xp: 150,  desc: 'Complete sessions on both Saturday and Sunday.', hidden: true },

  // ── Daily Dedication ──
  { id: 'early_bird',      name: 'Early Bird',      category: 'DAILY', icon: '🐦', xp: 50,  desc: 'Complete your first daily challenge.' },
  { id: 'triple_threat',   name: 'Triple Threat',   category: 'DAILY', icon: '🎯', xp: 200, desc: 'Complete all 3 daily challenges in one day.' },
  { id: 'weekly_devotion',  name: 'Weekly Devotion', category: 'DAILY', icon: '🙏', xp: 300, desc: 'Complete daily challenges 7 days in a row.' },
];

// ═══════════════════════════════════════════
// LEVEL SYSTEM
// ═══════════════════════════════════════════

export const LEVELS = [
  { level: 1,  name: 'Spark',         xpRequired: 0,     color: '#a0a0a0' },
  { level: 2,  name: 'Ember',         xpRequired: 200,   color: '#e17055' },
  { level: 3,  name: 'Flame',         xpRequired: 500,   color: '#f39c12' },
  { level: 4,  name: 'Radiance',      xpRequired: 1000,  color: '#fdcb6e' },
  { level: 5,  name: 'Aurora',        xpRequired: 2000,  color: '#00cec9' },
  { level: 6,  name: 'Celestial',     xpRequired: 3500,  color: '#6c5ce7' },
  { level: 7,  name: 'Transcendent',  xpRequired: 5500,  color: '#a29bfe' },
  { level: 8,  name: 'Ascended',      xpRequired: 8000,  color: '#d4af37' },
  { level: 9,  name: 'Cosmic',        xpRequired: 12000, color: '#fd79a8' },
  { level: 10, name: 'Infinite',      xpRequired: 20000, color: '#ffeaa7' },
];

// ═══════════════════════════════════════════
// DAILY CHALLENGES
// ═══════════════════════════════════════════

const CHALLENGE_POOL = [
  { id: 'any_protocol',       text: 'Complete any healing protocol',              xp: 50,  check: (s) => s.sessionsToday >= 1 },
  { id: 'new_protocol',       text: 'Try a protocol you haven\'t used before',   xp: 100, check: (s) => s.triedNewProtocol },
  { id: 'write_note',         text: 'Write an observation in your Bio-Archive',   xp: 50,  check: (s) => s.wroteNote },
  { id: 'set_intention',      text: 'Set a new Resonance Focal Point',           xp: 25,  check: (s) => s.changedIntention },
  { id: 'two_protocols',      text: 'Complete 2 protocols in one day',            xp: 150, check: (s) => s.sessionsToday >= 2 },
  { id: 'maintain_streak',    text: 'Maintain your healing streak',               xp: 75,  check: (s) => s.streakMaintained },
  { id: 'morning_session',    text: 'Complete a session before 9 AM',             xp: 100, check: (s) => s.morningSession },
  { id: 'consult_aura',       text: 'Consult the Aura Guide',                    xp: 50,  check: (s) => s.consultedAura },
  { id: 'evening_calm',       text: 'Complete a session after 8 PM',              xp: 75,  check: (s) => s.eveningSession },
  { id: 'specific_sage',      text: 'Complete the Sage Purification protocol',    xp: 75,  check: (s) => s.completedProtocol === 'sage' },
  { id: 'specific_amethyst',  text: 'Complete the Amethyst Core Purge',           xp: 75,  check: (s) => s.completedProtocol === 'amethyst' },
  { id: 'specific_rose',      text: 'Complete the Rose Quartz Heart-Sync',        xp: 75,  check: (s) => s.completedProtocol === 'rose' },
];

// ═══════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════

const STORAGE_KEY = 'aura_gamification';

/**
 * Default gamification state for new users
 */
const getDefaultState = () => ({
  xp: 0,
  earnedBadges: [],         // Array of badge IDs
  protocolCounts: {},       // { amethyst: 3, rose: 1, ... }
  totalSessions: 0,
  totalHzGain: 0,
  longestStreak: 0,
  currentStreak: 0,
  dailyChallenges: null,    // { date: '2026-05-25', challenges: [...], completed: [] }
  dailyChallengeStreak: 0,
  explorationFlags: {},     // { night_owl: true, dawn_seeker: true, ... }
  weekendSessions: {},      // { 'sat_2026-05-24': true, 'sun_2026-05-25': true }
  createdAt: new Date().toISOString(),
  lastSessionDate: null,
  lastUpdated: new Date().toISOString()
});

/**
 * Load gamification state from localStorage
 */
export const loadGamificationState = (userEmail) => {
  try {
    const key = `${STORAGE_KEY}_${userEmail}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...getDefaultState(), ...parsed };
    }
  } catch (e) {
    console.error('Failed to load gamification state:', e);
  }
  return getDefaultState();
};

/**
 * Save gamification state to localStorage
 */
export const saveGamificationState = (userEmail, state) => {
  try {
    const key = `${STORAGE_KEY}_${userEmail}`;
    localStorage.setItem(key, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Failed to save gamification state:', e);
  }
};

/**
 * Sync gamification state to Firestore (if available)
 */
export const syncToFirestore = async (db, userId, state) => {
  if (!db || !userId) return;
  try {
    await db.updateProfile(userId, {
      gamification: {
        xp: state.xp,
        earnedBadges: state.earnedBadges,
        protocolCounts: state.protocolCounts,
        totalSessions: state.totalSessions,
        totalHzGain: state.totalHzGain,
        longestStreak: state.longestStreak,
        dailyChallengeStreak: state.dailyChallengeStreak,
        createdAt: state.createdAt,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (e) {
    console.error('Failed to sync gamification to Firestore:', e);
  }
};

// ═══════════════════════════════════════════
// CORE CALCULATIONS
// ═══════════════════════════════════════════

/**
 * Get the current level based on XP
 */
export const getLevel = (xp) => {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};

/**
 * Get XP progress toward the next level (0-100%)
 */
export const getLevelProgress = (xp) => {
  const current = getLevel(xp);
  const nextIdx = LEVELS.findIndex(l => l.level === current.level) + 1;
  if (nextIdx >= LEVELS.length) return 100; // Max level
  const next = LEVELS[nextIdx];
  const range = next.xpRequired - current.xpRequired;
  const progress = xp - current.xpRequired;
  return Math.min(100, Math.round((progress / range) * 100));
};

/**
 * Get the next level info
 */
export const getNextLevel = (xp) => {
  const current = getLevel(xp);
  const nextIdx = LEVELS.findIndex(l => l.level === current.level) + 1;
  return nextIdx < LEVELS.length ? LEVELS[nextIdx] : null;
};

/**
 * Check which badges are earned based on current state
 * Returns { allEarned: [...], newlyEarned: [...] }
 */
export const evaluateBadges = (state) => {
  const earned = [];
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay(); // 0=Sun, 6=Sat

  for (const badge of BADGES) {
    let isEarned = false;

    switch (badge.category) {
      case 'SESSION':
        isEarned = state.totalSessions >= badge.threshold;
        break;

      case 'STREAK':
        isEarned = state.longestStreak >= badge.threshold;
        break;

      case 'CRYSTAL':
        if (badge.id === 'crystal_collector') {
          // Must have tried all 8 protocols at least once
          const allProtocols = ['amethyst', 'quartz', 'rose', 'lapis', 'citrine', 'sage', 'reiki', 'celestial'];
          isEarned = allProtocols.every(p => (state.protocolCounts[p] || 0) >= 1);
        } else if (badge.protocol) {
          isEarned = (state.protocolCounts[badge.protocol] || 0) >= badge.threshold;
        }
        break;

      case 'EXPLORATION':
        if (badge.id === 'night_owl') isEarned = !!state.explorationFlags.night_owl;
        else if (badge.id === 'dawn_seeker') isEarned = !!state.explorationFlags.dawn_seeker;
        else if (badge.id === 'story_teller') isEarned = !!state.explorationFlags.story_teller;
        else if (badge.id === 'aura_consulter') isEarned = !!state.explorationFlags.aura_consulter;
        break;

      case 'SPECIAL':
        if (badge.id === 'founding_member') {
          const year = new Date(state.createdAt).getFullYear();
          isEarned = year <= 2026;
        } else if (badge.id === 'frequency_master') {
          isEarned = state.totalHzGain >= 500;
        } else if (badge.id === 'sacred_geometry') {
          isEarned = !!state.explorationFlags.sacred_geometry;
        } else if (badge.id === 'weekend_warrior') {
          isEarned = !!state.explorationFlags.weekend_warrior;
        }
        break;

      case 'DAILY':
        if (badge.id === 'early_bird') isEarned = !!state.explorationFlags.early_bird_challenge;
        else if (badge.id === 'triple_threat') isEarned = !!state.explorationFlags.triple_threat;
        else if (badge.id === 'weekly_devotion') isEarned = state.dailyChallengeStreak >= 7;
        break;

      default:
        break;
    }

    if (isEarned) earned.push(badge.id);
  }

  // Find newly earned badges
  const newlyEarned = earned.filter(id => !state.earnedBadges.includes(id));

  return { allEarned: earned, newlyEarned };
};

/**
 * Process a completed healing session
 * Returns { updatedState, newBadges, leveledUp, xpGained }
 */
export const processSessionComplete = (state, protocolId, hzGain) => {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  const today = new Date().toDateString();

  // Update counters
  const updatedState = {
    ...state,
    totalSessions: state.totalSessions + 1,
    protocolCounts: {
      ...state.protocolCounts,
      [protocolId]: (state.protocolCounts[protocolId] || 0) + 1
    },
    totalHzGain: state.totalHzGain + parseFloat(hzGain || 0),
    lastSessionDate: today
  };

  // Set exploration flags
  if (hour >= 22 || hour < 4) updatedState.explorationFlags = { ...updatedState.explorationFlags, night_owl: true };
  if (hour < 6) updatedState.explorationFlags = { ...updatedState.explorationFlags, dawn_seeker: true };
  
  // Weekend warrior tracking
  if (dayOfWeek === 0) { // Sunday
    const weekKey = `sun_${today}`;
    updatedState.weekendSessions = { ...updatedState.weekendSessions, [weekKey]: true };
  }
  if (dayOfWeek === 6) { // Saturday
    const weekKey = `sat_${today}`;
    updatedState.weekendSessions = { ...updatedState.weekendSessions, [weekKey]: true };
    // Check if they also did Sunday this weekend
    const sunday = new Date();
    sunday.setDate(sunday.getDate() + 1);
    if (updatedState.weekendSessions[`sun_${sunday.toDateString()}`]) {
      updatedState.explorationFlags = { ...updatedState.explorationFlags, weekend_warrior: true };
    }
    // Or check last Sunday
    const lastSunday = new Date();
    lastSunday.setDate(lastSunday.getDate() - (dayOfWeek || 7));
    if (updatedState.weekendSessions[`sun_${lastSunday.toDateString()}`]) {
      updatedState.explorationFlags = { ...updatedState.explorationFlags, weekend_warrior: true };
    }
  }

  // Evaluate badges
  const prevLevel = getLevel(state.xp);
  const { allEarned, newlyEarned } = evaluateBadges(updatedState);
  
  // Calculate XP gained from new badges
  let xpGained = 10; // Base XP per session
  for (const badgeId of newlyEarned) {
    const badge = BADGES.find(b => b.id === badgeId);
    if (badge) xpGained += badge.xp;
  }

  updatedState.xp = state.xp + xpGained;
  updatedState.earnedBadges = allEarned;

  const newLevel = getLevel(updatedState.xp);
  const leveledUp = newLevel.level > prevLevel.level;

  return {
    updatedState,
    newBadges: newlyEarned.map(id => BADGES.find(b => b.id === id)),
    leveledUp,
    newLevel: leveledUp ? newLevel : null,
    xpGained
  };
};

// ═══════════════════════════════════════════
// DAILY CHALLENGES
// ═══════════════════════════════════════════

/**
 * Get or generate today's daily challenges
 */
export const getDailyChallenges = (state) => {
  const today = new Date().toDateString();

  // Return existing if already generated today
  if (state.dailyChallenges?.date === today) {
    return state.dailyChallenges;
  }

  // Generate 3 random challenges using date as seed for consistency
  const seed = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const shuffled = [...CHALLENGE_POOL].sort((a, b) => {
    const hashA = simpleHash(seed + a.id);
    const hashB = simpleHash(seed + b.id);
    return hashA - hashB;
  });

  return {
    date: today,
    challenges: shuffled.slice(0, 3),
    completed: []
  };
};

/**
 * Simple hash for deterministic daily challenge selection
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

/**
 * Mark a daily challenge as completed
 */
export const completeDailyChallenge = (state, challengeId) => {
  if (!state.dailyChallenges) return state;
  if (state.dailyChallenges.completed.includes(challengeId)) return state;

  const updated = {
    ...state,
    dailyChallenges: {
      ...state.dailyChallenges,
      completed: [...state.dailyChallenges.completed, challengeId]
    }
  };

  // Award XP for the challenge
  const challenge = CHALLENGE_POOL.find(c => c.id === challengeId);
  if (challenge) {
    updated.xp = state.xp + challenge.xp;
  }

  // Check if all 3 completed → triple threat badge + bonus XP
  if (updated.dailyChallenges.completed.length >= 3) {
    updated.explorationFlags = { ...updated.explorationFlags, triple_threat: true };
    updated.xp += 50; // Bonus for completing all 3
  }

  // First challenge ever badge
  if (!state.explorationFlags.early_bird_challenge) {
    updated.explorationFlags = { ...updated.explorationFlags, early_bird_challenge: true };
  }

  return updated;
};

// ═══════════════════════════════════════════
// STATS HELPERS
// ═══════════════════════════════════════════

/**
 * Get summary stats for display
 */
export const getStats = (state) => {
  const totalBadges = BADGES.filter(b => !b.hidden).length;
  const earnedVisible = state.earnedBadges.filter(id => {
    const badge = BADGES.find(b => b.id === id);
    return badge && !badge.hidden;
  }).length;
  const earnedHidden = state.earnedBadges.filter(id => {
    const badge = BADGES.find(b => b.id === id);
    return badge && badge.hidden;
  }).length;

  return {
    totalBadges,
    earnedBadges: state.earnedBadges.length,
    earnedVisible,
    earnedHidden,
    completionPercent: Math.round((state.earnedBadges.length / BADGES.length) * 100),
    level: getLevel(state.xp),
    nextLevel: getNextLevel(state.xp),
    levelProgress: getLevelProgress(state.xp),
    totalSessions: state.totalSessions,
    totalHzGain: Math.round(state.totalHzGain),
    favoriteProtocol: getFavoriteProtocol(state.protocolCounts)
  };
};

/**
 * Get the most-used protocol
 */
const getFavoriteProtocol = (counts) => {
  if (!counts || Object.keys(counts).length === 0) return null;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return { id: sorted[0][0], count: sorted[0][1] };
};

/**
 * Get badge info by ID
 */
export const getBadgeById = (id) => BADGES.find(b => b.id === id) || null;

/**
 * Get all badges grouped by category
 */
export const getBadgesByCategory = (earnedIds = []) => {
  const grouped = {};
  for (const [key, meta] of Object.entries(BADGE_CATEGORIES)) {
    grouped[key] = {
      ...meta,
      badges: BADGES.filter(b => b.category === key).map(b => ({
        ...b,
        earned: earnedIds.includes(b.id)
      }))
    };
  }
  return grouped;
};
