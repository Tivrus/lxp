from fastapi import APIRouter, HTTPException, Request, UploadFile, status

from config import settings
from models.image import ImageOut, StoredImage
from services.images import ImageValidationError, save_image

router = APIRouter(prefix="/images", tags=["images"])

_images: list[StoredImage] = []


def to_out(image: StoredImage, request: Request) -> ImageOut:
    return ImageOut(
        id=image.id,
        filename=image.filename,
        width=image.width,
        height=image.height,
        original_url=str(request.url_for("media", path=f"originals/{image.stored_name}")),
        thumbnail_url=str(request.url_for("media", path=f"thumbnails/{image.stored_name}")),
    )


@router.post("/upload", response_model=ImageOut, status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile, request: Request) -> ImageOut:
    content = await file.read(settings.max_file_size + 1)
    try:
        image = save_image(content, file.filename, file.content_type)
    except ImageValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    _images.append(image)
    return to_out(image, request)


@router.get("", response_model=list[ImageOut])
def list_images(request: Request) -> list[ImageOut]:
    return [to_out(image, request) for image in reversed(_images)]
