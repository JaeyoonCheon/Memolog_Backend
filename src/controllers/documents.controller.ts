import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { Container, Service } from "typedi";

import DocumentService from "@services/documents.service";
import { APIResponse } from "@apis/api";

@Service()
export default class DocumentController {
  private documentSvc: DocumentService;

  constructor(documentSvc: DocumentService) {
    this.documentSvc = documentSvc;
  }

  getDocumentList = async (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) => {
    const { userID } = req.body.payload;
    const { id, cursor, sort, order } = req.query;

    const documentList = await this.documentSvc.readDocumentList(
      id,
      cursor,
      sort,
      order,
      userID
    );
    const response = new APIResponse({
      httpStatusCode: 200,
      result: documentList,
    });

    res.status(response.httpStatusCode).send(response);
  };
  getDocument = async (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    const document = await this.documentSvc.readDocument(id);
    const response = new APIResponse({
      httpStatusCode: 200,
      result: document,
    });

    res.status(response.httpStatusCode).send(response);
  };
  searchDocumentList = async (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) => {
    const { userID } = req.body.payload;
    const { id, cursor, keyword } = req.query;

    const documentList = await this.documentSvc.searchDocumentList(
      id,
      cursor,
      userID,
      keyword
    );
    const response = new APIResponse({
      httpStatusCode: 200,
      result: documentList,
    });

    res.status(response.httpStatusCode).send(response);
  };
  postDocument = async (req: Request, res: Response, next: NextFunction) => {
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
    const response = new APIResponse({
      httpStatusCode: 200,
    });

    res.status(response.httpStatusCode).send(response);
  };
  updateDocument = async (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) => {
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
    const response = new APIResponse({
      httpStatusCode: 200,
    });

    res.status(response.httpStatusCode).send(response);
  };
  deleteDocument = async (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    await this.documentSvc.deleteDocument(id);
    const response = new APIResponse({
      httpStatusCode: 200,
    });

    res.status(response.httpStatusCode).send(response);
  };
}
