import React, { useState } from 'react';
import { Clock, Sparkles, ShieldAlert, ArrowRight, Check, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export const DURATION_OPTIONS = [
  {
    key: 'intraday',
    label: 'Intraday',
    period: 'Same Day',
    focus: 'Intraday price action, volume spikes & momentum'
  },
  {
    key: '1-5-days',
    label: '1–5 Days',
    period: 'Micro Swing',
    focus: 'Short-term momentum, 5-day EMA & news catalysts'
  },
  {
    key: '1-4-weeks',
    label: '1–4 Weeks',
    period: 'Short Term',
    focus: '20-day trend, swing momentum & event triggers'
  },
  {
    key: '1-3-months',
    label: '1–3 Months',
    period: 'Medium Term',
    focus: 'Quarterly earnings, sector rotation & financial health'
  },
  {
    key: '3-12-months',
    label: '3–12 Months',
    period: 'Annual Outlook',
    focus: 'Revenue growth, valuation multiples & earnings trends'
  },
  {
    key: '1-3-years',
    label: '1–3 Years',
    period: 'Long Term',
    focus: 'Balance sheet safety, ROE compounding & industry position'
  },
  {
    key: '3-plus-years',
    label: '3+ Years',
    period: 'Secular Horizon',
    focus: 'Secular moat, multi-year cash flow compounding & growth'
  }
];

const DurationSelector = ({ selectedDuration, onSelectDuration, onAnalyze, isAnalyzing, symbol }) => {
  const [activeSelection, setActiveSelection] = useState(selectedDuration || null);

  const handleSelect = (key) => {
    setActiveSelection(key);
    if (onSelectDuration) {
      onSelectDuration(key);
    }
  };

  const handleRunAnalysis = () => {
    if (!activeSelection) return;
    if (onAnalyze) {
      onAnalyze(activeSelection);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-2xl space-y-6 relative overflow-hidden bg-slate-900/80 backdrop-blur-md"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Select Investment / Trading Duration
              {symbol && <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">${symbol}</span>}
            </h2>
            <p className="text-xs text-slate-400">
              Predictions, profit probability, risk profiles, and price targets require a defined time horizon.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Selection Required
          </span>
        </div>
      </div>

      {/* Duration Choice Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {DURATION_OPTIONS.map((opt) => {
          const isSelected = activeSelection === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSelect(opt.key)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-600/25 to-blue-900/40 border-blue-500 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-400'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                  {opt.label}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-mono block mt-1 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                {opt.period}
              </span>

              <p className={`text-[10px] mt-2 line-clamp-2 leading-tight ${isSelected ? 'text-slate-200' : 'text-slate-500 group-hover:text-slate-400'}`}>
                {opt.focus}
              </p>
            </button>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-400" />
          {activeSelection ? (
            <span>Selected Horizon: <strong className="text-blue-300 font-mono">{DURATION_OPTIONS.find(o => o.key === activeSelection)?.label}</strong></span>
          ) : (
            <span className="text-amber-400">Please choose a holding duration above to enable prediction analysis.</span>
          )}
        </div>

        <button
          type="button"
          disabled={!activeSelection || isAnalyzing}
          onClick={handleRunAnalysis}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
            activeSelection && !isAnalyzing
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-[1.02] cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-blue-300" />
              <span>Analyzing Horizon...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Analyze Stock</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default DurationSelector;
