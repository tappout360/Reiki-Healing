/**
 * Anti-Corruption Layer for Stripe & Payments
 * Translates Stripe Connect concepts into Sanctuary Domain concepts:
 * - SessionPayment (Base session with 15% platform / 85% healer split)
 * - 100% Healer Tip Guarantee (100% transferred to healer, 0% platform rake)
 * - Guardian Subscription Tier
 */

export const PLATFORM_FEE_PERCENT = 15;
export const HEALER_SHARE_PERCENT = 85;

export const stripePaymentAdapter = {
  /**
   * Calculates destination payout split for a SessionPayment
   */
  calculateSessionSplit(amountInDollars) {
    const totalCents = Math.round(amountInDollars * 100);
    const platformFeeCents = Math.round(totalCents * (PLATFORM_FEE_PERCENT / 100));
    const healerAmountCents = totalCents - platformFeeCents;
    return {
      totalCents,
      platformFeeCents,
      healerAmountCents,
      totalFormatted: (totalCents / 100).toFixed(2),
      platformFeeFormatted: (platformFeeCents / 100).toFixed(2),
      healerAmountFormatted: (healerAmountCents / 100).toFixed(2),
    };
  },

  /**
   * Calculates 100% Healer Tip (0% platform rake)
   */
  calculateHealerTip(tipInDollars) {
    const tipCents = Math.round(tipInDollars * 100);
    return {
      tipCents,
      platformFeeCents: 0,
      healerAmountCents: tipCents,
      isOneHundredPercentGuaranteed: true,
      formatted: (tipCents / 100).toFixed(2),
    };
  },

  /**
   * Creates domain receipt data from checkout completion
   */
  createSessionReceipt({ sessionId, seeker, healer, serviceType, amount, tipAmount = 0, date }) {
    const split = this.calculateSessionSplit(amount);
    const tip = this.calculateHealerTip(tipAmount);
    return {
      receiptNumber: 'RS-' + Date.now().toString(36).toUpperCase(),
      sessionId,
      seekerName: seeker.name,
      seekerEmail: seeker.email,
      healerName: healer?.name || 'Master Healer Carissa Bright',
      serviceType: serviceType === 'onsite' ? 'On-Site Sacred Space Alignment' : 'Digital Live Resonance Portal',
      baseAmount: split.totalFormatted,
      tipAmount: tip.formatted,
      totalCharged: ((split.totalCents + tip.tipCents) / 100).toFixed(2),
      healerTransferTotal: ((split.healerAmountCents + tip.healerAmountCents) / 100).toFixed(2),
      date: date || new Date().toLocaleDateString(),
      issuedAt: new Date().toISOString(),
      complianceNote: 'Reiki & Sage provides non-clinical spiritual wellness and relaxation services.'
    };
  }
};
