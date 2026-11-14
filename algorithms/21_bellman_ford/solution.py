import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))
INF = float("inf")

EDGES = [tuple(e) for e in DATA["edges"]]


def bellman_ford(graph, start):
    vertices = sorted({v for u, w, _ in graph for v in (u, w)})
    dist = {v: INF for v in vertices}
    prev = {v: None for v in vertices}
    dist[start] = 0
    for _ in range(len(vertices) - 1):
        changed = False
        for u, v, w in graph:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                prev[v] = u
                changed = True
        if not changed:
            break
    cycle_edge = next(((u, v) for u, v, w in graph if dist[u] + w < dist[v]), None)
    cycle = find_cycle(prev, cycle_edge, len(vertices)) if cycle_edge else None
    return dist, prev, cycle


def find_cycle(prev, edge, n):
    u, v = edge
    prev = dict(prev)
    prev[v] = u
    for _ in range(n):
        v = prev[v]
    cycle, x = [v], prev[v]
    while x != v:
        cycle.append(x)
        x = prev[x]
    cycle.append(v)
    return cycle[::-1]


def path(prev, target):
    result = []
    while target is not None:
        result.append(target)
        target = prev[target]
    return result[::-1]


def main():
    dist, prev, cycle = bellman_ford(EDGES, "A")
    print("расстояния:", ", ".join(f"{v}={d}" for v, d in dist.items()))
    print("предки:", prev)
    for v in dist:
        print(f"  A -> {v}: {' -> '.join(path(prev, v))} = {dist[v]}")
    print("отрицательный цикл:", cycle)

    dist, prev, cycle = bellman_ford(EDGES + [("E", "B", -7)], "A")
    print("\nс ребром E -> B = -7")
    print("отрицательный цикл:", " -> ".join(cycle), "вес:", -2 + 4 - 7)


if __name__ == "__main__":
    main()
