import React from 'react';
import { DollarSign, Percent, Scale, TrendingUp, PieChart, Activity, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const FinancialRatios = ({ stock }) => {
  if (!stock) return null;

  const ratioItems = [
    {
      label: 'Market Cap',
      value: stock.marketCap,
      category: 'Valuation',
      description: 'Total dollar market value of company equity',
      icon: DollarSign,
      color: 'text-blue-400'
    },
    {
      label: 'P/E Ratio',
      value: stock.peRatio ? `${stock.peRatio}x` : 'N/A',
      category: 'Valuation',
      description: 'Price to Earnings relative to trailing 12 months',
      icon: Scale,
      color: 'text-indigo-400'
    },
    {
      label: 'EPS (TTM)',
      value: stock.eps ? `$${stock.eps}` : 'N/A',
      category: 'Profitability',
      description: 'Diluted Earnings Per Share over last 4 quarters',
      icon: TrendingUp,
      color: 'text-emerald-400'
    },
    {
      label: 'Return on Equity (ROE)',
      value: stock.roe || 'N/A',
      category: 'Profitability',
      description: 'Net income returned as percentage of shareholder equity',
      icon: Percent,
      color: 'text-purple-400'
    },
    {
      label: 'Dividend Yield',
      value: stock.dividendYield || 'N/A',
      category: 'Income',
      description: 'Annual dividend payouts relative to stock price',
      icon: PieChart,
      color: 'text-amber-400'
    },
    {
      label: 'Profit Margin',
      value: stock.profitMargin || 'N/A',
      category: 'Efficiency',
      description: 'Net profit percentage generated per dollar revenue',
      icon: Activity,
      color: 'text-green-400'
    },
    {
      label: 'P/B Ratio',
      value: stock.pbRatio ? `${stock.pbRatio}x` : 'N/A',
      category: 'Valuation',
      description: 'Price to Book ratio relative to tangible net assets',
      icon: Scale,
      color: 'text-cyan-400'
    },
    {
      label: 'Debt to Equity',
      value: stock.debtToEquity || 'N/A',
      category: 'Leverage',
      description: 'Total liabilities divided by total shareholder equity',
      icon: Scale,
      color: 'text-red-400'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" /> Key Financial Ratios & Fundamentals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Comprehensive valuation metrics and operational balance sheet metrics</p>
        </div>
        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          FY24 TTM Data
        </span>
      </div>

      {/* Ratios Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {ratioItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className="bg-[#1E293B]/80 hover:bg-[#243347] p-4 rounded-xl border border-slate-700/60 transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.category}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-300 font-medium group-hover:text-slate-100 transition-colors">
                  {item.label}
                </p>
                <p className="text-xl font-extrabold text-slate-100 font-mono tracking-tight">
                  {item.value}
                </p>
              </div>

              <p className="text-[10px] text-slate-400 mt-2 line-clamp-1 group-hover:line-clamp-none transition-all">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FinancialRatios;
