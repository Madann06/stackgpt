from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine
from app.api.v1.api import api_router

# Automatically create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="High-Performance Financial Analytics & AI Stock Research Assistant API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS Middleware for React frontend integration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Direct alias for /api/pdf, /api/rag, /api/chat, /api/stock, /api/company routes
from app.api.v1.endpoints import pdf, rag, chat, company
app.include_router(pdf.router, prefix="/api/pdf", tags=["PDF Processing (Alias)"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG Vector Search (Alias)"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat QA (Alias)"])
app.include_router(company.router, prefix="/api/stock", tags=["Stock Analysis (Alias)"])
app.include_router(company.router, prefix="/api/company", tags=["Company Data (Alias)"])





@app.get("/", tags=["Health Check"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "http://localhost:8000/docs",
        "api_v1": f"http://localhost:8000{settings.API_V1_STR}"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
