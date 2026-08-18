import time
import json
import math
import urllib.request
import urllib.parse
import concurrent.futures
from typing import List, Dict, Any, Optional
import yfinance as yf
import pandas as pd

# Global ThreadPoolExecutor for fast non-blocking background tasks
_EXECUTOR = concurrent.futures.ThreadPoolExecutor(max_workers=10)

# Global TTL Caches
_COMPANY_CACHE: Dict[str, tuple] = {}
_SEARCH_CACHE: Dict[str, tuple] = {}
_CACHE_TTL = 300  # 5 minutes cache TTL


def safe_float(val: Any, default: Optional[float] = None) -> Optional[float]:
    """Safely convert any numeric type (numpy float, string, etc.) to Python float, avoiding NaN/Inf."""
    if val is None:
        return default
    try:
        if pd.isna(val):
            return default
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return default
        return round(f, 2)
    except (ValueError, TypeError):
        return default


def safe_int(val: Any, default: int = 0) -> int:
    """Safely convert any numeric type to Python int."""
    if val is None:
        return default
    try:
        if pd.isna(val):
            return default
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return default
        return int(f)
    except (ValueError, TypeError):
        return default


def format_large_number(num: Optional[float], currency: str = "USD") -> str:
    """Format large numbers into human-readable strings (e.g., 3.5T, 500B, 12M, or ₹28.5L Cr)."""
    if num is None or pd.isna(num):
        return "N/A"
    try:
        f_num = float(num)
        if math.isnan(f_num) or math.isinf(f_num):
            return "N/A"
    except Exception:
        return "N/A"

    if currency == "INR":
        crores = f_num / 10000000
        if crores >= 100000:
            return f"₹{crores / 100000:.2f}L Cr"
        if crores >= 1:
            return f"₹{crores:,.2f} Cr"
        return f"₹{f_num:,.2f}"

    if f_num >= 1e12:
        return f"${f_num / 1e12:.2f}T"
    if f_num >= 1e9:
        return f"${f_num / 1e9:.2f}B"
    if f_num >= 1e6:
        return f"${f_num / 1e6:.2f}M"
    return f"${f_num:,.2f}"


def format_percentage(num: Optional[float]) -> str:
    """Format decimal/float into percentage string (e.g. 0.31 -> 31.0%)."""
    if num is None or pd.isna(num):
        return "N/A"
    try:
        f_num = float(num)
        if math.isnan(f_num) or math.isinf(f_num):
            return "N/A"
        if abs(f_num) < 1.0 and f_num != 0:
            return f"{f_num * 100:.2f}%"
        return f"{f_num:.2f}%"
    except Exception:
        return "N/A"


