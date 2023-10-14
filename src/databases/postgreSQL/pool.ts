import { Pool } from "pg";
import config from "@lib/config";
import { Service } from "typedi";

@Service()
export default class PG {
  public pool;
  constructor() {
    this.pool = new Pool(config.PG);
  }
}
