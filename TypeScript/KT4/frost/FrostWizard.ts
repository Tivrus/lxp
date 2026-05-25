import { Wizard } from "./Wizard";

export class FrostWizard extends Wizard {
  constructor(public slowdown: number) {
    super();
  }

  describe(): string {
    return `Морозный маг, базовый урон 10 с процентом замедления морозом ${this.slowdown}%`;
  }
}
