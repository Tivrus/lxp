import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


class BinaryHeap:
    def __init__(self, items=()):
        self.data = []
        for item in items:
            self.push(item)

    def __len__(self):
        return len(self.data)

    def peek(self):
        if not self.data:
            raise IndexError("куча пуста")
        return self.data[0]

    def push(self, item):
        self.data.append(item)
        self.shift_up(len(self.data) - 1)

    def pop(self):
        if not self.data:
            raise IndexError("куча пуста")
        top = self.data[0]
        last = self.data.pop()
        if self.data:
            self.data[0] = last
            self.shift_down(0)
        return top

    def shift_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.data[parent] <= self.data[i]:
                break
            self.data[parent], self.data[i] = self.data[i], self.data[parent]
            i = parent

    def shift_down(self, i):
        n = len(self.data)
        while True:
            smallest = i
            for child in (2 * i + 1, 2 * i + 2):
                if child < n and self.data[child] < self.data[smallest]:
                    smallest = child
            if smallest == i:
                return
            self.data[i], self.data[smallest] = self.data[smallest], self.data[i]
            i = smallest

    def is_heap(self):
        return all(self.data[(i - 1) // 2] <= self.data[i] for i in range(1, len(self.data)))


def main():
    heap = BinaryHeap()
    for x in DATA["items"]:
        heap.push(x)
        print(f"push {x}: {heap.data}")
    print("минимум:", heap.peek(), "куча корректна:", heap.is_heap())
    print("извлекаем:", [heap.pop() for _ in range(len(heap))])


if __name__ == "__main__":
    main()
