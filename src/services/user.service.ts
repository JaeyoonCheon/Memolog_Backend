import "reflect-metadata";
import { Service, Container } from "typedi";

import UserRepository from "@repositories/user";

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
  async updatePassword(userID: string, password: string) {
    await this.userModel.updatePassword(userID, password);
  }
  async deleteUser(userID: string) {
    await this.userModel.deleteUser(userID);
  }
}
