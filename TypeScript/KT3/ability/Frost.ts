import { Unit } from "../Unit";
import { UnitDecorator } from "../UnitDecorator";

export class Frost extends UnitDecorator {
  constructor(wrapped: Unit, public slowdown: number) {
    super(wrapped);
  }

  describe(): string {
    return `Морозный ${this.wrapped.kind()}, базовый урон ${this.baseDamage()} с процентом замедления от мороза ${this.slowdown}%`;
  }
}
