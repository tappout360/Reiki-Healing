import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText, Heart } from 'lucide-react';

/**
 * LegalModal — Terms of Service, Privacy Policy, and Healing Disclaimer
 * for Reiki & Sage Healing Sanctuary.
 * 
 * Opens as a full-screen glassmorphic modal with tabbed navigation.
 */
const LegalModal = ({ onClose, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: <FileText size={16} /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={16} /> },
    { id: 'disclaimer', label: 'Healing Disclaimer', icon: <Heart size={16} /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10010,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '700px',
          maxHeight: '85vh',
          background: 'rgba(10, 10, 20, 0.95)',
          border: '1px solid rgba(160, 210, 235, 0.15)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h2 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '1.4rem', 
            color: 'var(--accent-ethereal)',
            margin: 0 
          }}>
            Legal Information
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '1rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          flexShrink: 0,
          flexWrap: 'wrap'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: activeTab === tab.id ? '1px solid var(--accent-ethereal)' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === tab.id ? 'rgba(160, 210, 235, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === tab.id ? 'var(--accent-ethereal)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: activeTab === tab.id ? '600' : '400',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem',
          lineHeight: 1.7,
          color: 'var(--text-main)',
          fontSize: '0.88rem'
        }}>
          {activeTab === 'terms' && <TermsOfService />}
          {activeTab === 'privacy' && <PrivacyPolicy />}
          {activeTab === 'disclaimer' && <HealingDisclaimer />}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '0.7rem 2.5rem', fontSize: '0.85rem' }}
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};


// ═══════════════════════════════════════════
// TERMS OF SERVICE
// ═══════════════════════════════════════════
const SectionTitle = ({ children }) => (
  <h3 style={{ 
    fontSize: '1.1rem', fontFamily: "'Playfair Display', serif", 
    color: 'var(--accent-gold)', marginTop: '2rem', marginBottom: '0.75rem' 
  }}>
    {children}
  </h3>
);

const P = ({ children }) => (
  <p style={{ marginBottom: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.7 }}>
    {children}
  </p>
);

const TermsOfService = () => (
  <div>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
      Last updated: May 25, 2026
    </div>

    <SectionTitle>1. Acceptance of Terms</SectionTitle>
    <P>
      By accessing or using the Reiki &amp; Sage Healing Sanctuary website and mobile application 
      ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree 
      to these Terms, please do not use the Service.
    </P>

    <SectionTitle>2. Description of Service</SectionTitle>
    <P>
      Reiki &amp; Sage provides a digital wellness platform offering guided healing protocols, 
      frequency-based meditation experiences, community features, and optional AI-powered 
      wellness guidance. The Service is available through our website at reikiandsage.com and 
      as a progressive web application (PWA).
    </P>

    <SectionTitle>3. User Accounts</SectionTitle>
    <P>
      To access certain features, you must create an account. You agree to provide accurate, 
      current, and complete information during registration. You are responsible for safeguarding 
      your password and for all activities that occur under your account. You must notify us 
      immediately of any unauthorized use of your account.
    </P>

    <SectionTitle>4. Subscription Plans &amp; Payments</SectionTitle>
    <P>
      <strong>Free Tier (Seeker):</strong> Access to basic protocols, community features, and 
      energy tracking at no cost.
    </P>
    <P>
      <strong>Healing Tier:</strong> Paid subscription providing access to advanced protocols, 
      AI Aura Guide consultation, gamification features, and all premium content. Subscription 
      pricing is as displayed at the time of purchase (1 Month: $22, 3 Months: $55, 6 Months: $99, 
      1 Year: $188).
    </P>
    <P>
      Subscriptions automatically renew at the end of each billing period unless cancelled prior 
      to the renewal date. You may cancel at any time through your account settings. Refunds are 
      not provided for partial billing periods, except where required by applicable law.
    </P>

    <SectionTitle>5. User Conduct</SectionTitle>
    <P>
      You agree not to: (a) use the Service for any unlawful purpose; (b) harass, abuse, or 
      threaten other users; (c) upload or transmit harmful or malicious content; (d) attempt to 
      interfere with the Service's operation; (e) misrepresent your identity or create false accounts; 
      (f) scrape, data mine, or extract data from the Service without our express consent.
    </P>

    <SectionTitle>6. Community Content</SectionTitle>
    <P>
      You may submit reflections, stories, and feedback through our community features. By 
      submitting content, you grant Reiki &amp; Sage a non-exclusive, royalty-free license to 
      display such content within the platform. We reserve the right to moderate or remove 
      content that violates these Terms or is inappropriate. All community stories are subject 
      to approval before publication.
    </P>

    <SectionTitle>7. Intellectual Property</SectionTitle>
    <P>
      All content, design, code, protocols, healing frequencies, and branding of the Service 
      are owned by Reiki &amp; Sage Healing Arts and are protected by copyright and intellectual 
      property laws. You may not reproduce, distribute, or create derivative works without our 
      prior written consent.
    </P>

    <SectionTitle>8. Limitation of Liability</SectionTitle>
    <P>
      The Service is provided "as is" and "as available" without warranties of any kind, either 
      express or implied. Reiki &amp; Sage shall not be liable for any indirect, incidental, special, 
      consequential, or punitive damages resulting from your use of or inability to use the Service.
    </P>

    <SectionTitle>9. Modifications</SectionTitle>
    <P>
      We reserve the right to modify these Terms at any time. Changes will be posted on this page 
      with an updated date. Your continued use of the Service after any changes constitutes 
      acceptance of the new Terms.
    </P>

    <SectionTitle>10. Termination</SectionTitle>
    <P>
      We may suspend or terminate your account at our discretion if you violate these Terms. 
      Upon termination, your right to use the Service will immediately cease. You may also 
      deactivate your account at any time through the Settings section of your dashboard.
    </P>

    <SectionTitle>11. Contact Information</SectionTitle>
    <P>
      For questions about these Terms, please reach out through the contact information provided 
      on our website at reikiandsage.com.
    </P>
  </div>
);


