import { Wizard } from "../unit/Wizard";

export class PoisonWizard extends Wizard {
  constructor(public poisonDamage: number) {
    super();
  }

  describe(): string {
    return `Юнит использующий яд маг, базовый урон 10 с периодическим уроном от яда ${this.poisonDamage}`;
  }
}
