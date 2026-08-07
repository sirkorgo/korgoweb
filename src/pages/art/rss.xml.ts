import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const art = await getCollection('art');
  art.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const itemsXml = art
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.data.title}]]></title>
      <link>https://www.sirkorgo.com/art/${a.id}</link>
      <guid>https://www.sirkorgo.com/art/${a.id}</guid>
      <pubDate>${a.data.date.toUTCString()}</pubDate>
      <description><![CDATA[Artwork: ${a.data.title}]]></description>
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>sirkorgo.com - Art</title>
    <link>https://www.sirkorgo.com/portfolio</link>
    <description>Artworks from sirkorgo.com</description>
    <language>en</language>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
