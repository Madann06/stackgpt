from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user_optional
from app.models.user import User
from app.schemas.chat import ChatQueryRequest, ChatQueryResponse
from app.services.rag_service import RAGService
from app.services.llm_service import LLMService

router = APIRouter()


@router.post("/query", response_model=ChatQueryResponse, status_code=status.HTTP_200_OK)
def query_ai_chat(
    request: ChatQueryRequest,
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> Any:

    """Perform AI chat query under Document Mode ON (ChromaDB vector RAG) or Document Mode OFF (Live APIs & General AI)."""
    context_chunks = []
    if request.document_mode:
        context_chunks = RAGService.search_similarity(
            query=request.query,
            top_k=5,
            document_id=request.document_id
        )

    response_data = LLMService.generate_rag_answer(
        query=request.query,
        context_chunks=context_chunks,
        symbol=request.symbol or "AAPL",
        document_mode=request.document_mode,
        conversation_history=request.conversation_history or []
    )


    return response_data

