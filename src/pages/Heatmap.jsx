import React, { useState, useEffect } from 'react';
import { stockApi } from '../services/stockApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart, Info, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Heatmap = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHeatmap = async () => {
    setLoading(true);
    const res = await stockApi.getMarketHeatmap();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const getBackgroundColor = (change) => {
    if (change >= 3) return 'bg-emerald-600 hover:bg-emerald-500';
    if (change > 0 && change < 3) return 'bg-emerald-500/80 hover:bg-emerald-400/80';
    if (change === 0) return 'bg-neutral-600 hover:bg-neutral-500';
    if (change < 0 && change > -3) return 'bg-red-500/80 hover:bg-red-400/80';
    return 'bg-red-600 hover:bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <PieChart className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Market Heatmap</h1>
        </div>
        <button 
          onClick={fetchHeatmap} 
          disabled={loading}
          className="p-2 rounded-lg bg-card border border-white/10 text-neutral-light hover:text-white transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-6 min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner message="Generating Market Heatmap..." />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-light">
            <Info className="w-8 h-8 mb-2 opacity-50" />
            <p>Data temporarily unavailable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {data.map((item) => (
              <Link
                to={`/company/${item.symbol}`}
                key={item.symbol}
                className={`
                  relative flex flex-col items-center justify-center p-6 rounded-lg 
                  transition-all duration-300 group
                  ${getBackgroundColor(item.change_percent)}
                `}
              >
                <div className="text-center z-10">
                  <h3 className="text-lg font-bold text-white tracking-wider mb-1">
                    {item.symbol.replace('.NS', '')}
                  </h3>
                  <p className="text-sm font-semibold text-white/90 font-mono">
                    {item.change_percent >= 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
                  </p>
                </div>
                
                {/* Sector Label */}
                <div className="absolute bottom-2 text-[10px] uppercase font-bold text-white/40 tracking-wider">
                  {item.sector}
                </div>

                {/* Status Indicator */}
                {item.status && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'LIVE' ? 'bg-success animate-pulse' : 'bg-neutral-light'}`}></span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-card/50 p-4 rounded-xl border border-white/5 text-xs text-neutral-light flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <span>Heatmap size corresponds to market capitalization, color indicates daily performance.</span>
        </div>
        <div className="flex items-center gap-1 opacity-70">
          <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
          <div className="w-3 h-3 bg-red-500/80 rounded-sm"></div>
          <div className="w-3 h-3 bg-neutral-600 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500/80 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
