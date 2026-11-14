import json
from collections import deque
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


def total_delay(r, entry_points, wires):
    graph = [[] for _ in range(r)]
    total_length = 0
    for u, v, w in wires:
        graph[u].append((v, w))
        graph[v].append((u, w))
        total_length += w
    limit = total_length
    dist = [None] * r
    buckets = [[] for _ in range(limit + 1)]
    for s in entry_points:
        dist[s] = 0
        buckets[0].append(s)
    for d in range(limit + 1):
        for v in buckets[d]:
            if dist[v] != d:
                continue
            for to, w in graph[v]:
                nd = d + w
                if dist[to] is None or nd < dist[to]:
                    dist[to] = nd
                    buckets[nd].append(to)
    return sum(dist), dist


def bfs(graph, start):
    dist, parent = {start: 0}, {start: None}
    queue = deque([start])
    while queue:
        v = queue.popleft()
        for to in graph.get(v, []):
            if to not in dist:
                dist[to] = dist[v] + 1
                parent[to] = v
                queue.append(to)
    return dist, parent


def restore(parent, goal):
    path = []
    while goal is not None:
        path.append(goal)
        goal = parent[goal]
    return path[::-1]


def honeymoon(flights, home, cities):
    graph = {}
    for a, b in flights:
        graph.setdefault(a, []).append(b)
    trees = {city: bfs(graph, city) for city in [home] + list(cities)}
    best = None
    a, b, c = cities
    for order in ((a, b, c), (a, c, b), (b, a, c), (b, c, a), (c, a, b), (c, b, a)):
        stops = [home, *order, home]
        legs = []
        for x, y in zip(stops, stops[1:]):
            dist, parent = trees[x]
            if y not in dist:
                break
            legs.append(restore(parent, y))
        else:
            count = sum(len(leg) - 1 for leg in legs)
            if best is None or count < best[0]:
                route = legs[0] + [city for leg in legs[1:] for city in leg[1:]]
                best = (count, order, route)
    return best


def main():
    wires = [tuple(w) for w in DATA["wires"]]
    total, dist = total_delay(DATA["routers"], DATA["entry_points"], wires)
    print("Задержки в сети: точки входа 0 и 3")
    print("  расстояния:", dist, "суммарная задержка:", total)

    flights = [tuple(f) for f in DATA["flights"]]
    count, order, route = honeymoon(flights, DATA["home"], DATA["cities"])
    print("\nСвадебное путешествие: Москва, туристические города Рим, Париж, Барселона")
    print("  порядок городов:", " -> ".join(order), "перелётов:", count)
    print("  маршрут:", " -> ".join(route))


if __name__ == "__main__":
    main()
