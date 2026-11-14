import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


class Node:
    def __init__(self, key, value=None):
        self.key = key
        self.value = value
        self.left = None
        self.right = None
        self.parent = None

    def is_leaf(self):
        return self.left is None and self.right is None

    def children(self):
        return [child for child in (self.left, self.right) if child is not None]

    def __repr__(self):
        return f"Node({self.key})"


def insert(root, key, value=None):
    node = Node(key, value)
    if root is None:
        return node
    current = root
    while True:
        if key == current.key:
            current.value = value
            return root
        side = "left" if key < current.key else "right"
        child = getattr(current, side)
        if child is None:
            setattr(current, side, node)
            node.parent = current
            return root
        current = child


def show(node, prefix="", is_left=None):
    if node is None:
        return []
    mark = "" if is_left is None else ("L-- " if is_left else "R-- ")
    lines = [prefix + mark + str(node.key)]
    next_prefix = prefix + ("" if is_left is None else ("|   " if is_left else "    "))
    for child, left in ((node.left, True), (node.right, False)):
        if child is not None:
            lines += show(child, next_prefix, left)
    return lines


def main():
    root = None
    for key in DATA["keys"]:
        root = insert(root, key)
    print("\n".join(show(root)))
    six = root.left.right
    print(f"узел {six.key}: родитель {six.parent.key}, дети {[c.key for c in six.children()]}, лист: {six.is_leaf()}")
    print(f"узел 4: лист: {six.left.is_leaf()}")


if __name__ == "__main__":
    main()
