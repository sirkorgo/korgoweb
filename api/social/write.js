import { neon } from '@neondatabase/serverless';
import { BLOCKED_IP_HASHES } from './blacklist.js';
import crypto from 'crypto';

// Hash function to anonymize the incoming client IP
function hashIP(ip) {
  const salt = process.env.IP_SALT || 'fallback-local-salt-string';
  return crypto
    .createHmac('sha256', salt)
    .update(ip)
    .digest('hex');
}

export default async function handler(req, res) {
  // Only accept POST requests for comment submissions
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 1. Extract and clean the incoming client IP
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const cleanIp = rawIp.split(',')[0].trim();
    
    // 2. Hash the IP instantly
    const clientIpHash = hashIP(cleanIp);

    // 3. Firewall enforcement checkpoint
    if (BLOCKED_IP_HASHES.includes(clientIpHash)) {
      return res.status(403).json({ error: "Access Denied" });
    }

    // 4. Initialize Neon and extract data payload
    const sql = neon(process.env.DATABASE_URL);
    const { pageUrl, username, message } = req.body;

    // Validate payload presence before database insertion
    if (!pageUrl || !username || !message) {
      return res.status(400).json({ error: "Missing required comment parameters" });
    }

    // 5. Insert rows safely using Neon tagged template literals (prevents SQL injection)
    await sql`
      INSERT INTO page_data (page_url, username, message, user_ip, created_at) 
      VALUES (${pageUrl}, ${username}, ${message}, ${clientIpHash}, NOW())
    `;

    // Everything succeeded!
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Write pipeline execution failure: ", err);
    // Returning a non-403 error status triggers your compact "Something went wrong" (SUBMIT_FAIL) subtext block!
    return res.status(500).json({ error: "Something went wrong" });
  }
}