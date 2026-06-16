import { neon } from '@neondatabase/serverless';
import { BLOCKED_IPS } from './blacklist.js';

export default async function handler(req, res) {
  // 1. Strictly enforce POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Extract and normalize incoming IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  const normalizedIp = ip.replace(/^::ffff:/, '');

  // 3. Reject blocked IPs instantly before running database queries
  if (BLOCKED_IPS.includes(normalizedIp)) {
    return res.status(403).json({ error: '403 Forbidden' });
  }

  const { pageUrl, username, message } = req.body;

  // 4. Validate payload presence
  if (!pageUrl || !username || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 5. Enforce safety character limits to prevent database payload flooding
  if (message.length > 250 || username.length > 50) {
    return res.status(400).json({ error: 'Character limit exceeded' });
  }

  // 6. Strip any trailing slash from the incoming page URL
  const sanitizedPageUrl = pageUrl.replace(/\/$/, '');

  try {
    const sql = neon(process.env.DATABASE_URL);
    const createdAt = new Date().toISOString();

    // Pack the parameters together into a secure JSON string
    const newCommentString = JSON.stringify({ 
      username, 
      message, 
      createdAt 
    });

    // 7. Execute the atomic JSONB update/insert engine inside Neon
    await sql`
      INSERT INTO page_data (page_url, payload)
      VALUES (
        ${sanitizedPageUrl}, 
        jsonb_build_object('comments', jsonb_build_array(${newCommentString}::jsonb), 'reactions', '{}'::jsonb)
      )
      ON CONFLICT (page_url) 
      DO UPDATE SET payload = jsonb_set(
        page_data.payload, 
        '{comments}', 
        (page_data.payload->'comments') || ${newCommentString}::jsonb
      );
    `;

    return res.status(201).json({ success: true });

  } catch (error) {
    console.error("Database Engine Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}