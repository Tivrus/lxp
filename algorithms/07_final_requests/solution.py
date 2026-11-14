import json
from collections import deque
from dataclasses import dataclass
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


@dataclass
class Request:
    id: int
    title: str
    priority: int


class TreeNode:
    def __init__(self, request):
        self.request = request
        self.left = None
        self.right = None


REQUESTS = [Request(**r) for r in DATA["requests"]]


def insert(root, request):
    if root is None:
        return TreeNode(request), True
    node = root
    while True:
        if request.id == node.request.id:
            return root, False
        side = "left" if request.id < node.request.id else "right"
        child = getattr(node, side)
        if child is None:
            setattr(node, side, TreeNode(request))
            return root, True
        node = child


def build_tree(requests):
    root = None
    for request in requests:
        root, _ = insert(root, request)
    return root


def preorder(node):
    return [node.request] + preorder(node.left) + preorder(node.right) if node else []


def inorder(node):
    return inorder(node.left) + [node.request] + inorder(node.right) if node else []


def postorder(node):
    return postorder(node.left) + postorder(node.right) + [node.request] if node else []


def level_order(root):
    result, queue = [], deque([root] if root else [])
    while queue:
        node = queue.popleft()
        result.append(node.request)
        queue.extend(child for child in (node.left, node.right) if child)
    return result


def levels(root):
    result, current = [], [root] if root else []
    while current:
        result.append([node.request for node in current])
        current = [child for node in current for child in (node.left, node.right) if child]
    return result


def search(root, request_id):
    path, node = [], root
    while node:
        path.append(node.request.id)
        if request_id == node.request.id:
            return node.request, path
        node = node.left if request_id < node.request.id else node.right
    return None, path


def find_min(root):
    while root and root.left:
        root = root.left
    return root.request if root else None


def find_max(root):
    while root and root.right:
        root = root.right
    return root.request if root else None


def count_nodes(root):
    return 1 + count_nodes(root.left) + count_nodes(root.right) if root else 0


def count_leaves(root):
    if root is None:
        return 0
    if root.left is None and root.right is None:
        return 1
    return count_leaves(root.left) + count_leaves(root.right)


def height(root):
    return 1 + max(height(root.left), height(root.right)) if root else 0


def get_depth(root, request_id):
    request, path = search(root, request_id)
    return len(path) - 1 if request else -1


def validate_bst(root, low=None, high=None):
    if root is None:
        return True
    key = root.request.id
    if (low is not None and key <= low) or (high is not None and key >= high):
        return False
    return validate_bst(root.left, low, key) and validate_bst(root.right, key, high)


def delete(root, request_id):
    if root is None:
        return None, False
    if request_id < root.request.id:
        root.left, deleted = delete(root.left, request_id)
        return root, deleted
    if request_id > root.request.id:
        root.right, deleted = delete(root.right, request_id)
        return root, deleted
    if root.left is None:
        return root.right, True
    if root.right is None:
        return root.left, True
    # узел с двумя потомками заменяем симметричным преемником: минимумом правого поддерева
    successor = root.right
    while successor.left:
        successor = successor.left
    root.request = successor.request
    root.right, _ = delete(root.right, successor.request.id)
    return root, True


def key(request):
    return request.priority, request.id


def sift_down(data, heap_size, index):
    while True:
        largest = index
        for child in (2 * index + 1, 2 * index + 2):
            if child < heap_size and key(data[child]) > key(data[largest]):
                largest = child
        if largest == index:
            return
        data[index], data[largest] = data[largest], data[index]
        index = largest


def build_max_heap(data):
    for index in range(len(data) // 2 - 1, -1, -1):
        sift_down(data, len(data), index)
    return data


def is_max_heap(data):
    return all(key(data[(i - 1) // 2]) >= key(data[i]) for i in range(1, len(data)))


def heap_levels(data):
    result, start, width = [], 0, 1
    while start < len(data):
        result.append(data[start:start + width])
        start += width
        width *= 2
    return result


def heap_sort(data):
    build_max_heap(data)
    for end in range(len(data) - 1, 0, -1):
        data[0], data[end] = data[end], data[0]
        sift_down(data, end, 0)
    return data


def fmt(requests):
    return ", ".join(f"{r.id}({r.priority})" for r in requests)


def ids(requests):
    return [r.id for r in requests]


def report(root, title):
    print(f"\n{title}")
    print("  симметричный обход:", ids(inorder(root)))
    print("  узлов:", count_nodes(root), "высота:", height(root), "validate_bst:", validate_bst(root))


def main():
    root = build_tree(REQUESTS)
    print("Этап 1. Дерево по уровням:")
    for level in levels(root):
        print("  " + "  ".join(f"{r.id}({r.priority})" for r in level))

    print("\nЭтап 2. Обходы")
    print("  прямой:      ", ids(preorder(root)))
    print("  симметричный:", ids(inorder(root)))
    print("  обратный:    ", ids(postorder(root)))
    print("  уровневый:   ", ids(level_order(root)))

    print("\nЭтап 3. Поиск и характеристики")
    found, path = search(root, 65)
    print("  поиск 65:", found, "путь:", " -> ".join(map(str, path)))
    missing, path = search(root, 99)
    print("  поиск 99:", missing, "путь:", " -> ".join(map(str, path)))
    print("  узлов:", count_nodes(root), "листьев:", count_leaves(root), "высота:", height(root))
    print("  min:", find_min(root).id, "max:", find_max(root).id, "глубина 65:", get_depth(root, 65))
    print("  validate_bst:", validate_bst(root))

    print("\nЭтап 4. Изменение дерева")
    root, ok = insert(root, Request(37, "Утечка данных", 16))
    report(root, f"добавить 37: {ok}")
    root, ok = insert(root, Request(50, "Дубликат", 1))
    report(root, f"повторно добавить 50: {ok} (дубликат отклонён)")
    for request_id, kind in ((10, "лист"), (35, "один потомок"), (70, "два потомка"), (999, "нет в дереве")):
        root, ok = delete(root, request_id)
        report(root, f"удалить {request_id} ({kind}): {ok}")

    print("\nЭтап 5. Максимальная куча")
    data = inorder(root)
    print("  исходный массив:", fmt(data))
    build_max_heap(data)
    print("  куча:           ", fmt(data))
    for number, level in enumerate(heap_levels(data)):
        print(f"  уровень {number}: {fmt(level)}")
    print("  is_max_heap:", is_max_heap(data))

    print("\nЭтап 6. Сортировка кучей")
    data = inorder(root)
    heap_sort(data)
    print("  по возрастанию приоритета:", fmt(data))
    print("  отчёт, сначала самые срочные:")
    for request in reversed(data):
        print(f"    {request.priority:>2}  {request.id:>3}  {request.title}")


if __name__ == "__main__":
    main()
