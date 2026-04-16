const TAVUS_API_KEY = process.env.TAVUS_API_KEY || '3ee93daf7ece42928a9da3651a89a856';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.query.path || '/v2/conversations';
  const url = 'https://tavusapi.com' + path;

  try {
    const opts = {
      method: req.method,
      headers: {
        'x-api-key': TAVUS_API_KEY,
        'Content-Type': 'application/json'
      }
    };
    if (req.method === 'POST' && req.body) {
      opts.body = JSON.stringify(req.body);
    }

    const r = await fetch(url, opts);
    const text = await r.text();
    console.log('[Tavus]', req.method, url, '->', r.status, text.substring(0, 200));

    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }
    return res.status(r.status).json(data);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
};
