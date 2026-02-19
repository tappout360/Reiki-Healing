import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Zap, Users, Globe, Flower2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GoldButler from '../utils/goldButler';
import './DistanceReikiBoard.css';

const DistanceReikiBoard = ({ user, onClose }) => {
  const [intentions, setIntentions] = useState([
    { id: 1, user: "Sovereign_Soul", email: "sovereign@aura.io", text: "Healing for my beloved pet reaching the end of life.", energy: 124, timestamp: "2m ago" },
    { id: 2, user: "Echo_Healer", email: "echo@aura.io", text: "Peace and clarity during a massive career transition.", energy: 89, timestamp: "15m ago" },
    { id: 3, user: "Radiant_Root", email: "radiant@aura.io", text: "Physical strength for surgery recovery next week.", energy: 215, timestamp: "1h ago" },
  ]);
  const [newIntention, setNewIntention] = useState('');
  const [globalHeartbeat, setGlobalHeartbeat] = useState(72);

  useEffect(() => {
    // Simulate global heartbeat fluctuations
    const interval = setInterval(() => {
      setGlobalHeartbeat(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePostIntention = (e) => {
    e.preventDefault();
    if (!newIntention.trim()) return;

    const intent = {
      id: Date.now(),
      user: user?.username || "Seeker",
      email: user?.email || null,
      text: newIntention,
      energy: 0,
      timestamp: "Just now"
    };

    setIntentions([intent, ...intentions]);
    setNewIntention('');
    toast.success("Your intention has been cast into the field.");
  };

  const handleSendEnergy = (id) => {
    const tapperEmail = user?.email;
    const ENERGY_COST = 2; // 2 gold total: 1 to poster, 1 to system bank

    // Check tapper's balance
    if (tapperEmail) {
      const balance = GoldButler.getGoldBalance(tapperEmail);
      if (balance < ENERGY_COST) {
        return toast.error(`Insufficient Gold (${balance}/${ENERGY_COST}). Earn more Gold to send energy.`, {
          icon: '🪙',
          style: { background: 'rgba(30,30,45,0.95)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)' }
        });
      }

      // Deduct 2 gold from tapper
      GoldButler.spendGold(tapperEmail, ENERGY_COST, 'Tap for Energy');

      // 1 gold to the intention poster (if they have an email)
      const intent = intentions.find(i => i.id === id);
      if (intent?.email) {
        GoldButler.earnGold(intent.email, 1, `Energy received from ${user?.username || 'a Seeker'}`);
      }

      // 1 gold to system gold bank
      const bankBalance = parseInt(localStorage.getItem('aura_gold_bank') || '0');
      localStorage.setItem('aura_gold_bank', String(bankBalance + 1));
    }

    setIntentions(intentions.map(i => 
      i.id === id ? { ...i, energy: i.energy + 1 } : i
    ));
    toast("Energy transmission focused. (-2 🪙)", {
      icon: '✨',
      style: {
        background: 'rgba(30, 30, 45, 0.9)',
        color: 'var(--accent-gold)',
        border: '1px solid var(--accent-gold)'
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="drb-overlay"
    >
      <div className="drb-container">
        
        {/* Header */}
        <div className="drb-header">
          <div className="drb-header-left">
            <div className="drb-header-icon">
              <Globe size={28} />
            </div>
            <div>
              <h2 className="drb-title">Distance Reiki Community</h2>
              <p className="drb-subtitle">Unified Healing Field • {intentions.length + 42} Active Requests</p>
            </div>
          </div>

          <div className="drb-header-right">
            <div className="drb-heartbeat">
              <div className="drb-heartbeat-label">Global Heartbeat</div>
              <div className="drb-heartbeat-value">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 60 / globalHeartbeat, repeat: Infinity }}
                >
                  <Heart size={18} />
                </motion.div>
                <span className="drb-heartbeat-bpm">{globalHeartbeat} BPM</span>
              </div>
            </div>
            <button onClick={onClose} className="drb-close-btn">×</button>
          </div>
        </div>

        <div className="drb-body">
          
          {/* Main Feed */}
          <div className="drb-feed">
            
            {/* Post Area */}
            <form onSubmit={handlePostIntention} className="drb-post-form">
              <div className="drb-post-wrapper">
                <textarea
                  value={newIntention}
                  onChange={(e) => setNewIntention(e.target.value)}
                  placeholder="What intention would you like to cast into the field today?"
                  className="drb-textarea"
                />
                <button type="submit" className="drb-cast-btn">
                  <Send size={18} /> CAST
                </button>
              </div>
            </form>

            <div className="drb-intentions">
              <AnimatePresence initial={false}>
                {intentions.map((intent) => (
                  <motion.div
                    key={intent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="drb-intention-card"
                  >
                    <div className="drb-intention-avatar">
                      <Users size={24} />
                    </div>
                    
                    <div className="drb-intention-body">
                      <div className="drb-intention-meta">
                        <span className="drb-intention-user">{intent.user}</span>
                        <span className="drb-intention-time">{intent.timestamp}</span>
                      </div>
                      <p className="drb-intention-text">"{intent.text}"</p>
                      
                      <div className="drb-intention-actions">
                        <button 
                          onClick={() => handleSendEnergy(intent.id)}
                          className="drb-energy-btn"
                        >
                          <Zap size={16} /> Tap for Energy <span style={{fontSize: '0.7rem', opacity: 0.7, marginLeft: '4px'}}>🪙 2</span>
                        </button>
                        <div className="drb-resonance-count">
                          <Heart size={14} />
                          <span>{intent.energy} resonance points received</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar / Top Contributors */}
          <div className="drb-sidebar">
            <h3 className="drb-sidebar-title">Top Resonators</h3>
            <div className="drb-resonators">
              {[
                { name: "Ancient_Sage", power: "9.8k", active: true },
                { name: "MoonLight_Healer", power: "7.2k", active: true },
                { name: "Quartz_Queen", power: "5.4k", active: false },
                { name: "Prana_Breathe", power: "4.1k", active: true },
              ].map((res, i) => (
                <div key={i} className="drb-resonator">
                  <div className="drb-resonator-rank">{i + 1}</div>
                  <div className="drb-resonator-info">
                    <div className="drb-resonator-name">{res.name}</div>
                    <div className="drb-resonator-power">{res.power} Resonance Focus</div>
                  </div>
                  {res.active && <div className="drb-active-dot" />}
                </div>
              ))}
            </div>

            <div className="drb-impact-card">
              <div className="drb-impact-header">
                <Flower2 size={16} />
                <span className="drb-impact-label">Your Impact</span>
              </div>
              <div className="drb-impact-value">0.00 Hz</div>
              <p className="drb-impact-desc">Contribute to the field by tapping for others or casting your own intentions.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DistanceReikiBoard;
