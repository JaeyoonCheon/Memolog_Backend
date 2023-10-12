import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { Service, Container } from "typedi";

import UserService from "@/service/user.service";

@Service()
export default class UserController {
  private userSvc;

  constructor() {
    this.userSvc = Container.get(UserService);
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    const { userID } = req.body.payload;

    const userResult = await this.userSvc.readUser(userID);

    return userResult;
  }

  async postUserProfile(req: Request, res: Response, next: NextFunction) {
    const { userID } = req.body.payload;
    const { nickname, profile_image_url } = req.body;
  }

  async postUserProfileImage(req: Request, res: Response, next: NextFunction) {
    const { userID } = req.body.payload;
    const { profile_image_url } = req.body;
  }

  async postUserProfileNickname(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { userID } = req.body.payload;
    const { nickname } = req.body;
  }

  async updateUserPassword(req: Request, res: Response, next: NextFunction) {}

  async deleteUser(req: Request, res: Response, next: NextFunction) {}
}
