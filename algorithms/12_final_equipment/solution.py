import json
import random
from dataclasses import dataclass
from enum import Enum
from pathlib import Path


@dataclass(eq=False)
class Equipment:
    id: int
    name: str
    room: str
    status: str

    def __post_init__(self):
        if not isinstance(self.id, int) or self.id <= 0:
            raise ValueError(f"инвентарный номер должен быть положительным целым, получено {self.id}")

    def __eq__(self, other):
        return isinstance(other, Equipment) and self.id == other.id


RECORDS = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


def records():
    return [Equipment(*row) for row in RECORDS]


def division_hash(key, capacity):
    return key % capacity


def mixed_hash(key, capacity):
    return ((7 * key + 3) % 101) % capacity


@dataclass
class Distribution:
    addresses: list
    occupied: int
    empty: int
    collisions: int
    max_in_bucket: int
    load_factor: float


def analyze_distribution(keys, capacity, hash_function):
    counts = [0] * capacity
    addresses = []
    collisions = 0
    for key in keys:
        address = hash_function(key, capacity)
        addresses.append(address)
        if counts[address] > 0:
            collisions += 1
        counts[address] += 1
    occupied = sum(1 for c in counts if c)
    return Distribution(addresses, occupied, capacity - occupied, collisions, max(counts), len(keys) / capacity)


class ChainNode:
    def __init__(self, equipment):
        self.data = equipment
        self.next = None


class ChainedHashTable:
    def __init__(self, capacity=13, hash_function=division_hash):
        self.capacity = capacity
        self.hash_function = hash_function
        self.buckets = [None] * capacity
        self.size = 0

    def _index(self, key):
        return self.hash_function(key, self.capacity)

    def insert(self, equipment):
        index = self._index(equipment.id)
        node = self.buckets[index]
        if node is None:
            self.buckets[index] = ChainNode(equipment)
            self.size += 1
            return True
        while True:
            if node.data.id == equipment.id:
                return False
            if node.next is None:
                node.next = ChainNode(equipment)
                self.size += 1
                return True
            node = node.next

    def trace(self, equipment_id):
        visited, node = [], self.buckets[self._index(equipment_id)]
        while node:
            visited.append(node.data.id)
            if node.data.id == equipment_id:
                return node.data, visited
            node = node.next
        return None, visited

    def search(self, equipment_id):
        record, visited = self.trace(equipment_id)
        return record, len(visited)

    def contains(self, equipment_id):
        return self.search(equipment_id)[0] is not None

    def update(self, equipment_id, room=None, status=None):
        record, _ = self.search(equipment_id)
        if record is None:
            return False
        if room is not None:
            record.room = room
        if status is not None:
            record.status = status
        return True

    def delete(self, equipment_id):
        index = self._index(equipment_id)
        previous, node = None, self.buckets[index]
        while node:
            if node.data.id == equipment_id:
                if previous is None:
                    self.buckets[index] = node.next
                else:
                    previous.next = node.next
                self.size -= 1
                return True
            previous, node = node, node.next
        return False

    def load_factor(self):
        return self.size / self.capacity

    def chain(self, index):
        result, node = [], self.buckets[index]
        while node:
            result.append(node.data.id)
            node = node.next
        return result

    def records(self):
        return [record for index in range(self.capacity) for record in self._records(index)]

    def _records(self, index):
        node = self.buckets[index]
        while node:
            yield node.data
            node = node.next

    def rehash(self, new_capacity):
        old = self.records()
        self.capacity = new_capacity
        self.buckets = [None] * new_capacity
        self.size = 0
        for record in old:
            self.insert(record)

    def display(self):
        return [f"{i}: {' -> '.join(map(str, self.chain(i))) or '-'}" for i in range(self.capacity)]


EMPTY = object()
DELETED = object()


class Strategy(Enum):
    LINEAR = "линейное"
    QUADRATIC = "квадратичное"
    DOUBLE = "двойное"


