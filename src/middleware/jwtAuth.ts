import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

import { accessVerify } from "@lib/jwt";
import { ResponseError } from "@wrappers/error";

dotenv.config();

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SALT = process.env.SALT;
  const accessToken = req.headers.authorization?.split("Bearer ")[1];

  console.log(accessToken);
  try {
    if (JWT_SALT === undefined) {
      throw new Error("No JWT salt");
    }
    if (accessToken !== undefined) {
      const payload = accessVerify(accessToken);

      req.body.payload = payload;

      next();
    } else {
      throw new ResponseError({
        httpStatusCode: 401,
        errorCode: 2000,
        message: "No Access Token",
      });
    }
  } catch (e) {
    console.error(e);
    console.log(e);
    console.dir(e);
    if (e instanceof ResponseError) {
      res.status(e.httpStatusCode).send(e);
    } else if (e instanceof TokenExpiredError) {
      const error = new ResponseError({
        httpStatusCode: 401,
        errorCode: 2001,
        message: e.message,
      });
      res.status(error.httpStatusCode).send(error);
    } else if (e instanceof JsonWebTokenError) {
      const error = new ResponseError({
        httpStatusCode: 401,
        errorCode: 2007,
        message: e.message,
      });
      res.status(error.httpStatusCode).send(error);
    } else {
      console.log("Unhandled Error!");
      const error = new ResponseError({
        httpStatusCode: 500,
        message: "Internal Server Error",
      });
      res.status(500).send(error);
    }
  }
};
