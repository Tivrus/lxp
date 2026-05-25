import { Unit } from "../Unit";
import { UnitDecorator } from "../UnitDecorator";

export class Fire extends UnitDecorator {
  constructor(wrapped: Unit, public fireDamage: number) {
    super(wrapped);
  }

  describe(): string {
    return `Огненный ${this.wrapped.kind()}, базовый урон ${this.baseDamage()} с дополнительным уроном от огня ${this.fireDamage}`;
  }
}