// ═══════════════════════════════════════════
// PRIVACY POLICY
// ═══════════════════════════════════════════
const PrivacyPolicy = () => (
  <div>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
      Last updated: May 25, 2026
    </div>

    <SectionTitle>1. Overview</SectionTitle>
    <P>
      Reiki &amp; Sage Healing Arts ("we," "our," or "us") respects your privacy and is committed 
      to protecting the personal information you share with us. This Privacy Policy explains how we 
      collect, use, and safeguard your data when you use our Service.
    </P>

    <SectionTitle>2. Information We Collect</SectionTitle>
    <P>
      <strong>Account Information:</strong> When you create an account, we collect your name, 
      username, email address, and optionally your birth date and healing experience.
    </P>
    <P>
      <strong>Usage Data:</strong> We collect data about how you interact with our Service, 
      including protocols completed, session duration, and feature usage. This data is used 
      to personalize your experience and track your healing progress.
    </P>
    <P>
      <strong>Payment Information:</strong> If you subscribe to the Healing Tier, payment card 
      details are processed directly by our payment processor. We do not store full credit card 
      numbers on our servers.
    </P>

    <SectionTitle>3. How We Use Your Information</SectionTitle>
    <P>We use your information to:</P>
    <ul style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', color: 'rgba(255, 255, 255, 0.75)' }}>
      <li style={{ marginBottom: '0.4rem' }}>Provide and maintain the Service</li>
      <li style={{ marginBottom: '0.4rem' }}>Personalize your healing experience (e.g., horoscope, daily resonance)</li>
      <li style={{ marginBottom: '0.4rem' }}>Track your vibrational history and healing streaks</li>
      <li style={{ marginBottom: '0.4rem' }}>Process subscriptions and payments</li>
      <li style={{ marginBottom: '0.4rem' }}>Send important Service-related communications</li>
      <li style={{ marginBottom: '0.4rem' }}>Improve and optimize the Service</li>
    </ul>

    <SectionTitle>4. What We Do NOT Do</SectionTitle>
    <div style={{
      padding: '1.25rem',
      background: 'rgba(0, 184, 148, 0.08)',
      border: '1px solid rgba(0, 184, 148, 0.2)',
      borderRadius: '12px',
      marginBottom: '1rem'
    }}>
      <P>
        <strong>We do NOT sell, rent, trade, or share your personal information</strong> with 
        third parties for marketing or advertising purposes. Your data stays within our platform.
      </P>
      <P>
        <strong>We do NOT provide medical advice</strong> or act as a healthcare provider. Our 
        Service is a wellness and mindfulness tool only. See our Healing Disclaimer for more details.
      </P>
      <P>
        <strong>We are NOT a HIPAA-covered entity.</strong> Reiki &amp; Sage does not collect 
        protected health information (PHI), does not provide medical diagnoses or treatment, 
        and does not operate as a healthcare provider. Therefore, HIPAA regulations do not apply 
        to our Service.
      </P>
    </div>

    <SectionTitle>5. Data Storage &amp; Security</SectionTitle>
    <P>
      Your account data may be stored using Firebase (Google Cloud) with industry-standard 
      encryption. Session data and preferences may also be stored locally on your device using 
      browser localStorage for faster access. We implement reasonable security measures to 
      protect your information, but no method of electronic storage is 100% secure.
    </P>

    <SectionTitle>6. Data Retention</SectionTitle>
    <P>
      We retain your personal data for as long as your account is active or as needed to provide 
      the Service. You may request deletion of your data at any time by deactivating your account 
      through the Settings section of your dashboard.
    </P>

    <SectionTitle>7. Cookies &amp; Local Storage</SectionTitle>
    <P>
      We use browser localStorage and sessionStorage to save your preferences (theme, healing 
      streaks, gamification progress) and authentication state. We do not use third-party tracking 
      cookies. Our site may use analytics to understand aggregate usage patterns, but this data is 
      not tied to your personal identity.
    </P>

    <SectionTitle>8. Children's Privacy</SectionTitle>
    <P>
      Our Service is not directed to individuals under the age of 13. We do not knowingly collect 
      personal information from children under 13. If you believe we have collected information 
      from a child under 13, please contact us immediately.
    </P>

    <SectionTitle>9. Changes to This Policy</SectionTitle>
    <P>
      We may update this Privacy Policy from time to time. We will notify you of significant 
      changes by posting a notice on our Service. Your continued use of the Service after changes 
      are posted constitutes your acceptance of the revised policy.
    </P>

    <SectionTitle>10. Contact Us</SectionTitle>
    <P>
      If you have questions about this Privacy Policy or wish to exercise your data rights, 
      please contact us through the information provided on reikiandsage.com.
    </P>
  </div>
);


