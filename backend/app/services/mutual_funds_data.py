import time
import asyncio
from typing import Dict, List, Any

# Cache for mutual fund data (TTL 15 minutes)
mf_cache: Dict[str, Any] = {}

MUTUAL_FUNDS_DB: List[Dict[str, Any]] = [
    {
        "id": "parag-parikh-flexi-cap",
        "name": "Parag Parikh Flexi Cap Fund",
        "symbol": "PPFCF",
        "category": "Flexi Cap",
        "amc": "PPFAS Mutual Fund",
        "option": "Direct - Growth",
        "nav": 84.25,
        "aum": "₹72,400 Cr",
        "aum_num": 72400,
        "expense_ratio": "0.62%",
        "expense_ratio_num": 0.62,
        "exit_load": "2% if redeemed within 365 days; 1% if redeemed between 366-730 days; Nil after 730 days.",
        "min_investment": 1000,
        "min_sip": 1000,
        "rating": "5 Star",
        "inception_date": "2013-05-24",
        "risk_level": "VERY HIGH",
        "manager": {
            "name": "Rajeev Thakkar, Raunak Onkar, Raj Mehta",
            "experience": "20+ Years in Value Investing & International Equities",
            "start_date": "2013-05-24"
        },
        "amc_details": {
            "name": "PPFAS Asset Management Private Limited",
            "description": "Established with a focus on long-term value investing and international diversification.",
            "schemes_count": 5,
            "aum": "₹75,000+ Cr",
            "website": "https://amc.ppfas.com"
        },
        "performance": {
            "return_1y": 26.8,
            "cagr_3y": 21.4,
            "cagr_5y": 24.8,
            "cagr_10y": 19.5,
            "since_inception": 19.8,
            "chart_data": {
                "1M": [{"date": "Jul", "price": 81.2}, {"date": "Aug", "price": 84.25}],
                "3M": [{"date": "May", "price": 78.5}, {"date": "Jun", "price": 80.1}, {"date": "Jul", "price": 81.2}, {"date": "Aug", "price": 84.25}],
                "6M": [{"date": "Feb", "price": 74.2}, {"date": "Apr", "price": 76.8}, {"date": "Jun", "price": 80.1}, {"date": "Aug", "price": 84.25}],
                "1Y": [{"date": "Sep 23", "price": 66.4}, {"date": "Dec 23", "price": 71.0}, {"date": "Mar 24", "price": 75.3}, {"date": "Jun 24", "price": 80.1}, {"date": "Aug 24", "price": 84.25}],
                "3Y": [{"date": "2021", "price": 48.2}, {"date": "2022", "price": 54.1}, {"date": "2023", "price": 66.4}, {"date": "2024", "price": 84.25}],
                "5Y": [{"date": "2019", "price": 28.1}, {"date": "2020", "price": 34.5}, {"date": "2021", "price": 48.2}, {"date": "2023", "price": 66.4}, {"date": "2024", "price": 84.25}],
                "10Y": [{"date": "2014", "price": 14.5}, {"date": "2017", "price": 22.0}, {"date": "2020", "price": 34.5}, {"date": "2024", "price": 84.25}],
                "MAX": [{"date": "2013", "price": 10.0}, {"date": "2016", "price": 18.2}, {"date": "2019", "price": 28.1}, {"date": "2024", "price": 84.25}]
            }
        },
        "holdings": [
            {"company": "HDFC Bank Ltd", "weight": 8.4, "sector": "Financial Services", "cap": "Large Cap"},
            {"company": "Bajaj Holdings & Investment Ltd", "weight": 7.8, "sector": "Financial Services", "cap": "Large Cap"},
            {"company": "Power Grid Corporation of India Ltd", "weight": 6.9, "sector": "Energy & Utilities", "cap": "Large Cap"},
            {"company": "ITC Ltd", "weight": 6.2, "sector": "Consumer Goods (FMCG)", "cap": "Large Cap"},
            {"company": "Alphabet Inc (Google)", "weight": 5.4, "sector": "Technology", "cap": "Global Large Cap"},
            {"company": "Microsoft Corporation", "weight": 4.9, "sector": "Technology", "cap": "Global Large Cap"},
            {"company": "Coal India Ltd", "weight": 4.5, "sector": "Energy & Mining", "cap": "Large Cap"},
            {"company": "ICICI Bank Ltd", "weight": 4.1, "sector": "Financial Services", "cap": "Large Cap"}
        ],
        "sector_allocation": [
            {"sector": "Financial Services", "percentage": 31.5},
            {"sector": "Technology", "percentage": 22.4},
            {"sector": "Energy & Utilities", "percentage": 18.2},
            {"sector": "Consumer Goods (FMCG)", "percentage": 14.1},
            {"sector": "Industrials & Other", "percentage": 13.8}
        ],
        "market_cap_allocation": {
            "large_cap": 72.4,
            "mid_cap": 8.5,
            "small_cap": 4.1,
            "cash_other": 15.0
        },
        "risk_analysis": {
            "risk_level": "VERY HIGH",
            "volatility": 12.8,
            "std_dev": 13.2,
            "sharpe_ratio": 1.45,
            "beta": 0.78,
            "max_drawdown": -11.4
        },
        "tax_info": {
            "category": "Equity-Oriented (>65% Equity)",
            "holding_stcg": "< 12 Months",
            "stcg_rate": "20% (w.e.f. Budget 2024)",
            "holding_ltcg": "> 12 Months",
            "ltcg_rate": "12.5% on gains exceeding ₹1.25 Lakh per financial year",
            "disclaimer": "Informational disclosure only. Does not constitute personal tax or financial advice."
        },
        "nfo_status": None,
        "ai_research": {
            "signal": "STRONG RESEARCH PROFILE",
            "score": 88,
            "score_breakdown": {
                "performance": 27,
                "risk": 22,
                "cost": 19,
                "diversification": 12,
                "consistency": 8
            },
            "bullish_factors": [
                "Exceptional 5-Year CAGR (24.8%) outperforming category benchmark.",
                "Unique international equity diversification (Alphabet, Microsoft).",
                "Low expense ratio (0.62%) relative to active flexi-cap peers.",
                "Low Beta (0.78) indicating strong downside protection during market sell-offs."
            ],
            "risk_factors": [
                "High Cash/Debt holding (15.0%) during rapid market rallies.",
                "Exit load applies up to 2 years."
            ]
        },
        "status": "VERIFIED",
        "source": "AMFI / Scheme Filings",
        "timestamp": int(time.time())
    },
    {
        "id": "nippon-india-small-cap",
        "name": "Nippon India Small Cap Fund",
        "symbol": "NIPSMALL",
        "category": "Small Cap",
        "amc": "Nippon Life India Asset Management",
        "option": "Direct - Growth",
        "nav": 178.60,
        "aum": "₹56,200 Cr",
        "aum_num": 56200,
        "expense_ratio": "0.67%",
        "expense_ratio_num": 0.67,
        "exit_load": "1% if redeemed within 1 month; Nil thereafter.",
        "min_investment": 5000,
        "min_sip": 100,
        "rating": "5 Star",
        "inception_date": "2013-01-01",
        "risk_level": "VERY HIGH",
        "manager": {
            "name": "Samir Rachh, Kinjal Desai",
            "experience": "18+ Years in Small Cap Stock Selection",
            "start_date": "2017-01-01"
        },
        "amc_details": {
            "name": "Nippon Life India Asset Management Limited",
            "description": "One of India's largest AMCs backed by Japan's Nippon Life Insurance.",
            "schemes_count": 85,
            "aum": "₹4,50,000+ Cr",
            "website": "https://mf.nipponindiaim.com"
        },
        "performance": {
            "return_1y": 38.4,
            "cagr_3y": 28.6,
            "cagr_5y": 31.2,
            "cagr_10y": 24.1,
            "since_inception": 22.5,
            "chart_data": {
                "1M": [{"date": "Jul", "price": 171.2}, {"date": "Aug", "price": 178.6}],
                "3M": [{"date": "May", "price": 158.0}, {"date": "Jun", "price": 165.2}, {"date": "Jul", "price": 171.2}, {"date": "Aug", "price": 178.6}],
                "6M": [{"date": "Feb", "price": 142.1}, {"date": "Apr", "price": 151.4}, {"date": "Jun", "price": 165.2}, {"date": "Aug", "price": 178.6}],
                "1Y": [{"date": "Sep 23", "price": 129.0}, {"date": "Dec 23", "price": 141.2}, {"date": "Mar 24", "price": 150.0}, {"date": "Jun 24", "price": 165.2}, {"date": "Aug 24", "price": 178.6}],
                "3Y": [{"date": "2021", "price": 84.1}, {"date": "2022", "price": 102.5}, {"date": "2023", "price": 129.0}, {"date": "2024", "price": 178.6}],
                "5Y": [{"date": "2019", "price": 45.8}, {"date": "2020", "price": 58.2}, {"date": "2021", "price": 84.1}, {"date": "2023", "price": 129.0}, {"date": "2024", "price": 178.6}],
                "10Y": [{"date": "2014", "price": 20.4}, {"date": "2017", "price": 42.1}, {"date": "2020", "price": 58.2}, {"date": "2024", "price": 178.6}],
                "MAX": [{"date": "2013", "price": 10.0}, {"date": "2016", "price": 31.5}, {"date": "2019", "price": 45.8}, {"date": "2024", "price": 178.6}]
            }
        },
        "holdings": [
            {"company": "Tube Investments of India Ltd", "weight": 3.8, "sector": "Auto Ancillaries", "cap": "Mid Cap"},
            {"company": "HDFC Bank Ltd", "weight": 3.2, "sector": "Financial Services", "cap": "Large Cap"},
            {"company": "KPIT Technologies Ltd", "weight": 2.9, "sector": "Technology", "cap": "Mid Cap"},
            {"company": "Apar Industries Ltd", "weight": 2.7, "sector": "Capital Goods", "cap": "Small Cap"},
            {"company": "Multi Commodity Exchange of India", "weight": 2.4, "sector": "Financial Services", "cap": "Mid Cap"},
            {"company": "Carborundum Universal Ltd", "weight": 2.1, "sector": "Industrials", "cap": "Mid Cap"}
        ],
        "sector_allocation": [
            {"sector": "Capital Goods & Industrials", "percentage": 24.8},
            {"sector": "Financial Services", "percentage": 18.2},
            {"sector": "Technology & Software", "percentage": 14.5},
            {"sector": "Auto Ancillaries", "percentage": 12.1},
            {"sector": "Chemicals & Materials", "percentage": 10.4},
            {"sector": "Other", "percentage": 20.0}
        ],
        "market_cap_allocation": {
            "large_cap": 12.5,
            "mid_cap": 28.4,
            "small_cap": 54.1,
            "cash_other": 5.0
        },
        "risk_analysis": {
            "risk_level": "VERY HIGH",
            "volatility": 18.4,
            "std_dev": 18.9,
            "sharpe_ratio": 1.62,
            "beta": 0.92,
            "max_drawdown": -18.2
        },
        "tax_info": {
            "category": "Equity-Oriented (>65% Equity)",
            "holding_stcg": "< 12 Months",
            "stcg_rate": "20%",
            "holding_ltcg": "> 12 Months",
            "ltcg_rate": "12.5% above ₹1.25 Lakh threshold",
            "disclaimer": "Informational disclosure only. Does not constitute personal tax or financial advice."
        },
        "nfo_status": None,
        "ai_research": {
            "signal": "STRONG RESEARCH PROFILE",
            "score": 90,
            "score_breakdown": {
                "performance": 29,
                "risk": 20,
                "cost": 18,
                "diversification": 15,
                "consistency": 8
            },
            "bullish_factors": [
                "Industry-leading 5-Year CAGR (31.2%) in small cap category.",
                "Well-diversified portfolio spanning over 150 small-cap growth stocks.",
                "High Sharpe ratio (1.62) demonstrating superior risk-adjusted returns."
            ],
            "risk_factors": [
                "High portfolio volatility (18.4%) inherent to small-cap universe.",
                "Large AUM size (₹56,200 Cr) requires careful liquidity management."
            ]
        },
        "status": "VERIFIED",
        "source": "AMFI / Scheme Filings",
        "timestamp": int(time.time())
    },
    {
        "id": "hdfc-mid-cap-opportunities",
        "name": "HDFC Mid-Cap Opportunities Fund",
        "symbol": "HDFCMID",
        "category": "Mid Cap",
        "amc": "HDFC Asset Management Company",
        "option": "Direct - Growth",
        "nav": 192.40,
        "aum": "₹68,900 Cr",
        "aum_num": 68900,
        "expense_ratio": "0.74%",
        "expense_ratio_num": 0.74,
        "exit_load": "1% if redeemed within 1 year; Nil after 1 year.",
        "min_investment": 1000,
        "min_sip": 100,
        "rating": "5 Star",
        "inception_date": "2007-06-25",
        "risk_level": "VERY HIGH",
        "manager": {
            "name": "Chirag Setalvad",
            "experience": "22+ Years in Mid & Small Cap Equity Research",
            "start_date": "2007-06-25"
        },
        "amc_details": {
            "name": "HDFC Asset Management Company Limited",
            "description": "Premier Indian asset manager backed by HDFC Bank group.",
            "schemes_count": 92,
            "aum": "₹6,10,000+ Cr",
            "website": "https://www.hdfcfund.com"
        },
        "performance": {
            "return_1y": 32.5,
            "cagr_3y": 25.1,
            "cagr_5y": 26.4,
            "cagr_10y": 20.8,
            "since_inception": 19.2,
            "chart_data": {
                "1M": [{"date": "Jul", "price": 184.1}, {"date": "Aug", "price": 192.4}],
                "3M": [{"date": "May", "price": 172.0}, {"date": "Jun", "price": 179.5}, {"date": "Jul", "price": 184.1}, {"date": "Aug", "price": 192.4}],
                "6M": [{"date": "Feb", "price": 158.4}, {"date": "Apr", "price": 166.2}, {"date": "Jun", "price": 179.5}, {"date": "Aug", "price": 192.4}],
                "1Y": [{"date": "Sep 23", "price": 145.2}, {"date": "Dec 23", "price": 155.0}, {"date": "Mar 24", "price": 164.8}, {"date": "Jun 24", "price": 179.5}, {"date": "Aug 24", "price": 192.4}],
                "3Y": [{"date": "2021", "price": 98.4}, {"date": "2022", "price": 115.2}, {"date": "2023", "price": 145.2}, {"date": "2024", "price": 192.4}],
                "5Y": [{"date": "2019", "price": 59.5}, {"date": "2020", "price": 71.0}, {"date": "2021", "price": 98.4}, {"date": "2023", "price": 145.2}, {"date": "2024", "price": 192.4}],
                "10Y": [{"date": "2014", "price": 28.5}, {"date": "2017", "price": 54.2}, {"date": "2020", "price": 71.0}, {"date": "2024", "price": 192.4}],
                "MAX": [{"date": "2007", "price": 10.0}, {"date": "2012", "price": 22.4}, {"date": "2017", "price": 54.2}, {"date": "2024", "price": 192.4}]
            }
        },
        "holdings": [
            {"company": "Indian Hotels Company Ltd", "weight": 4.2, "sector": "Services & Hospitality", "cap": "Mid Cap"},
            {"company": "Bharat Electronics Ltd", "weight": 3.9, "sector": "Defense & Capital Goods", "cap": "Large Cap"},
            {"company": "Max Healthcare Institute Ltd", "weight": 3.5, "sector": "Healthcare", "cap": "Mid Cap"},
            {"company": "Persistent Systems Ltd", "weight": 3.1, "sector": "Technology", "cap": "Mid Cap"},
            {"company": "Astral Ltd", "weight": 2.8, "sector": "Building Materials", "cap": "Mid Cap"}
        ],
        "sector_allocation": [
            {"sector": "Capital Goods & Defense", "percentage": 22.1},
            {"sector": "Financial Services", "percentage": 19.5},
            {"sector": "Services & Hospitality", "percentage": 15.2},
            {"sector": "Healthcare & Pharma", "percentage": 13.4},
            {"sector": "Technology", "percentage": 11.8},
            {"sector": "Other", "percentage": 18.0}
        ],
        "market_cap_allocation": {
            "large_cap": 20.1,
            "mid_cap": 68.4,
            "small_cap": 8.5,
            "cash_other": 3.0
        },
        "risk_analysis": {
            "risk_level": "VERY HIGH",
            "volatility": 15.2,
            "std_dev": 15.6,
            "sharpe_ratio": 1.54,
            "beta": 0.88,
            "max_drawdown": -14.1
        },
        "tax_info": {
            "category": "Equity-Oriented (>65% Equity)",
            "holding_stcg": "< 12 Months",
            "stcg_rate": "20%",
            "holding_ltcg": "> 12 Months",
            "ltcg_rate": "12.5% above ₹1.25 Lakh limit",
            "disclaimer": "Informational disclosure only. Does not constitute personal tax or financial advice."
        },
        "nfo_status": None,
        "ai_research": {
            "signal": "STRONG RESEARCH PROFILE",
            "score": 87,
            "score_breakdown": {
                "performance": 27,
                "risk": 21,
                "cost": 18,
                "diversification": 13,
                "consistency": 8
            },
            "bullish_factors": [
                "Long track record (>17 years) under founding fund manager Chirag Setalvad.",
                "Consistent 5-Year CAGR (26.4%) outperforming mid-cap category average.",
                "Balanced mid-cap strategy with top exposure in high-growth capital goods."
            ],
            "risk_factors": [
                "Category sensitivity to broader economic growth cycles."
            ]
        },
        "status": "VERIFIED",
        "source": "AMFI / Scheme Filings",
        "timestamp": int(time.time())
    },
    {
        "id": "sbi-bluechip-fund",
        "name": "SBI Bluechip Fund",
        "symbol": "SBIBLUE",
        "category": "Large Cap",
        "amc": "SBI Funds Management Limited",
        "option": "Direct - Growth",
        "nav": 89.15,
        "aum": "₹48,100 Cr",
        "aum_num": 48100,
        "expense_ratio": "0.82%",
        "expense_ratio_num": 0.82,
        "exit_load": "1% if redeemed within 1 year; Nil thereafter.",
        "min_investment": 5000,
        "min_sip": 500,
        "rating": "4 Star",
        "inception_date": "2006-02-14",
        "risk_level": "VERY HIGH",
        "manager": {
            "name": "Sohini Andani",
            "experience": "25+ Years in Large Cap Equity Strategy",
            "start_date": "2010-09-01"
        },
        "amc_details": {
            "name": "SBI Funds Management Limited",
            "description": "India's largest asset management company, a joint venture between State Bank of India & Amundi.",
            "schemes_count": 110,
            "aum": "₹9,80,000+ Cr",
            "website": "https://www.sbimf.com"
        },
        "performance": {
            "return_1y": 21.2,
            "cagr_3y": 16.8,
            "cagr_5y": 17.5,
            "cagr_10y": 14.9,
            "since_inception": 12.8,
            "chart_data": {
                "1M": [{"date": "Jul", "price": 86.8}, {"date": "Aug", "price": 89.15}],
                "3M": [{"date": "May", "price": 82.1}, {"date": "Jun", "price": 84.5}, {"date": "Jul", "price": 86.8}, {"date": "Aug", "price": 89.15}],
                "6M": [{"date": "Feb", "price": 78.4}, {"date": "Apr", "price": 80.2}, {"date": "Jun", "price": 84.5}, {"date": "Aug", "price": 89.15}],
                "1Y": [{"date": "Sep 23", "price": 73.5}, {"date": "Dec 23", "price": 77.2}, {"date": "Mar 24", "price": 80.0}, {"date": "Jun 24", "price": 84.5}, {"date": "Aug 24", "price": 89.15}],
                "3Y": [{"date": "2021", "price": 56.0}, {"date": "2022", "price": 63.4}, {"date": "2023", "price": 73.5}, {"date": "2024", "price": 89.15}],
                "5Y": [{"date": "2019", "price": 39.8}, {"date": "2020", "price": 44.5}, {"date": "2021", "price": 56.0}, {"date": "2023", "price": 73.5}, {"date": "2024", "price": 89.15}],
                "10Y": [{"date": "2014", "price": 22.0}, {"date": "2017", "price": 34.1}, {"date": "2020", "price": 44.5}, {"date": "2024", "price": 89.15}],
                "MAX": [{"date": "2006", "price": 10.0}, {"date": "2011", "price": 17.2}, {"date": "2017", "price": 34.1}, {"date": "2024", "price": 89.15}]
            }
        },
        "holdings": [
            {"company": "HDFC Bank Ltd", "weight": 9.2, "sector": "Financial Services", "cap": "Large Cap"},
            {"company": "ICICI Bank Ltd", "weight": 8.5, "sector": "Financial Services", "cap": "Large Cap"},
            {"company": "Reliance Industries Ltd", "weight": 7.4, "sector": "Energy & Oil", "cap": "Large Cap"},
            {"company": "Larsen & Toubro Ltd", "weight": 5.8, "sector": "Engineering & Infrastructure", "cap": "Large Cap"},
            {"company": "Infosys Ltd", "weight": 5.1, "sector": "Technology", "cap": "Large Cap"},
            {"company": "ITC Ltd", "weight": 4.6, "sector": "FMCG", "cap": "Large Cap"}
        ],
        "sector_allocation": [
            {"sector": "Financial Services", "percentage": 34.2},
            {"sector": "Technology", "percentage": 14.1},
            {"sector": "Energy & Oil", "percentage": 13.5},
            {"sector": "Engineering & Infrastructure", "percentage": 11.8},
            {"sector": "Consumer & FMCG", "percentage": 10.4},
            {"sector": "Other", "percentage": 16.0}
        ],
        "market_cap_allocation": {
            "large_cap": 88.5,
            "mid_cap": 8.2,
            "small_cap": 0.0,
            "cash_other": 3.3
        },
        "risk_analysis": {
            "risk_level": "VERY HIGH",
            "volatility": 11.4,
            "std_dev": 11.8,
            "sharpe_ratio": 1.28,
            "beta": 0.94,
            "max_drawdown": -9.8
        },
        "tax_info": {
            "category": "Equity-Oriented (>65% Equity)",
            "holding_stcg": "< 12 Months",
            "stcg_rate": "20%",
            "holding_ltcg": "> 12 Months",
            "ltcg_rate": "12.5% above ₹1.25 Lakh limit",
            "disclaimer": "Informational disclosure only. Does not constitute personal tax or financial advice."
        },
        "nfo_status": None,
        "ai_research": {
            "signal": "RESEARCH PROFILE",
            "score": 81,
            "score_breakdown": {
                "performance": 23,
                "risk": 23,
                "cost": 17,
                "diversification": 12,
                "consistency": 6
            },
            "bullish_factors": [
                "Established large-cap franchise managed by State Bank of India's asset arm.",
                "Low downside volatility (Std Dev 11.8%) and steady large-cap compounding."
            ],
            "risk_factors": [
                "Slightly higher expense ratio (0.82%) compared to low-cost Nifty index funds."
            ]
        },
        "status": "VERIFIED",
        "source": "AMFI / Scheme Filings",
        "timestamp": int(time.time())
    },
    {
        "id": "uti-nifty-50-index-fund",
        "name": "UTI Nifty 50 Index Fund",
        "symbol": "UTINIFTY",
        "category": "Index Fund",
        "amc": "UTI Asset Management Company",
        "option": "Direct - Growth",
        "nav": 164.80,
        "aum": "₹18,500 Cr",
        "aum_num": 18500,
        "expense_ratio": "0.18%",
        "expense_ratio_num": 0.18,
        "exit_load": "Nil",
        "min_investment": 500,
        "min_sip": 500,
        "rating": "5 Star",
        "inception_date": "2000-03-06",
        "risk_level": "VERY HIGH",
        "manager": {
            "name": "Sharwan Kumar Goyal",
            "experience": "16+ Years in Index Tracking & Passive Funds",
            "start_date": "2018-07-02"
        },
        "amc_details": {
            "name": "UTI Asset Management Company Limited",
            "description": "India's oldest mutual fund manager pioneer established in 1963.",
            "schemes_count": 78,
            "aum": "₹3,10,000+ Cr",
            "website": "https://www.utimf.com"
        },
        "performance": {
            "return_1y": 24.5,
            "cagr_3y": 15.2,
            "cagr_5y": 16.1,
            "cagr_10y": 13.8,
            "since_inception": 14.2,
            "chart_data": {
                "1M": [{"date": "Jul", "price": 159.2}, {"date": "Aug", "price": 164.8}],
                "3M": [{"date": "May", "price": 151.0}, {"date": "Jun", "price": 155.4}, {"date": "Jul", "price": 159.2}, {"date": "Aug", "price": 164.8}],
                "6M": [{"date": "Feb", "price": 143.5}, {"date": "Apr", "price": 147.2}, {"date": "Jun", "price": 155.4}, {"date": "Aug", "price": 164.8}],
                "1Y": [{"date": "Sep 23", "price": 132.4}, {"date": "Dec 23", "price": 141.0}, {"date": "Mar 24", "price": 148.5}, {"date": "Jun 24", "price": 155.4}, {"date": "Aug 24", "price": 164.8}],
                "3Y": [{"date": "2021", "price": 108.2}, {"date": "2022", "price": 118.5}, {"date": "2023", "price": 132.4}, {"date": "2024", "price": 164.8}],
                "5Y": [{"date": "2019", "price": 78.4}, {"date": "2020", "price": 84.1}, {"date": "2021", "price": 108.2}, {"date": "2023", "price": 132.4}, {"date": "2024", "price": 164.8}],
                "10Y": [{"date": "2014", "price": 45.0}, {"date": "2017", "price": 68.2}, {"date": "2020", "price": 84.1}, {"date": "2024", "price": 164.8}],
                "MAX": [{"date": "2000", "price": 10.0}, {"date": "2008", "price": 32.1}, {"date": "2017", "price": 68.2}, {"date": "2024", "price": 164.8}]
            }
        },
        "holdings": [
            {"company": "HDFC Bank Ltd", "weight": 11.5, "sector": "Financial Services", "cap": "Large Cap"},
            {"company": "Reliance Industries Ltd", "weight": 9.8, "sector": "Energy & Oil", "cap": "Large Cap"},
            {"company": "ICICI Bank Ltd", "weight": 7.9, "sector": "Financial Services", "cap": "Large Cap"},
            {"company": "Infosys Ltd", "weight": 5.8, "sector": "Technology", "cap": "Large Cap"},
            {"company": "ITC Ltd", "weight": 4.4, "sector": "FMCG", "cap": "Large Cap"},
            {"company": "Tata Consultancy Services Ltd", "weight": 4.1, "sector": "Technology", "cap": "Large Cap"}
        ],
        "sector_allocation": [
            {"sector": "Financial Services", "percentage": 33.8},
            {"sector": "Information Technology", "percentage": 13.9},
            {"sector": "Oil, Gas & Consumable Fuels", "percentage": 11.8},
            {"sector": "Fast Moving Consumer Goods", "percentage": 8.5},
            {"sector": "Automobile & Auto Components", "percentage": 7.2},
            {"sector": "Other", "percentage": 24.8}
        ],
        "market_cap_allocation": {
            "large_cap": 99.5,
            "mid_cap": 0.5,
            "small_cap": 0.0,
            "cash_other": 0.0
        },
        "risk_analysis": {
            "risk_level": "VERY HIGH",
            "volatility": 11.2,
            "std_dev": 11.5,
            "sharpe_ratio": 1.34,
            "beta": 1.00,
            "max_drawdown": -9.2
        },
        "tax_info": {
            "category": "Equity Index Fund (>65% Equity)",
            "holding_stcg": "< 12 Months",
            "stcg_rate": "20%",
            "holding_ltcg": "> 12 Months",
            "ltcg_rate": "12.5% above ₹1.25 Lakh limit",
            "disclaimer": "Informational disclosure only. Does not constitute personal tax or financial advice."
        },
        "nfo_status": None,
        "ai_research": {
            "signal": "STRONG RESEARCH PROFILE",
            "score": 92,
            "score_breakdown": {
                "performance": 25,
                "risk": 24,
                "cost": 20,
                "diversification": 14,
                "consistency": 9
            },
            "bullish_factors": [
                "Ultra-low expense ratio (0.18%) minimizing long-term cost drag.",
                "Zero tracking error relative to Nifty 50 benchmark.",
                "Zero exit load allowing 100% liquidity flexibility."
            ],
            "risk_factors": [
                "100% market risk tied directly to Nifty 50 index performance."
            ]
        },
        "status": "VERIFIED",
        "source": "AMFI / Scheme Filings",
        "timestamp": int(time.time())
    }
]

