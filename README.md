# 📈 StackGPT — AI Financial Intelligence & Stock Research Assistant

StackGPT is an advanced, full-stack AI financial research platform built with **FastAPI**, **React (Vite)**, **TailwindCSS**, **TradingView Lightweight Charts**, and **OpenAI/RAG Document Intelligence**.

---

## ✨ Features

- **🚀 Live Stock Market Intelligence**: Search US & Indian (NSE/BSE) equities with real-time stock prices, key valuation ratios (P/E, EPS, ROE, 52W High/Low), and historical OHLCV interactive charts.
- **🎯 Duration-Based AI Predictions**: Tailored investment analysis over 1-5 days, 1-3 months, 1-3 years, or 3+ year time horizons with risk scoring and empirical win-rate backtests.
- **📄 RAG Annual Report Processing**: Upload company PDFs and 10-K financial disclosures to query vector-embedded document citations.
- **🤖 Autonomous AI Chat Assistant**: Centralized LLM agent equipped with dynamic tool calling for real-time market data retrieval, financial news search, and document QA.
- **🔐 Analyst Authentication**: JWT Bearer token authentication with SQLite/PostgreSQL ORM storage.

---

## 🛠️ Architecture & Tech Stack

### **Frontend**
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS + Framer Motion
- **Charting**: TradingView Lightweight Charts
- **Routing**: React Router v6

### **Backend**
- **API Framework**: FastAPI (Python 3.10+)
- **ORM & DB**: SQLAlchemy + SQLite (PostgreSQL compatible) + Alembic
- **Market Data**: yfinance API + Web Search Service
- **RAG & Vectors**: ChromaDB + PyPDF2

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend

# Install Dependencies
pip install -r requirements.txt

# Run Database Migrations
alembic upgrade head

# Start FastAPI Development Server
python -m uvicorn app.main:app --port 8000 --reload
```

- **Swagger API Docs**: `http://localhost:8000/docs`
- **Base API Endpoint**: `http://localhost:8000/api/v1`

### 2. Frontend Setup

```bash
# In project root directory
npm install

# Run Vite Dev Server
cmd /c npm run dev
# or
npm run dev
```

- **Frontend App**: `http://localhost:3000`

---

## 🐳 Running with Docker Compose (Recommended)

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Configure Environment Variables
Copy the template `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Optionally add your API credentials (`OPENAI_API_KEY`, `GEMINI_API_KEY`, etc.) inside `.env`.

### 3. Build & Start Containers
Run the single command to start the complete full-stack application (Frontend + Backend + PostgreSQL):

```bash
docker compose up --build
```

To run in detached (background) mode:
```bash
docker compose up -d --build
```

### 4. Application Endpoints
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: `localhost:5432` (`stock_db`)

### 5. Stop Containers
```bash
docker compose down
```

---

## 📌 Repository Links

- **GitHub Repository**: [https://github.com/Madann06/stackgpt.git](https://github.com/Madann06/stackgpt.git)
