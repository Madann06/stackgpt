from fastapi import APIRouter

from app.api.v1.endpoints import auth, company, pdf, rag, chat, market, mutual_funds

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(market.router, prefix="/market", tags=["Market Data (Indices, Sectors, Heatmap)"])
api_router.include_router(mutual_funds.router, prefix="/mutual-funds", tags=["Mutual Funds & ETFs"])
api_router.include_router(company.router, prefix="/company", tags=["Company & Stock Data"])
api_router.include_router(company.router, prefix="/stock", tags=["Stock Data (Alias)"])
api_router.include_router(pdf.router, prefix="/pdf", tags=["PDF Annual Report Processing"])
api_router.include_router(rag.router, prefix="/rag", tags=["RAG Vector Search & Retrieval"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Financial Chat & QA"])

