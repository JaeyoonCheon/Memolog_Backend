import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { Service, Container } from "typedi";

import UserService from "@services/user.service";

@Service()
export default class UserController {
  userSvc: UserService;

  constructor() {
    this.userSvc = Container.get(UserService);
  }

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.body.payload;

    const userResult = await this.userSvc.readUser(userID);

    return userResult;
  };

  postUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.body.payload;
    const { nickname, profile_image_url } = req.body;
  };

  postUserProfileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userID } = req.body.payload;
    const { profile_image_url } = req.body;
  };

  postUserProfileNickname = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userID } = req.body.payload;
    const { nickname } = req.body;
  };

  async updateUserPassword(req: Request, res: Response, next: NextFunction) {}

  async deleteUser(req: Request, res: Response, next: NextFunction) {}
}
