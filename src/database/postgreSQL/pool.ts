import { Pool } from "pg";
import config from "./config";

const pool = new Pool(config);

export default pool;
