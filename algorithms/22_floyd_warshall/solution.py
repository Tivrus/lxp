import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))
INF = float("inf")

VERTICES = DATA["vertices"]
EDGES = [tuple(e) for e in DATA["edges"]]


def floyd_warshall(vertices, edges):
    n = len(vertices)
    index = {v: i for i, v in enumerate(vertices)}
    dist = [[0 if i == j else INF for j in range(n)] for i in range(n)]
    next_vertex = [[j if i == j else None for j in range(n)] for i in range(n)]
    for u, v, w in edges:
        i, j = index[u], index[v]
        if w < dist[i][j]:
            dist[i][j] = w
            next_vertex[i][j] = j
    for k in range(n):
        for i in range(n):
            if dist[i][k] == INF:
                continue
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    next_vertex[i][j] = next_vertex[i][k]
    negative = [vertices[i] for i in range(n) if dist[i][i] < 0]
    return dist, next_vertex, negative


def route(vertices, next_vertex, dist, u, v):
    i, j = vertices.index(u), vertices.index(v)
    if dist[i][j] == INF:
        return None
    path = [u]
    while i != j:
        i = next_vertex[i][j]
        path.append(vertices[i])
    return path


def show(vertices, dist):
    lines = ["     " + "".join(f"{v:>5}" for v in vertices)]
    for v, row in zip(vertices, dist):
        lines.append(f"{v:>5}" + "".join(f"{'inf' if d == INF else d:>5}" for d in row))
    return lines


def main():
    dist, nxt, negative = floyd_warshall(VERTICES, EDGES)
    print("матрица расстояний:")
    print("\n".join(show(VERTICES, dist)))
    for u, v in (("A", "E"), ("B", "D"), ("E", "A")):
        path = route(VERTICES, nxt, dist, u, v)
        if path:
            print(f"{u} -> {v}: {' -> '.join(path)}, вес {dist[VERTICES.index(u)][VERTICES.index(v)]}")
        else:
            print(f"{u} -> {v}: пути нет")
    print("отрицательный цикл:", negative or "нет")

    dist, nxt, negative = floyd_warshall(VERTICES, EDGES + [("E", "B", -7)])
    print("\nс ребром E -> B = -7, диагональ:", [dist[i][i] for i in range(len(VERTICES))])
    print("отрицательный цикл через вершины:", negative)


if __name__ == "__main__":
    main()
