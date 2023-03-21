import { setDefaultResultOrder } from "dns";
import express, { Request, Response } from "express";

import pool from "../database/postgreSQL/pool";
import { addHashtag, addDocumentHashtag } from "../controller/documents";

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const { id: userId } = req.body.payload;
  const { id: documentId, cursor, sort, order } = req.query;
  const LIMIT = process.env.DOCUMENT_LIMIT;

  const isFirstPage = documentId ? false : true;

  const baseQuery = `SELECT * FROM public.document WHERE user_id=$1`;

  let query = "";

  if (isFirstPage) {
    query = `${baseQuery} ORDER BY ${sort} ${order} LIMIT ${LIMIT}`;

    try {
      const client = await pool.connect();

      const documentsRows = await client.query(query, [userId]);
      const documents = documentsRows.rows;

      const previewDocuments = documents.map((doc) => {
        return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
      });

      client.release();
      res.send(previewDocuments);
    } catch (e) {}
  } else {
    if (order === "DESC") {
      query = `${baseQuery} AND ${sort} < $2
    OR (${sort} = $2 AND id>$3)
    ORDER BY ${sort} DESC, id LIMIT ${LIMIT}`;
    } else if (order === "ASC") {
      query = `${baseQuery} AND ${sort} > $2
    OR (${sort} = $2 AND id>$3)
    ORDER BY ${sort}, id ASC LIMIT ${LIMIT}`;
    } else {
      throw new Error("wrong parameter");
    }

    try {
      const client = await pool.connect();

      const documentsRows = await client.query(query, [
        userId,
        cursor,
        documentId,
      ]);
      const documents = documentsRows.rows;

      const previewDocuments = documents.map((doc) => {
        return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
      });

      client.release();
      res.send(previewDocuments);
    } catch (e) {}
  }
});

// SELECT * FROM public.document D LEFT JOIN public.document_hashtag DH ON D.id=DH.doc_id LEFT JOIN public.hashtag H ON DH.hash_id=H.id;

router.get("/:documentId", async (req: Request, res: Response) => {
  const documentId = req.params.documentId;

  try {
    const client = await pool.connect();
    const documentsRows = await client.query(
      "SELECT * FROM public.document WHERE id=$1",
      [documentId]
    );
    const document = documentsRows.rows[0];

    client.release();
    res.send(document);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();

    const { title, form, userId, scope, thumbnail_url } = req.body;

    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const created_at = new Date(Date.now() - localeOffset);
    const updated_at = created_at;

    const docIdRows = await client.query(
      `INSERT INTO public.document (title, form, created_at, updated_at, user_id, scope, thumbnail_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
      [title, form, created_at, updated_at, userId, scope, thumbnail_url]
    );

    const hashtags = ["test", "test1"];

    if (hashtags instanceof Array && hashtags.length > 0) {
      console.log("add hashtags!");

      const hashtagIdsPromise = hashtags.map((hashtag) => addHashtag(hashtag));

      const hashtagIds = await Promise.all(hashtagIdsPromise);

      console.log(hashtagIds);

      const docId = docIdRows.rows[0].id;
      const docHashPromise = hashtagIds.map((hashId) =>
        addDocumentHashtag(docId, hashId)
      );

      await Promise.all(docHashPromise);
    }

    client.release();
    res.status(200).send("Data insert successfully.");
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.post("/:documentId", async (req: Request, res: Response) => {
  const documentId = req.params.documentId;

  try {
    const client = await pool.connect();

    const { title, form, scope, thumbnail_url } = req.body;

    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const updated_at = new Date(Date.now() - localeOffset);

    await client.query(
      `UPDATE public.document SET title=$1, form=$2, updated_at=$3, scope=$4, thumbnail_url=$5 WHERE id=$6`,
      [title, form, updated_at, scope, thumbnail_url, documentId]
    );
    client.release();
    res.status(200).send("Data update successfully.");
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.delete("/:documentId", async (req: Request, res: Response) => {
  const documentId = req.params.documentId;
  try {
    const client = await pool.connect();

    await client.query(`DELETE FROM public.document WHERE id=$1`, [documentId]);
    client.release();
    res.status(200).send("Data delete successfully.");
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});
