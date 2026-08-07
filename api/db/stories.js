// Vercel Serverless Endpoint — Stories & Testimonials (MongoDB)
import { connectToDatabase } from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    let db, collection;
    try {
      const conn = await connectToDatabase();
      db = conn.db;
      collection = db.collection('stories');
    } catch {
      console.warn('MONGODB_URI missing. Operating in simulated local stories mode.');
    }

    if (req.method === 'GET') {
      if (!collection) {
        return res.status(200).json({ success: true, stories: [], simulated: true });
      }

      const { all } = req.query;
      const filter = all === 'true' ? {} : { status: 'approved' };

      const stories = await collection
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray();

      const formatted = stories.map(s => ({ id: s._id.toString(), ...s, _id: undefined }));
      return res.status(200).json({ success: true, stories: formatted });
    }

    if (req.method === 'POST') {
      const story = req.body;
      if (!story || !story.content) {
        return res.status(400).json({ error: 'Story content is required.' });
      }

      const doc = {
        ...story,
        status: story.status || 'pending',
        createdAt: new Date()
      };

      if (!collection) {
        return res.status(201).json({
          success: true,
          simulated: true,
          story: { id: `story_${Date.now()}`, ...doc }
        });
      }

      const result = await collection.insertOne(doc);
      return res.status(201).json({
        success: true,
        story: { id: result.insertedId.toString(), ...doc, _id: undefined }
      });
    }

    if (req.method === 'PUT') {
      const { id, status, storyId, action } = req.body || {};
      const targetId = id || storyId;
      const newStatus = status || (action === 'APPROVE' ? 'approved' : 'rejected');

      if (!targetId) {
        return res.status(400).json({ error: 'Story ID is required.' });
      }

      if (!collection) {
        return res.status(200).json({ success: true, simulated: true, message: 'Story status updated.' });
      }

      let queryFilter = {};
      try { queryFilter._id = new ObjectId(targetId); } catch { queryFilter._id = targetId; }

      await collection.updateOne(queryFilter, { $set: { status: newStatus, updatedAt: new Date() } });
      return res.status(200).json({ success: true, message: 'Story status updated.' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('MongoDB Stories API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
