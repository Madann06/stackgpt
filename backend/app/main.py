import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan to initialize database safely during startup without blocking imports."""
    try:
        Base.metadata.create_all(bind=engine)
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
        print(f"[Database Startup Table Initialization Info] {e}")
    yield



app = FastAPI(
    title=settings.PROJECT_NAME,
    description="High-Performance Financial Analytics & AI Stock Research Assistant API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
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

# Direct aliases for endpoints (ensures frontend requests never 404)
from app.api.v1.endpoints import auth, pdf, rag, chat, company
app.include_router(auth.router, prefix="/auth", tags=["Authentication (Alias)"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication (Alias)"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["PDF Processing (Alias)"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG Vector Search (Alias)"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat QA (Alias)"])
app.include_router(company.router, prefix="/api/stock", tags=["Stock Analysis (Alias)"])
app.include_router(company.router, prefix="/api/company", tags=["Company Data (Alias)"])



# =====================================================================
# Lightweight Health Check & Root Endpoints
# =====================================================================

@app.get("/health", tags=["Health Check"])
def health():
    """Immediate, zero-overhead health check for Render."""
    return {"status": "ok", "service": "StackGPT Backend"}


@app.get(f"{settings.API_V1_STR}/health", tags=["Health Check"])
def api_v1_health():
    """Immediate, lightweight API v1 health check."""
    return {"status": "ok"}


@app.get(f"{settings.API_V1_STR}/db-check", tags=["Health Check"])
def api_v1_db_check():
    """Diagnostic endpoint to expose database connection & table status."""
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        with SessionLocal() as db:
            user_count = db.query(User).count()
            
        return {
            "status": "ok",
            "database_connected": True,
            "user_table_exists": True,
            "total_users": user_count,
            "db_url_scheme": engine.url.drivername
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "database_connected": False,
            "error_type": type(e).__name__,
            "error_details": str(e),
            "traceback": traceback.format_exc()
        }



@app.get("/", tags=["Health Check"])
def root():
    """Immediate, lightweight root endpoint."""
    return {"status": "ok", "service": "StackGPT Backend"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
