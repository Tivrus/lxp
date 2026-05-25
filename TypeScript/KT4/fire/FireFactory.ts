import { FireArcher } from "./FireArcher";
import { FireWarrior } from "./FireWarrior";
import { FireWizard } from "./FireWizard";
import { Unit } from "./Unit";
import { UnitFactory } from "./UnitFactory";

export class FireFactory extends UnitFactory {
  createWarrior(): Unit {
    return new FireWarrior(8 + Math.floor(Math.random() * 4));
  }

  createWizard(): Unit {
    return new FireWizard(6 + Math.floor(Math.random() * 4));
  }

  createArcher(): Unit {
    return new FireArcher(7 + Math.floor(Math.random() * 4));
  }
}
