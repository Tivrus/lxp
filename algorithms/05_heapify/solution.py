import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def heapify(data, size, i):
    while True:
        largest = i
        for child in (2 * i + 1, 2 * i + 2):
            if child < size and data[child] > data[largest]:
                largest = child
        if largest == i:
            return
        data[i], data[largest] = data[largest], data[i]
        i = largest


def build_max_heap(data):
    for i in range(len(data) // 2 - 1, -1, -1):
        heapify(data, len(data), i)
    return data


def is_max_heap(data):
    return all(data[(i - 1) // 2] >= data[i] for i in range(1, len(data)))


def sift_down_tree(node):
    while node:
        largest = node
        for child in (node.left, node.right):
            if child and child.value > largest.value:
                largest = child
        if largest is node:
            return
        node.value, largest.value = largest.value, node.value
        node = largest


def heapify_tree(node):
    if node is None:
        return None
    heapify_tree(node.left)
    heapify_tree(node.right)
    sift_down_tree(node)
    return node


def is_max_heap_tree(node):
    if node is None:
        return True
    for child in (node.left, node.right):
        if child and child.value > node.value:
            return False
    return is_max_heap_tree(node.left) and is_max_heap_tree(node.right)


def tree_lines(node, prefix=""):
    if node is None:
        return []
    lines = [prefix + str(node.value)]
    for child in (node.left, node.right):
        lines += tree_lines(child, prefix + "    ")
    return lines


def sample_tree():
    return TreeNode(3, TreeNode(1, TreeNode(9), TreeNode(4, None, TreeNode(12))), TreeNode(7, None, TreeNode(2, TreeNode(15))))


def main():
    data = list(DATA["array"])
    print("массив:", data)
    print("убывающая куча:", build_max_heap(data), is_max_heap(data))
    tree = sample_tree()
    print("произвольное дерево:")
    print("\n".join(tree_lines(tree)))
    heapify_tree(tree)
    print("после heapify:")
    print("\n".join(tree_lines(tree)))
    print("свойство кучи:", is_max_heap_tree(tree))


if __name__ == "__main__":
    main()
