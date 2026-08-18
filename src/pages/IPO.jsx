import React, { useState, useEffect } from 'react';
import { stockApi } from '../services/stockApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { Rocket, Calculator, TrendingUp, Sparkles, CheckCircle2, Calendar, ShieldCheck, ArrowUpRight, DollarSign, Layers, Info, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IPO = () => {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedIpo, setSelectedIpo] = useState(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [numLots, setNumLots] = useState(1);

  useEffect(() => {
    const fetchIpoData = async () => {
      setLoading(true);
      const data = await stockApi.getIPOs();
      setIpos(data || []);
      setLoading(false);
    };
    fetchIpoData();
  }, []);

  const filteredIpos = ipos.filter(item => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ONGOING') return item.status === 'Ongoing (Open)';
    if (activeTab === 'UPCOMING') return item.status === 'Upcoming';
    if (activeTab === 'LISTED') return item.status === 'Recently Listed';
    return true;
  });

  const calcTotalInvestment = (ipo, lots) => {
    if (!ipo || !ipo.max_price || !ipo.lot_size) return 0;
    return ipo.max_price * ipo.lot_size * lots;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Rocket className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">IPO Center & Intelligence</h1>
          </div>
          <p className="text-sm text-neutral-light max-w-2xl">
            Track ongoing, upcoming, and recently listed Indian Initial Public Offerings (Mainboard & SME). Analyze Subscription Multipliers, Grey Market Premiums (GMP), and AI-generated listing signals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/80 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Data Source</div>
              <div className="text-xs font-semibold text-white">Verified SEBI / RHP Filings</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-900/60">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-neutral-light font-medium">Total Tracked IPOs</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><Layers className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{ipos.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Mainboard & SME Deals</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-900/60">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-neutral-light font-medium">Highest Demand (Sub X)</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">76.34x</div>
          <div className="text-[11px] text-slate-400 mt-1">Waaree Energies Ltd</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-900/60">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-neutral-light font-medium">Peak Listing Gain</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400"><ArrowUpRight className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">+107%</div>
          <div className="text-[11px] text-slate-400 mt-1">Bajaj Housing Finance</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-900/60">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-neutral-light font-medium">AI Top Rated</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400"><Sparkles className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">92 / 100</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Strong Listing Thesis</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All IPOs' },
            { id: 'ONGOING', label: 'Ongoing (Open)' },
            { id: 'UPCOMING', label: 'Upcoming' },
            { id: 'LISTED', label: 'Recently Listed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono px-3">
          Showing {filteredIpos.length} IPO entries
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner message="Fetching live SEBI & NSE IPO data..." />
        </div>
      ) : filteredIpos.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <Info className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No IPOs found in this category</h3>
          <p className="text-xs text-slate-400">Try switching to "All IPOs" or "Recently Listed" to view upcoming and active market issues.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIpos.map(ipo => {
            const isListed = ipo.status === 'Recently Listed';
            const isOngoing = ipo.status === 'Ongoing (Open)';
            const listingGain = ipo.listing_price && ipo.min_price
              ? (((ipo.listing_price - ipo.max_price) / ipo.max_price) * 100).toFixed(1)
              : null;

            return (
              <motion.div
                key={ipo.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-5 relative group"
              >
                {/* Top Row: Symbol & Badges */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                        {ipo.category} • {ipo.symbol}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1.5 group-hover:text-blue-400 transition-colors leading-snug">
                        {ipo.company}
                      </h3>
                      <p className="text-xs text-slate-400">{ipo.sector}</p>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isOngoing
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse'
                        : isListed
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {ipo.status}
                    </span>
                  </div>

                  {/* Pricing Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs font-mono">
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">Price Band</span>
                      <span className="font-bold text-slate-200">{ipo.price_band}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">Lot Size</span>
                      <span className="font-bold text-slate-200">{ipo.lot_size} Shares</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">Issue Size</span>
                      <span className="font-bold text-slate-200">{ipo.issue_size}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">Subscription</span>
                      <span className="font-bold text-emerald-400">{ipo.subscription_x > 0 ? `${ipo.subscription_x}x` : 'Awaiting Bids'}</span>
                    </div>
                  </div>

                  {/* GMP & AI Signal Bar */}
                  <div className="flex justify-between items-center pt-1 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Grey Market Premium (GMP)</span>
                      <span className={`font-mono font-bold ${ipo.gmp.startsWith('+') ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {ipo.gmp}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">AI Signal</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        ipo.ai_signal.includes('POSITIVE')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {ipo.ai_signal} ({ipo.ai_score}/100)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedIpo(ipo);
                      setNumLots(1);
                      setCalculatorOpen(true);
                    }}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5 text-blue-400" /> Bidding Calculator
                  </button>

                  <button
                    onClick={() => setSelectedIpo(ipo)}
                    className="py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Calculator Modal */}
      <AnimatePresence>
        {calculatorOpen && selectedIpo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedIpo.company}</h3>
                  <p className="text-xs text-blue-400 font-mono">Retail Bidding Amount Calculator</p>
                </div>
                <button
                  onClick={() => setCalculatorOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400">Cut-off Price (Upper Band)</span>
                  <span className="font-bold text-white">₹{selectedIpo.max_price}</span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400">Shares per Lot</span>
                  <span className="font-bold text-white">{selectedIpo.lot_size} Shares</span>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-slate-300 font-sans font-semibold block">Select Number of Lots</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setNumLots(Math.max(1, numLots - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 text-lg"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-lg text-white bg-slate-950 py-2 rounded-xl border border-slate-800">
                      {numLots} Lot ({numLots * selectedIpo.lot_size} Shares)
                    </span>
                    <button
                      onClick={() => setNumLots(numLots + 1)}
                      className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 space-y-2 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-sans">Total Bid Amount Required:</span>
                    <span className="text-xl font-bold text-blue-400">
                      ₹{calcTotalInvestment(selectedIpo, numLots).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-tight">
                    * Amount will be blocked in your bank account via UPI / ASBA until allotment date.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCalculatorOpen(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all text-xs"
              >
                Close Calculator
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IPO;
