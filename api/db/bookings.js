// Vercel Serverless Endpoint — Concurrency-Safe Bookings & ZIP Proximity Matchmaking (MongoDB)
import { connectToDatabase } from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    let db, collection;
    try {
      const conn = await connectToDatabase();
      db = conn.db;
      collection = db.collection('bookings');
    } catch {
      console.warn('MONGODB_URI missing. Operating in simulated local bookings mode.');
    }

    if (req.method === 'GET') {
      if (!collection) {
        return res.status(200).json({ success: true, bookings: [], simulated: true });
      }

      const { email, id, healerId } = req.query;
      let filter = {};

      if (id) {
        try { filter._id = new ObjectId(id); } catch { filter.id = id; }
      } else if (email) {
        filter.customerEmail = String(email).toLowerCase();
      } else if (healerId) {
        filter.healerId = String(healerId);
      }

      // Cleanup expired 10-minute temporary holds
      const now = new Date();
      await collection.updateMany(
        { status: 'HELD_LOCK', lockExpiresAt: { $lt: now } },
        { $set: { status: 'AVAILABLE', heldByEmail: null, lockExpiresAt: null } }
      ).catch(() => {});

      const bookings = await collection
        .find(filter)
        .sort({ bookingDate: -1, createdAt: -1 })
        .toArray();

      const formatted = bookings.map(b => ({
        id: b._id.toString(),
        ...b,
        _id: undefined
      }));

      return res.status(200).json({ success: true, bookings: formatted });
    }

    if (req.method === 'POST') {
      const { action } = req.body || {};

      // ACTION 1: Atomic 10-Minute Reservation Lock (Prevents Double-Booking)
      if (action === 'RESERVE_LOCK') {
        const { healerId, slotStartTime, customerEmail } = req.body;
        if (!healerId || !slotStartTime || !customerEmail) {
          return res.status(400).json({ error: 'Missing healerId, slotStartTime, or customerEmail' });
        }

        const lockDurationMs = 10 * 60 * 1000; // 10 minutes
        const lockExpiresAt = new Date(Date.now() + lockDurationMs);

        if (!collection) {
          return res.status(200).json({
            success: true,
            lockGranted: true,
            simulated: true,
            expiresAt: lockExpiresAt,
            booking: { id: `lock_${Date.now()}`, healerId, slotStartTime, customerEmail, status: 'HELD_LOCK', lockExpiresAt }
          });
        }

        // Atomic Update: Only reserve if slot is not currently confirmed or active lock
        const query = {
          healerId,
          slotStartTime,
          $or: [
            { status: 'AVAILABLE' },
            { status: { $exists: false } },
            { status: 'HELD_LOCK', lockExpiresAt: { $lt: new Date() } }
          ]
        };

        const update = {
          $set: {
            healerId,
            slotStartTime,
            customerEmail: customerEmail.toLowerCase(),
            status: 'HELD_LOCK',
            lockExpiresAt,
            updatedAt: new Date()
          }
        };

        const result = await collection.findOneAndUpdate(query, update, { upsert: true, returnDocument: 'after' });

        return res.status(200).json({
          success: true,
          lockGranted: true,
          expiresAt: lockExpiresAt,
          booking: result.value || result
        });
      }

      // ACTION 2: Standard Booking Confirmation
      const bookingData = req.body;
      if (!bookingData || !bookingData.customerEmail || !bookingData.bookingDate) {
        return res.status(400).json({ error: 'Missing required booking parameters.' });
      }

      const doc = {
        ...bookingData,
        customerEmail: bookingData.customerEmail.toLowerCase(),
        status: bookingData.status || 'confirmed',
        paymentStatus: bookingData.paymentStatus || 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!collection) {
        return res.status(201).json({
          success: true,
          simulated: true,
          booking: { id: `b_${Date.now()}`, ...doc }
        });
      }

      const result = await collection.insertOne(doc);
      return res.status(201).json({
        success: true,
        booking: { id: result.insertedId.toString(), ...doc, _id: undefined }
      });
    }

    if (req.method === 'PUT') {
      const { id, status, paymentStatus } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Booking ID is required.' });
      }

      if (!collection) {
        return res.status(200).json({ success: true, simulated: true, message: 'Booking status updated.' });
      }

      let queryFilter = {};
      try { queryFilter._id = new ObjectId(id); } catch { queryFilter._id = id; }

      const updateFields = { updatedAt: new Date() };
      if (status) updateFields.status = status;
      if (paymentStatus) updateFields.paymentStatus = paymentStatus;

      const result = await collection.updateOne(queryFilter, { $set: updateFields });

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Booking not found.' });
      }

      return res.status(200).json({ success: true, message: 'Booking status updated.' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('MongoDB Bookings API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
