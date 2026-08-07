// Vercel Serverless Function — Create Stripe Connect Express Account & Onboarding Link
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, healerName } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reikiandsage.com';

    if (!secretKey) {
      console.warn('STRIPE_SECRET_KEY missing. Returning simulated Connect URL.');
      return res.status(200).json({
        success: true,
        simulated: true,
        url: `${siteUrl}/?portal=healer_dashboard&connected=true`
      });
    }

    const stripe = new Stripe(secretKey);

    // Create Express Account for Remote Healer
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email.toLowerCase(),
      business_type: 'individual',
      capabilities: {
        transfers: { requested: true }
      },
      business_profile: {
        product_description: 'Reiki & Energy Healing Sanctuary Practitioner'
      }
    });

    // Create Account Link for Onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${siteUrl}/?portal=healer_dashboard&refresh=true`,
      return_url: `${siteUrl}/?portal=healer_dashboard&connected=true`,
      type: 'account_onboarding'
    });

    return res.status(200).json({
      success: true,
      accountId: account.id,
      url: accountLink.url
    });
  } catch (error) {
    console.error('Stripe Connect onboarding error:', error);
    return res.status(500).json({ error: 'Failed to create Stripe Connect account', details: error.message });
  }
}
