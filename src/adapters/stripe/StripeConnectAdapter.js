import { PaymentPort } from '../../ports/PaymentPort.js';
import { stripePaymentAdapter } from '../../features/payments/stripePaymentAdapter.js';

/**
 * Driven Adapter: StripeConnectAdapter
 * Implements PaymentPort.
 * Enforces 15% platform commission on base session and 0% fee on tips.
 */
export class StripeConnectAdapter extends PaymentPort {
  async chargeSession({ sessionId, amount, seekerEmail, healerStripeAccountId }) {
    const split = stripePaymentAdapter.calculateSessionSplit(amount);
    
    // Call serverless checkout endpoint
    const res = await fetch('/api/create-session-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        amount: split.totalCents,
        applicationFee: split.platformFeeCents,
        destinationAccount: healerStripeAccountId,
        seekerEmail,
      }),
    });
    return res.json();
  }

  async transferFullTip({ sessionId, tipAmount, healerStripeAccountId }) {
    const tipData = stripePaymentAdapter.calculateHealerTip(tipAmount);
    
    // Serverless tip transfer endpoint (application_fee_amount = 0)
    const res = await fetch('/api/create-tip-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        amount: tipData.tipCents,
        destinationAccount: healerStripeAccountId,
      }),
    });
    return res.json();
  }
}
