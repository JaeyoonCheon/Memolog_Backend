import pool from "../database/postgreSQL/pool";

export const addHashtag = async (name: string) => {
  const client = await pool.connect();

  const isExistRows = await client.query(
    `SELECT EXISTS (SELECT * FROM public.hashtag WHERE name=$1) AS exist`,
    [name]
  );
  const isExist = isExistRows.rows[0].exist;

  if (isExist) {
    const hashtagId = await client.query(
      `SELECT id FROM public.hashtag WHERE name=$1`,
      [name]
    );
    return hashtagId.rows[0].id;
  }

  const result = await client.query(
    `INSERT INTO public.hashtag (name) VALUES ($1) RETURNING id;`,
    [name]
  );

  return result.rows[0].id;
};

export const addDocumentHashtag = async (docId: number, hashtagId: number) => {
  const client = await pool.connect();

  await client.query(
    `INSERT INTO public.document_hashtag (doc_id, hash_id) VALUES ($1, $2)`,
    [docId, hashtagId]
  );
};