from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services import market_data

router = APIRouter()

@router.get("/indices", response_model=List[Dict[str, Any]])
async def get_indices():
    """
    Get current market data for major Indian Indices (SENSEX, NIFTY 50, BANK NIFTY).
    """
    try:
        data = await market_data.fetch_indices()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching indices: {str(e)}")

@router.get("/sectors", response_model=List[Dict[str, Any]])
async def get_sectors():
    """
    Get current market data for sectoral indices.
    """
    try:
        data = await market_data.fetch_sectors()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sectors: {str(e)}")

@router.get("/top-performers", response_model=List[Dict[str, Any]])
async def get_top_performers():
    """
    Get top performing large cap stocks.
    """
    try:
        data = await market_data.fetch_top_performers()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching top performers: {str(e)}")

@router.get("/heatmap", response_model=List[Dict[str, Any]])
async def get_heatmap_data():
    """
    Get components for the market heatmap.
    """
    try:
        data = await market_data.fetch_heatmap_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching heatmap data: {str(e)}")

@router.get("/status", response_model=Dict[str, Any])
async def get_market_status():
    """
    Get current Indian market open/close status in IST.
    """
    try:
        data = await market_data.fetch_market_status()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market status: {str(e)}")

@router.get("/currency", response_model=List[Dict[str, Any]])
async def get_currency():
    """
    Get current INR forex rates.
    """
    try:
        data = await market_data.fetch_currencies()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching currencies: {str(e)}")

@router.get("/breadth", response_model=Dict[str, Any])
async def get_market_breadth():
    """
    Get market breadth (advancing/declining).
    """
    try:
        data = await market_data.fetch_market_breadth()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market breadth: {str(e)}")

@router.get("/data-status")
async def get_data_status():
    """
    Health check for the data provider.
    """
@router.get("/large-cap", response_model=List[Dict[str, Any]])
async def get_large_cap():
    try:
        data = await market_data.fetch_large_cap()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mid-cap", response_model=List[Dict[str, Any]])
async def get_mid_cap():
    try:
        data = await market_data.fetch_mid_cap()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/small-cap", response_model=List[Dict[str, Any]])
async def get_small_cap():
    try:
        data = await market_data.fetch_small_cap()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
