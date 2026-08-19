from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.services import mutual_funds_data

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
@router.get("/", response_model=List[Dict[str, Any]])
async def get_mutual_funds(
    category: Optional[str] = Query("ALL", description="Fund category filter: Flexi Cap, Small Cap, Mid Cap, Large Cap, Index Fund, ALL"),
    search: Optional[str] = Query("", description="Search term for name, AMC, or category")
) -> Any:
    """Fetch mutual funds matching category and optional search term."""
    try:
        funds = await mutual_funds_data.get_all_mutual_funds(category=category, search_query=search)
        return funds
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/similar/{fund_id}", response_model=List[Dict[str, Any]])
async def get_similar_funds(fund_id: str) -> Any:
    """Fetch similar funds belonging to the same category."""
    try:
        funds = await mutual_funds_data.get_similar_funds(fund_id)
        return funds
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{fund_id}", response_model=Dict[str, Any])
async def get_mutual_fund_details(fund_id: str) -> Any:
    """Fetch comprehensive mutual fund intelligence, holdings, risk, and performance data."""
    fund = await mutual_funds_data.get_mutual_fund_by_id(fund_id)
    if not fund:
        raise HTTPException(status_code=404, detail=f"Mutual fund '{fund_id}' not found.")
    return fund

@router.get("/{fund_id}/holdings")
async def get_fund_holdings(fund_id: str) -> Any:
    """Fetch underlying stock portfolio holdings for mutual fund."""
    fund = await mutual_funds_data.get_mutual_fund_by_id(fund_id)
    if not fund or "holdings" not in fund:
        return {"holdings": [], "message": "Verified portfolio holdings unavailable from the configured data provider."}
    return {"holdings": fund["holdings"], "fund_id": fund_id}

@router.get("/{fund_id}/sectors")
async def get_fund_sectors(fund_id: str) -> Any:
    """Fetch sector allocation breakdown for mutual fund."""
    fund = await mutual_funds_data.get_mutual_fund_by_id(fund_id)
    if not fund or "sector_allocation" not in fund:
        return {"sector_allocation": [], "message": "Verified sector allocation unavailable."}
    return {"sector_allocation": fund["sector_allocation"], "fund_id": fund_id}

@router.get("/{fund_id}/performance")
async def get_fund_performance(fund_id: str) -> Any:
    """Fetch historical NAV performance charts."""
    fund = await mutual_funds_data.get_mutual_fund_by_id(fund_id)
    if not fund or "performance" not in fund:
        return {"performance": {}, "message": "Verified performance data unavailable."}
    return {"performance": fund["performance"], "fund_id": fund_id}

@router.get("/{fund_id}/risk")
async def get_fund_risk(fund_id: str) -> Any:
    """Fetch risk and volatility metrics (Sharpe, Beta, Std Dev)."""
    fund = await mutual_funds_data.get_mutual_fund_by_id(fund_id)
    if not fund or "risk_analysis" not in fund:
        return {"risk_analysis": {}, "message": "Verified risk metrics unavailable."}
    return {"risk_analysis": fund["risk_analysis"], "fund_id": fund_id}
