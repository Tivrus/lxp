import { PoisonArcher } from "./PoisonArcher";
import { PoisonWarrior } from "./PoisonWarrior";
import { PoisonWizard } from "./PoisonWizard";
import { Unit } from "./Unit";
import { UnitFactory } from "./UnitFactory";

export class PoisonFactory extends UnitFactory {
  createWarrior(): Unit {
    return new PoisonWarrior(2 + Math.floor(Math.random() * 4));
  }

  createWizard(): Unit {
    return new PoisonWizard(2 + Math.floor(Math.random() * 4));
  }

  createArcher(): Unit {
    return new PoisonArcher(2 + Math.floor(Math.random() * 4));
  }
}
