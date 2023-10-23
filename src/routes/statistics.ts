import "reflect-metadata";
import express, { Request, Response } from "express";
import Container from "typedi";

import StatisticsController from "@controllers/statistics.controller";
import { wrapAsync } from "@apis/error";

export const router = express.Router();

const statisticsControllerInstance = Container.get(StatisticsController);

router.get(
  "/hashtag-trends",
  wrapAsync(statisticsControllerInstance.getHashtagTrends)
);

router.get(
  "/frequency",
  wrapAsync(statisticsControllerInstance.getHashtagFrequency)
);