def probe(key, i, capacity, strategy):
    home = key % capacity
    if strategy is Strategy.LINEAR:
        return (home + i) % capacity
    if strategy is Strategy.QUADRATIC:
        return (home + i * i) % capacity
    step = 1 + key % (capacity - 1)
    return (home + i * step) % capacity


def is_prime(number):
    if number < 2:
        return False
    d = 2
    while d * d <= number:
        if number % d == 0:
            return False
        d += 1
    return True


def next_prime(number):
    while not is_prime(number):
        number += 1
    return number


@dataclass
class InsertResult:
    inserted: bool
    index: int
    probes: int
    collisions: int


class OpenAddressHashTable:
    MAX_LOAD = 0.70

    def __init__(self, capacity=13, strategy=Strategy.LINEAR, auto_resize=False):
        self.capacity = capacity
        self.strategy = strategy
        self.auto_resize = auto_resize
        self.data = [EMPTY] * capacity
        self.size = 0
        self.deleted_count = 0
        self.resized = []

    def _sequence(self, key):
        for i in range(self.capacity):
            yield probe(key, i, self.capacity, self.strategy)

    def insert(self, equipment):
        if self.auto_resize and (self.size + 1) / self.capacity > self.MAX_LOAD:
            new_capacity = next_prime(2 * self.capacity)
            self.resized.append((self.capacity, new_capacity))
            self.rehash(new_capacity)
        probes = collisions = 0
        first_deleted = None
        for index in self._sequence(equipment.id):
            probes += 1
            cell = self.data[index]
            if cell is EMPTY:
                target = index if first_deleted is None else first_deleted
                break
            if cell is DELETED:
                if first_deleted is None:
                    first_deleted = index
                continue
            if cell.id == equipment.id:
                return InsertResult(False, index, probes, collisions)
            collisions += 1
        else:
            if first_deleted is None:
                return InsertResult(False, -1, probes, collisions)
            target = first_deleted
        if self.data[target] is DELETED:
            self.deleted_count -= 1
        self.data[target] = equipment
        self.size += 1
        return InsertResult(True, target, probes, collisions)

    def search(self, equipment_id):
        visited = []
        for index in self._sequence(equipment_id):
            visited.append(index)
            cell = self.data[index]
            if cell is EMPTY:
                break
            if cell is not DELETED and cell.id == equipment_id:
                return cell, visited, len(visited)
        return None, visited, len(visited)

    def contains(self, equipment_id):
        return self.search(equipment_id)[0] is not None

    def update(self, equipment_id, room=None, status=None):
        record = self.search(equipment_id)[0]
        if record is None:
            return False
        if room is not None:
            record.room = room
        if status is not None:
            record.status = status
        return True

    def delete(self, equipment_id):
        record, visited, _ = self.search(equipment_id)
        if record is None:
            return False
        self.data[visited[-1]] = DELETED
        self.size -= 1
        self.deleted_count += 1
        return True

    def load_factor(self):
        return self.size / self.capacity

    def used_factor(self):
        return (self.size + self.deleted_count) / self.capacity

    def records(self):
        return [cell for cell in self.data if cell is not EMPTY and cell is not DELETED]

    def rehash(self, new_capacity):
        active = self.records()
        auto, self.auto_resize = self.auto_resize, False
        self.capacity = new_capacity
        self.data = [EMPTY] * new_capacity
        self.size = 0
        self.deleted_count = 0
        for record in active:
            self.insert(record)
        self.auto_resize = auto

    def cell(self, index):
        value = self.data[index]
        if value is EMPTY:
            return "-"
        if value is DELETED:
            return "DELETED"
        return str(value.id)

    def display(self):
        return [f"{i}: {self.cell(i)}" for i in range(self.capacity)]


def path_text(table, visited):
    return " -> ".join(f"{i}(DELETED)" if table.data[i] is DELETED else str(i) for i in visited)


def side_by_side(tables):
    header = "Индекс | " + " | ".join(t.strategy.value for t in tables)
    rows = [f"{i:>6} | " + " | ".join(f"{t.cell(i):>{len(t.strategy.value)}}" for t in tables) for i in range(tables[0].capacity)]
    return [header] + rows


