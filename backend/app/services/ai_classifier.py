import yfinance as yf
from cachetools import TTLCache
import time
import asyncio
from typing import Dict, Any

# Cache for AI Classifier (TTL 15 minutes)
classifier_cache = TTLCache(maxsize=200, ttl=900)

def calculate_ai_signal_sync(symbol: str) -> Dict[str, Any]:
    """Generates an explainable AI Research Signal based on fundamental and technical factors."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # If no basic price data, fail early
        current_price = info.get("currentPrice") or info.get("regularMarketPrice")
        if not current_price:
            raise ValueError("Insufficient pricing data")

        # Extract Fundamental Factors
        revenue_growth = info.get("revenueGrowth")
        profit_margins = info.get("profitMargins")
        operating_margins = info.get("operatingMargins")
        roe = info.get("returnOnEquity")
        pe_ratio = info.get("trailingPE") or info.get("forwardPE")
        pb_ratio = info.get("priceToBook")
        debt_to_equity = info.get("debtToEquity")
        dividend_yield = info.get("dividendYield")
        
        # Extract Technical Factors
        fifty_day_avg = info.get("fiftyDayAverage")
        two_hundred_day_avg = info.get("twoHundredDayAverage")
        week_52_high = info.get("fiftyTwoWeekHigh")
        week_52_low = info.get("fiftyTwoWeekLow")

        # We must have at least some fundamental data to generate a real score
        if roe is None and pe_ratio is None and revenue_growth is None:
            return generate_insufficient_data(symbol)

        score = 50 # Base neutral score
        bullish_factors = []
        bearish_factors = []
        
        # 1. Growth (Revenue & Profit)
        if revenue_growth:
            if revenue_growth > 0.15:
                score += 10
                bullish_factors.append(f"Strong revenue growth ({revenue_growth*100:.1f}%)")
            elif revenue_growth < 0:
                score -= 10
                bearish_factors.append(f"Negative revenue growth ({revenue_growth*100:.1f}%)")

        if profit_margins and profit_margins > 0.10:
            score += 5
            bullish_factors.append(f"Healthy net profit margins ({profit_margins*100:.1f}%)")
            
        # 2. Efficiency (ROE/ROCE)
        if roe:
            if roe > 0.15:
                score += 15
                bullish_factors.append(f"Excellent Return on Equity ({roe*100:.1f}%)")
            elif roe < 0.05:
                score -= 10
                bearish_factors.append(f"Weak Return on Equity ({roe*100:.1f}%)")

        # 3. Valuation (P/E & P/B)
        if pe_ratio:
            if pe_ratio < 15:
                score += 10
                bullish_factors.append(f"Attractive valuation (P/E: {pe_ratio:.1f})")
            elif pe_ratio > 40:
                score -= 10
                bearish_factors.append(f"High valuation premium (P/E: {pe_ratio:.1f})")

        # 4. Risk (Debt)
        if debt_to_equity:
            if debt_to_equity > 150:
                score -= 15
                bearish_factors.append(f"High leverage (Debt/Equity: {debt_to_equity:.1f})")
            elif debt_to_equity < 50:
                score += 5
                bullish_factors.append("Strong balance sheet (Low Debt)")

        # 5. Technicals
        if fifty_day_avg and two_hundred_day_avg:
            if current_price > fifty_day_avg and fifty_day_avg > two_hundred_day_avg:
                score += 10
                bullish_factors.append("Strong technical momentum (Price > 50 DMA > 200 DMA)")
            elif current_price < two_hundred_day_avg:
                score -= 5
                bearish_factors.append("Weak technical trend (Price < 200 DMA)")

        # 6. Dividends
        if dividend_yield and dividend_yield > 0.02:
            score += 5
            bullish_factors.append(f"Solid dividend yield ({dividend_yield*100:.1f}%)")

        # Clamp score between 0 and 100
        score = max(0, min(100, score))

        # Determine Signal Category
        if score >= 80:
            signal = "STRONG POSITIVE"
        elif score >= 60:
            signal = "POSITIVE"
        elif score >= 40:
            signal = "NEUTRAL"
        elif score >= 20:
            signal = "NEGATIVE"
        else:
            signal = "STRONG NEGATIVE"
            
        return {
            "symbol": symbol,
            "signal": signal,
            "score": score,
            "confidence": "HIGH" if len(bullish_factors) + len(bearish_factors) >= 5 else "MEDIUM",
            "bullish_factors": bullish_factors,
            "bearish_factors": bearish_factors,
            "status": "CACHED",
            "timestamp": int(time.time()),
            "source": "yfinance"
        }

    except Exception as e:
        print(f"Classifier error for {symbol}: {e}")
        return generate_insufficient_data(symbol)

def generate_insufficient_data(symbol: str) -> Dict[str, Any]:
    return {
        "symbol": symbol,
        "signal": "INSUFFICIENT DATA",
        "score": None,
        "confidence": "LOW",
        "bullish_factors": [],
        "bearish_factors": [],
        "message": "Not enough verified data is available to generate a reliable research signal.",
        "status": "DATA UNAVAILABLE",
        "timestamp": int(time.time()),
        "source": "Unknown"
    }

async def fetch_classifier_signal(symbol: str) -> Dict[str, Any]:
    if symbol in classifier_cache:
        return classifier_cache[symbol]
        
    data = await asyncio.to_thread(calculate_ai_signal_sync, symbol)
    classifier_cache[symbol] = data
    return data
