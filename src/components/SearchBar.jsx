import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, TrendingDown, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { stockApi } from '../services/stockApi';

const SearchBar = ({ placeholder = "Search stock symbol or company name (e.g. AAPL, Tesla, Nvidia)...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const res = await stockApi.searchStocks(q);
        setResults(res || []);
      } catch (e) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectStock = (symbol) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/company/${symbol}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && results.length > 0) {
      handleSelectStock(results[0].symbol);
    }
  };

  const quickBadges = [
    { symbol: 'AAPL', label: 'Apple' },
    { symbol: 'NVDA', label: 'NVIDIA' },
    { symbol: 'TSLA', label: 'Tesla' },
    { symbol: 'MSFT', label: 'Microsoft' },
    { symbol: 'AMZN', label: 'Amazon' }
  ];

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input Box */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-11 pr-24 py-3 bg-[#1E293B]/90 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 shadow-lg text-sm md:text-base backdrop-blur-md transition-all"
        />
        
        {/* Right side controls */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {query && (
            <button
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400">
            <Sparkles className="w-3 h-3 text-blue-400" /> AI SEARCH
          </span>
        </div>
      </div>

      {/* Auto-complete Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-[#1E293B] border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-slate-800"
          >
            {isLoading ? (
              <div className="p-4 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Searching AI Stock Intelligence...
              </div>
            ) : results.length > 0 ? (
              <div>
                <div className="px-4 py-2 bg-slate-800/50 text-xs font-semibold text-slate-400 tracking-wider uppercase flex justify-between">
                  <span>Matching Tickers</span>
                  <span>AI Sentiment</span>
                </div>
                {results.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock.symbol)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={stock.logo}
                        alt={stock.name}
                        className="w-9 h-9 rounded-lg object-cover bg-slate-800 border border-slate-700"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                            {stock.sector}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{stock.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="font-mono text-sm font-semibold text-slate-100">
                          {stock.currency === 'INR' || stock.symbol.includes('.NS') || stock.symbol.includes('.BO') ? '₹' : '$'}
                          {typeof stock.currentPrice === 'number' && !isNaN(stock.currentPrice) ? stock.currentPrice.toFixed(2) : '0.00'}
                        </p>
                        <p className={`text-xs font-mono font-medium flex items-center justify-end gap-0.5 ${stock.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {stock.isPositive ? '+' : ''}{typeof stock.changePercent === 'number' && !isNaN(stock.changePercent) ? stock.changePercent.toFixed(2) : '0.00'}%
                        </p>
                      </div>
                      <div className="p-1 rounded-full text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400">
                <p className="text-sm">No stocks matching "<span className="text-slate-200">{query}</span>"</p>
                <p className="text-xs text-slate-500 mt-1">Try a company name or ticker such as AAPL, INFY, or YESBANK.NS.</p>
              </div>
            )}

            {/* Quick Suggestions Footer */}
            <div className="p-3 bg-slate-900/60 flex items-center gap-2 flex-wrap text-xs text-slate-400">
              <span className="font-medium text-slate-500">Popular:</span>
              {quickBadges.map((badge) => (
                <button
                  key={badge.symbol}
                  onClick={() => handleSelectStock(badge.symbol)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400 border border-slate-700 transition-all font-mono"
                >
                  ${badge.symbol}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
