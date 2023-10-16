import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { Service } from "typedi";

import StatisticsService from "@services/statistics.service";
import { ResponseError } from "@errors/error";

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

    res.status(200).send(hashtagTrendsResult);
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

    res.status(200).send(hashtagFrequencyResult);
  };
}
