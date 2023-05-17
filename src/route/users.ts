import { Request, Response } from "express";

import express from "express";

import pool from "../database/postgreSQL/pool";

export const router = express.Router();

router.get("/profile/:userId", async (req: Request, res: Response) => {
  const client = await pool.connect();
  const { userId } = req.params;

  try {
    const result = await client.query(
      "SELECT id, nickname, profile_image_url FROM public.user WHERE id=$1",
      [userId]
    );

    res.status(200).send(result.rows[0]);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  } finally {
    client.release();
  }
});

router.post("/profile/:userId", async (req: Request, res: Response) => {
  const client = await pool.connect();
  const { userId } = req.params;

  try {
    const { nickname, profile_image_url } = req.body;

    console.log(nickname, profile_image_url);

    await client.query(
      "UPDATE public.user SET nickname=$2, profile_image_url=$3 where id=$1",
      [userId, nickname, profile_image_url]
    );

    res.status(200);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  } finally {
    client.release();
  }
});

// 현재 ID로 구현. 이후 jwt active token으로 변경 예정
router.patch("/:userId/pw", async (req: Request, res: Response) => {
  const client = await pool.connect();
  const { userId } = req.params;

  try {
    const { password } = req.body;

    const oldPasswordRows = await client.query(
      "SELECT password FROM public.user WHERE id=$1",
      [userId]
    );
    const oldPassword = oldPasswordRows.rows[0].password;

    if (password === oldPassword) {
      // 순서 주의
      const profileRows = await client.query(
        "UPDATE public.user SET name=$2, profile_image_url=$3 where id=$1",
        [password]
      );
      const profile = profileRows.rows[0];

      client.release();
      res.send(profile);
    } else {
      throw new Error("New password is same to old one!");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.delete("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const client = await pool.connect();

    await client.query("DELETE public.user where id=$1", [userId]);

    client.release();
    res.status(200).send("Data delete successfully.");
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});
