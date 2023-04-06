import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { TokenExpiredError, VerifyErrors } from "jsonwebtoken";

import { verify } from "../lib/authToken/jwt";
import { CustomError, ResponseError } from "../types";
import { JsonWebTokenError } from "jsonwebtoken";

dotenv.config();

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SALT = process.env.SALT;
  const accessToken = req.headers.authorization?.split("Bearer ")[1];

  console.log(accessToken);
  try {
    if (JWT_SALT === undefined) {
      throw new CustomError({
        name: "WrongSecureCode",
        message: "Wrong operation JWT token secure",
      });
    }
    if (accessToken !== undefined) {
      const payload = verify(accessToken);

      req.body.payload = payload;

      next();
    } else {
      throw new ResponseError({
        name: "ER03",
        httpCode: 401,
        message: "No Access Token",
      });
    }
  } catch (e) {
    console.error(e);
    console.log(e);
    console.dir(e);
    if (e instanceof CustomError) {
      const error = new ResponseError({
        name: "ER00",
        httpCode: 500,
        message: "Internal Server Error",
      });
      res.status(500).send(error);
    } else if (e instanceof ResponseError) {
      res.status(e.httpCode).send(e);
    } else if (e instanceof TokenExpiredError) {
      const error = new ResponseError({
        name: "ER04",
        message: e.message,
        httpCode: 401,
      });
      res.status(error.httpCode).send(error);
    } else if (e instanceof JsonWebTokenError) {
      const error = new ResponseError({
        name: "ER09",
        message: e.message,
        httpCode: 400,
      });
      res.status(error.httpCode).send(error);
    } else {
      console.log("Unhandled Error!");
      const error = new ResponseError({
        name: "ER00",
        httpCode: 500,
        message: "Internal Server Error",
      });
      res.status(500).send(error);
    }
  }
};
