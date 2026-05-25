import { Archer } from "./Archer";

export class FrostArcher extends Archer {
  constructor(public slowdown: number) {
    super();
  }

  describe(): string {
    return `Морозный лучник, базовый урон 12 с процентом замедления морозом ${this.slowdown}%`;
  }
}
