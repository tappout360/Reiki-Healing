// ═══════════════════════════════════════════════════════════════
// Reiki & Sage — Unified API Server
// • Avatar Generation (OpenAI)
// • Stripe Payments (subscriptions + one-time)
// • Daily.co Video Rooms
// • Supabase Admin Operations
// ═══════════════════════════════════════════════════════════════

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { unlinkSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import Stripe from 'stripe';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3100;

// ─── Stripe Init ───
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripeReady = stripeKey && !stripeKey.includes('REPLACE_ME');
const stripe = stripeReady ? new Stripe(stripeKey) : null;

// ─── Daily.co Init ───
const dailyKey = process.env.DAILY_API_KEY;
const dailyReady = dailyKey && !dailyKey.includes('REPLACE_ME');

// ─── CORS ───
app.use(cors({ origin: '*' }));

// Raw body for Stripe webhooks (must be before json middleware)
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[Webhook] ❌ Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log(`[Webhook] ✅ Payment succeeded: ${event.data.object.id}`);
      // Future: Update Supabase booking status to 'paid'
      break;
    case 'customer.subscription.created':
      console.log(`[Webhook] ✅ Subscription created: ${event.data.object.id}`);
      break;
    case 'customer.subscription.deleted':
      console.log(`[Webhook] ⚠️ Subscription canceled: ${event.data.object.id}`);
      break;
    case 'invoice.payment_failed':
      console.log(`[Webhook] ❌ Invoice payment failed: ${event.data.object.id}`);
      break;
    default:
      console.log(`[Webhook] Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
});

// JSON body parser (after webhook route)
app.use(express.json({ limit: '10mb' }));

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Reiki & Sage API',
    integrations: {
      stripe: stripeReady ? 'ready' : 'not configured',
      daily: dailyReady ? 'ready' : 'not configured',
      openai: !!process.env.OPENAI_API_KEY ? 'ready' : 'not configured'
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// STRIPE: Create Payment Intent (one-time booking payments)
// ═══════════════════════════════════════════════════════════════
app.post('/api/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe not configured. Add STRIPE_SECRET_KEY to server/.env',
      simulated: true,
      clientSecret: 'pi_simulated_' + Date.now() + '_secret_simulated'
    });
  }

  try {
    const { amount, currency = 'usd', description, metadata = {} } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Amount must be at least $0.50 (50 cents)' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency,
      description,
      metadata: {
        platform: 'reiki_and_sage',
        ...metadata
      },
      automatic_payment_methods: { enabled: true }
    });

    console.log(`[Stripe] ✅ Payment Intent created: ${paymentIntent.id} for $${(amount / 100).toFixed(2)}`);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount
    });
  } catch (err) {
    console.error('[Stripe] ❌ Payment Intent failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// STRIPE: Create Subscription (Healing tier)
// ═══════════════════════════════════════════════════════════════
app.post('/api/create-subscription', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: 'Stripe not configured',
      simulated: true,
      subscriptionId: 'sub_simulated_' + Date.now(),
      clientSecret: 'seti_simulated_' + Date.now() + '_secret_simulated'
    });
  }

  try {
    const { email, paymentMethodId, priceId } = req.body;

    // Find or create customer
    let customer;
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      customer = existing.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: { platform: 'reiki_and_sage' }
      });
    }

    // Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    // Create subscription
    const healingPriceId = priceId || process.env.STRIPE_PRICE_HEALING;
    if (!healingPriceId || healingPriceId.includes('REPLACE_ME')) {
      return res.status(400).json({
        error: 'Stripe Price ID not configured. Create a $22/mo product in Stripe Dashboard and add STRIPE_PRICE_HEALING to .env'
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: healingPriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    console.log(`[Stripe] ✅ Subscription created: ${subscription.id} for ${email}`);

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customerId: customer.id
    });
  } catch (err) {
    console.error('[Stripe] ❌ Subscription failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// STRIPE: Cancel Subscription
// ═══════════════════════════════════════════════════════════════
app.post('/api/cancel-subscription', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured', simulated: true, cancelled: true });
  }

  try {
    const { subscriptionId } = req.body;
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    console.log(`[Stripe] ✅ Subscription canceled: ${subscription.id}`);
    res.json({ cancelled: true, subscriptionId: subscription.id });
  } catch (err) {
    console.error('[Stripe] ❌ Cancellation failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// DAILY.CO: Create Video Room
// ═══════════════════════════════════════════════════════════════
app.post('/api/create-video-room', async (req, res) => {
  if (!dailyReady) {
    // Return a simulated room URL for development
    const simRoomName = `reiki-${Date.now()}`;
    return res.json({
      simulated: true,
      url: `https://your-domain.daily.co/${simRoomName}`,
      roomName: simRoomName,
      note: 'Daily.co not configured. Add DAILY_API_KEY to server/.env'
    });
  }

  try {
    const { bookingId, type = 'portal', expiryMinutes = 120 } = req.body;

    const roomName = `reiki-${type}-${bookingId || Date.now()}`;
    const expiry = Math.floor(Date.now() / 1000) + (expiryMinutes * 60);

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyKey}`
      },
      body: JSON.stringify({
        name: roomName,
        privacy: type === 'circle' ? 'public' : 'private',
        properties: {
          exp: expiry,
          max_participants: type === 'circle' ? 20 : 2,
          enable_chat: true,
          enable_screenshare: false,
          enable_recording: false,
          start_video_off: false,
          start_audio_off: false,
          eject_at_room_exp: true
        }
      })
    });

    const room = await response.json();

    if (room.error) {
      throw new Error(room.info || room.error);
    }

    console.log(`[Daily.co] ✅ Room created: ${room.url} (${type}, expires in ${expiryMinutes}min)`);

    // Generate a meeting token for the healer (owner privileges)
    let healerToken = null;
    const tokenResponse = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyKey}`
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: true,
          exp: expiry
        }
      })
    });
    const tokenData = await tokenResponse.json();
    if (tokenData.token) healerToken = tokenData.token;

    res.json({
      url: room.url,
      roomName: room.name,
      healerToken,
      expiresAt: new Date(expiry * 1000).toISOString()
    });
  } catch (err) {
    console.error('[Daily.co] ❌ Room creation failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// AVATAR GENERATION (preserved from original avatar-server.js)
// ═══════════════════════════════════════════════════════════════
app.post('/api/generate-avatar', async (req, res) => {
  try {
    // Dynamic import sharp since it's a native module
    const sharp = (await import('sharp')).default;
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const {
      photo,
      items = [],
      style = 'ethereal',
      isPet = false,
      petType = 'dog',
      background = '',
      expression = 'peaceful',
      action = 'standing confidently'
    } = req.body;

    if (!photo) {
      return res.status(400).json({ success: false, error: 'No photo provided' });
    }

    // Build item descriptions
    const itemDescriptions = items.length > 0
      ? items.map(item => {
          let desc = `a ${item.color || ''} ${item.name}`;
          if (item.emoji) desc += ` (${item.emoji})`;
          if (item.slot === 'head') desc = `wearing ${desc} on their head`;
          if (item.slot === 'body') desc = `wearing ${desc} as their outfit`;
          if (item.slot === 'hand') desc = `holding ${desc} in their hand`;
          if (item.slot === 'feet') desc = `wearing ${desc} on their feet`;
          if (item.slot === 'back') desc = `with ${desc} on their back`;
          if (item.slot === 'accessory') desc = `adorned with ${desc}`;
          if (item.slot === 'ability' || item.slot === 'aura') desc = `surrounded by a ${desc} energy effect`;
          return desc;
        }).join(', ')
      : 'standard professional attire';

    const styleDescriptions = {
      ethereal: 'ethereal fantasy style, cinematic lighting, magical glow, mystical aura, soft focus background',
      cyberpunk: 'cyberpunk aesthetic, vibrant neon lights, futuristic high-tech clothing, sharp digital art',
      watercolor: 'beautiful watercolor painting style, soft flowing colors, artistic brushstrokes',
      anime: 'anime art style, vibrant colors, clean lines, Japanese animation aesthetic',
      realistic: 'photorealistic digital art, studio lighting, magazine quality, sharp details'
    };

    const styleDesc = styleDescriptions[style] || styleDescriptions.ethereal;
    const referenceHint = 'Use the provided image ONLY as a reference for facial features, skin tone, hair color, and body shape.';

    let prompt;
    if (isPet) {
      prompt = `A professional portrait of a ${petType}. ${referenceHint} ` +
        `The ${petType} has a ${expression} expression and is ${action}. ` +
        `Accessories/items: ${itemDescriptions}. ` +
        `Setting: ${background || 'a beautiful zen sanctuary'}. ` +
        `Style: ${styleDesc}. ` +
        `Ensure all unique markings, fur patterns, and colors from the photo are perfectly preserved.`;
    } else {
      prompt = `A professional full-body digital portrait. ${referenceHint} ` +
        `The subject has a ${expression} facial expression and is ${action}. ` +
        `The subject is wearing AND using: ${itemDescriptions}. ` +
        `Setting: ${background || 'a beautiful zen sanctuary with ethereal lighting'}. ` +
        `Style: ${styleDesc}. ` +
        `Ensure the face, skin tone, hair color, and body proportions from the photo are preserved exactly.`;
    }

    console.log(`[Avatar] Generating ${isPet ? 'Pet' : 'Person'} avatar (style: ${style})...`);

    const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const processedBuffer = await sharp(imageBuffer)
      .resize(1024, 1024, { fit: 'cover' })
      .png()
      .toBuffer();

    const tempPath = join(tmpdir(), `avatar_${Date.now()}.png`);
    writeFileSync(tempPath, processedBuffer);

    try {
      const response = await openai.images.edit({
        model: 'dall-e-2',
        image: await import('fs').then(fs => fs.createReadStream(tempPath)),
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      });

      const resultDataUrl = `data:image/png;base64,${response.data[0].b64_json}`;
      console.log(`[Avatar] ✅ ${isPet ? 'Pet' : 'Person'} AI update successful`);
      res.json({ success: true, image: resultDataUrl });
    } finally {
      try { unlinkSync(tempPath); } catch {}
    }
  } catch (err) {
    console.error('[Avatar] ❌ Generation failed:', err.message);

    if (err.message?.includes('api_key')) {
      return res.status(401).json({ success: false, error: 'Invalid OpenAI API key.' });
    }
    if (err.message?.includes('billing') || err.message?.includes('quota')) {
      return res.status(402).json({ success: false, error: 'OpenAI billing limit reached.' });
    }

    res.status(500).json({
      success: false,
      error: err.message || 'Avatar generation failed. The fallback mode will be used.',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔮 Reiki & Sage API Server running on http://127.0.0.1:${PORT}`);
  console.log(`   GET  /api/health              — Status check`);
  console.log(`   POST /api/generate-avatar      — AI avatar generation`);
  console.log(`   POST /api/create-payment-intent — Stripe one-time payment`);
  console.log(`   POST /api/create-subscription   — Stripe recurring subscription`);
  console.log(`   POST /api/cancel-subscription   — Cancel Stripe subscription`);
  console.log(`   POST /api/create-video-room     — Daily.co video session`);
  console.log(`   POST /api/stripe-webhook        — Stripe event handler\n`);

  if (!process.env.OPENAI_API_KEY) console.warn('⚠️  OPENAI_API_KEY not set');
  if (!stripeReady) console.warn('⚠️  STRIPE_SECRET_KEY not set — payments will be simulated');
  if (!dailyReady) console.warn('⚠️  DAILY_API_KEY not set — video rooms will be simulated');
});
