import React from 'react';
import { Shield } from 'lucide-react';

export const AppFooter = ({
  t,
  onOpenLegalModal,
  onOpenAdminLogin,
  onOpenHealerApp,
  user,
  onOpenLoginModal,
  healerAppsEnabled = (typeof window !== 'undefined' ? localStorage.getItem('aura_applications_enabled') !== 'false' : true)
}) => {
  return (
    <footer style={{
      padding: '4rem 2rem 6rem 2rem',
      textAlign: 'center',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(5, 5, 10, 0.4)',
      position: 'relative',
      zIndex: 2
    }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Strict Federal & HIPAA Wellness Compliance Notice */}
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          marginBottom: '2rem',
          padding: '1.25rem',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          background: 'rgba(0,0,0,0.3)',
          textAlign: 'left'
        }}>
          <strong style={{ color: 'var(--accent-gold)', display: 'block', marginBottom: '0.25rem' }}>
            {t('complianceDisclaimerTitle')}
          </strong>
          {t('complianceDisclaimerText')}
        </div>

        <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1.25rem' }}>
          © 2026 Reiki & Sage Healing Arts. All rights reserved.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          fontSize: '0.8rem',
          opacity: 0.8,
          flexWrap: 'wrap'
        }}>
          <span onClick={() => onOpenLegalModal('terms')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Terms</span>
          <span>•</span>
          <span onClick={() => onOpenLegalModal('privacy')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Privacy</span>
          <span>•</span>
          <span onClick={() => onOpenLegalModal('disclaimer')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Disclaimer</span>
          <span>•</span>
          <span onClick={onOpenAdminLogin} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Staff Portal</span>
          {healerAppsEnabled && (
            <>
              <span>•</span>
              <span
                onClick={() => {
                  if (!user) {
                    onOpenLoginModal();
                  } else {
                    onOpenHealerApp();
                  }
                }}
                style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--accent-gold)' }}
              >
                Apply as Healer
              </span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
