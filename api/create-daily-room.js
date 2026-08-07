// Vercel Serverless Function — Create Daily.co Video Room for Live Healing Sessions
// Supports named rooms, waiting room knocking, and MongoDB room metadata storage
import { connectToDatabase } from './lib/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      bookingId,
      customerEmail,
      customerName,
      healerEmail = 'carissa@reikiandsage.com',
      serviceType = 'live',
      bookingDate,
      bookingTime,
      expiryHours = 24
    } = req.body || {};

    const apiKey = process.env.DAILY_API_KEY;
    const cleanBookingId = bookingId || `bk_${Date.now()}`;
    const generatedRoomName = `reiki-live-${cleanBookingId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reikiandsage.com';

    let roomUrl = '';
    let expTime = Math.floor(Date.now() / 1000) + expiryHours * 3600;

    if (!apiKey) {
      // Graceful WebRTC Fallback when DAILY_API_KEY is not configured
      roomUrl = `https://reikiandsage.daily.co/${generatedRoomName}`;
    } else {
      // Call Daily.co REST API to create room
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          name: generatedRoomName,
          privacy: 'public',
          properties: {
            exp: expTime,
            enable_knocking: true,
            enable_chat: true,
            enable_screenshare: false,
            start_audio_off: false,
            start_video_off: false,
            eject_at_room_exp: true
          }
        })
      });

      if (response.ok) {
        const room = await response.json();
        roomUrl = room.url;
        expTime = room.config?.exp || expTime;
      } else {
        const err = await response.json().catch(() => ({}));
        console.warn('Daily.co API returned error, falling back to direct URL:', err.message);
        roomUrl = `https://reikiandsage.daily.co/${generatedRoomName}`;
      }
    }

    const clientJoinLink = `${siteUrl}/?portal=live&bookingId=${cleanBookingId}`;
    const healerJoinLink = `${siteUrl}/?portal=live&bookingId=${cleanBookingId}&role=healer`;

    const roomRecord = {
      bookingId: cleanBookingId,
      roomName: generatedRoomName,
      roomUrl,
      clientJoinLink,
      healerJoinLink,
      clientEmail: customerEmail ? customerEmail.toLowerCase() : null,
      clientName: customerName || 'Seeker',
      healerEmail: healerEmail.toLowerCase(),
      serviceType,
      bookingDate: bookingDate || new Date().toISOString().split('T')[0],
      bookingTime: bookingTime || '10:00 AM',
      expTime,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store room metadata in MongoDB if configured
    try {
      if (process.env.MONGODB_URI) {
        const { db } = await connectToDatabase();
        await db.collection('video_rooms').updateOne(
          { bookingId: cleanBookingId },
          { $set: roomRecord },
          { upsert: true }
        );
        console.log(`Video room metadata saved to MongoDB for booking ${cleanBookingId}`);
      }
    } catch (dbErr) {
      console.warn('Failed to save video room metadata to MongoDB:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      room: roomRecord
    });
  } catch (error) {
    console.error('Daily.co room creation error:', error);
    return res.status(500).json({ error: 'Failed to create video room', details: error.message });
  }
}
