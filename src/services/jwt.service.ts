import "reflect-metadata";
import { Service } from "typedi";
import { sign, verify, JwtPayload, Secret } from "jsonwebtoken";

import { BusinessLogicError, ResponseError } from "../errors/error";
import client from "../databases/redis/client";

export interface CustomJWTPayload extends JwtPayload {
  userID: string;
}

const SECRET: Secret = process.env.SALT || "";

@Service()
export default class JwtService {
  accessSign(userID: string) {
    const accessExp = process.env.ACCESS_EXPIRE;
    if (!accessExp) {
      throw new BusinessLogicError({
        from: "env",
        message: "Invalid env",
      });
    }

    const payload: CustomJWTPayload = {
      userID,
      exp: Math.floor(Date.now() / 1000) + Number(accessExp),
    };

    return sign(payload, SECRET, {
      algorithm: "HS256",
    });
  }

  refreshSign(userID: string) {
    const refreshExp = process.env.REFRESH_EXPIRE;
    if (!refreshExp) {
      throw new BusinessLogicError({
        from: "env",
        message: "Invalid env",
      });
    }

    const payload: CustomJWTPayload = {
      userID,
      exp: Math.floor(Date.now() / 1000) + Number(refreshExp),
    };

    return sign(payload, SECRET, {
      algorithm: "HS256",
    });
  }

  tokenVerify(token: string) {
    const decodedPayload = verify(token, SECRET) as CustomJWTPayload;
    return decodedPayload;
  }
}
