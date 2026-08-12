import React from 'react';
import { Target, Award, ArrowUpRight, TrendingUp, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const RecommendationCard = ({ recommendation, recommendationScore, analystTargets, durationLabel = null }) => {
  const rec = recommendation || 'BUY';
  const score = recommendationScore || 8.0;
  const targets = analystTargets || { low: 180, average: 240, high: 270, totalAnalysts: 35 };
  const avgP = targets.average !== undefined ? targets.average : (targets.base !== undefined ? targets.base : 200);

  // Color mapping based on recommendation
  const getBadgeStyle = (r) => {
    switch ((r || '').toUpperCase()) {
      case 'STRONG BUY':
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          glow: 'shadow-glow-success',
          barBg: 'bg-emerald-500'
        };
      case 'BUY':
        return {
          bg: 'bg-green-500/15',
          border: 'border-green-500/40',
          text: 'text-green-400',
          glow: 'shadow-glow-success',
          barBg: 'bg-green-500'
        };
      case 'HOLD':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          glow: 'shadow-glow-warning',
          barBg: 'bg-amber-500'
        };
      case 'SELL':
      case 'STRONG SELL':
        return {
          bg: 'bg-red-500/15',
          border: 'border-red-500/40',
          text: 'text-red-400',
          glow: 'shadow-glow-danger',
          barBg: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-blue-500/15',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          glow: 'shadow-glow-primary',
          barBg: 'bg-blue-500'
        };
    }
  };

  const style = getBadgeStyle(rec);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col justify-between"
    >
      <div>
        {/* Top Title */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">AI Recommendation</h2>
          </div>
          {durationLabel && <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">{durationLabel}</span>}
        </div>

        {/* Recommendation Main Badge */}
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`px-6 py-3 rounded-2xl border ${style.bg} ${style.border} ${style.text} ${style.glow} flex items-center gap-3`}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-2xl font-extrabold tracking-wider uppercase font-mono">{rec}</span>
          </motion.div>

          <p className="text-xs text-slate-400 mt-3 font-medium">
            AI Quant Rating: <span className="font-mono font-bold text-slate-200">{score} / 10</span>
          </p>
        </div>

        {/* Analyst Target Prices Section */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-blue-400" /> Horizon Price Targets</span>
            <span className="text-slate-400 font-mono">Base: ${avgP.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-1">
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-sans">Low Scenario</span>
              <span className="text-slate-200 font-semibold">${targets.low?.toFixed(2)}</span>
            </div>
            <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
              <span className="text-[10px] text-blue-300 block font-sans">Base Target</span>
              <span className="text-blue-400 font-bold">${avgP.toFixed(2)}</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-sans">High Scenario</span>
              <span className="text-emerald-400 font-semibold">${targets.high?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;
