import React from 'react';
import { Sparkles, ArrowUpRight, AlertOctagon, CheckCircle, ShieldCheck, Download, Share2, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const AIAnalysisCard = ({ stock }) => {
  if (!stock) return null;

  const handleExport = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
      className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">AI Deep Research & Investment Thesis</h2>
            <p className="text-xs text-slate-400">Synthesized from filings, earnings call transcripts, and quantitative risk models</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Brief
          </button>
        </div>
      </div>

      {/* Executive Summary Narrative */}
      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-2">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono block">
          EXECUTIVE SUMMARY THESIS
        </span>
        <p className="text-sm text-slate-300 leading-relaxed font-normal">
          {stock.aiSummary}
        </p>
      </div>

      {/* Bullish & Bearish Factors Side by Side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Bullish Drivers */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" /> AI Bullish Growth Catalysts
          </div>
          <ul className="space-y-2.5">
            {stock.aiBullishFactors?.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span className="leading-snug">{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bearish Risks */}
        <div className="bg-amber-950/20 border border-amber-500/30 p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4" /> Key Risk Headwinds & Threats
          </div>
          <ul className="space-y-2.5">
            {stock.aiBearishFactors?.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span className="leading-snug">{factor}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Target Price Valuation Scenarios */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-blue-400" /> Horizon Target Valuation Scenarios</span>
          <span className="text-blue-400 font-mono font-bold">{stock.durationLabel || 'Holding Period Target'}</span>
        </div>

        {(() => {
          const pt = stock.priceTarget || stock.analystTargets || {};
          const curP = stock.currentPrice || 100;
          const lowP = pt.low !== undefined ? pt.low : Number((curP * 0.9).toFixed(2));
          const baseP = pt.base !== undefined ? pt.base : (pt.average !== undefined ? pt.average : Number((curP * 1.05).toFixed(2)));
          const highP = pt.high !== undefined ? pt.high : Number((curP * 1.2).toFixed(2));

          const lowPct = (((lowP - curP) / curP) * 100).toFixed(1);
          const basePct = (((baseP - curP) / curP) * 100).toFixed(1);
          const highPct = (((highP - curP) / curP) * 100).toFixed(1);

          return (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Bear Case</span>
                <span className="text-base font-extrabold font-mono text-slate-200 mt-1 block">
                  ${lowP.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{lowPct >= 0 ? `+${lowPct}%` : `${lowPct}%`}</span>
              </div>

              <div className="bg-blue-600/20 p-3 rounded-xl border border-blue-500/40">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">Base Target</span>
                <span className="text-base font-extrabold font-mono text-blue-400 mt-1 block">
                  ${baseP.toFixed(2)}
                </span>
                <span className="text-[10px] text-blue-300 font-mono">{basePct >= 0 ? `+${basePct}%` : `${basePct}%`}</span>
              </div>

              <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/40">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Bull Case</span>
                <span className="text-base font-extrabold font-mono text-emerald-400 mt-1 block">
                  ${highP.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">{highPct >= 0 ? `+${highPct}%` : `${highPct}%`}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
};

export default AIAnalysisCard;
