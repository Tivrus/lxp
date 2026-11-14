def count_routes(n):
    if n < 1:
        raise ValueError("n должно быть не меньше 1")
    dp = [0] * (n + 1)
    dp[1] = 1
    if n >= 2:
        dp[2] = 1
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n], dp[1:]


def count_routes_o1(n):
    if n < 1:
        raise ValueError("n должно быть не меньше 1")
    prev, cur = 0, 1
    for _ in range(n - 1):
        prev, cur = cur, prev + cur
    return cur


def main():
    answer, dp = count_routes(7)
    print("dp[1..7] =", dp)
    print("n = 7:", answer, "маршрутов")
    print("O(1) по памяти:", count_routes_o1(7))
    print("dp[1] = 1 (уже на месте), dp[2] = 1 (из 1 только шагом вперёд, прыжок через пункт не нужен)")


if __name__ == "__main__":
    main()
