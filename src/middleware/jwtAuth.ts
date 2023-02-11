import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import { verify } from "../lib/authToken/jwt";

dotenv.config();

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SALT = process.env.JWT_TOKEN;
  const accessToken = req.headers.authorization?.split("Bearer ")[1];

  try {
    if (accessToken !== undefined && JWT_SALT !== undefined) {
      verify(accessToken);
      next();
    }
  } catch (e) {
    res.status(401).send("Token Expired!");
  }
};
