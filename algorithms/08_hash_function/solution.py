import json
import random
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


def duplicates_naive(a):
    n = len(a)
    for i in range(n):
        for j in range(i + 1, n):
            if a[i] == a[j]:
                return True
    return False


def duplicates_sort(a):
    b = sorted(a)
    return any(b[i] == b[i + 1] for i in range(len(b) - 1))


def duplicates_hash(a):
    seen = set()
    for x in a:
        if x in seen:
            return True
        seen.add(x)
    return False


def duplicates_counting(a, k):
    seen = [False] * (k + 1)
    for x in a:
        if seen[x]:
            return True
        seen[x] = True
    return False


KEYS = DATA["keys"]
SIZE = DATA["size"]


def h(k):
    return (11 * k + 4) % SIZE


def chaining(keys):
    table = [[] for _ in range(SIZE)]
    for k in keys:
        table[h(k)].append(k)
    return table


def linear_probing(keys):
    table = [None] * SIZE
    steps = []
    for k in keys:
        i, path = h(k), []
        while table[i] is not None:
            path.append(i)
            i = (i + 1) % SIZE
        table[i] = k
        steps.append((k, h(k), path, i))
    return table, steps


def main():
    rng = random.Random(1)
    for name, data in [("без повторов", rng.sample(range(1, 1000), 200)), ("с повтором", [5, 3, 9, 1, 3])]:
        k = max(data)
        print(name, [duplicates_naive(data), duplicates_sort(data), duplicates_hash(data), duplicates_counting(data, k)])

    print("\nh(k) = (11k + 4) mod 9")
    for k in KEYS:
        print(f"  h({k}) = {11 * k + 4} mod 9 = {h(k)}")

    print("\nЗакрытая адресация (метод цепочек):")
    for i, chain in enumerate(chaining(KEYS)):
        print(f"  {i}: {' -> '.join(map(str, chain)) if chain else '-'}")

    table, steps = linear_probing(KEYS)
    print("\nОткрытая адресация (линейное пробирование):")
    for k, home, path, place in steps:
        busy = f", заняты {path}" if path else ""
        print(f"  {k}: дом {home}{busy} -> ячейка {place}")
    for i, k in enumerate(table):
        print(f"  [{i}] {k if k is not None else '-'}")


if __name__ == "__main__":
    main()
