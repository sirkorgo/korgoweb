const BLOCKED_IPS = [/* '76.176.19.211',*/'2601:5cc:4801:d60:a14c:bd66:f217:f4b0','2603:6000:aff0:4b60:d87a:192f:f44c:14b9','2601:5cc:4801:d60:98cf:5550:7eaf:f3ac','172.118.3.253','2603:8001:99f0:5040:503c:334f:13a1:d3e'];

export default function handler(req, res) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  
  // Normalize IPv6-mapped IPv4 (e.g. ::ffff:1.2.3.4 → 1.2.3.4)
  const normalized = ip.replace(/^::ffff:/, '');
  
  const blocked = BLOCKED_IPS.includes(normalized);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ blocked });
}
