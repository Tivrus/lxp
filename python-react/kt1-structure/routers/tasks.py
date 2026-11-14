from fastapi import APIRouter, HTTPException, status

from models.task import Category, Task, TaskCreate, TaskOut

router = APIRouter(prefix="/tasks", tags=["tasks"])

_tasks: dict[int, Task] = {
    1: Task(
        id=1,
        title="Подготовить отчёт",
        description="Квартальный отчёт по проекту",
        category=Category(name="Работа", color="blue"),
        internal_note="Согласовать с руководителем",
    ),
    2: Task(
        id=2,
        title="Купить продукты",
        description="Молоко, хлеб, яйца",
        category=Category(name="Дом", color="green"),
    ),
}


@router.get("", response_model=list[TaskOut])
def list_tasks() -> list[Task]:
    return list(_tasks.values())


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate) -> Task:
    task_id = max(_tasks, default=0) + 1
    task = Task(id=task_id, **payload.model_dump())
    _tasks[task_id] = task
    return task


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int) -> Task:
    task = _tasks.get(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задача не найдена")
    return task
