import { Request, Response, NextFunction } from "express";
import Container from "typedi";

import DocumentService from "@/service/documents.service";

export default class DocumentController {
  private documentSvc;

  constructor() {
    this.documentSvc = Container.get(DocumentService);
  }

  async getDocumentList(
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) {
    const { userID } = req.body.payload;
    const { id, cursor, sort, order } = req.query;

    const documentList = await this.documentSvc.readDocumentList(
      id,
      cursor,
      sort,
      order,
      userID
    );

    res.status(200).send(documentList);
  }
  async getDocument(
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;

    const document = await this.documentSvc.readDocument(id);

    res.status(200).send(document);
  }
  async searchDocumentList(
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) {
    const { userID } = req.body.payload;
    const { id, cursor, keyword } = req.query;

    const documentList = await this.documentSvc.searchDocumentList(
      id,
      cursor,
      userID,
      keyword
    );

    res.status(200).send(documentList);
  }
  async postDocument(req: Request, res: Response, next: NextFunction) {
    const { userID } = req.body.payload;
    const { title, form, scope, thumbnail_url, hashtags } = req.body;

    await this.documentSvc.createDocument(
      title,
      form,
      userID,
      scope,
      thumbnail_url,
      hashtags
    );

    res.status(200).send("ok");
  }
  async updateDocument(
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const { title, form, scope, thumbnail_url, hashtags } = req.body;

    await this.documentSvc.updateDocument(
      id,
      title,
      form,
      scope,
      thumbnail_url,
      hashtags
    );

    res.status(200).send("ok");
  }
  async deleteDocument(
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;

    await this.documentSvc.deleteDocument(id);

    res.status(200).send("ok");
  }
}
