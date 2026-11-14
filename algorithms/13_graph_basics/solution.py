import json
from collections import deque
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))
VERTICES = DATA["vertices"]
EDGES = [tuple(e) for e in DATA["edges"]]


def adjacency(vertices, edges):
    graph = {v: [] for v in vertices}
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    for v in graph:
        graph[v].sort()
    return graph


def degrees(graph):
    return {v: len(neighbors) for v, neighbors in graph.items()}


def is_walk(graph, path):
    return all(b in graph[a] for a, b in zip(path, path[1:]))


def is_simple_path(graph, path):
    return is_walk(graph, path) and len(set(path)) == len(path)


def is_cycle(graph, path):
    edges = [frozenset(pair) for pair in zip(path, path[1:])]
    return (len(path) >= 4 and path[0] == path[-1] and is_walk(graph, path)
            and len(set(path[:-1])) == len(path) - 1 and len(set(edges)) == len(edges))


def is_connected(graph):
    start = next(iter(graph))
    seen, queue = {start}, deque([start])
    while queue:
        for nxt in graph[queue.popleft()]:
            if nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return len(seen) == len(graph)


def shortest_path(graph, start, goal):
    parent, queue = {start: None}, deque([start])
    while queue:
        v = queue.popleft()
        if v == goal:
            break
        for nxt in graph[v]:
            if nxt not in parent:
                parent[nxt] = v
                queue.append(nxt)
    if goal not in parent:
        return None
    path = []
    while goal is not None:
        path.append(goal)
        goal = parent[goal]
    return path[::-1]


def main():
    graph = adjacency(VERTICES, EDGES)
    print("порядок |V| =", len(VERTICES), " размер |E| =", len(EDGES))
    print("степени:", degrees(graph), " сумма:", sum(degrees(graph).values()), "= 2|E|")
    walk = ["A", "B", "C", "A", "B", "D"]
    path = ["A", "B", "D"]
    cycle = ["A", "B", "C", "A"]
    print("маршрут", " - ".join(walk), is_walk(graph, walk), "(вершины A и B повторяются)")
    print("простой путь", " - ".join(path), is_simple_path(graph, path))
    print("цикл", " - ".join(cycle), is_cycle(graph, cycle))
    print("список смежности:")
    for v, neighbors in graph.items():
        print(f"  {v}: {', '.join(neighbors)}")
    print("связный:", is_connected(graph))
    route = shortest_path(graph, "A", "E")
    print("кратчайший путь A -> E:", " - ".join(route), f"({len(route) - 1} ребра)")


if __name__ == "__main__":
    main()
