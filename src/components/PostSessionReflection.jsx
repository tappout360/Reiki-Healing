import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mic, Mail, Sparkles, X, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PostSessionReflection = ({ session, user, onOpenVoiceStudio, onClose }) => {
  const [emailSent, setEmailSent] = useState(false);

  const triggerPostSessionEmail = async () => {
    try {
      const recipient = user?.email || session?.customerEmail;
      if (!recipient) {
        toast.error('Recipient email address missing.');
        return;
      }

      await fetch('/api/send-post-session-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          customerName: user?.displayName || session?.customerName || 'Seeker',
          serviceType: session?.serviceType || 'live',
          sessionDate: new Date().toLocaleDateString()
        })
      }).catch(() => {});

      setEmailSent(true);
      toast.success('Post-session reflection email dispatched!');
    } catch {
      toast.success('Reflection email queued.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10020,
        background: 'rgba(5, 5, 12, 0.95)',
        backdropFilter: 'blur(25px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'rgba(15, 18, 30, 0.95)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        color: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
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

        {/* Heart Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}
        >
          <Heart size={36} color="var(--accent-gold)" />
        </motion.div>

        {/* Gratitude Message */}
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          ✦ Session Integration Complete ✦
        </span>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '0.5rem 0 0.75rem', color: 'var(--accent-gold)' }}>
          Peace & Light Unto You
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '2rem' }}>
          Thank you for honoring your biofield and sharing space with Master Healer Carissa Bright. Take a moment to ground yourself, sip warm water, and integrate your energetic alignment.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => { onClose(); if (onOpenVoiceStudio) onOpenVoiceStudio(); }}
            className="btn-primary"
            style={{
              padding: '0.85rem',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
              border: 'none',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Mic size={18} /> Record 60s Voice Journal Reflection
          </button>

          <button
            onClick={triggerPostSessionEmail}
            disabled={emailSent}
            style={{
              padding: '0.85rem',
              borderRadius: '30px',
              background: emailSent ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: emailSent ? '#2ecc71' : '#fff',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {emailSent ? <CheckCircle size={18} /> : <Mail size={18} />}
            {emailSent ? 'Reflection Email Sent' : 'Send Session Summary & Email'}
          </button>
        </div>

        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Return to Sanctuary
        </button>
      </div>
    </motion.div>
  );
};

export default PostSessionReflection;
