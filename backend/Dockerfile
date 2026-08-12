FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system packages required for C extensions, PyMuPDF, and sqlite/postgres connectors
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libgomp1 \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY . .

# Ensure storage directories exist
RUN mkdir -p uploads chroma_db

EXPOSE 8000

# Start Uvicorn backend server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
