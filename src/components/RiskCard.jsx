import React from 'react';
import { ShieldAlert, AlertTriangle, Activity, BarChart, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const RiskCard = ({ riskLevel = 'Medium', riskScore = 42, riskBreakdown = {}, durationLabel = null }) => {
  const getRiskTheme = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'low':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          bar: 'bg-emerald-500',
          badge: 'Low Risk'
        };
      case 'medium':
      case 'moderate':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          bar: 'bg-amber-500',
          badge: 'Medium Risk'
        };
      case 'high':
      case 'very high':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          bar: 'bg-red-500',
          badge: 'High Risk'
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          bar: 'bg-blue-500',
          badge: 'Balanced Risk'
        };
    }
  };

  const theme = getRiskTheme(riskLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Risk Profile</h2>
        </div>
        <div className="flex items-center gap-2">
          {durationLabel && <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{durationLabel} Risk</span>}
          <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${theme.bg} ${theme.border} ${theme.text}`}>
            {theme.badge}
          </span>
        </div>
      </div>

      {/* Main Score Meter */}
      <div className="py-5 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-medium text-slate-400">Composite Risk Score</span>
          <span className="font-mono text-xl font-extrabold text-slate-100">
            {riskScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </span>
        </div>

        {/* Meter Bar */}
        <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(riskScore, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${theme.bar}`}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span>0 (Ultra Safe)</span>
          <span>50 (Moderate)</span>
          <span>100 (High Risk)</span>
        </div>
      </div>

      {/* Sub-Risk Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Price Volatility</span>
          <span className="font-mono font-semibold text-slate-200">{riskBreakdown.volatility || 'Low-Medium'}</span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Financial Health</span>
          <span className="font-mono font-semibold text-emerald-400">{riskBreakdown.financialHealth || 'Exceptional'}</span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Macro Sensitivity</span>
          <span className="font-mono font-semibold text-slate-200">{riskBreakdown.macroSensitivity || 'Moderate'}</span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Regulatory Risk</span>
          <span className="font-mono font-semibold text-amber-400">{riskBreakdown.regulatoryRisk || 'Moderate'}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RiskCard;
