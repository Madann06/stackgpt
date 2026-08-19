import sys
import os
import psutil
import time

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def run_production_startup_verification():
    process = psutil.Process(os.getpid())
    mem_before_mb = process.memory_info().rss / (1024 * 1024)
    print("=" * 70)
    print("STACKGPT PRODUCTION STARTUP & MEMORY BENCHMARK")
    print("=" * 70)
    print(f"Initial Memory Usage: {mem_before_mb:.2f} MB")

    client = TestClient(app)

    # Test 1: Root & Health Endpoints
    print("\n[1] Testing Lightweight Health & Root Endpoints...")
    t0 = time.time()
    r_root = client.get("/")
    r_health = client.get("/health")
    r_v1_health = client.get("/api/v1/health")
    latency_ms = (time.time() - t0) * 1000

    print(f"  GET / -> Status {r_root.status_code}: {r_root.json()}")
    print(f"  GET /health -> Status {r_health.status_code}: {r_health.json()}")
    print(f"  GET /api/v1/health -> Status {r_v1_health.status_code}: {r_v1_health.json()}")
    print(f"  Combined Latency: {latency_ms:.2f} ms")
    assert r_root.status_code == 200
    assert r_health.status_code == 200
    assert r_v1_health.status_code == 200
    assert r_v1_health.json() == {"status": "ok"}

    # Test 2: Stock APIs (SBIN.NS)
    print("\n[2] Testing Company & Stock APIs for SBIN.NS...")
    r_profile = client.get("/api/v1/company/profile/SBIN.NS")
    r_price = client.get("/api/v1/company/price/SBIN.NS")
    r_ratios = client.get("/api/v1/company/ratios/SBIN.NS")

    print(f"  GET /api/v1/company/profile/SBIN.NS -> Status {r_profile.status_code}: Name='{r_profile.json().get('name')}'")
    print(f"  GET /api/v1/company/price/SBIN.NS -> Status {r_price.status_code}: Price={r_price.json().get('current_price')}")
    print(f"  GET /api/v1/company/ratios/SBIN.NS -> Status {r_ratios.status_code}: P/E={r_ratios.json().get('pe_ratio')}")
    assert r_profile.status_code == 200
    assert r_price.status_code == 200
    assert r_ratios.status_code == 200

    # Test 3: Authentication Endpoints
    print("\n[3] Testing Authentication Flow...")
    test_email = f"prod.test.{int(time.time())}@stockai.com"
    r_reg = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Production Test User"
    })
    print(f"  POST /api/v1/auth/register -> Status {r_reg.status_code}: User ID={r_reg.json().get('id')}")
    assert r_reg.status_code == 201

    r_login = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "Password123!"
    })
    token = r_login.json().get("access_token")
    print(f"  POST /api/v1/auth/login -> Status {r_login.status_code}: JWT Token received (len={len(token) if token else 0})")
    assert r_login.status_code == 200
    assert token is not None

    # Test 4: RAG Service (Zero PyTorch overhead)
    print("\n[4] Testing Lightweight RAG Service...")
    from app.services.rag_service import RAGService
    chunks_count = RAGService.chunk_and_index_document(
        document_id=999,
        filename="SBI_Q3_Results.pdf",
        pages_data=[
            {"page": 1, "text": "State Bank of India reported net profit of 15477 crores for Q3 with ROE of 19.5%."},
            {"page": 2, "text": "Asset quality improved with Gross NPA at 2.42% and Net NPA at 0.64%."}
        ]
    )
    search_res = RAGService.search_similarity("What is the ROE and net profit?", top_k=2, document_id=999)
    print(f"  RAG Chunking -> Indexed {chunks_count} chunks")
    print(f"  RAG Search -> Found {len(search_res)} relevant snippets (Top score: {search_res[0]['score'] if search_res else 'N/A'})")
    assert chunks_count > 0
    assert len(search_res) > 0

    # Final Memory Check
    mem_after_mb = process.memory_info().rss / (1024 * 1024)
    print("\n" + "=" * 70)
    print(f"FINAL PROCESS RSS MEMORY: {mem_after_mb:.2f} MB")
    print(f"Render Free Tier Limit:   512.00 MB")
    print(f"MEMORY HEADROOM REMAINING: {512.0 - mem_after_mb:.2f} MB ({(1 - mem_after_mb/512.0)*100:.1f}% free)")
    print("=" * 70)
    print("ALL PRODUCTION STARTUP & LIGHTWEIGHT TESTS PASSED!")

if __name__ == "__main__":
    run_production_startup_verification()
