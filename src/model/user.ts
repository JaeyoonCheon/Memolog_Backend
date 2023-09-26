import pool from "@database/postgreSQL/pool";

import {
  CreateUser,
  ReadUser,
  ReadPassword,
  VerifyEmail,
  CreateUserPayload,
} from "user";

export async function createUser(userData: CreateUserPayload): Promise<number> {
  const {
    name,
    email,
    password,
    created_at,
    updated_at,
    scope,
    user_identifier,
  } = userData;

  const result = await pool.query<CreateUser>(
    `INSERT INTO public.user 
        (name, email, password, created_at, updated_at, scope, user_identifier) 
        values ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;`,
    [name, email, password, created_at, updated_at, scope, user_identifier]
  );

  return result.rows[0].id;
}
export async function readUserByID(id: number): Promise<ReadUser> {
  const query = `SELECT id, name, email, profile_image_url, created_at, updated_at, nickname, user_identifier 
  FROM public.user WHERE id=$1`;

  const result = await pool.query<ReadUser>(query, [id]);

  return result.rows[0];
}
export async function readUserByUserID(userID: string): Promise<ReadUser> {
  const query = `SELECT id, name, email, profile_image_url, created_at, updated_at, nickname, user_identifier 
  FROM public.user WHERE user_identifier=$1`;

  const result = await pool.query<ReadUser>(query, [userID]);

  return result.rows[0];
}
export async function readUserByEmail(email: string): Promise<ReadUser> {
  const query = `SELECT id, name, email, profile_image_url, created_at, updated_at, nickname, user_identifier 
  FROM public.user WHERE email=$1`;

  const result = await pool.query<ReadUser>(query, [email]);

  return result.rows[0];
}
export async function readPasswordByEmail(email: string): Promise<string> {
  const query = `SELECT password FROM public.user WHERE email=$1;`;

  const result = await pool.query<ReadPassword>(query, [email]);

  return result.rows[0].password;
}
export async function readPasswordByUserID(userID: string): Promise<string> {
  const query = `SELECT password FROM public.user WHERE user_identifier=$1;`;

  const result = await pool.query<ReadPassword>(query, [userID]);

  return result.rows[0].password;
}
export async function updateProfile(
  userID: string,
  nickname: string,
  profile_image_url: string
) {
  const query = `UPDATE public.user SET nickname=$2, profile_image_url=$3 WHERE user_identifier=$1`;

  const result = await pool.query(query, [userID, nickname, profile_image_url]);

  return result.rows[0];
}
export async function updateNickname(userID: string, nickname: string) {
  const query = `UPDATE public.user SET nickname=$2 WHERE user_identifier=$1`;

  const result = await pool.query(query, [userID, nickname]);

  return result.rows[0];
}
export async function updateProfileImageURL(
  userID: string,
  profile_image_url: string
) {
  const query = `UPDATE public.user SET profile_image_url=$2 WHERE user_identifier=$1`;

  const result = await pool.query(query, [userID, profile_image_url]);

  return result.rows[0];
}
export async function updatePassword(userID: string, password: string) {
  const query = `UPDATE public.user SET password=$2 where user_identifier=$1`;

  const result = await pool.query(query, [userID, password]);

  return result.rows[0];
}
export async function verifyEmail(email: string): Promise<number> {
  const query = `SELECT COUNT(*) as count FROM public.user WHERE email=$1;`;

  const result = await pool.query<VerifyEmail>(query, [email]);

  return result.rows[0].count;
}
export async function deletePassword(userID: string) {
  const query = `DELETE public.user where user_identifier=$1`;

  const result = await pool.query(query, [userID]);

  return result.rows[0];
}
