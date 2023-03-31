import pool from "../database/postgreSQL/pool";

export const addHashtag = async (name: string) => {
  const client = await pool.connect();
  try {
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
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const addHashtagLog = async (hashtagId: number, accessTime: Date) => {
  const client = await pool.connect();

  try {
    await client.query(
      `INSERT INTO public.hashtag_access (hashtag_id, access_time) VALUES ($1, $2)`,
      [hashtagId, accessTime]
    );
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
};

export const addDocumentHashtag = async (docId: number, hashtagId: number) => {
  const client = await pool.connect();

  await client.query(
    `INSERT INTO public.document_hashtag (doc_id, hash_id) VALUES ($1, $2)`,
    [docId, hashtagId]
  );
};