// ═══════════════════════════════════════════
// HEALING DISCLAIMER
// ═══════════════════════════════════════════
const HealingDisclaimer = () => (
  <div>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
      Last updated: May 25, 2026
    </div>

    <div style={{
      padding: '1.5rem',
      background: 'rgba(231, 76, 60, 0.08)',
      border: '1px solid rgba(231, 76, 60, 0.2)',
      borderRadius: '12px',
      marginBottom: '2rem'
    }}>
      <p style={{ fontWeight: '700', color: '#e74c3c', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
        ⚠️ Important Notice
      </p>
      <P>
        The services provided by Reiki &amp; Sage Healing Arts are for <strong>general wellness, 
        relaxation, and personal growth purposes only</strong>. They are NOT a substitute for 
        professional medical advice, diagnosis, or treatment.
      </P>
    </div>

    <SectionTitle>1. Not Medical Advice</SectionTitle>
    <P>
      Reiki &amp; Sage does not provide medical advice, diagnoses, or treatment recommendations. 
      The terms "healing," "frequency," "vibrational alignment," "biofield calibration," and similar 
      terminology used throughout our Service are metaphorical and refer to spiritual and wellness 
      practices — not clinical medical procedures.
    </P>
    <P>
      Our guided protocols, frequency-based experiences, and AI Aura Guide are designed as mindfulness 
      and meditation tools. They should be enjoyed alongside — not instead of — professional medical care.
    </P>

    <SectionTitle>2. No Practitioner–Patient Relationship</SectionTitle>
    <P>
      Use of the Reiki &amp; Sage platform does not create a healthcare provider-patient 
      relationship. Our practitioners, healers, and AI systems are not licensed medical professionals 
      unless explicitly stated. Any guidance provided is for informational and inspirational purposes only.
    </P>

    <SectionTitle>3. Individual Results</SectionTitle>
    <P>
      Results from using our Service vary from person to person. We make no guarantees or 
      representations regarding specific outcomes, improvements, or healing results. Any 
      testimonials or community stories shared on our platform represent individual experiences 
      and should not be interpreted as typical results.
    </P>

    <SectionTitle>4. When to Seek Medical Attention</SectionTitle>
    <P>
      If you are experiencing a medical emergency, mental health crisis, or any condition requiring 
      professional attention, please contact your healthcare provider, call emergency services 
      (911 in the US), or visit your nearest emergency room immediately. Do not rely on our 
      Service for medical emergencies.
    </P>

    <SectionTitle>5. Frequency &amp; Sound Disclaimer</SectionTitle>
    <P>
      Our protocols may include audio frequencies and binaural-beat-inspired soundscapes. These are 
      intended for relaxation and focus. If you have epilepsy, seizure disorders, or are sensitive 
      to audio stimuli, please consult your physician before using audio-based protocols. Use 
      headphones at a comfortable volume.
    </P>

    <SectionTitle>6. AI Guidance Disclaimer</SectionTitle>
    <P>
      The Aura Guide AI assistant provides general wellness suggestions and spiritual insights 
      using artificial intelligence. Its responses are generated algorithmically and should not be 
      taken as professional advice of any kind — medical, psychological, legal, or financial. 
      Always consult qualified professionals for important decisions.
    </P>

    <SectionTitle>7. Assumption of Risk</SectionTitle>
    <P>
      By using Reiki &amp; Sage, you acknowledge and accept that: (a) the Service is a wellness 
      and mindfulness tool, not a medical service; (b) you are responsible for your own health 
      decisions; (c) you will not hold Reiki &amp; Sage Healing Arts liable for any adverse effects 
      or dissatisfaction resulting from use of the Service.
    </P>

    <SectionTitle>8. Your Acknowledgment</SectionTitle>
    <P>
      By creating an account and using the Reiki &amp; Sage platform, you acknowledge that you 
      have read and understood this Healing Disclaimer, and you agree to use the Service in 
      accordance with its intended purpose as a wellness and spiritual growth tool.
    </P>
  </div>
);

export default LegalModal;
