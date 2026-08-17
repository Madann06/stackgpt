import React, { useState, useEffect } from 'react';
import { stockApi } from '../services/stockApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { LineChart, Globe, Activity, ArrowUpRight, ArrowDownRight, Clock, ShieldAlert, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);

const DataStatusBadge = ({ status, updatedTime, source }) => {
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
    <div className="flex flex-col items-end text-right">
      <div className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getColors()} flex items-center gap-1`}>
        {status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>}
        {status}
      </div>
      <span className="text-[9px] text-neutral-light mt-1">Src: {source}</span>
      <span className="text-[9px] text-neutral-light/70">{new Date(updatedTime * 1000).toLocaleTimeString()} IST</span>
    </div>
  );
};

const IndexCard = ({ index, onClick }) => {
  const isPos = index.change >= 0;
  
  return (
    <div 
      onClick={() => onClick(index)}
      className="glass-card p-5 rounded-xl border border-white/5 hover:border-primary/50 transition-colors cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-white group-hover:text-primary transition-colors">{index.name}</h3>
        <DataStatusBadge status={index.status} updatedTime={index.timestamp} source={index.source} />
      </div>
      
      <div className="flex justify-between items-end mt-4">
        <div>
          <div className="text-2xl font-mono font-bold text-white">{index.current_price.toLocaleString('en-IN')}</div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPos ? 'text-success' : 'text-danger'}`}>
            {isPos ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {isPos ? '+' : ''}{index.change.toFixed(2)} ({isPos ? '+' : ''}{index.change_percent.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5 text-xs text-neutral-light font-mono">
        <div><span className="font-sans text-neutral-light/70">Prev: </span>{index.open.toLocaleString()}</div>
        <div className="text-right"><span className="font-sans text-neutral-light/70">52W H: </span>{index.week_52_high.toLocaleString()}</div>
        <div><span className="font-sans text-neutral-light/70">Day H: </span>{index.high.toLocaleString()}</div>
        <div className="text-right"><span className="font-sans text-neutral-light/70">52W L: </span>{index.week_52_low.toLocaleString()}</div>
      </div>
    </div>
  );
};

const Markets = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indices, setIndices] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [status, setStatus] = useState(null);
  const [breadth, setBreadth] = useState(null);
  
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('1M');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [idxRes, curRes, statRes, breadthRes] = await Promise.all([
          stockApi.getMarketIndices(),
          stockApi.getMarketCurrencies(),
          stockApi.getMarketStatus(),
          stockApi.getMarketBreadth()
        ]);
        setIndices(idxRes || []);
        setCurrencies(curRes || []);
        setStatus(statRes);
        setBreadth(breadthRes);
        if (idxRes && idxRes.length > 0) {
          handleSelectIndex(idxRes[0], '1M');
        }
      } catch (e) {
        setError("Market data temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectIndex = async (idx, tf = timeframe) => {
    setSelectedIdx(idx);
    setTimeframe(tf);
    setChartLoading(true);
    const data = await stockApi.getStockChartData(idx.symbol, tf);
    setChartData(data || []);
    setChartLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <LoadingSpinner message="Fetching live Indian market data..." />
      </div>
    );
  }

  if (error || indices.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-danger opacity-50" />
        <h2 className="text-xl font-bold text-white">Live market data provider not configured.</h2>
        <p className="text-neutral-light">{error || "Verified data unavailable"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Indian Markets</h1>
            <p className="text-xs text-neutral-light flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status?.status === 'MARKET OPEN' ? 'bg-success animate-pulse' : 'bg-danger'}`}></span>
              {status?.status || "STATUS UNKNOWN"} • {status?.ist_time || "Offline"}
            </p>
          </div>
        </div>
        
        {/* Currencies */}
        <div className="flex gap-2 flex-wrap">
          {currencies.map(c => (
            <div key={c.symbol} className="bg-card border border-white/5 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-neutral-light mr-2">{c.name}</span>
              <span className="font-mono text-white">₹{c.current_price.toFixed(2)}</span>
              <span className={`ml-2 ${c.change >= 0 ? 'text-success' : 'text-danger'}`}>
                {c.change >= 0 ? '▲' : '▼'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Indices Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indices.map(idx => (
              <IndexCard key={idx.symbol} index={idx} onClick={handleSelectIndex} />
            ))}
          </div>
        </div>
        
        {/* Right Column: Chart & Breadth */}
        <div className="space-y-6">
          {/* Chart Card */}
          {selectedIdx && (
            <div className="glass-panel rounded-2xl p-5 border border-white/5 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">{selectedIdx.name} Chart</h3>
              </div>
              
              <div className="flex gap-1 mb-4 bg-background/50 p-1 rounded-lg w-max border border-white/5">
                {['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => handleSelectIndex(selectedIdx, tf)}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${timeframe === tf ? 'bg-primary text-white' : 'text-neutral-light hover:text-white hover:bg-white/5'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="h-[250px] w-full">
                {chartLoading ? (
                  <div className="w-full h-full flex justify-center items-center">
                    <LoadingSpinner message="Loading chart..." />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedIdx.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={selectedIdx.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="price" stroke={selectedIdx.change >= 0 ? '#10b981' : '#ef4444'} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <Link to={`/company/${selectedIdx.symbol}`} className="mt-4 block w-full text-center text-xs text-primary hover:underline font-semibold py-2 bg-primary/10 rounded-lg">
                View Advanced Research →
              </Link>
            </div>
          )}

          {/* Market Breadth */}
          <div className="glass-card p-5 rounded-2xl border border-white/5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> 
              Nifty 50 Breadth
            </h3>
            
            {breadth?.status === 'Available' ? (
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-mono">
                  <div className="text-success"><span className="text-white block font-sans font-bold text-lg">{breadth.advancing}</span> Advancing</div>
                  <div className="text-neutral-light text-center"><span className="text-white block font-sans font-bold text-lg">{breadth.unchanged}</span> Unchanged</div>
                  <div className="text-danger text-right"><span className="text-white block font-sans font-bold text-lg">{breadth.declining}</span> Declining</div>
                </div>
                
                {/* Breadth Bar */}
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/5">
                  <div style={{ width: `${(breadth.advancing / breadth.sample_size) * 100}%` }} className="bg-success h-full"></div>
                  <div style={{ width: `${(breadth.unchanged / breadth.sample_size) * 100}%` }} className="bg-neutral-light h-full"></div>
                  <div style={{ width: `${(breadth.declining / breadth.sample_size) * 100}%` }} className="bg-danger h-full"></div>
                </div>
                <p className="text-[10px] text-neutral-light text-center mt-2">Based on live tracking of top constituent stocks.</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-neutral-light opacity-50">Verified data unavailable.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Markets;
