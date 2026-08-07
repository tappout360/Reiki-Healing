// Vercel Serverless Function — MongoDB Healer Payouts & Commission Analytics API
import { connectToDatabase } from '../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('healer_payouts');

    if (req.method === 'GET') {
      const { healerEmail } = req.query;
      const query = {};
      if (healerEmail) query.healerEmail = healerEmail.toLowerCase();

      const payouts = await collection.find(query).sort({ requestedAt: -1 }).limit(100).toArray();

      // Calculate totals
      let totalGross = 0;
      let totalPlatformFees = 0;
      let totalNetPayouts = 0;

      payouts.forEach(p => {
        totalGross += p.grossAmount || 0;
        totalPlatformFees += p.platformFeeAmount || 0;
        totalNetPayouts += p.netPayoutAmount || 0;
      });

      return res.status(200).json({
        success: true,
        payouts,
        summary: {
          totalGross: Number(totalGross.toFixed(2)),
          totalPlatformFees: Number(totalPlatformFees.toFixed(2)),
          totalNetPayouts: Number(totalNetPayouts.toFixed(2)),
          pendingBalance: Number((totalGross * 0.85 - totalNetPayouts).toFixed(2))
        }
      });
    }

    if (req.method === 'POST') {
      const { healerEmail, healerName, requestedAmount, platformFeePercent = 15 } = req.body || {};

      if (!healerEmail || !requestedAmount) {
        return res.status(400).json({ error: 'healerEmail and requestedAmount are required' });
      }

      const gross = Number(requestedAmount);
      const fee = Number((gross * (platformFeePercent / 100)).toFixed(2));
      const net = Number((gross - fee).toFixed(2));

      const payoutDoc = {
        payoutId: `po_${Date.now()}`,
        healerEmail: healerEmail.toLowerCase(),
        healerName: healerName || 'Staff Healer',
        grossAmount: gross,
        platformFeePercentage: platformFeePercent,
        platformFeeAmount: fee,
        netPayoutAmount: net,
        currency: 'usd',
        status: 'paid',
        paymentMethod: 'Stripe Connect Express / Direct Transfer',
        requestedAt: new Date(),
        processedAt: new Date()
      };

      const result = await collection.insertOne(payoutDoc);
      return res.status(201).json({
        success: true,
        payout: payoutDoc,
        insertedId: result.insertedId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB Healer Payouts API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
