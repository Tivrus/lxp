import json
from collections import deque
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))
VERTICES = DATA["vertices"]
EDGES = [tuple(e) for e in DATA["edges"]]


def build(vertices, edges):
    graph = {v: [] for v in vertices}
    for u, v in edges:
        graph[u].append(v)
    return graph


def topological_sort(graph):
    indegree = {v: 0 for v in graph}
    for u in graph:
        for v in graph[u]:
            indegree[v] += 1
    queue = deque(sorted(v for v in graph if indegree[v] == 0))
    order = []
    while queue:
        v = queue.popleft()
        order.append(v)
        for nxt in sorted(graph[v]):
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    if len(order) != len(graph):
        stuck = [v for v in graph if indegree[v] > 0]
        return order, stuck
    return order, []


def main():
    graph = build(VERTICES, EDGES)
    order, stuck = topological_sort(graph)
    print("порядок:", " -> ".join(order), "цикл:", bool(stuck))

    graph = build(VERTICES, EDGES + [("F", "B")])
    order, stuck = topological_sort(graph)
    print("с ребром F -> B: успели вывести", order, "застряли", stuck, "цикл:", bool(stuck))


if __name__ == "__main__":
    main()
