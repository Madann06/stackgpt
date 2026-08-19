import os
import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("stackgpt.database")

db_url = settings.DATABASE_URL or ""

# Production database safety verification
is_production = settings.ENVIRONMENT.lower() == "production" or bool(os.getenv("RENDER"))
if is_production and (not db_url or "sqlite" in db_url):
    logger.warning(
        "CRITICAL DATABASE WARNING: Production environment detected without external PostgreSQL DATABASE_URL. "
        "Ensure DATABASE_URL is correctly set in Render environment variables."
    )


def create_safe_engine(url: str):
    """Build SQLAlchemy engine with automatic fallback to SQLite if PostgreSQL URL is malformed or unreachable."""
    target_url = url or "sqlite:///./sql_app.db"
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    connect_args = {}
    if target_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    elif "postgres" in target_url:
        connect_args = {"connect_timeout": 5}

    try:
        eng = create_engine(
            target_url,
            connect_args=connect_args,
            pool_pre_ping=True,
            pool_recycle=300
        )
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("[Database] Successfully connected to primary database engine.")
        return eng
    except Exception as e:
        logger.error(f"[Database Fail-Safe] Primary DATABASE_URL connection failed ({e}). Falling back to local SQLite.")
        fallback_url = "sqlite:///./sql_app.db"
        return create_engine(
            fallback_url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )


engine = create_safe_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator:
    """Dependency generator that yields database sessions and closes them when done."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Safely verify active database connectivity by executing a lightweight query."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connectivity check failed: {e}")
        return False
