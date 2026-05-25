import { Unit } from "./Unit";

export abstract class UnitDecorator extends Unit {
  constructor(protected wrapped: Unit) {
    super();
  }

  kind(): string {
    return this.wrapped.kind();
  }

  baseDamage(): number {
    return this.wrapped.baseDamage();
  }
}
