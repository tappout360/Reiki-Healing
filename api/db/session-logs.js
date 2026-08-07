// Vercel Serverless Endpoint — Session Logs (MongoDB)
import { connectToDatabase } from '../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('session_logs');

    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId parameter is required.' });
      }

      const logs = await collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      const formatted = logs.map(l => ({ id: l._id.toString(), ...l, _id: undefined }));
      return res.status(200).json({ success: true, logs: formatted });
    }

    if (req.method === 'POST') {
      const logData = req.body;
      if (!logData || !logData.userId) {
        return res.status(400).json({ error: 'userId is required for session logs.' });
      }

      const doc = {
        ...logData,
        createdAt: new Date()
      };

      const result = await collection.insertOne(doc);
      return res.status(201).json({
        success: true,
        log: { id: result.insertedId.toString(), ...doc, _id: undefined }
      });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('MongoDB Session Logs API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
