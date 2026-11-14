from fastapi import APIRouter, HTTPException, status

import db
from models.task import Task, TaskCreate, TaskOut

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskOut])
def list_tasks() -> list[Task]:
    return list(db.tasks.values())


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate) -> Task:
    category = db.categories.get(payload.category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Категория не найдена")

    task = Task(
        id=db.next_task_id(),
        category=category,
        **payload.model_dump(exclude={"category_id"}),
    )
    db.tasks[task.id] = task
    return task


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int) -> Task:
    task = db.tasks.get(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задача не найдена")
    return task
