import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gamepad2, Award, Zap, Shield, Gift, Disc, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ChakraRunnerGame from './ChakraRunnerGame';
import './SacredRealmEngine.css';

const CHAKRA_REALMS = [
  { level: 1, name: 'Root Citadel', realm: 'Muladhara', color: '#ff4757', icon: '🔴', reward: 'Title: Grounded Soul' },
  { level: 5, name: 'Sacral Oasis', realm: 'Svadhisthana', color: '#ffa502', icon: '🟠', reward: 'Pet: Jade Sprite' },
  { level: 10, name: 'Solar Forge', realm: 'Manipura', color: '#eccc68', icon: '🟡', reward: 'Aura: Solar Flare' },
  { level: 15, name: 'Heart Emerald', realm: 'Anahata', color: '#2ed573', icon: '🟢', reward: 'Title: Heart Weaver' },
  { level: 25, name: 'Throat Spire', realm: 'Vishuddha', color: '#1e90ff', icon: '🔵', reward: 'Pet: Sapphire Phoenix' },
  { level: 35, name: 'Third Eye', realm: 'Ajna', color: '#3742fa', icon: '🟣', reward: 'Aura: Amethyst Ring' },
  { level: 50, name: 'Crown Cosmos', realm: 'Sahasrara', color: '#70a1ff', icon: '👑', reward: 'Master: Cosmic Supernova' }
];

const SPIRIT_COMPANIONS = [
  { id: 'sprite', name: 'Emerald Jade Sprite', rarity: 'RARE', color: '#2ed573', icon: '🐉', bonus: '+5% Daily XP Boost', price: 200 },
  { id: 'phoenix', name: 'Sapphire Phoenix', rarity: 'EPIC', color: '#1e90ff', icon: '🦅', bonus: '+10% Sound Bath XP', price: 500 },
  { id: 'dragon', name: 'Amethyst Dragon', rarity: 'LEGENDARY', color: '#a55eea', icon: '🐲', bonus: '+20% Streak Shield Chance', price: 1000 },
  { id: 'supernova', name: 'Solar Gold Supernova', rarity: 'MYTHIC', color: '#ffa502', icon: '🌟', bonus: '2x Daily Spin Rewards', price: 2500 }
];

