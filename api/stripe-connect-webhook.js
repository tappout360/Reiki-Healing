// Vercel Serverless Function — Stripe Connect Webhook Listener
import Stripe from 'stripe';
import { connectToDatabase } from './lib/mongodb.js';

export const config = {
  api: { bodyParser: false }
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    console.warn('STRIPE_SECRET_KEY missing in Connect Webhook handler.');
    return res.status(200).json({ received: true, simulated: true });
  }

  const stripe = new Stripe(secretKey);
  let event;

  try {
    const rawBody = await getRawBody(req);
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = JSON.parse(rawBody.toString('utf8'));
    }
  } catch (err) {
    console.error('Stripe Connect Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle account updates
  if (event.type === 'account.updated') {
    const account = event.data.object;
    try {
      const { db } = await connectToDatabase();
      await db.collection('profiles').updateOne(
        { stripe_account_id: account.id },
        {
          $set: {
            charges_enabled: !!account.charges_enabled,
            payouts_enabled: !!account.payouts_enabled,
            onboarding_complete: !!account.details_submitted,
            updatedAt: new Date()
          }
        }
      );
      console.log(`Updated Connect Account ${account.id}: charges_enabled=${account.charges_enabled}, payouts_enabled=${account.payouts_enabled}`);
    } catch (dbErr) {
      console.error('Failed to update Connect Account status in MongoDB:', dbErr);
    }
  }

  return res.status(200).json({ received: true });
}
