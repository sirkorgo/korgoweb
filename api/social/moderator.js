import { BLOCKED_IPS } from './blacklist.js';

export default function handler(req, res) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  
  // Normalize IPv6-mapped IPv4 addresses
  const normalizedIp = ip.replace(/^::ffff:/, '');
  
  // Check if the user's IP is in our central blocklist
  const blocked = BLOCKED_IPS.includes(normalizedIp);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ blocked });
}