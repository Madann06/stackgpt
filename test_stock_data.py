import sys
import time
import requests
import yfinance as yf

SYMBOLS = ["TCS.NS", "AAPL", "INFY.NS", "SBIN.NS", "NVDA", "RELIANCE.NS"]
BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_yfinance_direct():
    print("=" * 60)
    print("1. TESTING YFINANCE DIRECTLY")
    print("=" * 60)
    for sym in SYMBOLS:
        print(f"\n--- Symbol: {sym} ---")
        try:
            ticker = yf.Ticker(sym)
            fast_info = ticker.fast_info
            price = getattr(fast_info, 'last_price', None)
            prev_close = getattr(fast_info, 'previous_close', None)
            print(f"yfinance fast_info -> last_price: {price}, previous_close: {prev_close}")

            info = ticker.info or {}
            short_name = info.get("shortName") or info.get("longName")
            mcap = info.get("marketCap")
            print(f"yfinance info -> name: {short_name}, mcap: {mcap}, sector: {info.get('sector')}")

            df = ticker.history(period="1mo")
            print(f"yfinance history (1mo) -> rows: {len(df)}")
        except Exception as e:
            print(f"yfinance ERROR for {sym}: {e}")

def test_backend_endpoints():
    print("\n" + "=" * 60)
    print("2. TESTING FASTAPI BACKEND ENDPOINTS DIRECTLY")
    print("=" * 60)

    endpoints = [
        "/company/profile/{symbol}",
        "/company/price/{symbol}",
        "/company/ratios/{symbol}",
        "/company/history/{symbol}",
        "/company/news/{symbol}"
    ]

    for sym in SYMBOLS:
        print(f"\n=================== SYMBOL: {sym} ===================")
        for ep_template in endpoints:
            ep = ep_template.format(symbol=sym)
            url = f"{BASE_URL}{ep}"
            t0 = time.time()
            try:
                resp = requests.get(url, timeout=10)
                elapsed = time.time() - t0
                status = resp.status_code
                content_type = resp.headers.get("content-type", "")
                if status == 200:
                    json_data = resp.json()
                    summary_str = f"Keys: {list(json_data.keys()) if isinstance(json_data, dict) else len(json_data)}"
                    print(f"PASS [{status}] {ep:32s} in {elapsed:.2f}s | {summary_str}")
                else:
                    print(f"FAIL [{status}] {ep:32s} in {elapsed:.2f}s | Body: {resp.text[:150]}")
            except Exception as e:
                elapsed = time.time() - t0
                print(f"EXCEPT [{ep:32s}] in {elapsed:.2f}s | Error: {e}")

def test_search_endpoints():
    print("\n" + "=" * 60)
    print("3. TESTING SEARCH ENDPOINTS DIRECTLY")
    print("=" * 60)
    search_queries = [
        "TCS",
        "tcs",
        "Tata Consultancy Services",
        "Infosys",
        "Reliance",
        "SBI",
        "State Bank of India",
        "Apple",
        "Nvidia",
        "Tesla"
    ]
    for q in search_queries:
        url = f"{BASE_URL}/company/search?query={requests.utils.quote(q)}"
        t0 = time.time()
        try:
            resp = requests.get(url, timeout=10)
            elapsed = time.time() - t0
            if resp.status_code == 200:
                results = resp.json()
                symbols = [r.get("symbol") for r in results]
                print(f"PASS [200] Search '{q:28s}' in {elapsed:.2f}s | Found: {symbols[:5]}")
            else:
                print(f"FAIL [{resp.status_code}] Search '{q}' in {elapsed:.2f}s | Body: {resp.text[:150]}")
        except Exception as e:
            elapsed = time.time() - t0
            print(f"EXCEPT Search '{q}' in {elapsed:.2f}s | Error: {e}")

if __name__ == "__main__":
    test_yfinance_direct()
    test_backend_endpoints()
    test_search_endpoints()

