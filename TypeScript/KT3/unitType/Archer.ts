import { Unit } from "./Unit";

export class Archer extends Unit {
  kind(): string {
    return "лучник";
  }

  baseDamage(): number {
    return 12;
  }
}
