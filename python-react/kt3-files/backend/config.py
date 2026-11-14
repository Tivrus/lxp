import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

MB = 1024 * 1024


@dataclass(frozen=True)
class Settings:
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    media_dir: Path = Path(os.getenv("MEDIA_DIR", "media"))
    max_file_size_mb: int = int(os.getenv("MAX_FILE_SIZE_MB", "5"))
    thumbnail_size: int = int(os.getenv("THUMBNAIL_SIZE", "300"))

    @property
    def max_file_size(self) -> int:
        return self.max_file_size_mb * MB

    @property
    def originals_dir(self) -> Path:
        return self.media_dir / "originals"

    @property
    def thumbnails_dir(self) -> Path:
        return self.media_dir / "thumbnails"


settings = Settings()
