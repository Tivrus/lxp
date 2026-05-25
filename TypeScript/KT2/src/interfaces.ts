import type { Ball } from "./ball.js";

export interface ILogParser {
  parse(lines: readonly string[]): readonly Ball[];
}


export interface IStatistic<TResult> {
  compute(balls: readonly Ball[]): TResult;
}


export interface ILogSource {
  readLines(): readonly string[];
}
