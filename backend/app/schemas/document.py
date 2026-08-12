from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class PageText(BaseModel):
    page: int
    text: str


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    original_filename: str
    stored_filename: str
    file_path: str
    total_pages: int
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentDetailResponse(DocumentResponse):
    extracted_text: List[PageText]
