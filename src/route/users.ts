import { Request, Response } from "express";

import express from "express";
import bcrypt from "bcrypt";

import pool from "../database/postgreSQL/pool";
import redisClient from "../database/redis/client";
import { sign, refresh, refreshVerify } from "../lib/authToken/jwt";

export const router = express.Router();

router.post("/token", async (req: Request, res: Response) => {
  const JWT_SALT = process.env.SALT;
  const refreshToken = req.headers.authorization?.split("Bearer ")[1];
  const { userId } = req.body;

  console.log(refreshToken);
  console.log(userId);

  try {
    if (refreshToken !== undefined && JWT_SALT !== undefined) {
      console.log("start refresh");
      const result = await refreshVerify(refreshToken, Number(userId));
      console.log(result);
      if (result === true) {
        const { token: accessToken, expireTime } = sign(Number(userId));

        res.status(200).send({
          token: {
            accessToken,
            expireTime,
          },
        });
      }
    } else {
      throw new Error("Refresh token is expired!");
    }
  } catch (e) {
    console.log(e);
    res.status(401).send("Token Expired!");
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();

    const { email, password } = req.body;

    const isExistRows = await client.query(
      `SELECT EXISTS (SELECT * FROM public.user WHERE email=$1) AS isExist`,
      [email]
    );
    const isExist = isExistRows.rows[0].isExist;

    if (isExist === false) {
      throw new Error("Email or password is wrong!");
    }

    const savedPasswordRows = await client.query(
      `SELECT password FROM public.user WHERE email=$1;`,
      [email]
    );
    const savedPassword = savedPasswordRows.rows[0].password;
    const compareResult = await bcrypt.compare(password, savedPassword);
    if (!compareResult) {
      throw new Error("Email or password is wrong!");
    }

    const userRows = await client.query(
      `SELECT * FROM public.user WHERE email=$1`,
      [email]
    );
    const {
      id: userId,
      name,
      email: userEmail,
      profile_image,
    } = userRows.rows[0];

    const { token: accessToken, expireTime } = sign(userId);
    const refreshToken = refresh();

    await redisClient.set(String(userId), refreshToken);

    client.release();
    res.status(200).send({
      token: { accessToken, refreshToken, expireTime },
      user: {
        userId,
        name,
        userEmail,
        profile_image,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();

    const { name, email, profile_image = "", password } = req.body;

    //유효성 검증

    const hashSaltRound = Number(process.env.HASH_SALT_ROUND);
    const hashSalt = await bcrypt.genSalt(hashSaltRound);
    const encryptedPassword = await bcrypt.hash(password, hashSalt);

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

router.get("/profile", async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const client = await pool.connect();
    const { rows } = await client.query(
      "SELECT * FROM public.user WHERE id=$1",
      [userId]
    );

    client.release();
    res.send(JSON.stringify(rows[0]));
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

    const oldPasswordRows = await client.query(
      "SELECT password FROM public.user WHERE id=$1",
      [userId]
    );
    const oldPassword = oldPasswordRows.rows[0].password;

    if (password === oldPassword) {
      // 순서 주의
      const profileRows = await client.query(
        "UPDATE public.user SET name=$2, profile_image=$3 where id=$1",
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
