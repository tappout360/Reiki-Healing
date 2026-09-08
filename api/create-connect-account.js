// Vercel Serverless Function — Create Stripe Connect Express Account & Onboarding Link
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, accountId, userId = '', firstName = 'Healer', lastName = 'Practitioner' } = req.body || {};

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reikiandsage.com';

    // Simulated fallback when secret key is absent or simulated ID used
    if (!secretKey || (accountId && accountId.startsWith('acct_simulated_'))) {
      console.warn('STRIPE_SECRET_KEY missing or simulated. Returning simulated Connect URL.');
      return res.status(200).json({
        success: true,
        simulated: true,
        accountId: accountId || `acct_simulated_${Date.now()}`,
        url: `${siteUrl}/?portal=healer_dashboard&connected=true`
      });
    }

    const stripe = new Stripe(secretKey);

    let activeAccountId = accountId;

    if (!activeAccountId) {
      if (!email) {
        return res.status(400).json({ error: 'Email or accountId is required' });
      }

      // Create Express Account for Remote Healer
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
        },
        business_profile: {
          product_description: 'Reiki & Energy Healing Sanctuary Practitioner'
        }
      });

      activeAccountId = account.id;

      // Sync MongoDB profile if database is configured
      try {
        const { connectToDatabase } = await import('./_lib/mongodb.js');
        const { db } = await connectToDatabase();
        await db.collection('profiles').updateOne(
          { email: email.toLowerCase() },
          {
            $set: {
              stripe_account_id: activeAccountId,
              onboarding_complete: false,
              charges_enabled: false,
              payouts_enabled: false,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
      } catch (dbErr) {
        console.warn('MongoDB profile update notice:', dbErr.message);
      }
    }

    // Create Account Link for Onboarding
    const accountLink = await stripe.accountLinks.create({
      account: activeAccountId,
      refresh_url: `${siteUrl}/?portal=healer_dashboard&refresh=true&userId=${encodeURIComponent(userId || '')}`,
      return_url: `${siteUrl}/?portal=healer_dashboard&connected=true&userId=${encodeURIComponent(userId || '')}`,
      type: 'account_onboarding'
    });

    return res.status(200).json({
      success: true,
      accountId: activeAccountId,
      url: accountLink.url
    });
  } catch (error) {
    console.error('Stripe Connect onboarding error:', error);
    return res.status(500).json({ error: 'Failed to create Stripe Connect account', details: error.message });
  }
}