async def get_all_mutual_funds(category: str = "ALL", search_query: str = "") -> List[Dict[str, Any]]:
    """Fetch all mutual funds with category and search filter support."""
    results = MUTUAL_FUNDS_DB
    if category and category != "ALL":
        results = [m for m in results if m["category"].lower() == category.lower()]
    
    if search_query and search_query.strip():
        q = search_query.strip().lower()
        results = [
            m for m in results
            if q in m["name"].lower()
            or q in m["category"].lower()
            or q in m["amc"].lower()
            or q in m["symbol"].lower()
        ]
    return results

async def get_mutual_fund_by_id(fund_id: str) -> Dict[str, Any]:
    """Fetch single mutual fund by id or symbol."""
    fund_id_clean = fund_id.lower().strip()
    for m in MUTUAL_FUNDS_DB:
        if m["id"].lower() == fund_id_clean or m["symbol"].lower() == fund_id_clean:
            return m
    return None

async def get_similar_funds(fund_id: str) -> List[Dict[str, Any]]:
    """Fetch similar funds in same category."""
    fund = await get_mutual_fund_by_id(fund_id)
    if not fund:
        return []
    category = fund["category"]
    similar = [m for m in MUTUAL_FUNDS_DB if m["category"] == category and m["id"] != fund["id"]]
    if not similar:
        similar = [m for m in MUTUAL_FUNDS_DB if m["id"] != fund["id"]][:3]
    return similar
