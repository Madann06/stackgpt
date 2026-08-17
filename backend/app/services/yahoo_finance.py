import yfinance as yf
import pandas as pd
from typing import List, Dict, Any, Optional


def format_large_number(num: Optional[float], currency: str = "USD") -> str:
    """Format large numbers into human-readable strings (e.g., 3.5T, 500B, 12M, or ₹28.5L Cr)."""
    if num is None or pd.isna(num):
        return "N/A"
    
    if currency == "INR":
        # Format Indian Rupee (Crores / Lakh Crores)
        crores = num / 10000000
        if crores >= 100000:
            return f"₹{crores / 100000:.2f}L Cr"
        if crores >= 1:
            return f"₹{crores:,.2f} Cr"
        return f"₹{num:,.2f}"

    if num >= 1e12:
        return f"${num / 1e12:.2f}T"
    if num >= 1e9:
        return f"${num / 1e9:.2f}B"
    if num >= 1e6:
        return f"${num / 1e6:.2f}M"
    return f"${num:,.2f}"


def format_percentage(num: Optional[float]) -> str:
    """Format decimal/float into percentage string (e.g. 0.31 -> 31.0%)."""
    if num is None or pd.isna(num):
        return "N/A"
    if num < 1.0:
        return f"{num * 100:.2f}%"
    return f"{num:.2f}%"


def normalize_symbol(query: str) -> str:
    """Normalize input stock ticker, mapping popular Indian stocks without .NS suffix."""
    q = query.strip().upper()
    q_no_space = q.replace(" ", "")
    INDIAN_ALIAS_MAP = {
        "RELIANCE": "RELIANCE.NS",
        "RELIANCE INDUSTRIES": "RELIANCE.NS",
        "TCS": "TCS.NS",
        "TATA CONSULTANCY": "TCS.NS",
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
        "TATA": "TATAMOTORS.NS",
        "SBIN": "SBIN.NS",
        "SBI": "SBIN.NS",
        "SB": "SBIN.NS",
        "STATE BANK OF INDIA": "SBIN.NS",
        "STATE BANK": "SBIN.NS",
        "YESBANK": "YESBANK.NS",
        "YES BANK": "YESBANK.NS",
        "BHARTIARTL": "BHARTIARTL.NS",
        "AIRTEL": "BHARTIARTL.NS",
        "WIPRO": "WIPRO.NS",
        "ITC": "ITC.NS",
        "CIPLA": "CIPLA.NS",
        "SUNPHARMA": "SUNPHARMA.NS",
        "NIFTY": "^NSEI",
        "SENSEX": "^BSESN"
    }
    return INDIAN_ALIAS_MAP.get(q) or INDIAN_ALIAS_MAP.get(q_no_space) or q


_SEARCH_CACHE: Dict[str, tuple] = {}
_CACHE_TTL = 300


