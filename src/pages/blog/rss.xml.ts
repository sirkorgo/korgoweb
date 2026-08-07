import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const itemsXml = posts
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.data.title}]]></title>
      <link>https://www.sirkorgo.com/blog/${p.id}</link>
      <guid>https://www.sirkorgo.com/blog/${p.id}</guid>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
      <description><![CDATA[${p.data.excerpt || p.data.title}]]></description>
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>sirkorgo.com - Blog</title>
    <link>https://www.sirkorgo.com/blog</link>
    <description>Blog posts from sirkorgo.com</description>
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
