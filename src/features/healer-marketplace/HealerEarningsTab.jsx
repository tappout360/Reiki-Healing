import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Shield, Heart, Award, ArrowUpRight } from 'lucide-react';

export const HealerEarningsTab = ({ bookings = [], healerSharePercent = 85 }) => {
  const paidBookings = bookings.filter(b => b.paymentStatus === 'paid' || b.status === 'confirmed');
  const grossRevenue = paidBookings.reduce((sum, b) => sum + (Number(b.price || b.amount || 88)), 0);
  const healerEarnings = (grossRevenue * (healerSharePercent / 100)).toFixed(2);
  const totalTips = paidBookings.reduce((sum, b) => sum + (Number(b.tipAmount || 0)), 0).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '18px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>Gross Session Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>${grossRevenue.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Total processed booking volume</div>
        </div>

        <div className="glass" style={{ padding: '1.5rem', borderRadius: '18px', background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Healer Payout ({healerSharePercent}%)</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>${healerEarnings}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(212,175,55,0.8)', marginTop: '0.5rem' }}>Automatic destination transfer</div>
        </div>

        <div className="glass" style={{ padding: '1.5rem', borderRadius: '18px', background: 'rgba(235, 77, 75, 0.05)', border: '1px solid rgba(235, 77, 75, 0.3)' }}>
          <div style={{ fontSize: '0.8rem', color: '#ff7675', marginBottom: '0.5rem' }}>100% Tips Received</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff7675' }}>${totalTips}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>0% platform rake guarantee</div>
        </div>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>Stripe Connect Payout Status</h3>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Your earnings and tips are dispatched automatically via Stripe Connect Express. Funds are routed directly into your configured bank account within standard 2-business-day rolling cycles.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          Open Stripe Express Dashboard <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default HealerEarningsTab;
