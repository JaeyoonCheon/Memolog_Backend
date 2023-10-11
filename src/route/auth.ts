import express from "express";
import AuthController from "@controller/auth.controller";
import Container from "typedi";

export const router = express.Router();

const authControllerInstance = Container.get(AuthController);

router.post("/check", authControllerInstance.checkToken);

router.post("/refresh", authControllerInstance.refreshToken);

router.post("/renew-refresh", authControllerInstance.renewRefreshToken);

router.post("/signin", authControllerInstance.signin);

router.post("/signup", authControllerInstance.signup);

router.post("/verify-email", authControllerInstance.verifyEmail);
