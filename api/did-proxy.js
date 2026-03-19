// /api/did-proxy.js
// Vercel serverless function - proxies D-ID API calls to avoid CORS
// Deploy this alongside index.html in your GitHub repo

const DID_KEY = process.env.DID_API_KEY || 'Basic bW9zaGVAc2VjdXJpdHl1c2FpbmMuY29t:7z_W-YjyEMxb3qUbo2v9F';
const DID_BASE = 'https://api.d-id.com';

export default async function handler(req, res) {
  // Allow all origins (your Vercel domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the D-ID endpoint path from query param
  // e.g. /api/did-proxy?path=/talks/streams
  const path = req.query.path || '/talks/streams';
  const url  = DID_BASE + path;

  try {
    const options = {
      method:  req.method,
      headers: {
        'Authorization': DID_KEY,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'DELETE' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const text = await response.text();

    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    res.status(response.status).json(data);
  } catch (err) {
    console.error('D-ID proxy error:', err);
    res.status(500).json({ error: err.message });
  }
}
