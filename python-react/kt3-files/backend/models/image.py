from pydantic import BaseModel


class StoredImage(BaseModel):
    id: str
    filename: str
    stored_name: str
    width: int
    height: int


class ImageOut(BaseModel):
    id: str
    filename: str
    width: int
    height: int
    original_url: str
    thumbnail_url: str
