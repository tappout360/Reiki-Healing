import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Sparkles, Star, ChevronDown, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getZodiacSign, getAdvancedHoroscope } from '../utils/horoscopes';

const HoroscopeCard = ({ user, birthDate, onUpdateUser }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isRecalibrating, setIsRecalibrating] = React.useState(false);
  const [tempDOB, setTempDOB] = React.useState(birthDate || '');
  
  const sign = getZodiacSign(tempDOB);
  const [horoscopeData, setHoroscopeData] = React.useState(sign ? getAdvancedHoroscope(sign.name) : null);

  const handleUpdateDOB = (e) => {
    e.stopPropagation();
    if (!tempDOB) return;
    
    if (onUpdateUser) {
        onUpdateUser({ ...user, birthDate: tempDOB });
    } else {
        // Fallback for isolated usage
        const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
        profile.birthDate = tempDOB;
        localStorage.setItem('user_profile', JSON.stringify(profile));
    }
    
    setHoroscopeData(getAdvancedHoroscope(getZodiacSign(tempDOB).name));
    toast.success("Celestial alignment captured.");
  };

  const handleRecalibrate = (e) => {
    e.stopPropagation();
    setIsRecalibrating(true);
    setTimeout(() => {
        setHoroscopeData(getAdvancedHoroscope(sign.name));
        setIsRecalibrating(false);
    }, 1500);
  };

  if (!horoscopeData && !isOpen) {
    return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="horoscope-bubble glass"
          style={{
            gridColumn: '1 / -1',
            padding: '1.5rem 2rem',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--accent-gold)',
            cursor: 'pointer',
            textAlign: 'center'
          }}
          onClick={() => setIsOpen(true)}
        >
          <Sparkles color="var(--accent-gold)" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem' }}>Set Your Daily Resonance</h3>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Initialize your terrestrial birth data to receive AI-powered celestial guidance.</p>
        </motion.div>
    );
  }

  const data = horoscopeData || { name: 'Unknown', color: '#8e44ad', focus: 'Aura Calibration', frequency: '---', intensity: '0%', message: 'Please set your birth date.' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="horoscope-bubble glass"
      style={{
        gridColumn: '1 / -1',
        padding: '1.5rem 2rem',
        borderRadius: '24px',
        background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, ${data.color}22 100%)`,
        border: `1px solid ${data.color}44`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 10px 30px rgba(0,0,0,0.2), inset 0 0 20px ${data.color}11`
      }}
    >
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '200px',
          height: '200px',
          background: data.color,
          filter: 'blur(60px)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />

      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            border: `1px solid ${data.color}55`,
            boxShadow: `0 0 20px ${data.color}33`
          }}>
            <Star color={data.color} fill={data.color} size={24} />
          </div>
          <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Personal Resonance</span>
              <div style={{ padding: '2px 8px', borderRadius: '10px', background: `${data.color}33`, color: data.color, fontSize: '0.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: data.color }}></span>
                LIVE TRANSIT
              </div>
            </div>
            <h3 style={{ margin: '0.2rem 0', color: '#fff', fontSize: '1.4rem' }}>{data.name} Alignment</h3>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0 }}>CURRENT FOCUS</p>
            <p style={{ color: data.color, fontWeight: 'bold', margin: 0 }}>{data.focus}</p>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown color="var(--text-muted)" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '2rem 0 0 0', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '0.9rem' }}>✨ Daily Guidance</h4>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleRecalibrate}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: data.color,
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 'bold'
                      }}
                    >
                      <RefreshCw size={14} className={isRecalibrating ? 'animate-spin' : ''} />
                      RECALIBRATE
                    </motion.button>
                  </div>
                  <AnimatePresence mode="wait">
                    {isRecalibrating ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}
                      >
                        Aura is accessing the Akashic Flow...
                      </motion.div>
                    ) : (
                      <motion.p
                        key="message"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}
                      >
                        "{data.message}"
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {!birthDate && (
                      <div className="glass" style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--accent-gold)' }}>
                         <p style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>CALIBRATE BIRTH DATE</p>
                         <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="date" 
                                value={tempDOB}
                                onChange={(e) => setTempDOB(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem', borderRadius: '4px', flex: 1 }} 
                            />
                            <button className="btn" style={{ padding: '0.4rem 0.8rem', background: 'var(--accent-gold)', color: '#000', fontSize: '0.8rem' }} onClick={handleUpdateDOB}>SAVE</button>
                         </div>
                      </div>
                   )}
                   <motion.div 
                    whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); toast.success(`Harmonizing with ${data.frequency}...`); }}
                    className="glass" 
                    style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', cursor: 'pointer' }}
                   >
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: '0 0 0.5rem 0' }}>VIBRATIONAL FREQUENCY</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <Zap size={14} color={data.color} />
                         <span style={{ color: '#fff', fontWeight: 'bold' }}>{data.frequency}</span>
                      </div>
                   </motion.div>

                   <motion.div 
                    whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); toast.success("Recalibrating resonance field..."); }}
                    className="glass" 
                    style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', cursor: 'pointer' }}
                   >
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: '0 0 0.5rem 0' }}>RESONANCE INTENSITY</p>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px' }}>
                        <motion.div 
                          key={data.intensity}
                          initial={{ width: 0 }}
                          animate={{ width: data.intensity }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ height: '100%', background: `linear-gradient(90deg, ${data.color}, #fff)`, borderRadius: '2px' }} 
                        />
                      </div>
                   </motion.div>
                   
                   <button 
                    className="btn" 
                    style={{ background: 'rgba(142, 68, 173, 0.2)', border: '1px solid rgba(142, 68, 173, 0.5)', color: 'var(--accent-ethereal)', fontSize: '0.8rem', padding: '0.6rem' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Search for the Consult Aura button by its text content instead of a non-existent title
                        const consultAuraBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('CONSULT AURA'));
                        if (consultAuraBtn) {
                            consultAuraBtn.click();
                        } else {
                            toast.error("Aura Portal is currently offline.");
                        }
                    }}
                   >
                     More info from Aura Consultant
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const UserDashboardInline = ({ user, onUpdateUser, onOpenFullDashboard, onNavigateToBooking, onNavigateToProtocols, onUpgrade }) => {
  const [particles, setParticles] = React.useState([]);

  React.useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 20 - 10,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }))
    );
  }, []);

  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.section
        id="user-dashboard-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.6 }}
        style={{
          minHeight: '100vh',
          padding: '4rem 2rem',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(20,20,30,0.95) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background Particles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          pointerEvents: 'none'
        }}>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              animate={{
                y: [0, -30, 0],
                x: [0, p.x, 0],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay
              }}
              style={{
                position: 'absolute',
                left: p.left,
                top: p.top,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--accent-gold)'
              }}
            />
          ))}
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Welcome Header with Fun Icons */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}
            >
              ✨
            </motion.div>
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--accent-gold)',
              fontFamily: 'Playfair Display',
              marginBottom: '0.5rem'
            }}>
              Welcome, {user.name}!
            </h2>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.1rem'
            }}>
              {user.subscription === 'healing' ? '🌟 Healing Guardian' : '🌙 Seeker of Light'}
            </p>
          </motion.div>

          {/* Dashboard Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {/* Energy Status Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass"
              style={{
                padding: '2rem',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                cursor: 'pointer'
              }}
              onClick={onOpenFullDashboard}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  style={{
                    fontSize: '2.5rem'
                  }}
                >
                  ⚡
                </motion.div>
                <div>
                  <h3 style={{ color: 'var(--accent-gold)', margin: 0 }}>Energy Flow</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                    Your vibrational status
                  </p>
                </div>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-ethereal))',
                    borderRadius: '10px'
                  }}
                />
              </div>
              <p style={{ textAlign: 'right', marginTop: '0.5rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                85% Aligned
              </p>
            </motion.div>

            {/* Sessions Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass"
              style={{
                padding: '2rem',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(160, 210, 235, 0.3)',
                cursor: 'pointer'
              }}
              onClick={onNavigateToBooking}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: '2.5rem' }}
                >
                  🧘
                </motion.div>
                <div>
                  <h3 style={{ color: 'var(--accent-ethereal)', margin: 0 }}>Sessions</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                    Book your healing
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 'bold', margin: '1rem 0' }}>
                {user.sessions || 0}
              </p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Schedule Session
              </button>
            </motion.div>

            {/* Subscription Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass"
              style={{
                padding: '2rem',
                borderRadius: '20px',
                background: user.subscription === 'healing' 
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(160, 210, 235, 0.1))'
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${user.subscription === 'healing' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.1)'}`,
                cursor: 'pointer'
              }}
              onClick={onUpgrade}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: '2.5rem' }}
                >
                  {user.subscription === 'healing' ? '👑' : '🌱'}
                </motion.div>
                <div>
                  <h3 style={{ 
                    color: user.subscription === 'healing' ? 'var(--accent-gold)' : 'var(--text-main)', 
                    margin: 0 
                  }}>
                    {user.subscription === 'healing' ? 'Healing Tier' : 'Seeker Tier'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                    {user.subscription === 'healing' ? 'Full access unlocked' : 'Upgrade for more'}
                  </p>
                </div>
              </div>
              {user.subscription !== 'healing' && (
                <button className="btn" style={{
                  width: '100%',
                  marginTop: '1rem',
                  background: 'var(--accent-gold)',
                  color: 'black',
                  border: 'none'
                }}>
                  ⬆️ Upgrade Now
                </button>
              )}
            </motion.div>

            {/* NEW: Horoscope Card (Subscriber Only) */}
            {user.subscription === 'healing' && (
              <HoroscopeCard user={user} birthDate={user.birthDate} onUpdateUser={onUpdateUser} />
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            {(user.subscription === 'healing' || user.role === 'owner') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)'
                }}
                onClick={onOpenFullDashboard}
              >
                <Activity size={18} /> View Full Dashboard
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)'
              }}
              onClick={onNavigateToProtocols}
            >
              <Sparkles size={18} /> Explore Protocols
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
};
