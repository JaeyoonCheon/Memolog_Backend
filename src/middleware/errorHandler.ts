import { ResponseError } from "@wrappers/error";
import { Request, Response, NextFunction } from "express";

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ResponseError) {
    res.status(err.httpStatusCode).send(err);
  } else {
    res.status(500).send(err);
  }
}
