import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))
EDGES = [tuple(e) for e in DATA["edges"]]


class UnionFind:
    def __init__(self, vertices):
        self.parent = {v: v for v in vertices}
        self.rank = {v: 0 for v in vertices}
        self.components = len(self.parent)

    def find(self, vertex):
        root = vertex
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[vertex] != root:
            self.parent[vertex], vertex = root, self.parent[vertex]
        return root

    def union(self, u, v):
        ru, rv = self.find(u), self.find(v)
        if ru == rv:
            return False
        if self.rank[ru] < self.rank[rv]:
            ru, rv = rv, ru
        self.parent[rv] = ru
        if self.rank[ru] == self.rank[rv]:
            self.rank[ru] += 1
        self.components -= 1
        return True


def kruskal(graph):
    vertices = sorted({v for u, w, _ in graph for v in (u, w)})
    dsu = UnionFind(vertices)
    tree, log = [], []
    for u, v, w in sorted(graph, key=lambda e: e[2]):
        if dsu.union(u, v):
            tree.append((u, v, w))
            log.append(f"{u}{v}={w} добавлено")
        else:
            log.append(f"{u}{v}={w} пропущено: цикл")
    connected = dsu.components == 1
    return tree, sum(w for *_, w in tree), connected, log


def main():
    tree, total, connected, log = kruskal(EDGES)
    print("\n".join(log))
    print("MST:", ", ".join(f"{u}{v}={w}" for u, v, w in tree), "вес:", total, "граф связный:", connected)
    tree, total, connected, _ = kruskal(EDGES + [("F", "G", 3)])
    print("с отдельной компонентой F-G: рёбер", len(tree), "граф связный:", connected, "(получился остовный лес)")


if __name__ == "__main__":
    main()
