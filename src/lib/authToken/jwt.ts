import { promisify } from "util";
import { sign, verify, decode, Jwt, Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import ms from "ms";

import client from "../../database/redis/client";
import { ResponseError } from "../wrapper/error";

export interface CustomJWTPayload {
  userID: string;
}

export type CustomJwt = Jwt & CustomJWTPayload;

const SECRET: Secret = process.env.SALT || "";
const ACCESS_EXPIRE: string = process.env.ACCESS_EXPIRE || "1h";
const REFRESH_EXPIRE: string = process.env.REFRESH_EXPIRE || "7d";

const accessSign = (userID: string) => {
  const expireTime = new Date();
  expireTime.setTime(expireTime.getTime() + ms(ACCESS_EXPIRE));

  const payload: CustomJWTPayload = {
    userID,
  };

  return sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: ACCESS_EXPIRE,
  });
};

const refreshSign = (userID: string) => {
  const expireTime = new Date();
  expireTime.setTime(expireTime.getTime() + ms(ACCESS_EXPIRE));

  const payload: CustomJWTPayload = {
    userID,
  };

  return sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: REFRESH_EXPIRE,
  });
};

const accessVerify = (token: string) => {
  try {
    const decodedPayload = verify(token, SECRET);
    return decodedPayload;
  } catch (e) {
    throw e;
  }
};

const refreshVerify = async (token: string) => {
  try {
    const decodedTokenPayload = decode(token) as CustomJWTPayload;
    const { userID } = decodedTokenPayload;
    const refreshData = await client.get(userID);

    if (token === refreshData) {
      return verify(token, SECRET) as CustomJWTPayload;
    } else {
      throw new ResponseError({
        name: "ER09",
        message: "Token data error",
        httpCode: 400,
      });
    }
  } catch (e) {
    throw e;
  }
};

export { accessSign, accessVerify, refreshSign, refreshVerify };
