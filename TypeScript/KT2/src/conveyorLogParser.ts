import type { Ball, BallColor } from "./ball.js";
import type { ILogParser } from "./interfaces.js";

const LINE_PATTERN = /^\[[^\]]+\]\s+Added\s+(red|green|blue)\s+ball\s+weighing\s+(\d+)\s+kg\s*$/i;

export class ConveyorLogParser implements ILogParser {
  parse(lines: readonly string[]): Ball[] {
    const balls: Ball[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        continue;
      }
      const match = LINE_PATTERN.exec(trimmed);
      if (!match) {
        continue;
      }
      const color = match[1]!.toLowerCase() as BallColor;
      const weightKg = Number.parseInt(match[2]!, 10);
      balls.push({ color, weightKg });
    }
    return balls;
  }
}
