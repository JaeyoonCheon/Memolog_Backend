declare module "user" {
  export interface CreateUserModelParams {
    name: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
    scope: string;
    user_identifier: string;
  }
  export interface CreateUserSvcParams {
    name: string;
    email: string;
    password: string;
    scope: string;
  }
  export interface CreateUserModel {
    id: number;
  }
  export interface ReadUser {
    id: number;
    name: string;
    email: string;
    profile_image_url: string | null;
    created_at: Date;
    updated_at: Date;
    nickname: string;
    scope: string;
    user_identifier: string;
  }
  export interface ReadPassword {
    password: string;
  }
  export interface VerifyEmail {
    count: number;
  }
}
