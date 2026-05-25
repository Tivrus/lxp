import { Warrior } from "./Warrior";

export class FireWarrior extends Warrior {
  constructor(public fireDamage: number) {
    super();
  }

  describe(): string {
    return `Огненный воин, базовый урон 15 с дополнительным уроном от огня ${this.fireDamage}`;
  }
}
