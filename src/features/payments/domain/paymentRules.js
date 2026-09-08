/**
 * Payment Domain Rules & Business Invariants
 * Pure business logic — Zero external dependencies.
 */

export const PLATFORM_FEE_PERCENT = 20;
export const HEALER_SHARE_PERCENT = 80;

export const paymentRules = {
  calculateSessionSplit(amountInDollars) {
    const totalCents = Math.round(Number(amountInDollars) * 100);
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

  calculateHealerTip(tipInDollars) {
    const tipCents = Math.round(Number(tipInDollars) * 100);
    return {
      tipCents,
      platformFeeCents: 0,
      healerAmountCents: tipCents,
      isOneHundredPercentGuaranteed: true,
      formatted: (tipCents / 100).toFixed(2),
    };
  }
};
