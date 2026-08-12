# AI Stock Research Assistant - FastAPI Backend

A high-performance, modular Python backend built with **FastAPI**, **SQLAlchemy**, **PostgreSQL** (with SQLite fallback), **Pydantic v2**, **Alembic**, and **yfinance**.

---

## 🛠️ Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py               # DB Session & OAuth2 Bearer Auth Dependencies
│   │   └── v1/
│   │       ├── api.py            # API v1 Router Aggregator
│   │       └── endpoints/
│   │           ├── auth.py       # Register, Login, Me Endpoints
│   │           └── company.py    # Stock Search, Profile, Price, History, Ratios
│   ├── core/
│   │   ├── config.py             # Typed Environment Settings (Pydantic v2)
│   │   └── security.py           # Bcrypt Password Hashing & JWT Tokens
│   ├── database/
│   │   ├── base.py               # Declarative ORM Base
│   │   └── session.py            # Engine & Session Generator
│   ├── models/
│   │   └── user.py               # SQLAlchemy User Model
│   ├── schemas/
│   │   ├── auth.py               # Login & Token Schemas
│   │   ├── user.py               # User Schemas
│   │   └── company.py            # Financial Data Response Schemas
│   ├── services/
│   │   └── yahoo_finance.py      # YFinance Extraction Service
│   └── main.py                   # FastAPI App & Swagger Initialization
├── alembic/                      # Alembic Migration Files
├── alembic.ini                   # Alembic Config
├── requirements.txt              # Dependencies
├── .env.example                  # Environment Template
└── README.md
```

---

## ⚡ 1. Installing Dependencies

Make sure Python 3.10+ is installed on your system.

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

---

## 🗄️ 2. Running & Configuring PostgreSQL

By default, the backend operates out-of-the-box using **SQLite** (`sqlite:///./sql_app.db`).

To switch to **PostgreSQL**:

1. Ensure PostgreSQL is running locally or in Docker:
   ```bash
   docker run --name stock_postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=stock_db -p 5432:5432 -d postgres
   ```
2. Update `.env`:
   ```ini
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stock_db"
   ```

---

## 🔄 3. Running Alembic Database Migrations

Apply database migrations to set up the `users` table:

```bash
# Apply migrations to latest revision
alembic upgrade head
```

To create new migrations in the future:
```bash
alembic revision --autogenerate -m "Add new feature table"
```

---

## 🚀 4. Starting the FastAPI Server

Launch the development server using Uvicorn:

```bash
uvicorn app.main:app --reload --port 8000
```

The backend server will start at:
- **Base URL**: `http://localhost:8000`
- **API v1 Base**: `http://localhost:8000/api/v1`

---

## 🧪 5. Testing the APIs using Swagger UI

Open your browser and navigate to:
👉 **`http://localhost:8000/docs`**

### Available Endpoints to Test:

#### Authentication (`/api/v1/auth`)
- **`POST /api/v1/auth/register`**: Create a new analyst account (`full_name`, `email`, `password`).
- **`POST /api/v1/auth/login`**: Authenticate and receive a JWT Bearer token.
- **`GET /api/v1/auth/me`**: View logged-in user profile (Requires `Authorization: Bearer <token>`).

#### Stock & Company Intelligence (`/api/v1/company`)
- **`GET /api/v1/company/search?query=AAPL`**: Search stock symbols and company names.
- **`GET /api/v1/company/profile/{symbol}`**: Company profile, sector, summary, market cap.
- **`GET /api/v1/company/price/{symbol}`**: Current stock price, gain/loss, and percentage change.
- **`GET /api/v1/company/history/{symbol}?timeframe=1M`**: Historical chart OHLCV data & 20 Moving Average.
- **`GET /api/v1/company/ratios/{symbol}`**: Valuation metrics (P/E Ratio, EPS, ROE, Dividend Yield, Market Cap, 52W High/Low).
