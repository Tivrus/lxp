import bisect
import hashlib
import hmac
import os
import zlib


def file_checksum(data):
    return hashlib.sha256(data).hexdigest()


def hash_password(password, salt=None, iterations=200_000):
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return salt, digest


def check_password(password, salt, digest):
    return hmac.compare_digest(hash_password(password, salt)[1], digest)


def deduplicate(chunks):
    store, refs = {}, []
    for chunk in chunks:
        key = hashlib.sha1(chunk).hexdigest()
        store.setdefault(key, chunk)
        refs.append(key)
    return store, refs


def rabin_karp(text, pattern, base=256, mod=1_000_000_007):
    n, m = len(text), len(pattern)
    if m > n:
        return []
    high = pow(base, m - 1, mod)
    target = window = 0
    for i in range(m):
        target = (target * base + ord(pattern[i])) % mod
        window = (window * base + ord(text[i])) % mod
    found = []
    for i in range(n - m + 1):
        if window == target and text[i:i + m] == pattern:
            found.append(i)
        if i + m < n:
            window = ((window - ord(text[i]) * high) * base + ord(text[i + m])) % mod
    return found


class BloomFilter:
    def __init__(self, size=1000, hashes=3):
        self.bits = bytearray(size)
        self.size = size
        self.hashes = hashes

    def _positions(self, item):
        data = item.encode()
        a = zlib.crc32(data)
        b = zlib.adler32(data)
        return [(a + i * b) % self.size for i in range(self.hashes)]

    def add(self, item):
        for p in self._positions(item):
            self.bits[p] = 1

    def __contains__(self, item):
        return all(self.bits[p] for p in self._positions(item))


class ConsistentHashRing:
    def __init__(self, nodes, replicas=50):
        self.ring = []
        for node in nodes:
            for r in range(replicas):
                self.ring.append((self._hash(f"{node}#{r}"), node))
        self.ring.sort()
        self.keys = [h for h, _ in self.ring]

    @staticmethod
    def _hash(value):
        return int(hashlib.md5(value.encode()).hexdigest(), 16)

    def node_for(self, key):
        i = bisect.bisect(self.keys, self._hash(key)) % len(self.ring)
        return self.ring[i][1]


def main():
    original = b"lecture notes v1"
    print("1. Контроль целостности:")
    print("   sha256 файла:     ", file_checksum(original))
    print("   после правки байта:", file_checksum(b"lecture notes v2"))

    salt, digest = hash_password("qwerty123")
    print("2. Хранение паролей (PBKDF2): верный пароль", check_password("qwerty123", salt, digest),
          "неверный", check_password("qwerty124", salt, digest))

    store, refs = deduplicate([b"AAAA", b"BBBB", b"AAAA", b"CCCC", b"AAAA"])
    print(f"3. Дедупликация: блоков {len(refs)}, хранится уникальных {len(store)}")

    text = "abracadabra cadabra"
    print("4. Поиск подстроки Рабина-Карпа: 'cad' на позициях", rabin_karp(text, "cad"))

    bloom = BloomFilter()
    for login in ["ivan", "olga", "petr"]:
        bloom.add(login)
    print("5. Фильтр Блума: ivan", "ivan" in bloom, "anna", "anna" in bloom)

    ring = ConsistentHashRing(["cache-1", "cache-2", "cache-3"])
    keys = [f"user:{i}" for i in range(1000)]
    before = [ring.node_for(k) for k in keys]
    ring = ConsistentHashRing(["cache-1", "cache-2", "cache-3", "cache-4"])
    after = [ring.node_for(k) for k in keys]
    moved = sum(a != b for a, b in zip(before, after))
    print(f"6. Консистентное хеширование: при добавлении 4-го сервера переехало {moved} ключей из 1000")


if __name__ == "__main__":
    main()
