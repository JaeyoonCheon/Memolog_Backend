import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { Service, Container } from "typedi";

import { APIResponse } from "@apis/api";
import UserService from "@services/user.service";

@Service()
export default class UserController {
  userSvc: UserService;

  constructor(userSvc: UserService) {
    this.userSvc = userSvc;
  }

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.body.payload;

    const userResult = await this.userSvc.readUser(userID);
    const response = new APIResponse({
      httpStatusCode: 200,
      result: userResult,
    });

    res.status(response.httpStatusCode).send(response);
  };

  postUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.body.payload;
    const { nickname, profile_image_url } = req.body;

    await this.userSvc.updateProfile(userID, nickname, profile_image_url);
    const response = new APIResponse({
      httpStatusCode: 200,
    });

    res.status(response.httpStatusCode).send(response);
  };

  postUserProfileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userID } = req.body.payload;
    const { profile_image_url } = req.body;

    await this.userSvc.updateProfileImage(userID, profile_image_url);
    const response = new APIResponse({
      httpStatusCode: 200,
    });

    res.status(response.httpStatusCode).send(response);
  };

  postUserProfileNickname = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userID } = req.body.payload;
    const { nickname } = req.body;

    await this.userSvc.updateProfileImage(userID, nickname);
    const response = new APIResponse({
      httpStatusCode: 200,
    });

    res.status(response.httpStatusCode).send(response);
  };

  updateUserPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userID } = req.body.payload;
    const { oldPassword, newPassword } = req.body;

    await this.userSvc.updatePassword(userID, oldPassword, newPassword);
    const response = new APIResponse({
      httpStatusCode: 200,
    });

    res.status(response.httpStatusCode).send(response);
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.body.payload;

    await this.userSvc.deleteUser(userID);
    const response = new APIResponse({
      httpStatusCode: 200,
    });

    res.status(response.httpStatusCode).send(response);
  };
}
