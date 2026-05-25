import type { ILogParser, ILogSource, IStatistic } from "./interfaces.js";

export class BallAnalyticsService {
  private readonly logSource: ILogSource;
  private readonly logParser: ILogParser;
  constructor(logSource: ILogSource, logParser: ILogParser) {
    this.logSource = logSource;
    this.logParser = logParser;
  }

  runStatistic<TResult>(statistic: IStatistic<TResult>): TResult {
    const lines = this.logSource.readLines();
    const balls = this.logParser.parse(lines);
    return statistic.compute(balls);
  }
}
