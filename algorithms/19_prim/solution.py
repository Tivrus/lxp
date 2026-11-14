import heapq
import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))
EDGES = [tuple(e) for e in DATA["edges"]]


def build(edges):
    graph = {}
    for u, v, w in edges:
        graph.setdefault(u, []).append((v, w))
        graph.setdefault(v, []).append((u, w))
    return graph


def prim(graph, start):
    visited = {start}
    heap = [(w, start, v) for v, w in graph[start]]
    heapq.heapify(heap)
    tree = []
    while heap and len(visited) < len(graph):
        w, u, v = heapq.heappop(heap)
        if v in visited:
            continue
        visited.add(v)
        tree.append((u, v, w))
        for to, weight in graph[v]:
            if to not in visited:
                heapq.heappush(heap, (weight, v, to))
    connected = len(visited) == len(graph)
    return tree, sum(w for *_, w in tree), connected


def main():
    graph = build(EDGES)
    tree, total, connected = prim(graph, "A")
    print("порядок добавления:", ", ".join(f"{u}{v}={w}" for u, v, w in tree))
    print("итоговый вес:", total, "рёбер:", len(tree), "граф связный:", connected)

    graph = build(EDGES + [("F", "G", 3)])
    tree, total, connected = prim(graph, "A")
    print("\nс отдельной компонентой F-G:")
    print("рёбра:", ", ".join(f"{u}{v}={w}" for u, v, w in tree), "граф связный:", connected)


if __name__ == "__main__":
    main()
