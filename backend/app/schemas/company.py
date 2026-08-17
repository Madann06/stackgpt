from typing import List, Optional, Any
from pydantic import BaseModel


class CompanySearchResult(BaseModel):
    symbol: str
    company_name: str
    sector: Optional[str] = "Technology"
    industry: Optional[str] = None
    exchange: Optional[str] = None
    current_price: Optional[float] = None
    change: Optional[float] = None
    change_percent: Optional[float] = None
    is_positive: Optional[bool] = True


class CompanyProfile(BaseModel):
    symbol: str
    company_name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    summary: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    current_price: Optional[float] = None
    market_cap: Optional[str] = None
    currency: Optional[str] = "USD"


class StockPriceResponse(BaseModel):
    symbol: str
    company_name: str
    price: float
    change: float
    change_percent: float
    is_positive: bool
    currency: str = "USD"


class HistoricalPricePoint(BaseModel):
    timestamp: str
    price: float
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: Optional[float] = None
    volume: Optional[int] = None
    ma20: Optional[float] = None


class HistoricalDataResponse(BaseModel):
    symbol: str
    timeframe: str
    data: List[HistoricalPricePoint]


class FinancialRatiosResponse(BaseModel):
    symbol: str
    company_name: str
    market_cap: Optional[str] = "N/A"
    pe_ratio: Optional[float] = None
    forward_pe: Optional[float] = None
    eps: Optional[float] = None
    roe: Optional[str] = "N/A"
    dividend_yield: Optional[str] = "N/A"
    pb_ratio: Optional[float] = None
    debt_to_equity: Optional[str] = "N/A"
    profit_margin: Optional[str] = "N/A"
    week_52_high: Optional[float] = None
    week_52_low: Optional[float] = None


class StockAnalysisRequest(BaseModel):
    symbol: str
    investment_duration: str


class PriceTargetSchema(BaseModel):
    low: float
    base: float
    high: float
    total_analysts: Optional[int] = 35


class HistoricalAnalysisSchema(BaseModel):
    sample_size: int
    profitable: int
    losses: int
    win_rate: Optional[float] = None
    average_return: float
    median_return: float
    max_return: Optional[float] = 0.0
    max_loss: Optional[float] = 0.0
    reliability: str
    horizon_days: int
    status_message: str = "SUCCESS"


class RiskBreakdownSchema(BaseModel):
    volatility: str
    financialHealth: str
    macroSensitivity: str
    regulatoryRisk: str


class StockAnalysisResponse(BaseModel):
    symbol: str
    duration: str
    duration_label: str
    recommendation: str
    recommendation_score: float
    estimated_profit_probability: Optional[float] = None
    risk_score: int
    risk_level: str
    expected_return: float
    current_price: float
    currency: str = "USD"
    price_target: PriceTargetSchema
    historical_analysis: HistoricalAnalysisSchema
    risk_breakdown: RiskBreakdownSchema
    ai_summary: str
    ai_bullish_factors: List[str]
    ai_bearish_factors: List[str]

