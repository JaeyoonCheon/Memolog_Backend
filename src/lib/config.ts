import { PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

export interface ConfigInterface {
  PG: PoolConfig;
  REDIS: any;
}

const config: ConfigInterface = {
  PG: {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: String(process.env.POSTGRES_PASSWORD),
    database: process.env.POSTGRES_DATABASE,
  },
  REDIS: {},
};

export default config;
