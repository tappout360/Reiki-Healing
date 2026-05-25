// Vercel Serverless Function — Stripe Webhook Handler
// Receives events from Stripe when payments succeed, subscriptions change, etc.
// Configure webhook URL in Stripe Dashboard: https://your-domain.com/api/stripe-webhook
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Firebase Admin SDK for server-side Firestore updates
// Install: npm install firebase-admin (only needed server-side)
let admin;
try {
  admin = await import('firebase-admin');
  if (!admin.apps?.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}'))
    });
  }
} catch (e) {
  console.warn('Firebase Admin not initialized:', e.message);
}

export const config = {
  api: {
    bodyParser: false // Stripe needs raw body for signature verification
  }
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (userId && admin) {
          const db = admin.firestore();
          await db.collection('profiles').doc(userId).update({
            subscription: 'healing',
            subscriptionStatus: 'active',
            stripeCustomerId: session.customer || null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`Subscription activated for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        if (customerId && admin) {
          const db = admin.firestore();
          // Find user by Stripe customer ID
          const snapshot = await db.collection('profiles')
            .where('stripeCustomerId', '==', customerId)
            .limit(1)
            .get();

          if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            const newStatus = subscription.status === 'active' ? 'active' :
              subscription.status === 'past_due' ? 'past_due' : 'cancelled';

            await userDoc.ref.update({
              subscriptionStatus: newStatus,
              subscription: newStatus === 'active' ? 'healing' : 'seeker',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Subscription ${newStatus} for customer ${customerId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
