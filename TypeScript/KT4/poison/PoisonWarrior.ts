import { Warrior } from "../unit/Warrior";

export class PoisonWarrior extends Warrior {
  constructor(public poisonDamage: number) {
    super();
  }

  describe(): string {
    return `Юнит использующий яд воин, базовый урон 15 с периодическим уроном от яда ${this.poisonDamage}`;
  }
}
