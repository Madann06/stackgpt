import React, { useState, useEffect } from 'react';
import { stockApi } from '../services/stockApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useUserFeatures } from '../context/UserFeaturesContext';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Activity, Filter, Info, ChevronRight, Star, Plus, CheckCircle, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

const formatINR = (val, isCompact=false) => {
  if (val === undefined || val === null) return '-';
  if (isCompact && val > 100000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
};

const DataStatusBadge = ({ status, updatedTime, source, className="" }) => {
  const getColors = () => {
    switch(status) {
      case 'LIVE': return 'bg-success/20 text-success border-success/30';
      case 'DELAYED': return 'bg-warning/20 text-warning border-warning/30';
      case 'CACHED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'HISTORICAL': return 'bg-neutral/20 text-neutral-light border-neutral/30';
      default: return 'bg-danger/20 text-danger border-danger/30';
    }
  };
  return (
    <div className={`flex flex-col text-right ${className}`}>
      <div className={`text-[8px] uppercase font-bold px-1 py-0.5 rounded border ${getColors()} flex items-center justify-end gap-1 w-max ml-auto`}>
        {status === 'LIVE' && <span className="w-1 h-1 rounded-full bg-success animate-pulse"></span>}
        {status}
      </div>
    </div>
  );
};

const AIResearchRecommendationBar = () => (
  <div className="glass-panel p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-[#0B1220] to-[#0d1829] mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-primary/20 rounded-lg"><Activity className="w-5 h-5 text-primary" /></div>
      <h2 className="text-xl font-bold text-white tracking-wide">AI RESEARCH RECOMMENDATIONS</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-success/5 border border-success/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
          <h3 className="font-bold text-white">POSITIVE</h3>
        </div>
        <p className="text-xs text-neutral-light">Stocks showing stronger verified factors across fundamentals and momentum.</p>
      </div>
      <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
          <h3 className="font-bold text-white">WATCH</h3>
        </div>
        <p className="text-xs text-neutral-light">Stocks showing mixed signals requiring further fundamental analysis.</p>
      </div>
      <div className="p-4 rounded-xl bg-danger/5 border border-danger/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-danger"></span>
          <h3 className="font-bold text-white">NEGATIVE</h3>
        </div>
        <p className="text-xs text-neutral-light">Stocks showing significant risk factors, weak growth, or poor technicals.</p>
      </div>
    </div>
    <div className="mt-4 flex items-start gap-2 text-[10px] text-neutral-light/60">
      <ShieldAlert className="w-3 h-3 flex-shrink-0 mt-0.5" />
      <p>StockAI India provides AI-generated market research and educational information. It is not investment advice, a recommendation to buy or sell securities, or a guarantee of returns.</p>
    </div>
  </div>
);

const QuickAnalysisPanel = ({ stock, onClose }) => {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToWishlist, removeFromWishlist, wishlist } = useUserFeatures();
  const navigate = useNavigate();
  const isWishlisted = wishlist.some(w => w.symbol === stock.symbol);

  useEffect(() => {
    const fetchAI = async () => {
      setLoading(true);
      const res = await stockApi.getAiClassifier(stock.symbol);
      setAiData(res);
      setLoading(false);
    };
    fetchAI();
  }, [stock.symbol]);

  const toggleWishlist = () => {
    if (isWishlisted) removeFromWishlist(stock.symbol);
    else addToWishlist(stock);
  };

  return (
    <div className="bg-[#0B1220] border-l border-white/10 w-[350px] p-6 h-[calc(100vh-80px)] overflow-y-auto sticky top-20 hidden lg:block">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-white leading-tight">{stock.name}</h2>
          <span className="text-sm font-mono text-neutral-light">{stock.symbol}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">✕</button>
      </div>

      <div className="mb-6 flex justify-between items-end">
        <div>
          <div className="text-3xl font-bold font-mono text-white">{formatINR(stock.current_price)}</div>
          <div className={`font-semibold ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
            {stock.change >= 0 ? '▲' : '▼'} {stock.change} ({stock.change_percent}%)
          </div>
        </div>
        <DataStatusBadge status={stock.status} updatedTime={stock.timestamp} source={stock.source} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
        <div className="bg-card p-3 rounded-lg border border-white/5">
          <div className="text-neutral-light text-xs">P/E Ratio</div>
          <div className="font-mono text-white">{stock.pe_ratio ? stock.pe_ratio.toFixed(2) : '-'}</div>
        </div>
        <div className="bg-card p-3 rounded-lg border border-white/5">
          <div className="text-neutral-light text-xs">ROE</div>
          <div className="font-mono text-white">{stock.roe ? (stock.roe * 100).toFixed(2) + '%' : '-'}</div>
        </div>
        <div className="bg-card p-3 rounded-lg border border-white/5">
          <div className="text-neutral-light text-xs">Div Yield</div>
          <div className="font-mono text-white">{stock.dividend_yield ? (stock.dividend_yield * 100).toFixed(2) + '%' : '-'}</div>
        </div>
        <div className="bg-card p-3 rounded-lg border border-white/5">
          <div className="text-neutral-light text-xs">Debt/Equity</div>
          <div className="font-mono text-white">{stock.debt_to_equity ? stock.debt_to_equity.toFixed(2) : '-'}</div>
        </div>
      </div>

      <div className="mb-6 border border-white/10 rounded-xl p-4 bg-card relative overflow-hidden">
        <h3 className="text-sm font-bold text-white mb-4">AI RESEARCH SIGNAL</h3>
        {loading ? (
          <div className="flex justify-center p-4"><LoadingSpinner /></div>
        ) : aiData?.signal === "INSUFFICIENT DATA" ? (
          <div className="text-center p-4">
            <AlertCircle className="w-8 h-8 text-neutral-light mx-auto mb-2 opacity-50" />
            <div className="text-xs font-bold text-neutral-light">{aiData.signal}</div>
            <div className="text-[10px] text-neutral-light mt-1">{aiData.message}</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`text-lg font-black tracking-wider ${
                aiData.signal.includes('POSITIVE') ? 'text-success' : 
                aiData.signal.includes('NEGATIVE') ? 'text-danger' : 'text-warning'
              }`}>
                {aiData.signal}
              </div>
              <div className="text-xs font-mono bg-white/5 px-2 py-1 rounded">Score: {aiData.score}/100</div>
            </div>
            
            {aiData.bullish_factors?.length > 0 && (
              <div className="text-xs">
                <div className="font-bold text-success mb-1">Bullish Factors</div>
                <ul className="space-y-1 text-neutral-light">
                  {aiData.bullish_factors.map((f, i) => <li key={i} className="flex gap-2"><CheckCircle className="w-3 h-3 text-success mt-0.5" />{f}</li>)}
                </ul>
              </div>
            )}
            {aiData.bearish_factors?.length > 0 && (
              <div className="text-xs mt-2">
                <div className="font-bold text-danger mb-1">Risk Factors</div>
                <ul className="space-y-1 text-neutral-light">
                  {aiData.bearish_factors.map((f, i) => <li key={i} className="flex gap-2"><AlertTriangle className="w-3 h-3 text-danger mt-0.5" />{f}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={() => navigate(`/company/${stock.symbol}`)} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors">
          View Full Analysis
        </button>
        <button onClick={toggleWishlist} className={`w-full py-3 font-bold rounded-xl border flex items-center justify-center gap-2 transition-colors ${isWishlisted ? 'border-success text-success bg-success/10' : 'border-white/20 text-white hover:bg-white/5'}`}>
          <Star className={`w-4 h-4 ${isWishlisted ? 'fill-success' : ''}`} />
          {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
        </button>
      </div>
    </div>
  );
};

const TopPerformers = () => {
  const [activeTab, setActiveTab] = useState('LARGE CAP');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);

  const fetchCategoryData = async (category) => {
    setLoading(true);
    setSelectedStock(null);
    try {
      let data = [];
      if (category === 'LARGE CAP') data = await stockApi.getLargeCap();
      else if (category === 'MID CAP') data = await stockApi.getMidCap();
      else if (category === 'SMALL CAP') data = await stockApi.getSmallCap();
      setStocks(data || []);
    } catch (e) {
      setError("Market data temporarily unavailable.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategoryData(activeTab);
  }, [activeTab]);

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Top Performers & Stock Intelligence</h1>
            <p className="text-sm text-neutral-light">Analyze Indian stocks by market capitalization, sector, and fundamentals.</p>
          </div>
        </div>

        <AIResearchRecommendationBar />

        {/* Cap Tabs */}
        <div className="flex bg-card p-1 rounded-xl border border-white/5 w-max">
          {['LARGE CAP', 'MID CAP', 'SMALL CAP'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-neutral-light hover:text-white hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="h-96 flex justify-center items-center"><LoadingSpinner /></div>
          ) : error || stocks.length === 0 ? (
            <div className="h-96 flex flex-col justify-center items-center text-neutral-light">
              <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
              <p>{error || "Verified data unavailable"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase text-neutral-light tracking-wider border-b border-white/10">
                    <th className="p-4 py-3 font-semibold">Company</th>
                    <th className="p-4 py-3 font-semibold text-right">Price (₹)</th>
                    <th className="p-4 py-3 font-semibold text-right">Change %</th>
                    <th className="p-4 py-3 font-semibold text-right hidden md:table-cell">Mkt Cap</th>
                    <th className="p-4 py-3 font-semibold text-right hidden lg:table-cell">P/E</th>
                    <th className="p-4 py-3 font-semibold text-right hidden lg:table-cell">ROE</th>
                    <th className="p-4 py-3 font-semibold text-right">Data Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stocks.map(stock => (
                    <tr 
                      key={stock.symbol} 
                      onClick={() => setSelectedStock(stock)}
                      className={`hover:bg-white/5 cursor-pointer transition-colors ${selectedStock?.symbol === stock.symbol ? 'bg-white/10' : ''}`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{stock.name}</div>
                        <div className="text-[10px] text-neutral-light font-mono">{stock.symbol} • {stock.sector}</div>
                      </td>
                      <td className="p-4 text-right font-mono font-semibold text-white">{stock.current_price.toLocaleString('en-IN')}</td>
                      <td className={`p-4 text-right font-mono font-bold ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change_percent}%
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-neutral-light hidden md:table-cell">{formatINR(stock.market_cap, true)}</td>
                      <td className="p-4 text-right font-mono text-sm text-neutral-light hidden lg:table-cell">{stock.pe_ratio ? stock.pe_ratio.toFixed(1) : '-'}</td>
                      <td className="p-4 text-right font-mono text-sm text-neutral-light hidden lg:table-cell">{stock.roe ? (stock.roe*100).toFixed(1)+'%' : '-'}</td>
                      <td className="p-4 text-right">
                        <DataStatusBadge status={stock.status} updatedTime={stock.timestamp} source={stock.source} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Analysis Side Panel */}
      {selectedStock && (
        <QuickAnalysisPanel stock={selectedStock} onClose={() => setSelectedStock(null)} />
      )}
    </div>
  );
};

export default TopPerformers;