def normalize_symbol(query: str) -> str:
    """
    Normalize input stock ticker with contextual Indian and US resolution.
    Maps common names and symbols to exact yfinance tickers.
    """
    if not query:
        return "AAPL"
    
    q = query.strip().upper()
    q_no_space = q.replace(" ", "")

    ALIAS_MAP = {
        # Indian Equities (NSE/BSE)
        "RELIANCE": "RELIANCE.NS",
        "RELIANCE INDUSTRIES": "RELIANCE.NS",
        "TCS": "TCS.NS",
        "TATA CONSULTANCY": "TCS.NS",
        "TATA CONSULTANCY SERVICES": "TCS.NS",
        "INFY": "INFY.NS",
        "INFOSYS": "INFY.NS",
        "HDFCBANK": "HDFCBANK.NS",
        "HDFC": "HDFCBANK.NS",
        "HDFC BANK": "HDFCBANK.NS",
        "ICICIBANK": "ICICIBANK.NS",
        "ICICI": "ICICIBANK.NS",
        "ICICI BANK": "ICICIBANK.NS",
        "TATAMOTORS": "TATAMOTORS.NS",
        "TATA MOTORS": "TATAMOTORS.NS",
        "TATASTEEL": "TATASTEEL.NS",
        "TATA STEEL": "TATASTEEL.NS",
        "TATAPOWER": "TATAPOWER.NS",
        "TATA POWER": "TATAPOWER.NS",
        "SBIN": "SBIN.NS",
        "SBI": "SBIN.NS",
        "STATE BANK OF INDIA": "SBIN.NS",
        "STATE BANK": "SBIN.NS",
        "KOTAKBANK": "KOTAKBANK.NS",
        "KOTAK": "KOTAKBANK.NS",
        "KOTAK MAHINDRA": "KOTAKBANK.NS",
        "AXISBANK": "AXISBANK.NS",
        "AXIS": "AXISBANK.NS",
        "AXIS BANK": "AXISBANK.NS",
        "LT": "LT.NS",
        "L&T": "LT.NS",
        "LARSEN": "LT.NS",
        "LARSEN & TOUBRO": "LT.NS",
        "BAJFINANCE": "BAJFINANCE.NS",
        "BAJAJ FINANCE": "BAJFINANCE.NS",
        "MARUTI": "MARUTI.NS",
        "MARUTI SUZUKI": "MARUTI.NS",
        "HCLTECH": "HCLTECH.NS",
        "HCL": "HCLTECH.NS",
        "ASIANPAINT": "ASIANPAINT.NS",
        "ASIAN PAINTS": "ASIANPAINT.NS",
        "ADANIENT": "ADANIENT.NS",
        "ADANI ENTERPRISES": "ADANIENT.NS",
        "ADANIPORTS": "ADANIPORTS.NS",
        "YESBANK": "YESBANK.NS",
        "YES BANK": "YESBANK.NS",
        "BHARTIARTL": "BHARTIARTL.NS",
        "AIRTEL": "BHARTIARTL.NS",
        "WIPRO": "WIPRO.NS",
        "ITC": "ITC.NS",
        "CIPLA": "CIPLA.NS",
        "SUNPHARMA": "SUNPHARMA.NS",
        "NIFTY": "^NSEI",
        "NIFTY 50": "^NSEI",
        "SENSEX": "^BSESN",
        # Popular US Equities
        "APPLE": "AAPL",
        "NVIDIA": "NVDA",
        "TESLA": "TSLA",
        "MICROSOFT": "MSFT",
        "AMAZON": "AMZN",
        "GOOGLE": "GOOGL",
        "ALPHABET": "GOOGL",
        "META": "META",
        "FACEBOOK": "META",
        "NETFLIX": "NFLX",
        "AMD": "AMD",
        "INTEL": "INTC",
    }

    return ALIAS_MAP.get(q) or ALIAS_MAP.get(q_no_space) or q


def _run_with_timeout(func, timeout_sec: float = 2.0, default=None):
    """Executes func in background thread pool with strict timeout."""
    try:
        future = _EXECUTOR.submit(func)
        return future.result(timeout=timeout_sec)
    except Exception:
        return default


