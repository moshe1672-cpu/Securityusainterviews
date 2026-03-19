const DID_KEY  = process.env.DID_API_KEY  || 'Basic bW9zaGVAc2VjdXJpdHl1c2FpbmMuY29t:7z_W-YjyEMxb3qUbo2v9F';
const DID_BASE = 'https://api.d-id.com';

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.query.path;
  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  const url = DID_BASE + path;
  console.log('[D-ID Proxy]', req.method, url);

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Authorization': DID_KEY,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      }
    };

    if (req.method !== 'GET' && req.method !== 'DELETE') {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (body && body !== 'undefined' && body !== 'null') {
        fetchOptions.body = body;
      }
    }

    const response = await fetch(url, fetchOptions);
    const text = await response.text();

    console.log('[D-ID Proxy] Response status:', response.status);

    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      data = { raw: text };
    }

    return res.status(response.status).json(data);

  } catch (err) {
    console.error('[D-ID Proxy] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
