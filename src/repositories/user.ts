import "reflect-metadata";
import { Service } from "typedi";
import { Pool } from "pg";

import pool from "@databases/postgreSQL/pool";
import {
  CreateUserModelParams,
  CreateUserModel,
  ReadUser,
  ReadPassword,
  VerifyEmail,
} from "user";
import PG from "@databases/postgreSQL/pool";

@Service()
export default class UserRepository {
  private pool: Pool;
  constructor(PG: PG) {
    this.pool = PG.pool;
  }
  async createUser(userData: CreateUserModelParams): Promise<number> {
    const {
      name,
      email,
      password,
      created_at,
      updated_at,
      scope,
      user_identifier,
    } = userData;

    const result = await this.pool.query<CreateUserModel>(
      `INSERT INTO public.user 
        (name, email, password, created_at, updated_at, scope, user_identifier) 
        values ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;`,
      [name, email, password, created_at, updated_at, scope, user_identifier]
    );

    return result.rows[0].id;
  }
  async readUserByID(id: number): Promise<ReadUser> {
    const query = `SELECT id, name, email, profile_image_url, created_at, updated_at, nickname, user_identifier 
  FROM public.user WHERE id=$1`;

    const result = await this.pool.query<ReadUser>(query, [id]);

    return result.rows[0];
  }
  async readUserByUserID(userID: string): Promise<ReadUser> {
    const query = `SELECT id, name, email, profile_image_url, created_at, updated_at, nickname, user_identifier 
  FROM public.user WHERE user_identifier=$1`;

    const result = await this.pool.query<ReadUser>(query, [userID]);

    return result.rows[0];
  }
  async readUserByEmail(email: string): Promise<ReadUser> {
    const query = `SELECT id, name, email, profile_image_url, created_at, updated_at, nickname, user_identifier 
  FROM public.user WHERE email=$1`;

    const result = await this.pool.query<ReadUser>(query, [email]);

    return result.rows[0];
  }
  async readPasswordByEmail(email: string): Promise<string> {
    const query = `SELECT password FROM public.user WHERE email=$1;`;

    const result = await this.pool.query<ReadPassword>(query, [email]);

    return result.rows[0].password;
  }
  async readPasswordByUserID(userID: string): Promise<string> {
    const query = `SELECT password FROM public.user WHERE user_identifier=$1;`;

    const result = await this.pool.query<ReadPassword>(query, [userID]);

    return result.rows[0].password;
  }
  async updateProfile(
    userID: string,
    nickname: string,
    profile_image_url: string
  ) {
    const query = `UPDATE public.user SET nickname=$2, profile_image_url=$3 WHERE user_identifier=$1`;

    const result = await this.pool.query(query, [
      userID,
      nickname,
      profile_image_url,
    ]);

    return result.rows[0];
  }
  async updateNickname(userID: string, nickname: string) {
    const query = `UPDATE public.user SET nickname=$2 WHERE user_identifier=$1`;

    const result = await this.pool.query(query, [userID, nickname]);

    return result.rows[0];
  }
  async updateProfileImageURL(userID: string, profile_image_url: string) {
    const query = `UPDATE public.user SET profile_image_url=$2 WHERE user_identifier=$1`;

    const result = await this.pool.query(query, [userID, profile_image_url]);

    return result.rows[0];
  }
  async updatePassword(userID: string, password: string, updated_at: number) {
    const query = `UPDATE public.user SET password=$2, updated_at=$3 where user_identifier=$1`;

    const result = await this.pool.query(query, [userID, password, updated_at]);

    return result.rows[0];
  }
  async verifyEmail(email: string): Promise<number> {
    const query = `SELECT COUNT(*)::int FROM public.user WHERE email=$1;`;

    const result = await this.pool.query<VerifyEmail>(query, [email]);

    return result.rows[0].count;
  }
  async deleteUser(userID: string) {
    const query = `DELETE public.user where user_identifier=$1`;

    const result = await this.pool.query(query, [userID]);

    return result.rows[0];
  }
}
