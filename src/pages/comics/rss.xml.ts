import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const comics = await getCollection('comics');
  comics.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const itemsXml = comics
    .map(
      (c) => `
    <item>
      <title><![CDATA[${c.data.title}]]></title>
      <link>https://www.sirkorgo.com/comics/${c.id}</link>
      <guid>https://www.sirkorgo.com/comics/${c.id}</guid>
      <pubDate>${c.data.date.toUTCString()}</pubDate>
      <description><![CDATA[${c.data.series} - Chapter ${c.data.chapter}]]></description>
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>sirkorgo.com - Comics</title>
    <link>https://www.sirkorgo.com/comics</link>
    <description>Webcomics from sirkorgo.com</description>
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
