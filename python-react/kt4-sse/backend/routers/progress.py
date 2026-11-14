import asyncio
import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Query, Request
from sse_starlette.sse import EventSourceResponse

from config import settings

router = APIRouter(prefix="/progress", tags=["progress"])

STEPS = ("Чтение файла", "Проверка данных", "Обработка", "Сохранение", "Отправка отчёта")
FAIL_AT_STEP = 2


def sse_event(name: str, payload: dict) -> dict:
    return {"event": name, "data": json.dumps(payload, ensure_ascii=False)}


async def progress_events(request: Request, fail: bool) -> AsyncIterator[dict]:
    total = len(STEPS)

    for index, step in enumerate(STEPS):
        if await request.is_disconnected():
            return

        await asyncio.sleep(settings.step_delay)

        if fail and index == FAIL_AT_STEP:
            return

        percent = (index + 1) * 100 // total
        yield sse_event("progress", {"percent": percent, "step": step})

    yield sse_event("complete", {"percent": 100, "message": "Задача выполнена"})


@router.get("")
async def stream_progress(
    request: Request,
    fail: bool = Query(default=False, description="Оборвать поток на середине для проверки ошибок"),
) -> EventSourceResponse:
    return EventSourceResponse(progress_events(request, fail))
