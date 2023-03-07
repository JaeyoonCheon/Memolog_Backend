import express, { Request, Response } from "express";

import pool from "../database/postgreSQL/pool";

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    const documentsRows = await client.query("SELECT * FROM public.document");
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

    const { title, form, userId } = req.body;

    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const created_at = new Date(Date.now() - localeOffset);
    const updated_at = created_at;

    await client.query(
      `INSERT INTO public.document (title, form, created_at, updated_at, user_id) VALUES ($1, $2, $3, $4, $5)`,
      [title, form, created_at, updated_at, userId]
    );
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

    const { title, form, userId } = req.body;

    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const updated_at = new Date(Date.now() - localeOffset);

    // 순서 주의
    await client.query(
      `UPDATE public.document SET title=$2, form=$3, updated_at=$4, user_id=$5 WHERE id=$1`,
      [documentId, title, form, updated_at, userId]
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

router.get("/browse", async (req: Request, res: Response) => {});
