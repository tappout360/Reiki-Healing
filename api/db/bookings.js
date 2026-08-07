// Vercel Serverless Endpoint — Bookings Management (MongoDB)
import { connectToDatabase } from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('bookings');

    if (req.method === 'GET') {
      const { email, id } = req.query;
      let filter = {};

      if (id) {
        try {
          filter._id = new ObjectId(id);
        } catch {
          filter.id = id;
        }
      } else if (email) {
        filter.customerEmail = String(email).toLowerCase();
      }

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

      let queryFilter = {};
      try {
        queryFilter._id = new ObjectId(id);
      } catch {
        queryFilter._id = id;
      }

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
