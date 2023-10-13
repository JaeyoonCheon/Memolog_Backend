import { promisify } from "util";
import { sign, verify, decode, Jwt, Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import ms from "ms";

import client from "../databases/redis/client";
import { CustomError } from "../errors/error";

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
  const decodedPayload = verify(token, SECRET);
  return decodedPayload;
};

const refreshVerify = async (token: string) => {
  console.log(token);
  const decodedTokenPayload = decode(token) as CustomJWTPayload;
  console.log(decodedTokenPayload);
  const { userID } = decodedTokenPayload;
  const refreshData = await client.get(userID);

  if (token === refreshData) {
    return verify(token, SECRET) as CustomJWTPayload;
  } else {
    throw new CustomError({
      httpStatusCode: 401,
      errorCode: 2003,
      message: "Token data error",
    });
  }
};

export { accessSign, accessVerify, refreshSign, refreshVerify };
