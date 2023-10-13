import "reflect-metadata";
import express from "express";
import { Container } from "typedi";

import AuthController from "@controller/auth.controller";

export const router = express.Router();

const authControllerInstance = Container.get(AuthController);

router.post("/check", authControllerInstance.checkToken);

router.post("/refresh", authControllerInstance.refreshToken);

router.post("/renew-refresh", authControllerInstance.renewRefreshToken);

router.post("/signin", authControllerInstance.signin);

router.post("/signup", authControllerInstance.signup);

router.post("/verify-email", authControllerInstance.verifyEmail);
