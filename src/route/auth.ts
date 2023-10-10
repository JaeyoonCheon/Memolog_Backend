import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { DatabaseError } from "pg";
import { verify } from "jsonwebtoken";
import { randomUUID } from "crypto";

import redisClient from "@database/redis/client";
import { accessSign, refreshSign, refreshVerify, CustomJwt } from "@lib/jwt";
import { ResponseError } from "@wrappers/error";
import * as userModel from "@model/user";

export const router = express.Router();

router.post("/check", async (req: Request, res: Response) => {
  const JWT_SALT = process.env.SALT;
  const accessToken = req.headers.authorization?.split("Bearer ")[1];

  try {
    if (accessToken && JWT_SALT) {
      const verified = verify(accessToken, JWT_SALT) as CustomJwt;
      const userID = verified.userID;
      const newAccessToken = accessSign(userID);

      const userRows = await userModel.readUserByUserID(userID);
      const { id, name, email, nickname, profile_image_url } = userRows;

      res.status(200).send({
        token: {
          newAccessToken,
        },
        user: {
          id,
          name,
          email,
          nickname,
          profile_image_url,
        },
      });
    }
  } catch (e) {
    console.error(e);
    if (e instanceof ResponseError) {
      res.status(e.httpStatusCode).send(e);
    } else {
      console.log("Unhandled Error!");
      res.status(500).send("Internal Server Error");
      return;
    }
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  const JWT_SALT = process.env.SALT;
  const refreshToken = req.headers.authorization?.split("Bearer ")[1];

  console.log(`Route refresh : ${refreshToken}`);

  try {
    if (JWT_SALT === undefined) {
      throw new Error("Wrong operation JWT token secure");
    }
    if (refreshToken !== undefined) {
      const verifiedRefresh = await refreshVerify(refreshToken);
      const { userID } = verifiedRefresh;

      const userRows = await userModel.readUserByUserID(userID);
      const { id, name, email, nickname, profile_image_url } = userRows;
      const newAccessToken = accessSign(userID);

      res.status(200).send({
        token: {
          accessToken: newAccessToken,
        },
        user: {
          id,
          name,
          email,
          nickname,
          profile_image_url,
        },
      });
    }
  } catch (e) {
    console.log(e);
    if (e instanceof ResponseError) {
      res.status(e.httpStatusCode).send(e);
    } else {
      console.log("Unhandled Error!");
      res.status(500).send("Internal Server Error");
      return;
    }
  }
});

router.post("/renew-refresh", async (req: Request, res: Response) => {
  const JWT_SALT = process.env.SALT;
  const token = req.headers.authorization?.split("Bearer ")[1];

  try {
    if (JWT_SALT === undefined) {
      throw new Error("Wrong operation JWT token secure");
    }
    if (token !== undefined) {
      const verifiedRefresh = await refreshVerify(token);
      const { userID } = verifiedRefresh;
      const newRefreshToken = refreshSign(userID);

      res.status(200).send({
        token: {
          refreshToken: newRefreshToken,
        },
      });
    }
  } catch (e) {
    console.log(e);
    if (e instanceof ResponseError) {
      res.status(e.httpStatusCode).send(e);
    } else {
      console.log("Unhandled Error!");
      res.status(500).send("Internal Server Error");
      return;
    }
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email: userEmail, password: userPassword } = req.body;

    const existRows = await userModel.verifyEmail(userEmail);

    if (existRows === 0) {
      throw new ResponseError({
        httpStatusCode: 400,
        errorCode: 1002,
        message: "Invalid Email or Password",
      });
    }

    const savedPassword = await userModel.readPasswordByEmail(userEmail);

    const compareResult = await bcrypt.compare(userPassword, savedPassword);
    if (!compareResult) {
      throw new ResponseError({
        httpStatusCode: 400,
        errorCode: 1002,
        message: "Invalid Email or Password",
      });
    }

    const userRows = await userModel.readUserByEmail(userEmail);
    const {
      id,
      name,
      email,
      nickname,
      profile_image_url,
      created_at,
      updated_at,
      scope,
      user_identifier,
    } = userRows;

    const accessToken = accessSign(user_identifier);
    const refreshToken = refreshSign(user_identifier);

    await redisClient.set(String(id), refreshToken);

    res.status(200).send({
      token: { accessToken },
      user: {
        name,
        email,
        nickname,
        profile_image_url,
        created_at,
        updated_at,
        scope,
        user_identifier,
      },
    });
  } catch (e) {
    console.log(e);
    if (e instanceof DatabaseError) {
      const error = new ResponseError({
        httpStatusCode: 500,
      });
      res.status(error.httpStatusCode).send(error);
    } else if (e instanceof ResponseError) {
      res.status(e.httpStatusCode).send(e);
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const {
      name: userName,
      email: userEmail,
      password: userPassword,
      scope: userScope,
    } = req.body;

    //유효성 검증

    const hashSaltRound = Number(process.env.HASH_SALT_ROUND);
    const hashSalt = await bcrypt.genSalt(hashSaltRound);
    const encryptedPassword = await bcrypt.hash(userPassword, hashSalt);

    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const createdTime = new Date(Date.now() - localeOffset);
    const updatedTime = createdTime;

    const DEFAULT_SCOPE = "public";

    const uuidForUserID = randomUUID();

    const newUser = await userModel.createUser({
      name: userName,
      email: userEmail,
      password: encryptedPassword,
      created_at: createdTime,
      updated_at: updatedTime,
      scope: userScope ?? DEFAULT_SCOPE,
      user_identifier: uuidForUserID,
    });

    const userRows = await userModel.readUserByID(newUser);
    const {
      id,
      name,
      email,
      nickname,
      profile_image_url,
      created_at,
      updated_at,
      scope,
      user_identifier,
    } = userRows;
    const accessToken = accessSign(user_identifier);
    const refreshToken = refreshSign(user_identifier);

    await redisClient.set(user_identifier, refreshToken);

    res.status(200).send({
      token: { accessToken, refreshToken },
      user: {
        name,
        email,
        nickname,
        profile_image_url,
        created_at,
        updated_at,
        scope,
        user_identifier,
      },
    });
  } catch (e) {
    console.log(e);
    if (e instanceof DatabaseError) {
      const error = new ResponseError({
        httpStatusCode: 500,
      });
      res.status(500).send(error);
    } else {
      const error = new ResponseError({
        httpStatusCode: 500,
      });
      res.status(500).send(error);
    }
  }
});

router.post("/verify-email", async (req: Request, res: Response) => {
  console.log("verify");
  try {
    const { email } = req.body;

    const result = await userModel.verifyEmail(email);

    console.log(result);

    if (result > 0) {
      throw new ResponseError({
        httpStatusCode: 400,
        errorCode: 1101,
        message: "Account validation failed.",
      });
    }

    res.status(200).send("ok");
  } catch (e) {
    console.log(e);
    if (e instanceof DatabaseError) {
      const error = new ResponseError({
        httpStatusCode: 500,
      });
      res.status(500).send(error);
    } else if (e instanceof ResponseError) {
      res.status(e.httpStatusCode).send(e);
    } else {
      console.log("Unhandled Error!");
      res.status(500).send("Internal Server Error");
    }
  }
});
