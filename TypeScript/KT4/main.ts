import { FireFactory } from "./FireFactory";
import { FrostFactory } from "./FrostFactory";
import { PoisonFactory } from "./PoisonFactory";
import { Unit } from "./Unit";
import { UnitFactory } from "./UnitFactory";

function rnd(n: number) {
  return Math.floor(Math.random() * n);
}

function randomUnit(factory: UnitFactory): Unit {
  const t = rnd(3);
  if (t === 0) return factory.createWarrior();
  if (t === 1) return factory.createWizard();
  return factory.createArcher();
}

const allFactories: UnitFactory[] = [
  new FireFactory(),
  new FrostFactory(),
  new PoisonFactory(),
];

for (let i = 0; i < 5; i++) {
  const f = allFactories[rnd(allFactories.length)]!;
  const u = randomUnit(f);
  console.log(u.describe());
}
