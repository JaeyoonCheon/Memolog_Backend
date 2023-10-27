import { Request, Response, NextFunction } from "express";
import { Container } from "typedi";

import { BusinessLogicError } from "@apis/error";
import JwtService from "@services/jwt.service";

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SALT = process.env.SALT;
  const accessToken = req.headers.authorization?.split("Bearer ")[1];

  if (JWT_SALT === undefined) {
    throw new Error("No JWT salt");
  }
  if (!accessToken) {
    throw new BusinessLogicError({
      from: "jwtAuth.middleware",
      errorCode: 2000,
      message: "No JWT Token",
    });
  }

  const jwtServiceInstance = Container.get(JwtService);
  const payload = jwtServiceInstance.tokenVerify(accessToken);

  req.body.payload = payload;

  next();
};
