import React, { useState } from 'react';
import { Layers, Calculator, TrendingUp, ShieldCheck, Award } from 'lucide-react';

const MF_DATA = [
  {
    name: "Parag Parikh Flexi Cap Fund",
    category: "Flexi Cap",
    nav: 84.25,
    cagr3y: 21.4,
    cagr5y: 24.8,
    expenseRatio: "0.62%",
    rating: "5 Star",
    aum: "₹72,400 Cr"
  },
  {
    name: "Nippon India Small Cap Fund",
    category: "Small Cap",
    nav: 178.60,
    cagr3y: 28.6,
    cagr5y: 31.2,
    expenseRatio: "0.67%",
    rating: "5 Star",
    aum: "₹56,200 Cr"
  },
  {
    name: "HDFC Mid-Cap Opportunities Fund",
    category: "Mid Cap",
    nav: 192.40,
    cagr3y: 25.1,
    cagr5y: 26.4,
    expenseRatio: "0.74%",
    rating: "5 Star",
    aum: "₹68,900 Cr"
  },
  {
    name: "SBI Bluechip Fund",
    category: "Large Cap",
    nav: 89.15,
    cagr3y: 16.8,
    cagr5y: 17.5,
    expenseRatio: "0.82%",
    rating: "4 Star",
    aum: "₹48,100 Cr"
  },
  {
    name: "UTI Nifty 50 Index Fund",
    category: "Index Fund",
    nav: 164.80,
    cagr3y: 15.2,
    cagr5y: 16.1,
    expenseRatio: "0.18%",
    rating: "5 Star",
    aum: "₹18,500 Cr"
  }
];

const MutualFunds = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredMfs = selectedCategory === 'ALL'
    ? MF_DATA
    : MF_DATA.filter(m => m.category === selectedCategory);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Mutual Funds & Index ETFs</h1>
          </div>
          <p className="text-sm text-neutral-light max-w-2xl">
            Compare top-performing Indian Direct Mutual Funds, Flexi Cap, Small Cap, and low-cost Index Funds with CAGR returns and expense ratio metrics.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto bg-slate-900 p-2 rounded-2xl border border-slate-800">
        {['ALL', 'Flexi Cap', 'Small Cap', 'Mid Cap', 'Large Cap', 'Index Fund'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Fund Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMfs.map((fund, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {fund.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5 leading-snug">{fund.name}</h3>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                {fund.rating}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Current NAV</span>
                <span className="font-bold text-white">₹{fund.nav}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">3Y CAGR</span>
                <span className="font-bold text-emerald-400">+{fund.cagr3y}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">5Y CAGR</span>
                <span className="font-bold text-emerald-400">+{fund.cagr5y}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Expense Ratio</span>
                <span className="font-bold text-slate-300">{fund.expenseRatio}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
              <span>AUM: <strong className="text-slate-200 font-mono">{fund.aum}</strong></span>
              <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">SIP Calculator →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MutualFunds;
