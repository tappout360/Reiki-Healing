// Vercel Serverless Function — MongoDB Session Consents API
import { connectToDatabase } from '../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('session_consents');

    if (req.method === 'GET') {
      const { bookingId, clientEmail } = req.query;
      const query = {};
      if (bookingId) query.bookingId = bookingId;
      if (clientEmail) query.clientEmail = clientEmail.toLowerCase();

      const consents = await collection.find(query).sort({ consentTimestamp: -1 }).limit(100).toArray();
      return res.status(200).json({ success: true, consents });
    }

    if (req.method === 'POST') {
      const consentDoc = req.body || {};
      if (!consentDoc.bookingId) {
        return res.status(400).json({ error: 'bookingId is required' });
      }

      const docToInsert = {
        bookingId: consentDoc.bookingId,
        clientEmail: consentDoc.clientEmail ? consentDoc.clientEmail.toLowerCase() : 'seeker@reikiandsage.com',
        disclaimerVersion: consentDoc.disclaimerVersion || '2.1',
        intentionText: consentDoc.intentionText || '',
        consentTimestamp: consentDoc.consentTimestamp || new Date().toISOString(),
        createdAt: new Date()
      };

      const result = await collection.insertOne(docToInsert);
      return res.status(201).json({ success: true, insertedId: result.insertedId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB Session Consents API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
