import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BallAnalyticsService } from "./src/ballAnalyticsService.js";
import { ColorStatistic } from "./src/colorStatistic.js";
import { ConveyorLogParser } from "./src/conveyorLogParser.js";
import { StringLogSource } from "./src/stringLogSource.js";
import { WeightStatistic } from "./src/weightStatistic.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const logPath = join(__dirname, "..", "КТ2-balls.txt");
const logText = readFileSync(logPath, "utf8");

console.log(typeof(logText));
const analytics = new BallAnalyticsService(
  new StringLogSource(logText),
  new ConveyorLogParser(),
);

const colorCounts = analytics.runStatistic(new ColorStatistic());
console.log("По цвету:", colorCounts);

const minKg = 3;
const maxKg = 7;
const weightRange = analytics.runStatistic(new WeightStatistic(minKg, maxKg));
console.log(`Количество шариков с массой от ${minKg} до ${maxKg} кг:`, weightRange);
