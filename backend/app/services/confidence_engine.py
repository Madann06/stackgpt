import math
from typing import List, Dict, Any, Optional
from app.services.profit_backtester import HistoricalProfitBacktester


class ConfidenceScoringEngine:
    """
    Quantitative AI Profit Probability & Backtesting Engine Interface.
    Delegates to HistoricalProfitBacktester for empirical backtest calculation.
    """

    @classmethod
    def compute_composite_confidence(
        cls,
        symbol: str,
        time_horizon_days: int = 30,
        ratios: Optional[Dict[str, Any]] = None,
        historical_data: Optional[List[Dict[str, Any]]] = None,
        context_chunks: Optional[List[Dict[str, Any]]] = None,
        recommendation: str = "BUY",
        answer_text: str = ""
    ) -> Dict[str, Any]:
        """
        Computes empirical historical profit probability and backtesting breakdown metrics.
        """
        backtest_res = HistoricalProfitBacktester.compute_historical_profit_probability(
            symbol=symbol,
            time_horizon_days=time_horizon_days
        )

        profit_prob = backtest_res.get("profit_probability")
        # Legacy compatibility key mapped to profit probability
        ai_confidence = profit_prob if profit_prob is not None else 0

        return {
            "symbol": symbol.upper(),
            "ai_confidence": ai_confidence,
            "profit_probability": profit_prob,
            "time_horizon_days": backtest_res.get("time_horizon_days", time_horizon_days),
            "historical_samples": backtest_res.get("historical_samples", 0),
            "profitable_samples": backtest_res.get("profitable_samples", 0),
            "loss_samples": backtest_res.get("loss_samples", 0),
            "average_return": backtest_res.get("average_return", 0.0),
            "median_return": backtest_res.get("median_return", 0.0),
            "reliability": backtest_res.get("reliability", "INSUFFICIENT_DATA"),
            "conviction_label": backtest_res.get("reliability", "INSUFFICIENT_DATA"),
            "recommendation": backtest_res.get("recommendation", "HOLD"),
            "methodology": "Historical similarity backtest",
            "status_message": backtest_res.get("status_message", "SUCCESS"),
            "observations_log": backtest_res.get("observations_log", [])
        }

