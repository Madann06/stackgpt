import React, { useState } from 'react';
import { Newspaper, ExternalLink, Tag, TrendingUp, AlertCircle, Clock } from 'lucide-react';

const MOCK_NEWS_DATA = [
  {
    id: 1,
    title: "RBI Keeps Repo Rate Unchanged at 6.5%, Maintains Policy Stance",
    summary: "The Reserve Bank of India's Monetary Policy Committee unanimously decided to keep the benchmark repo rate steady, citing controlled headline inflation and resilient domestic GDP growth projections.",
    source: "Financial Express",
    time: "2 hours ago",
    category: "Economy",
    sentiment: "POSITIVE",
    ticker: "BANKNIFTY"
  },
  {
    id: 2,
    title: "TCS Secures $1.5 Billion Multi-Year Cloud Transformation Deal in Europe",
    summary: "Tata Consultancy Services announced a major enterprise IT modernization contract with a top European telecom operator, driving strong international order book growth.",
    source: "Economic Times",
    time: "4 hours ago",
    category: "Corporate",
    sentiment: "POSITIVE",
    ticker: "TCS.NS"
  },
  {
    id: 3,
    title: "Reliance Industries Board Approves Bonus Share Issue in 1:1 Ratio",
    summary: "India's largest market-cap company announced a 1:1 bonus share issue for equity shareholders, alongside strong Q2 operating performance in retail and Jio digital services.",
    source: "Mint",
    time: "6 hours ago",
    category: "Earnings",
    sentiment: "POSITIVE",
    ticker: "RELIANCE.NS"
  },
  {
    id: 4,
    title: "Crude Oil Prices Ease Below $74 Barrel Amid Global Demand Forecasts",
    summary: "Brent crude futures declined sharply as international energy agencies revised demand growth estimates lower, benefiting Indian oil marketing companies (OMCs) and paint manufacturers.",
    source: "Reuters India",
    time: "8 hours ago",
    category: "Commodities",
    sentiment: "NEUTRAL",
    ticker: "OIL"
  },
  {
    id: 5,
    title: "SEBI Mandates T+0 Settlement Option Expansion for Top 500 Listed Stocks",
    summary: "Securities and Exchange Board of India introduced updated guidelines for same-day trade settlement across qualified brokers and retail investors.",
    source: "Business Standard",
    time: "12 hours ago",
    category: "Regulations",
    sentiment: "NEUTRAL",
    ticker: "SEBI"
  }
];

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredNews = selectedCategory === 'ALL'
    ? MOCK_NEWS_DATA
    : MOCK_NEWS_DATA.filter(n => n.category === selectedCategory);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Newspaper className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Market News & Corporate Announcements</h1>
          </div>
          <p className="text-sm text-neutral-light max-w-2xl">
            Real-time financial news, corporate earnings announcements, regulatory updates, and macroeconomic intelligence powering Indian stock markets.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto bg-slate-900 p-2 rounded-2xl border border-slate-800">
        {['ALL', 'Economy', 'Corporate', 'Earnings', 'Commodities', 'Regulations'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Stream Grid */}
      <div className="space-y-4">
        {filteredNews.map(item => (
          <div
            key={item.id}
            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col md:flex-row justify-between gap-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  {item.category}
                </span>
                <span className="text-slate-500">• {item.source}</span>
                <span className="text-slate-500">• {item.time}</span>
              </div>

              <h2 className="text-lg font-bold text-white hover:text-amber-400 cursor-pointer transition-colors leading-snug">
                {item.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>
            </div>

            <div className="flex md:flex-col justify-between items-end gap-3 flex-shrink-0">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                item.sentiment === 'POSITIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {item.sentiment} IMPACT
              </span>

              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                {item.ticker}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
