import { Unit } from "./Unit";

export class Warrior extends Unit {
  kind(): string {
    return "воин";
  }

  baseDamage(): number {
    return 15;
  }
}
