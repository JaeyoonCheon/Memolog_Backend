import { Request, Response } from "express";

const express = require("express");

const pool = require("../database/postgreSQL/pool");

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    const { rows } = await client.query("select * from public.user");

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

    const { name, email, profile_image } = req.body;

    console.log(req.body);

    await client.query(
      `INSERT INTO public.user (name, email, profile_image) values ($1, $2, $3);`,
      [name, email, profile_image]
    );
    client.release();
    res.status(200).send("Data insert successfully.");
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});
