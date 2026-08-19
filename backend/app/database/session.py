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
    # If explicitly in production on Render/cloud, enforce managed database URI
    logger.warning(
        "CRITICAL DATABASE WARNING: Production environment detected without external PostgreSQL DATABASE_URL. "
        "SQLite on Render is ephemeral. Ensure DATABASE_URL is set in Render environment variables."
    )

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Configure engine parameters dynamically
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

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

