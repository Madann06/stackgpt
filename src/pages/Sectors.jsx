import React, { useState, useEffect } from 'react';
import { stockApi } from '../services/stockApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart, ArrowUpRight, ArrowDownRight, Layers, ShieldCheck, Activity } from 'lucide-react';

const Sectors = () => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      setLoading(true);
      const data = await stockApi.getMarketSectors();
      setSectors(data || []);
      setLoading(false);
    };
    fetchSectors();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <PieChart className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Sectoral Performance & Rotations</h1>
          </div>
          <p className="text-sm text-neutral-light max-w-2xl">
            Analyze sectoral indices across Indian markets (NIFTY IT, BANK NIFTY, AUTO, PHARMA, FMCG). Track real-time relative strength, daily percentage changes, and top constituents.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner message="Fetching sectoral market metrics..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sec, idx) => {
            const isPos = (sec.change || 0) >= 0;
            return (
              <div
                key={sec.symbol || idx}
                className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-purple-500/40 transition-all space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">{sec.name}</h3>
                    <span className="text-xs font-mono text-slate-400">{sec.symbol}</span>
                  </div>
                  <span className={`flex items-center gap-1 font-mono text-sm font-bold px-2.5 py-1 rounded-lg ${
                    isPos ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {isPos ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {isPos ? '+' : ''}{(sec.change_percent || sec.changePercent || 0).toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Index Price</span>
                    <span className="text-2xl font-bold font-mono text-white">
                      ₹{(sec.current_price || sec.currentPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Day Range</span>
                    <span className="text-xs font-mono text-slate-300">
                      ₹{(sec.low || 0).toLocaleString('en-IN')} - ₹{(sec.high || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Market Weight: High</span>
                  <span className="text-purple-400 font-semibold cursor-pointer hover:underline">Explore Constituents →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sectors;
