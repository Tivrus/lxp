import type { Ball } from "./ball.js";
import type { IStatistic } from "./interfaces.js";

export interface WeightRangeResult {
  readonly minKg: number;
  readonly maxKg: number;
  readonly count: number;
}

export class WeightStatistic implements IStatistic<WeightRangeResult> {
  private readonly minKg: number;
  private readonly maxKg: number;
  constructor(minKg: number, maxKg: number) {
    this.minKg = minKg;
    this.maxKg = maxKg;
  }

  compute(balls: readonly Ball[]): WeightRangeResult {
    let count = 0;
    for (const ball of balls) {
      if (ball.weightKg >= this.minKg && ball.weightKg <= this.maxKg) {
        count += 1;
      }
    }
    return { minKg: this.minKg, maxKg: this.maxKg, count };
  }
}
