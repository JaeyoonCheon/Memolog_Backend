import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { Container, Service } from "typedi";

import AuthService from "@/service/auth.service";

@Service()
export default class AuthController {
  public authSvc: AuthService;
  constructor(authSvc: AuthService) {
    this.authSvc = authSvc;
  }
  signin = async (req: Request, res: Response, next: NextFunction) => {
    console.log("signin");
    const { email, password } = req.body;
    console.log(this.authSvc);

    const signinResult = await this.authSvc.signin(email, password);

    res.status(200).send(signinResult);
  };
  async signup(req: Request, res: Response, next: NextFunction) {
    const { name, email, password, scope } = req.body;

    const signinResult = await this.authSvc.signup(
      name,
      email,
      password,
      scope
    );

    res.status(200).send(signinResult);
  }
  checkToken = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization?.split("Bearer ")[1];

    if (!accessToken) {
      throw new Error();
    }

    const checkTokenResult = await this.authSvc.check(accessToken);

    res.status(200).send(checkTokenResult);
  };
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.headers.authorization?.split("Bearer ")[1];

    if (!refreshToken) {
      throw new Error();
    }

    const refreshResult = await this.authSvc.refresh(refreshToken);

    res.status(200).send(refreshResult);
  };
  renewRefreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const refreshToken = req.headers.authorization?.split("Bearer ")[1];

    if (!refreshToken) {
      throw new Error();
    }

    const refreshResult = await this.authSvc.renewRefresh(refreshToken);

    res.status(200).send(refreshResult);
  };
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await this.authSvc.verifyEmail(email);

    res.status(200).send("ok");
  };
}
