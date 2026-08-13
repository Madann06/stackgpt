import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockIndices = [
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
  return (
    <div className="h-10 bg-background border-b border-white/5 overflow-hidden flex items-center relative z-20">
      <div className="absolute left-0 bg-background/90 backdrop-blur-sm z-10 px-3 h-full flex items-center border-r border-white/5">
        <span className="text-[10px] font-bold tracking-wider text-neutral-light flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          LIVE
        </span>
      </div>
      
      {/* Scroll container */}
      <div className="flex-1 overflow-x-auto hide-scrollbar pl-24 whitespace-nowrap flex items-center h-full">
        <div className="flex gap-6 pr-4">
          {mockIndices.map((index, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${
                index.symbol === 'SENSEX' || index.symbol === 'NIFTY 50' 
                  ? 'text-white' 
                  : 'text-neutral-light'
              }`}>
                {index.symbol}
              </span>
              <span className="text-xs text-white">{index.value}</span>
              <span className={`text-xs flex items-center ${index.isPositive ? 'text-success' : 'text-danger'}`}>
                {index.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {index.pct}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopTicker;
