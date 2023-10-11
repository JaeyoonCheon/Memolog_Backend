import { Request, Response, NextFunction } from "express";
import Container from "typedi";

import AuthService from "@/service/auth.service";

export default class AuthController {
  private userSvc;

  constructor() {
    this.userSvc = Container.get(AuthService);
  }
  async checkToken(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.headers.authorization?.split("Bearer ")[1];

    if (!accessToken) {
      throw new Error();
    }

    const checkTokenResult = await this.userSvc.check(accessToken);

    res.status(200).send(checkTokenResult);
  }
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.headers.authorization?.split("Bearer ")[1];

    if (!refreshToken) {
      throw new Error();
    }

    const refreshResult = await this.userSvc.refresh(refreshToken);

    res.status(200).send(refreshResult);
  }
  async renewRefreshToken(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.headers.authorization?.split("Bearer ")[1];

    if (!refreshToken) {
      throw new Error();
    }

    const refreshResult = await this.userSvc.renewRefresh(refreshToken);

    res.status(200).send(refreshResult);
  }
  async signin(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    const signinResult = await this.userSvc.signin(email, password);

    res.status(200).send(signinResult);
  }
  async signup(req: Request, res: Response, next: NextFunction) {
    const { name, email, password, scope } = req.body;

    const signinResult = await this.userSvc.signup(
      name,
      email,
      password,
      scope
    );

    res.status(200).send(signinResult);
  }
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;

    await this.userSvc.verifyEmail(email);

    res.status(200).send("ok");
  }
}
