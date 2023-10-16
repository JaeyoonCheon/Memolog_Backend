import { sign, verify, decode, Jwt, Secret, JwtPayload } from "jsonwebtoken";
import ms from "ms";

import client from "../databases/redis/client";
import { ResponseError } from "../errors/error";

export interface CustomJWTPayload extends JwtPayload {
  userID: string;
}

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
  const decodedPayload = verify(token, SECRET) as CustomJWTPayload;
  return decodedPayload;
};

const refreshVerify = async (token: string) => {
  const decodedTokenPayload = verify(token, SECRET) as CustomJWTPayload;
  const { userID } = decodedTokenPayload;
  const refreshData = await client.get(userID);

  if (token === refreshData) {
    return verify(token, SECRET) as CustomJWTPayload;
  } else {
    throw new ResponseError({
      httpStatusCode: 401,
      errorCode: 2003,
      message: "Invalid Refresh Token Error",
    });
  }
};

export { accessSign, accessVerify, refreshSign, refreshVerify };
