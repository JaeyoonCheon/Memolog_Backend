import "reflect-metadata";
import { Service } from "typedi";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import { BusinessLogicError, ResponseError } from "@errors/error";
import redisClient from "@databases/redis/client";
import UserRepository from "@repositories/user";
import JwtService, { CustomJWTPayload } from "@services/jwt.service";

@Service()
export default class AuthService {
  private userModel: UserRepository;
  private jwtSvc: JwtService;
  constructor(userModel: UserRepository, jwtSvc: JwtService) {
    this.userModel = userModel;
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

    const verifiedRefresh = this.jwtSvc.tokenVerify(refreshToken);

    const { userID } = verifiedRefresh;
    await redisClient.del(userID);
    const newRefreshToken = this.jwtSvc.refreshSign(userID);

    const userRows = await this.userModel.readUserByUserID(userID);
    await redisClient.set(userID, newRefreshToken);

    const result = {
      token: {
        refreshToken: newRefreshToken,
      },
      user: userRows,
    };

    return result;
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
