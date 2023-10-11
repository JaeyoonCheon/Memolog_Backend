declare module "user" {
  export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
    scope: string;
    user_identifier: string;
  }
  export interface CreateUser {
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
