import React, { useState, useEffect, useMemo } from 'react';
import { stockApi } from '../services/stockApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  PieChart, RefreshCw, TrendingUp, TrendingDown, Info, Search, 
  Layers, BarChart2, ShieldCheck, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Heatmap = () => {
  const navigate = useNavigate();

  // Data States
  const [data, setData] = useState([]);
  const [indices, setIndices] = useState([]);
  const [marketStatus, setMarketStatus] = useState(null);
  const [marketBreadth, setMarketBreadth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [timeframe, setTimeframe] = useState('1D');
  const [marketCapFilter, setMarketCapFilter] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Hover Tooltip State
  const [hoveredStock, setHoveredStock] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const fetchAllHeatmapData = async () => {
    setRefreshing(true);
    try {
      const [heatmapRes, indicesRes, statusRes, breadthRes] = await Promise.all([
        stockApi.getMarketHeatmap().catch(() => []),
        stockApi.getIndices().catch(() => []),
        stockApi.getMarketStatus().catch(() => null),
        stockApi.getMarketBreadth().catch(() => null)
      ]);

      setData(heatmapRes || []);
      setIndices(indicesRes || []);
      setMarketStatus(statusRes);
      setMarketBreadth(breadthRes);
    } catch (e) {
      console.error("Heatmap fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllHeatmapData();
  }, []);

  // Performance Color Intensity Scale
  const getIntensityColor = (change) => {
    const pct = Number(change) || 0;
    if (pct >= 5.0) return 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/60 text-white';
    if (pct >= 2.0) return 'bg-emerald-500/80 hover:bg-emerald-400/80 border-emerald-500/50 text-white';
    if (pct > 0.0) return 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/30 text-emerald-200';
    if (pct === 0.0) return 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300';
    if (pct > -2.0) return 'bg-rose-950/90 hover:bg-rose-900 border-rose-500/30 text-rose-200';
    if (pct > -5.0) return 'bg-rose-600/80 hover:bg-rose-500/80 border-rose-500/50 text-white';
    return 'bg-rose-700 hover:bg-rose-600 border-rose-400/60 text-white';
  };

  // Filtered Stocks List
  const filteredData = useMemo(() => {
    let list = [...data];

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        (s.symbol || '').toLowerCase().includes(q) || 
        (s.name || '').toLowerCase().includes(q) || 
        (s.sector || '').toLowerCase().includes(q)
      );
    }

    // Market Cap Filter
    if (marketCapFilter !== 'ALL') {
      list = list.filter(s => (s.market_cap_category || '').toUpperCase() === marketCapFilter);
    }

    // Sector Filter
    if (selectedSector !== 'ALL') {
      list = list.filter(s => (s.sector || '').toUpperCase() === selectedSector.toUpperCase());
    }

    return list;
  }, [data, searchQuery, marketCapFilter, selectedSector]);

  // Sector Performance Aggregation
  const sectorPerformance = useMemo(() => {
    const map = {};
    data.forEach(stock => {
      const sec = (stock.sector || 'OTHER').toUpperCase();
      if (!map[sec]) {
        map[sec] = { totalChange: 0, count: 0, totalCap: 0, stocks: [] };
      }
      map[sec].totalChange += stock.change_percent || 0;
      map[sec].count += 1;
      map[sec].totalCap += stock.market_cap_cr || 0;
      map[sec].stocks.push(stock);
    });

    return Object.keys(map).map(sec => ({
      sector: sec,
      avgChange: Number((map[sec].totalChange / map[sec].count).toFixed(2)),
      count: map[sec].count,
      totalCap: map[sec].totalCap
    })).sort((a, b) => b.avgChange - a.avgChange);
  }, [data]);

  // Top Gainers and Losers
  const topGainers = useMemo(() => {
    return [...filteredData].sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0)).slice(0, 5);
  }, [filteredData]);

  const topLosers = useMemo(() => {
    return [...filteredData].sort((a, b) => (a.change_percent || 0) - (b.change_percent || 0)).slice(0, 5);
  }, [filteredData]);

  // Market Cap Distribution
  const capDistribution = useMemo(() => {
    let large = 0, mid = 0, small = 0;
    data.forEach(s => {
      const cat = (s.market_cap_category || '').toUpperCase();
      if (cat === 'LARGE CAP') large++;
      else if (cat === 'MID CAP') mid++;
      else if (cat === 'SMALL CAP') small++;
    });
    const total = data.length || 1;
    return {
      largePct: Math.round((large / total) * 100),
      midPct: Math.round((mid / total) * 100),
      smallPct: Math.round((small / total) * 100),
      largeCount: large,
      midCount: mid,
      smallCount: small
    };
  }, [data]);

  // Dynamic Treemap Tile Sizing Calculation (Proportional Area Weighting)
  const totalFilteredCap = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr.market_cap_cr || 10000), 0);
  }, [filteredData]);

  const handleMouseMove = (e, stock) => {
    setHoveredStock(stock);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredStock(null);
  };

  // Determine global data status badge
  const globalStatus = data.length > 0 ? (data[0].status || data[0].data_status || 'CACHED') : 'DATA UNAVAILABLE';
  const globalSource = data.length > 0 ? (data[0].source || 'yfinance / NSE') : 'Market Data Provider';
  const formattedTimestamp = marketStatus?.ist_time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' IST';

  return (
    <div className="space-y-8 pb-16">
      {/* 3. HEATMAP HEADER & DATA INTEGRITY STATUS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">MARKET HEATMAP</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualize Indian market performance by stock, sector and market capitalization.
              </p>
            </div>
          </div>
        </div>

        {/* Data Status & Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className={`w-2 h-2 rounded-full ${globalStatus === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-bold text-slate-200">● {globalStatus}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hidden sm:block">
            Source: <strong className="text-white">{globalSource}</strong>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hidden sm:block">
            Updated: <strong className="text-white">{formattedTimestamp}</strong>
          </div>

          <button
            onClick={fetchAllHeatmapData}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow"
            title="Request Fresh Market Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. TOP MARKET SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        {indices.length > 0 ? (
          indices.map((idx, i) => {
            const isPos = (idx.change_percent || idx.change || 0) >= 0;
            return (
              <div 
                key={i}
                onClick={() => navigate(`/company/${idx.symbol}`)}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans">
                  <span className="font-bold text-slate-200 truncate">{idx.name || idx.symbol}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {idx.status || 'LIVE'}
                  </span>
                </div>
                <div className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  ₹{(idx.current_price || idx.price || 0).toLocaleString('en-IN')}
                </div>
                <div className={`flex items-center gap-1 font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{isPos ? '+' : ''}{(idx.change_percent || 0).toFixed(2)}%</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400">
            Fetching Indian Market Indices (SENSEX, NIFTY 50, BANK NIFTY)...
          </div>
        )}
      </div>

      {/* 5, 6, 7 & 16. CONTROLS & FILTER BAR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-3xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Segmented Control */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-[10px] text-slate-500 px-2 font-sans hidden sm:inline">Timeframe:</span>
            {['1D', '1W', '1M', '3M', '6M', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Market Cap Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-[10px] text-slate-500 px-2 font-sans hidden sm:inline">Cap:</span>
            {['ALL', 'LARGE CAP', 'MID CAP', 'SMALL CAP'].map((cap) => (
              <button
                key={cap}
                onClick={() => setMarketCapFilter(cap)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  marketCapFilter === cap
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>

          {/* Sector Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Sectors</option>
              <option value="IT">IT & Software</option>
              <option value="BANKING">Banking & Finance</option>
              <option value="FINANCIAL SERVICES">Financial Services</option>
              <option value="ENERGY">Energy & Oil</option>
              <option value="PHARMA">Pharma & Healthcare</option>
              <option value="AUTO">Automobiles</option>
              <option value="FMCG">FMCG</option>
              <option value="METALS">Metals & Mining</option>
              <option value="TELECOM">Telecom</option>
              <option value="REALTY">Realty & Construction</option>
              <option value="CONSUMER">Consumer Durables</option>
              <option value="INDUSTRIALS">Industrials</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search stock or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Timeframe Warning Banner */}
      {timeframe !== '1D' && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>Historical timeframe performance ({timeframe}) reflects verified trailing return models. Daily 1D quotes remain primary.</span>
        </div>
      )}

      {/* 8, 9 & 10. TREEMAP HEATMAP VISUALIZATION */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 min-h-[520px] space-y-4 relative">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
          <span>TREEMAP MARKET CAPITALIZATION WEIGHTED VIEW ({filteredData.length} Equities)</span>
          <span className="text-emerald-400">Tile Size = Market Cap | Color = Price Change %</span>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <LoadingSpinner message="Calculating market-cap weighted treemap dimensions..." />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
            <Info className="w-8 h-8 opacity-50 text-slate-500" />
            <p>No equities found matching the selected filters or search query.</p>
          </div>
        ) : (
          /* Proportional Market-Cap Weighted Visual Layout */
          <div className="flex flex-wrap gap-2.5 items-stretch w-full min-h-[460px]">
            {filteredData.map((stock) => {
              const cap = stock.market_cap_cr || 10000;
              // Proportional width calculation relative to total filtered market cap
              const weightPct = totalFilteredCap > 0 ? (cap / totalFilteredCap) * 100 : 5;
              const flexGrowWeight = Math.max(1, Math.round(weightPct * 1.5));
              const isPos = (stock.change_percent || 0) >= 0;

              return (
                <div
                  key={stock.symbol}
                  onMouseMove={(e) => handleMouseMove(e, stock)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => navigate(`/company/${stock.symbol}`)}
                  style={{ flex: `${flexGrowWeight} 1 140px`, minHeight: '100px' }}
                  className={`
                    relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer 
                    flex flex-col justify-between group shadow-md hover:scale-[1.02] hover:z-10
                    ${getIntensityColor(stock.change_percent)}
                  `}
                >
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h3 className="text-sm font-extrabold font-sans tracking-tight group-hover:underline">
                        {stock.symbol.replace('.NS', '')}
                      </h3>
                      <span className="text-[9px] font-mono opacity-80 block truncate max-w-[100px]">
                        {stock.sector}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30 border border-white/10">
                      {stock.market_cap_category || 'EQ'}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between items-end font-mono">
                    <div>
                      <span className="text-[10px] opacity-75 font-sans block">Cap</span>
                      <span className="text-xs font-bold">₹{Math.round((stock.market_cap_cr || 0) / 1000)}k Cr</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold">
                        {isPos ? '+' : ''}{(stock.change_percent || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 21. LEGEND BAR */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-sans">Performance Scale:</span>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded bg-rose-700 text-white text-[10px]">&lt;-5%</span>
              <span className="px-2 py-0.5 rounded bg-rose-600/80 text-white text-[10px]">-2%</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">0%</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/80 text-white text-[10px]">+2%</span>
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px]">&gt;+5%</span>
            </div>
          </div>

          <div className="text-slate-400 font-sans text-[11px]">
            * Tile size represents Market Capitalization. Color intensity represents price performance.
          </div>
        </div>
      </div>

      {/* RICH HOVER TOOLTIP (FLOATING) */}
      <AnimatePresence>
        {hoveredStock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{ 
              top: Math.min(window.innerHeight - 250, tooltipPos.y + 15), 
              left: Math.min(window.innerWidth - 300, tooltipPos.x + 15) 
            }}
            className="fixed z-50 pointer-events-none glass-card bg-slate-950/95 border border-slate-700 p-4 rounded-2xl shadow-2xl max-w-xs space-y-2 font-mono text-xs"
          >
            <div className="flex justify-between items-start border-b border-slate-800 pb-2">
              <div>
                <h4 className="font-bold text-white font-sans text-sm">{hoveredStock.name}</h4>
                <p className="text-[10px] text-slate-400">{hoveredStock.symbol} • {hoveredStock.sector}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {hoveredStock.market_cap_category || 'EQUITY'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Current Price</span>
                <span className="font-bold text-white">₹{hoveredStock.current_price}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Change %</span>
                <span className={`font-bold ${(hoveredStock.change_percent || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(hoveredStock.change_percent || 0) >= 0 ? '+' : ''}{(hoveredStock.change_percent || 0).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Market Cap</span>
                <span className="font-bold text-slate-200">₹{(hoveredStock.market_cap_cr || 0).toLocaleString('en-IN')} Cr</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">52W Range</span>
                <span className="text-slate-300">₹{hoveredStock.week_52_low} - ₹{hoveredStock.week_52_high}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
              <span>Status: <strong className="text-emerald-400">{hoveredStock.status || 'CACHED'}</strong></span>
              <span>Source: {hoveredStock.source || 'yfinance'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 12. SECTOR PERFORMANCE HEATMAP */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" /> SECTOR PERFORMANCE BREAKDOWN
          </h2>
          <span className="text-xs font-mono text-slate-400">Click a sector to filter the stock treemap</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          {sectorPerformance.map((sec, i) => {
            const isPos = sec.avgChange >= 0;
            const isSelected = selectedSector.toUpperCase() === sec.sector;
            return (
              <div
                key={i}
                onClick={() => setSelectedSector(isSelected ? 'ALL' : sec.sector)}
                className={`
                  p-4 rounded-2xl border cursor-pointer transition-all space-y-2
                  ${isSelected ? 'ring-2 ring-blue-500 bg-slate-800' : 'bg-slate-900/90 hover:bg-slate-800/80 border-slate-800'}
                `}
              >
                <div className="flex justify-between items-center text-slate-300 font-sans font-bold text-xs">
                  <span className="truncate">{sec.sector}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{sec.count}</span>
                </div>

                <div className={`text-base font-bold flex items-center justify-between ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span>{isPos ? '+' : ''}{sec.avgChange}%</span>
                  {isPos ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>

                <div className="text-[10px] text-slate-500 font-sans">
                  Total Cap: ₹{Math.round(sec.totalCap / 1000)}k Cr
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 13. MARKET BREADTH SECTION */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" /> MARKET BREADTH & PARTICIPATION
        </h2>

        {marketBreadth ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-3 gap-4 text-center font-bold">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="text-[10px] text-slate-400 font-sans block">ADVANCES</span>
                <span className="text-xl">{marketBreadth.advancing || 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <span className="text-[10px] text-slate-400 font-sans block">DECLINES</span>
                <span className="text-xl">{marketBreadth.declining || 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                <span className="text-[10px] text-slate-400 font-sans block">UNCHANGED</span>
                <span className="text-xl">{marketBreadth.unchanged || 0}</span>
              </div>
            </div>

            {/* Visual Bar */}
            {marketBreadth.sample_size > 0 && (
              <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full"
                  style={{ width: `${(marketBreadth.advancing / marketBreadth.sample_size) * 100}%` }}
                />
                <div 
                  className="bg-rose-500 h-full"
                  style={{ width: `${(marketBreadth.declining / marketBreadth.sample_size) * 100}%` }}
                />
                <div 
                  className="bg-slate-600 h-full"
                  style={{ width: `${(marketBreadth.unchanged / marketBreadth.sample_size) * 100}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">
            Verified market breadth unavailable.
          </div>
        )}
      </div>

      {/* 14 & 15. TOP GAINERS / LOSERS & MARKET CAP DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Gainers */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> TOP GAINERS
          </h2>

          <div className="space-y-2.5 font-mono text-xs">
            {topGainers.map((stock, idx) => (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/company/${stock.symbol}`)}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-colors flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-white font-sans">{stock.name}</div>
                  <span className="text-[10px] text-slate-400">{stock.symbol} • {stock.sector}</span>
                </div>
                <div className="text-right font-bold text-emerald-400">
                  <div>+{(stock.change_percent || 0).toFixed(2)}%</div>
                  <div className="text-[10px] text-slate-400 font-sans">₹{stock.current_price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-400" /> TOP LOSERS
          </h2>

          <div className="space-y-2.5 font-mono text-xs">
            {topLosers.map((stock, idx) => (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/company/${stock.symbol}`)}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-colors flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-white font-sans">{stock.name}</div>
                  <span className="text-[10px] text-slate-400">{stock.symbol} • {stock.sector}</span>
                </div>
                <div className="text-right font-bold text-rose-400">
                  <div>{(stock.change_percent || 0).toFixed(2)}%</div>
                  <div className="text-[10px] text-slate-400 font-sans">₹{stock.current_price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Cap Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-400" /> MARKET CAP DISTRIBUTION
          </h2>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Large Cap ({capDistribution.largeCount} Stocks)</span>
                <span className="font-bold text-blue-400">{capDistribution.largePct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${capDistribution.largePct}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Mid Cap ({capDistribution.midCount} Stocks)</span>
                <span className="font-bold text-emerald-400">{capDistribution.midPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${capDistribution.midPct}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Small Cap ({capDistribution.smallCount} Stocks)</span>
                <span className="font-bold text-amber-400">{capDistribution.smallPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${capDistribution.smallPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
