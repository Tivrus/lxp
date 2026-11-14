import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


class AdjacencyListGraph:
    def __init__(self):
        self.adj = {}

    def add_vertex(self, vertex):
        if vertex in self.adj:
            return False
        self.adj[vertex] = []
        return True

    def add_edge(self, u, v):
        self.add_vertex(u)
        self.add_vertex(v)
        if self.has_edge(u, v):
            return False
        self.adj[u].append(v)
        self.adj[v].append(u)
        return True

    def has_edge(self, u, v):
        return u in self.adj and v in self.adj[u]

    def neighbors(self, vertex):
        return list(self.adj.get(vertex, []))

    def stored_elements(self):
        return sum(len(n) for n in self.adj.values())

    def show(self):
        return [f"{v}: {self.adj[v]}" for v in self.adj]


class AdjacencyMatrixGraph:
    def __init__(self):
        self.vertices = []
        self.matrix = []

    def _index(self, vertex):
        return self.vertices.index(vertex)

    def add_vertex(self, vertex):
        if vertex in self.vertices:
            return False
        self.vertices.append(vertex)
        for row in self.matrix:
            row.append(0)
        self.matrix.append([0] * len(self.vertices))
        return True

    def add_edge(self, u, v):
        self.add_vertex(u)
        self.add_vertex(v)
        if self.has_edge(u, v):
            return False
        i, j = self._index(u), self._index(v)
        self.matrix[i][j] = self.matrix[j][i] = 1
        return True

    def has_edge(self, u, v):
        if u not in self.vertices or v not in self.vertices:
            return False
        return self.matrix[self._index(u)][self._index(v)] == 1

    def neighbors(self, vertex):
        if vertex not in self.vertices:
            return []
        row = self.matrix[self._index(vertex)]
        return [self.vertices[j] for j, bit in enumerate(row) if bit]

    def stored_elements(self):
        return len(self.vertices) ** 2

    def show(self):
        lines = ["   " + "  ".join(self.vertices)]
        for v, row in zip(self.vertices, self.matrix):
            lines.append(f"{v}  " + "  ".join(map(str, row)))
        return lines


VERTICES = DATA["vertices"]
EDGES = [tuple(e) for e in DATA["edges"]]


def build(cls):
    graph = cls()
    for v in VERTICES:
        graph.add_vertex(v)
    for u, v in EDGES:
        graph.add_edge(u, v)
    return graph


def main():
    lst, mtx = build(AdjacencyListGraph), build(AdjacencyMatrixGraph)
    print("Список смежности:")
    print("\n".join("  " + line for line in lst.show()))
    print("Матрица смежности:")
    print("\n".join("  " + line for line in mtx.show()))
    for g, name in ((lst, "список"), (mtx, "матрица")):
        print(f"{name}: has_edge(B, D)={g.has_edge('B', 'D')}, has_edge(D, E)={g.has_edge('D', 'E')}, neighbors(C)={g.neighbors('C')}")
    v, e = len(VERTICES), len(EDGES)
    print(f"\nПамять: список хранит 2|E| = {lst.stored_elements()} элементов (+ {v} ключей), матрица |V|² = {mtx.stored_elements()} ячеек")
    for n, m in ((100, 300), (1000, 3000), (1000, 400_000)):
        print(f"  |V|={n}, |E|={m}: список {2 * m + n}, матрица {n * n}")


if __name__ == "__main__":
    main()
