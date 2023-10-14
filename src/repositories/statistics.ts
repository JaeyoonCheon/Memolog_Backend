import "reflect-metadata";
import { Service } from "typedi";
import format from "pg-format";
import { Pool } from "pg";

import PG from "@databases/postgreSQL/pool";
import UserRepository from "./user";

@Service()
export default class StatisicsRepository {
  private pool: Pool;
  private userModel: UserRepository;
  constructor(PG: PG, userModel: UserRepository) {
    this.pool = PG.pool;
    this.userModel = userModel;
  }

  async readHashtagTrends(limit: number) {
    const query = `
        SELECT h.id, h.name, COUNT(h.name)::int cnt
        FROM public.hashtag_access AS ha
        LEFT JOIN
        (SELECT id, name FROM public.hashtag) AS h
        ON ha.hashtag_id = h.id
        GROUP BY h.id, h.name
        ORDER BY cnt DESC, h.name ASC
        LIMIT $1
      `;

    const result = await this.pool.query(query, [limit]);

    return result.rows;
  }
  async readHashtagFrequency(userID: string, limit: number) {
    const { id } = await this.userModel.readUserByUserID(userID);

    const query = `
    SELECT h.id, h.name, COUNT(h.name) cnt FROM public.document AS d
    FULL OUTER JOIN public.document_hashtag AS dh
    ON d.id=dh.doc_id
    LEFT JOIN public.hashtag AS h
    ON dh.hash_id=h.id
    WHERE d.id=$1 AND dh.doc_id IS NOT NULL
    GROUP BY h.id, h.name
    ORDER BY cnt DESC
    LIMIT $2
`;

    const result = await this.pool.query(query, [id, limit]);

    return result.rows;
  }
}
