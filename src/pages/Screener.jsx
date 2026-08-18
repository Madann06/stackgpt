import React, { useState, useEffect } from 'react';
import { stockApi } from '../services/stockApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { Filter, Search, Sliders, ArrowUpDown, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Screener = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCap, setSelectedCap] = useState('ALL');
  const [minPe, setMinPe] = useState('');
  const [maxPe, setMaxPe] = useState('');
  const [minRoe, setMinRoe] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScreenerData = async () => {
      setLoading(true);
      const [large, mid, small] = await Promise.all([
        stockApi.getLargeCap(),
        stockApi.getMidCap(),
        stockApi.getSmallCap()
      ]);
      const combined = [
        ...(large || []).map(s => ({ ...s, cap: 'LARGE' })),
        ...(mid || []).map(s => ({ ...s, cap: 'MID' })),
        ...(small || []).map(s => ({ ...s, cap: 'SMALL' }))
      ];
      setStocks(combined);
      setLoading(false);
    };
    fetchScreenerData();
  }, []);

  const filteredStocks = stocks.filter(s => {
    if (selectedCap !== 'ALL' && s.cap !== selectedCap) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name && s.name.toLowerCase().includes(q);
      const matchSym = s.symbol && s.symbol.toLowerCase().includes(q);
      const matchSec = s.sector && s.sector.toLowerCase().includes(q);
      if (!matchName && !matchSym && !matchSec) return false;
    }
    if (minPe && s.pe_ratio !== null && s.pe_ratio < Number(minPe)) return false;
    if (maxPe && s.pe_ratio !== null && s.pe_ratio > Number(maxPe)) return false;
    if (minRoe && s.roe !== null && s.roe * 100 < Number(minRoe)) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sliders className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Institutional Stock Screener</h1>
          </div>
          <p className="text-sm text-neutral-light max-w-2xl">
            Filter Indian stocks by fundamental ratios (P/E, P/B, ROE, ROCE), market capitalization, and growth factors.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search company, symbol, or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono min-h-[44px]"
            />
          </div>

          {/* Market Cap Selector */}
          <div>
            <select
              value={selectedCap}
              onChange={(e) => setSelectedCap(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono min-h-[44px]"
            >
              <option value="ALL">All Market Caps</option>
              <option value="LARGE">Large Cap Only</option>
              <option value="MID">Mid Cap Only</option>
              <option value="SMALL">Small Cap Only</option>
            </select>
          </div>

          {/* Max P/E */}
          <div>
            <input
              type="number"
              placeholder="Max P/E Ratio (e.g. 25)"
              value={maxPe}
              onChange={(e) => setMaxPe(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono min-h-[44px]"
            />
          </div>

          {/* Min ROE */}
          <div>
            <input
              type="number"
              placeholder="Min ROE % (e.g. 15)"
              value={minRoe}
              onChange={(e) => setMinRoe(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Screener Results Table */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner message="Filtering verified stock fundamentals..." />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Matching Results: <strong className="text-white font-mono">{filteredStocks.length}</strong> stocks</span>
            <span className="text-[10px] font-mono text-slate-500 hidden xs:inline">Scroll horizontally for full metrics →</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-[10px] uppercase text-slate-400 font-mono tracking-wider border-b border-slate-800">
                  <th className="p-4 py-3">Company</th>
                  <th className="p-4 py-3 text-right">Price (₹)</th>
                  <th className="p-4 py-3 text-right">Change %</th>
                  <th className="p-4 py-3 text-right">P/E Ratio</th>
                  <th className="p-4 py-3 text-right">ROE %</th>
                  <th className="p-4 py-3 text-right">Cap Category</th>
                  <th className="p-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredStocks.map(stock => (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/company/${stock.symbol}`)}
                  >
                    <td className="p-4">
                      <div className="font-bold text-white text-sm font-sans">{stock.name}</div>
                      <div className="text-[10px] text-slate-400">{stock.symbol} • {stock.sector}</div>
                    </td>
                    <td className="p-4 text-right font-bold text-white">₹{stock.current_price?.toLocaleString('en-IN')}</td>
                    <td className={`p-4 text-right font-bold ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change_percent}%
                    </td>
                    <td className="p-4 text-right text-slate-300">{stock.pe_ratio ? stock.pe_ratio.toFixed(1) : '-'}</td>
                    <td className="p-4 text-right text-slate-300">{stock.roe ? (stock.roe * 100).toFixed(1) + '%' : '-'}</td>
                    <td className="p-4 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                        {stock.cap} CAP
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-xs text-blue-400 hover:underline font-semibold font-sans">
                        Research →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Screener;
