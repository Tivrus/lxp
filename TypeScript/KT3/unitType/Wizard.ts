import { Unit } from "./Unit";

export class Wizard extends Unit {
  kind(): string {
    return "маг";
  }

  baseDamage(): number {
    return 10;
  }
}
