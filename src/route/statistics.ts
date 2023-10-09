import express, { Request, Response } from "express";
import { DatabaseError } from "pg";

import pool from "@/database/postgreSQL/pool";
import { ResponseError } from "@wrappers/error";

export const router = express.Router();

router.get("/hashtag-trends", async (req: Request, res: Response) => {
  const LIMIT = process.env.DOCUMENT_LIMIT;

  const client = await pool.connect();

  try {
    const query = `
        SELECT h.id, h.name, COUNT(h.name) cnt
        FROM public.hashtag_access AS ha
        LEFT JOIN
        (SELECT id, name FROM public.hashtag) AS h
        ON ha.hashtag_id = h.id
        GROUP BY h.id, h.name
        ORDER BY cnt DESC, h.name ASC
        LIMIT $1
      `;

    const result = await client.query(query, [LIMIT]);

    const stat = result.rows;

    res.status(200).json(stat);
  } catch (e) {
    if (e instanceof ResponseError) {
      res.status(e.httpStatusCode).send(e);
    } else if (e instanceof DatabaseError) {
      const error = new ResponseError({
        httpStatusCode: 500,
      });
      res.status(500).send(error);
    } else {
      const error = new ResponseError({
        httpStatusCode: 500,
      });
      res.status(500).send(error);
    }
  } finally {
    client.release();
  }
});

router.get("/frequency", async (req: Request, res: Response) => {
  const { id: userId } = req.body.payload;
  const LIMIT = process.env.DOCUMENT_LIMIT;

  const client = await pool.connect();

  try {
    const query = `
        SELECT h.id, h.name, COUNT(h.name) cnt FROM public.document AS d
        FULL OUTER JOIN public.document_hashtag AS dh
        ON d.id=dh.doc_id
        LEFT JOIN public.hashtag AS h
        ON dh.hash_id=h.id
        WHERE d.user_id=$1 AND dh.doc_id IS NOT NULL
        GROUP BY h.id, h.name
        ORDER BY cnt DESC
        LIMIT $2
    `;

    const result = await client.query(query, [userId, LIMIT]);

    console.log(result);

    const stat = result.rows;

    res.status(200).json(stat);
  } catch (e) {
    if (e instanceof ResponseError) {
      res.status(e.httpStatusCode).send(e);
    } else if (e instanceof DatabaseError) {
      const error = new ResponseError({
        httpStatusCode: 500,
      });
      res.status(500).send(error);
    } else {
      console.log("Unhandled Error!");
      const error = new ResponseError({
        httpStatusCode: 500,
      });
      res.status(500).send(error);
    }
  } finally {
    client.release();
  }
});
