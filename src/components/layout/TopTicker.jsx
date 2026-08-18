import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { stockApi } from '../../services/stockApi';

const DEFAULT_INDICES = [
  { symbol: 'SENSEX', value: '82,145.30', change: '+120.50', pct: '+0.15%', isPositive: true },
  { symbol: 'NIFTY 50', value: '25,050.25', change: '+45.10', pct: '+0.18%', isPositive: true },
  { symbol: 'BANK NIFTY', value: '51,320.10', change: '-110.20', pct: '-0.21%', isPositive: false },
  { symbol: 'NIFTY IT', value: '42,150.75', change: '+320.40', pct: '+0.76%', isPositive: true },
  { symbol: 'NIFTY AUTO', value: '24,560.80', change: '-45.30', pct: '-0.18%', isPositive: false },
  { symbol: 'NIFTY PHARMA', value: '22,410.15', change: '+18.90', pct: '+0.08%', isPositive: true },
  { symbol: 'NIFTY FMCG', value: '61,720.50', change: '+85.20', pct: '+0.14%', isPositive: true },
  { symbol: 'NIFTY MIDCAP', value: '58,210.30', change: '+410.20', pct: '+0.71%', isPositive: true },
  { symbol: 'NIFTY SMALLCAP', value: '18,940.60', change: '+125.80', pct: '+0.67%', isPositive: true },
];

const TopTicker = () => {
  const [indices, setIndices] = useState(DEFAULT_INDICES);

  useEffect(() => {
    let isMounted = true;
    const fetchIndices = async () => {
      try {
        if (typeof stockApi.getMarketIndices === 'function') {
          const data = await stockApi.getMarketIndices();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const formatted = data.map(item => ({
              symbol: item.name || item.symbol,
              value: item.value || item.price,
              change: item.change,
              pct: item.percent || item.pct || item.changePercent,
              isPositive: item.isPositive !== undefined ? item.isPositive : (String(item.change || '').startsWith('+') || parseFloat(item.change) >= 0)
            }));
            setIndices(formatted);
          }
        }
      } catch (e) {
        // Fallback to default indices
      }
    };

    fetchIndices();
    return () => { isMounted = false; };
  }, []);

  const renderTickerTrack = () => (
    <div className="flex items-center gap-8 shrink-0">
      {indices.map((index, i) => (
        <div key={i} className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold tracking-wide ${
            index.symbol === 'SENSEX' || index.symbol === 'NIFTY 50' 
              ? 'text-white' 
              : 'text-slate-300'
          }`}>
            {index.symbol}
          </span>
          <span className="text-xs font-mono font-medium text-slate-100">{index.value}</span>
          <span className={`text-xs font-mono flex items-center font-bold ${index.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {index.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {index.pct}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-10 bg-[#0B1220] border-b border-white/5 overflow-hidden flex items-center relative z-20 w-full select-none">
      {/* Fixed LIVE Indicator Badge */}
      <div className="absolute left-0 top-0 bottom-0 bg-[#0B1220] z-20 px-3.5 flex items-center border-r border-white/5 shadow-lg">
        <span className="text-[10px] font-bold tracking-wider text-slate-300 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          LIVE
        </span>
      </div>
      
      {/* Overflow Hidden Continuous Animation Container */}
      <div className="w-full overflow-hidden flex items-center h-full pl-24">
        <div className="animate-ticker flex items-center gap-8 shrink-0">
          {/* Primary Set */}
          {renderTickerTrack()}
          {/* Duplicate Set for Seamless 100% Loop */}
          {renderTickerTrack()}
        </div>
      </div>
    </div>
  );
};

export default TopTicker;

