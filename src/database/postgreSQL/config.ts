import dotenv from "dotenv";
import { PoolConfig } from "pg";

dotenv.config();

const config: PoolConfig = {
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
};

export default config;
