// Vercel Serverless Function — Create Stripe Express Account for Healers & Sync MongoDB
import Stripe from 'stripe';
import { connectToDatabase } from './lib/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId = '', email = '', firstName = 'Healer', lastName = 'Practitioner' } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reikiandsage.com';

    if (!secretKey) {
      console.warn('STRIPE_SECRET_KEY missing. Returning simulated Express account.');
      return res.status(200).json({
        success: true,
        simulated: true,
        accountId: `acct_simulated_${Date.now()}`
      });
    }

    const stripe = new Stripe(secretKey);

    // 1. Create Express account with card_payments and transfers
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email.toLowerCase(),
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual',
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase()
      },
      metadata: {
        userId: userId || email,
        role: 'healer'
      }
    });

    // 2. Update MongoDB profiles collection
    try {
      const { db } = await connectToDatabase();
      await db.collection('profiles').updateOne(
        { email: email.toLowerCase() },
        {
          $set: {
            stripe_account_id: account.id,
            onboarding_complete: false,
            charges_enabled: false,
            payouts_enabled: false,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    } catch (dbErr) {
      console.warn('MongoDB profile update notice during Connect setup:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      accountId: account.id
    });
  } catch (error) {
    console.error('Create Connect account error:', error);
    return res.status(500).json({ error: 'Failed to create Stripe Connect account', details: error.message });
  }
}
