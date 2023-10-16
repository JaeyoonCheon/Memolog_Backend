import "reflect-metadata";
import { Service } from "typedi";
import { sign, verify, decode, Jwt, Secret } from "jsonwebtoken";
import ms from "ms";

import { ResponseError } from "../errors/error";
import client from "../databases/redis/client";

export interface CustomJWTPayload {
  userID: string;
}

const SECRET: Secret = process.env.SALT || "";
const ACCESS_EXPIRE: string = process.env.ACCESS_EXPIRE || "1h";
const REFRESH_EXPIRE: string = process.env.REFRESH_EXPIRE || "7d";

@Service()
export default class JwtService {
  accessSign(userID: string) {
    const expireTime = new Date();
    expireTime.setTime(expireTime.getTime() + ms(ACCESS_EXPIRE));

    const payload: CustomJWTPayload = {
      userID,
    };

    return sign(payload, SECRET, {
      algorithm: "HS256",
      expiresIn: ACCESS_EXPIRE,
    });
  }

  refreshSign(userID: string) {
    const expireTime = new Date();
    expireTime.setTime(expireTime.getTime() + ms(ACCESS_EXPIRE));

    const payload: CustomJWTPayload = {
      userID,
    };

    return sign(payload, SECRET, {
      algorithm: "HS256",
      expiresIn: REFRESH_EXPIRE,
    });
  }

  accessVerify(token: string) {
    const decodedPayload = verify(token, SECRET);
    return decodedPayload;
  }

  async refreshVerify(token: string) {
    const decodedTokenPayload = decode(token) as CustomJWTPayload;
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
  }
}
