import React from 'react';
import { motion } from 'framer-motion';
import { Printer, Mail, X, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const SessionReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReceipt = () => {
    toast.success(`Receipt dispatched to ${receipt.seekerEmail || 'your email'}!`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10006,
      padding: '1rem'
    }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.5rem',
          borderRadius: '24px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          background: 'rgba(15, 15, 25, 0.95)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'none', border: 'none', color: '#fff', cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Shield size={32} color="var(--accent-gold)" style={{ marginBottom: '0.5rem' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', margin: 0, color: 'var(--accent-gold)' }}>
            Reiki & Sage Sanctuary
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: '0.3rem 0 0 0' }}>
            Official Session Alignment Receipt
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Receipt #</span>
          <span style={{ fontWeight: 'bold' }}>{receipt.receiptNumber || 'RS-OFFICIAL-RECEIPT'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Date</span>
          <span>{receipt.date || new Date().toLocaleDateString()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Service</span>
          <span>{receipt.serviceType || 'Digital Live Resonance Session'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Base Session</span>
          <span>${receipt.baseAmount || '88.00'}</span>
        </div>

        {Number(receipt.tipAmount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--accent-gold)' }}>100% Healer Tip Guarantee</span>
            <span style={{ color: 'var(--accent-gold)' }}>+${receipt.tipAmount}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
          <span>Total Paid</span>
          <span style={{ color: 'var(--accent-gold)' }}>${receipt.totalCharged || receipt.baseAmount || '88.00'}</span>
        </div>

        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.4' }}>
          Reiki & Sage provides non-medical spiritual wellness, meditation, and relaxation services. 
          100% of tips are transferred directly to your Healer.
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handlePrint}
            className="btn"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', padding: '0.75rem' }}
          >
            <Printer size={16} /> Print Receipt
          </button>
          <button
            onClick={handleEmailReceipt}
            className="btn btn-primary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.75rem' }}
          >
            <Mail size={16} /> Email Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SessionReceiptModal;
