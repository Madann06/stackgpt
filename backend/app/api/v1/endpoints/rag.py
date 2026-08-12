from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.document import Document
from app.schemas.rag import (
    IndexDocumentRequest,
    IndexDocumentResponse,
    SearchQueryRequest,
    SearchQueryResponse,
    ChunkResult
)
from app.services.pdf_service import PDFService
from app.services.rag_service import RAGService

router = APIRouter()


@router.post("/index", response_model=IndexDocumentResponse, status_code=status.HTTP_200_OK)
def index_document_vectors(
    request: IndexDocumentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Chunk and index an uploaded PDF financial document into ChromaDB vector database."""
    doc = db.query(Document).filter(Document.id == request.document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{request.document_id}' not found for user."
        )

    # Extract pages data using PyMuPDF
    _, pages_data = PDFService.extract_text_page_by_page(doc.file_path)

    # Chunk text and store embeddings in ChromaDB
    total_chunks = RAGService.chunk_and_index_document(
        document_id=doc.id,
        filename=doc.original_filename,
        pages_data=pages_data
    )

    return {
        "document_id": doc.id,
        "total_chunks": total_chunks,
        "status": "indexed",
        "message": f"Successfully indexed '{doc.original_filename}' into ChromaDB with {total_chunks} text chunks."
    }


@router.post("/search", response_model=SearchQueryResponse, status_code=status.HTTP_200_OK)
def search_vector_database(
    request: SearchQueryRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Perform semantic similarity search in ChromaDB vector database and construct strict RAG prompt."""
    results = RAGService.search_similarity(
        query=request.query,
        top_k=request.top_k,
        document_id=request.document_id
    )

    constructed_prompt = RAGService.build_rag_prompt(request.query, results)

    chunk_results = [ChunkResult(**item) for item in results]

    return {
        "query": request.query,
        "total_results": len(chunk_results),
        "results": chunk_results,
        "constructed_prompt": constructed_prompt
    }


@router.delete("/index/{document_id}", status_code=status.HTTP_200_OK)
def delete_document_index(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Delete all vector embeddings for a given document from ChromaDB."""
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )

    success = RAGService.delete_document_embeddings(document_id)

    return {
        "document_id": document_id,
        "status": "deleted" if success else "not_found",
        "message": f"Embeddings for document ID {document_id} removed from ChromaDB."
    }
