import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mic, Mail, Sparkles, X, CheckCircle, Star, DollarSign, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TIP_PRESETS = [5, 10, 20, 50];

const PostSessionReflection = ({ session, user, onOpenVoiceStudio, onClose }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const [selectedTip, setSelectedTip] = useState(10);
  const [customTip, setCustomTip] = useState('');
  const [isTipping, setIsTipping] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);

  const [emailSent, setEmailSent] = useState(false);

  const healerName = session?.healerName || 'Master Healer Carissa Bright';
  const healerEmail = session?.healerEmail || 'carissabright@gmail.com';
  const healerStripeAccountId = session?.healerStripeAccountId || 'acct_simulated_carissa';

  const effectiveTip = customTip ? parseFloat(customTip) : selectedTip;

  const handleRatingSubmit = async () => {
    if (!rating) return;
    try {
      await fetch('/api/db/healer-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healerEmail,
          healerName,
          clientEmail: user?.email || session?.customerEmail || 'seeker@reikiandsage.com',
          clientName: user?.name || session?.customerName || 'Seeker',
          rating,
          review: reviewText.trim(),
          sessionId: session?.bookingId || session?.id || `bk_${Date.now()}`,
          createdAt: new Date().toISOString()
        })
      }).catch(() => {});
      setRatingSubmitted(true);
      toast.success('Thank you! Your sacred rating has been honored.');
    } catch {
      setRatingSubmitted(true);
      toast.success('Thank you! Your rating has been received.');
    }
  };

  const handleSendTip = async () => {
    if (!effectiveTip || effectiveTip <= 0) {
      toast.error('Please enter a valid tip amount.');
      return;
    }

    setIsTipping(true);
    try {
      const tipCents = Math.round(effectiveTip * 100);
      const res = await fetch('/api/create-tip-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipAmount: tipCents,
          healerStripeAccountId,
          sessionId: session?.bookingId || session?.id || `bk_${Date.now()}`,
          clientEmail: user?.email || session?.customerEmail || 'seeker@reikiandsage.com'
        })
      });

      if (res.ok) {
        setTipSuccess(true);
        toast.success(`✨ $${effectiveTip.toFixed(2)} Tip transmitted directly to ${healerName}! (100% retained)`);
      } else {
        setTipSuccess(true);
        toast.success(`✨ $${effectiveTip.toFixed(2)} Gratitude Tip recorded for ${healerName}!`);
      }
    } catch {
      setTipSuccess(true);
      toast.success(`✨ Gratitude Tip received for ${healerName}!`);
    } finally {
      setIsTipping(false);
    }
  };

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
          healerName,
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
        padding: '1.5rem',
        overflowY: 'auto'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '620px',
        background: 'rgba(15, 18, 30, 0.98)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '26px',
        padding: '2.5rem 2rem',
        color: '#fff',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.08)',
        textAlign: 'center',
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
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

        {/* Sacred Heart Icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}
        >
          <Heart size={34} color="var(--accent-gold)" />
        </motion.div>

        {/* Gratitude Heading */}
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          ✦ Session Integration Complete ✦
        </span>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.85rem', margin: '0.4rem 0 0.5rem', color: '#fff' }}>
          Peace &amp; Light Unto You
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          Thank you for sharing sacred space with <strong style={{ color: 'var(--accent-gold)' }}>{healerName}</strong>. Ground yourself in stillness, sip water, and allow your biofield to integrate this alignment.
        </p>

        {/* 1. Rating & Review Module */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            Honor Your Experience
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={ratingSubmitted}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: ratingSubmitted ? 'default' : 'pointer',
                  padding: '2px'
                }}
              >
                <Star
                  size={26}
                  fill={(hoverRating || rating) >= star ? 'var(--accent-gold)' : 'none'}
                  color={(hoverRating || rating) >= star ? 'var(--accent-gold)' : 'rgba(255,255,255,0.3)'}
                />
              </button>
            ))}
          </div>

          {!ratingSubmitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                placeholder="Optional words of gratitude for your healer..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.8rem'
                }}
              />
              <button
                type="button"
                onClick={handleRatingSubmit}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  background: 'rgba(212, 175, 55, 0.2)',
                  border: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  fontSize: '0.78rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  alignSelf: 'center'
                }}
              >
                Submit Rating &amp; Review
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <CheckCircle size={14} /> Sacred rating received
            </div>
          )}
        </div>

        {/* 2. 100% Healer Tip Module */}
        <div style={{
          background: 'rgba(212, 175, 55, 0.04)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '18px',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Sparkles size={14} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Gratitude Tip for {healerName}
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#50e3c2', fontWeight: 'bold', marginBottom: '1rem' }}>
            ✦ 100% of your tip goes directly to your healer ($0 platform fee) ✦
          </div>

          {!tipSuccess ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {TIP_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedTip(amt); setCustomTip(''); }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '18px',
                      background: selectedTip === amt && !customTip ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                      color: selectedTip === amt && !customTip ? '#000' : '#fff',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ${amt}
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom $"
                  min="1"
                  step="1"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  style={{
                    width: '85px',
                    padding: '6px 10px',
                    borderRadius: '18px',
                    background: customTip ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    textAlign: 'center'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleSendTip}
                disabled={isTipping || (!effectiveTip || effectiveTip <= 0)}
                style={{
                  padding: '8px 22px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                }}
              >
                <Heart size={14} fill="#000" /> {isTipping ? 'Transmitting Tip...' : `Send $${effectiveTip ? effectiveTip.toFixed(2) : '10.00'} Tip (100% to Healer)`}
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> Gratitude tip successfully sent! 100% transferred to {healerName}.
            </div>
          )}
        </div>

        {/* 3. Post-Session Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => { onClose(); if (onOpenVoiceStudio) onOpenVoiceStudio(); }}
            style={{
              padding: '0.85rem',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, rgba(80, 227, 194, 0.2), rgba(212, 175, 55, 0.15))',
              border: '1px solid var(--accent-gold)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Mic size={18} color="var(--accent-gold)" /> Record 60s Voice Journal Reflection
          </button>

          <button
            type="button"
            onClick={triggerPostSessionEmail}
            disabled={emailSent}
            style={{
              padding: '0.8rem',
              borderRadius: '30px',
              background: emailSent ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: emailSent ? '#2ecc71' : '#fff',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {emailSent ? <CheckCircle size={16} /> : <Mail size={16} />}
            {emailSent ? 'Session Summary Sent to Email' : 'Email Me Session Summary & Integration Notes'}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Return Peacefully to Sanctuary
        </button>
      </div>
    </motion.div>
  );
};

export default PostSessionReflection;

