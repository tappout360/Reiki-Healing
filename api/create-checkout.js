// Vercel Serverless Function — Create Stripe Checkout Session
// Called from the client when a user clicks "Subscribe"
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Plan ID → Stripe Price mapping
// After creating products in Stripe Dashboard, add the price IDs here
const PRICE_MAP = {
  '1_month': process.env.STRIPE_PRICE_1_MONTH,
  '3_month': process.env.STRIPE_PRICE_3_MONTH,
  '6_month': process.env.STRIPE_PRICE_6_MONTH,
  '1_year': process.env.STRIPE_PRICE_1_YEAR
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, userId, email } = req.body;

    if (!planId || !PRICE_MAP[planId]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    if (!userId || !email) {
      return res.status(400).json({ error: 'User authentication required' });
    }

    const priceId = PRICE_MAP[planId];
    if (!priceId) {
      return res.status(500).json({ error: 'Stripe price not configured for this plan. Contact support.' });
    }

    // Determine if this is a recurring subscription or one-time
    const isRecurring = planId === '1_month'; // Only monthly is recurring

    const sessionConfig = {
      payment_method_types: ['card'],
      customer_email: email,
      metadata: {
        userId,
        planId
      },
      success_url: `${req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL}/?checkout=success`,
      cancel_url: `${req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL}/?checkout=cancelled`
    };

    if (isRecurring) {
      sessionConfig.mode = 'subscription';
      sessionConfig.line_items = [{ price: priceId, quantity: 1 }];
    } else {
      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [{ price: priceId, quantity: 1 }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
