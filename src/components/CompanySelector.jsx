import React, { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, Building2, ChevronRight, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES, COMPANY_CATALOG } from '../data/companyCatalog';
import { stockApi } from '../services/stockApi';

const CompanySelector = ({ onSelectCompany }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await stockApi.searchStocks(searchQuery);
      setSearchResults(res);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      if (searchResults.length > 0) {
        return searchResults.map(item => ({
          symbol: item.symbol,
          name: item.name,
          sector: item.sector || 'General',
          industry: item.industry || 'Equities',
          logo: item.logo || 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120&auto=format&fit=crop&q=80'
        }));
      }
      return COMPANY_CATALOG.filter((comp) => {
        const matchesSearch =
          comp.symbol.toLowerCase().includes(q) ||
          comp.name.toLowerCase().includes(q) ||
          comp.industry.toLowerCase().includes(q);

        const matchesCategory =
          selectedCategory === 'All' || comp.sector === selectedCategory;

        return matchesSearch && matchesCategory;
      });
    }

    return COMPANY_CATALOG.filter((comp) => {
      return selectedCategory === 'All' || comp.sector === selectedCategory;
    });
  }, [searchQuery, selectedCategory, searchResults]);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4"
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" /> COMPANY INTELLIGENCE BROWSER
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Select a Company for AI Financial Analysis
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Search or browse global equities by industry category. Select a company to launch deep quantitative backtesting and grounded annual report analysis.
        </p>

        {/* Search Input Bar */}
        <div className="pt-2 max-w-xl relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name or ticker (e.g. NVIDIA, NVDA, Apple, AAPL, Tesla)..."
            className="w-full pl-12 pr-4 py-3 bg-slate-950/80 text-slate-100 rounded-2xl border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all placeholder:text-slate-500"
          />
        </div>
      </motion.div>

      {/* Category Tabs Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
          <Filter className="w-4 h-4 text-blue-400" /> Filter by Category:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Company List / Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Available Companies ({filteredCompanies.length})</span>
          {selectedCategory !== 'All' && <span>Category: <strong>{selectedCategory}</strong></span>}
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-400 space-y-3 border border-slate-800">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No Companies Found</h3>
            <p className="text-xs">No matching company for "{searchQuery}". Try searching for NVDA, AAPL, or TSLA.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCompanies.map((comp) => (
              <motion.div
                key={comp.symbol}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectCompany(comp.symbol)}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between group transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <img
                      src={comp.logo}
                      alt={comp.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700/60 group-hover:ring-blue-500/40 transition-all"
                    />
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      ${comp.symbol}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                      {comp.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{comp.industry}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-400 transition-colors">
                  <span className="text-[11px] font-mono text-slate-500">{comp.sector}</span>
                  <span className="flex items-center gap-1 font-semibold text-xs">
                    Analyze <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySelector;
