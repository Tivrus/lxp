import { FrostArcher } from "./FrostArcher";
import { FrostWarrior } from "./FrostWarrior";
import { FrostWizard } from "./FrostWizard";
import { Unit } from "./Unit";
import { UnitFactory } from "./UnitFactory";

export class FrostFactory extends UnitFactory {
  createWarrior(): Unit {
    return new FrostWarrior(25 + Math.floor(Math.random() * 15));
  }

  createWizard(): Unit {
    return new FrostWizard(25 + Math.floor(Math.random() * 15));
  }

  createArcher(): Unit {
    return new FrostArcher(25 + Math.floor(Math.random() * 15));
  }
}
