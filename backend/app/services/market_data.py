import yfinance as yf
from cachetools import TTLCache
import time
import asyncio
from typing import Dict, List, Any
from datetime import datetime, timedelta

# Cache for market data (TTL 5 minutes to avoid rate limits)
market_cache = TTLCache(maxsize=200, ttl=300)

INDIAN_INDICES = {
    "^BSESN": "SENSEX",
    "^NSEI": "NIFTY 50",
    "^NSEBANK": "BANK NIFTY",
    "^CNXIT": "NIFTY IT",
    "^CNXAUTO": "NIFTY AUTO",
    "^CNXPHARMA": "NIFTY PHARMA",
    "^CNXFMCG": "NIFTY FMCG",
    "^CRSLDX": "NIFTY MIDCAP 50",
    "^CNXSC": "NIFTY SMALLCAP 50"
}

def get_ticker_quote_sync(symbol: str) -> Dict[str, Any]:
    """Fetch basic quote data for a single symbol using yfinance."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Determine status
        status = "CACHED" if symbol in market_cache else "DELAYED"
        
        current_price = info.get("currentPrice") or info.get("regularMarketPrice")
        previous_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
        
        if current_price is None or previous_close is None:
            # Try getting fast history if info is missing
            hist = ticker.history(period="2d")
            if not hist.empty and len(hist) >= 1:
                current_price = float(hist['Close'].iloc[-1])
                if len(hist) > 1:
                    previous_close = float(hist['Close'].iloc[-2])
                else:
                    previous_close = current_price
            else:
                raise ValueError(f"No price data available for {symbol}")

        change = current_price - previous_close
        change_percent = (change / previous_close) * 100 if previous_close else 0.0

        return {
            "symbol": symbol,
            "name": INDIAN_INDICES.get(symbol, info.get("shortName", symbol)),
            "current_price": round(current_price, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "open": round(info.get("open") or info.get("regularMarketOpen") or current_price, 2),
            "high": round(info.get("dayHigh") or info.get("regularMarketDayHigh") or current_price, 2),
            "low": round(info.get("dayLow") or info.get("regularMarketDayLow") or current_price, 2),
            "week_52_high": round(info.get("fiftyTwoWeekHigh") or current_price, 2),
            "week_52_low": round(info.get("fiftyTwoWeekLow") or current_price, 2),
            "volume": info.get("volume") or info.get("regularMarketVolume") or 0,
            "market_cap": info.get("marketCap") or 0,
            "pe_ratio": info.get("trailingPE") or info.get("forwardPE"),
            "pb_ratio": info.get("priceToBook"),
            "roe": info.get("returnOnEquity"),
            "roce": info.get("returnOnEquity"), # Approximating ROCE if missing
            "debt_to_equity": info.get("debtToEquity"),
            "revenue_growth": info.get("revenueGrowth"),
            "profit_growth": info.get("earningsGrowth"),
            "dividend_yield": info.get("dividendYield"),
            "sector": info.get("sector") or "Unknown",
            "industry": info.get("industry") or "Unknown",
            "exchange": info.get("exchange") or "NSE",
            "status": status,
            "timestamp": int(time.time()),
            "source": "yfinance"
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return {
            "symbol": symbol,
            "name": INDIAN_INDICES.get(symbol, symbol),
            "current_price": 0.0,
            "change": 0.0,
            "change_percent": 0.0,
            "open": 0.0,
            "high": 0.0,
            "low": 0.0,
            "week_52_high": 0.0,
            "week_52_low": 0.0,
            "volume": 0,
            "market_cap": 0,
            "pe_ratio": None,
            "pb_ratio": None,
            "roe": None,
            "roce": None,
            "debt_to_equity": None,
            "revenue_growth": None,
            "profit_growth": None,
            "dividend_yield": None,
            "sector": "Unknown",
            "industry": "Unknown",
            "exchange": "Unknown",
            "status": "DATA UNAVAILABLE",
            "timestamp": int(time.time()),
            "source": "Unknown"
        }

async def fetch_indices() -> List[Dict[str, Any]]:
    """Fetch major Indian indices."""
    symbols = ["^BSESN", "^NSEI", "^NSEBANK", "^CNXIT", "^CNXAUTO", "^CNXPHARMA", "^CNXFMCG", "^CRSLDX", "^CNXSC"]
    results = []
    for symbol in symbols:
        if symbol in market_cache:
            results.append(market_cache[symbol])
            continue
            
        data = await asyncio.to_thread(get_ticker_quote_sync, symbol)
        market_cache[symbol] = data
        results.append(data)
        
    return results

async def fetch_currencies() -> List[Dict[str, Any]]:
    """Fetch real-time forex quotes against INR."""
    pairs = {
        "USDINR=X": "USD/INR",
        "EURINR=X": "EUR/INR",
        "GBPINR=X": "GBP/INR",
        "JPYINR=X": "JPY/INR"
    }
    results = []
    for symbol, name in pairs.items():
        if symbol in market_cache:
            results.append(market_cache[symbol])
            continue
            
        data = await asyncio.to_thread(get_ticker_quote_sync, symbol)
        data["name"] = name
        market_cache[symbol] = data
        results.append(data)
        
    return results

async def fetch_market_status() -> Dict[str, Any]:
    """Determine if Indian market is open based on IST time."""
    # Convert UTC to IST (+5:30)
    now_utc = datetime.utcnow()
    ist_time = now_utc + timedelta(hours=5, minutes=30)
    
    is_weekday = ist_time.weekday() < 5 # 0-4 is Mon-Fri
    
    # Time in minutes for easier comparison
    current_minutes = ist_time.hour * 60 + ist_time.minute
    open_minutes = 9 * 60 + 15  # 09:15
    close_minutes = 15 * 60 + 30 # 15:30
    
    is_open = is_weekday and (open_minutes <= current_minutes <= close_minutes)
    
    # Note: A real implementation would query an API for NSE holidays.
    # We fallback to basic weekday/time logic here.
    
    return {
        "status": "MARKET OPEN" if is_open else "MARKET CLOSED",
        "ist_time": ist_time.strftime("%d %b %Y %H:%M IST"),
        "timestamp": int(ist_time.timestamp())
    }

async def fetch_market_breadth() -> Dict[str, Any]:
    """Calculate market breadth using a subset of top Nifty 50 constituents."""
    # True market breadth requires scanning all 2000+ NSE stocks, which is too slow for yfinance.
    # We use a reliable subset of 20 Nifty 50 stocks as a proxy.
    basket = [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", 
        "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "LT.NS", "HINDUNILVR.NS",
        "AXISBANK.NS", "BAJFINANCE.NS", "MARUTI.NS", "KOTAKBANK.NS", "TATAMOTORS.NS",
        "SUNPHARMA.NS", "TITAN.NS", "M&M.NS", "ULTRACEMCO.NS", "NTPC.NS"
    ]
    
    advancing = 0
    declining = 0
    unchanged = 0
    
    valid_count = 0
    
    for symbol in basket:
        data = market_cache.get(symbol)
        if not data:
            data = await asyncio.to_thread(get_ticker_quote_sync, symbol)
            # Only cache valid data
            if data["status"] != "DATA UNAVAILABLE":
                market_cache[symbol] = data
                
        if data["status"] != "DATA UNAVAILABLE":
            valid_count += 1
            if data["change"] > 0:
                advancing += 1
            elif data["change"] < 0:
                declining += 1
            else:
                unchanged += 1
                
    if valid_count < 10:
        return {
            "status": "Verified data unavailable"
        }
        
    return {
        "status": "Available",
        "advancing": advancing,
        "declining": declining,
        "unchanged": unchanged,
        "sample_size": valid_count
    }

async def fetch_sectors() -> List[Dict[str, Any]]:
    """Fetch major Indian sectoral indices."""
    symbols = ["^CNXIT", "^CNXAUTO", "^CNXPHARMA", "^CNXFMCG", "^CRSLDX"]
    results = []
    for symbol in symbols:
        if symbol in market_cache:
            results.append(market_cache[symbol])
            continue
            
        data = await asyncio.to_thread(get_ticker_quote_sync, symbol)
        market_cache[symbol] = data
        results.append(data)
        
    return results

async def fetch_top_performers() -> List[Dict[str, Any]]:
    basket = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "LT.NS"]
    results = []
    for symbol in basket:
        if symbol in market_cache:
            results.append(market_cache[symbol])
            continue
            
        data = await asyncio.to_thread(get_ticker_quote_sync, symbol)
        market_cache[symbol] = data
        results.append(data)
    
    results.sort(key=lambda x: x["change_percent"], reverse=True)
    return results

async def fetch_heatmap_data() -> List[Dict[str, Any]]:
    basket = [
        {"symbol": "RELIANCE.NS", "sector": "Energy"},
        {"symbol": "TCS.NS", "sector": "IT"},
        {"symbol": "HDFCBANK.NS", "sector": "Financials"},
        {"symbol": "INFY.NS", "sector": "IT"},
        {"symbol": "ITC.NS", "sector": "FMCG"}
    ]
    
    results = []
    for item in basket:
        sym = item["symbol"]
        data = market_cache.get(sym)
        if not data:
            data = await asyncio.to_thread(get_ticker_quote_sync, sym)
            if data["status"] != "DATA UNAVAILABLE":
                market_cache[sym] = data
            
        results.append({
            "symbol": sym,
            "name": data["name"],
            "sector": item["sector"],
            "change_percent": data["change_percent"],
            "status": data["status"]
        })
        
    return results

async def fetch_large_cap() -> List[Dict[str, Any]]:
    basket = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "LT.NS", "BAJFINANCE.NS", "MARUTI.NS", "AXISBANK.NS", "KOTAKBANK.NS", "HINDUNILVR.NS", "TITAN.NS"]
    results = []
    for symbol in basket:
        if symbol in market_cache:
            results.append(market_cache[symbol])
            continue
        data = await asyncio.to_thread(get_ticker_quote_sync, symbol)
        market_cache[symbol] = data
        results.append(data)
    return results

async def fetch_mid_cap() -> List[Dict[str, Any]]:
    basket = ["TVSMOTOR.NS", "AUBANK.NS", "FEDERALBNK.NS", "MRF.NS", "CUMMINSIND.NS", "VOLTAS.NS", "ASHOKLEY.NS", "IDFCFIRSTB.NS", "HINDPETRO.NS", "JUBLFOOD.NS"]
    results = []
    for symbol in basket:
        if symbol in market_cache:
            results.append(market_cache[symbol])
            continue
        data = await asyncio.to_thread(get_ticker_quote_sync, symbol)
        market_cache[symbol] = data
        results.append(data)
    return results

async def fetch_small_cap() -> List[Dict[str, Any]]:
    basket = ["SUZLON.NS", "IRB.NS", "WELSPUNIND.NS", "BSE.NS", "CDSL.NS", "CAMS.NS", "RITES.NS", "RVNL.NS", "ANGELONE.NS", "EQUITASBNK.NS"]
    results = []
    for symbol in basket:
        if symbol in market_cache:
            results.append(market_cache[symbol])
            continue
        data = await asyncio.to_thread(get_ticker_quote_sync, symbol)
        market_cache[symbol] = data
        results.append(data)
    return results
