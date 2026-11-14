import json
import sqlite3
from collections import deque
from collections.abc import Iterator
from contextlib import closing, contextmanager
from itertools import count
from pathlib import Path

from config import settings
from models.comment import Activity, Comment
from models.task import Task, utc_now

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo',
    author TEXT NOT NULL,
    assignee TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments (task_id);
"""

SEED_FILE = Path(__file__).with_name("seed_data.json")

activity: deque[Activity] = deque(maxlen=settings.activity_limit)
activity_ids = count(start=1)


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    with closing(sqlite3.connect(settings.database_path)) as connection:
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        with connection:
            yield connection


def init_db() -> None:
    with get_connection() as connection:
        connection.executescript(SCHEMA)
        if connection.execute("SELECT 1 FROM tasks LIMIT 1").fetchone() is None:
            seed = json.loads(SEED_FILE.read_text(encoding="utf-8"))
            connection.executemany(
                "INSERT INTO tasks (title, description, author, assignee, status, created_at) "
                "VALUES (:title, :description, :author, :assignee, :status, :created_at)",
                [{**task, "created_at": utc_now().isoformat()} for task in seed],
            )


def list_tasks() -> list[Task]:
    with get_connection() as connection:
        rows = connection.execute("SELECT * FROM tasks ORDER BY id").fetchall()
    return [Task.model_validate(dict(row)) for row in rows]


def get_task(task_id: int) -> Task | None:
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return Task.model_validate(dict(row)) if row else None


def create_task(title: str, description: str, author: str, assignee: str | None) -> Task:
    created_at = utc_now()
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO tasks (title, description, author, assignee, created_at) VALUES (?, ?, ?, ?, ?)",
            (title, description, author, assignee, created_at.isoformat()),
        )
    return Task(
        id=cursor.lastrowid,
        title=title,
        description=description,
        author=author,
        assignee=assignee,
        created_at=created_at,
    )


def update_task(task: Task) -> None:
    with get_connection() as connection:
        connection.execute(
            "UPDATE tasks SET status = ?, assignee = ? WHERE id = ?",
            (task.status, task.assignee, task.id),
        )


def delete_task(task_id: int) -> None:
    with get_connection() as connection:
        connection.execute("DELETE FROM tasks WHERE id = ?", (task_id,))


def list_comments(task_id: int) -> list[Comment]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM comments WHERE task_id = ? ORDER BY id", (task_id,)
        ).fetchall()
    return [Comment.model_validate(dict(row)) for row in rows]


def create_comment(task_id: int, author: str, text: str) -> Comment:
    created_at = utc_now()
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO comments (task_id, author, text, created_at) VALUES (?, ?, ?, ?)",
            (task_id, author, text, created_at.isoformat()),
        )
    return Comment(id=cursor.lastrowid, task_id=task_id, author=author, text=text, created_at=created_at)
