from fastapi import APIRouter, status

import db
from dependencies import CurrentUser, TaskDep
from models.comment import Comment, CommentCreate
from models.task import STATUS_LABELS, Task, TaskCreate, TaskUpdate
from services.events import log_activity, notify, notify_many, publish

router = APIRouter(prefix="/tasks", tags=["tasks"])


async def notify_assignee(task: Task, actor: str) -> None:
    if task.assignee and task.assignee != actor:
        await notify(task.assignee, f'Вам назначена задача "{task.title}" (от {actor})')


@router.get("", response_model=list[Task])
def list_tasks() -> list[Task]:
    return db.list_tasks()


@router.get("/{task_id}", response_model=Task)
def get_task(task: TaskDep) -> Task:
    return task


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, username: CurrentUser) -> Task:
    task = db.create_task(payload.title, payload.description, username, payload.assignee)

    await publish("task_created", task=task)
    await log_activity(f'{username} создаёт задачу "{task.title}"')
    await notify_assignee(task, username)
    return task


@router.patch("/{task_id}", response_model=Task)
async def update_task(task: TaskDep, payload: TaskUpdate, username: CurrentUser) -> Task:
    if payload.status is not None and payload.status != task.status:
        task.status = payload.status
        await log_activity(f'{username}: "{task.title}" теперь в статусе {STATUS_LABELS[task.status]}')

    if "assignee" in payload.model_fields_set and payload.assignee != task.assignee:
        task.assignee = payload.assignee
        if task.assignee:
            await log_activity(f'{username} назначает "{task.title}" на {task.assignee}')
            await notify_assignee(task, username)

    db.update_task(task)
    await publish("task_updated", task=task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task: TaskDep, username: CurrentUser) -> None:
    db.delete_task(task.id)

    await publish("task_deleted", task_id=task.id)
    await log_activity(f'{username} удаляет задачу "{task.title}"')


@router.get("/{task_id}/comments", response_model=list[Comment])
def list_comments(task: TaskDep) -> list[Comment]:
    return db.list_comments(task.id)


@router.post("/{task_id}/comments", response_model=Comment, status_code=status.HTTP_201_CREATED)
async def add_comment(task: TaskDep, payload: CommentCreate, username: CurrentUser) -> Comment:
    comment = db.create_comment(task.id, username, payload.text)

    await publish("comment_added", comment=comment)

    recipients = {person for person in (task.author, task.assignee) if person and person != username}
    await notify_many(recipients, f'Новый комментарий к "{task.title}" от {username}')
    return comment
