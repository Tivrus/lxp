export abstract class Unit {
  abstract kind(): string;
  abstract baseDamage(): number;

  describe(): string {
    return `${this.kind()}, базовый урон ${this.baseDamage()}`;
  }
}
