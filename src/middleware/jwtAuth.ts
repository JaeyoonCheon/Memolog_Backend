import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import { verify } from "../lib/authToken/jwt";

dotenv.config();

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SALT = process.env.SALT;
  const accessToken = req.headers.authorization?.split("Bearer ")[1];

  try {
    if (accessToken !== undefined && JWT_SALT !== undefined) {
      const payload = verify(accessToken);
      req.body.payload = payload;
      next();
    }
  } catch (e) {
    res.status(401).send("Token Expired!");
  }
};
