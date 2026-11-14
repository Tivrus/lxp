import strawberry

import db
from models.task import Category, Task, normalize_title


@strawberry.type
class CategoryType:
    id: int
    name: str
    color: str

    @classmethod
    def from_model(cls, category: Category) -> "CategoryType":
        return cls(id=category.id, name=category.name, color=category.color)


@strawberry.type
class TaskType:
    id: int
    title: str
    description: str
    is_completed: bool
    category: CategoryType

    @classmethod
    def from_model(cls, task: Task) -> "TaskType":
        return cls(
            id=task.id,
            title=task.title,
            description=task.description,
            is_completed=task.is_completed,
            category=CategoryType.from_model(task.category),
        )


def get_task_or_raise(task_id: int) -> Task:
    task = db.tasks.get(task_id)
    if task is None:
        raise ValueError("Задача не найдена")
    return task


@strawberry.type
class Query:
    @strawberry.field
    def all_tasks(self) -> list[TaskType]:
        return [TaskType.from_model(task) for task in db.tasks.values()]

    @strawberry.field
    def task(self, id: int) -> TaskType | None:
        task = db.tasks.get(id)
        return TaskType.from_model(task) if task else None

    @strawberry.field
    def categories(self) -> list[CategoryType]:
        return [CategoryType.from_model(category) for category in db.categories.values()]


@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_task(self, title: str, category_id: int, description: str = "") -> TaskType:
        category = db.categories.get(category_id)
        if category is None:
            raise ValueError("Категория не найдена")

        task = Task(
            id=db.next_task_id(),
            title=normalize_title(title),
            description=description,
            category=category,
        )
        db.tasks[task.id] = task
        return TaskType.from_model(task)

    @strawberry.mutation
    def complete_task(self, id: int) -> TaskType:
        task = get_task_or_raise(id)
        task.is_completed = not task.is_completed
        return TaskType.from_model(task)

    @strawberry.mutation
    def delete_task(self, id: int) -> bool:
        return db.tasks.pop(id, None) is not None


schema = strawberry.Schema(query=Query, mutation=Mutation)
