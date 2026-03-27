const DID_KEY = process.env.DID_API_KEY || 'Basic Ylc5emFHVkFjMlZqZFhKcGRIbDFjMkZwYm1NdVkyOXQ6RHJDZ1RTRVNWeXZIUlZFamN3TlpP';
const DID_BASE = 'https://api.d-id.com';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.query.path;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  const url = DID_BASE + path;
  console.log('[D-ID]', req.method, url);

  try {
    const opts = {
      method: req.method,
      headers: {
        'Authorization': DID_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    if (req.method !== 'GET' && req.method !== 'DELETE' && req.body) {
      opts.body = JSON.stringify(req.body);
    }

    const r = await fetch(url, opts);
    const text = await r.text();
    console.log('[D-ID] Status:', r.status, text.substring(0, 200));

    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    return res.status(r.status).json(data);
  } catch(e) {
    console.error('[D-ID] Error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
