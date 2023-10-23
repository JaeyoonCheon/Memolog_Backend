import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { Service, Container } from "typedi";

import BrowseService from "@services/browse.service";
import { APIResponse } from "@apis/api";

@Service()
export default class BrowseController {
  browseSvc: BrowseService;

  constructor(browseSvc: BrowseService) {
    this.browseSvc = browseSvc;
  }

  browseDocumentList = async (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) => {
    const { userID } = req.body.payload;
    const { id, cursor } = req.query;

    const documents = await this.browseSvc.browseDocumentList(
      id,
      cursor,
      userID
    );
    const response = new APIResponse({
      httpStatusCode: 200,
      result: documents,
    });

    res.status(200).send(response);
  };
}
