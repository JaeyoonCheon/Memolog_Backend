import { Request, Response, NextFunction } from "express";

import { CustomError } from "@errors/error";

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);
  if (err instanceof CustomError) {
    res.status(err.httpStatusCode).send(err);
  } else {
    res.status(500);
  }
}
