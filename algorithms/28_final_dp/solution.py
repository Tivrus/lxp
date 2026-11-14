import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


def binary_without_11(n):
    if n < 1:
        return 0
    prev, cur = 1, 2
    for _ in range(n - 1):
        prev, cur = cur, prev + cur
    return cur


def grid_paths(n, m):
    row = [1] * m
    for _ in range(1, n):
        for j in range(1, m):
            row[j] += row[j - 1]
    return row[-1]


def min_weight_path(field):
    n, m = len(field), len(field[0])
    inf = float("inf")
    cost = [[inf] * m for _ in range(n)]
    came = [[None] * m for _ in range(n)]
    for i in range(n):
        for j in range(m):
            if i == 0 and j == 0:
                cost[i][j] = field[0][0]
                continue
            for pi, pj in ((i, j - 1), (i - 1, j), (i - 1, j - 1)):
                if pi >= 0 and pj >= 0 and cost[pi][pj] + field[i][j] < cost[i][j]:
                    cost[i][j] = cost[pi][pj] + field[i][j]
                    came[i][j] = (pi, pj)
    path, cell = [], (n - 1, m - 1)
    while cell:
        path.append(cell)
        cell = came[cell[0]][cell[1]]
    return cost[n - 1][m - 1], path[::-1]


def longest_increasing_subsequence(a):
    if not a:
        return []
    length = [1] * len(a)
    prev = [-1] * len(a)
    for i in range(len(a)):
        for j in range(i):
            if a[j] < a[i] and length[j] + 1 > length[i]:
                length[i] = length[j] + 1
                prev[i] = j
    i = max(range(len(a)), key=length.__getitem__)
    result = []
    while i != -1:
        result.append(a[i])
        i = prev[i]
    return result[::-1]


def longest_palindrome_subsequence(s):
    n = len(s)
    if n == 0:
        return 0, ""
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    left, right, i, j = [], [], 0, n - 1
    while i <= j:
        if i == j:
            left.append(s[i])
            break
        if s[i] == s[j]:
            left.append(s[i])
            right.append(s[j])
            i, j = i + 1, j - 1
        elif dp[i + 1][j] >= dp[i][j - 1]:
            i += 1
        else:
            j -= 1
    return dp[0][n - 1], "".join(left + right[::-1])


FIELD = DATA["field"]


def main():
    print("Задача 1. Последовательности 0 и 1 без двух единиц подряд:")
    print("  ", {n: binary_without_11(n) for n in (1, 2, 3, 4, 5, 10, 64)})
    print("Задача 2. Способов пройти поле вправо и вниз:")
    print("  ", {f"{n}x{m}": grid_paths(n, m) for n, m in ((2, 2), (3, 3), (3, 7), (8, 8))})
    cost, path = min_weight_path(FIELD)
    print("Задача 3. Маршрут минимального веса (вправо, вниз, по диагонали):")
    print("   поле:", FIELD)
    print("   вес:", cost, "маршрут:", " -> ".join(f"({i},{j})={FIELD[i][j]}" for i, j in path))
    seq = DATA["sequence"]
    lis = longest_increasing_subsequence(seq)
    print("Задача 4. Наибольшая строго возрастающая подпоследовательность:")
    print("  ", seq, "->", lis, f"(длина {len(lis)})")
    for s in DATA["strings"]:
        length, palindrome = longest_palindrome_subsequence(s)
        print(f"Задача 5. {s}: длина {length}, например {palindrome}")


if __name__ == "__main__":
    main()