def fetch_yahoo_chart_rest(symbol: str, timeframe: str = "1M") -> Optional[Dict[str, Any]]:
    """Fast direct HTTP fetch from Yahoo Finance Chart v8 REST endpoint."""
    from datetime import datetime
    tf_map = {
        "1D": ("1d", "5m"),
        "1W": ("5d", "30m"),
        "1M": ("1mo", "1d"),
        "6M": ("6mo", "1d"),
        "1Y": ("1y", "1d"),
        "ALL": ("max", "1wk")
    }
    range_val, interval_val = tf_map.get(timeframe.upper(), ("1mo", "1d"))
    url = f"https://query2.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(symbol)}?interval={interval_val}&range={range_val}"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"}

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            chart_res = data.get("chart", {}).get("result", [])
            if not chart_res:
                return None
            res0 = chart_res[0]
            meta = res0.get("meta", {})
            quote = res0.get("indicators", {}).get("quote", [{}])[0]
            timestamps = res0.get("timestamp", [])

            price = safe_float(meta.get("regularMarketPrice"))
            prev_close = safe_float(meta.get("chartPreviousClose") or meta.get("previousClose"))
            currency = meta.get("currency") or ("INR" if symbol.endswith(".NS") or symbol.endswith(".BO") else "USD")

            points = []
            if timestamps and quote:
                opens = quote.get("open", [])
                highs = quote.get("high", [])
                lows = quote.get("low", [])
                closes = quote.get("close", [])
                volumes = quote.get("volume", [])

                clean_closes = [c for c in closes if c is not None and not pd.isna(c)]
                c_series = pd.Series(clean_closes) if clean_closes else pd.Series()
                ma20_series = c_series.rolling(window=min(20, max(1, len(c_series))), min_periods=1).mean() if not c_series.empty else pd.Series()
                ma_idx = 0

                for idx, t in enumerate(timestamps):
                    o = safe_float(opens[idx] if idx < len(opens) else None)
                    h = safe_float(highs[idx] if idx < len(highs) else None)
                    l = safe_float(lows[idx] if idx < len(lows) else None)
                    c = safe_float(closes[idx] if idx < len(closes) else None)
                    v = safe_int(volumes[idx] if idx < len(volumes) else 0)

                    if c is None or o is None or h is None or l is None:
                        continue

                    dt = datetime.fromtimestamp(t)
                    if timeframe in ["1D", "1W"]:
                        time_val = int(t)
                        time_str = dt.strftime("%H:%M" if timeframe == "1D" else "%a %H:%M")
                        date_str = dt.strftime("%d %b %Y, %H:%M")
                    else:
                        time_val = dt.strftime("%Y-%m-%d")
                        time_str = dt.strftime("%b %d")
                        date_str = dt.strftime("%d %b %Y")

                    ma_val = safe_float(ma20_series.iloc[ma_idx]) if ma_idx < len(ma20_series) else c
                    ma_idx += 1

                    points.append({
                        "time": time_val,
                        "timestamp": time_str,
                        "date": date_str,
                        "open": o,
                        "high": h,
                        "low": l,
                        "close": c,
                        "price": c,
                        "volume": v,
                        "ma20": ma_val or c
                    })

            return {
                "symbol": symbol,
                "price": price,
                "prev_close": prev_close,
                "currency": currency,
                "exchange": meta.get("exchangeName") or ("NSE" if symbol.endswith(".NS") else "US Market"),
                "instrumentType": meta.get("instrumentType"),
                "points": points
            }
    except Exception:
        return None


