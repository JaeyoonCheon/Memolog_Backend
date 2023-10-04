import express, { Request, Response } from "express";
import { DatabaseError } from "pg";

import pool from "@/database/postgreSQL/pool";
import { ResponseError } from "@/lib/wrapper/error";
import * as browseModel from "@model/browse";

export const router = express.Router();

interface BrowseQuery {
  id?: number;
  cursor?: string;
}

router.get(
  "/",
  async (req: Request<any, any, any, BrowseQuery>, res: Response) => {
    const client = await pool.connect();
    try {
      const { userID } = req.body.payload;
      const { id, cursor } = req.query;
      const limit = Number(process.env.DOCUMENT_LIMIT);

      const isFirstPage = !!id;

      let documents = null;

      if (isFirstPage) {
        documents = await browseModel.browseFirstQuery({
          userID,
          limit,
        });
      } else {
        if (!cursor || !id) {
          throw new ResponseError({
            name: "ER04",
            httpCode: 400,
            message: "wrong params",
          });
        }
        documents = await browseModel.browseQuery({
          userID,
          limit,
          cursor,
          id,
        });
      }

      const previewDocuments = documents.map((doc) => {
        return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
      });

      res.send(previewDocuments);
    } catch (e) {
      if (e instanceof ResponseError) {
        res.status(e.httpCode).send(e);
      } else if (e instanceof DatabaseError) {
        const error = new ResponseError({
          name: "ER10",
          httpCode: 500,
          message: "Internal Server Error",
        });
        res.status(500).send(error);
      } else {
        console.log("Unhandled Error!");
        const error = new ResponseError({
          name: "ER00",
          httpCode: 500,
          message: "Internal Server Error",
        });
        res.status(500).send(error);
      }
    } finally {
      client.release();
    }
  }
);
