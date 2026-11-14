import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


class PriorityQueue:
    def __init__(self):
        self.items = []

    def __len__(self):
        return len(self.items)

    def _swap(self, i, j):
        self.items[i], self.items[j] = self.items[j], self.items[i]

    def _sift_up(self, i):
        while i > 0 and self.items[(i - 1) // 2][0] < self.items[i][0]:
            self._swap(i, (i - 1) // 2)
            i = (i - 1) // 2

    def _sift_down(self, i):
        n = len(self.items)
        while True:
            largest = i
            for child in (2 * i + 1, 2 * i + 2):
                if child < n and self.items[child][0] > self.items[largest][0]:
                    largest = child
            if largest == i:
                return
            self._swap(i, largest)
            i = largest

    def insert(self, value, priority):
        self.items.append((priority, value))
        self._sift_up(len(self.items) - 1)

    def peak(self):
        if not self.items:
            raise IndexError("очередь пуста")
        priority, value = self.items[0]
        return value, priority

    def extract(self):
        if not self.items:
            raise IndexError("очередь пуста")
        top = self.items[0]
        self._swap(0, len(self.items) - 1)
        self.items.pop()
        self._sift_down(0)
        return top[1], top[0]

    def change_key(self, value, priority):
        for i, (old, item) in enumerate(self.items):
            if item == value:
                self.items[i] = (priority, item)
                if priority > old:
                    self._sift_up(i)
                else:
                    self._sift_down(i)
                return True
        return False


def sift_down(data, size, i):
    while True:
        largest = i
        for child in (2 * i + 1, 2 * i + 2):
            if child < size and data[child] > data[largest]:
                largest = child
        if largest == i:
            return
        data[i], data[largest] = data[largest], data[i]
        i = largest


def heapsort(data):
    n = len(data)
    for i in range(n // 2 - 1, -1, -1):
        sift_down(data, n, i)
    for end in range(n - 1, 0, -1):
        data[0], data[end] = data[end], data[0]
        sift_down(data, end, 0)
    return data


def main():
    queue = PriorityQueue()
    for value, priority in DATA["tasks"]:
        queue.insert(value, priority)
    print("peak:", queue.peak())
    queue.change_key("почта", 10)
    print("после change_key(почта, 10), peak:", queue.peak())
    queue.change_key("сервер упал", 1)
    print("извлечение по порядку:", [queue.extract() for _ in range(len(queue))])
    data = DATA["array"]
    print("heapsort", data, "->", heapsort(data[:]))


if __name__ == "__main__":
    main()
