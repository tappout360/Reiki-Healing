// Vercel Serverless Function — Stripe Connect Direct Transfer for 100% Healer Tips
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      tipAmount,                 // in cents (e.g. 2000 = $20)
      healerStripeAccountId,
      sessionId,
      clientEmail,
      customerId
    } = req.body || {};

    if (!tipAmount || !healerStripeAccountId) {
      return res.status(400).json({ error: 'Missing tip amount or healer account' });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || healerStripeAccountId.startsWith('acct_simulated_')) {
      return res.status(200).json({
        success: true,
        simulated: true,
        clientSecret: `pi_tip_simulated_secret_${Date.now()}`,
        paymentIntentId: `pi_tip_simulated_${Date.now()}`,
        tipAmount: tipAmount
      });
    }

    const stripe = new Stripe(secretKey);

    // Create a PaymentIntent that transfers 100% to the healer (application_fee_amount = 0)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tipAmount,
      currency: 'usd',
      customer: customerId || undefined,
      description: 'Tip for Healing Session',
      automatic_payment_methods: { enabled: true },
      transfer_data: {
        destination: healerStripeAccountId
      },
      // IMPORTANT: No application fee = healer gets 100%
      application_fee_amount: 0,
      metadata: {
        type: 'tip',
        sessionId: sessionId || '',
        clientEmail: clientEmail || '',
        tipAmount: tipAmount,
        note: '100% of this tip goes to the healer'
      }
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      tipAmount: tipAmount
    });
  } catch (error) {
    console.error('Tip payment error:', error);
    return res.status(500).json({ error: 'Failed to create tip payment', details: error.message });
  }
}
