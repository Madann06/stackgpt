import React from 'react';
import { TrendingUp, TrendingDown, Star, Activity, Building, Globe, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const StockOverviewCard = ({ stock }) => {
  const { user, toggleWatchlist } = useAuth();
  if (!stock) return null;

  const isWatchlisted = user?.watchlist?.includes(stock.symbol);

  // Safe numerical extractions
  const curPrice = typeof stock.currentPrice === 'number' ? stock.currentPrice : (parseFloat(stock.currentPrice) || 0.0);
  const changeVal = typeof stock.change === 'number' ? stock.change : (parseFloat(stock.change) || 0.0);
  const changePctVal = typeof stock.changePercent === 'number' ? stock.changePercent : (parseFloat(stock.changePercent) || 0.0);
  const low = typeof stock.week52Low === 'number' ? stock.week52Low : (parseFloat(stock.week52Low) || (curPrice ? curPrice * 0.85 : 100.0));
  const high = typeof stock.week52High === 'number' ? stock.week52High : (parseFloat(stock.week52High) || (curPrice ? curPrice * 1.15 : 200.0));
  const rangePercent = high > low ? Math.min(Math.max(((curPrice - low) / (high - low)) * 100, 0), 100) : 50;

  const isINR = stock.currency === 'INR' || stock.symbol?.endsWith('.NS') || stock.symbol?.endsWith('.BO');
  const currencySymbol = isINR ? '₹' : '$';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl relative overflow-hidden group"
    >
      {/* Background Accent Glow */}
      <div 
        className={`absolute -right-20 -top-20 w-56 h-56 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors ${
          stock.isPositive ? 'bg-green-500' : 'bg-red-500'
        }`} 
      />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        
        {/* Company Identity */}
        <div className="flex items-center gap-4">
          <img
            src={stock.logo}
            alt={stock.name}
            className="w-14 h-14 rounded-2xl object-cover bg-slate-900 border border-slate-700/80 p-0.5 shadow-md"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
                {stock.symbol}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {stock.sector}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                {isINR ? 'NSE / BSE MARKET' : 'US MARKET'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-400 mt-0.5">{stock.name}</p>
          </div>
        </div>

        {/* Watchlist & Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => toggleWatchlist(stock.symbol)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isWatchlisted
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/60'
            }`}
          >
            <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
          </button>
        </div>
      </div>

      {/* Middle Price Row */}
      <div className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Current Price */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Price</span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
              {currencySymbol}{curPrice.toFixed(2)}
            </span>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-bold font-mono ${
              stock.isPositive 
                ? 'bg-green-500/15 text-green-400 border border-green-500/30' 
                : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}>
              {stock.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stock.isPositive ? '+' : ''}{currencySymbol}{changeVal.toFixed(2)} ({stock.isPositive ? '+' : ''}{changePctVal.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* 52-Week Range Progress Visualizer */}
        <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
            <span>52W Low: <strong className="text-slate-200">{currencySymbol}{low.toFixed(2)}</strong></span>
            <span className="text-slate-500 uppercase font-sans text-[10px] font-semibold">52-Week Price Range</span>
            <span>52W High: <strong className="text-slate-200">{currencySymbol}{high.toFixed(2)}</strong></span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                stock.isPositive ? 'bg-gradient-to-r from-blue-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-red-500'
              }`}
              style={{ width: `${rangePercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-mono">
            <span>Volume: {stock.avgVolume}</span>
            <span>Beta: {stock.beta}</span>
            <span>Industry: {stock.industry}</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default StockOverviewCard;