def stage_two():
    print("Этап 2. Распределение ключей, m = 13")
    keys = [r[0] for r in RECORDS]
    division = analyze_distribution(keys, 13, division_hash)
    mixed = analyze_distribution(keys, 13, mixed_hash)
    print("  Ключ | division | mixed")
    for key, a, b in zip(keys, division.addresses, mixed.addresses):
        print(f"  {key:>4} | {a:>8} | {b:>5}")
    for title, attr in [("Занятые бакеты", "occupied"), ("Пустые бакеты", "empty"), ("Вставки с коллизией", "collisions"),
                        ("Макс. ключей в бакете", "max_in_bucket")]:
        print(f"  {title:<22} {getattr(division, attr):>3} {getattr(mixed, attr):>3}")
    print(f"  Коэффициент заполнения {division.load_factor:.3f}")


def stage_three():
    print("\nЭтап 3. Метод цепочек")
    table = ChainedHashTable(13)
    for record in records():
        table.insert(record)
    print("\n".join("  " + line for line in table.display()))
    print(f"  α = {table.size}/{table.capacity} = {table.load_factor():.3f}")
    for key in (42, 91):
        record, visited = table.trace(key)
        print(f"  поиск {key}: бакет {key % 13}, просмотрены {' -> '.join(map(str, visited))}, сравнений {len(visited)}, найдено: {record is not None}")
    print("  повторная вставка 27:", table.insert(Equipment(27, "Маршрутизатор", "B-214", "Свободно")))
    table.update(27, room="B-310", status="Выдано")
    print("  запись 27 после update:", table.search(27)[0])
    print("  вставка 195:", table.insert(Equipment(195, "Документ-камера", "B-210", "Свободно")))
    print("  удаление 39:", table.delete(39))
    print("  52 найдена:", table.contains(52), "195 найдена:", table.contains(195))
    print("  вставка 351:", table.insert(Equipment(351, "VR-шлем", "B-212", "Свободно")))
    print("  бакет 0:", " -> ".join(map(str, table.chain(0))))
    return table


def build_open_tables(auto_resize=False):
    tables = [OpenAddressHashTable(13, strategy, auto_resize) for strategy in Strategy]
    stats = []
    for table in tables:
        collisions = probes = 0
        for record in records():
            result = table.insert(record)
            collisions += result.collisions
            probes += result.probes
        stats.append((collisions, probes))
    return tables, stats


def stages_five_to_eight():
    tables, stats = build_open_tables()
    print("\nЭтап 5. Открытая адресация, m = 13")
    print("\n".join("  " + line for line in side_by_side(tables)))

    print("\nЭтап 6. Подсчёт операций при вставке")
    for table, (collisions, probes) in zip(tables, stats):
        print(f"  {table.strategy.value:<13} встречено занятых: {collisions:>2}, всего пробирований: {probes:>2}")

    print("\nЭтап 7. Поиск")
    for key in (42, 91):
        for table in tables:
            record, visited, probes = table.search(key)
            print(f"  {key} {table.strategy.value:<13} путь {path_text(table, visited)}, пробирований {probes}, найдено: {record is not None}")

    print("\nЭтап 8. Удаление и DELETED")
    for table in tables:
        table.insert(Equipment(195, "Документ-камера", "B-210", "Свободно"))
        table.delete(39)
        record, visited, _ = table.search(195)
        print(f"  {table.strategy.value:<13} поиск 195: {path_text(table, visited)}, найдено: {record is not None}")
        broken = OpenAddressHashTable(table.capacity, table.strategy)
        broken.data = [EMPTY if cell is DELETED else cell for cell in table.data]
        print(f"  {'':<13} если DELETED заменить на EMPTY: найдено: {broken.search(195)[0] is not None}")
        result = table.insert(Equipment(351, "VR-шлем", "B-212", "Свободно"))
        print(f"  {'':<13} 351 вставлен в ячейку {result.index}, deleted_count = {table.deleted_count}")
    print("\n".join("  " + line for line in side_by_side(tables)))
    print(f"  активных записей: {tables[0].size}, α = {tables[0].load_factor():.3f}")
    return tables


