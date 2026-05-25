import type { Ball, BallColor } from "./ball.js";
import type { IStatistic } from "./interfaces.js";

export type ColorCountResult = Record<BallColor, number>;

const EMPTY: ColorCountResult = { red: 0, green: 0, blue: 0 };

export class ColorStatistic implements IStatistic<ColorCountResult> {
  compute(balls: readonly Ball[]): ColorCountResult {
    const result: ColorCountResult = { ...EMPTY };
    for (const ball of balls) {
      result[ball.color] += 1;
    }
    return result;
  }
}
