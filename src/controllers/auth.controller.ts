import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { Container, Service } from "typedi";

import AuthService from "@services/auth.service";
import { APIResponse } from "@apis/api";
import { BusinessLogicError, ResponseError } from "@apis/error";

@Service()
export default class AuthController {
  public authSvc: AuthService;
  constructor(authSvc: AuthService) {
    this.authSvc = authSvc;
  }
  signin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const signinResult = await this.authSvc.signin(email, password);
    const response = new APIResponse({
      httpStatusCode: 200,
      result: signinResult,
    });

    res.status(response.httpStatusCode).send(response);
  };
  signup = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, scope } = req.body;

    const signinResult = await this.authSvc.signup(
      name,
      email,
      password,
      scope
    );
    const response = new APIResponse({
      httpStatusCode: 200,
      result: signinResult,
    });

    res.status(response.httpStatusCode).send(response);
  };
  checkToken = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization?.split("Bearer ")[1];

    if (!accessToken) {
      throw new ResponseError({
        httpStatusCode: 401,
        errorCode: 2000,
        message: "No access token",
      });
    }

    const checkTokenResult = await this.authSvc.check(accessToken);
    const response = new APIResponse({
      httpStatusCode: 200,
      result: checkTokenResult,
    });

    res.status(response.httpStatusCode).send(response);
  };
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.headers.authorization?.split("Bearer ")[1];

    if (!refreshToken) {
      throw new ResponseError({
        httpStatusCode: 401,
        errorCode: 2000,
        message: "No access token",
      });
    }

    const refreshResult = await this.authSvc.refresh(refreshToken);
    const response = new APIResponse({
      httpStatusCode: 200,
      result: refreshResult,
    });

    res.status(response.httpStatusCode).send(response);
  };
  renewRefreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const accessToken = req.headers.authorization?.split("Bearer ")[1];

    if (!accessToken) {
      throw new BusinessLogicError({
        from: "jwt",
        message: "no access token",
      });
    }

    const refreshResult = await this.authSvc.renewRefresh(accessToken);
    const response = new APIResponse({
      httpStatusCode: 200,
      result: refreshResult,
    });

    res.status(response.httpStatusCode).send(response);
  };
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await this.authSvc.verifyEmail(email);
    const response = new APIResponse({
      httpStatusCode: 200,
    });

    res.status(response.httpStatusCode).send(response);
  };
}
