import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


def king_routes(n, m, diagonal=False, forbidden=()):
    blocked = set(forbidden)
    w = [[0] * m for _ in range(n)]
    for a in range(n):
        for b in range(m):
            if (a, b) in blocked:
                continue
            if a == 0 and b == 0:
                w[a][b] = 1
                continue
            total = 0
            if b > 0:
                total += w[a][b - 1]
            if a > 0:
                total += w[a - 1][b]
            if diagonal and a > 0 and b > 0:
                total += w[a - 1][b - 1]
            w[a][b] = total
    return w[n - 1][m - 1], w


def show(w, forbidden=()):
    blocked = set(forbidden)
    return ["  " + " ".join(f"{'X' if (a, b) in blocked else v:>5}" for b, v in enumerate(row)) for a, row in enumerate(w)]


def main():
    n, m = DATA["board"]
    count, w = king_routes(n, m)
    print(f"Вариант 1 (вниз и вправо), доска {n}x{m}: {count}")
    print("\n".join(show(w)))
    count, w = king_routes(n, m, diagonal=True)
    print(f"\nВариант 2 (вниз, вправо, по диагонали): {count}")
    print("\n".join(show(w)))
    forbidden = [tuple(c) for c in DATA["forbidden"]]
    count, w = king_routes(n, m, forbidden=forbidden)
    print(f"\nВариант 3 (вниз и вправо, запретные клетки X): {count}")
    print("\n".join(show(w, forbidden)))


if __name__ == "__main__":
    main()
