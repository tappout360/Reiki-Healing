import React, { useState } from 'react';
import { Lock, CreditCard, ExternalLink, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, isFirebaseConfigured } from '../lib/firebase';

const BillingForm = ({ onSubmit, buttonText = "Subscribe", planId = '1_month', initialData = {} }) => {
  const [loading, setLoading] = useState(false);
  const [showMockForm, setShowMockForm] = useState(!isFirebaseConfigured());
  const [cardData, setCardData] = useState({
    number: initialData.number || '',
    expiry: initialData.expiry || '',
    cvc: initialData.cvc || '',
    name: initialData.name || ''
  });
  const [saveCard, setSaveCard] = useState(true);

  const handleStripeCheckout = async () => {
    setLoading(true);

    try {
      const user = auth.getUser();
      if (!user) {
        toast.error('Please log in to subscribe.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId: user.uid,
          email: user.email
        })
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe's secure checkout page
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Unable to start checkout. Please try again.');
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, number: formatted });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCardData({ ...cardData, expiry: value });
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardData({ ...cardData, cvc: value });
  };

  const handleMockSubmit = (e) => {
    e.preventDefault();
    const cleanNumber = cardData.number.replace(/\s/g, '');
    if (cleanNumber.length < 15) {
      toast.error('Please enter a valid 15 or 16-digit card number.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      toast.error('Please enter expiry in MM/YY format.');
      return;
    }
    if (cardData.cvc.length < 3) {
      toast.error('Please enter a valid CVC.');
      return;
    }
    if (!cardData.name.trim()) {
      toast.error('Please enter the cardholder name.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onSubmit) {
        onSubmit({
          number: cleanNumber,
          saveCard,
          expiry: cardData.expiry,
          name: cardData.name.trim()
        });
      } else {
        toast.success('Mock payment successful!');
      }
    }, 1200);
  };

  const priceDisplay = {
    '1_month': '$22/month',
    '3_month': '$55 (3 months)',
    '6_month': '$99 (6 months)',
    '1_year': '$188 (1 year)'
  };

  return (
    <div className="billing-form" style={{ maxWidth: '420px', margin: '0 auto' }}>
      <h3 style={{
        textAlign: 'center', 
        color: 'var(--accent-gold)', 
        marginBottom: '0.5rem', 
        fontFamily: 'Playfair Display', 
        letterSpacing: '1px'
      }}>
        Sacred Energy Exchange
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '1.5rem', opacity: 0.8 }}>
        <div style={{ fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent-ethereal)' }}>
          {showMockForm ? '🛠️ DEMO MODE' : '🔒 SECURE PAYMENT'}
        </div>
        <div style={{ fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent-ethereal)' }}>
          {showMockForm ? 'LOCAL RESUBSCRIBER' : 'POWERED BY STRIPE'}
        </div>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: '1.4' }}>
        {showMockForm 
          ? "Local sandbox mode active. Use any simulated card details to proceed with calibration." 
          : "Your contribution sustains the global resonance field. Processed securely via Stripe."}
      </p>

      <div className="glass" style={{
        padding: '2rem', 
        background: 'rgba(255, 255, 255, 0.03)', 
        borderRadius: '24px', 
        border: '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
      }}>
        {/* Plan Summary */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>
            {priceDisplay[planId] || '$22/month'}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Resonance Exchange Fee</p>
        </div>

        {showMockForm ? (
          /* Glassmorphic Mock Credit Card Form */
          <form onSubmit={handleMockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--accent-ethereal)', fontWeight: '600' }}>CARDHOLDER NAME</label>
              <input
                type="text"
                placeholder="Carissa Sage"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                required
                style={{
                  padding: '0.8rem 1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--accent-ethereal)', fontWeight: '600' }}>CARD NUMBER</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="4111 2222 3333 4444"
                  value={cardData.number}
                  onChange={handleCardNumberChange}
                  required
                  style={{
                    padding: '0.8rem 1rem',
                    paddingLeft: '2.8rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    width: '100%',
                    outline: 'none',
                    letterSpacing: '1px'
                  }}
                />
                <CreditCard size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-ethereal)', fontWeight: '600' }}>EXPIRY</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={handleExpiryChange}
                  required
                  style={{
                    padding: '0.8rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-ethereal)', fontWeight: '600' }}>CVC</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cardData.cvc}
                  onChange={handleCvcChange}
                  required
                  style={{
                    padding: '0.8rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.4rem' }}>
              <input
                type="checkbox"
                id="saveCardCheckbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="saveCardCheckbox" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Save card for automatic synchronization
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%', 
                padding: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px', 
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>Simulating Connection...</>
              ) : (
                <>
                  <Sparkles size={16} />
                  {buttonText}
                </>
              )}
            </button>
          </form>
        ) : (
          /* Stripe Official Redirect Checkout */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>✓ All advanced healing protocols</div>
                <div>✓ AI Aura consultation</div>
                <div>✓ Priority live sessions</div>
                <div>✓ Vibrational tracking & insights</div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{
                width: '100%', 
                padding: '1.1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px', 
                opacity: loading ? 0.7 : 1
              }}
              onClick={handleStripeCheckout}
              disabled={loading}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Lock size={16} />
                  {buttonText}
                  <ExternalLink size={14} style={{ opacity: 0.6 }} />
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.6 }}>
              You'll be redirected to Stripe's secure checkout page.
            </p>
          </div>
        )}

        {isFirebaseConfigured() && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowMockForm(!showMockForm)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-ethereal)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showMockForm ? '🔒 Use Stripe Secure Checkout (Production)' : '🛠️ Toggle Demo Checkout (Sandbox)'}
            </button>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.25rem' }}>
        <span style={{ color: 'var(--accent-gold)' }}>★</span> Cancel or adjust frequency anytime.
      </p>
    </div>
  );
};

export default BillingForm;
