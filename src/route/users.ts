import { Request, Response } from "express";
import express from "express";
import { DatabaseError } from "pg";

import * as userModel from "@/repository/user";

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const { user_identifier } = req.params;

  try {
    const result = await userModel.readUserByUserID(user_identifier);

    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.post("/profile", async (req: Request, res: Response) => {
  const { userID } = req.body.payload;

  try {
    const { nickname, profile_image_url } = req.body;

    const newProfile = await userModel.updateProfile(
      userID,
      nickname,
      profile_image_url
    );

    res.status(200);
  } catch (e) {
    console.log(e);
    console.log(e instanceof DatabaseError);
    res.status(500).send("Error occured!");
  }
});

router.post("/profileImage", async (req: Request, res: Response) => {
  const { userID } = req.body.payload;

  try {
    const { profile_image_url } = req.body;

    const newProfile = await userModel.updateProfileImageURL(
      userID,
      profile_image_url
    );

    res.status(200);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.post("/nickname", async (req: Request, res: Response) => {
  const { userID } = req.body.payload;

  try {
    const { nickname } = req.body;

    const newProfile = await userModel.updateNickname(userID, nickname);

    res.status(200);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.post("/password", async (req: Request, res: Response) => {
  const { userID } = req.body.payload;

  try {
    const { old_password, new_password } = req.body;

    const storedOldPassword = await userModel.readPasswordByUserID(userID);

    if (storedOldPassword === old_password) {
      const result = await userModel.updatePassword(userID, new_password);
      const profile = result;

      res.status(200).send(profile);
    } else {
      throw new Error("New password is same to old one!");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});

router.delete("/", async (req: Request, res: Response) => {
  const { userID } = req.body.payload;

  try {
    await userModel.deletePassword(userID);

    res.status(200).send("Data delete successfully.");
  } catch (e) {
    console.log(e);
    res.status(500).send("Error occured!");
  }
});
