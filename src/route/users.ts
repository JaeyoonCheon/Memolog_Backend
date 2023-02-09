import { Request, Response } from "express";

const express = require("express");
const bcrypt = require("bcrypt");

const pool = require("../database/postgreSQL/pool");
const redisClient = require("../database/redis");
const jwt = require("../lib/authToken/jwt");

export const router = express.Router();

router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const client = await pool.connect();
    const { rows } = await client.query(
      "select * from public.user where id=$1",
      [userId]
    );

    client.release();
    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();

    const { email, password } = req.body;

    const { isAccountExist } = await client.query(
      "SELECT EXISTS (SELECT * FROM public.user WHERE email=$1) AS email_check",
      [email]
    );

    if (isAccountExist === 0) {
      throw new Error("Email or password is wrong!");
    }

    const hashSalt = await bcrypt.genSalt(process.env.HASH_SALT_ROUND);
    const encryptedPassword = await bcrypt.hash(password, hashSalt);

    const { comparisonPW } = await client.query(
      `SELECT password FROM public.user WHERE email=$1;`,
      [email, encryptedPassword]
    );

    if (await bcrypt.compare(encryptedPassword, comparisonPW === false)) {
      throw new Error("Email or password is wrong!");
    }

    const { userId } = await client.query(
      "SELECT id FROM public.user WHERE email=$1",
      [email]
    );

    const accessToken = jwt.sign(userId);
    const refreshToken = jwt.refresh();

    redisClient.set(userId, refreshToken);

    client.release();
    res.status(200).send({
      token: { accessToken, refreshToken },
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();

    const { name, email, profile_image, password } = req.body;

    const encryptedPassword = password;

    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const created_at = new Date(Date.now() - localeOffset);
    const updated_at = created_at;

    await client.query(
      `INSERT INTO public.user (name, email, profile_image, password, created_at, updated_at) values ($1, $2, $3, $4, $5, $6);`,
      [name, email, profile_image, encryptedPassword, created_at, updated_at]
    );
    client.release();
    res.status(200).send("Data insert successfully.");
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

// 현재 ID로 구현. 이후 jwt active token으로 변경 예정
router.patch("/:userId/profile", async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const client = await pool.connect();

    const { name, profile_image } = req.body;

    // 순서 주의
    const { rows } = await client.query(
      "UPDATE public.user SET name=$2, profile_image=$3 where id=$1",
      [userId, name, profile_image]
    );

    client.release();
    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

// 현재 ID로 구현. 이후 jwt active token으로 변경 예정
router.patch("/:userId/pw", async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const client = await pool.connect();

    const { password } = req.body;

    const { oldPassword } = await client.query(
      "SELECT password FROM public.user WHERE id=$1",
      [userId]
    );

    if (password === oldPassword) {
      // 순서 주의
      const { rows } = await client.query(
        "UPDATE public.user SET name=$2, profile_image=$3 where id=$1",
        [password]
      );

      client.release();
      res.send(rows);
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
