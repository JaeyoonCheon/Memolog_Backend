import express, { Request, Response } from "express";
import { DatabaseError } from "pg";

import pool from "@database/postgreSQL/pool";
import {
  addHashtag,
  addDocumentHashtag,
  addHashtagLog,
} from "@controller/documents";
import * as documentModel from "@model/document";
import { ResponseError } from "@wrappers/error";

export const router = express.Router();

interface documentQuery {
  id?: number;
  cursor?: string;
  sort: string;
  order: string;
}

router.get(
  "/",
  async (req: Request<any, any, any, documentQuery>, res: Response) => {
    try {
      const { userID } = req.body.payload;
      const { id, cursor, sort, order } = req.query;

      console.log(req.query);
      const limit = Number(process.env.DOCUMENT_LIMIT);

      if (!limit) {
        return;
      }

      const isFirstPage = !id;
      let documents = null;

      console.log(isFirstPage);

      if (isFirstPage) {
        documents = await documentModel.readDocumentsFirstQuery({
          userID,
          limit,
          order,
          sort,
        });
      } else {
        if (!cursor || !id) {
          throw new ResponseError({
            httpStatusCode: 400,
            errorCode: 1201,
            message: "wrong params",
          });
        }
        documents = await documentModel.readDocumentsQuery({
          userID,
          limit,
          cursor,
          id,
          order,
          sort,
        });
      }

      const previewDocuments = documents.map((doc) => {
        return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
      });

      res.send(previewDocuments);
    } catch (e) {
      console.log(e);
      if (e instanceof ResponseError) {
        res.status(e.httpStatusCode).send(e);
      } else if (e instanceof DatabaseError) {
        const error = new ResponseError({
          httpStatusCode: 500,
        });
        res.status(500).send(error);
      } else {
        console.log("Unhandled Error!");
        const error = new ResponseError({
          httpStatusCode: 500,
        });
        res.status(500).send(error);
      }
    }
  }
);

interface documentSearchQuery {
  id?: number;
  cursor?: string;
  keyword: string;
}

router.get(
  "/search",
  async (req: Request<any, any, any, documentSearchQuery>, res: Response) => {
    const { userID } = req.body.payload;
    const { id, cursor, keyword } = req.query;
    const limit = Number(process.env.DOCUMENT_LIMIT);
    const isFirstQuery = !!id;

    console.log(`keyword: ${keyword} docId: ${id} cursor: ${cursor}`);

    try {
      if (!keyword || typeof keyword !== "string") {
        throw new ResponseError({
          httpStatusCode: 400,
          errorCode: 1202,
          message: "Wrong keyword",
        });
      }
      const searchKeyword = keyword.startsWith("#")
        ? keyword.substring(1)
        : keyword;

      let documents = null;

      if (isFirstQuery) {
        documents = await documentModel.findDocumentsFirstQuery({
          limit,
          searchKeyword,
          userID,
        });
      } else {
        if (!cursor || !id) {
          throw new ResponseError({
            httpStatusCode: 400,
            errorCode: 1201,
            message: "wrong params",
          });
        }
        documents = await documentModel.findDocumentsQuery({
          cursor,
          id,
          limit,
          searchKeyword,
          userID,
        });
      }

      const previewDocuments = documents.map((doc) => {
        return { ...doc, form: doc.form.replace(/(<([^>]+)>)/gi, "") };
      });

      res.send(previewDocuments);
    } catch (e) {
      if (e instanceof ResponseError) {
        res.status(e.httpStatusCode).send(e);
      } else if (e instanceof DatabaseError) {
        const error = new ResponseError({
          httpStatusCode: 500,
          message: "Internal Server Error",
        });
        res.status(500).send(error);
      } else {
        console.log("Unhandled Error!");
        const error = new ResponseError({
          httpStatusCode: 500,
          message: "Internal Server Error",
        });
        res.status(500).send(error);
      }
    }
  }
);

