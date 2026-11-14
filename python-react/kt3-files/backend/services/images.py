import io
import uuid

from PIL import Image, UnidentifiedImageError

from config import settings
from models.image import StoredImage

ALLOWED_TYPES = {"image/png": "png", "image/jpeg": "jpg"}


class ImageValidationError(ValueError):
    pass


def get_extension(content_type: str | None) -> str:
    extension = ALLOWED_TYPES.get(content_type or "")
    if extension is None:
        raise ImageValidationError("Можно загружать только PNG или JPEG")
    return extension


def check_size(content: bytes) -> None:
    if len(content) > settings.max_file_size:
        raise ImageValidationError(f"Файл больше {settings.max_file_size_mb} МБ")


def open_image(content: bytes) -> Image.Image:
    try:
        image = Image.open(io.BytesIO(content))
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise ImageValidationError("Файл повреждён или не является изображением") from exc
    return image


def make_thumbnail(image: Image.Image, extension: str) -> Image.Image:
    thumbnail = image.copy()
    thumbnail.thumbnail((settings.thumbnail_size, settings.thumbnail_size))
    if extension == "jpg" and thumbnail.mode != "RGB":
        thumbnail = thumbnail.convert("RGB")
    return thumbnail


def save_image(content: bytes, filename: str | None, content_type: str | None) -> StoredImage:
    extension = get_extension(content_type)
    check_size(content)
    image = open_image(content)

    image_id = uuid.uuid4().hex
    stored_name = f"{image_id}.{extension}"

    (settings.originals_dir / stored_name).write_bytes(content)
    make_thumbnail(image, extension).save(settings.thumbnails_dir / stored_name)

    return StoredImage(
        id=image_id,
        filename=filename or stored_name,
        stored_name=stored_name,
        width=image.width,
        height=image.height,
    )
