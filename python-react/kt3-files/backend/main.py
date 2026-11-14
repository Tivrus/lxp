from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from config import settings
from routers import images

settings.originals_dir.mkdir(parents=True, exist_ok=True)
settings.thumbnails_dir.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Image Upload API", description="Загрузка изображений и создание миниатюр")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router)
app.mount("/media", StaticFiles(directory=settings.media_dir), name="media")


if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)