router.get(
  "/:id",
  async (req: Request<{ id: number }, any, any, any>, res: Response) => {
    const { id } = req.params;

    try {
      const document = await documentModel.readDocument(id);
      const hashtags = await documentModel.readHashtags(id);
      const filteredHashtags = hashtags.filter(
        (hashtag) => hashtag.id !== null
      );

      const newDocument = { hashtags: filteredHashtags, ...document };

      res.send(newDocument);
    } catch (e) {
      console.log(e);
      if (e instanceof DatabaseError) {
        const error = new ResponseError({
          httpStatusCode: 500,
        });
        res.status(500).send(error);
      } else {
        console.log("Unhandled Error!");
        const error = new ResponseError({
          httpStatusCode: 500,
        });
        res.status(500).send(error);
      }
    }
  }
);

router.post("/", async (req: Request, res: Response) => {
  try {
    const { userID } = req.body.payload;
    const { title, form, scope, thumbnail_url, hashtags } = req.body;

    const localeOffset = new Date().getTimezoneOffset() * 60000;
    const created_at = new Date(Date.now() - localeOffset);
    const updated_at = created_at;

    const docID = await documentModel.createDocument({
      title,
      form,
      created_at,
      updated_at,
      userID,
      scope,
      thumbnail_url,
      hashtags,
    });

    if (hashtags instanceof Array && hashtags.length > 0) {
      const hashtagIdsPromise = hashtags.map((hashtag) => addHashtag(hashtag));
      const hashtagIds = await Promise.all(hashtagIdsPromise);

      await Promise.all(
        hashtagIds.map((hashId) => addDocumentHashtag(docID, hashId))
      );
      await Promise.all(
        hashtagIds.map((hashId) => addHashtagLog(hashId, created_at))
      );
    }

    res.status(200).send("Data insert successfully.");
  } catch (e) {
    console.log(e);
    if (e instanceof DatabaseError) {
      const error = new ResponseError({
        httpStatusCode: 500,
      });
      res.status(500).send(error);
    } else {
      console.log("Unhandled Error!");
      const error = new ResponseError({
        httpStatusCode: 500,
      });
      res.status(500).send(error);
    }
  }
});

router.post(
  "/:id",
  async (req: Request<{ id: number }, any, any, any>, res: Response) => {
    const { id } = req.params;

    try {
      const { title, form, scope, thumbnail_url, hashtags } = req.body;

      const localeOffset = new Date().getTimezoneOffset() * 60000;
      const updated_at = new Date(Date.now() - localeOffset);

      await documentModel.deleteDocumentHashtag(id);
      await documentModel.updateDocument({
        title,
        form,
        id,
        scope,
        thumbnail_url,
        updated_at,
      });

      if (hashtags instanceof Array && hashtags.length > 0) {
        const hashtagIdsPromise = hashtags.map((hashtag) =>
          addHashtag(hashtag)
        );
        const hashtagIds = await Promise.all(hashtagIdsPromise);

        const docHashPromise = hashtagIds.map((hashId) =>
          addDocumentHashtag(id, hashId)
        );
        await Promise.all(docHashPromise);

        const hashAccessPromise = hashtagIds.map((hashId) =>
          addHashtagLog(hashId, updated_at)
        );
        await Promise.all(hashAccessPromise);
      }

      res.status(200).send("Data update successfully.");
    } catch (e) {
      console.log(e);
      if (e instanceof DatabaseError) {
        const error = new ResponseError({
          httpStatusCode: 500,
        });
        res.status(500).send(error);
      } else {
        console.log("Unhandled Error!");
        const error = new ResponseError({
          httpStatusCode: 500,
        });
        res.status(500).send(error);
      }
    }
  }
);

router.delete(
  "/:id",
  async (req: Request<{ id: number }, any, any, any>, res: Response) => {
    const { id } = req.params;

    try {
      await documentModel.deleteDocumentHashtag(id);
      await documentModel.deleteDocument(id);

      res.status(200).send("Data delete successfully.");
    } catch (e) {
      console.log(e);
      if (e instanceof DatabaseError) {
        const error = new ResponseError({
          httpStatusCode: 500,
        });
        res.status(500).send(error);
      } else {
        console.log("Unhandled Error!");
        const error = new ResponseError({
          httpStatusCode: 500,
        });
        res.status(500).send(error);
      }
    }
  }
);
