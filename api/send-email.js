// Vercel Serverless Endpoint — Automated Email Dispatcher (Approvals & Denials)
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, type, userName, reason } = req.body || {};

  if (!to || !type) {
    return res.status(400).json({ error: 'Missing required parameters (to, type)' });
  }

  const sanitizedEmail = String(to).trim().toLowerCase();
  const sanitizedName = userName || 'Valued Seeker';

  // Construct Email HTML Template based on type
  let emailHtml = '';
  let emailSubject = subject;

  if (type === 'APPROVAL') {
    emailSubject = emailSubject || '✨ Your Sanctuary Profile Has Been Approved — Reiki & Sage';
    emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0b0b0f; color: #ffffff; padding: 2rem; border-radius: 16px;">
        <h2 style="color: #d4af37;">Welcome to the Reiki & Sage Collective, ${sanitizedName}!</h2>
        <p style="font-size: 1.05rem; line-height: 1.6; color: #e0e0e0;">
          Master Healer Carissa Bright has reviewed and <strong>APPROVED</strong> your sanctuary profile.
        </p>
        <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid #d4af37; padding: 1.25rem; border-radius: 12px; margin: 1.5rem 0;">
          <p style="margin: 0; color: #50e3c2; font-weight: bold;">✦ FULL ACCESS UNLOCKED ✦</p>
          <p style="margin: 0.5rem 0 0 0; color: #ffffff;">You now have full access to interactive protocol video portals, 8K Chakra visualizers, and sanctuary features.</p>
        </div>
        <p style="color: #aaaaaa; font-size: 0.85rem;">
          Reiki & Sage Healing Arts • https://reikiandsage.com
        </p>
      </div>
    `;
  } else if (type === 'DENIAL') {
    emailSubject = emailSubject || 'Sanctuary Profile Status Update — Reiki & Sage';
    emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0b0b0f; color: #ffffff; padding: 2rem; border-radius: 16px;">
        <h2 style="color: #e74c3c;">Sanctuary Profile Status Update</h2>
        <p style="font-size: 1.05rem; line-height: 1.6; color: #e0e0e0;">
          Hello ${sanitizedName}, Master Healer Carissa Bright has reviewed your registration application.
        </p>
        <div style="background: rgba(231, 76, 60, 0.1); border: 1px solid #e74c3c; padding: 1.25rem; border-radius: 12px; margin: 1.5rem 0;">
          <p style="margin: 0; color: #e74c3c; font-weight: bold;">Status: Registration Not Approved at This Time</p>
          <p style="margin: 0.5rem 0 0 0; color: #ffffff;"><strong>Reason Provided:</strong> ${reason || 'Application does not meet current sanctuary intake requirements.'}</p>
        </div>
        <p style="line-height: 1.6; color: #cccccc;">
          If you have questions or wish to submit additional details, please contact Master Healer Carissa Bright at carissabright@gmail.com.
        </p>
        <p style="color: #aaaaaa; font-size: 0.85rem;">
          Reiki & Sage Healing Arts • https://reikiandsage.com
        </p>
      </div>
    `;
  }

  // Attempt real SMTP send if credentials exist, otherwise log to audit
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: '"Master Healer Carissa Bright" <notifications@reikiandsage.com>',
        to: sanitizedEmail,
        subject: emailSubject,
        html: emailHtml
      });

      return res.status(200).json({ success: true, delivered: true, message: `Email dispatched to ${sanitizedEmail}` });
    } catch (err) {
      console.error('SMTP Email Dispatch Error:', err);
      return res.status(200).json({ success: true, delivered: false, simulated: true, note: 'Logged dispatch to system logs' });
    }
  }

  // Simulated Dispatch fallback
  console.log(`[EMAIL DISPATCH SIMULATION] Type: ${type} | To: ${sanitizedEmail} | Subject: ${emailSubject}`);
  return res.status(200).json({
    success: true,
    simulated: true,
    message: `Email dispatch simulated for ${sanitizedEmail}`,
    details: { to: sanitizedEmail, type, reason }
  });
}
