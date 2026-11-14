from models.task import Category, Task

categories: dict[int, Category] = {
    1: Category(id=1, name="Работа", color="blue"),
    2: Category(id=2, name="Дом", color="green"),
    3: Category(id=3, name="Учёба", color="orange"),
}

tasks: dict[int, Task] = {
    1: Task(
        id=1,
        title="Подготовить отчёт",
        description="Квартальный отчёт по проекту",
        category=categories[1],
        internal_note="Согласовать с руководителем",
    ),
    2: Task(id=2, title="Купить продукты", description="Молоко, хлеб, яйца", category=categories[2]),
    3: Task(id=3, title="Сделать лабу по Python", description="GraphQL на Strawberry", category=categories[3]),
}


def next_task_id() -> int:
    return max(tasks, default=0) + 1
