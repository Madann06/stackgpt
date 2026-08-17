import React from 'react';
import { Target, Award, ArrowUpRight, TrendingUp, AlertCircle, ShieldAlert, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const RecommendationCard = ({ recommendation, recommendationScore, analystTargets, durationLabel = null }) => {
  // If we don't have a verified recommendation, show insufficient data
  const rec = recommendation || 'INSUFFICIENT VERIFIED DATA';
  const score = recommendationScore || null;
  const targets = analystTargets || { low: 0, average: 0, high: 0, totalAnalysts: 0 };
  const avgP = targets.average !== undefined ? targets.average : (targets.base !== undefined ? targets.base : 0);

  // Color mapping based on recommendation
  const getBadgeStyle = (r) => {
    switch ((r || '').toUpperCase()) {
      case 'STRONG BUY':
      case 'STRONG POSITIVE':
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          glow: 'shadow-glow-success',
        };
      case 'BUY':
      case 'POSITIVE':
        return {
          bg: 'bg-green-500/15',
          border: 'border-green-500/40',
          text: 'text-green-400',
          glow: 'shadow-glow-success',
        };
      case 'HOLD':
      case 'NEUTRAL':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          glow: 'shadow-glow-warning',
        };
      case 'SELL':
      case 'STRONG SELL':
      case 'NEGATIVE':
      case 'STRONG NEGATIVE':
        return {
          bg: 'bg-red-500/15',
          border: 'border-red-500/40',
          text: 'text-red-400',
          glow: 'shadow-glow-danger',
        };
      case 'INSUFFICIENT VERIFIED DATA':
      default:
        return {
          bg: 'bg-neutral-500/15',
          border: 'border-neutral-500/40',
          text: 'text-neutral-400',
          glow: '',
        };
    }
  };

  const style = getBadgeStyle(rec);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between"
    >
      <div>
        {/* Top Title */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">AI Research Signal</h2>
          </div>
          {durationLabel && <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/30">{durationLabel}</span>}
        </div>

        {/* Disclaimer */}
        <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded p-2 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-200/80 leading-tight">
            <strong>NOT INVESTMENT ADVICE.</strong> StockAI India provides AI-generated market research and educational information. It is not a recommendation to buy or sell securities.
          </p>
        </div>

        {/* Recommendation Main Badge */}
        <div className="py-5 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`px-4 py-3 rounded-2xl border ${style.bg} ${style.border} ${style.text} ${style.glow} flex items-center gap-2 max-w-full overflow-hidden`}
          >
            {rec !== 'INSUFFICIENT VERIFIED DATA' && <TrendingUp className="w-5 h-5 shrink-0" />}
            <span className="text-lg sm:text-xl font-extrabold tracking-wider uppercase font-mono truncate">{rec}</span>
          </motion.div>

          {score && (
            <p className="text-xs text-neutral-light mt-3 font-medium">
              AI Quant Score: <span className="font-mono font-bold text-white">{score} / 100</span>
            </p>
          )}
        </div>

        {/* Analyst Target Prices Section */}
        <div className="space-y-3 bg-background/50 p-4 rounded-xl border border-white/5 mt-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-primary" /> Analyst Consensus</span>
            <span className="text-neutral-light font-mono">Base: ₹{avgP.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-1">
            <div className="bg-card p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-neutral-light block font-sans">Low</span>
              <span className="text-white font-semibold">₹{targets.low?.toFixed(2)}</span>
            </div>
            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
              <span className="text-[10px] text-primary-light block font-sans">Avg</span>
              <span className="text-primary font-bold">₹{avgP.toFixed(2)}</span>
            </div>
            <div className="bg-card p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-neutral-light block font-sans">High</span>
              <span className="text-success font-semibold">₹{targets.high?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;