const SacredRealmEngine = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'wheel' | 'gacha' | 'quests'
  const [showGame, setShowGame] = useState(false);
  const [userXp, setUserXp] = useState(() => parseInt(localStorage.getItem('sacred_user_xp') || '450'));
  const [crystals, setCrystals] = useState(() => parseInt(localStorage.getItem('sacred_crystals') || '350'));
  const [streakShields, setStreakShields] = useState(() => parseInt(localStorage.getItem('sacred_shields') || '1'));
  const [equippedPet, setEquippedPet] = useState(() => localStorage.getItem('sacred_equipped_pet') || 'sprite');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const userLevel = Math.floor(userXp / 500) + 1;
  const xpToNextLevel = 500 - (userXp % 500);

  const addXp = (amount) => {
    const next = userXp + amount;
    setUserXp(next);
    localStorage.setItem('sacred_user_xp', next.toString());
    toast.success(`✨ +${amount} XP Earned!`);
  };

  const spinDailyWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const randomDegrees = 1440 + Math.floor(Math.random() * 360);
    setWheelRotation(randomDegrees);

    setTimeout(() => {
      setIsSpinning(false);
      const prizeChoice = Math.random();
      if (prizeChoice > 0.7) {
        addXp(500);
        toast.success('🎉 WHEEL REWARD: +500 Bonus XP!');
      } else if (prizeChoice > 0.4) {
        const nextCrystals = crystals + 150;
        setCrystals(nextCrystals);
        localStorage.setItem('sacred_crystals', nextCrystals.toString());
        toast.success('💎 WHEEL REWARD: +150 Solfeggio Crystals!');
      } else {
        const nextShields = streakShields + 1;
        setStreakShields(nextShields);
        localStorage.setItem('sacred_shields', nextShields.toString());
        toast.success('🛡️ WHEEL REWARD: +1 Streak Shield!');
      }
    }, 3000);
  };

  const buyCompanion = (comp) => {
    if (crystals < comp.price) {
      toast.error(`Need ${comp.price - crystals} more Solfeggio Crystals!`);
      return;
    }
    const nextCrystals = crystals - comp.price;
    setCrystals(nextCrystals);
    setEquippedPet(comp.id);
    localStorage.setItem('sacred_crystals', nextCrystals.toString());
    localStorage.setItem('sacred_equipped_pet', comp.id);
    toast.success(`✨ Summoned and Equipped ${comp.name}!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10030,
        background: 'rgba(5, 5, 15, 0.92)',
        backdropFilter: 'blur(25px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* Minigame Modal Overlay */}
      {showGame && (
        <ChakraRunnerGame
          onClose={() => setShowGame(false)}
          onAddXp={(amount) => {
            addXp(amount);
            const nextCrystals = crystals + Math.floor(amount / 2);
            setCrystals(nextCrystals);
            localStorage.setItem('sacred_crystals', nextCrystals.toString());
          }}
        />
      )}

      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          background: 'rgba(12, 14, 28, 0.96)',
          border: '2px solid var(--accent-gold)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
          color: '#fff',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div style={{
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌌</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                ✦ AAA Sacred Energy Engine ✦
              </div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', margin: 0, color: '#fff' }}>
                7-Chakra Realm &amp; Companions
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--accent-gold)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
              💎 {crystals} Crystals
            </div>
            <div style={{ background: 'rgba(80, 227, 194, 0.15)', border: '1px solid #50e3c2', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold', color: '#50e3c2' }}>
              🛡️ {streakShields} Shields
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Level XP Progress Widget */}
        <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>LEVEL</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{userLevel}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span>Chakra Alignment Level {userLevel}</span>
              <span style={{ color: 'var(--accent-gold)' }}>{userXp % 500} / 500 XP ({xpToNextLevel} to Lvl {userLevel + 1})</span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((userXp % 500) / 500) * 100}%` }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #50e3c2, var(--accent-gold))' }}
              />
            </div>
          </div>
          <button
            onClick={() => setShowGame(true)}
            className="btn-primary"
            style={{ padding: '0.6rem 1.25rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Gamepad2 size={16} /> Play Energy Runner
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
          {[
            { id: 'map', label: '🌌 7-Chakra Realm Map' },
            { id: 'wheel', label: '🎡 Daily Alignment Wheel' },
            { id: 'gacha', label: '🎴 Spirit Companions' },
            { id: 'quests', label: '🎯 Daily Quests' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                border: activeTab === tab.id ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                background: activeTab === tab.id ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.7)',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {/* TAB 1: 7-CHAKRA REALM MAP */}
          {activeTab === 'map' && (
            <div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                7-Chakra World Battle Pass Progression
              </h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                Complete daily sound baths, biofield scans, and minigame runs to unlock sacred titles and particle aura trails.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {CHAKRA_REALMS.map(r => {
                  const unlocked = userLevel >= r.level;
                  return (
                    <div
                      key={r.level}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '16px',
                        background: unlocked ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.3)',
                        border: unlocked ? `2px solid ${r.color}` : '1px solid rgba(255,255,255,0.1)',
                        opacity: unlocked ? 1 : 0.5,
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem' }}>{r.icon}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: r.color, background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '10px' }}>
                          Lvl {r.level}+
                        </span>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: r.color }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{r.realm} Realm</div>
                      <div style={{ fontSize: '0.78rem', marginTop: '0.75rem', color: '#50e3c2', fontWeight: 'bold' }}>
                        🎁 {r.reward}
                      </div>
                      {!unlocked && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                          <Lock size={14} color="rgba(255,255,255,0.5)" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DAILY ALIGNMENT WHEEL */}
          {activeTab === 'wheel' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--accent-gold)', marginBottom: '0.3rem' }}>
                Daily Wheel of Alignment
              </h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: '2rem' }}>
                Spin once every 24 hours to claim free Solfeggio Crystals, XP boosts, and Streak Shields!
              </p>

              <div style={{ position: 'relative', width: '220px', margin: '0 auto 1.5rem auto' }}>
                <motion.div
                  animate={{ rotate: wheelRotation }}
                  transition={{ duration: 3, ease: 'easeOut' }}
                  style={{
                    width: '220px',
                    height: '220px',
                    borderRadius: '50%',
                    border: '4px solid var(--accent-gold)',
                    background: 'conic-gradient(#ff4757 0deg 90deg, #2ed573 90deg 180deg, #1e90ff 180deg 270deg, #ffa502 270deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 40px rgba(212, 175, 55, 0.4)'
                  }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#0c0e1c', border: '2px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.5rem' }}>
                    🔮
                  </div>
                </motion.div>
              </div>

              <button
                onClick={spinDailyWheel}
                disabled={isSpinning}
                className="btn-primary"
                style={{ padding: '0.85rem 3rem', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold' }}
              >
                {isSpinning ? 'Resonating Wheel...' : 'Spin Daily Wheel'}
              </button>
            </div>
          )}

          {/* TAB 3: SPIRIT COMPANIONS GACHA */}
          {activeTab === 'gacha' && (
            <div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                Sacred Spirit Companions Locker
              </h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                Summon elemental spirit pets to accompany your profile and grant passive XP multipliers!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {SPIRIT_COMPANIONS.map(comp => {
                  const isEquipped = equippedPet === comp.id;
                  return (
                    <div
                      key={comp.id}
                      className="gacha-card"
                      onClick={() => buyCompanion(comp)}
                      style={{
                        border: isEquipped ? `2px solid ${comp.color}` : '1px solid rgba(255,255,255,0.12)',
                        background: isEquipped ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)'
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{comp.icon}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: comp.color }}>{comp.name}</div>
                      <div style={{ fontSize: '0.7rem', letterSpacing: '1px', color: comp.color, marginTop: '2px' }}>{comp.rarity}</div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.8, margin: '8px 0', minHeight: '32px' }}>{comp.bonus}</div>
                      <button
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: isEquipped ? '#50e3c2' : 'var(--accent-gold)',
                          color: '#000',
                          fontWeight: 'bold',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {isEquipped ? '✓ Equipped' : `Summon (${comp.price} 💎)`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DAILY QUESTS */}
          {activeTab === 'quests' && (
            <div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                Daily Resonance Quests
              </h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                Complete daily spiritual tasks to earn XP and Solfeggio Crystals.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { quest: 'Play 1 Run of Chakra Energy Runner', xp: 250, crystals: 100 },
                  { quest: 'Complete a 5-Min 528Hz Solfeggio Sound Bath', xp: 300, crystals: 150 },
                  { quest: 'Log a Voice Reflection Entry', xp: 200, crystals: 80 },
                  { quest: 'Run a Wearable or Camera Biofield Scan', xp: 350, crystals: 200 }
                ].map((q, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '1rem',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>🎯 {q.quest}</div>
                      <div style={{ fontSize: '0.75rem', color: '#50e3c2', marginTop: '2px' }}>
                        Reward: +{q.xp} XP &amp; +{q.crystals} 💎
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addXp(q.xp);
                        const nextCrystals = crystals + q.crystals;
                        setCrystals(nextCrystals);
                        localStorage.setItem('sacred_crystals', nextCrystals.toString());
                      }}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--accent-gold)',
                        background: 'rgba(212, 175, 55, 0.15)',
                        color: 'var(--accent-gold)',
                        fontWeight: 'bold',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Claim Reward
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SacredRealmEngine;
