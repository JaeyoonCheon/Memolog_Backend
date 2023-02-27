import { promisify } from "util";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";

import client from "../../database/redis/client";

const SECRET: jwt.Secret = process.env.SALT || "";

const sign = (userId: Number) => {
  const expireTime = new Date();
  expireTime.setHours(expireTime.getHours() + 1);

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
    return e;
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
    console.log("get Refresh Token!");
    const refreshData = await client.get(String(userId));
    console.log("success!");

    if (token === refreshData) {
      try {
        jwt.verify(token, SECRET);
        return true;
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

export { sign, verify, refresh, refreshVerify };
