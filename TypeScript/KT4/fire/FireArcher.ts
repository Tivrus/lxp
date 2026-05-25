import { Archer } from "./Archer";

export class FireArcher extends Archer {
  constructor(public fireDamage: number) {
    super();
  }

  describe(): string {
    return `Огненный лучник, базовый урон 12 с дополнительным уроном от огня ${this.fireDamage}`;
  }
}
