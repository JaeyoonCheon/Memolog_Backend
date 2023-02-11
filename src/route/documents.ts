import express, { Request, Response } from "express";

import pool from "../database/postgreSQL/pool";

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    const documentsRows = await client.query("select * from public.document");
    const documents = documentsRows.rows;

    client.release();
    res.send(documents);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();

    const { title, form, created_at, updated_at, user_id } = req.body;

    await client.query(
      `INSERT INTO public.document (title, form, created_at, updated_at, user_id) VALUES ($1, $2, $3, $4, $5)`,
      [title, form, created_at, updated_at, user_id]
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

    const { title, form, updated_at, user_id } = req.body;

    // 순서 주의
    await client.query(
      `UPDATE public.document SET title=$2, form=$3, updated_at=$4, user_id=$5 WHERE id=$1`,
      [documentId, title, form, updated_at, user_id]
    );
    client.release();
    res.status(200).send("Data update successfully.");
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});
