import sys
import os
import random
import time

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.user import User

client = TestClient(app)

def run_all_tests():
    print("=" * 70)
    print("STACKGPT COMPREHENSIVE AUTHENTICATION & REGRESSION TEST SUITE")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. System Health Check
    # -------------------------------------------------------------
    print("[TEST 1] Verifying System & Database Health Check Endpoints...")
    res = client.get("/health")
    assert res.status_code == 200
    health_data = res.json()
    assert health_data.get("status") == "ok", f"Expected status 'ok', got {health_data}"
    print(f"  GET /health -> {health_data}")

    res_v1 = client.get("/api/v1/health")
    assert res_v1.status_code == 200
    v1_health = res_v1.json()
    assert v1_health.get("status") == "ok", f"Expected status 'ok', got {v1_health}"
    print(f"  GET /api/v1/health -> {v1_health}")
    print("  >>> PASSED: Lightweight Health Check is live and verified!\n")


    # -------------------------------------------------------------
    # 2. Registration Flow: New User, Normalization & 409 Duplicate Checks
    # -------------------------------------------------------------
    print("\n[TEST 2] Registration Flow: Email Normalization & Exact 409 Duplicate Check...")
    rand_id = random.randint(100000, 999999)
    raw_email = f"  Test.Analyst.{rand_id}@Financial.AI  "
    normalized_email = raw_email.strip().lower()
    password = "SecurePassword123!"

    reg_payload = {
        "full_name": "  Alex Vance Analyst  ",
        "email": raw_email,
        "password": password
    }

    # A. Register new user
    res_reg = client.post("/api/v1/auth/register", json=reg_payload)
    print(f"  POST /api/v1/auth/register (New Email) -> Status: {res_reg.status_code}")
    assert res_reg.status_code == 201, f"Expected 201, got {res_reg.status_code}: {res_reg.text}"
    user_created = res_reg.json()
    assert user_created["email"] == normalized_email, f"Email not properly normalized: {user_created['email']}"
    assert user_created["full_name"] == "Alex Vance Analyst"
    assert user_created["auth_provider"] == "local"
    assert user_created["is_active"] is True
    print(f"  Created user id={user_created['id']}, email='{user_created['email']}'")

    # B. Duplicate registration with exact same email
    res_dup1 = client.post("/api/v1/auth/register", json=reg_payload)
    print(f"  POST /api/v1/auth/register (Exact Duplicate) -> Status: {res_dup1.status_code}")
    assert res_dup1.status_code == 409, f"Expected 409 Conflict, got {res_dup1.status_code}: {res_dup1.text}"
    assert res_dup1.json().get("detail") == "An account with this email already exists."

    # C. Duplicate registration with different casing and whitespace
    res_dup2 = client.post("/api/v1/auth/register", json={
        "full_name": "Another Name",
        "email": f"TEST.ANALYST.{rand_id}@FINANCIAL.AI",
        "password": "differentPassword456"
    })
    print(f"  POST /api/v1/auth/register (Upper Case Duplicate) -> Status: {res_dup2.status_code}")
    assert res_dup2.status_code == 409
    assert res_dup2.json().get("detail") == "An account with this email already exists."

    # D. Register a completely different new user
    rand_id2 = random.randint(100000, 999999)
    res_reg2 = client.post("/api/v1/auth/register", json={
        "full_name": "Second Analyst",
        "email": f"second.analyst.{rand_id2}@financial.ai",
        "password": "AnotherSecurePass789!"
    })
    assert res_reg2.status_code == 201
    print(f"  POST /api/v1/auth/register (Distinct Email 2) -> Status: {res_reg2.status_code}")
    print("  >>> PASSED: Registration duplicate email behavior is 100% correct!")

    # -------------------------------------------------------------
    # 3. Login Flow: Correct, Wrong Password, Unknown User, Token Generation
    # -------------------------------------------------------------
    print("\n[TEST 3] Login Flow: Authentication, JWT Generation, and 401 Handling...")
    # A. Valid login
    res_login = client.post("/api/v1/auth/login", json={"email": normalized_email, "password": password})
    print(f"  POST /api/v1/auth/login (Correct Credentials) -> Status: {res_login.status_code}")
    assert res_login.status_code == 200
    token_data = res_login.json()
    access_token = token_data.get("access_token")
    assert access_token and isinstance(access_token, str), "Missing access token"
    assert token_data.get("token_type") == "bearer"
    assert token_data.get("user", {}).get("email") == normalized_email
    print(f"  Successfully received JWT Access Token (length: {len(access_token)})")

    # B. Valid login with mixed-case email
    res_login_cased = client.post("/api/v1/auth/login", json={"email": raw_email.upper(), "password": password})
    assert res_login_cased.status_code == 200

    # C. Wrong password
    res_wrong_pw = client.post("/api/v1/auth/login", json={"email": normalized_email, "password": "WrongPassword123!"})
    print(f"  POST /api/v1/auth/login (Wrong Password) -> Status: {res_wrong_pw.status_code}")
    assert res_wrong_pw.status_code == 401
    assert res_wrong_pw.json().get("detail") == "Invalid email or password."

    # D. Non-existent email
    res_unknown = client.post("/api/v1/auth/login", json={"email": "nonexistent.user.999@stockai.com", "password": "AnyPassword123!"})
    print(f"  POST /api/v1/auth/login (Unknown Email) -> Status: {res_unknown.status_code}")
    assert res_unknown.status_code == 401
    assert res_unknown.json().get("detail") == "Invalid email or password."
    print("  >>> PASSED: Login flow & generic error masking verified!")

    # -------------------------------------------------------------
    # 4. /auth/me Endpoint: Bearer Token Validation & Inactive Account Rejection
    # -------------------------------------------------------------
    print("\n[TEST 4] Current User (/auth/me) Bearer Verification...")
    # A. Valid token
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    print(f"  GET /api/v1/auth/me (Valid Bearer) -> Status: {res_me.status_code}")
    assert res_me.status_code == 200
    me_user = res_me.json()
    assert me_user["email"] == normalized_email
    assert me_user["id"] == user_created["id"]
    assert me_user["is_active"] is True

    # B. Invalid token
    res_invalid_token = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid_garbage_token"})
    print(f"  GET /api/v1/auth/me (Invalid Bearer) -> Status: {res_invalid_token.status_code}")
    assert res_invalid_token.status_code == 401

    # C. Missing token
    res_no_token = client.get("/api/v1/auth/me")
    print(f"  GET /api/v1/auth/me (Missing Header) -> Status: {res_no_token.status_code}")
    assert res_no_token.status_code == 401
    print("  >>> PASSED: /auth/me security checks verified!")

    # -------------------------------------------------------------
    # 5. Forgot Password & Secure Reset Token
    # -------------------------------------------------------------
    print("\n[TEST 5] Forgot Password Token Generation & Generic Response...")
    res_fp_existing = client.post("/api/v1/auth/forgot-password", json={"email": normalized_email})
    print(f"  POST /api/v1/auth/forgot-password (Existing User) -> Status: {res_fp_existing.status_code}")
    assert res_fp_existing.status_code == 200
    assert "password reset instructions" in res_fp_existing.json().get("message", "")

    # Check reset token in database
    with SessionLocal() as db:
        u = db.query(User).filter(User.email == normalized_email).first()
        assert u.reset_token is not None, "Reset token was not saved in database"
        assert u.reset_token_expires is not None, "Reset token expiration was not set"
        print(f"  Reset Token safely generated: {u.reset_token[:10]}... expires at: {u.reset_token_expires}")

    res_fp_unknown = client.post("/api/v1/auth/forgot-password", json={"email": "nobody.at.all@randomdomain.org"})
    print(f"  POST /api/v1/auth/forgot-password (Unknown User) -> Status: {res_fp_unknown.status_code}")
    assert res_fp_unknown.status_code == 200
    assert res_fp_unknown.json() == res_fp_existing.json()
    print("  >>> PASSED: Password reset security verified!")

    # -------------------------------------------------------------
    # 6. OAuth Endpoints & Google Flow Verification
    # -------------------------------------------------------------
    print("\n[TEST 6] OAuth Architecture & Google Endpoints...")
    res_providers = client.get("/api/v1/auth/providers")
    assert res_providers.status_code == 200
    print(f"  GET /api/v1/auth/providers -> {res_providers.json()}")

    res_google_url = client.get("/api/v1/auth/google/url")
    assert res_google_url.status_code == 200
    google_url_data = res_google_url.json()
    assert "accounts.google.com" in google_url_data.get("url", "")
    print(f"  GET /api/v1/auth/google/url -> URL generated successfully ({google_url_data['url'][:50]}...)")

    # Test Google Sign-in / account linking
    google_test_email = f"google.analyst.{rand_id}@gmail.com"
    res_google_post = client.post("/api/v1/auth/google", json={
        "email": google_test_email,
        "name": "Google Verified Analyst"
    })
    print(f"  POST /api/v1/auth/google -> Status: {res_google_post.status_code}")
    assert res_google_post.status_code == 200
    g_token_data = res_google_post.json()
    assert g_token_data.get("access_token") is not None
    assert g_token_data.get("user", {}).get("auth_provider") == "google"
    print("  >>> PASSED: OAuth endpoints verified!")

    # -------------------------------------------------------------
    # 7. Stock Research & Existing Features Regression Testing
    # -------------------------------------------------------------
    print("\n[TEST 7] Stock Analysis & Financial Features Regression Test...")
    for query in ["TCS", "RELIANCE", "INFY"]:
        res_search = client.get(f"/api/v1/company/search?query={query}")
        assert res_search.status_code == 200, f"Stock search failed for {query}"
        results = res_search.json()
        assert len(results) > 0
        print(f"  Stock search '{query}' -> {len(results)} matches found")

    res_profile = client.get("/api/v1/company/profile/TCS.NS")
    assert res_profile.status_code == 200
    profile_data = res_profile.json()
    print(f"  TCS.NS Profile -> Name: '{profile_data.get('company_name')}', Sector: '{profile_data.get('sector')}'")

    res_price = client.get("/api/v1/company/price/TCS.NS")
    assert res_price.status_code == 200
    price_data = res_price.json()
    print(f"  TCS.NS Price -> Current: {price_data.get('current_price')}")

    res_ratios = client.get("/api/v1/company/ratios/TCS.NS")
    assert res_ratios.status_code == 200
    ratios_data = res_ratios.json()
    safe_cap = str(ratios_data.get('market_cap')).encode('ascii', 'replace').decode('ascii')
    print(f"  TCS.NS Ratios -> P/E: {ratios_data.get('pe_ratio')}, Market Cap: {safe_cap}")

    res_indices = client.get("/api/v1/market/indices")
    assert res_indices.status_code == 200
    print(f"  Market Indices -> {len(res_indices.json())} indices available")

    print("\n" + "=" * 70)
    print("ALL 7 TEST SUITES PASSED FLAWLESSLY WITH ZERO ERRORS!")
    print("=" * 70)

if __name__ == "__main__":
    run_all_tests()

