// Vercel Serverless Function — Send Post-Session Thank You & Reflection Email
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, customerName, serviceType, sessionDate } = req.body || {};
    if (!to) {
      return res.status(400).json({ error: 'Recipient email "to" is required.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reikiandsage.com';

    if (!apiKey) {
      console.warn('RESEND_API_KEY is missing. Simulating email dispatch.');
      return res.status(200).json({ success: true, simulated: true });
    }

    const resend = new Resend(apiKey);
    const from = process.env.FROM_EMAIL || 'Reiki & Sage <healing@reikiandsage.com>';

    const htmlContent = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0b0c10; color: #e0e0e0; padding: 30px; border-radius: 12px; border: 1px solid #c9a84c;">
        <h1 style="color: #c9a84c; text-align: center; margin-bottom: 20px;">Peace & Light Unto You</h1>
        <p>Dear ${customerName || 'Seeker'},</p>
        <p>Thank you for entering the sacred healing sanctuary for your ${serviceType === 'live' ? 'Live Video Energy Session' : 'Reiki Session'} on ${sessionDate || 'today'}.</p>
        <p>Your biofield resonance has been aligned. We invite you to record your thoughts, ground your energy, and share a private voice reflection journal:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/?portal=stories" style="background: #c9a84c; color: #000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 30px; display: inline-block;">Record Voice Reflection</a>
        </div>
        <p style="font-size: 0.85em; color: #888; border-top: 1px solid #222; padding-top: 15px;">
          <em>Disclaimer: Reiki & Sage provides spiritual wellness services only. Our sessions are not medical treatments, diagnoses, or clinical care.</em>
        </p>
      </div>
    `;

    await resend.emails.send({
      from,
      to,
      subject: `✨ Session Integration — Reiki & Sage Sanctuary`,
      html: htmlContent
    });

    return res.status(200).json({ success: true, sent: true });
  } catch (error) {
    console.error('Post-session email dispatch error:', error);
    return res.status(500).json({ error: 'Failed to send post-session email', details: error.message });
  }
}
