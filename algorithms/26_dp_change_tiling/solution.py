import json
from functools import lru_cache
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))
INF = float("inf")


def min_banknotes(nominals, amount):
    best = [0] + [INF] * amount
    last = [None] * (amount + 1)
    for s in range(1, amount + 1):
        for b in nominals:
            if b <= s and best[s - b] + 1 < best[s]:
                best[s] = best[s - b] + 1
                last[s] = b
    if best[amount] == INF:
        return None, []
    used, s = [], amount
    while s:
        used.append(last[s])
        s -= last[s]
    return best[amount], sorted(used, reverse=True)


def greedy(nominals, amount):
    used = []
    for b in sorted(nominals, reverse=True):
        while amount >= b:
            amount -= b
            used.append(b)
    return used if amount == 0 else None


def count_tilings(rows, cols, pieces=(2, 3)):
    cells = rows * cols

    @lru_cache(maxsize=None)
    def fill(mask):
        if mask == (1 << cells) - 1:
            return 1
        first = 0
        while mask >> first & 1:
            first += 1
        r, c = divmod(first, cols)
        total = 0
        for length in pieces:
            if c + length <= cols:
                block = sum(1 << (first + k) for k in range(length))
                if mask & block == 0:
                    total += fill(mask | block)
            if r + length <= rows:
                block = sum(1 << (first + k * cols) for k in range(length))
                if mask & block == 0:
                    total += fill(mask | block)
        return total

    return fill(0)


def ways(n):
    if n % 10 == 1 and n % 100 != 11:
        return f"{n} способ"
    if n % 10 in (2, 3, 4) and n % 100 not in (12, 13, 14):
        return f"{n} способа"
    return f"{n} способов"


def main():
    print("Задача про размен")
    for nominals, amount in DATA["change"]:
        count, used = min_banknotes(nominals, amount)
        print(f"  номиналы {nominals}, N = {amount}: ДП {used if count else 'нельзя выдать'}"
              f"{f' ({count} шт.)' if count else ''}, жадный {greedy(nominals, amount) or 'не нашёл'}")

    print("\nЗадача о покрытии фигурами 1x2 и 1x3")
    for rows, cols in DATA["boards"]:
        print(f"  {rows}x{cols}: {ways(count_tilings(rows, cols))}")


if __name__ == "__main__":
    main()
