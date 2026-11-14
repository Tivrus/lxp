import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))
EDGES = [tuple(e) for e in DATA["edges"]]


def minimum_spanning_tree(edges):
    vertices = sorted({v for u, w, _ in edges for v in (u, w)})
    parent = {v: v for v in vertices}

    def find(v):
        while parent[v] != v:
            parent[v] = parent[parent[v]]
            v = parent[v]
        return v

    tree, skipped = [], []
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        ru, rv = find(u), find(v)
        if ru == rv:
            skipped.append((u, v, w))
            continue
        parent[ru] = rv
        tree.append((u, v, w))
        if len(tree) == len(vertices) - 1:
            break
    return tree, sum(w for *_, w in tree), skipped


def main():
    tree, total, skipped = minimum_spanning_tree(EDGES)
    print("рёбра:", ", ".join(f"{u}{v}={w}" for u, v, w in tree))
    print("общий вес:", total)
    print("число рёбер:", len(tree), "(|V| - 1)")
    print("пропущены, чтобы не было цикла:", ", ".join(f"{u}{v}={w}" for u, v, w in skipped))
    print("циклы предотвращаются системой непересекающихся множеств: ребро берётся, только если его концы в разных компонентах")


if __name__ == "__main__":
    main()
