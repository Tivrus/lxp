import json
from collections import deque
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))
GRAPH = DATA["graph"]


def bfs(graph, start):
    visited, order, queue = {start}, [], deque([start])
    while queue:
        vertex = queue.popleft()
        order.append(vertex)
        for nxt in graph[vertex]:
            if nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)
    return order


def dfs(graph, start, visited=None):
    visited = visited if visited is not None else []
    visited.append(start)
    for nxt in graph[start]:
        if nxt not in visited:
            dfs(graph, nxt, visited)
    return visited


def dfs_stack(graph, start):
    visited, stack = [], [start]
    while stack:
        vertex = stack.pop()
        if vertex in visited:
            continue
        visited.append(vertex)
        stack.extend(reversed(graph[vertex]))
    return visited


def main():
    print("BFS:", " -> ".join(bfs(GRAPH, "A")))
    print("DFS (рекурсия):", " -> ".join(dfs(GRAPH, "A")))
    print("DFS (стек):", " -> ".join(dfs_stack(GRAPH, "A")))


if __name__ == "__main__":
    main()
