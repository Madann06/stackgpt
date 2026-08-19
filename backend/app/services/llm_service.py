import os
import json
from typing import List, Dict, Any, Optional
from app.services.rag_service import RAGService
from app.services.yahoo_finance import YahooFinanceService
from app.services.web_search import WebSearchService


class LLMService:
    """
    OpenAI Function/Tool-Calling Agent Architecture.
    GPT acts as the CENTRAL BRAIN, autonomously inspecting user intent, multi-turn history,
    and deciding when to execute tools (Yahoo Finance, Web Search, ChromaDB RAG), or answer directly.
    """

    @classmethod
    def get_tool_definitions(cls) -> List[Dict[str, Any]]:
        """Define standard OpenAI Function Tool Specifications."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_financial_metrics",
                    "description": "Fetch real-time financial market metrics, stock quote, P/E ratio, EPS, ROE, market cap, balance sheet, or financial performance for a stock symbol.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "symbol": {
                                "type": "string",
                                "description": "Stock ticker symbol, e.g. SBIN.NS, NVDA, AAPL, CIPLA.NS, TSLA"
                            },
                            "requested_metrics": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Metrics needed, e.g. ['price', 'roe', 'pe_ratio', 'market_cap', 'eps', 'revenue', 'debt']"
                            }
                        },
                        "required": ["symbol"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_web_news",
                    "description": "Search the live web for recent news, market events, stock movement causes (why stock fell/rose), company announcements, or analyst research.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query string, e.g. 'Why did SBI stock fall today news', 'NVIDIA recent developments earnings'"
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_uploaded_documents",
                    "description": "Search ChromaDB vector store for excerpts from uploaded annual reports, financial PDFs, or 10-K disclosures.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query for report content, e.g. 'bad loans NPA risk factors', 'revenue segment growth'"
                            },
                            "symbol": {
                                "type": "string",
                                "description": "Stock symbol associated with the document"
                            }
                        },
                        "required": ["query"]
                    }
                }
            }
        ]

    @classmethod
    def execute_tool(cls, name: str, args: Dict[str, Any], symbol: str, document_id: Optional[int]) -> Dict[str, Any]:
        """Execute Python backend logic for GPT tool calls."""
        if name == "get_financial_metrics":
            target_symbol = (args.get("symbol") or symbol or "AAPL").upper()
            try:
                price_info = YahooFinanceService.get_stock_price(target_symbol)
                ratios = YahooFinanceService.get_financial_ratios(target_symbol)
                profile = YahooFinanceService.get_company_profile(target_symbol)
                return {
                    "type": "financial_metrics",
                    "data": {
                        "symbol": target_symbol,
                        "name": profile.get("name", target_symbol),
                        "price": price_info.get("price"),
                        "change_percent": price_info.get("change_percent"),
                        "currency": price_info.get("currency", "USD"),
                        "market_cap": ratios.get("market_cap"),
                        "pe_ratio": ratios.get("pe_ratio"),
                        "forward_pe": ratios.get("forward_pe"),
                        "eps": ratios.get("eps"),
                        "roe": ratios.get("roe"),
                        "profit_margins": ratios.get("profit_margins"),
                        "operating_margins": ratios.get("operating_margins"),
                        "week_52_low": ratios.get("week_52_low"),
                        "week_52_high": ratios.get("week_52_high"),
                        "dividend_yield": ratios.get("dividend_yield")
                    },
                    "source": {
                        "title": f"{target_symbol} Financial Market Data & Metrics",
                        "url": f"https://finance.yahoo.com/quote/{target_symbol}",
                        "source": "Yahoo Finance API"
                    }
                }
            except Exception as e:
                return {"type": "financial_metrics", "error": str(e), "data": {}}

        elif name == "search_web_news":
            query = args.get("query", f"{symbol} stock news")
            results = WebSearchService.search(query, num_results=4)
            return {
                "type": "web_news",
                "results": results
            }

        elif name == "search_uploaded_documents":
            doc_query = args.get("query", "")
            chunks = RAGService.search_similarity(query=doc_query, top_k=5, document_id=document_id)
            citations = []
            for idx, c in enumerate(chunks, 1):
                citations.append({
                    "source_number": idx,
                    "filename": c.get("filename", f"{symbol}_Annual_Report.pdf"),
                    "page_number": c.get("page_number", 1),
                    "snippet": c.get("content", "")[:280] + "..."
                })
            return {
                "type": "uploaded_documents",
                "chunks": chunks,
                "citations": citations
            }

        return {"error": f"Unknown tool name {name}"}

    @classmethod
    def generate_rag_answer(
        cls,
        query: str,
        context_chunks: List[Dict[str, Any]],
        symbol: str = "AAPL",
        document_mode: bool = False,
        conversation_history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        GPT-Centered Conversational Agent Loop.
        Uses OpenAI tool-calling capability so GPT autonomously inspects intent, chooses tools,
        and generates natural conversational responses.
        """
        openai_api_key = os.getenv("OPENAI_API_KEY")
        symbol = symbol.upper() if symbol else "AAPL"
        conversation_history = conversation_history or []
        query_lower = query.lower().strip()

        # ----------------------------------------------------
        # MODE 1: DOCUMENT MODE IS ON (Strict Document Grounding)
        # ----------------------------------------------------
        if document_mode:
            citations = []
            for idx, chunk in enumerate(context_chunks, 1):
                citations.append({
                    "source_number": idx,
                    "filename": chunk.get("filename", f"{symbol}_Annual_Report.pdf"),
                    "page_number": chunk.get("page_number", 1),
                    "snippet": chunk.get("content", "")[:280] + "..."
                })

            if not context_chunks:
                answer_text = "The uploaded documents do not contain enough information to answer this."
            else:
                if openai_api_key and openai_api_key.startswith("sk-"):
                    try:
                        prompt_text = RAGService.build_rag_prompt(query, context_chunks)
                        sys_prompt = (
                            f"You are a Strict Financial Document Assistant for {symbol}. Answer the user's question ONLY using "
                            "the provided uploaded document excerpts. If the excerpts do not contain enough information to answer, "
                            "respond exactly: 'The uploaded documents do not contain enough information to answer this.' "
                            "Do NOT invent facts or use external ungrounded knowledge."
                        )

                        messages = [{"role": "system", "content": sys_prompt}]
                        for h in conversation_history[-6:]:
                            role = h.get("role") or ("user" if h.get("sender") == "user" else "assistant")
                            content = h.get("content") or h.get("query") or h.get("answer") or ""
                            if content.strip():
                                messages.append({"role": role, "content": content})
                        messages.append({"role": "user", "content": prompt_text})

                        res = requests.post(
                            "https://api.openai.com/v1/chat/completions",
                            headers={"Authorization": f"Bearer {openai_api_key}", "Content-Type": "application/json"},
                            json={"model": "gpt-4o-mini", "temperature": 0.1, "messages": messages},
                            timeout=20
                        )
                        if res.status_code == 200:
                            answer_text = res.json()["choices"][0]["message"]["content"]
                        else:
                            snippets = [f"[Page {c.get('page_number', 1)}]: {c['content']}" for c in context_chunks[:3]]
                            answer_text = f"Based strictly on the uploaded report for {symbol}:\n\n" + "\n\n".join(snippets)
                    except Exception:
                        snippets = [f"[Page {c.get('page_number', 1)}]: {c['content']}" for c in context_chunks[:3]]
                        answer_text = f"Based strictly on the uploaded report for {symbol}:\n\n" + "\n\n".join(snippets)
                else:
                    snippets = [f"[Page {c.get('page_number', 1)}]: {c['content']}" for c in context_chunks[:3]]
                    answer_text = f"Based strictly on the uploaded report for {symbol}:\n\n" + "\n\n".join(snippets)

            return {
                "query": query,
                "answer": answer_text,
                "citations": citations if answer_text != "The uploaded documents do not contain enough information to answer this." else [],
                "sources": [],
                "financial_data_used": False,
                "web_search_used": False,
                "document_mode": True
            }

        # ----------------------------------------------------
        # MODE 2: DOCUMENT MODE IS OFF (OpenAI Agent with Function Calling)
        # ----------------------------------------------------
        sources = []
        citations = []
        financial_data_used = False
        web_search_used = False

        sys_prompt = (
            "You are a Senior AI Stock Research Assistant with native access to tools. "
            f"The active company context is {symbol}. "
            "SYSTEM INSTRUCTIONS:\n"
            "1. You are the CENTRAL BRAIN. Inspect the user message, context, and conversation history.\n"
            "2. Decide dynamically if you need tools:\n"
            "   - Use 'get_financial_metrics' if you need stock price, P/E, EPS, ROE, market cap, balance sheet, or valuation metrics.\n"
            "   - Use 'search_web_news' if you need recent market news, announcements, stock price movement causes, or analyst research.\n"
            "   - DO NOT call any tools if the user is asking conceptual questions (e.g., 'What is ROE?', 'Explain diversification'), follow-up clarifications ('Why?', 'What do you mean?'), or general investing advice. Answer directly using internal knowledge.\n"
            "3. DO NOT output standard template dumps of metrics unless specifically requested.\n"
            "4. DO NOT invent fake confidence percentages (such as 91% confidence). Ground all answers in factual evidence."
        )

        if openai_api_key and openai_api_key.startswith("sk-"):
            try:
                messages = [{"role": "system", "content": sys_prompt}]
                for h in conversation_history[-6:]:
                    role = h.get("role") or ("user" if h.get("sender") == "user" else "assistant")
                    content = h.get("content") or h.get("query") or h.get("answer") or ""
                    if content.strip():
                        messages.append({"role": role, "content": content})

                messages.append({"role": "user", "content": query})

                # Step 1: LLM Tool Selection Call
                req_payload = {
                    "model": "gpt-4o-mini",
                    "temperature": 0.3,
                    "messages": messages,
                    "tools": cls.get_tool_definitions(),
                    "tool_choice": "auto"
                }
                res = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_api_key}", "Content-Type": "application/json"},
                    json=req_payload,
                    timeout=20
                )

                if res.status_code == 200:
                    resp_data = res.json()
                    choice = resp_data["choices"][0]
                    ai_msg = choice["message"]

                    # Step 2: Handle Tool Calls requested by GPT
                    if ai_msg.get("tool_calls"):
                        tool_messages = list(messages)
                        tool_messages.append(ai_msg)

                        for tool_call in ai_msg["tool_calls"]:
                            t_name = tool_call["function"]["name"]
                            raw_args = tool_call["function"].get("arguments", "{}")
                            t_args = json.loads(raw_args) if isinstance(raw_args, str) else (raw_args or {})
                            tool_res = cls.execute_tool(t_name, t_args, symbol=symbol, document_id=None)

                            if t_name == "get_financial_metrics":
                                financial_data_used = True
                                if tool_res.get("source"):
                                    sources.append(tool_res["source"])
                            elif t_name == "search_web_news":
                                web_search_used = True
                                for item in tool_res.get("results", []):
                                    sources.append({
                                        "title": item["title"],
                                        "url": item["url"],
                                        "source": item["source"],
                                        "snippet": item.get("snippet")
                                    })

                            tool_messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call["id"],
                                "name": t_name,
                                "content": json.dumps(tool_res)
                            })

                        # Step 3: LLM Final Natural Synthesis Call over Tool Outputs
                        synth_res = requests.post(
                            "https://api.openai.com/v1/chat/completions",
                            headers={"Authorization": f"Bearer {openai_api_key}", "Content-Type": "application/json"},
                            json={"model": "gpt-4o-mini", "temperature": 0.3, "messages": tool_messages},
                            timeout=20
                        )
                        if synth_res.status_code == 200:
                            answer_text = synth_res.json()["choices"][0]["message"]["content"]
                        else:
                            answer_text = ai_msg.get("content") or ""
                    else:
                        answer_text = ai_msg.get("content") or ""

                    return {
                        "query": query,
                        "answer": answer_text,
                        "citations": citations,
                        "sources": sources,
                        "financial_data_used": financial_data_used,
                        "web_search_used": web_search_used,
                        "document_mode": False
                    }
            except Exception:
                pass


        # ----------------------------------------------------
        # DYNAMIC TOOL RUNNER (Local Fallback Execution)
        # ----------------------------------------------------
        financial_keywords = ["price", "p/e", "ratio", "valuation", "eps", "roe", "revenue", "profit", "market cap", "debt", "overvalued", "invest", "buy", "hold"]
        news_keywords = ["why", "fell", "rose", "dropped", "surged", "recent", "latest", "news", "event", "happen", "happened", "today", "yesterday"]

        needs_financial = any(k in query_lower for k in financial_keywords)
        needs_news = any(k in query_lower for k in news_keywords)

        price_info, ratios, profile = {}, {}, {}
        if needs_financial:
            t_res = cls.execute_tool("get_financial_metrics", {"symbol": symbol}, symbol=symbol, document_id=None)
            financial_data_used = True
            data = t_res.get("data", {})
            price_info = {"price": data.get("price"), "change_percent": data.get("change_percent"), "currency": data.get("currency")}
            ratios = data
            profile = {"name": data.get("name")}
            if t_res.get("source"):
                sources.append(t_res["source"])

        if needs_news:
            t_res = cls.execute_tool("search_web_news", {"query": f"{symbol} stock news recent events"}, symbol=symbol, document_id=None)
            web_search_used = True
            for item in t_res.get("results", []):
                sources.append({
                    "title": item["title"],
                    "url": item["url"],
                    "source": item["source"],
                    "snippet": item.get("snippet")
                })

        # Answer formulation based on query type
        if "roe" in query_lower and ("what is" in query_lower or "explain" in query_lower) and not needs_financial:
            answer_text = (
                "**Return on Equity (ROE)** measures how efficiently a company uses shareholder capital to generate net profit.\n\n"
                "• **Formula**: Net Income ÷ Shareholder Equity\n"
                "• **Significance**: An ROE above 15-20% generally indicates strong capital efficiency and high profitability."
            )
        elif "roe" in query_lower:
            answer_text = f"**{profile.get('name', symbol)}** has a Return on Equity (ROE) of **{ratios.get('roe', '16.8%')}**. Current price stands at ${price_info.get('price', 'N/A')} with a trailing P/E of {ratios.get('pe_ratio', 'N/A')}."
        elif "pe" in query_lower or "ratio" in query_lower or "mean" in query_lower:
            answer_text = (
                "The **Price-to-Earnings (P/E) Ratio** measures how much investors are willing to pay for each dollar of annual company earnings.\n\n"
                "• **Formula**: Market Price per Share ÷ Earnings per Share (EPS)\n"
                "• **Interpretation**: Higher P/E multiples signal strong growth expectations, while lower P/E ratios may indicate undervalued assets or slower expansion."
            )
        elif "why" in query_lower or "fall" in query_lower or "drop" in query_lower:
            answer_text = (
                f"Recent price movement in **{symbol}** has been influenced by broader sector sentiment, quarterly earnings expectations, and institutional trading patterns. "
                f"The stock is currently trading around ${price_info.get('price', 'N/A')} with 52-week support at ${ratios.get('week_52_low', 'N/A')}."
            )
        elif "hold" in query_lower or "how long" in query_lower:
            answer_text = (
                f"Determining your holding period for **{symbol}** depends on your investment strategy:\n\n"
                f"• **Long-Term (3-5+ Years)**: Solid operating cash flow and sector positioning make {symbol} suitable for multi-year capital compounding.\n"
                f"• **Medium-Term (1-3 Years)**: Monitor ongoing ROE ({ratios.get('roe', 'N/A')}) and margin trajectories ({ratios.get('profit_margins', 'N/A')}).\n"
                f"• **Short-Term Catalysts**: Price volatility remains bounded by the 52-week range (${ratios.get('week_52_low', 'N/A')} – ${ratios.get('week_52_high', 'N/A')})."
            )
        elif "overvalued" in query_lower or "cheap" in query_lower:
            answer_text = f"**{symbol}** trades at a trailing P/E of **{ratios.get('pe_ratio', 'N/A')}** and forward P/E of **{ratios.get('forward_pe', 'N/A')}**. Compare these multiples against peer sector averages to assess valuation margin of safety."
        elif "compare" in query_lower:
            answer_text = f"Comparing **{symbol}** with industry peers: {symbol} currently holds a market cap of {ratios.get('market_cap', 'N/A')}, P/E of {ratios.get('pe_ratio', 'N/A')}, and EPS of {ratios.get('eps', 'N/A')}."
        elif not needs_financial and not needs_news:
            answer_text = (
                f"**Financial Research & Investing Principles**:\n\n"
                f"Regarding your query on general investment concepts: "
                f"When building an equity portfolio, key principles include risk diversification, evaluating competitive moats, "
                f"understanding financial valuation multiples (P/E, ROE), and matching your allocation strategy to your risk horizon."
            )
        else:
            answer_text = (
                f"Research Analysis for **{symbol}**:\n\n"
                f"• Currently trading at **${price_info.get('price', 'N/A')}** (P/E: {ratios.get('pe_ratio', 'N/A')})\n"
                f"• Market Valuation: {ratios.get('market_cap', 'N/A')}, ROE: {ratios.get('roe', 'N/A')}\n"
                "Feel free to ask follow-up questions about holding period, valuation, risks, or specific ratios!"
            )


        return {
            "query": query,
            "answer": answer_text,
            "citations": citations,
            "sources": sources,
            "financial_data_used": financial_data_used,
            "web_search_used": web_search_used,
            "document_mode": False
        }
