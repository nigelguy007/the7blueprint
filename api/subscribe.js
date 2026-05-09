const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const max = 5;
  const hits = (rateLimitMap.get(ip) || []).filter(t => now - t < windowMs);
  if (hits.length >= max) return true;
  hits.push(now);
  rateLimitMap.set(ip, hits);
  return false;
}

function welcomeHtml(firstName) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111111;border-radius:16px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;">
<tr><td style="padding:48px 40px 24px;text-align:center;">
  <svg width="80" height="40" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 100 50 C 130 18 170 18 170 50 C 170 82 130 82 100 50 C 70 18 30 18 30 50 C 30 82 70 82 100 50 Z"
          stroke="#ff8c00" stroke-width="9" fill="none" stroke-linecap="round"/>
  </svg>
  <p style="font-size:12px;font-weight:600;color:#ff8c00;letter-spacing:0.12em;text-transform:uppercase;margin:20px 0 8px;">mobiusinfinity007</p>
  <h1 style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.025em;line-height:1.15;margin:0 0 16px;">
    Hi ${firstName || 'there'} — your blueprint is unlocked.
  </h1>
  <p style="font-size:16px;color:#a1a1a6;line-height:1.55;margin:0 0 32px;">
    Head back to the site to scroll through your seven dimensions. Each one shows your pattern, what to lean into, and what to watch out for.
  </p>
  <a href="https://the7blueprint.com"
     style="display:inline-block;background:#ff8c00;color:#ffffff;font-size:16px;font-weight:500;text-decoration:none;padding:14px 32px;border-radius:980px;">
    View my mobiusinfinity007 ›
  </a>
</td></tr>
<tr><td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
  <p style="font-size:12px;color:#6e6e73;margin:0;line-height:1.6;">
    © 2026 mobiusinfinity007 &nbsp;·&nbsp;
    <a href="https://the7blueprint.com/privacy.html" style="color:#6e6e73;text-decoration:none;">Privacy</a>
    &nbsp;·&nbsp;
    <a href="mailto:hello@the7blueprint.com?subject=Unsubscribe" style="color:#6e6e73;text-decoration:none;">Unsubscribe</a>
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests — try again later' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { email, name } = body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Email service not configured' });

  const firstName = (name || '').split(' ')[0];

  // Add contact
  const payload = { email, updateEnabled: true };
  if (firstName) payload.attributes = { FIRSTNAME: firstName };
  const listId = parseInt(process.env.BREVO_LIST_ID || '', 10);
  if (listId) payload.listIds = [listId];

  const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (contactRes.status !== 201 && contactRes.status !== 204) {
    const err = await contactRes.json().catch(() => ({}));
    if (err.code !== 'duplicate_parameter') {
      return res.status(502).json({ error: err.message || 'Upstream error' });
    }
  }

  // Send welcome email (non-fatal if it fails)
  const fromEmail = process.env.BREVO_SENDER_EMAIL || 'hello@the7blueprint.com';
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'mobiusinfinity007', email: fromEmail },
      to: [{ email, name: name || undefined }],
      subject: 'Your mobiusinfinity007 is unlocked',
      htmlContent: welcomeHtml(firstName),
    }),
  }).catch(() => {});

  return res.status(200).json({ ok: true });
};
