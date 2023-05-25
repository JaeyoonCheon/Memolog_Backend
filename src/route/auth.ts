import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { DatabaseError } from "pg";

import pool from "../database/postgreSQL/pool";
import redisClient from "../database/redis/client";
import { sign, refresh, refreshVerify } from "../lib/authToken/jwt";
import { CustomError, ResponseError } from "../types";
import client from "../database/redis/client";

export const router = express.Router();

router.post("/token", async (req: Request, res: Response) => {
  const JWT_SALT = process.env.SALT;
  const refreshToken = req.headers.authorization?.split("Bearer ")[1];
  const { userId } = req.body;

  console.log(refreshToken);
  console.log(userId);

  try {
    if (JWT_SALT === undefined) {
      throw new CustomError({
        name: "WrongSecureCode",
        message: "Wrong operation JWT token secure",
      });
    }
    if (refreshToken !== undefined) {
      await refreshVerify(refreshToken, Number(userId));
      const { token: accessToken, expireTime } = sign(Number(userId));

      res.status(200).send({
        token: {
          accessToken,
          expireTime,
        },
      });
    }
  } catch (e) {
    console.log(e);
    if (e instanceof CustomError) {
      res.status(500).send("Internal Server Error");
    } else if (e instanceof ResponseError) {
      res.status(e.httpCode).send(e);
    } else {
      console.log("Unhandled Error!");
      res.status(500).send("Internal Server Error");
      return;
    }
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { email: userEmail, password: userPassword } = req.body;

    const isExistRows = await client.query(
      `SELECT EXISTS (SELECT * FROM public.user WHERE email=$1) AS isExist`,
      [userEmail]
    );
    const isExist = isExistRows.rows[0].isExist;

    if (isExist === false) {
      throw new ResponseError({
        name: "ER08",
        httpCode: 400,
        message: "Invalid Email or Password",
      });
    }

    const savedPasswordRows = await client.query(
      `SELECT password FROM public.user WHERE email=$1;`,
      [userEmail]
    );
    const savedPassword = savedPasswordRows.rows[0].password;
    const compareResult = await bcrypt.compare(userPassword, savedPassword);
    if (!compareResult) {
      throw new ResponseError({
        name: "ER08",
        httpCode: 400,
        message: "Invalid Email or Password",
      });
    }

    const userRows = await client.query(
      `SELECT id, name, email, nickname, profile_image_url FROM public.user WHERE email=$1`,
      [userEmail]
    );
    const { id, name, email, nickname, profile_image_url } = userRows.rows[0];

    const { token: accessToken, expireTime } = sign(id);
    const refreshToken = refresh();

    await redisClient.set(String(id), refreshToken);

    res.status(200).send({
      token: { accessToken, refreshToken, expireTime },
      user: {
        userId: id,
        name,
        userEmail: email,
        nickname,
        profile_image_url,
      },
    });
  } catch (e) {
    console.log(e);
    if (e instanceof CustomError) {
      res.status(500).send("Internal Server Error");
    } else if (e instanceof DatabaseError) {
      const error = new ResponseError({
        name: "ER10",
        httpCode: 500,
        message: "Internal Server Error",
      });
      res.status(500).send(error);
    } else if (e instanceof ResponseError) {
      res.status(e.httpCode).send(e);
    } else {
      console.log("Unhandled Error!");
      res.status(500).send("Internal Server Error");
    }
  } finally {
    client.release();
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      name: userName,
      email: userEmail,
      password: userPassword,
    } = req.body;

    //유효성 검증

    const hashSaltRound = Number(process.env.HASH_SALT_ROUND);
    const hashSalt = await bcrypt.genSalt(hashSaltRound);
    const encryptedPassword = await bcrypt.hash(userPassword, hashSalt);

    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const created_at = new Date(Date.now() - localeOffset);
    const updated_at = created_at;

    const DEFAULT_SCOPE = "public";

    const newUserRows = await client.query(
      `INSERT INTO public.user 
      (name, email, password, created_at, updated_at, scope) 
      values ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, scope;`,
      [
        userName,
        userEmail,
        encryptedPassword,
        created_at,
        updated_at,
        DEFAULT_SCOPE,
      ]
    );

    const { id: userId, name, email, scope } = newUserRows.rows[0];

    const { token: accessToken, expireTime } = sign(userId);
    const refreshToken = refresh();

    await redisClient.set(String(userId), refreshToken);

    res.status(200).send({
      token: { accessToken, refreshToken, expireTime },
      user: {
        userId,
        name,
        email,
        scope,
      },
    });
  } catch (e) {
    console.log(e);
    if (e instanceof DatabaseError) {
      const error = new ResponseError({
        name: "ER10",
        httpCode: 500,
        message: "Internal Server Error",
      });
      res.status(500).send(error);
    } else {
      console.log("Unhandled Error!");
      const error = new ResponseError({
        name: "ER00",
        httpCode: 500,
        message: "Internal Server Error",
      });
      res.status(500).send(error);
    }
  } finally {
    client.release();
  }
});

router.post("/check-email-duplicated", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { email } = req.body;

    console.log(email);

    const result = await client.query(
      `SELECT u.email FROM public.user AS u
      WHERE u.email=$1;`,
      [email]
    );

    if (result.rowCount > 0) {
      throw new ResponseError({
        name: "ER11",
        httpCode: 400,
        message: "Account validation failed.",
      });
    }

    res.status(200).send("Check Successful.");
  } catch (e) {
    console.log(e);
    if (e instanceof DatabaseError) {
      const error = new ResponseError({
        name: "ER10",
        httpCode: 500,
        message: "Internal Server Error",
      });
      res.status(500).send(error);
    } else if (e instanceof ResponseError) {
      res.status(e.httpCode).send(e);
    } else {
      console.log("Unhandled Error!");
      res.status(500).send("Internal Server Error");
    }
  } finally {
    client.release();
  }
});
