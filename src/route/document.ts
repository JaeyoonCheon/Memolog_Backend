import { Request, Response } from "express";

const express = require("express");

const pg = require("../database/postgreSQL/pool");

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const client = await pg.connect();
    const { rows } = await client.query("select * from document");

    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.post("/", (req: Request, res: Response) => {
  const item = req.body;

  pg.query();
});
