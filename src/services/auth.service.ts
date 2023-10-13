import "reflect-metadata";
import { Service, Container } from "typedi";
import bcrypt from "bcrypt";
import { verify } from "jsonwebtoken";
import { randomUUID } from "crypto";

import redisClient from "@databases/redis/client";
import UserRepository from "@repositories/user";
import { CustomError } from "@errors/error";
import { accessSign, refreshSign, refreshVerify, CustomJwt } from "@lib/jwt";

@Service()
export default class AuthService {
  private userModel: UserRepository;
  constructor(userModel: UserRepository) {
    this.userModel = userModel;
  }
  async check(accessToken: string) {
    const JWT_SALT = process.env.SALT;
    if (!accessToken || !JWT_SALT) {
      throw new Error();
    }
    const verified = verify(accessToken, JWT_SALT) as CustomJwt;
    const userID = verified.userID;
    const newAccessToken = accessSign(userID);

    const userRows = await this.userModel.readUserByUserID(userID);

    const result = {
      token: {
        accessToken: newAccessToken,
      },
      user: userRows,
    };

    return result;
  }
  async refresh(refreshToken: string) {
    const JWT_SALT = process.env.SALT;
    if (!refreshToken || !JWT_SALT) {
      throw new Error();
    }
    const verifiedRefresh = await refreshVerify(refreshToken);
    const { userID } = verifiedRefresh;
    const newAccessToken = accessSign(userID);

    const userRows = await this.userModel.readUserByUserID(userID);

    const result = {
      token: {
        accessToken: newAccessToken,
      },
      user: userRows,
    };

    return result;
  }
  async renewRefresh(refreshToken: string) {
    const JWT_SALT = process.env.SALT;
    if (!refreshToken || !JWT_SALT) {
      throw new Error();
    }
    const verifiedRefresh = await refreshVerify(refreshToken);
    const { userID } = verifiedRefresh;
    const newRefreshToken = refreshSign(userID);

    const userRows = await this.userModel.readUserByUserID(userID);

    const result = {
      token: {
        refreshToken: newRefreshToken,
      },
      user: userRows,
    };

    return result;
  }
  async signin(userEmail: string, userPassword: string) {
    console.log(`signin service ${this}`);
    const existRows = await this.userModel.verifyEmail(userEmail);

    if (existRows === 0) {
      throw new CustomError({
        httpStatusCode: 400,
        errorCode: 1002,
        message: "Invalid Email or Password",
      });
    }

    const savedPassword = await this.userModel.readPasswordByEmail(userEmail);

    const compareResult = await bcrypt.compare(userPassword, savedPassword);
    if (!compareResult) {
      throw new CustomError({
        httpStatusCode: 400,
        errorCode: 1002,
        message: "Invalid Email or Password",
      });
    }

    const userRows = await this.userModel.readUserByEmail(userEmail);
    const { user_identifier } = userRows;

    const accessToken = accessSign(user_identifier);

    const result = {
      token: {
        accessToken: accessToken,
      },
      user: userRows,
    };

    return result;
  }
  async signup(name: string, email: string, password: string, scope: string) {
    const hashSaltRound = Number(process.env.HASH_SALT_ROUND);
    const hashSalt = await bcrypt.genSalt(hashSaltRound);
    const encryptedPassword = await bcrypt.hash(password, hashSalt);

    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const createdTime = new Date(Date.now() - localeOffset);
    const updatedTime = createdTime;

    const DEFAULT_SCOPE = "public";

    const uuidForUserID = randomUUID();

    const newUser = await this.userModel.createUser({
      name,
      email,
      password: encryptedPassword,
      created_at: createdTime,
      updated_at: updatedTime,
      scope: scope ?? DEFAULT_SCOPE,
      user_identifier: uuidForUserID,
    });

    const userRows = await this.userModel.readUserByID(newUser);
    const { user_identifier } = userRows;
    const accessToken = accessSign(user_identifier);
    const refreshToken = refreshSign(user_identifier);

    await redisClient.set(user_identifier, refreshToken);

    const result = {
      token: {
        accessToken,
        refreshToken,
      },
      user: userRows,
    };

    return result;
  }
  async verifyEmail(email: string) {
    const result = await this.userModel.verifyEmail(email);

    if (result > 0) {
      throw new CustomError({
        httpStatusCode: 400,
        errorCode: 1101,
        message: "Account validation failed.",
      });
    }
  }
}
