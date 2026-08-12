import React from 'react';
import { Target, TrendingUp, AlertCircle, BarChart3, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ConfidenceCard = ({
  profitProbability = null,
  timeHorizon = 60,
  durationLabel = '1–3 Months',
  currentDuration = '1-3-months',
  historicalSamples = 0,
  profitableSamples = 0,
  lossSamples = 0,
  averageReturn = 0,
  medianReturn = 0,
  maxReturn = 0,
  maxLoss = 0,
  reliability = 'MODERATE',
  onHorizonChange = null,
  // Legacy props fallback
  confidence = null
}) => {
  const prob = profitProbability !== null && profitProbability !== undefined ? profitProbability : confidence;

  const DURATION_PILLS = [
    { key: 'intraday', label: 'Intraday' },
    { key: '1-5-days', label: '1–5D' },
    { key: '1-4-weeks', label: '1–4W' },
    { key: '1-3-months', label: '1–3M' },
    { key: '3-12-months', label: '3–12M' },
    { key: '1-3-years', label: '1–3Y' },
    { key: '3-plus-years', label: '3Y+' }
  ];

  const getReliabilityBadge = (rel) => {
    switch (rel?.toUpperCase()) {
      case 'HIGH':
        return { label: 'High Reliability', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'MODERATE':
        return { label: 'Moderate Reliability', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'LOW':
        return { label: 'Low Reliability', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'INSUFFICIENT_DATA':
      default:
        return { label: 'Insufficient Data', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    }
  };

  const relBadge = getReliabilityBadge(reliability);
  const isInsufficient = prob === null || prob === undefined || reliability === 'INSUFFICIENT_DATA' || historicalSamples < 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col justify-between"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Estimated Chance of Profit
          </h2>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${relBadge.color}`}>
          {relBadge.label}
        </span>
      </div>

      {/* Horizon Selector Pill Bar */}
      <div className="pt-3 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
          <Clock className="w-3.5 h-3.5 text-blue-400" /> Horizon:
        </span>
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 shrink-0">
          {DURATION_PILLS.map((p) => (
            <button
              key={p.key}
              onClick={() => onHorizonChange && onHorizonChange(p.key)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold transition-all ${
                currentDuration === p.key
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Probability Display */}
      <div className="py-4 flex flex-col items-center justify-center text-center">
        {isInsufficient ? (
          <div className="py-3 flex flex-col items-center gap-1 text-amber-400">
            <AlertCircle className="w-8 h-8" />
            <span className="text-base font-bold">Insufficient Historical Data</span>
            <span className="text-[11px] text-slate-400 max-w-[220px]">
              Fewer than 30 valid historical setups found for this specific horizon.
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl sm:text-5xl font-extrabold font-mono tracking-tight ${
                prob >= 65 ? 'text-emerald-400' : prob >= 50 ? 'text-blue-400' : 'text-amber-400'
              }`}>
                {prob}%
              </span>
              <span className="text-xs text-slate-400 font-mono">Win Rate</span>
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1 flex items-center gap-1">
              <span>Expected Horizon:</span>
              <strong className="text-blue-400 font-mono">{durationLabel || `${timeHorizon} Trading Days`}</strong>
            </p>
          </>
        )}
      </div>

      {/* Quantitative Backtest Breakdown Metrics */}
      <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400 flex items-center gap-1.5 font-sans">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Similar Historical Signals:
          </span>
          <span className="font-bold text-slate-100">{isInsufficient ? 0 : historicalSamples}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400 flex items-center gap-1.5 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Profitable / Losses:
          </span>
          <span className="font-bold">
            <span className="text-emerald-400">{profitableSamples}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-rose-400">{lossSamples}</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400 flex items-center gap-1.5 font-sans">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Avg / Median Return:
          </span>
          <span className="font-bold text-indigo-300">
            {averageReturn >= 0 ? `+${averageReturn}%` : `${averageReturn}%`}
            <span className="text-slate-500 font-normal mx-1">|</span>
            {medianReturn >= 0 ? `+${medianReturn}%` : `${medianReturn}%`}
          </span>
        </div>

        {(maxReturn !== 0 || maxLoss !== 0) && (
          <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5 font-sans">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Max Return / Max Loss:
            </span>
            <span className="font-bold">
              <span className="text-emerald-400">{maxReturn >= 0 ? `+${maxReturn}%` : `${maxReturn}%`}</span>
              <span className="text-slate-500 mx-1">|</span>
              <span className="text-rose-400">{maxLoss <= 0 ? `${maxLoss}%` : `-${maxLoss}%`}</span>
            </span>
          </div>
        )}
      </div>

      {/* Required Legal Disclaimer */}
      <p className="mt-3 text-[10px] text-slate-500 leading-tight text-center font-sans">
        Calculated from empirical historical market signals. Past statistical similarity does not guarantee future results.
      </p>
    </motion.div>
  );
};

export default ConfidenceCard;
