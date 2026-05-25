import { Archer } from "../unit/Archer";

export class PoisonArcher extends Archer {
  constructor(public poisonDamage: number) {
    super();
  }

  describe(): string {
    return `Юнит использующий яд лучник, базовый урон 12 с периодическим уроном от яда ${this.poisonDamage}`;
  }
}
