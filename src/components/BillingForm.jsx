import React, { useState } from 'react';
import { Lock, CreditCard, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';

const BillingForm = ({ onSubmit, buttonText = "Subscribe", planId = '1_month', initialData = {} }) => {
  const [loading, setLoading] = useState(false);

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

  const priceDisplay = {
    '1_month': '$22/month',
    '3_month': '$55 (3 months)',
    '6_month': '$99 (6 months)',
    '1_year': '$188 (1 year)'
  };

  return (
    <div className="billing-form">
      <h3 style={{textAlign: 'center', color: 'var(--accent-gold)', marginBottom: '0.5rem', fontFamily: 'Playfair Display', letterSpacing: '1px'}}>Sacred Energy Exchange</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '1.5rem', opacity: 0.8 }}>
        <div style={{ fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent-ethereal)' }}>🔒 SECURE PAYMENT</div>
        <div style={{ fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent-ethereal)' }}>POWERED BY STRIPE</div>
      </div>
      <p style={{textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem', fontStyle: 'italic'}}>
        Your contribution sustains the global resonance field. Processed securely via Stripe.
      </p>

      <div className="glass" style={{padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(212, 175, 55, 0.2)'}}>
        {/* Plan Summary */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.5rem'}}>
            {priceDisplay[planId] || '$22/month'}
          </div>
          <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Healing Tier Subscription</p>
        </div>

        {/* Benefits */}
        <div style={{marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px'}}>
          <div style={{color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <div>✓ All advanced healing protocols</div>
            <div>✓ AI Aura consultation</div>
            <div>✓ Priority live sessions</div>
            <div>✓ Vibrational tracking & insights</div>
          </div>
        </div>

        {/* Stripe Checkout Button */}
        <button
          className="btn btn-primary"
          style={{width: '100%', padding: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1}}
          onClick={handleStripeCheckout}
          disabled={loading}
        >
          {loading ? (
            <>Processing...</>
          ) : (
            <>
              <Lock size={16} />
              {buttonText}
              <ExternalLink size={14} style={{opacity: 0.6}} />
            </>
          )}
        </button>

        <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1rem', opacity: 0.6}}>
          You'll be redirected to Stripe's secure checkout page. We never see your card details.
        </p>
      </div>

      <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem'}}>
        <span style={{color: 'var(--accent-gold)'}}>★</span> Cancel anytime from your Dashboard.
      </p>
    </div>
  );
};

export const maskCardData = (number) => {
  if (!number || number.length < 4) return '****';
  return `**** **** **** ${number.slice(-4)}`;
};

export default BillingForm;
