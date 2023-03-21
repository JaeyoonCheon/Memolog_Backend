import express, { Request, Response } from "express";

import pool from "../database/postgreSQL/pool";

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const { id: userId } = req.body.payload;
  const { id: documentId, cursor } = req.query;
  const LIMIT = process.env.DOCUMENT_LIMIT;
  const isFirstPage = documentId ? false : true;

  try {
    const client = await pool.connect();
    const query = isFirstPage
      ? `SELECT * FROM public.document WHERE user_id!=$1 AND scope='public' ORDER BY created_at DESC, id LIMIT $2`
      : `SELECT * FROM public.document WHERE user_id!=$1 AND scope='public' AND created_at < $2 OR (created_at = $2 AND id > $3) ORDER BY created_at DESC, id LIMIT $4`;

    if (isFirstPage) {
      const documentsRows = await client.query(query, [userId, LIMIT]);
      const documents = documentsRows.rows;

      const previewDocuments = documents.map((doc) => {
        return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
      });

      client.release();
      res.send(previewDocuments);
    } else {
      const documentsRows = await client.query(query, [
        userId,
        cursor,
        documentId,
        LIMIT,
      ]);
      const documents = documentsRows.rows;

      const previewDocuments = documents.map((doc) => {
        return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
      });

      client.release();
      res.send(previewDocuments);
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});
