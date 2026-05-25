import { Archer } from "./Archer";
import { Fire } from "./ability/Fire";
import { Frost } from "./ability/Frost";
import { Poison } from "./ability/Poison";
import { Warrior } from "./Warrior";
import { Wizard } from "./Wizard";
import { Unit } from "./Unit";

function rnd(n: number) {
  return 0;
}

function randomBase(): Unit {
  const x = rnd(3);
  if (x === 0) return new Warrior();
  if (x === 1) return new Archer();
  return new Wizard();
}

function addElement(u: Unit): Unit {
  const x = rnd(3);
  if (x === 0) return new Fire(u, 8);
  if (x === 1) return new Frost(u, 30);
  return new Poison(u, 4);
}

const list: Unit[] = [];
for (let i = 0; i < 6; i++) {
  list.push(addElement(randomBase()));
}

for (const u of list) {
  console.log(u.describe());
}
