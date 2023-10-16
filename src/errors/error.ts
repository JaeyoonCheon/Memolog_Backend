import { Request, Response, NextFunction } from "express";

export const wrapAsync = (fn: Function) => {
  if (fn.length <= 3) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        return await fn(req, res, next);
      } catch (error) {
        return next(error);
      }
    };
  } else {
    return async (
      err: any,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        return await fn(err, req, res, next);
      } catch (error) {
        return next(error);
      }
    };
  }
};

export class BusinessLogicError {}

export class ResponseError {
  httpStatusCode: number;
  errorCode?: number;
  message?: string;

  constructor({
    httpStatusCode,
    errorCode,
    message,
  }: {
    httpStatusCode: number;
    errorCode?: number;
    message?: string;
  }) {
    this.httpStatusCode = httpStatusCode;
    this.errorCode = errorCode;
    this.message = message;
  }
}
