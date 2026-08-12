from typing import List, Optional
from pydantic import BaseModel, Field


class IndexDocumentRequest(BaseModel):
    document_id: int = Field(..., description="ID of the uploaded PDF document to chunk and index into ChromaDB")


class IndexDocumentResponse(BaseModel):
    document_id: int
    total_chunks: int
    status: str = "indexed"
    message: str


class SearchQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Financial search query (e.g., 'Revenue', 'Automotive Gross Margin')")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of top relevant chunks to retrieve")
    document_id: Optional[int] = Field(default=None, description="Optional document ID filter to search a specific report")


class ChunkResult(BaseModel):
    chunk_id: str
    document_id: int
    filename: str
    page_number: int
    content: str
    score: float


class SearchQueryResponse(BaseModel):
    query: str
    total_results: int
    results: List[ChunkResult]
    constructed_prompt: str
