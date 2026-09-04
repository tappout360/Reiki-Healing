// Vercel Serverless Function — Create Stripe Checkout Session for Bookings
// Called from the client when a user books an on-site or live healing session
// Uses dynamic pricing (price_data) — no hardcoded Stripe Price IDs
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY environment variable is missing.');
    return res.status(500).json({ error: 'Stripe payments secret is missing on the server.' });
  }

  const stripe = new Stripe(secretKey);

  try {
    const {
      serviceType,
      price,
      customerEmail,
      customerName,
      bookingDate,
      bookingTime,
      healerEmail = 'carissabright@gmail.com',
      healerName = 'Master Healer Carissa Bright',
      healerStripeAccountId,
      notes
    } = req.body;

    // --- Validation ---
    if (!serviceType || !['onsite', 'live'].includes(serviceType)) {
      return res.status(400).json({ error: 'Invalid service type. Must be "onsite" or "live".' });
    }

    if (!price || typeof price !== 'number' || price < 100) {
      return res.status(400).json({ error: 'Invalid price. Must be a number in cents (minimum 100).' });
    }

    if (!customerEmail || !customerName) {
      return res.status(400).json({ error: 'Customer email and name are required.' });
    }

    if (!bookingDate || !bookingTime) {
      return res.status(400).json({ error: 'Booking date and time are required.' });
    }

    // --- Verify Healer Stripe Connect Status if targeted ---
    let activeDestinationAccount = null;
    if (healerStripeAccountId && !healerStripeAccountId.startsWith('acct_simulated_')) {
      try {
        const account = await stripe.accounts.retrieve(healerStripeAccountId);
        if (!account.charges_enabled || !account.payouts_enabled) {
          return res.status(400).json({
            error: `${healerName} is currently completing Stripe verification. Please select another time or book with Master Healer Carissa Bright.`
          });
        }
        activeDestinationAccount = account.id;
      } catch (acctErr) {
        console.warn('Could not verify healer Stripe account status, proceeding with platform charge:', acctErr.message);
      }
    }

    // --- Calculate charge amount ---
    // On-site: 15% deposit up front; Live: full amount
    const isOnsite = serviceType === 'onsite';
    const chargeAmount = isOnsite ? Math.round(price * 0.15) : price;
    const depositAmount = isOnsite ? chargeAmount : null;

    // Build the product name for the Stripe receipt
    const productName = isOnsite
      ? `Reiki & Sage — On-Site Healing Session (15% Deposit)`
      : `Reiki & Sage — Live Healing Session (${healerName})`;

    const productDescription = isOnsite
      ? `15% deposit for on-site healing session on ${bookingDate} at ${bookingTime} with ${healerName}. Remaining balance due at time of service.`
      : `Live healing session on ${bookingDate} at ${bookingTime} with ${healerName}.`;

    // --- Build metadata (passed to webhook for Firestore/Mongo record) ---
    // HIPAA: No medical/health data is stored — only scheduling & payment info
    const metadata = {
      type: 'booking',
      serviceType,
      fullPrice: String(price),
      chargeAmount: String(chargeAmount),
      customerEmail,
      customerName,
      healerEmail: healerEmail.toLowerCase(),
      healerName,
      healerStripeAccountId: activeDestinationAccount || '',
      bookingDate,
      bookingTime,
      notes: notes || ''
    };

    if (isOnsite) {
      metadata.depositAmount = String(depositAmount);
    }

    // --- Create Stripe Checkout Session with dynamic pricing ---
    const origin = req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://reikiandsage.com';

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      metadata,
      automatic_tax: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription
            },
            unit_amount: chargeAmount
          },
          quantity: 1
        }
      ],
      success_url: `${origin}/?booking=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?booking=cancelled`
    };

    // If active healer destination account is verified, route via Destination Charge
    // Platform takes 15% commission on session fee; Healer gets 85%
    if (activeDestinationAccount) {
      const platformFee = Math.round(chargeAmount * 0.15);
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: activeDestinationAccount
        },
        metadata
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.status(200).json({
      url: session.url,
      sessionId: session.id,
      chargeAmount,
      depositAmount,
      healerName
    });
  } catch (error) {
    console.error('Booking checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking checkout session.' });
  }
}
