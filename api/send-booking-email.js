// Vercel Serverless Function — Send Booking Confirmation Emails
// Uses the Resend REST API (https://resend.com) — no npm package needed
// Sends confirmation to customer + notification to the healer (Carissa)

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Format cents to a dollar string, e.g. 1500 → "$15.00"
 */
function formatCents(cents) {
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

/**
 * Build the on-brand HTML email for the customer
 */
function buildCustomerEmailHtml({
  customerName,
  serviceType,
  bookingDate,
  bookingTime,
  price,
  depositAmount
}) {
  const isOnsite = serviceType === 'onsite';
  const serviceLabel = isOnsite ? 'On-Site Healing Session' : 'Live Healing Session';
  const remainingLabel = isOnsite
    ? `<tr><td style="padding:8px 0;color:#b8a88a;">Remaining Balance</td><td style="padding:8px 0;color:#ffffff;text-align:right;">${formatCents(price - depositAmount)} (due at time of service)</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Georgia','Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:16px;border:1px solid #2a2520;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1510 0%,#2a2015 100%);padding:40px 30px;text-align:center;border-bottom:2px solid #c9a84c;">
          <h1 style="margin:0;font-size:28px;color:#c9a84c;letter-spacing:2px;">✦ Reiki &amp; Sage ✦</h1>
          <p style="margin:8px 0 0;color:#b8a88a;font-size:14px;letter-spacing:1px;">HEALING &amp; SPIRITUAL WELLNESS</p>
        </td></tr>

        <!-- Confirmation Banner -->
        <tr><td style="padding:30px 30px 10px;text-align:center;">
          <div style="display:inline-block;background:#1c2a1c;border:1px solid #3a6b3a;border-radius:8px;padding:12px 24px;">
            <span style="color:#6abf69;font-size:18px;">✓</span>
            <span style="color:#a8d8a8;font-size:16px;margin-left:8px;">Booking Confirmed</span>
          </div>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:20px 30px 10px;">
          <p style="color:#e8e0d0;font-size:18px;margin:0;">Dear ${customerName},</p>
          <p style="color:#b8a88a;font-size:15px;margin:10px 0 0;line-height:1.6;">
            Thank you for booking a healing session. Your appointment has been confirmed. Below are your booking details.
          </p>
        </td></tr>

        <!-- Booking Details Table -->
        <tr><td style="padding:20px 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:10px;border:1px solid #2a2520;padding:20px;">
            <tr><td style="padding:8px 0;color:#b8a88a;">Service</td><td style="padding:8px 0;color:#c9a84c;text-align:right;font-weight:bold;">${serviceLabel}</td></tr>
            <tr><td colspan="2" style="border-bottom:1px solid #2a2520;"></td></tr>
            <tr><td style="padding:8px 0;color:#b8a88a;">Date</td><td style="padding:8px 0;color:#ffffff;text-align:right;">${bookingDate}</td></tr>
            <tr><td colspan="2" style="border-bottom:1px solid #2a2520;"></td></tr>
            <tr><td style="padding:8px 0;color:#b8a88a;">Time</td><td style="padding:8px 0;color:#ffffff;text-align:right;">${bookingTime}</td></tr>
            <tr><td colspan="2" style="border-bottom:1px solid #2a2520;"></td></tr>
            <tr><td style="padding:8px 0;color:#b8a88a;">${isOnsite ? 'Deposit Paid' : 'Amount Paid'}</td><td style="padding:8px 0;color:#6abf69;text-align:right;font-weight:bold;">${isOnsite ? formatCents(depositAmount) : formatCents(price)}</td></tr>
            ${remainingLabel}
          </table>
        </td></tr>

        <!-- What to Expect -->
        <tr><td style="padding:10px 30px 20px;">
          <p style="color:#c9a84c;font-size:16px;margin:0 0 8px;font-weight:bold;">What to Expect</p>
          <p style="color:#b8a88a;font-size:14px;margin:0;line-height:1.7;">
            ${isOnsite
              ? 'Please arrive 10 minutes early. Wear comfortable clothing. The remaining balance is due at the time of your session.'
              : 'You will receive a link for your live session before your appointment. Find a quiet, comfortable space where you can relax undisturbed.'}
          </p>
        </td></tr>

        <!-- HIPAA / Wellness Disclaimer -->
        <tr><td style="padding:10px 30px 20px;">
          <div style="background:#1a1510;border:1px solid #2a2520;border-radius:8px;padding:16px;">
            <p style="color:#b8a88a;font-size:12px;margin:0;line-height:1.6;">
              <strong style="color:#c9a84c;">Important Disclaimer:</strong> Reiki &amp; Sage provides spiritual wellness services only. Our sessions are <em>not</em> medical treatments, diagnoses, or substitutes for professional medical care. Always consult a licensed healthcare provider for medical concerns. No medical or health information is collected or stored by our service in compliance with privacy best practices.
            </p>
          </div>
        </td></tr>

        <!-- Contact -->
        <tr><td style="padding:10px 30px 30px;text-align:center;">
          <p style="color:#b8a88a;font-size:14px;margin:0;">Questions? Reach us at</p>
          <p style="margin:4px 0 0;"><a href="mailto:healing@reikiandsage.com" style="color:#c9a84c;text-decoration:none;">healing@reikiandsage.com</a></p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#111111;padding:20px 30px;text-align:center;border-top:1px solid #2a2520;">
          <p style="color:#666;font-size:12px;margin:0;">© ${new Date().getFullYear()} Reiki &amp; Sage. All rights reserved.</p>
          <p style="color:#555;font-size:11px;margin:6px 0 0;">This is a spiritual wellness service, not medical treatment.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Build the notification email HTML for the healer (Carissa)
 */
function buildHealerEmailHtml({
  customerName,
  customerEmail,
  serviceType,
  bookingDate,
  bookingTime,
  price,
  depositAmount
}) {
  const isOnsite = serviceType === 'onsite';
  const serviceLabel = isOnsite ? 'On-Site Healing Session' : 'Live Healing Session';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Georgia','Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:16px;border:1px solid #2a2520;overflow:hidden;">

        <tr><td style="background:linear-gradient(135deg,#1a1510 0%,#2a2015 100%);padding:30px;text-align:center;border-bottom:2px solid #c9a84c;">
          <h1 style="margin:0;font-size:24px;color:#c9a84c;">✦ New Booking ✦</h1>
        </td></tr>

        <tr><td style="padding:24px 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111;border-radius:10px;border:1px solid #2a2520;padding:20px;">
            <tr><td style="padding:6px 0;color:#b8a88a;">Client</td><td style="padding:6px 0;color:#fff;text-align:right;">${customerName}</td></tr>
            <tr><td colspan="2" style="border-bottom:1px solid #2a2520;"></td></tr>
            <tr><td style="padding:6px 0;color:#b8a88a;">Email</td><td style="padding:6px 0;text-align:right;"><a href="mailto:${customerEmail}" style="color:#c9a84c;text-decoration:none;">${customerEmail}</a></td></tr>
            <tr><td colspan="2" style="border-bottom:1px solid #2a2520;"></td></tr>
            <tr><td style="padding:6px 0;color:#b8a88a;">Service</td><td style="padding:6px 0;color:#c9a84c;text-align:right;">${serviceLabel}</td></tr>
            <tr><td colspan="2" style="border-bottom:1px solid #2a2520;"></td></tr>
            <tr><td style="padding:6px 0;color:#b8a88a;">Date</td><td style="padding:6px 0;color:#fff;text-align:right;">${bookingDate}</td></tr>
            <tr><td colspan="2" style="border-bottom:1px solid #2a2520;"></td></tr>
            <tr><td style="padding:6px 0;color:#b8a88a;">Time</td><td style="padding:6px 0;color:#fff;text-align:right;">${bookingTime}</td></tr>
            <tr><td colspan="2" style="border-bottom:1px solid #2a2520;"></td></tr>
            <tr><td style="padding:6px 0;color:#b8a88a;">Total Price</td><td style="padding:6px 0;color:#fff;text-align:right;">${formatCents(price)}</td></tr>
            ${isOnsite
              ? `<tr><td colspan="2" style="border-bottom:1px solid #2a2520;"></td></tr>
                 <tr><td style="padding:6px 0;color:#b8a88a;">Deposit Collected</td><td style="padding:6px 0;color:#6abf69;text-align:right;">${formatCents(depositAmount)}</td></tr>
                 <tr><td colspan="2" style="border-bottom:1px solid #2a2520;"></td></tr>
                 <tr><td style="padding:6px 0;color:#b8a88a;">Remaining</td><td style="padding:6px 0;color:#e8a84c;text-align:right;">${formatCents(price - depositAmount)}</td></tr>`
              : ''}
          </table>
        </td></tr>

        <tr><td style="background:#111;padding:16px 30px;text-align:center;border-top:1px solid #2a2520;">
          <p style="color:#666;font-size:12px;margin:0;">Reiki &amp; Sage — Booking Notification</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Send an email via Resend REST API
 */
async function sendEmail({ from, to, subject, html }) {
  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to, subject, html })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend API error (${res.status}): ${error}`);
  }

  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      to,
      customerName,
      customerEmail,
      serviceType,
      bookingDate,
      bookingTime,
      price,
      depositAmount
    } = req.body;

    if (!to || !customerName || !serviceType || !bookingDate || !bookingTime || !price) {
      return res.status(400).json({ error: 'Missing required email fields.' });
    }

    const fromAddress = process.env.FROM_EMAIL || 'Reiki & Sage <healing@reikiandsage.com>';
    const healerEmail = process.env.HEALER_EMAIL;
    const isOnsite = serviceType === 'onsite';
    const serviceLabel = isOnsite ? 'On-Site Healing Session' : 'Live Healing Session';

    // 1. Send confirmation email to the customer
    const customerHtml = buildCustomerEmailHtml({
      customerName,
      serviceType,
      bookingDate,
      bookingTime,
      price,
      depositAmount
    });

    const customerResult = await sendEmail({
      from: fromAddress,
      to,
      subject: `✦ Booking Confirmed — ${serviceLabel} on ${bookingDate}`,
      html: customerHtml
    });

    console.log('Customer email sent:', customerResult);

    // 2. Send notification email to the healer (Carissa)
    let healerResult = null;
    if (healerEmail) {
      const healerHtml = buildHealerEmailHtml({
        customerName,
        customerEmail: customerEmail || to,
        serviceType,
        bookingDate,
        bookingTime,
        price,
        depositAmount
      });

      healerResult = await sendEmail({
        from: fromAddress,
        to: healerEmail,
        subject: `New Booking: ${customerName} — ${serviceLabel} on ${bookingDate}`,
        html: healerHtml
      });

      console.log('Healer notification sent:', healerResult);
    }

    res.status(200).json({
      success: true,
      customerEmailId: customerResult?.id,
      healerEmailId: healerResult?.id
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send booking emails.' });
  }
}
