// Vercel Serverless Function — Stripe Webhook Handler
// Receives events from Stripe when payments succeed, subscriptions change, etc.
// Configure webhook URL in Stripe Dashboard: https://your-domain.com/api/stripe-webhook
import Stripe from 'stripe';

// Firebase Admin SDK for server-side Firestore updates
// Install: npm install firebase-admin (only needed server-side)
let admin;
try {
  admin = await import('firebase-admin');
  if (!admin.apps?.length) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountVar) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountVar))
      });
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
    }
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

async function logTransactionToLedger(db, stripe, session, type) {
  const totalCents = session.amount_total || 0;
  const taxCents = session.total_details?.amount_tax || 0;
  
  let feeCents = 0;
  try {
    if (session.payment_intent) {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
        expand: ['latest_charge.balance_transaction']
      });
      const charge = pi.latest_charge;
      if (charge && charge.balance_transaction) {
        feeCents = charge.balance_transaction.fee || 0;
      }
    }
  } catch (err) {
    console.warn("Could not retrieve balance transaction fee from Stripe API, using standard fallback:", err.message);
  }

  if (feeCents === 0 && totalCents > 0) {
    feeCents = Math.round(totalCents * 0.029) + 30; // Standard 2.9% + 30c
  }

  const netCents = totalCents - feeCents;
  const grossRevenueCents = totalCents - taxCents;

  const entries = [
    { account: 'assets_cash', type: 'debit', amount: netCents },
    { account: 'expenses_stripe_fees', type: 'debit', amount: feeCents }
  ];

  if (taxCents > 0) {
    entries.push({ account: 'liabilities_sales_tax', type: 'credit', amount: taxCents });
  }

  const revenueAccount = type === 'booking' ? 'revenue_bookings' : 'revenue_subscriptions';
  entries.push({ account: revenueAccount, type: 'credit', amount: grossRevenueCents });

  // Validate Double-Entry Constraint (Debits == Credits)
  const totalDebits = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);
  const totalCredits = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);

  if (totalDebits !== totalCredits) {
    console.error(`Ledger imbalance! Debits: ${totalDebits}, Credits: ${totalCredits}`);
    const difference = totalCredits - totalDebits;
    entries[0].amount += difference; 
  }

  await db.collection('ledger').doc(session.id).set({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent || null,
    stripeCustomerId: session.customer || null,
    description: type === 'booking' 
      ? `Booking payment from ${session.metadata?.customerName || 'Seeker'} (${session.metadata?.serviceType || 'online'})` 
      : `Subscription payment for plan: ${session.metadata?.planId || 'healing_tier'}`,
    entries,
    metadata: session.metadata || {}
  });
  console.log(`Immutable ledger transaction written for Stripe Session ${session.id}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error('Stripe credentials or webhook secret are missing.');
    return res.status(500).json({ error: 'Stripe configuration is missing on the server.' });
  }

  const stripe = new Stripe(secretKey);

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
        const metadataType = session.metadata?.type;

        if (metadataType === 'booking') {
          // ─── BOOKING PAYMENT ─────────────────────────────────
          // Create a booking record in Firestore and send confirmation emails
          const {
            serviceType,
            fullPrice,
            chargeAmount,
            depositAmount,
            customerEmail,
            customerName,
            bookingDate,
            bookingTime,
            notes
          } = session.metadata;

          if (admin) {
            const db = admin.firestore();
            await db.collection('bookings').add({
              customerName,
              customerEmail,
              serviceType,
              price: Number(fullPrice),
              chargeAmount: Number(chargeAmount),
              depositAmount: depositAmount ? Number(depositAmount) : null,
              bookingDate,
              bookingTime,
              notes: notes || '',
              paymentStatus: 'paid',
              status: 'confirmed',
              stripeSessionId: session.id,
              stripePaymentIntent: session.payment_intent || null,
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Booking created for ${customerName} (${serviceType}) on ${bookingDate}`);
            
            try {
              await logTransactionToLedger(db, stripe, session, 'booking');
            } catch (ledgerErr) {
              console.error('Failed to log booking to ledger:', ledgerErr.message);
            }
          }

          // Send confirmation emails (fire-and-forget; don't block webhook response)
          try {
            const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://reikiandsage.com';
            await fetch(`${origin}/api/send-booking-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: customerEmail,
                customerName,
                customerEmail,
                serviceType,
                bookingDate,
                bookingTime,
                price: Number(fullPrice),
                depositAmount: depositAmount ? Number(depositAmount) : null
              })
            });
            console.log('Booking confirmation emails triggered');
          } catch (emailErr) {
            // Log but don't fail the webhook — payment is already captured
            console.error('Failed to send booking emails:', emailErr.message);
          }

        } else {
          // ─── SUBSCRIPTION PAYMENT (existing logic) ───────────
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
            
            try {
              await logTransactionToLedger(db, stripe, session, 'subscription');
            } catch (ledgerErr) {
              console.error('Failed to log subscription to ledger:', ledgerErr.message);
            }
          }
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
