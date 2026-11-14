import json
from pathlib import Path

DATA = json.loads((Path(__file__).parent / "data.json").read_text(encoding="utf-8"))


class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.parent = None
        self.size = 1


def size(node):
    return node.size if node else 0


class BinarySearchTree:
    def __init__(self, keys=()):
        self.root = None
        for key in keys:
            self.insert(key)

    def __len__(self):
        return size(self.root)

    def search(self, key):
        node = self.root
        while node and node.key != key:
            node = node.left if key < node.key else node.right
        return node

    def __contains__(self, key):
        return self.search(key) is not None

    def insert(self, key):
        if key in self:
            return False
        node = Node(key)
        parent, current = None, self.root
        while current:
            parent = current
            current.size += 1
            current = current.left if key < current.key else current.right
        node.parent = parent
        if parent is None:
            self.root = node
        elif key < parent.key:
            parent.left = node
        else:
            parent.right = node
        return True

    def minimum(self, node=None):
        node = node or self.root
        while node and node.left:
            node = node.left
        return node

    def maximum(self, node=None):
        node = node or self.root
        while node and node.right:
            node = node.right
        return node

    def successor(self, node):
        if node.right:
            return self.minimum(node.right)
        parent = node.parent
        while parent and node is parent.right:
            node, parent = parent, parent.parent
        return parent

    def predecessor(self, node):
        if node.left:
            return self.maximum(node.left)
        parent = node.parent
        while parent and node is parent.left:
            node, parent = parent, parent.parent
        return parent

    def _replace(self, node, child):
        if node.parent is None:
            self.root = child
        elif node is node.parent.left:
            node.parent.left = child
        else:
            node.parent.right = child
        if child:
            child.parent = node.parent

    def _fix_sizes(self, node):
        while node:
            node.size = 1 + size(node.left) + size(node.right)
            node = node.parent

    def delete(self, key):
        node = self.search(key)
        if node is None:
            return False
        if node.left and node.right:
            following = self.minimum(node.right)
            node.key = following.key
            node = following
        child = node.left or node.right
        parent = node.parent
        self._replace(node, child)
        self._fix_sizes(parent)
        return True

    def kth(self, i):
        if not 0 <= i < len(self):
            raise IndexError(f"нет узла с номером {i}")
        node = self.root
        while True:
            left = size(node.left)
            if i < left:
                node = node.left
            elif i == left:
                return node
            else:
                i -= left + 1
                node = node.right

    def inorder(self):
        result, stack, node = [], [], self.root
        while stack or node:
            while node:
                stack.append(node)
                node = node.left
            node = stack.pop()
            result.append(node.key)
            node = node.right
        return result

    def height(self, node="root"):
        node = self.root if node == "root" else node
        if node is None:
            return 0
        return 1 + max(self.height(node.left), self.height(node.right))

    def lines(self, node="root", prefix="", is_left=None):
        node = self.root if node == "root" else node
        if node is None:
            return []
        mark = "" if is_left is None else ("L-- " if is_left else "R-- ")
        result = [prefix + mark + str(node.key)]
        next_prefix = prefix + ("" if is_left is None else ("|   " if is_left else "    "))
        for child, left in ((node.left, True), (node.right, False)):
            if child:
                result += self.lines(child, next_prefix, left)
        return result


KEYS = DATA["keys"]


def main():
    tree = BinarySearchTree(KEYS)
    print("BST из узлов", KEYS)
    print("\n".join(tree.lines()))
    print("симметричный обход:", tree.inorder())
    print("высота:", tree.height(), "узлов:", len(tree))
    print("i-й по порядку:", {i: tree.kth(i).key for i in range(len(tree))})
    print("поиск 12:", tree.search(12) is not None, "поиск 15:", tree.search(15) is not None)
    node = tree.search(11)
    print("преемник 11:", tree.successor(node).key, "предшественник 11:", tree.predecessor(node).key)
    for key in DATA["delete"]:
        tree.delete(key)
        print(f"удалили {key}: {tree.inorder()}, kth(0)={tree.kth(0).key}, kth({len(tree) - 1})={tree.kth(len(tree) - 1).key}")
    print("\n".join(tree.lines()))


if __name__ == "__main__":
    main()
