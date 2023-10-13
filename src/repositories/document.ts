import "reflect-metadata";
import { Service } from "typedi";
import format from "pg-format";

import pool from "@databases/postgreSQL/pool";
import {
  Document,
  ReadDocumentsFirstQuery,
  ReadDocumentsQuery,
  FindDocumentsFirstQuery,
  FindDocumentsQuery,
  Hashtag,
  UpdateDocument,
} from "document";
import { BrowseFirstQuery, BrowseQuery } from "browse";

interface CreateDocumentPayload {
  title: string;
  form: string;
  created_at: Date;
  updated_at: Date;
  userID: string;
  scope: string;
  thumbnail_url: string;
  hashtags: string[];
}
interface CreateDocument {
  id: number;
}

@Service()
export default class DocumentRepository {
  async createDocument(params: CreateDocumentPayload): Promise<number> {
    const {
      title,
      form,
      created_at,
      updated_at,
      userID,
      scope,
      thumbnail_url,
      hashtags,
    } = params;

    const query = `INSERT INTO public.document (title, form, created_at, updated_at, user_identifier, scope, thumbnail_url) 
  VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`;

    const result = await pool.query<CreateDocument>(query, [
      title,
      form,
      created_at,
      updated_at,
      userID,
      scope,
      thumbnail_url,
    ]);

    return result.rows[0].id;
  }

  async readDocumentsFirstQuery(
    params: ReadDocumentsFirstQuery
  ): Promise<Document[]> {
    console.log(params);
    const { userID, limit, sort, order } = params;

    // format for dynamic identifier
    const query = format(
      `SELECT * FROM public.document WHERE user_identifier=$1 
    ORDER BY %I %s LIMIT $2`,
      sort,
      order
    );

    const result = await pool.query<Document>(query, [userID, limit]);

    return result.rows;
  }

  async readDocumentsQuery(params: ReadDocumentsQuery): Promise<Document[]> {
    const { userID, limit, cursor, id, sort, order } = params;

    // format for dynamic identifier
    const query = format(
      `SELECT * FROM public.document 
    WHERE user_identifier = $1 AND %I < $2 OR (%I = $2 AND id > $3)
    ORDER BY %I %s, id LIMIT $4`,
      sort,
      sort,
      sort,
      order
    );

    const result = await pool.query<Document>(query, [
      userID,
      cursor,
      id,
      limit,
    ]);

    return result.rows;
  }

  async readDocument(id: number): Promise<Document> {
    const query = `SELECT * FROM public.document WHERE id=$1`;

    const result = await pool.query<Document>(query, [id]);

    return result.rows[0];
  }

  async readHashtags(id: number): Promise<Hashtag[]> {
    const query = `SELECT H.id, H.name
  FROM public.document D 
  LEFT JOIN public.document_hashtag DH ON D.id=DH.doc_id 
  LEFT JOIN public.hashtag H ON DH.hash_id=H.id
  WHERE D.id=$1 ORDER BY DH.doc_hash_id ASC`;

    const result = await pool.query<Hashtag>(query, [id]);

    return result.rows;
  }

  async findDocumentsFirstQuery(
    params: FindDocumentsFirstQuery
  ): Promise<Document[]> {
    console.log(params);
    const { userID, limit, searchKeyword } = params;

    const query = `SELECT id, title, form, created_at FROM public.document WHERE user_identifier = $2 AND title LIKE '%'||$1||'%' 
  UNION 
  SELECT id, title, form, created_at FROM public.document WHERE user_identifier = $2 AND form LIKE '%'||$1||'%' 
  UNION 
  SELECT D.id, D.title, D.form, D.created_at FROM public.document D
  LEFT JOIN public.document_hashtag DH ON D.id = DH.doc_id 
  LEFT JOIN public.hashtag H ON DH.hash_id = H.id WHERE user_id = $2 AND H.name LIKE '%'||$1||'%'
  ORDER BY created_at DESC, id LIMIT $3`;

    const result = await pool.query<Document>(query, [
      searchKeyword,
      userID,
      limit,
    ]);

    return result.rows;
  }

  async findDocumentsQuery(params: FindDocumentsQuery): Promise<Document[]> {
    const { userID, limit, cursor, id, searchKeyword } = params;

    const query = `SELECT id, title, form, created_at
    FROM
    (SELECT id, title, form, created_at FROM public.document WHERE user_id = $2 AND title LIKE '%'||$1||'%' 
    UNION 
    SELECT id, title, form, created_at FROM public.document WHERE user_id = $2 AND form LIKE '%'||$1||'%' 
    UNION 
    SELECT D.id, D.title, D.form, D.created_at FROM public.document D
    LEFT JOIN public.document_hashtag DH ON D.id = DH.doc_id 
    LEFT JOIN public.hashtag H ON DH.hash_id = H.id WHERE user_id = $2 AND H.name LIKE '%'||$1||'%') AS SR
    WHERE created_at < $4 OR (created_at = $4 AND id < $3)
    ORDER BY created_at DESC, id LIMIT $5`;

    const result = await pool.query<Document>(query, [
      searchKeyword,
      userID,
      id,
      cursor,
      limit,
    ]);

    return result.rows;
  }

  async browseFirstQuery(params: BrowseFirstQuery): Promise<Document[]> {
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

  async browseQuery(params: BrowseQuery): Promise<Document[]> {
    const { userID, limit, cursor, id } = params;

    const query = `SELECT D.ID, D.TITLE, D.FORM, D.CREATED_AT, D.UPDATED_AT, D.SCOPE, D.THUMBNAIL_URL, D.USER_ID,
  U.nickname, U.profile_image_url
  FROM public.document AS D
  LEFT JOIN public.USER AS U ON D.USER_ID = U.ID
  WHERE D.user_id!=$1 AND D.scope='public' AND D.created_at < $2 OR (D.created_at = $2 AND D.id > $3) 
  ORDER BY D.created_at DESC, D.id LIMIT $4`;

    const result = await pool.query<Document>(query, [
      userID,
      id,
      cursor,
      limit,
    ]);

    return result.rows;
  }

  async updateDocument(params: UpdateDocument) {
    const { id, title, form, updated_at, scope, thumbnail_url } = params;

    const query = `UPDATE public.document SET title=$1, form=$2, updated_at=$3, scope=$4, thumbnail_url=$5 
    WHERE id=$6`;

    await pool.query(query, [
      title,
      form,
      updated_at,
      scope,
      thumbnail_url,
      id,
    ]);
  }

  async deleteDocument(id: number) {
    const query = `DELETE FROM public.document WHERE id=$1`;

    await pool.query(query, [id]);
  }

  async deleteDocumentHashtag(id: number) {
    const query = `DELETE FROM public.document_hashtag WHERE doc_id=$1`;

    await pool.query(query, [id]);
  }

  async addHashtag(name: string) {
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
  }

  async addHashtagLog(hashtagId: number, accessTime: Date) {
    const client = await pool.connect();

    await client.query(
      `INSERT INTO public.hashtag_access (hashtag_id, access_time) VALUES ($1, $2)`,
      [hashtagId, accessTime]
    );
  }

  async addDocumentHashtag(docId: number, hashtagId: number) {
    const client = await pool.connect();

    await client.query(
      `INSERT INTO public.document_hashtag (doc_id, hash_id) VALUES ($1, $2)`,
      [docId, hashtagId]
    );
  }
}
