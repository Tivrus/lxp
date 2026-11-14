from pydantic import BaseModel, Field, field_validator

MIN_TITLE_LENGTH = 3


class Category(BaseModel):
    name: str
    color: str


class TaskBase(BaseModel):
    title: str
    description: str = ""
    is_completed: bool = False
    category: Category

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()
        if len(value) < MIN_TITLE_LENGTH:
            raise ValueError(f"Название задачи должно быть не короче {MIN_TITLE_LENGTH} символов")
        return value


class TaskCreate(TaskBase):
    internal_note: str = Field(default="", description="Служебная заметка, клиенту не возвращается")


class Task(TaskCreate):
    id: int


class TaskOut(TaskBase):
    id: int
