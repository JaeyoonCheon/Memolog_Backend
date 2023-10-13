import { CustomError } from "@errors/error";
import { Request, Response, NextFunction } from "express";

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof CustomError) {
    res.status(err.httpStatusCode).send(err);
  } else {
    res.status(500).send(err);
  }
}
