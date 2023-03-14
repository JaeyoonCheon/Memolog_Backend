import express, { Request, Response } from "express";

import pool from "../database/postgreSQL/pool";

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const { id: userId } = req.body.payload;

  try {
    const client = await pool.connect();

    const documentsRows = await client.query(
      "SELECT * FROM public.document WHERE user_id!=$1 ORDER BY created_at DESC",
      [userId]
    );
    const documents = documentsRows.rows;

    const previewDocuments = documents.map((doc) => {
      return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
    });

    client.release();
    res.send(previewDocuments);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});
