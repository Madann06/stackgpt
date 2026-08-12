from typing import Any, List
from fastapi import APIRouter, Query, HTTPException, status

from app.schemas.company import (
    CompanySearchResult,
    CompanyProfile,
    StockPriceResponse,
    HistoricalDataResponse,
    FinancialRatiosResponse,
    StockAnalysisRequest,
    StockAnalysisResponse
)
from app.services.yahoo_finance import YahooFinanceService
from app.services.confidence_engine import ConfidenceScoringEngine
from app.services.stock_analyzer import StockAnalyzerService

router = APIRouter()


@router.get("/search", response_model=List[CompanySearchResult])
def search_company(
    query: str = Query(..., min_length=1, description="Company symbol or name to search (e.g. AAPL, Tesla)")
) -> Any:
    """Search companies by symbol or name."""
    results = YahooFinanceService.search_company(query)
    return results


@router.get("/profile/{symbol}", response_model=CompanyProfile)
def get_company_profile(symbol: str) -> Any:
    """Get company profile overview, sector, summary, and market cap."""
    profile = YahooFinanceService.get_company_profile(symbol)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company profile for '{symbol}' not found."
        )
    return profile


@router.get("/price/{symbol}", response_model=StockPriceResponse)
def get_stock_price(symbol: str) -> Any:
    """Get current stock price, daily gain/loss, and change percentage."""
    price_data = YahooFinanceService.get_stock_price(symbol)
    return price_data


@router.get("/history/{symbol}", response_model=HistoricalDataResponse)
def get_historical_data(
    symbol: str,
    timeframe: str = Query("1M", description="Chart timeframe: 1D, 1W, 1M, 6M, 1Y, ALL")
) -> Any:
    """Get historical OHLCV chart data and 20 Moving Average for stock ticker."""
    points = YahooFinanceService.get_historical_data(symbol, timeframe)
    return {
        "symbol": symbol.upper(),
        "timeframe": timeframe.upper(),
        "data": points
    }


@router.get("/ratios/{symbol}", response_model=FinancialRatiosResponse)
def get_financial_ratios(symbol: str) -> Any:
    """Get key financial valuation ratios (P/E, EPS, ROE, Market Cap, Div Yield, 52W High/Low)."""
    ratios = YahooFinanceService.get_financial_ratios(symbol)
    return ratios


@router.get("/confidence/{symbol}")
def get_confidence_score(
    symbol: str,
    time_horizon: int = Query(30, description="Trading days prediction horizon: 5, 10, 30, 60, 90")
) -> Any:
    """Calculate empirical historical profit probability and backtest metrics via KNN similarity."""
    result = ConfidenceScoringEngine.compute_composite_confidence(
        symbol=symbol,
        time_horizon_days=time_horizon
    )
    return {
        "symbol": symbol.upper(),
        **result
    }


@router.post("/analyze", response_model=StockAnalysisResponse)
def analyze_stock_post(req: StockAnalysisRequest) -> Any:
    """
    Perform duration-dependent stock prediction, risk profiling, win-rate backtest,
    price target modeling, and AI thesis generation based strictly on investment duration.
    """
    analysis = StockAnalyzerService.analyze_stock(
        symbol=req.symbol,
        duration=req.investment_duration
    )
    return analysis


@router.get("/analyze", response_model=StockAnalysisResponse)
def analyze_stock_get(
    symbol: str = Query(..., description="Stock symbol, e.g. CIPLA.NS, AAPL, TSLA"),
    investment_duration: str = Query("1-3-months", description="Selected duration: intraday, 1-5-days, 1-4-weeks, 1-3-months, 3-12-months, 1-3-years, 3-plus-years")
) -> Any:
    """
    GET endpoint variant to perform duration-dependent stock analysis.
    """
    analysis = StockAnalyzerService.analyze_stock(
        symbol=symbol,
        duration=investment_duration
    )
    return analysis


