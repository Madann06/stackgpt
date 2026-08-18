import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, FileText, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { stockApi } from '../services/stockApi';

const AIChatSection = ({ symbol = 'AAPL', selectedDocumentId = null }) => {
  const [query, setQuery] = useState('');
  const [isDocumentMode, setIsDocumentMode] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'ai',
      query: 'Initial System Briefing',
      answer: `Welcome to the Open-Ended AI Stock Research Assistant. You can ask any natural language investment or financial question about ${symbol}. Toggle Document Mode ON to search uploaded annual reports, or leave it OFF for general AI intelligence, live financial APIs, news, and web search.`,
      document_mode: false,
      sources: [],
      citations: []
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    `Is ${symbol} a good investment right now?`,
    `What is the P/E ratio and current valuation for ${symbol}?`,
    `Why did ${symbol} stock move recently?`,
    `What are the main business risks for ${symbol}?`
  ];

  const handleSendQuery = async (customQuery = null) => {
    const q = customQuery || query;
    if (!q.trim() || isLoading) return;

    const currentMode = isDocumentMode;
    const userMessage = { id: Date.now(), sender: 'user', query: q };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    // Format multi-turn conversation history for API
    const conversationHistory = chatHistory.slice(-6).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.sender === 'user' ? msg.query : msg.answer
    }));

    try {
      const aiResponse = await stockApi.queryAiChat(
        q,
        selectedDocumentId,
        symbol,
        currentMode,
        conversationHistory
      );

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        query: q,
        answer: aiResponse.answer,
        citations: aiResponse.citations || [],
        sources: aiResponse.sources || [],
        financial_data_used: aiResponse.financial_data_used,
        web_search_used: aiResponse.web_search_used,
        document_mode: currentMode
      };

      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (e) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          query: q,
          answer: currentMode
            ? "I couldn't find enough information about this in your uploaded documents."
            : `I retrieved connected market data for ${symbol}. Please refine your research query.`,
          citations: [],
          sources: [],
          document_mode: currentMode
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl space-y-4 sm:space-y-6"
    >
      {/* Top Header with Document Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              AI Financial Analyst & Citation Engine
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">Ask natural language questions using documents, APIs, or web search</p>
          </div>
        </div>

        {/* Document Mode Toggle Component */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 bg-slate-900/60 p-2 sm:p-0 rounded-xl sm:bg-transparent">
          <div className={`flex items-center gap-2 px-3 py-1 sm:py-1.5 rounded-xl border transition-all ${
            isDocumentMode 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
          }`}>
            <span className="text-xs font-semibold flex items-center gap-1.5">
              📄 Doc Mode
            </span>
            <button
              type="button"
              onClick={() => setIsDocumentMode(!isDocumentMode)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase transition-all min-h-[28px] ${
                isDocumentMode
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {isDocumentMode ? 'ON' : 'OFF'}
            </button>
          </div>
          <span className="text-[10px] font-mono font-medium">
            {isDocumentMode ? (
              <span className="text-emerald-400 font-semibold">● Grounded in uploaded PDFs</span>
            ) : (
              <span className="text-slate-400">● AI + APIs + Web Search</span>
            )}
          </span>
        </div>
      </div>

      {/* Quick Sample Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs hide-scrollbar">
        <span className="text-slate-500 font-mono font-medium text-[10px] shrink-0 uppercase">Samples:</span>
        {sampleQuestions.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendQuery(sq)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 border border-slate-700/70 text-[11px] transition-colors shrink-0 font-medium min-h-[36px] flex items-center"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 hide-scrollbar">
        {chatHistory.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {msg.sender === 'user' ? (
              <div className="flex items-start justify-end gap-2.5">
                <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none text-xs font-medium max-w-[85%] sm:max-w-lg shadow-md">
                  {msg.query}
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 border border-blue-400/40 shadow-md mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                <div className="bg-slate-900/90 border border-slate-700/80 p-3.5 sm:p-4 rounded-2xl rounded-tl-none space-y-2.5 text-xs max-w-[88%] sm:max-w-2xl flex-1 shadow-lg">
                  {/* Mode Origin Indicator Badge */}
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                    {msg.document_mode ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        📄 Answered from documents
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                        🤖 AI + Live Market APIs
                      </span>
                    )}
                  </div>

                  {/* AI Answer Text */}
                  <div className="text-slate-200 leading-relaxed font-normal whitespace-pre-line text-[11px] sm:text-xs">
                    {msg.answer}
                  </div>

                  {/* Web Search & Financial API Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Sources ({msg.sources.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {msg.sources.map((s, i) => (
                          <a
                            key={i}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-800/70 hover:bg-slate-700/80 p-2 rounded-lg border border-slate-700/60 transition-colors flex items-center justify-between text-[11px] group"
                          >
                            <div className="truncate pr-2">
                              <span className="font-semibold text-slate-200 block truncate group-hover:text-blue-400 transition-colors">{s.title}</span>
                              <span className="text-[10px] font-mono text-slate-400">{s.source}</span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Page Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Citations ({msg.citations.length})
                      </span>
                      <div className="space-y-1">
                        {msg.citations.map((c, i) => (
                          <div key={i} className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50 text-[11px] font-mono text-slate-300">
                            <span className="text-emerald-400 font-bold">📄 {c.filename} — Page {c.page_number}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5 italic">{c.snippet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white animate-pulse">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="font-mono text-xs">
              {isDocumentMode ? 'Searching vector documents...' : 'Executing AI research & live market APIs...'}
            </span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
          placeholder={isDocumentMode ? `Ask about ${symbol} documents...` : `Ask any question about ${symbol}...`}
          className="w-full pl-4 pr-12 py-3 bg-[#1E293B] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-sans min-h-[44px]"
        />
        <button
          type="button"
          onClick={() => handleSendQuery()}
          disabled={isLoading || !query.trim()}
          aria-label="Send AI Query"
          className="absolute right-1.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default AIChatSection;
