import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { stockApi } from '../services/stockApi';

/**
 * Format raw price number with proper commas and currency symbol
 */
const formatTickerPrice = (price, currency = '') => {
  if (price === undefined || price === null || isNaN(price)) return 'N/A';
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency}${formatted}` : formatted;
};

/**
 * Format raw change amount with +/- sign
 */
const formatTickerChange = (change) => {
  if (change === undefined || change === null || isNaN(change)) return '';
  const prefix = change > 0 ? '+' : '';
  return `${prefix}${change.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format percentage change string
 */
const formatTickerPercent = (pct) => {
  if (pct === undefined || pct === null || isNaN(pct)) return '0.00%';
  const prefix = pct > 0 ? '+' : '';
  return `${prefix}${pct.toFixed(2)}%`;
};

const TopMarketTicker = () => {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      const data = await stockApi.getMarketTickerQuotes();
      if (Array.isArray(data) && data.length > 0) {
        setQuotes(data);
      }
    } catch (err) {
      console.warn('TopMarketTicker fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetchQuotes();

    // Auto-refresh market data every 60 seconds
    const intervalId = setInterval(() => {
      if (isMounted) {
        fetchQuotes();
      }
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Display items twice to form a seamless infinite loop track
  const displayItems = quotes.length > 0 ? [...quotes, ...quotes] : [];

  return (
    <div className="w-full bg-slate-950/95 text-xs border-b border-slate-800/80 font-mono text-slate-300 overflow-hidden select-none">
      <div className="flex items-center justify-between px-4 py-1.5 gap-4">
        
        {/* Left Fixed Badge */}
        <div className="flex items-center gap-2 shrink-0 z-10 bg-slate-950 pr-3 border-r border-slate-800/60 shadow-lg">
          <span className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-blue-400" />
            <span>LIVE MARKET TICKER</span>
          </span>
        </div>

        {/* Moving Ticker Marquee Track */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee items-center gap-8 py-0.5 whitespace-nowrap">
            {displayItems.map((item, idx) => {
              const isPositive = item.is_positive ?? (item.change_percent >= 0);
              const changeStr = formatTickerChange(item.change);
              const pctStr = formatTickerPercent(item.change_percent);
              const priceStr = formatTickerPrice(item.price, item.currency);

              return (
                <div 
                  key={`${item.symbol}-${idx}`}
                  className="inline-flex items-center gap-2 px-2 py-0.5 rounded transition-colors hover:bg-slate-800/60 cursor-pointer"
                  title={`${item.name} (${item.category}): ${priceStr}`}
                >
                  {/* Symbol / Instrument Name */}
                  <span className="font-bold text-slate-200 tracking-tight">
                    {item.name}
                  </span>

                  {/* Current Price */}
                  <span className="text-slate-300 font-medium ml-0.5">
                    {priceStr}
                  </span>

                  {/* Price Change & Percentage */}
                  <span className={`font-semibold ml-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {changeStr ? `${changeStr} (${pctStr})` : pctStr}
                  </span>

                  {/* Divider Bullet */}
                  <span className="text-slate-700 ml-3">•</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="hidden xl:flex items-center gap-4 text-[11px] text-slate-400 shrink-0 z-10 bg-slate-950 pl-3 border-l border-slate-800/60">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">AI Engine Online</span>
          </span>
          <span className="text-slate-400 font-mono">Latency: 14ms</span>
        </div>

      </div>
    </div>
  );
};

export default TopMarketTicker;
