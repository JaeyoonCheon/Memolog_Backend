import "reflect-metadata";
import { Service } from "typedi";
import bcrypt from "bcrypt";

import { BusinessLogicError } from "@apis/error";
import redisClient from "@databases/redis/client";
import UserService from "./user.service";
import UserRepository from "@repositories/user";
import JwtService from "@services/jwt.service";

@Service()
export default class AuthService {
  private userModel: UserRepository;
  private userSvc: UserService;
  private jwtSvc: JwtService;
  constructor(
    userModel: UserRepository,
    userSvc: UserService,
    jwtSvc: JwtService
  ) {
    this.userModel = userModel;
    this.userSvc = userSvc;
    this.jwtSvc = jwtSvc;
  }
  async refresh(refreshToken: string) {
    const JWT_SALT = process.env.SALT;
    if (!JWT_SALT) {
      throw new BusinessLogicError({
        from: "auth.service",
        errorCode: 5001,
        message: "Invalid ENV",
      });
    }
    // 만료 시간 검증 및 payload decode
    const verifiedRefresh = this.jwtSvc.refreshVerify(refreshToken);
    const { userID } = verifiedRefresh;
    const savedRefreshToken = await redisClient.get(userID);

    if (savedRefreshToken !== refreshToken) {
      throw new BusinessLogicError({
        from: "auth.service",
        errorCode: 2003,
        message: "Not same to stored refresh token",
      });
    }

    const newAccessToken = this.jwtSvc.accessSign(userID);

    return newAccessToken;
  }
  async renewRefresh(accessToken: string) {
    const JWT_SALT = process.env.SALT;
    if (!JWT_SALT) {
      throw new BusinessLogicError({
        from: "auth.service",
        errorCode: 5001,
        message: "Invalid ENV",
      });
    }

    try {
      const verifiedRefresh = this.jwtSvc.tokenVerify(accessToken);

      const { userID } = verifiedRefresh;
      await redisClient.del(userID);
      const newRefreshToken = this.jwtSvc.refreshSign(userID);

      await redisClient.set(userID, newRefreshToken);

      return newRefreshToken;
    } catch (e) {
      if (e instanceof BusinessLogicError && e.errorCode === 2001) {
        throw new BusinessLogicError({
          from: "auth.service",
          errorCode: 2007,
          message: "Fail to renewing JWT",
        });
      }
      throw e;
    }
  }
  async signin(userEmail: string, userPassword: string) {
    const existRows = await this.userModel.verifyEmail(userEmail);

    if (existRows === 0) {
      throw new BusinessLogicError({
        from: "auth.service",
        errorCode: 1002,
        message: "Invalid Email or Password",
      });
    }

    const savedPassword = await this.userModel.readPasswordByEmail(userEmail);
    const compareResult = await bcrypt.compare(userPassword, savedPassword);
    if (!compareResult) {
      throw new BusinessLogicError({
        from: "auth.service",
        errorCode: 1002,
        message: "Invalid Email or Password",
      });
    }

    const userRows = await this.userModel.readUserByEmail(userEmail);

    const { user_identifier } = userRows;

    const accessToken = this.jwtSvc.accessSign(user_identifier);
    const refreshToken = await this.renewRefresh(accessToken);

    const result = {
      token: {
        accessToken,
        refreshToken,
      },
      user: userRows,
    };

    return result;
  }
  async signup(name: string, email: string, password: string, scope: string) {
    const newUserIndex = await this.userSvc.createUser({
      name,
      email,
      password,
      scope,
    });

    const userRows = await this.userModel.readUserByID(newUserIndex);
    const { user_identifier } = userRows;
    const accessToken = this.jwtSvc.accessSign(user_identifier);
    const refreshToken = this.jwtSvc.refreshSign(user_identifier);

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
      throw new BusinessLogicError({
        from: "auth.service",
        errorCode: 1101,
        message: "Account validation failed.",
      });
    }
  }
}
