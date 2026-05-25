import { Unit } from "../Unit";
import { UnitDecorator } from "../UnitDecorator";

export class Poison extends UnitDecorator {
  constructor(wrapped: Unit, public poisonDamage: number) {
    super(wrapped);
  }

  describe(): string {
    return `Юнит использующий яд (${this.wrapped.kind()}), базовый урон ${this.baseDamage()} с периодическим уроном от яда ${this.poisonDamage}`;
  }
}