def stage_nine(tables):
    print("\nЭтап 9. Расширение и рехеширование")
    for table in tables:
        table.auto_resize = True
        table.insert(Equipment(54, "Набор датчиков", "A-305", "Свободно"))
        filled = [f"{i}:{table.cell(i)}" for i in range(table.capacity) if table.cell(i) != "-"]
        print(f"  {table.strategy.value:<13} расширение {table.resized}, capacity = {table.capacity}, size = {table.size}, "
              f"deleted_count = {table.deleted_count}, α = {table.load_factor():.3f}")
        print(f"  {'':<13} {', '.join(filled)}")


def longest_cluster(table):
    best = run = 0
    for cell in table.data + table.data:
        run = run + 1 if cell is not EMPTY else 0
        best = max(best, min(run, table.capacity))
    return best


def experiment(m=101, loads=(0.25, 0.50, 0.70, 0.85), seed=7):
    rng = random.Random(seed)
    rows = []
    for load in loads:
        n = round(load * m)
        pool = rng.sample(range(1, 100_000), n + 500)
        keys, missing = pool[:n], pool[n:]
        row = [load]
        chained = ChainedHashTable(m)
        collisions = compare_total = compare_max = 0
        for key in keys:
            index = key % m
            before = len(chained.chain(index))
            collisions += before > 0
            compare_total += before
            compare_max = max(compare_max, before)
            chained.insert(Equipment(key, "", "", ""))
        hit = sum(chained.search(k)[1] for k in keys) / n
        miss = sum(chained.search(k)[1] for k in missing) / len(missing)
        empty = sum(1 for i in range(m) if chained.buckets[i] is None)
        longest = max(len(chained.chain(i)) for i in range(m))
        row.append((collisions, compare_total / n, compare_max, hit, miss, longest, empty, 0))
        for strategy in Strategy:
            table = OpenAddressHashTable(m, strategy)
            collisions = probes_total = probes_max = failed = 0
            for key in keys:
                result = table.insert(Equipment(key, "", "", ""))
                failed += not result.inserted
                collisions += result.collisions
                probes_total += result.probes
                probes_max = max(probes_max, result.probes)
            hit = sum(table.search(k)[2] for k in keys) / n
            miss = sum(table.search(k)[2] for k in missing) / len(missing)
            empty = sum(1 for cell in table.data if cell is EMPTY)
            row.append((collisions, probes_total / n, probes_max, hit, miss, longest_cluster(table), empty, failed))
        rows.append(row)
    return rows


def stage_ten():
    print("\nЭтап 10. Эксперимент, m = 101")
    names = ["Цепочки", "Линейное", "Квадратичное", "Двойное"]
    metrics = [
        ("коллизии при вставке", 0, "{:.0f}"),
        ("среднее пробирований при вставке", 1, "{:.2f}"),
        ("максимум пробирований", 2, "{:.0f}"),
        ("успешный поиск, в среднем", 3, "{:.2f}"),
        ("неуспешный поиск, в среднем", 4, "{:.2f}"),
        ("самая длинная цепочка / кластер", 5, "{:.0f}"),
        ("пустых ячеек / бакетов", 6, "{:.0f}"),
        ("не удалось вставить", 7, "{:.0f}"),
    ]
    for row in experiment():
        print(f"\n  Заполнение {row[0]:.2f}")
        print(f"  {'':<34}" + "".join(f"{name:>14}" for name in names))
        for title, index, template in metrics:
            print(f"  {title:<34}" + "".join(f"{template.format(cell[index]):>14}" for cell in row[1:]))


def main():
    print("Этап 1.", Equipment(26, "Проектор", "A-201", "Свободно"))
    try:
        Equipment(0, "Ошибка", "-", "-")
    except ValueError as error:
        print("  запись с id = 0 отклонена:", error)
    print()
    stage_two()
    stage_three()
    tables = stages_five_to_eight()
    stage_nine(tables)
    stage_ten()


if __name__ == "__main__":
    main()
