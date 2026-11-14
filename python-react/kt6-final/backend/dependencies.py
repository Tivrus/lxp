from typing import Annotated
from urllib.parse import unquote

from fastapi import Depends, Header, HTTPException, status

import db
from config import settings
from models.task import Task


def get_username(x_username: Annotated[str | None, Header()] = None) -> str:
    username = unquote(x_username or "").strip()
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не указано имя пользователя")
    return username[: settings.max_username_length]


def get_task(task_id: int) -> Task:
    task = db.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задача не найдена")
    return task


CurrentUser = Annotated[str, Depends(get_username)]
TaskDep = Annotated[Task, Depends(get_task)]
