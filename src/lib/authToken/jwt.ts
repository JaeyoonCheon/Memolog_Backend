import { promisify } from "util";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ms from "ms";

import client from "../../database/redis/client";
import { ResponseError } from "../../types";

const SECRET: jwt.Secret = process.env.SALT || "";
const ACCESS_EXPIRE: string = process.env.ACCESS_EXPIRE || "1h";

const sign = (userId: Number) => {
  const expireTime = new Date();
  expireTime.setTime(expireTime.getTime() + ms(ACCESS_EXPIRE));

  const payload = {
    id: userId,
  };

  return {
    token: jwt.sign(payload, SECRET, {
      algorithm: "HS256",
      expiresIn: process.env.ACCESS_EXPIRE,
    }),
    expireTime: expireTime,
  };
};

const verify = (token: string) => {
  try {
    const decodedToken = jwt.verify(token, SECRET);
    return decodedToken;
  } catch (e) {
    throw e;
  }
};

const refresh = () => {
  return jwt.sign({}, SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.REFRESH_EXPIRE,
  });
};

const refreshVerify = async (token: string, userId: Number) => {
  try {
    const refreshData = await client.get(String(userId));

    if (token === refreshData) {
      jwt.verify(token, SECRET);
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

export { sign, verify, refresh, refreshVerify };
