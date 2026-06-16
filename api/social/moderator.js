import { BLOCKED_IP_HASHES } from './blacklist.js';
import crypto from 'crypto';

// Hash function to anonymize the incoming client IP
function hashIP(ip) {
  // Pulls the secret salt you set up in your Vercel Environment Settings
  const salt = process.env.IP_SALT || 'fallback-local-salt-string';
  return crypto
    .createHmac('sha256', salt)
    .update(ip)
    .digest('hex');
}

export default async function handler(req, res) {
  try {
    // 1. Safely extract the raw client IP from Vercel's Edge headers
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    
    // x-forwarded-for can sometimes return a comma-separated chain of proxy IPs. 
    // We split it and grab the very first one, which is the actual user.
    const cleanIp = rawIp.split(',')[0].trim();

    // 2. Instantly hash it so we aren't dealing with raw network identities
    const clientIpHash = hashIP(cleanIp);

    // 3. Match against your array of secure hashes
    const isBlocked = BLOCKED_IP_HASHES.includes(clientIpHash);

    // Return the decision to the frontend framework layout
    return res.status(200).json({ blocked: isBlocked });

  } catch (err) {
    console.error("Moderator pipeline execution failure: ", err);
    // Returning a 500 status triggers your custom "Something went wrong" (MODERATION_FAIL) screen!
    return res.status(500).json({ error: "Internal Server Error" });
  }
}