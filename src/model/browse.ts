import format from "pg-format";

import pool from "@database/postgreSQL/pool";
import { BrowseFirstQuery, BrowseQuery } from "browse";
import { Document } from "document";

export async function browseFirstQuery(
  params: BrowseFirstQuery
): Promise<Document[]> {
  console.log(params);
  const { userID, limit } = params;

  const query = `SELECT D.ID, D.TITLE, D.FORM, D.CREATED_AT, D.UPDATED_AT, D.SCOPE, D.THUMBNAIL_URL, D.USER_ID,
  U.nickname, U.profile_image_url
  FROM public.document AS D
  LEFT JOIN public.USER AS U ON D.USER_ID = U.ID
  WHERE D.user_id!=$1 AND D.scope='public' 
  ORDER BY D.created_at DESC, D.id LIMIT $2`;

  const result = await pool.query<Document>(query, [userID, limit]);

  return result.rows;
}

export async function browseQuery(params: BrowseQuery): Promise<Document[]> {
  const { userID, limit, cursor, id } = params;

  const query = `SELECT D.ID, D.TITLE, D.FORM, D.CREATED_AT, D.UPDATED_AT, D.SCOPE, D.THUMBNAIL_URL, D.USER_ID,
  U.nickname, U.profile_image_url
  FROM public.document AS D
  LEFT JOIN public.USER AS U ON D.USER_ID = U.ID
  WHERE D.user_id!=$1 AND D.scope='public' AND D.created_at < $2 OR (D.created_at = $2 AND D.id > $3) 
  ORDER BY D.created_at DESC, D.id LIMIT $4`;

  const result = await pool.query<Document>(query, [userID, id, cursor, limit]);

  return result.rows;
}
