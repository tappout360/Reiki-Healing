// Vercel Serverless Function — Generate Stripe Connect Onboarding Link
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId, userId = 'healer' } = req.body || {};
    if (!accountId) {
      return res.status(400).json({ error: 'Stripe Account ID is required' });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reikiandsage.com';

    if (!secretKey || accountId.startsWith('acct_simulated_')) {
      console.warn('Simulated onboarding link generated.');
      return res.status(200).json({
        success: true,
        simulated: true,
        url: `${siteUrl}/?portal=healer_dashboard&onboarding=complete`
      });
    }

    const stripe = new Stripe(secretKey);

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl}/?portal=healer_dashboard&onboarding=refresh&userId=${encodeURIComponent(userId)}`,
      return_url: `${siteUrl}/?portal=healer_dashboard&onboarding=complete&userId=${encodeURIComponent(userId)}`,
      type: 'account_onboarding'
    });

    return res.status(200).json({
      success: true,
      url: accountLink.url
    });
  } catch (error) {
    console.error('Create account link error:', error);
    return res.status(500).json({ error: 'Failed to create onboarding link', details: error.message });
  }
}
