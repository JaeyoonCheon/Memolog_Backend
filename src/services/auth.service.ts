import "reflect-metadata";
import { Service } from "typedi";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import { BusinessLogicError, ResponseError } from "@apis/error";
import redisClient from "@databases/redis/client";
import UserService from "./user.service";
import UserRepository from "@repositories/user";
import JwtService, { CustomJWTPayload } from "@services/jwt.service";

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
  async check(accessToken: string) {
    const JWT_SALT = process.env.SALT;
    if (!accessToken || !JWT_SALT) {
      throw new Error();
    }
    // 만료 시간 검증 및 payload decode
    const verified = this.jwtSvc.tokenVerify(accessToken) as CustomJWTPayload;
    const userID = verified.userID;
    const newAccessToken = this.jwtSvc.accessSign(userID);

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
    // 만료 시간 검증 및 payload decode
    const verifiedRefresh = this.jwtSvc.tokenVerify(refreshToken);
    const { userID } = verifiedRefresh;
    const savedRefreshToken = await redisClient.get(userID);

    if (savedRefreshToken !== refreshToken) {
      throw new BusinessLogicError({
        from: "auth",
        message: "Not same refresh token Or Refresh token expired",
      });
    }

    const newAccessToken = this.jwtSvc.accessSign(userID);

    return newAccessToken;
  }
  async renewRefresh(refreshToken: string) {
    const JWT_SALT = process.env.SALT;
    if (!refreshToken || !JWT_SALT) {
      throw new Error();
    }

    const verifiedRefresh = this.jwtSvc.tokenVerify(refreshToken);

    const { userID } = verifiedRefresh;
    await redisClient.del(userID);
    const newRefreshToken = this.jwtSvc.refreshSign(userID);

    await redisClient.set(userID, newRefreshToken);

    return newRefreshToken;
  }
  async signin(userEmail: string, userPassword: string) {
    const existRows = await this.userModel.verifyEmail(userEmail);

    if (existRows === 0) {
      throw new ResponseError({
        httpStatusCode: 400,
        errorCode: 1002,
        message: "Invalid Email or Password",
      });
    }

    const savedPassword = await this.userModel.readPasswordByEmail(userEmail);
    const compareResult = await bcrypt.compare(userPassword, savedPassword);
    if (!compareResult) {
      throw new ResponseError({
        httpStatusCode: 400,
        errorCode: 1002,
        message: "Invalid Email or Password",
      });
    }

    const userRows = await this.userModel.readUserByEmail(userEmail);
    6;
    const { user_identifier } = userRows;

    const accessToken = this.jwtSvc.accessSign(user_identifier);

    const result = {
      token: {
        accessToken: accessToken,
      },
      user: userRows,
    };

    return result;
  }
  /* 로그인 과정 개선 예정
    - 로그인 userSvc 불러와서 사용 변경
    - 생성/수정 시각 userSvc에서 생성 예정
    - 기타 로그인 정보 생성 로그인 로직에서 생성 예정 */
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
      throw new ResponseError({
        httpStatusCode: 400,
        errorCode: 1101,
        message: "Account validation failed.",
      });
    }
  }
}
