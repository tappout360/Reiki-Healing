// Vercel Serverless Function — Stripe Connect Destination Charge for Session Fees
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      amount,               // total session price in cents (e.g. 10000 = $100)
      platformFeePercent = 15, // default 15% platform commission
      healerStripeAccountId,
      customerId,
      sessionId,
      clientEmail,
      description = 'Reiki Healing Session'
    } = req.body || {};

    if (!amount || !healerStripeAccountId) {
      return res.status(400).json({ error: 'Missing amount or healer account' });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || healerStripeAccountId.startsWith('acct_simulated_')) {
      const applicationFeeAmount = Math.round(amount * (platformFeePercent / 100));
      return res.status(200).json({
        success: true,
        simulated: true,
        clientSecret: `pi_simulated_secret_${Date.now()}`,
        paymentIntentId: `pi_simulated_${Date.now()}`,
        platformFee: applicationFeeAmount,
        healerAmount: amount - applicationFeeAmount
      });
    }

    const stripe = new Stripe(secretKey);

    // Calculate platform fee in cents
    const applicationFeeAmount = Math.round(amount * (platformFeePercent / 100));

    // Create Destination Charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      customer: customerId || undefined,
      description: description,
      automatic_payment_methods: { enabled: true },
      transfer_data: {
        destination: healerStripeAccountId
      },
      application_fee_amount: applicationFeeAmount,
      metadata: {
        type: 'session_fee',
        sessionId: sessionId || '',
        clientEmail: clientEmail || '',
        platformFee: applicationFeeAmount,
        healerAmount: amount - applicationFeeAmount
      }
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      platformFee: applicationFeeAmount,
      healerAmount: amount - applicationFeeAmount
    });
  } catch (error) {
    console.error('Session payment error:', error);
    return res.status(500).json({ error: 'Failed to create session payment', details: error.message });
  }
}
