from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine, SessionLocal, check_db_connection
from app.models.user import User
from app.core.security import get_password_hash
from app.api.v1.api import api_router

# Automatically create database tables if they do not exist
Base.metadata.create_all(bind=engine)

# Seed default demo user account if it doesn't exist
try:
    with SessionLocal() as db:
        demo_user = db.query(User).filter(User.email == "demo.analyst@stockai.com").first()
        if not demo_user:
            user = User(
                email="demo.analyst@stockai.com",
                full_name="Demo Analyst",
                hashed_password=get_password_hash("password123"),
                auth_provider="local",
                is_active=True
            )
            db.add(user)
            db.commit()
except Exception as e:
    print(f"Demo user seeding info: {e}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="High-Performance Financial Analytics & AI Stock Research Assistant API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
cors_origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS]
if settings.FRONTEND_URL and settings.FRONTEND_URL.rstrip("/") not in cors_origins:
    cors_origins.append(settings.FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https:\/\/(.*\.vercel\.app|.*\.onrender\.com)|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$",
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


@app.get("/health", tags=["Health Check"])
def health():
    """Diagnostic health check endpoint verifying server & database connectivity."""
    db_ok = check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "project": settings.PROJECT_NAME
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["Health Check"])
def api_v1_health():
    """API v1 health check endpoint verifying database connectivity."""
    db_ok = check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected"
    }


@app.get("/", tags=["Health Check"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "health": "/health",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)

