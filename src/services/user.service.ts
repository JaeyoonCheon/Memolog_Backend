import "reflect-metadata";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { Service, Container } from "typedi";

import UserRepository from "@repositories/user";
import { BusinessLogicError } from "@apis/error";
import { CreateUserSvcParams } from "user";

@Service()
export default class UserService {
  private userModel: UserRepository;

  constructor(userModel: UserRepository) {
    this.userModel = userModel;
  }

  async createUser(userData: CreateUserSvcParams) {
    const { name, email, password, scope } = userData;

    const hashSaltRound = Number(process.env.HASH_SALT_ROUND);
    const hashSalt = await bcrypt.genSalt(hashSaltRound);
    const encryptedPassword = await bcrypt.hash(password, hashSalt);

    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const createdTime = new Date(Date.now() - localeOffset);
    const updatedTime = createdTime;

    const DEFAULT_SCOPE = "public";
    const uuidForUserID = randomUUID();

    return await this.userModel.createUser({
      name,
      email,
      password: encryptedPassword,
      created_at: createdTime,
      updated_at: updatedTime,
      scope: scope ?? DEFAULT_SCOPE,
      user_identifier: uuidForUserID,
    });
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

    const updatedUserResult = await this.userModel.readUserByUserID(userID);

    return updatedUserResult;
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
      throw new BusinessLogicError({
        from: "user.service",
        errorCode: 1002,
        message: "Invalid Email or Password",
      });
    }

    const updated_at = Date.now();
    await this.userModel.updatePassword(userID, newPassword, updated_at);
  }
  async deleteUser(userID: string) {
    await this.userModel.deleteUser(userID);
  }
}
