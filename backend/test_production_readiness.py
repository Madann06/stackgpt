import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("STARTING COMPLETE FASTAPI BACKEND VERIFICATION")
    print("=" * 60)

    # 1. Health Checks
    print("\n[TEST 1] Health Checks...")
    res = client.get("/health")
    print(f"GET /health -> Status: {res.status_code}, Body: {res.json()}")
    assert res.status_code == 200
    assert res.json().get("status") == "ok"

    res_api = client.get("/api/v1/health")
    print(f"GET /api/v1/health -> Status: {res_api.status_code}, Body: {res_api.json()}")
    assert res_api.status_code == 200
    assert res_api.json().get("status") == "ok"
    print(">>> Health Checks PASSED!")

    # 2. CORS Preflight
    print("\n[TEST 2] CORS Preflight for Vercel...")
    headers = {
        "Origin": "https://stackgpt.vercel.app",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Authorization,Content-Type"
    }
    opt_res = client.options("/api/v1/company/profile/TCS.NS", headers=headers)
    print(f"OPTIONS /api/v1/company/profile/TCS.NS -> Status: {opt_res.status_code}")
    print(f"CORS Headers: Allow-Origin={opt_res.headers.get('access-control-allow-origin')}, Allow-Credentials={opt_res.headers.get('access-control-allow-credentials')}")
    assert opt_res.status_code == 200
    assert "stackgpt.vercel.app" in opt_res.headers.get("access-control-allow-origin", "")
    print(">>> CORS Preflight PASSED!")

    # 3. Authentication Flow
    print("\n[TEST 3] Authentication Flow (Register -> Login -> /auth/me -> Google)...")
    import random
    test_email = f"test.analyst.{random.randint(10000, 99999)}@stockai.com"
    reg_payload = {
        "email": test_email,
        "full_name": "Test Portfolio Analyst",
        "password": "securepassword123"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    print(f"POST /api/v1/auth/register -> Status: {reg_res.status_code}")
    assert reg_res.status_code == 201

    login_res = client.post("/api/v1/auth/login", json={"email": test_email, "password": "securepassword123"})
    print(f"POST /api/v1/auth/login -> Status: {login_res.status_code}")
    assert login_res.status_code == 200
    token_data = login_res.json()
    token = token_data.get("access_token")
    assert token is not None

    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    print(f"GET /api/v1/auth/me -> Status: {me_res.status_code}, User: {me_res.json().get('email')}")
    assert me_res.status_code == 200
    assert me_res.json().get("email") == test_email

    # Google Login
    google_res = client.post("/api/v1/auth/google", json={"email": "analyst.google@gmail.com", "name": "Google Analyst"})
    print(f"POST /api/v1/auth/google -> Status: {google_res.status_code}")
    assert google_res.status_code == 200
    print(">>> Authentication Flow PASSED!")

    # 4. Search Tickers
    print("\n[TEST 4] Stock Search (TCS, INFY, SBI, RELIANCE, NVDA)...")
    for q in ["TCS", "INFY", "SBI", "RELIANCE", "NVDA"]:
        search_res = client.get(f"/api/v1/company/search?query={q}")
        print(f"GET /api/v1/company/search?query={q} -> Status: {search_res.status_code}, Results: {len(search_res.json())}")
        assert search_res.status_code == 200
        assert len(search_res.json()) > 0
        symbols = [item["symbol"] for item in search_res.json()]
        print(f"  Matches for '{q}': {symbols[:3]}")
    print(">>> Stock Search PASSED!")

    # 5. Company Endpoints
    print("\n[TEST 5] Company Endpoints (Profile, Price, Ratios)...")
    for sym in ["TCS.NS", "AAPL"]:
        p_res = client.get(f"/api/v1/company/profile/{sym}")
        print(f"GET /api/v1/company/profile/{sym} -> Status: {p_res.status_code}")
        assert p_res.status_code == 200
        print(f"  Name: {p_res.json().get('company_name')}, Price: {p_res.json().get('current_price')}")

        pr_res = client.get(f"/api/v1/company/price/{sym}")
        print(f"GET /api/v1/company/price/{sym} -> Status: {pr_res.status_code}")
        assert pr_res.status_code == 200

        rat_res = client.get(f"/api/v1/company/ratios/{sym}")
        print(f"GET /api/v1/company/ratios/{sym} -> Status: {rat_res.status_code}")
        assert rat_res.status_code == 200
        market_cap_str = str(rat_res.json().get('market_cap')).encode('ascii', 'replace').decode('ascii')
        print(f"  Market Cap: {market_cap_str}, PE: {rat_res.json().get('pe_ratio')}")
    print(">>> Company Endpoints PASSED!")

    print("\n" + "=" * 60)
    print("ALL PRODUCTION READINESS CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
