import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Grab the page parameter and strip any trailing slash
  const rawPage = req.query.page || '';
  const page = rawPage.replace(/\/$/, ''); 

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // 2. Use the cleaned 'page' variable here
    const result = await sql`
      SELECT payload->'comments' AS comments 
      FROM page_data 
      WHERE page_url = ${page}
    `;

    if (result.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(result[0].comments || []);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}