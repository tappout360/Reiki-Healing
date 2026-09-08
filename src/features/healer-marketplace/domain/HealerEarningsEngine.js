/**
 * Healer OS: Earnings & Tax Engine
 * 
 * Provides 100% transparent accounting:
 * - Session Net (80% to practitioner, 20% platform commission)
 * - Tips (100% to practitioner, 0% platform rake)
 * - 1099-NEC annual summary calculation for independent contractors
 */

export class HealerEarningsEngine {
  static computeBreakdown(sessions = [], tips = []) {
    const sessionGross = sessions.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
    const platformCommission = Number((sessionGross * 0.20).toFixed(2));
    const sessionNet = Number((sessionGross - platformCommission).toFixed(2));

    const totalTips = tips.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalPayout = Number((sessionNet + totalTips).toFixed(2));

    return {
      sessionCount: sessions.length,
      sessionGross,
      platformCommission,
      sessionNet,
      totalTips,
      tipCount: tips.length,
      totalPayout,
      tipGuaranteePercent: 100, // Invariant: 100% to healer
      platformCommissionPercent: 20, // 20% platform commission
      is1099Reportable: totalPayout >= 600, // US IRS threshold for Form 1099-NEC
    };
  }

  static generateTaxExportCSV(healer, sessions = [], tips = [], year = 2026) {
    const breakdown = this.computeBreakdown(sessions, tips);
    
    let csv = 'REIKI & SAGE - INDEPENDENT PRACTITIONER EARNINGS & TAX SUMMARY\n';
    csv += `Tax Year,${year}\n`;
    csv += `Practitioner Name,${healer.displayName || healer.name}\n`;
    csv += `Stripe Connect Account,${healer.stripeConnect?.accountId || 'acct_express'}\n\n`;
    csv += 'Category,Gross Amount,Platform Commission (20%),Net Practitioner Payout\n';
    csv += `Session Fees,$${breakdown.sessionGross.toFixed(2)},$${breakdown.platformCommission.toFixed(2)},$${breakdown.sessionNet.toFixed(2)}\n`;
    csv += `Sanctuary Tips,$${breakdown.totalTips.toFixed(2)},$0.00 (0%),$${breakdown.totalTips.toFixed(2)}\n`;
    csv += `TOTAL ANNUAL PAYOUT,$${(breakdown.sessionGross + breakdown.totalTips).toFixed(2)},$${breakdown.platformCommission.toFixed(2)},$${breakdown.totalPayout.toFixed(2)}\n\n`;
    csv += 'IRS Form 1099-NEC Status,' + (breakdown.is1099Reportable ? 'Reportable (>= $600)' : 'Below Threshold (< $600)') + '\n';
    csv += 'Note: Practitioner operates as an independent 1099 contractor and is responsible for all local, state, and federal tax filings and bookkeeping.\n';

    return csv;
  }
}
