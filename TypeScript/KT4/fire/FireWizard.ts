import { Wizard } from "./Wizard";

export class FireWizard extends Wizard {
  constructor(public fireDamage: number) {
    super();
  }

  describe(): string {
    return `Огненный маг, базовый урон 10 с дополнительным уроном от огня ${this.fireDamage}`;
  }
}
