import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Sparkles, ArrowRight } from 'lucide-react';

export const HeroSection = ({
  t,
  language,
  user,
  showSignupFlow,
  onToggleSignupFlow,
  onOpenLoginModal,
  onOpenSubscriptionPage,
  onOpenScienceModal,
  onOpenStories,
  onOpenUserDashboard,
  isMobileLayout = false,
}) => {
  return (
    <section className="hero" style={isMobileLayout ? { padding: '4rem 1rem 2rem 1rem' } : {}}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobileLayout ? '1fr' : '1fr 1fr',
          gap: isMobileLayout ? '2.5rem' : '4rem',
          alignItems: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '500px' }}>
              {t('heroSub')}
            </p>

            {user && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginBottom: '1.5rem',
                  padding: '6px 16px 6px 8px',
                  borderRadius: '30px',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.25s ease'
                }}
                onClick={onOpenUserDashboard}
                title={t('logIntoProfile')}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <span style={{ fontWeight: '600', color: '#fff' }}>{user.name}</span>
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
                  — {t('logIntoProfile')} <ArrowRight size={14} />
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => {
                  if (!user) {
                    onToggleSignupFlow();
                  } else if (user.subscription === 'healing' || user.role === 'owner') {
                    document.getElementById('protocols-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onOpenSubscriptionPage();
                  }
                }}
              >
                <Zap size={18} />
                {user && (user.subscription === 'healing' || user.role === 'owner')
                  ? 'Access Sanctuary'
                  : user
                    ? 'Upgrade Resonance'
                    : (showSignupFlow ? 'Close Application' : t('heroCTAStart'))}
              </button>

              {!user && (
                <button
                  className="btn"
                  style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)' }}
                  onClick={onOpenScienceModal}
                >
                  {t('heroCTAScience')}
                </button>
              )}
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
              Reiki & Sage provides general spiritual wellness, meditation, and relaxation services. We do not offer medical treatments, diagnoses, or clinical services.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ position: 'relative' }}
          >
            <div className="glass" style={{ padding: '0', overflow: 'hidden', borderRadius: '30px', boxShadow: '0 0 60px rgba(160, 210, 235, 0.2)' }}>
              <img
                src="/assets/hero-energy.png"
                alt="Ethereal Energy Flow"
                style={{ width: '100%', height: isMobileLayout ? '320px' : '500px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: 'absolute', top: '-20px', right: '-20px',
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)',
                padding: '15px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
              onClick={onOpenStories}
            >
              <Sparkles color="var(--accent-gold)" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
