import "reflect-metadata";
import express, { Request, Response } from "express";
import Container from "typedi";

import StatisticsController from "@controllers/statistics.controller";

export const router = express.Router();

const statisticsControllerInstance = Container.get(StatisticsController);

router.get("/hashtag-trends", statisticsControllerInstance.getHashtagTrends);

router.get("/frequency", statisticsControllerInstance.getHashtagFrequency);
