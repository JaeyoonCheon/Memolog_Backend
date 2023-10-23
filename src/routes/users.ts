import "reflect-metadata";
import express, { Request, Response } from "express";
import { Container } from "typedi";

import UserController from "@controllers/user.controller";
import { wrapAsync } from "@apis/error";

export const router = express.Router();

const userControllerInstance = Container.get(UserController);

router.get("/", wrapAsync(userControllerInstance.getUser));

router.post("/profile", wrapAsync(userControllerInstance.postUserProfile));

router.post(
  "/profileImage",
  wrapAsync(userControllerInstance.postUserProfileImage)
);

router.post(
  "/nickname",
  wrapAsync(userControllerInstance.postUserProfileNickname)
);

router.post("/password", wrapAsync(userControllerInstance.updateUserPassword));

router.delete("/", wrapAsync(userControllerInstance.deleteUser));
