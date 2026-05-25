export type BallColor = "red" | "green" | "blue";

export interface Ball {
  readonly color: BallColor;
  readonly weightKg: number;
}
