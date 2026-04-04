// ═══════════════════════════════════════════════════════════
// CarsIgnite — Email Service
// Uses Resend API (https://resend.com) — set RESEND_API_KEY env var
// Falls back to console.log if no key configured
// ═══════════════════════════════════════════════════════════

const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'CarsIgnite <noreply@carsignite.co.za>';

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.log(`[Email] (no API key) To: ${to} | Subject: ${subject}`);
    console.log(`[Email] Body preview: ${html.replace(/<[^>]*>/g, '').slice(0, 200)}`);
    return { success: true, simulated: true };
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: JSON.parse(body) });
        } else {
          console.error('[Email] Failed:', res.statusCode, body);
          resolve({ success: false, error: body });
        }
      });
    });

    req.on('error', (e) => {
      console.error('[Email] Error:', e.message);
      resolve({ success: false, error: e.message });
    });

    req.write(data);
    req.end();
  });
}

// ═══ Email Templates ═══

function welcomeEmail(member) {
  return sendEmail({
    to: member.email,
    subject: 'Welcome to CarsIgnite! 🏎️',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1E1E1E;color:#F9F9F9;padding:32px;border-radius:16px;">
        <img src="https://static.wixstatic.com/media/bc5beb_f2c426011b1b4ab787724cf5492017d3~mv2.png/v1/fill/w_200,h_30,al_c,q_85/full_logo.png" alt="CarsIgnite" style="height:28px;margin-bottom:24px;" />
        <h2 style="color:#F9F9F9;margin:0 0 8px;">Welcome, ${member.first_name}!</h2>
        <p style="color:#6E7275;font-size:14px;line-height:1.6;">You're now registered on CarsIgnite — South Africa's premier supercar community.</p>
        <div style="background:#2A2A2A;border-radius:12px;padding:16px;margin:20px 0;">
          <div style="color:#22cc6e;font-weight:bold;font-size:14px;margin-bottom:4px;">🎟️ 1 Free Draw Entry</div>
          <p style="color:#6E7275;font-size:12px;margin:0;">You're automatically entered into the next monthly prize draw. No payment needed.</p>
        </div>
        <p style="color:#6E7275;font-size:14px;">Want more entries + GPS tracking, crew chat, and VIP events?</p>
        <a href="${process.env.FRONTEND_URL || 'https://carsignite.vercel.app'}/#pricing" style="display:inline-block;background:#E03455;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;">UPGRADE YOUR MEMBERSHIP</a>
        <p style="color:#3A3A3A;font-size:11px;margin-top:24px;">CarsIgnite (Pty) Ltd · CPA Section 36 · No purchase necessary</p>
      </div>
    `,
  });
}

function paymentConfirmEmail(member, tier, amount) {
  return sendEmail({
    to: member.email,
    subject: `CarsIgnite — Payment Confirmed (R${amount})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1E1E1E;color:#F9F9F9;padding:32px;border-radius:16px;">
        <img src="https://static.wixstatic.com/media/bc5beb_f2c426011b1b4ab787724cf5492017d3~mv2.png/v1/fill/w_200,h_30,al_c,q_85/full_logo.png" alt="CarsIgnite" style="height:28px;margin-bottom:24px;" />
        <h2 style="color:#F9F9F9;margin:0 0 8px;">Payment Confirmed!</h2>
        <div style="background:#2A2A2A;border-radius:12px;padding:16px;margin:20px 0;">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #3A3A3A;font-size:13px;"><span style="color:#6E7275;">Plan</span><span style="font-weight:bold;">${tier.toUpperCase()}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #3A3A3A;font-size:13px;"><span style="color:#6E7275;">Amount</span><span style="color:#f0c040;font-weight:bold;">R${amount}</span></div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;"><span style="color:#6E7275;">Billing</span><span>Monthly via PayFast</span></div>
        </div>
        <p style="color:#6E7275;font-size:12px;">You can manage your subscription from your dashboard. Cancel anytime.</p>
        <p style="color:#3A3A3A;font-size:11px;margin-top:24px;">CarsIgnite (Pty) Ltd</p>
      </div>
    `,
  });
}

function passwordResetEmail(member, resetUrl) {
  return sendEmail({
    to: member.email,
    subject: 'CarsIgnite — Reset Your Password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1E1E1E;color:#F9F9F9;padding:32px;border-radius:16px;">
        <img src="https://static.wixstatic.com/media/bc5beb_f2c426011b1b4ab787724cf5492017d3~mv2.png/v1/fill/w_200,h_30,al_c,q_85/full_logo.png" alt="CarsIgnite" style="height:28px;margin-bottom:24px;" />
        <h2 style="color:#F9F9F9;margin:0 0 8px;">Reset Your Password</h2>
        <p style="color:#6E7275;font-size:14px;line-height:1.6;">Hi ${member.first_name}, we received a request to reset your password. Click below to set a new one:</p>
        <a href="${resetUrl}" style="display:inline-block;background:#E03455;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;margin:20px 0;">RESET PASSWORD</a>
        <p style="color:#6E7275;font-size:12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        <p style="color:#3A3A3A;font-size:11px;margin-top:24px;">CarsIgnite (Pty) Ltd</p>
      </div>
    `,
  });
}

function drawWinnerEmail(member, prizeName, prizeValue) {
  return sendEmail({
    to: member.email,
    subject: `🏆 Congratulations! You won the ${prizeName}!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1E1E1E;color:#F9F9F9;padding:32px;border-radius:16px;">
        <img src="https://static.wixstatic.com/media/bc5beb_f2c426011b1b4ab787724cf5492017d3~mv2.png/v1/fill/w_200,h_30,al_c,q_85/full_logo.png" alt="CarsIgnite" style="height:28px;margin-bottom:24px;" />
        <h2 style="color:#f0c040;margin:0 0 8px;">🏆 YOU WON!</h2>
        <p style="color:#F9F9F9;font-size:16px;font-weight:bold;">${prizeName}</p>
        ${prizeValue > 0 ? `<p style="color:#f0c040;font-size:20px;font-weight:bold;">Value: R${Number(prizeValue).toLocaleString()}</p>` : ''}
        <p style="color:#6E7275;font-size:14px;line-height:1.6;">Congratulations, ${member.first_name}! You've been selected as the winner in our CarsIgnite prize draw.</p>
        <div style="background:#2A2A2A;border-radius:12px;padding:16px;margin:20px 0;">
          <p style="color:#6E7275;font-size:12px;margin:0;">We'll be in touch within 48 hours to arrange prize collection. Please ensure your contact details are up to date on your profile.</p>
        </div>
        <p style="color:#3A3A3A;font-size:11px;margin-top:24px;">CarsIgnite (Pty) Ltd · Independently audited draw · CPA Section 36</p>
      </div>
    `,
  });
}

module.exports = { sendEmail, welcomeEmail, paymentConfirmEmail, passwordResetEmail, drawWinnerEmail };
