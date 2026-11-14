import heapq
import json
from collections import deque
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))
INF = float("inf")

OBJECTS = DATA["objects"]

EDGES = [tuple(e) for e in DATA["edges"]]


class DirectedWeightedGraph:
    def __init__(self):
        self.vertices = []
        self.adjacency = {}

    def add_vertex(self, vertex):
        if vertex in self.adjacency:
            return False, f"вершина {vertex} уже есть"
        self.vertices.append(vertex)
        self.adjacency[vertex] = {}
        return True, f"вершина {vertex} добавлена"

    def add_edge(self, source, target, weight):
        if source not in self.adjacency or target not in self.adjacency:
            return False, f"нет вершины {source if source not in self.adjacency else target}"
        if source == target:
            return False, f"петля {source} -> {target} запрещена"
        if isinstance(weight, bool) or not isinstance(weight, (int, float)):
            return False, "вес должен быть числом"
        if weight <= 0:
            return False, "вес должен быть положительным"
        if target in self.adjacency[source]:
            return False, f"ребро {source} -> {target} уже есть"
        self.adjacency[source][target] = weight
        return True, f"ребро {source} -> {target} ({weight}) добавлено"

    def remove_edge(self, source, target):
        if not self.has_edge(source, target):
            return False, f"ребра {source} -> {target} нет"
        del self.adjacency[source][target]
        return True, f"ребро {source} -> {target} удалено"

    def remove_vertex(self, vertex):
        if vertex not in self.adjacency:
            return False, f"вершины {vertex} нет"
        for targets in self.adjacency.values():
            targets.pop(vertex, None)
        del self.adjacency[vertex]
        self.vertices.remove(vertex)
        return True, f"вершина {vertex} удалена"

    def has_edge(self, source, target):
        return source in self.adjacency and target in self.adjacency[source]

    def get_weight(self, source, target):
        return self.adjacency[source][target] if self.has_edge(source, target) else None

    def neighbors(self, vertex):
        return sorted(self.adjacency.get(vertex, {}))

    def in_neighbors(self, vertex):
        return sorted(v for v in self.vertices if vertex in self.adjacency[v])

    def in_degree(self, vertex):
        return len(self.in_neighbors(vertex))

    def out_degree(self, vertex):
        return len(self.adjacency.get(vertex, {}))

    def vertex_count(self):
        return len(self.vertices)

    def edge_count(self):
        return sum(len(targets) for targets in self.adjacency.values())


def build_graph():
    graph = DirectedWeightedGraph()
    for v in OBJECTS:
        graph.add_vertex(v)
    for source, target, weight in EDGES:
        graph.add_edge(source, target, weight)
    return graph


def reachable(graph, start, reverse=False):
    seen, queue = {start}, deque([start])
    while queue:
        v = queue.popleft()
        nexts = graph.in_neighbors(v) if reverse else graph.neighbors(v)
        for to in nexts:
            if to not in seen:
                seen.add(to)
                queue.append(to)
    return seen


def has_cycle(graph):
    color = {v: 0 for v in graph.vertices}

    def visit(v):
        color[v] = 1
        for to in graph.neighbors(v):
            if color[to] == 1 or (color[to] == 0 and visit(to)):
                return True
        color[v] = 2
        return False

    return any(color[v] == 0 and visit(v) for v in graph.vertices)


def is_weakly_connected(graph):
    start = graph.vertices[0]
    seen, queue = {start}, deque([start])
    while queue:
        v = queue.popleft()
        for to in graph.neighbors(v) + graph.in_neighbors(v):
            if to not in seen:
                seen.add(to)
                queue.append(to)
    return len(seen) == graph.vertex_count()


def is_strongly_connected(graph):
    start = graph.vertices[0]
    n = graph.vertex_count()
    return len(reachable(graph, start)) == n and len(reachable(graph, start, reverse=True)) == n


def properties(graph):
    has_loops = any(v in graph.adjacency[v] for v in graph.vertices)
    return {
        "ориентированный": True,
        "взвешенный": True,
        "есть петли": has_loops,
        "есть кратные рёбра": False,
        "есть циклы": has_cycle(graph),
        "слабосвязный": is_weakly_connected(graph),
        "сильносвязный": is_strongly_connected(graph),
    }


def to_edge_list(graph):
    return [(s, t, graph.adjacency[s][t]) for s in graph.vertices for t in graph.neighbors(s)]


def to_adjacency_list(graph):
    return {s: [(t, graph.adjacency[s][t]) for t in graph.neighbors(s)] for s in graph.vertices}


def to_adjacency_matrix(graph):
    return [[1 if graph.has_edge(s, t) else 0 for t in graph.vertices] for s in graph.vertices]


def to_weight_matrix(graph):
    return [[0 if s == t else graph.get_weight(s, t) if graph.has_edge(s, t) else INF for t in graph.vertices]
            for s in graph.vertices]


def is_valid_walk(graph, vertices):
    return len(vertices) >= 1 and all(graph.has_edge(a, b) for a, b in zip(vertices, vertices[1:]))


def walk_weight(graph, vertices):
    if not is_valid_walk(graph, vertices):
        return None
    return sum(graph.get_weight(a, b) for a, b in zip(vertices, vertices[1:]))


def is_simple_path(vertices):
    return len(set(vertices)) == len(vertices)


