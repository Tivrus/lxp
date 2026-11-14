import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


class CuckooHashTable:
    def __init__(self, capacity=11, max_kicks=8):
        self.capacity = capacity
        self.max_kicks = max_kicks
        self.tables = [[None] * capacity, [None] * capacity]
        self.size = 0

    def _h(self, which, key):
        return key % self.capacity if which == 0 else (key // self.capacity) % self.capacity

    def search(self, key):
        for which in (0, 1):
            if self.tables[which][self._h(which, key)] == key:
                return which, self._h(which, key)
        return None

    def insert(self, key, log=None):
        if self.search(key):
            return False
        which = 0
        for _ in range(self.max_kicks):
            i = self._h(which, key)
            key, self.tables[which][i] = self.tables[which][i], key
            if log is not None:
                log.append((which, i))
            if key is None:
                self.size += 1
                return True
            which = 1 - which
        if log is not None:
            log.append(("rehash", self.capacity * 2 + 1))
        self._rehash(self.capacity * 2 + 1)
        return self.insert(key, log)

    def _rehash(self, capacity):
        keys = [k for table in self.tables for k in table if k is not None]
        self.capacity = capacity
        self.tables = [[None] * capacity, [None] * capacity]
        self.size = 0
        for k in keys:
            self.insert(k)

    def delete(self, key):
        place = self.search(key)
        if place is None:
            return False
        self.tables[place[0]][place[1]] = None
        self.size -= 1
        return True


class RobinHoodHashTable:
    def __init__(self, capacity=11):
        self.capacity = capacity
        self.slots = [None] * capacity

    def _home(self, key):
        return key % self.capacity

    def _distance(self, key, index):
        return (index - self._home(key)) % self.capacity

    def insert(self, key):
        index, dist = self._home(key), 0
        for _ in range(self.capacity):
            current = self.slots[index]
            if current is None:
                self.slots[index] = key
                return True
            if current == key:
                return False
            if self._distance(current, index) < dist:
                self.slots[index], key = key, current
                dist = self._distance(key, index)
            index = (index + 1) % self.capacity
            dist += 1
        raise OverflowError("таблица заполнена")

    def search(self, key):
        index, dist = self._home(key), 0
        while self.slots[index] is not None and dist <= self._distance(self.slots[index], index):
            if self.slots[index] == key:
                return index, dist + 1
            index = (index + 1) % self.capacity
            dist += 1
        return None, dist + 1

    def delete(self, key):
        index, _ = self.search(key)
        if index is None:
            return False
        nxt = (index + 1) % self.capacity
        while self.slots[nxt] is not None and self._distance(self.slots[nxt], nxt) > 0:
            self.slots[index] = self.slots[nxt]
            index, nxt = nxt, (nxt + 1) % self.capacity
        self.slots[index] = None
        return True

    def distances(self):
        return [None if k is None else self._distance(k, i) for i, k in enumerate(self.slots)]


class CoalescedHashTable:
    def __init__(self, capacity=11, cellar=3):
        self.capacity = capacity + cellar
        self.address = capacity
        self.keys = [None] * self.capacity
        self.next = [-1] * self.capacity
        self.free = self.capacity - 1

    def insert(self, key):
        i = key % self.address
        if self.keys[i] is None:
            self.keys[i] = key
            return True
        while True:
            if self.keys[i] == key:
                return False
            if self.next[i] == -1:
                break
            i = self.next[i]
        while self.free >= 0 and self.keys[self.free] is not None:
            self.free -= 1
        if self.free < 0:
            raise OverflowError("таблица заполнена")
        self.keys[self.free] = key
        self.next[i] = self.free
        return True

    def search(self, key):
        i, checks = key % self.address, 0
        while i != -1 and self.keys[i] is not None:
            checks += 1
            if self.keys[i] == key:
                return i, checks
            i = self.next[i]
        return None, checks


KEYS = DATA["keys"]


def main():
    print("ключи:", KEYS, "размер 11, у 20, 31, 42, 53 адрес 9, у 7, 18, 29, 40 адрес 7")

    cuckoo = CuckooHashTable()
    print("\nКукушкино хеширование (две таблицы, h1 = k mod 11, h2 = (k div 11) mod 11):")
    for key in KEYS:
        log = []
        cuckoo.insert(key, log)
        steps = [f"цикл, перестроение до {i}" if w == "rehash" else f"T{w + 1}[{i}]" for w, i in log]
        print(f"  {key}: {' -> '.join(steps)}")
    print("  T1:", cuckoo.tables[0])
    print("  T2:", cuckoo.tables[1])
    print("  поиск 53:", cuckoo.search(53), "не больше двух проверок для любого ключа")

    robin = RobinHoodHashTable()
    for key in KEYS:
        robin.insert(key)
    print("\nRobin Hood (линейное пробирование, 'бедный' ключ вытесняет 'богатого'):")
    print("  ячейки:    ", robin.slots)
    print("  расстояния:", robin.distances(), "максимум", max(d for d in robin.distances() if d is not None))
    print("  поиск 40:", robin.search(40), "поиск 51 (нет):", robin.search(51))
    robin.delete(31)
    print("  после удаления 31 (сдвиг назад без маркеров DELETED):", robin.slots)

    coalesced = CoalescedHashTable()
    for key in KEYS:
        coalesced.insert(key)
    print("\nСвязанное (coalesced) хеширование: 11 ячеек адресной зоны + 3 ячейки подвала:")
    print("  ключи:", coalesced.keys)
    print("  next: ", coalesced.next)
    print("  поиск 53:", coalesced.search(53), "поиск 40:", coalesced.search(40))


if __name__ == "__main__":
    main()
