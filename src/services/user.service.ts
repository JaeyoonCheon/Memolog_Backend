import "reflect-metadata";
import bcrypt from "bcrypt";
import { Service, Container } from "typedi";

import UserRepository from "@repositories/user";
import { ResponseError } from "@apis/error";

@Service()
export default class UserService {
  private userModel: UserRepository;

  constructor(userModel: UserRepository) {
    this.userModel = userModel;
  }

  async readUser(userID: string) {
    const result = await this.userModel.readUserByUserID(userID);

    return result;
  }
  async updateProfile(
    userID: string,
    nickname: string,
    profile_image_url: string
  ) {
    await this.userModel.updateProfile(userID, nickname, profile_image_url);
  }
  async updateProfileImage(userID: string, profile_image_url: string) {
    await this.userModel.updateProfileImageURL(userID, profile_image_url);
  }
  async updateProfileNickname(userID: string, nickname: string) {
    await this.userModel.updateNickname(userID, nickname);
  }
  async updatePassword(
    userID: string,
    oldPassword: string,
    newPassword: string
  ) {
    const savedPassword = await this.userModel.readPasswordByUserID(userID);
    const compareResult = await bcrypt.compare(oldPassword, savedPassword);
    if (!compareResult) {
      throw new ResponseError({
        httpStatusCode: 400,
        errorCode: 1002,
        message: "Invalid Email or Password",
      });
    }
    await this.userModel.updatePassword(userID, newPassword);
  }
  async deleteUser(userID: string) {
    await this.userModel.deleteUser(userID);
  }
}
