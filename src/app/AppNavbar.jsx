import React from 'react';
import { Sun, Moon, Sparkles, LogOut } from 'lucide-react';

export const AppNavbar = ({
  scrolled,
  theme,
  onToggleTheme,
  user,
  onOpenLoginModal,
  onOpenUserDashboard,
  onLogout,
  onOpenAuraGuide,
  t,
  renderLanguageDropdown,
  onOpenStories
}) => {
  return (
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
            onClick={(e) => { e.preventDefault(); onOpenStories(); }}
            style={{ marginLeft: '0.8rem', marginRight: '2rem', cursor: 'pointer' }}
          >
            {t('navReflections')}
          </a>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginLeft: '0.8rem', marginRight: '1rem' }}>
            {renderLanguageDropdown()}
          </div>

          <button
            onClick={onToggleTheme}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center'
            }}
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div style={{ display: 'flex', gap: '1rem', marginLeft: '1.5rem', alignItems: 'center' }}>
            {!user ? (
              <button
                onClick={onOpenLoginModal}
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
                  onClick={onOpenUserDashboard}
                  style={{
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid var(--accent-gold)',
                    cursor: 'pointer',
                    color: 'var(--accent-gold)',
                    padding: '0.45rem 1.1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    letterSpacing: '1px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  title="Open Profile Dashboard"
                >
                  <Sparkles size={14} /> {user.name || user.email}
                </button>
                <button
                  onClick={onLogout}
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
              onClick={onOpenAuraGuide}
              style={{
                background: 'none', border: '1px solid var(--accent-ethereal)', cursor: 'pointer',
                color: 'var(--accent-ethereal)', padding: '0.6rem 1.25rem', borderRadius: '20px',
                fontSize: '0.8rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px'
              }}
            >
              {t('navConsultAura')}
            </button>

            <button
              onClick={() => document.getElementById('mobile-service')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.5rem' }}
            >
              {t('navSetAppointment')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
