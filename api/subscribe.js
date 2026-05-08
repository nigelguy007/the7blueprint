module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

  const payload = { email, updateEnabled: true };
  if (name) payload.attributes = { FIRSTNAME: name.split(' ')[0] };
  const listId = parseInt(process.env.BREVO_LIST_ID || '', 10);
  if (listId) payload.listIds = [listId];

  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (r.status === 201 || r.status === 204) return res.status(200).json({ ok: true });

  const err = await r.json().catch(() => ({}));
  if (err.code === 'duplicate_parameter') return res.status(200).json({ ok: true });
  return res.status(502).json({ error: err.message || 'Upstream error' });
};
