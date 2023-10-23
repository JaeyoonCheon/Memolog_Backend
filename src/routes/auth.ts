import "reflect-metadata";
import express from "express";
import { Container } from "typedi";

import AuthController from "@controllers/auth.controller";
import { wrapAsync } from "@apis/error";

export const router = express.Router();

const authControllerInstance = Container.get(AuthController);

router.post("/check", wrapAsync(authControllerInstance.checkToken));

router.post("/refresh", wrapAsync(authControllerInstance.refreshToken));

router.post(
  "/renew-refresh",
  wrapAsync(authControllerInstance.renewRefreshToken)
);

router.post("/signin", wrapAsync(authControllerInstance.signin));

router.post("/signup", wrapAsync(authControllerInstance.signup));

router.post("/verify-email", wrapAsync(authControllerInstance.verifyEmail));
