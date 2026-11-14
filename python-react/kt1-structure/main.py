from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import settings
from routers import tasks

app = FastAPI(title=settings.app_title, description=settings.app_description)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)


if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)