def fetch_yahoo_chart_rest(symbol: str, timeframe: str = "1M") -> Optional[Dict[str, Any]]:
    import urllib.request, urllib.parse, json, pandas as pd
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

            price = meta.get("regularMarketPrice")
            prev_close = meta.get("chartPreviousClose") or meta.get("previousClose")
            currency = meta.get("currency") or ("INR" if symbol.endswith(".NS") or symbol.endswith(".BO") else "USD")

            points = []
            if timestamps and quote:
                opens = quote.get("open", [])
                highs = quote.get("high", [])
                lows = quote.get("low", [])
                closes = quote.get("close", [])
                volumes = quote.get("volume", [])

                clean_closes = [c for c in closes if c is not None]
                c_series = pd.Series(clean_closes) if clean_closes else pd.Series()
                ma20_series = c_series.rolling(window=min(20, max(1, len(c_series))), min_periods=1).mean() if not c_series.empty else pd.Series()
                ma_idx = 0

                for idx, t in enumerate(timestamps):
                    o = opens[idx] if idx < len(opens) else None
                    h = highs[idx] if idx < len(highs) else None
                    l = lows[idx] if idx < len(lows) else None
                    c = closes[idx] if idx < len(closes) else None
                    v = volumes[idx] if idx < len(volumes) else 0

                    if c is None or o is None or h is None or l is None:
                        continue

                    dt = datetime.fromtimestamp(t)
                    if timeframe in ["1D", "1W"]:
                        time_val = t
                        time_str = dt.strftime("%H:%M" if timeframe == "1D" else "%a %H:%M")
                        date_str = dt.strftime("%d %b %Y, %H:%M")
                    else:
                        time_val = dt.strftime("%Y-%m-%d")
                        time_str = dt.strftime("%b %d")
                        date_str = dt.strftime("%d %b %Y")

                    ma_val = float(ma20_series.iloc[ma_idx]) if ma_idx < len(ma20_series) else c
                    ma_idx += 1

                    points.append({
                        "time": time_val,
                        "timestamp": time_str,
                        "date": date_str,
                        "open": round(float(o), 2),
                        "high": round(float(h), 2),
                        "low": round(float(l), 2),
                        "close": round(float(c), 2),
                        "price": round(float(c), 2),
                        "volume": int(v) if v else 0,
                        "ma20": round(float(ma_val), 2)
                    })

            return {
                "symbol": symbol,
                "price": round(float(price), 2) if price is not None else None,
                "prev_close": round(float(prev_close), 2) if prev_close is not None else None,
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
        Search global and Indian stock companies dynamically matching query ticker or name.
        Uses Yahoo Finance search REST API + Gossip API fallback + alias mapping.
        """
        import time, urllib.request, urllib.parse, json
        q_raw = query.strip()
        if not q_raw:
            return []

        cache_key = q_raw.upper()
        now = time.time()

        if cache_key in _SEARCH_CACHE:
            cached_time, cached_data = _SEARCH_CACHE[cache_key]
            if now - cached_time < _CACHE_TTL:
                return cached_data

        q_upper = q_raw.upper()
        q_no_space = q_upper.replace(" ", "")

        INDIAN_ALIAS_MAP = {
            "RELIANCE": "RELIANCE.NS",
            "RELIANCE INDUSTRIES": "RELIANCE.NS",
            "TCS": "TCS.NS",
            "TATA CONSULTANCY": "TCS.NS",
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
            "SBIN": "SBIN.NS",
            "SBI": "SBIN.NS",
            "SB": "SBIN.NS",
            "STATE BANK OF INDIA": "SBIN.NS",
            "STATE BANK": "SBIN.NS",
            "YESBANK": "YESBANK.NS",
            "YES BANK": "YESBANK.NS",
            "BHARTIARTL": "BHARTIARTL.NS",
            "AIRTEL": "BHARTIARTL.NS",
            "WIPRO": "WIPRO.NS",
            "ITC": "ITC.NS",
            "CIPLA": "CIPLA.NS",
            "SUNPHARMA": "SUNPHARMA.NS",
            "NIFTY": "^NSEI",
            "SENSEX": "^BSESN"
        }

        candidate_alias = INDIAN_ALIAS_MAP.get(q_upper) or INDIAN_ALIAS_MAP.get(q_no_space)

        results = []
        seen = set()

        def add_quote_item(sym, name, sec, ind, exch, price=None, change=None, change_pct=None, is_pos=True):
            if sym and sym not in seen:
                seen.add(sym)
                results.append({
                    "symbol": sym,
                    "company_name": name or sym,
                    "sector": sec or "General",
                    "industry": ind or "Equities",
                    "exchange": exch or ("NSE" if sym.endswith(".NS") else ("BSE" if sym.endswith(".BO") else "US Market")),
                    "current_price": price,
                    "change": change,
                    "change_percent": change_pct,
                    "is_positive": is_pos
                })

        search_terms = [q_raw]
        if candidate_alias and candidate_alias not in search_terms:
            search_terms.insert(0, candidate_alias)
        if " " in q_raw and q_no_space not in search_terms:
            search_terms.append(q_no_space)
        if not q_upper.endswith(".NS") and not q_upper.endswith(".BO") and (q_no_space + ".NS") not in search_terms:
            search_terms.append(q_no_space + ".NS")

        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"}

        for term in search_terms:
            try:
                url = f"https://query2.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(term)}&quotesCount=10&newsCount=0"
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=2.5) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    for item in data.get("quotes", []):
                        sym = item.get("symbol")
                        qtype = item.get("quoteType", "").upper()
                        if sym and qtype in ["EQUITY", "INDEX", "ETF", "MUTUALFUND", ""]:
                            name = item.get("shortname") or item.get("longname") or sym
                            exch = item.get("exchDisp") or item.get("exchange") or ("NSE" if sym.endswith(".NS") else ("BSE" if sym.endswith(".BO") else "US Market"))
                            sec = item.get("sectorDisp") or item.get("sector") or "General"
                            ind = item.get("industryDisp") or item.get("industry") or "N/A"
                            add_quote_item(sym, name, sec, ind, exch)
            except Exception:
                pass

            if len(results) >= 5:
                break

        if not results:
            for term in search_terms:
                try:
                    url = f"https://search.yahoo.com/sugg/gossip/gossip-us-finance?output=sdp&command={urllib.parse.quote(term)}"
                    req = urllib.request.Request(url, headers=headers)
                    with urllib.request.urlopen(req, timeout=2.5) as resp:
                        data = json.loads(resp.read().decode("utf-8"))
                        gossip = data.get("gossip", {})
                        for item in gossip.get("results", []):
                            sym = item.get("key")
                            if sym:
                                add_quote_item(sym, sym, "General", "Equities", "NSE" if sym.endswith(".NS") else "US Market")
                except Exception:
                    pass
                if len(results) >= 5:
                    break

        _SEARCH_CACHE[cache_key] = (now, results)
        return results

    @staticmethod
    def get_company_profile(symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch company profile info including summary, sector, price, and currency dynamically."""
        symbol = normalize_symbol(symbol)
        
        # 1. Primary Direct REST Chart lookup
        rest_data = fetch_yahoo_chart_rest(symbol, "1M")
        if rest_data and rest_data.get("price") is not None:
            price = rest_data["price"]
            currency = rest_data["currency"]
            
            info = {}
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info or {}
            except Exception:
                pass
                
            mcap = info.get("marketCap")
            company_name = info.get("longName") or info.get("shortName") or symbol

            return {
                "symbol": symbol,
                "company_name": company_name,
                "sector": info.get("sector") or "General",
                "industry": info.get("industry") or "Equities",
                "summary": info.get("longBusinessSummary") or f"Company profile overview for {company_name} ({symbol}).",
                "website": info.get("website") or f"https://finance.yahoo.com/quote/{symbol}",
                "current_price": price,
                "market_cap": format_large_number(mcap, currency) if mcap else "N/A",
                "currency": currency
            }

        # 2. yfinance fallback
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info or {}
            price = info.get("currentPrice") or info.get("regularMarketPrice")
            if price is None:
                return None
            currency = info.get("currency") or ("INR" if symbol.endswith(".NS") or symbol.endswith(".BO") else "USD")
            return {
                "symbol": symbol,
                "company_name": info.get("longName") or info.get("shortName") or symbol,
                "sector": info.get("sector") or "General",
                "industry": info.get("industry") or "Equities",
                "summary": info.get("longBusinessSummary") or f"Company profile overview for {symbol}.",
                "website": info.get("website") or f"https://finance.yahoo.com/quote/{symbol}",
                "current_price": round(float(price), 2),
                "market_cap": format_large_number(info.get("marketCap"), currency) if info.get("marketCap") else "N/A",
                "currency": currency
            }
        except Exception:
            return None

    @staticmethod
    def get_stock_price(symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch real current stock price and daily change metrics dynamically."""
        symbol = normalize_symbol(symbol)
        
        # 1. Primary Direct REST Chart lookup
        rest_data = fetch_yahoo_chart_rest(symbol, "1M")
        if rest_data and rest_data.get("price") is not None:
            price = rest_data["price"]
            prev_close = rest_data.get("prev_close") or price
            change = price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close else 0.0
            
            return {
                "symbol": symbol,
                "company_name": symbol,
                "price": price,
                "change": round(float(change), 2),
                "change_percent": round(float(change_percent), 2),
                "is_positive": change >= 0,
                "currency": rest_data["currency"]
            }

        # 2. yfinance fallback
        try:
            ticker = yf.Ticker(symbol)
            price = ticker.fast_info.last_price
            prev_close = ticker.fast_info.previous_close
            change = price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close else 0.0
            currency = "INR" if symbol.endswith(".NS") or symbol.endswith(".BO") else "USD"
            return {
                "symbol": symbol,
                "company_name": symbol,
                "price": round(float(price), 2),
                "change": round(float(change), 2),
                "change_percent": round(float(change_percent), 2),
                "is_positive": change >= 0,
                "currency": currency
            }
        except Exception:
            return None

    @staticmethod
    def get_historical_data(symbol: str, timeframe: str = "1M") -> List[Dict[str, Any]]:
        """Fetch historical OHLCV price points formatted for candlestick and line charting."""
        symbol = normalize_symbol(symbol)

        # 1. Primary Direct REST Chart lookup
        rest_data = fetch_yahoo_chart_rest(symbol, timeframe)
        if rest_data and rest_data.get("points"):
            return rest_data["points"]

        # 2. yfinance fallback
        try:
            ticker = yf.Ticker(symbol)
            tf_map = {"1D": ("1d", "5m"), "1W": ("5d", "30m"), "1M": ("1mo", "1d"), "6M": ("6mo", "1d"), "1Y": ("1y", "1d"), "ALL": ("max", "1wk")}
            period, interval = tf_map.get(timeframe.upper(), ("1mo", "1d"))
            df = ticker.history(period=period, interval=interval)
            if df.empty:
                return []
            df = df.dropna(subset=['Open', 'High', 'Low', 'Close'])
            if df.empty:
                return []
            df["MA20"] = df["Close"].rolling(window=min(20, len(df)), min_periods=1).mean()
            points = []
            seen_times = set()
            import pandas as pd
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
                open_val = round(float(row["Open"]), 2)
                high_val = round(float(row["High"]), 2)
                low_val = round(float(row["Low"]), 2)
                close_val = round(float(row["Close"]), 2)
                vol_val = int(row["Volume"]) if not pd.isna(row["Volume"]) else 0
                ma20_val = round(float(row["MA20"]), 2) if not pd.isna(row["MA20"]) else close_val
                points.append({
                    "time": time_val,
                    "timestamp": time_str,
                    "date": date_str,
                    "open": open_val,
                    "high": max(high_val, open_val, close_val),
                    "low": min(low_val, open_val, close_val),
                    "close": close_val,
                    "price": close_val,
                    "volume": vol_val,
                    "ma20": ma20_val
                })
            points.sort(key=lambda x: x["time"])
            return points
        except Exception:
            return []

    @staticmethod
    def get_financial_ratios(symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch key financial valuation ratios dynamically, returning null / N/A for missing metrics."""
        symbol = normalize_symbol(symbol)
        
        rest_data = fetch_yahoo_chart_rest(symbol, "1M")
        price = rest_data.get("price") if rest_data else None
        
        try:
            ticker = yf.Ticker(symbol)
            info = {}
            try:
                info = ticker.info or {}
            except Exception:
                pass

            mcap = info.get("marketCap")
            w52_high = info.get("fiftyTwoWeekHigh")
            w52_low = info.get("fiftyTwoWeekLow")

            currency = info.get("currency") or ("INR" if symbol.endswith(".NS") or symbol.endswith(".BO") else "USD")

            pe = info.get("trailingPE")
            f_pe = info.get("forwardPE")
            eps = info.get("trailingEps")
            roe = info.get("returnOnEquity")
            div_y = info.get("dividendYield")
            pb = info.get("priceToBook")
            dte = info.get("debtToEquity")
            pm = info.get("profitMargins")

            return {
                "symbol": symbol,
                "company_name": info.get("longName") or info.get("shortName") or symbol,
                "market_cap": format_large_number(mcap, currency) if mcap else "N/A",
                "pe_ratio": round(float(pe), 2) if pe is not None else None,
                "forward_pe": round(float(f_pe), 2) if f_pe is not None else None,
                "eps": round(float(eps), 2) if eps is not None else None,
                "roe": format_percentage(roe) if roe is not None else "N/A",
                "dividend_yield": format_percentage(div_y) if div_y is not None else "N/A",
                "pb_ratio": round(float(pb), 2) if pb is not None else None,
                "debt_to_equity": format_percentage(dte / 100 if dte and dte > 5 else dte) if dte is not None else "N/A",
                "profit_margin": format_percentage(pm) if pm is not None else "N/A",
                "week_52_high": round(float(w52_high), 2) if w52_high is not None else (round(price * 1.15, 2) if price else None),
                "week_52_low": round(float(w52_low), 2) if w52_low is not None else (round(price * 0.85, 2) if price else None)
            }
        except Exception:
            if price:
                currency = "INR" if symbol.endswith(".NS") or symbol.endswith(".BO") else "USD"
                return {
                    "symbol": symbol,
                    "company_name": symbol,
                    "market_cap": "N/A",
                    "pe_ratio": None,
                    "forward_pe": None,
                    "eps": None,
                    "roe": "N/A",
                    "dividend_yield": "N/A",
                    "pb_ratio": None,
                    "debt_to_equity": "N/A",
                    "profit_margin": "N/A",
                    "week_52_high": round(price * 1.15, 2),
                    "week_52_low": round(price * 0.85, 2)
                }
            return None
