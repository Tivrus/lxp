from itertools import product


def count_sequences(n):
    if n < 1:
        return 0
    k = [0] * (n + 1)
    k[1] = 2
    if n >= 2:
        k[2] = 3
    for i in range(3, n + 1):
        k[i] = k[i - 1] + k[i - 2]
    return k[n]


def brute_force(n):
    return sum("11" not in "".join(bits) for bits in product("01", repeat=n))


def sequences(n):
    return ["".join(bits) for bits in product("01", repeat=n) if "11" not in "".join(bits)]


def main():
    print("n  ДП  перебор")
    for n in range(1, 13):
        print(f"{n:<3}{count_sequences(n):<4}{brute_force(n)}")
    print("n = 4:", sequences(4))
    print("n = 64:", count_sequences(64), "(перебором 2^64 вариантов не посчитать)")


if __name__ == "__main__":
    main()
