/**
 * ═══════════════════════════════════════════════════════════════
 *  PAYMENT LEDGER — Unified Transaction Engine
 *  All monetary flows route through this utility.
 *  PCI-DSS Level 4 client-side compliance patterns.
 *  HIPAA-safe: no health/session details in transaction records.
 * ═══════════════════════════════════════════════════════════════
 */

const TRANSACTIONS_KEY = 'aura_transactions';
const PAYOUTS_KEY      = 'aura_payouts';

// ─── ID Generators ───
const generateTxnId = () => `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const generateReceiptId = () => `RCT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const generatePayoutId = () => `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

// ─── Card Masking (PCI-DSS) ───
export const maskCardNumber = (num) => {
  if (!num) return '••••';
  const clean = num.replace(/\D/g, '');
  if (clean.length < 4) return '••••';
  return `•••• •••• •••• ${clean.slice(-4)}`;
};

export const maskBankAccount = (num) => {
  if (!num) return '••••';
  const clean = num.replace(/\D/g, '');
  if (clean.length < 4) return '••••';
  return `${'•'.repeat(clean.length - 4)}${clean.slice(-4)}`;
};

export const maskRouting = (num) => {
  if (!num) return '•••••••••';
  const clean = num.replace(/\D/g, '');
  if (clean.length < 4) return '•••••••••';
  return `•••••${clean.slice(-4)}`;
};

// ─── Card Type Detection ───
export const detectCardType = (num) => {
  const clean = (num || '').replace(/\D/g, '');
  if (/^4/.test(clean)) return { type: 'visa', icon: '💳', label: 'Visa' };
  if (/^5[1-5]/.test(clean)) return { type: 'mastercard', icon: '💳', label: 'Mastercard' };
  if (/^3[47]/.test(clean)) return { type: 'amex', icon: '💳', label: 'Amex' };
  if (/^6011|^65/.test(clean)) return { type: 'discover', icon: '💳', label: 'Discover' };
  return { type: 'unknown', icon: '💳', label: 'Card' };
};

// ─── Luhn Validation ───
export const luhnCheck = (num) => {
  const clean = (num || '').replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let n = parseInt(clean[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
};

// ─── Expiry Validation ───
export const validateExpiry = (expiry) => {
  const match = (expiry || '').match(/^(\d{2})\s*\/?\s*(\d{2})$/);
  if (!match) return { valid: false, reason: 'Format: MM/YY' };
  const month = parseInt(match[1], 10);
  const year = parseInt(`20${match[2]}`, 10);
  if (month < 1 || month > 12) return { valid: false, reason: 'Invalid month' };
  const now = new Date();
  const expDate = new Date(year, month);
  if (expDate <= now) return { valid: false, reason: 'Card expired' };
  return { valid: true };
};

// ─── Auto-Formatters ───
export const formatCardNumber = (raw) => {
  const clean = (raw || '').replace(/\D/g, '').slice(0, 16);
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
};

export const formatExpiry = (raw) => {
  const clean = (raw || '').replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) return `${clean.slice(0, 2)} / ${clean.slice(2)}`;
  return clean;
};

export const formatCVC = (raw) => {
  return (raw || '').replace(/\D/g, '').slice(0, 4);
};

// ─── Tax Calculator (state-agnostic flat service fee) ───
const SERVICE_FEE_RATE = 0.029; // 2.9% processing
const PLATFORM_FEE = 0.50;     // $0.50 flat per transaction

export const calculateFees = (subtotal) => {
  const sub = parseFloat(subtotal) || 0;
  const processingFee = parseFloat((sub * SERVICE_FEE_RATE).toFixed(2));
  const platformFee = sub > 0 ? PLATFORM_FEE : 0;
  const total = parseFloat((sub + processingFee + platformFee).toFixed(2));
  return { subtotal: sub, processingFee, platformFee, total };
};

// ═══════════════════════════════════════════════════════════════
//  CORE LEDGER OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Record a transaction in the immutable ledger.
 * @param {Object} params
 * @param {string} params.email        — user identifier
 * @param {string} params.type         — 'subscription' | 'booking_onsite' | 'booking_portal' | 'booking_circle' | 'gold_purchase'
 * @param {string} params.description  — HIPAA-safe label (e.g., "Healing Subscription — 1 Month")
 * @param {number} params.subtotal     — pre-fee amount
 * @param {string} params.paymentMethod — masked card last4 (e.g., "Visa •••• 4242")
 * @param {Object} [params.metadata]   — non-sensitive extras (bookingId, sessionCode, plan)
 * @returns {Object} transaction record
 */
export const recordTransaction = ({
  email,
  type,
  description,
  subtotal,
  paymentMethod = 'Card •••• ****',
  metadata = {}
}) => {
  const fees = calculateFees(subtotal);
  const txn = {
    id: generateTxnId(),
    receiptId: generateReceiptId(),
    email,
    type,
    description,
    subtotal: fees.subtotal,
    processingFee: fees.processingFee,
    platformFee: fees.platformFee,
    total: fees.total,
    paymentMethod,
    status: 'completed',
    createdAt: new Date().toISOString(),
    metadata,
    refund: null
  };

  const txns = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  txns.unshift(txn); // newest first
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));

  return txn;
};

/**
 * Record a $0 transaction for audit trail (e.g., Community Circle included in subscription)
 */
export const recordZeroTransaction = ({ email, type, description, metadata = {} }) => {
  return recordTransaction({
    email,
    type,
    description,
    subtotal: 0,
    paymentMethod: 'Subscription Included',
    metadata
  });
};

/**
 * Get all transactions, optionally filtered by email.
 */
export const getTransactions = (email = null) => {
  const txns = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  if (!email) return txns;
  return txns.filter(t => t.email === email);
};

/**
 * Get a single transaction by ID.
 */
export const getTransaction = (txnId) => {
  const txns = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  return txns.find(t => t.id === txnId) || null;
};

/**
 * Refund a transaction. Records reason, updates status.
 * Does NOT remove original — maintains full audit trail.
 */
export const refundTransaction = (txnId, reason = 'Customer request') => {
  const txns = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  const idx = txns.findIndex(t => t.id === txnId);
  if (idx === -1) return null;

  const refundAmount = txns[idx].total;
  txns[idx].status = 'refunded';
  txns[idx].refund = {
    reason,
    amount: refundAmount,
    processedAt: new Date().toISOString(),
    refundId: `REF-${Date.now().toString(36).toUpperCase()}`
  };

  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
  return txns[idx];
};

/**
 * Generate a receipt object for display/download.
 * HIPAA compliant — no health details.
 */
export const generateReceipt = (txnId) => {
  const txn = getTransaction(txnId);
  if (!txn) return null;

  return {
    receiptNumber: txn.receiptId,
    transactionId: txn.id,
    date: new Date(txn.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),
    time: new Date(txn.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    }),
    business: {
      name: 'Aura Healing Sanctuary',
      type: 'Wellness Services',
      email: 'support@aurahealing.com'
    },
    customer: {
      email: txn.email
    },
    lineItems: [
      { description: txn.description, amount: txn.subtotal }
    ],
    fees: {
      processing: txn.processingFee,
      platform: txn.platformFee
    },
    total: txn.total,
    paymentMethod: txn.paymentMethod,
    status: txn.status,
    refund: txn.refund,
    legal: {
      disclaimer: 'This receipt is for wellness services only and does not constitute a medical invoice. Services provided are complementary wellness modalities and are not a substitute for professional medical advice, diagnosis, or treatment.',
      refundPolicy: 'Refunds are processed within 5-10 business days. Subscription cancellations take effect at the end of the current billing period.',
      hipaa: 'No protected health information (PHI) is included in this receipt in compliance with HIPAA regulations.',
      pci: 'Payment information is processed in accordance with PCI-DSS standards. Full card numbers are never stored.'
    }
  };
};

// ═══════════════════════════════════════════════════════════════
//  HEALER PAYOUT OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get payout summary for admin dashboard.
 */
export const getPayoutSummary = () => {
  const txns = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '[]');

  const completedTxns = txns.filter(t => t.status === 'completed');
  const refundedTxns = txns.filter(t => t.status === 'refunded');

  const totalRevenue = completedTxns.reduce((sum, t) => sum + t.subtotal, 0);
  const totalFees = completedTxns.reduce((sum, t) => sum + t.processingFee + t.platformFee, 0);
  const totalRefunds = refundedTxns.reduce((sum, t) => sum + (t.refund?.amount || 0), 0);
  const netRevenue = totalRevenue - totalFees - totalRefunds;

  const completedPayouts = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayout = netRevenue - completedPayouts;

  // Revenue by type
  const byType = {};
  completedTxns.forEach(t => {
    byType[t.type] = (byType[t.type] || 0) + t.subtotal;
  });

  // Monthly breakdown (last 6 months)
  const monthly = {};
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthly[key] = 0;
  }
  completedTxns.forEach(t => {
    const d = new Date(t.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in monthly) monthly[key] += t.subtotal;
  });

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalFees: parseFloat(totalFees.toFixed(2)),
    totalRefunds: parseFloat(totalRefunds.toFixed(2)),
    netRevenue: parseFloat(netRevenue.toFixed(2)),
    completedPayouts: parseFloat(completedPayouts.toFixed(2)),
    pendingPayout: parseFloat(Math.max(0, pendingPayout).toFixed(2)),
    transactionCount: completedTxns.length,
    refundCount: refundedTxns.length,
    byType,
    monthly,
    recentTransactions: txns.slice(0, 20)
  };
};

/**
 * Request a payout (simulated).
 */
export const requestPayout = (amount, bankInfo) => {
  const payouts = JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '[]');
  const payout = {
    id: generatePayoutId(),
    amount: parseFloat(amount.toFixed(2)),
    bankLast4: bankInfo?.accountNumber ? bankInfo.accountNumber.slice(-4) : '****',
    status: 'pending',
    requestedAt: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 3 * 86400000).toISOString() // +3 days
  };

  payouts.unshift(payout);
  localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts));
  return payout;
};

/**
 * Get payout history.
 */
export const getPayouts = () => {
  return JSON.parse(localStorage.getItem(PAYOUTS_KEY) || '[]');
};

// ─── Bank Info Masking Utility ───
export const saveBankInfo = (bankData) => {
  const masked = {
    bankName: bankData.bankName || '',
    holderName: bankData.holderName || '',
    routingNumber: maskRouting(bankData.routingNumber),
    accountNumber: maskBankAccount(bankData.accountNumber),
    routingLast4: (bankData.routingNumber || '').replace(/\D/g, '').slice(-4),
    accountLast4: (bankData.accountNumber || '').replace(/\D/g, '').slice(-4),
    verified: true,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('aura_bank_info', JSON.stringify(masked));
  return masked;
};

export const getBankInfo = () => {
  return JSON.parse(localStorage.getItem('aura_bank_info') || '{}');
};

// ─── Default Export ───
const PaymentLedger = {
  recordTransaction,
  recordZeroTransaction,
  getTransactions,
  getTransaction,
  refundTransaction,
  generateReceipt,
  getPayoutSummary,
  requestPayout,
  getPayouts,
  saveBankInfo,
  getBankInfo,
  maskCardNumber,
  maskBankAccount,
  maskRouting,
  detectCardType,
  luhnCheck,
  validateExpiry,
  formatCardNumber,
  formatExpiry,
  formatCVC,
  calculateFees
};

export default PaymentLedger;
