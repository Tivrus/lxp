class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1


def height(node):
    return node.height if node else 0


def update(node):
    node.height = 1 + max(height(node.left), height(node.right))


def balance(node):
    return height(node.left) - height(node.right) if node else 0


def rotate_right(y):
    x = y.left
    y.left, x.right = x.right, y
    update(y)
    update(x)
    return x


def rotate_left(x):
    y = x.right
    x.right, y.left = y.left, x
    update(x)
    update(y)
    return y


def rebalance(node):
    update(node)
    b = balance(node)
    if b > 1:
        if balance(node.left) < 0:
            node.left = rotate_left(node.left)
        return rotate_right(node)
    if b < -1:
        if balance(node.right) > 0:
            node.right = rotate_right(node.right)
        return rotate_left(node)
    return node


def insert(node, key):
    if node is None:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    else:
        return node
    return rebalance(node)


def min_node(node):
    while node.left:
        node = node.left
    return node


def delete(node, key):
    if node is None:
        return None
    if key < node.key:
        node.left = delete(node.left, key)
    elif key > node.key:
        node.right = delete(node.right, key)
    else:
        if node.left is None or node.right is None:
            return node.left or node.right
        following = min_node(node.right)
        node.key = following.key
        node.right = delete(node.right, following.key)
    return rebalance(node)


def search(node, key):
    while node and node.key != key:
        node = node.left if key < node.key else node.right
    return node


def inorder(node):
    return inorder(node.left) + [node.key] + inorder(node.right) if node else []


def is_avl(node):
    if node is None:
        return True
    return abs(balance(node)) <= 1 and is_avl(node.left) and is_avl(node.right)


def lines(node, prefix=""):
    if node is None:
        return []
    result = [f"{prefix}{node.key} (h={node.height}, b={balance(node)})"]
    for child in (node.left, node.right):
        result += lines(child, prefix + "    ")
    return result


def plain_height(keys):
    root = None
    for key in keys:
        node = root
        if node is None:
            root = Node(key)
            continue
        while True:
            side = "left" if key < node.key else "right"
            if getattr(node, side) is None:
                setattr(node, side, Node(key))
                break
            node = getattr(node, side)

    def h(n):
        return 1 + max(h(n.left), h(n.right)) if n else 0

    return h(root)


def main():
    keys = list(range(1, 16))
    root = None
    for key in keys:
        root = insert(root, key)
    print("вставили по возрастанию 1..15")
    print("высота AVL:", height(root), "высота обычного BST:", plain_height(keys))
    print("\n".join(lines(root)))
    for key in (8, 1, 2, 3):
        root = delete(root, key)
    print("после удаления 8, 1, 2, 3:", inorder(root), "AVL:", is_avl(root), "высота:", height(root))
    print("поиск 10:", search(root, 10) is not None, "поиск 8:", search(root, 8) is not None)


if __name__ == "__main__":
    main()
