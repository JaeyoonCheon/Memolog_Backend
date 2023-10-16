import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

import { accessVerify } from "@lib/jwt";
import { ResponseError } from "@errors/error";

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SALT = process.env.SALT;
  const accessToken = req.headers.authorization?.split("Bearer ")[1];

  if (JWT_SALT === undefined) {
    throw new Error("No JWT salt");
  }
  if (accessToken === undefined) {
    throw new ResponseError({
      httpStatusCode: 401,
      errorCode: 2000,
      message: "No Access Token",
    });
  }

  const payload = accessVerify(accessToken);

  req.body.payload = payload;

  next();
};
