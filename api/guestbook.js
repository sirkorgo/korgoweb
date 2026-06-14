export default async function handler(req, res) {
  const response = await fetch('https://sirkorgo.atabook.org/', {
    redirect: 'follow',
    headers: { 'User-Agent': req.headers['user-agent'] || '' }
  });

  const blocked = !response.url.includes('sirkorgo.atabook.org');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ blocked });
}
