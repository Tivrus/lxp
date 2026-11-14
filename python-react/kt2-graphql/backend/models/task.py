from pydantic import BaseModel, field_validator

MIN_TITLE_LENGTH = 3


def normalize_title(value: str) -> str:
    value = value.strip()
    if len(value) < MIN_TITLE_LENGTH:
        raise ValueError(f"Название задачи должно быть не короче {MIN_TITLE_LENGTH} символов")
    return value


class Category(BaseModel):
    id: int
    name: str
    color: str


class TaskBase(BaseModel):
    title: str
    description: str = ""
    is_completed: bool = False

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        return normalize_title(value)


class TaskCreate(TaskBase):
    category_id: int
    internal_note: str = ""


class Task(TaskBase):
    id: int
    category: Category
    internal_note: str = ""


class TaskOut(TaskBase):
    id: int
    category: Category
