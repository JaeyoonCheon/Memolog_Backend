import { Request, Response, NextFunction } from "express";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

import { ResponseError } from "@apis/error";
// 개발 / 배포 구분하여 message 속성 전송 결정 필요
export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("Error catched");
  console.error(err);
  console.log(err instanceof ResponseError);
  if (err instanceof ResponseError) {
    res.status(err.httpStatusCode).send(err);
  } else if (err instanceof TokenExpiredError) {
    const error = new ResponseError({
      httpStatusCode: 401,
      errorCode: 2001,
      message: err.message,
    });
    res.status(error.httpStatusCode).send(error);
  } else if (err instanceof JsonWebTokenError) {
    const error = new ResponseError({
      httpStatusCode: 401,
      errorCode: 2007,
      message: err.message,
    });
    res.status(error.httpStatusCode).send(error);
  } else {
    console.log("Unhandled Error");
    next(err);
  }
}
