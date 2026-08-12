from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Question about the stock or uploaded financial annual report")
    document_id: Optional[int] = Field(default=None, description="Optional document ID filter to scope RAG search")
    symbol: Optional[str] = Field(default="AAPL", description="Stock symbol for context")
    document_mode: bool = Field(default=False, description="Toggle Document Mode ON/OFF")
    conversation_history: Optional[List[Dict[str, Any]]] = Field(default=[], description="Multi-turn conversation context")


class CitationItem(BaseModel):
    source_number: int
    filename: str
    page_number: int
    snippet: str


class SWOTAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]


class ConfidenceBreakdown(BaseModel):
    financial_health: float = 85.0
    news_sentiment: float = 88.0
    technical_indicators: float = 82.0
    annual_report_rag: float = 90.0
    gpt_consistency: float = 92.0


class SourceItem(BaseModel):
    title: str
    url: str
    source: str
    snippet: Optional[str] = None


class ChatQueryResponse(BaseModel):
    query: str
    answer: str
    recommendation: Optional[str] = None
    ai_confidence: Optional[float] = None
    conviction_label: Optional[str] = None
    risk_score: Optional[int] = None
    swot: Optional[SWOTAnalysis] = None
    citations: List[CitationItem] = []
    sources: List[SourceItem] = []
    financial_data_used: bool = False
    web_search_used: bool = False
    confidence_breakdown: Optional[Any] = None
    document_mode: bool = False



