import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { Service } from "typedi";

import StatisticsService from "@services/statistics.service";
import { APIResponse } from "@apis/api";
import { ResponseError } from "@apis/error";

@Service()
export default class StatisticsController {
  private statSvc: StatisticsService;
  constructor(statSvc: StatisticsService) {
    this.statSvc = statSvc;
  }

  getHashtagTrends = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log("getHash");
    const hashtagTrendsResult = await this.statSvc.getHashtagTrends();
    const response = new APIResponse({
      httpStatusCode: 200,
      result: hashtagTrendsResult,
    });

    res.status(response.httpStatusCode).send(response);
  };
  getHashtagFrequency = async (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
  ) => {
    const { userID } = req.body.payload;
    const hashtagFrequencyResult = await this.statSvc.getHashtagFrequency(
      userID
    );
    const response = new APIResponse({
      httpStatusCode: 200,
      result: hashtagFrequencyResult,
    });

    res.status(response.httpStatusCode).send(response);
  };
}
