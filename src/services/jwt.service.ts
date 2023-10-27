import "reflect-metadata";
import { Service } from "typedi";
import {
  sign,
  verify,
  JwtPayload,
  Secret,
  TokenExpiredError,
} from "jsonwebtoken";

import { BusinessLogicError } from "../apis/error";

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
        from: "jwt.service",
        errorCode: 5001,
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
        from: "jwt.service",
        errorCode: 5001,
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
    try {
      const decodedPayload = verify(token, SECRET) as CustomJWTPayload;
      return decodedPayload;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new BusinessLogicError({
          from: "jwt.service",
          errorCode: 2001,
          message: "access token expired",
        });
      }
      throw e;
    }
  }
  refreshVerify(token: string) {
    try {
      const decodedPayload = verify(token, SECRET) as CustomJWTPayload;
      return decodedPayload;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new BusinessLogicError({
          from: "jwt.service",
          errorCode: 2004,
          message: "refresh token expired",
        });
      }
      throw e;
    }
  }
}