class YahooFinanceService:
    @staticmethod
    def search_company(query: str) -> List[Dict[str, Any]]:
        """
        Search global and Indian stock companies dynamically matching query.
        Uses yfinance Search API + HTTP search fallback + alias resolution.
        """
        q_raw = query.strip()
        if not q_raw:
            return []

        cache_key = q_raw.upper()
        now = time.time()

        if cache_key in _SEARCH_CACHE:
            cached_time, cached_data = _SEARCH_CACHE[cache_key]
            if now - cached_time < _CACHE_TTL:
                return cached_data

        results = []
        seen = set()

        def add_item(sym, name, sec, ind, exch, price=None, change=None, change_pct=None, is_pos=True):
            if sym and sym not in seen:
                seen.add(sym)
                results.append({
                    "symbol": sym,
                    "company_name": name or sym,
                    "sector": sec or "General",
                    "industry": ind or "Equities",
                    "exchange": exch or ("NSE" if sym.endswith(".NS") else ("BSE" if sym.endswith(".BO") else "US Market")),
                    "current_price": safe_float(price),
                    "change": safe_float(change),
                    "change_percent": safe_float(change_pct),
                    "is_positive": is_pos
                })

        # 1. Check exact alias match
        norm_sym = normalize_symbol(q_raw)
        if norm_sym != q_raw.upper() and norm_sym not in seen:
            add_item(norm_sym, q_raw.title(), "General", "Equities", "NSE" if norm_sym.endswith(".NS") else "US Market")

        # 2. Try yfinance.Search with fast timeout
        def do_yf_search():
            s = yf.Search(q_raw)
            return getattr(s, "quotes", [])

        yf_quotes = _run_with_timeout(do_yf_search, timeout_sec=2.0, default=[])
        for q in yf_quotes:
            sym = q.get("symbol")
            if sym and q.get("quoteType", "").upper() in ["EQUITY", "INDEX", "ETF", "MUTUALFUND", ""]:
                name = q.get("shortname") or q.get("longname") or sym
                exch = q.get("exchDisp") or q.get("exchange") or ("NSE" if sym.endswith(".NS") else "US Market")
                sec = q.get("sectorDisp") or q.get("sector") or "General"
                ind = q.get("industryDisp") or q.get("industry") or "N/A"
                add_item(sym, name, sec, ind, exch)

        # 3. Direct Yahoo REST Search fallback if yf.Search returned few results
        if len(results) < 3:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"}
            search_terms = [q_raw]
            if norm_sym not in search_terms:
                search_terms.append(norm_sym)

            for term in search_terms:
                try:
                    url = f"https://query2.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(term)}&quotesCount=8&newsCount=0"
                    req = urllib.request.Request(url, headers=headers)
                    with urllib.request.urlopen(req, timeout=2.0) as resp:
                        data = json.loads(resp.read().decode("utf-8"))
                        for item in data.get("quotes", []):
                            sym = item.get("symbol")
                            if sym:
                                name = item.get("shortname") or item.get("longname") or sym
                                exch = item.get("exchDisp") or item.get("exchange") or ("NSE" if sym.endswith(".NS") else "US Market")
                                sec = item.get("sectorDisp") or item.get("sector") or "General"
                                ind = item.get("industryDisp") or item.get("industry") or "N/A"
                                add_item(sym, name, sec, ind, exch)
                except Exception:
                    pass
                if len(results) >= 5:
                    break

        _SEARCH_CACHE[cache_key] = (now, results)
        return results

    @staticmethod
    def get_company_profile(symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch company profile overview safely and non-blocking."""
        norm_sym = normalize_symbol(symbol)
        cache_key = f"PROFILE_{norm_sym}"
        now = time.time()

        if cache_key in _COMPANY_CACHE:
            t_cached, data_cached = _COMPANY_CACHE[cache_key]
            if now - t_cached < _CACHE_TTL:
                return data_cached

        # 1. Primary Direct REST Chart lookup (fastest, guaranteed price/currency)
        rest_data = fetch_yahoo_chart_rest(norm_sym, "1M")
        price = rest_data.get("price") if rest_data else None
        currency = rest_data.get("currency") if rest_data else ("INR" if norm_sym.endswith(".NS") or norm_sym.endswith(".BO") else "USD")

        # 2. Try fetching info and fast_info via yfinance
        def fetch_ticker_data():
            t = yf.Ticker(norm_sym)
            return t.info or {}, t.fast_info

        info_fast = _run_with_timeout(fetch_ticker_data, timeout_sec=6.0, default=({}, None))
        info, fast = info_fast if info_fast else ({}, None)

        if not price and fast:
            price = safe_float(getattr(fast, "last_price", None))
        if not price:
            price = safe_float(info.get("currentPrice") or info.get("regularMarketPrice"))

        if price is None and not info and not rest_data:
            return None

        mcap = getattr(fast, "market_cap", None) or info.get("marketCap")
        company_name = info.get("longName") or info.get("shortName") or norm_sym
        sector = info.get("sector") or "General"
        industry = info.get("industry") or "Equities"
        summary = info.get("longBusinessSummary") or f"Company profile overview for {company_name} ({norm_sym})."
        website = info.get("website") or f"https://finance.yahoo.com/quote/{norm_sym}"
        logo_url = info.get("logo_url") or "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120&auto=format&fit=crop&q=80"

        result = {
            "symbol": norm_sym,
            "company_name": company_name,
            "sector": sector,
            "industry": industry,
            "summary": summary,
            "logo_url": logo_url,
            "website": website,
            "current_price": price or 100.0,
            "market_cap": format_large_number(mcap, currency) if mcap else "N/A",
            "currency": currency
        }

        if mcap or (price and price > 0):
            _COMPANY_CACHE[cache_key] = (now, result)
        return result

    @staticmethod
    def get_stock_price(symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch real current stock price and daily change metrics dynamically."""
        norm_sym = normalize_symbol(symbol)
        cache_key = f"PRICE_{norm_sym}"
        now = time.time()

        if cache_key in _COMPANY_CACHE:
            t_cached, data_cached = _COMPANY_CACHE[cache_key]
            if now - t_cached < 60:  # 60s cache for price
                return data_cached

        # 1. Primary Direct REST Chart lookup
        rest_data = fetch_yahoo_chart_rest(norm_sym, "1M")
        if rest_data and rest_data.get("price") is not None:
            price = rest_data["price"]
            prev_close = rest_data.get("prev_close") or price
            change = safe_float(price - prev_close, 0.0)
            change_percent = safe_float((change / prev_close) * 100 if prev_close else 0.0, 0.0)

            res = {
                "symbol": norm_sym,
                "company_name": norm_sym,
                "price": price,
                "change": change,
                "change_percent": change_percent,
                "is_positive": change >= 0,
                "currency": rest_data["currency"]
            }
            _COMPANY_CACHE[cache_key] = (now, res)
            return res

        # 2. yfinance fast_info fallback
        try:
            t = yf.Ticker(norm_sym)
            fast = t.fast_info
            price = safe_float(getattr(fast, "last_price", None))
            prev_close = safe_float(getattr(fast, "previous_close", None)) or price
            if price is not None:
                change = safe_float(price - prev_close, 0.0)
                change_percent = safe_float((change / prev_close) * 100 if prev_close else 0.0, 0.0)
                currency = getattr(fast, "currency", None) or ("INR" if norm_sym.endswith(".NS") or norm_sym.endswith(".BO") else "USD")

                res = {
                    "symbol": norm_sym,
                    "company_name": norm_sym,
                    "price": price,
                    "change": change,
                    "change_percent": change_percent,
                    "is_positive": change >= 0,
                    "currency": currency
                }
                _COMPANY_CACHE[cache_key] = (now, res)
                return res
        except Exception:
            pass

        return None

    @staticmethod
    def get_historical_data(symbol: str, timeframe: str = "1M") -> List[Dict[str, Any]]:
        """Fetch historical OHLCV chart data formatted cleanly for frontend."""
        norm_sym = normalize_symbol(symbol)
        cache_key = f"HIST_{norm_sym}_{timeframe.upper()}"
        now = time.time()

        if cache_key in _COMPANY_CACHE:
            t_cached, data_cached = _COMPANY_CACHE[cache_key]
            if now - t_cached < _CACHE_TTL:
                return data_cached

        # 1. Direct REST Chart lookup
        rest_data = fetch_yahoo_chart_rest(norm_sym, timeframe)
        if rest_data and rest_data.get("points"):
            points = rest_data["points"]
            _COMPANY_CACHE[cache_key] = (now, points)
            return points

        # 2. yfinance history fallback with timeout
        def fetch_hist():
            t = yf.Ticker(norm_sym)
            tf_map = {"1D": ("1d", "5m"), "1W": ("5d", "30m"), "1M": ("1mo", "1d"), "6M": ("6mo", "1d"), "1Y": ("1y", "1d"), "ALL": ("max", "1wk")}
            period, interval = tf_map.get(timeframe.upper(), ("1mo", "1d"))
            return t.history(period=period, interval=interval)

        df = _run_with_timeout(fetch_hist, timeout_sec=3.0, default=pd.DataFrame())
        if df.empty:
            return []

        try:
            df = df.dropna(subset=['Open', 'High', 'Low', 'Close'])
            if df.empty:
                return []
            df["MA20"] = df["Close"].rolling(window=min(20, len(df)), min_periods=1).mean()

            points = []
            seen_times = set()
            for index, row in df.iterrows():
                if timeframe in ["1D", "1W"]:
                    time_val = int(index.timestamp())
                    time_str = index.strftime("%H:%M" if timeframe == "1D" else "%a %H:%M")
                    date_str = index.strftime("%d %b %Y, %H:%M")
                else:
                    time_val = index.strftime("%Y-%m-%d")
                    time_str = index.strftime("%b %d")
                    date_str = index.strftime("%d %b %Y")

                if time_val in seen_times:
                    continue
                seen_times.add(time_val)

                o = safe_float(row["Open"])
                h = safe_float(row["High"])
                l = safe_float(row["Low"])
                c = safe_float(row["Close"])
                v = safe_int(row["Volume"])
                ma = safe_float(row["MA20"]) or c

                if c is None or o is None:
                    continue

                points.append({
                    "time": time_val,
                    "timestamp": time_str,
                    "date": date_str,
                    "open": o,
                    "high": max(h or o, o, c),
                    "low": min(l or o, o, c),
                    "close": c,
                    "price": c,
                    "volume": v,
                    "ma20": ma
                })

            points.sort(key=lambda x: str(x["time"]))
            _COMPANY_CACHE[cache_key] = (now, points)
            return points
        except Exception:
            return []

    @staticmethod
    def get_financial_ratios(symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch key financial valuation ratios dynamically with fast_info and derived metrics."""
        norm_sym = normalize_symbol(symbol)
        cache_key = f"RATIOS_{norm_sym}"
        now = time.time()

        if cache_key in _COMPANY_CACHE:
            t_cached, data_cached = _COMPANY_CACHE[cache_key]
            if now - t_cached < _CACHE_TTL:
                return data_cached

        rest_data = fetch_yahoo_chart_rest(norm_sym, "1M")
        price = rest_data.get("price") if rest_data else None

        def fetch_ticker_data():
            t = yf.Ticker(norm_sym)
            info = t.info or {}
            fast = t.fast_info
            return info, fast

        info_fast = _run_with_timeout(fetch_ticker_data, timeout_sec=6.0, default=({}, None))
        info, fast = info_fast if info_fast else ({}, None)

        mcap = getattr(fast, "market_cap", None) or info.get("marketCap")
        currency = getattr(fast, "currency", None) or info.get("currency") or ("INR" if norm_sym.endswith(".NS") or norm_sym.endswith(".BO") else "USD")

        if not price and fast:
            price = safe_float(getattr(fast, "last_price", None))

        pe = safe_float(info.get("trailingPE") or info.get("forwardPE"))
        f_pe = safe_float(info.get("forwardPE"))
        eps = safe_float(info.get("trailingEps"))
        pb = safe_float(info.get("priceToBook"))

        # Calculate / Format ROE (Return on Equity)
        roe_val = safe_float(info.get("returnOnEquity"))
        if roe_val is None and pb is not None and pe is not None and pe > 0:
            roe_val = safe_float(pb / pe)
        roe_str = format_percentage(roe_val)

        # Dividend yield calculation
        div_rate = safe_float(info.get("dividendRate"))
        raw_div_y = safe_float(info.get("dividendYield"))
        if div_rate and price and price > 0:
            div_y_str = f"{(div_rate / price) * 100:.2f}%"
        elif raw_div_y is not None:
            div_y_str = format_percentage(raw_div_y)
        else:
            div_y_str = "N/A"

        # Debt to Equity
        raw_dte = safe_float(info.get("debtToEquity"))
        if raw_dte is not None:
            if raw_dte > 5.0:
                dte_str = f"{raw_dte:.2f}%"
            else:
                dte_str = f"{raw_dte * 100:.2f}%"
        else:
            dte_str = "N/A"

        # Profit margin
        raw_pm = safe_float(info.get("profitMargins"))
        pm_str = format_percentage(raw_pm)

        w52_high = safe_float(getattr(fast, "year_high", None)) or safe_float(info.get("fiftyTwoWeekHigh")) or (safe_float(price * 1.15) if price else None)
        w52_low = safe_float(getattr(fast, "year_low", None)) or safe_float(info.get("fiftyTwoWeekLow")) or (safe_float(price * 0.85) if price else None)

        res = {
            "symbol": norm_sym,
            "company_name": info.get("longName") or info.get("shortName") or norm_sym,
            "market_cap": format_large_number(mcap, currency) if mcap else "N/A",
            "pe_ratio": pe,
            "forward_pe": f_pe,
            "eps": eps,
            "roe": roe_str,
            "dividend_yield": div_y_str,
            "pb_ratio": pb,
            "debt_to_equity": dte_str,
            "profit_margin": pm_str,
            "week_52_high": w52_high,
            "week_52_low": w52_low
        }

        # Cache only if meaningful data exists
        if mcap or pe or eps or pb or (price and price > 0):
            _COMPANY_CACHE[cache_key] = (now, res)

        return res

    @staticmethod
    def get_stock_news(symbol: str) -> List[Dict[str, Any]]:
        """Fetch stock news articles dynamically from yfinance or web search fallback."""
        norm_sym = normalize_symbol(symbol)
        cache_key = f"NEWS_{norm_sym}"
        now = time.time()

        if cache_key in _COMPANY_CACHE:
            t_cached, data_cached = _COMPANY_CACHE[cache_key]
            if now - t_cached < _CACHE_TTL:
                return data_cached

        def fetch_yf_news():
            t = yf.Ticker(norm_sym)
            return getattr(t, "news", []) or []

        raw_news = _run_with_timeout(fetch_yf_news, timeout_sec=2.0, default=[])
        articles = []

        for idx, item in enumerate(raw_news[:8]):
            content = item.get("content", {}) if isinstance(item.get("content"), dict) else item
            title = content.get("title") or item.get("title")
            if not title:
                continue
            
            link_obj = content.get("canonicalUrl") or content.get("clickThroughUrl") or item.get("link")
            url = link_obj.get("url") if isinstance(link_obj, dict) else (link_obj or f"https://finance.yahoo.com/quote/{norm_sym}")
            provider = content.get("provider", {}).get("displayName") or item.get("publisher") or "Yahoo Finance"
            summary = content.get("summary") or item.get("summary") or title

            articles.append({
                "id": str(idx + 1),
                "symbol": norm_sym,
                "title": title,
                "summary": summary[:250] + "..." if len(summary) > 250 else summary,
                "source": provider,
                "url": url,
                "time": "Recent",
                "category": "Market News",
                "sentiment": 85.0
            })

        if not articles:
            # Web search fallback
            from app.services.web_search import WebSearchService
            search_res = WebSearchService.search(f"{norm_sym} stock financial news", num_results=5)
            for idx, item in enumerate(search_res):
                articles.append({
                    "id": str(idx + 1),
                    "symbol": norm_sym,
                    "title": item.get("title", "Market Intelligence Report"),
                    "summary": item.get("snippet", ""),
                    "source": item.get("source", "Financial News"),
                    "url": item.get("url", f"https://finance.yahoo.com/quote/{norm_sym}"),
                    "time": "Recent",
                    "category": "Web News",
                    "sentiment": 80.0
                })

        _COMPANY_CACHE[cache_key] = (now, articles)
        return articles
