import { Request, Response } from "express";

const express = require("express");

const pool = require("../database/postgreSQL/pool");

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    const { rows } = await client.query("select * from public.document");

    client.release();
    res.send(rows);
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
