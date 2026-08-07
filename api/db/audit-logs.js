// Vercel Serverless Function — MongoDB Master Action Audit Logs API
import { connectToDatabase } from '../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('master_audit_logs');

    if (req.method === 'GET') {
      const { category, search, actorEmail } = req.query;
      const query = {};

      if (category && category !== 'ALL') {
        query.category = category;
      }
      if (actorEmail) {
        query.actorEmail = actorEmail.toLowerCase();
      }
      if (search) {
        query.$or = [
          { actorName: { $regex: search, $options: 'i' } },
          { actorEmail: { $regex: search, $options: 'i' } },
          { targetEmail: { $regex: search, $options: 'i' } },
          { details: { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } }
        ];
      }

      const logs = await collection.find(query).sort({ timestamp: -1 }).limit(200).toArray();
      return res.status(200).json({ success: true, logs });
    }

    if (req.method === 'POST') {
      const {
        actorName = 'System Admin',
        actorEmail = 'jasonmounts77@yahoo.com',
        category = 'ACCOUNT_STATUS', // ACCOUNT_STATUS | ROLE_UPGRADE | PRICING_CHANGE | APPLICATION_REVIEW | PAYOUT_REQUEST | MODERATION
        action,
        targetEmail = '',
        details = ''
      } = req.body || {};

      if (!action) {
        return res.status(400).json({ error: 'Action field is required' });
      }

      const auditDoc = {
        logId: `log_${Date.now()}`,
        actorName,
        actorEmail: actorEmail.toLowerCase(),
        category,
        action,
        targetEmail: targetEmail.toLowerCase(),
        details,
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      };

      const result = await collection.insertOne(auditDoc);
      return res.status(201).json({
        success: true,
        log: auditDoc,
        insertedId: result.insertedId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB Master Audit Logs API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
