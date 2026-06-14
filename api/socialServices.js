const BLOCKED_IPS = ['76.176.19.211'];

export default function handler(req, res) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  
  // Normalize IPv6-mapped IPv4 (e.g. ::ffff:1.2.3.4 → 1.2.3.4)
  const normalized = ip.replace(/^::ffff:/, '');
  
  const blocked = BLOCKED_IPS.includes(normalized);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ blocked });
}
