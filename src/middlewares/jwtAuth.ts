import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

import { accessVerify } from "@lib/jwt";
import { CustomError } from "@errors/error";

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SALT = process.env.SALT;
  const accessToken = req.headers.authorization?.split("Bearer ")[1];

  try {
    if (JWT_SALT === undefined) {
      throw new Error("No JWT salt");
    }
    if (accessToken === undefined) {
      throw new CustomError({
        httpStatusCode: 401,
        errorCode: 2000,
        message: "No Access Token",
      });
    }

    const payload = accessVerify(accessToken);

    req.body.payload = payload;

    next();
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      const error = new CustomError({
        httpStatusCode: 401,
        errorCode: 2001,
        message: e.message,
      });
      next(error);
    } else if (e instanceof JsonWebTokenError) {
      const error = new CustomError({
        httpStatusCode: 401,
        errorCode: 2007,
        message: e.message,
      });
      next(error);
    } else {
      next(e);
    }
  }
};
