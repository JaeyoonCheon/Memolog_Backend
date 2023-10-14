import "reflect-metadata";
import express, { Request, Response } from "express";
import { Container } from "typedi";

import UserController from "@controllers/user.controller";

export const router = express.Router();

const userControllerInstance = Container.get(UserController);

router.get("/", userControllerInstance.getUser);

router.post("/profile", userControllerInstance.postUserProfile);

router.post("/profileImage", userControllerInstance.postUserProfileImage);

router.post("/nickname", userControllerInstance.postUserProfileNickname);

router.post("/password", userControllerInstance.updateUserPassword);

router.delete("/", userControllerInstance.deleteUser);
