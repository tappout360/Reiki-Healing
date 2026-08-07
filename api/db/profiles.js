// Vercel Serverless Endpoint — User & Healer Profiles Management (MongoDB)
import { connectToDatabase } from '../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('profiles');

    if (req.method === 'GET') {
      const { userId, username, role, type } = req.query;

      if (userId) {
        const profile = await collection.findOne({ userId });
        if (!profile) {
          return res.status(404).json({ error: 'Profile not found' });
        }
        return res.status(200).json({ success: true, profile: { id: profile._id.toString(), ...profile, _id: undefined } });
      }

      if (username) {
        const profile = await collection.findOne({ username: username.toLowerCase() });
        return res.status(200).json({ success: true, exists: !!profile });
      }

      let filter = {};
      if (type === 'team' || role === 'healers') {
        filter.role = { $in: ['healer', 'admin', 'owner', 'staff'] };
      } else if (role) {
        filter.role = role;
      }

      const profiles = await collection.find(filter).sort({ createdAt: -1 }).toArray();
      const formatted = profiles.map(p => ({ id: p._id.toString(), ...p, _id: undefined }));

      return res.status(200).json({ success: true, profiles: formatted });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { userId, ...profileData } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const cleanData = {
        ...profileData,
        updatedAt: new Date()
      };

      const result = await collection.updateOne(
        { userId },
        {
          $set: cleanData,
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );

      const updated = await collection.findOne({ userId });
      return res.status(200).json({
        success: true,
        profile: { id: updated._id.toString(), ...updated, _id: undefined }
      });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('MongoDB Profiles API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
