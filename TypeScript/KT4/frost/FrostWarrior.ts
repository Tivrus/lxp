import { Warrior } from "./Warrior";

export class FrostWarrior extends Warrior {
  constructor(public slowdown: number) {
    super();
  }

  describe(): string {
    return `Морозный воин, базовый урон 15 с процентом замедления морозом ${this.slowdown}%`;
  }
}
