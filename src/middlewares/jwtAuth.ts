import { Request, Response, NextFunction } from "express";
import { Container } from "typedi";

import { ResponseError } from "@errors/error";
import JwtService from "@services/jwt.service";

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

  const jwtServiceInstance = Container.get(JwtService);
  const payload = jwtServiceInstance.tokenVerify(accessToken);

  req.body.payload = payload;

  next();
};
