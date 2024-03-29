import "reflect-metadata";
import { Service } from "typedi";

import { BusinessLogicError } from "@apis/error";
import StatisicsRepository from "@repositories/statistics";

@Service()
export default class StatisticsService {
  private statModel: StatisicsRepository;
  constructor(statModel: StatisicsRepository) {
    this.statModel = statModel;
  }

  async getHashtagTrends() {
    const LIMIT = process.env.DOCUMENT_LIMIT;
    if (!LIMIT) {
      throw new BusinessLogicError({
        from: "statistics.service",
        errorCode: 5001,
        message: "Invalid ENV",
      });
    }
    const limit = Number(LIMIT);

    const hashtagTrendsResult = await this.statModel.readHashtagTrends(limit);

    return hashtagTrendsResult;
  }
  async getHashtagFrequency(userID: string) {
    const LIMIT = process.env.DOCUMENT_LIMIT;
    if (!LIMIT) {
      throw new BusinessLogicError({
        from: "statistics.service",
        errorCode: 5001,
        message: "Invalid ENV",
      });
    }
    const limit = Number(LIMIT);

    const hashtagFrequencyResult = await this.statModel.readHashtagFrequency(
      userID,
      limit
    );

    return hashtagFrequencyResult;
  }
}
