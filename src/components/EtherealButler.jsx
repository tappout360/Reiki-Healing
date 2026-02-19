import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, Zap, Heart, Shield, Award, Star, Compass, ShoppingBag, MessageCircle, AlertTriangle } from 'lucide-react';
import ActionButler from '../utils/actionButler';

const suggestions = [
  { id: 'protocol', condition: (u) => (u.sessions || 0) < 1, icon: Zap, color: '#f1c40f', title: 'Begin Your First Protocol', desc: 'Start with a guided Reiki session to calibrate your bio-field.', action: 'protocols' },
  { id: 'streak', condition: (u) => (u.streak || 0) >= 1 && (u.streak || 0) < 3, icon: Heart, color: '#ff7675', title: 'Build Your Healing Streak', desc: `You're on a ${'{streak}'}-day streak. Keep going for bonus RP!`, action: 'protocols' },
  { id: 'mastery', condition: (u) => (u.resonancePoints || 0) >= 10, icon: Award, color: '#d4af37', title: 'Practice Symbol Tracing', desc: 'Earn Resonance Points by tracing sacred Reiki symbols.', action: 'mastery' },
  { id: 'community', condition: (u) => (u.sessions || 0) >= 2, icon: Compass, color: '#00b894', title: 'Join the Collective Field', desc: 'Share your healing intentions with the global community.', action: 'community' },
  { id: 'story', condition: (u) => (u.sessions || 0) >= 3, icon: Star, color: '#e67e22', title: 'Share Your Story', desc: 'Inspire others and earn engagement RP by sharing your journey.', action: 'stories' },
  { id: 'upgrade', condition: (u) => u.subscription !== 'healing' && (u.sessions || 0) >= 1, icon: Shield, color: '#9b59b6', title: 'Unlock Advanced Protocols', desc: 'Upgrade to Guardian status for full access to the Sanctuary.', action: 'upgrade' },
  { id: 'pet', condition: (u) => !(u.pets && u.pets.length > 0), icon: Heart, color: '#34e7e4', title: 'Add a Companion', desc: 'Create a pet profile and try the Pet Healing protocol.', action: 'pets' },
];

const EtherealButler = ({ user, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setPulse(p => !p), 3000);
    return () => clearInterval(timer);
  }, []);

  const activeSuggestions = suggestions
    .filter(s => !dismissed.includes(s.id))
    .filter(s => {
      try {
        return s.condition(user || {});
      } catch { return false; }
    })
    .slice(0, 3);

  // Dynamic suggestions based on recent ActionButler history
  const [dynamicSuggestions, setDynamicSuggestions] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    const recentActions = ActionButler.getActions(user.email, { limit: 15, sinceDays: 3 });
    const dynamic = [];

    // If user earned gold recently → suggest Gold Store
    const recentGold = recentActions.find(a => a.type === 'gold_earned');
    if (recentGold && !dismissed.includes('dyn-gold-store')) {
      dynamic.push({
        id: 'dyn-gold-store', icon: ShoppingBag, color: '#f1c40f',
        title: 'Visit the Gold Store',
        desc: `You recently earned gold — browse premium avatar items!`,
        action: 'mastery'
      });
    }

    // If user completed a session → suggest AI consultation
    const recentSession = recentActions.find(a => a.type === 'session_complete');
    if (recentSession && !dismissed.includes('dyn-ai-consult')) {
      dynamic.push({
        id: 'dyn-ai-consult', icon: MessageCircle, color: '#3498db',
        title: 'Chat with Aura',
        desc: `Great session! Ask Aura for personalized guidance on your journey.`,
        action: 'ai'
      });
    }

    // If subscription was cancelled → offer reconsider
    const recentCancel = recentActions.find(a => a.type === 'subscription_cancelled');
    if (recentCancel && !dismissed.includes('dyn-sub-reconsider')) {
      dynamic.push({
        id: 'dyn-sub-reconsider', icon: AlertTriangle, color: '#e74c3c',
        title: 'Reconsidering?',
        desc: `Your Healing access ends soon. Re-subscribe to keep full benefits.`,
        action: 'upgrade'
      });
    }

    setDynamicSuggestions(dynamic);
  }, [user, dismissed]);

  const allSuggestions = [...activeSuggestions, ...dynamicSuggestions].slice(0, 4);

  const handleAction = (suggestion) => {
    setDismissed(prev => [...prev, suggestion.id]);
    // Log suggestion click to ActionButler
    if (user?.email) {
      ActionButler.logButlerAction(user.email, suggestion.id, suggestion.title);
    }
    onAction(suggestion.action);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Butler FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{
          scale: pulse ? [1, 1.08, 1] : 1,
          boxShadow: pulse
            ? ['0 0 15px rgba(212,175,55,0.3)', '0 0 30px rgba(212,175,55,0.6)', '0 0 15px rgba(212,175,55,0.3)']
            : '0 0 15px rgba(212,175,55,0.3)'
        }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          bottom: '6rem',
          left: '1.5rem',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.9) 0%, rgba(142,68,173,0.8) 100%)',
          border: '2px solid rgba(255,255,255,0.2)',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 9500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}
        title="Ethereal Butler – Your Guide"
      >
        <Sparkles size={22} />
        {allSuggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#ff7675', fontSize: '0.65rem', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(10,10,15,0.8)'
          }}>
            {allSuggestions.length}
          </div>
        )}
      </motion.button>

      {/* Butler Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '10rem',
              left: '1.5rem',
              width: '340px',
              maxHeight: '420px',
              background: 'rgba(10, 10, 20, 0.95)',
              backdropFilter: 'blur(25px)',
              borderRadius: '24px',
              border: '1px solid rgba(212,175,55,0.25)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              zIndex: 9501,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(212,175,55,0.8)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '2px' }}>
                  Ethereal Butler
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
                  Next Best Action
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{
                background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', borderRadius: '50%', width: '30px', height: '30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={14} />
              </button>
            </div>

            {/* Suggestions */}
            <div style={{ padding: '0.75rem', overflowY: 'auto', flex: 1 }}>
              {allSuggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'rgba(255,255,255,0.4)' }}>
                  <Sparkles size={28} style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--accent-gold)' }} />
                  <p style={{ fontSize: '0.9rem' }}>Your resonance is perfectly aligned.</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Check back after your next session.</p>
                </div>
              ) : (
                allSuggestions.map((s, i) => {
                  const Icon = s.icon;
                  const desc = s.desc.replace('{streak}', user.streak || 0);
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleAction(s)}
                      style={{
                        padding: '1rem',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
                        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      }}
                    >
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={18} color={s.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>{s.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.4' }}>{desc}</div>
                      </div>
                      <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.2)',
              textAlign: 'center'
            }}>
              Level {Math.floor((user.resonancePoints || 0) / 100) + 1} · {user.resonancePoints || 0} RP
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EtherealButler;
