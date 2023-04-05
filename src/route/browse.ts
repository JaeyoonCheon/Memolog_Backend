import express, { Request, Response } from "express";
import { DatabaseError } from "pg";

import pool from "../database/postgreSQL/pool";
import { ResponseError } from "../types";

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id: userId } = req.body.payload;
    const { id: documentId, cursor } = req.query;
    const LIMIT = process.env.DOCUMENT_LIMIT;

    const isFirstPage = documentId ? false : true;

    let query = "";
    let values = [];

    if (isFirstPage) {
      query = `
      SELECT * FROM public.document 
      WHERE user_id!=$1 AND scope='public' 
      ORDER BY created_at DESC, id LIMIT $2
      `;
      values = [userId, LIMIT];
    } else {
      query = `
      SELECT * FROM public.document 
      WHERE user_id!=$1 AND scope='public' AND created_at < $2 OR (created_at = $2 AND id > $3) 
      ORDER BY created_at DESC, id LIMIT $4
      `;
      values = [userId, cursor, documentId, LIMIT];
    }

    if (!isFirstPage && !cursor) {
      throw new ResponseError({
        name: "ER02",
        httpCode: 400,
        message: "Wrong parameter",
      });
    }

    const documentsRows = await client.query({ text: query, values: values });
    const documents = documentsRows.rows;

    const previewDocuments = documents.map((doc) => {
      return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
    });

    res.send(previewDocuments);
  } catch (e) {
    if (e instanceof ResponseError) {
      res.status(e.httpCode).send(e);
    } else if (e instanceof DatabaseError) {
      const error = new ResponseError({
        name: "ER10",
        httpCode: 500,
        message: "Internal Server Error",
      });
      res.status(500).send(error);
    } else {
      console.log("Unhandled Error!");
      const error = new ResponseError({
        name: "ER00",
        httpCode: 500,
        message: "Internal Server Error",
      });
      res.status(500).send(error);
    }
  } finally {
    client.release();
  }
});
