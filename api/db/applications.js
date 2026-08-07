// Vercel Serverless Endpoint — Healer Applications (MongoDB)
import { connectToDatabase } from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('applications');

    if (req.method === 'GET') {
      const applications = await collection.find({}).sort({ createdAt: -1 }).toArray();
      const formatted = applications.map(a => ({ id: a._id.toString(), ...a, _id: undefined }));
      return res.status(200).json({ success: true, applications: formatted });
    }

    if (req.method === 'POST') {
      const appData = req.body;
      if (!appData || !appData.email || !appData.name) {
        return res.status(400).json({ error: 'Name and email are required for healer applications.' });
      }

      const doc = {
        ...appData,
        email: appData.email.toLowerCase(),
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(doc);
      return res.status(201).json({
        success: true,
        application: { id: result.insertedId.toString(), ...doc, _id: undefined }
      });
    }

    if (req.method === 'PUT') {
      const { id, status, reviewerId } = req.body;
      if (!id || !status) {
        return res.status(400).json({ error: 'Application ID and status are required.' });
      }

      let queryFilter = {};
      try {
        queryFilter._id = new ObjectId(id);
      } catch {
        queryFilter._id = id;
      }

      await collection.updateOne(queryFilter, {
        $set: { status, reviewedBy: reviewerId, updatedAt: new Date() }
      });

      return res.status(200).json({ success: true, message: 'Application status updated.' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('MongoDB Applications API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
