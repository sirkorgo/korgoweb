import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // CHANGE THIS: Destructure 'page' from the query instead of 'pageUrl'
    const { page } = req.query;

    if (!page) {
      return res.status(400).json({ error: "Missing page query parameter" });
    }

    // Use the 'page' variable down here in your query
    const rows = await sql`
      SELECT username, message, created_at 
      FROM page_data 
      WHERE page_url = ${page}
      ORDER BY created_at ASC
    `;

    return res.status(200).json(rows);

  } catch (err) {
    console.error("Read pipeline execution failure: ", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}