def is_cycle(graph, vertices):
    return (len(vertices) >= 3 and vertices[0] == vertices[-1] and is_valid_walk(graph, vertices)
            and is_simple_path(vertices[:-1]))


def dijkstra(graph, start):
    dist = {v: INF for v in graph.vertices}
    prev = {v: None for v in graph.vertices}
    dist[start] = 0
    heap = [(0, start)]
    while heap:
        d, v = heapq.heappop(heap)
        if d > dist[v]:
            continue
        for to in graph.neighbors(v):
            nd = d + graph.get_weight(v, to)
            if nd < dist[to]:
                dist[to], prev[to] = nd, v
                heapq.heappush(heap, (nd, to))
    return dist, prev


def restore(prev, target):
    path = []
    while target is not None:
        path.append(target)
        target = prev[target]
    return path[::-1]


def floyd_warshall(graph):
    n = graph.vertex_count()
    dist = to_weight_matrix(graph)
    nxt = [[j if dist[i][j] != INF else None for j in range(n)] for i in range(n)]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    nxt[i][j] = nxt[i][k]
    return dist, nxt


def fw_route(graph, nxt, u, v):
    i, j = graph.vertices.index(u), graph.vertices.index(v)
    if nxt[i][j] is None:
        return None
    path = [u]
    while i != j:
        i = nxt[i][j]
        path.append(graph.vertices[i])
    return path


def matrix_lines(graph, matrix):
    lines = ["    " + "".join(f"{v:>4}" for v in graph.vertices)]
    for v, row in zip(graph.vertices, matrix):
        lines.append(f"{v:>4}" + "".join(f"{'inf' if x == INF else x:>4}" for x in row))
    return lines


def main():
    graph = build_graph()
    print(f"|V| = {graph.vertex_count()}, |E| = {graph.edge_count()}")

    print("\nЭтап 1. Свойства графа")
    for name, value in properties(graph).items():
        print(f"  {name}: {'да' if value else 'нет'}")
    print("  B -> D и D -> B: два разных ориентированных ребра, не кратные")

    print("\nЭтап 2. Проверка операций")
    print("  повторно A -> B:", graph.add_edge("A", "B", 3)[1])
    print("  петля A -> A:", graph.add_edge("A", "A", 1)[1])
    print("  из X:", graph.add_edge("X", "A", 1)[1])
    print("  отрицательный вес:", graph.add_edge("G", "A", -1)[1])
    print("  удалить A -> E:", graph.remove_edge("A", "E")[1], "| рёбер:", graph.edge_count())
    print("  вернуть A -> E:", graph.add_edge("A", "E", 15)[1], "| рёбер:", graph.edge_count())

    print("\nЭтап 3. Представления")
    print("  список рёбер:", to_edge_list(graph))
    print("  список смежности:")
    for v, items in to_adjacency_list(graph).items():
        print(f"    {v}: {', '.join(f'{t}({w})' for t, w in items)}")
    print("  матрица смежности:")
    print("\n".join("    " + line for line in matrix_lines(graph, to_adjacency_matrix(graph))))
    print("  начальная матрица весов D(0):")
    print("\n".join("    " + line for line in matrix_lines(graph, to_weight_matrix(graph))))

    print("\nЭтап 4. Степени")
    print("  вершина  исх.  вх.  исходящие соседи  входящие соседи")
    for v in graph.vertices:
        print(f"  {v:<8}{graph.out_degree(v):>4}{graph.in_degree(v):>5}  {','.join(graph.neighbors(v)):<17} {','.join(graph.in_neighbors(v))}")
    print("  Σ deg+ =", sum(graph.out_degree(v) for v in graph.vertices), " Σ deg- =", sum(graph.in_degree(v) for v in graph.vertices))
    print("  источники:", [v for v in graph.vertices if graph.in_degree(v) == 0],
          " стоки:", [v for v in graph.vertices if graph.out_degree(v) == 0])

    print("\nЭтап 5. Маршруты, пути и циклы")
    for seq in (["A", "B", "C", "D", "E", "F"], ["B", "C", "D", "B"], ["A", "D", "E"], ["A", "B", "C", "B"]):
        valid = is_valid_walk(graph, seq)
        line = f"  {' -> '.join(seq)}: маршрут {valid}"
        if valid:
            line += f", простой путь {is_simple_path(seq)}, цикл {is_cycle(graph, seq)}, рёбер {len(seq) - 1}, вес {walk_weight(graph, seq)}"
        else:
            bad = next((a, b) for a, b in zip(seq, seq[1:]) if not graph.has_edge(a, b))
            line += f", нет ребра {bad[0]} -> {bad[1]}"
        print(line)

    print("\nДополнительно. Кратчайшие пути")
    dist, prev = dijkstra(graph, "A")
    print("  Дейкстра из A:")
    for v in graph.vertices:
        route = " -> ".join(restore(prev, v)) if dist[v] != INF else "недостижима"
        print(f"    {v}: {dist[v] if dist[v] != INF else 'inf'}  {route}")
    matrix, nxt = floyd_warshall(graph)
    print("  Флойд-Уоршелл, матрица кратчайших расстояний:")
    print("\n".join("    " + line for line in matrix_lines(graph, matrix)))
    for u, v in (("A", "F"), ("G", "E"), ("E", "A")):
        route = fw_route(graph, nxt, u, v)
        print(f"    {u} -> {v}: {' -> '.join(route) if route else 'пути нет'}")


if __name__ == "__main__":
    main()
