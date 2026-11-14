import json
import random
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


def h_random(x):
    return random.randint(0, 3000)


def h_mod(x):
    return x % 1301


def h_len(x):
    return len(str(x))


def h_digit_sum(x):
    d = str(x)
    return int(d[0]) + int(d[1]) + int(d[2]) + int(d[3])


def h_base5(x):
    d = str(x)
    return int(d[0]) + int(d[1]) * 5 + int(d[2]) * 25 + int(d[3]) * 125


def stats(func):
    counts = [0] * 5000
    for x in range(1000, 10000):
        counts[func(x)] += 1
    used = [c for c in counts if c]
    return len(used), max(used)


def is_deterministic(func):
    return all(func(x) == func(x) for x in range(1000, 1100))


KEYS = DATA["keys"]
SIZE = DATA["size"]


def chaining():
    table = [[] for _ in range(SIZE)]
    for k in KEYS:
        table[k % SIZE].append(k)
    return table


def linear_probing():
    table = [None] * SIZE
    log = []
    for k in KEYS:
        i, tried = k % SIZE, []
        while table[i] is not None:
            tried.append(i)
            i = (i + 1) % SIZE
        table[i] = k
        log.append((k, k % SIZE, tried, i))
    return table, log


def main():
    print("Задание 1. 9000 четырёхзначных чисел:")
    for name, func in [("random(0, 3000)", h_random), ("x mod 1301", h_mod), ("len(x)", h_len),
                       ("сумма цифр", h_digit_sum), ("x0 + 5x1 + 25x2 + 125x3", h_base5)]:
        distinct, worst = stats(func)
        print(f"  {name:<26} детерминирована: {is_deterministic(func)!s:<5} разных значений: {distinct:<5} макс. в одной ячейке: {worst}")

    print("\nЗадание 2. Hash(k) = k mod 9")
    print("  закрытая адресация:")
    for i, chain in enumerate(chaining()):
        print(f"    {i}: {' -> '.join(map(str, chain)) if chain else '-'}")
    table, log = linear_probing()
    print("  открытая адресация (линейное пробирование):")
    for k, home, tried, place in log:
        busy = f", заняты {tried}" if tried else ""
        print(f"    {k}: дом {home}{busy} -> {place}")
    print("    " + "  ".join(f"[{i}] {v}" for i, v in enumerate(table)))


if __name__ == "__main__":
    main()
