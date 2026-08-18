import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { stockApi } from '../services/stockApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Wallet, Calculator, TrendingUp, ShieldCheck, Award, 
  ArrowLeft, Info, CheckCircle2, AlertTriangle, ArrowUpRight, 
  ArrowDownRight, Layers, Sliders, RefreshCw, X, Search, 
  BarChart2, PieChart, FileText, ChevronRight, Scale, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MutualFunds = () => {
  const { fundId } = useParams();
  const navigate = useNavigate();

  // List View States
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Single Fund Details State
  const [fundDetails, setFundDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('3Y');
  const [holdingsSort, setHoldingsSort] = useState('desc'); // desc, asc, name, sector

  // Compare Funds State
  const [compareList, setCompareList] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // SIP Calculator Modal State
  const [sipModalOpen, setSipModalOpen] = useState(false);
  const [sipFund, setSipFund] = useState(null);
  const [monthlyInvest, setMonthlyInvest] = useState(5000);
  const [durationYears, setDurationYears] = useState(5);
  const [expectedReturn, setExpectedReturn] = useState(15.0);
  const [initialLumpsum, setInitialLumpsum] = useState(0);
  const [sipResult, setSipResult] = useState(null);

  // Fetch All Funds for List View
  useEffect(() => {
    const fetchFunds = async () => {
      setLoading(true);
      const data = await stockApi.getMutualFunds(selectedCategory, searchQuery);
      setFunds(data || []);
      setLoading(false);
    };

    if (!fundId) {
      fetchFunds();
    }
  }, [fundId, selectedCategory, searchQuery]);

  // Fetch Details when fundId changes
  useEffect(() => {
    const fetchDetails = async () => {
      if (!fundId) {
        setFundDetails(null);
        return;
      }
      setLoadingDetails(true);
      const data = await stockApi.getMutualFundDetails(fundId);
      setFundDetails(data);
      if (data && data.performance?.cagr_3y) {
        setExpectedReturn(data.performance.cagr_3y);
      }
      setLoadingDetails(false);
    };

    fetchDetails();
  }, [fundId]);

  // SIP Mathematics Calculation
  const calculateSip = (monthlyP, years, returnRatePct, lumpsumP = 0) => {
    const P = Number(monthlyP) || 0;
    const n = (Number(years) || 1) * 12;
    const r = (Number(returnRatePct) || 0) / 100;
    const i = r / 12;
    const L = Number(lumpsumP) || 0;

    // SIP Formula: M = P * [ (1 + i)^n - 1 ] / i * (1 + i)
    let sipMaturity = 0;
    if (i > 0) {
      sipMaturity = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    } else {
      sipMaturity = P * n;
    }

    // Lumpsum Formula: A = L * (1 + r)^years
    const lumpsumMaturity = L * Math.pow(1 + r, Number(years) || 1);

    const totalSIPInvested = P * n;
    const totalInvested = totalSIPInvested + L;
    const finalValue = sipMaturity + lumpsumMaturity;
    const estimatedReturns = Math.max(0, finalValue - totalInvested);
    const absoluteReturn = totalInvested > 0 ? ((finalValue - totalInvested) / totalInvested) * 100 : 0;

    return {
      totalInvested: Math.round(totalInvested),
      estimatedReturns: Math.round(estimatedReturns),
      finalValue: Math.round(finalValue),
      absoluteReturn: Number(absoluteReturn.toFixed(1)),
      cagr: Number(returnRatePct)
    };
  };

  const handleRunSipCalc = () => {
    const res = calculateSip(monthlyInvest, durationYears, expectedReturn, initialLumpsum);
    setSipResult(res);
  };

  const handleOpenSipModal = (fund = null) => {
    setSipFund(fund || fundDetails);
    const ret = fund?.performance?.cagr_3y || fundDetails?.performance?.cagr_3y || 15.0;
    setExpectedReturn(ret);
    const initialRes = calculateSip(monthlyInvest, durationYears, ret, initialLumpsum);
    setSipResult(initialRes);
    setSipModalOpen(true);
  };

  const handleResetSip = () => {
    setMonthlyInvest(5000);
    setDurationYears(5);
    setExpectedReturn(15.0);
    setInitialLumpsum(0);
    const res = calculateSip(5000, 5, 15.0, 0);
    setSipResult(res);
  };

  const toggleCompare = (fund) => {
    if (compareList.some(f => f.id === fund.id)) {
      setCompareList(compareList.filter(f => f.id !== fund.id));
    } else {
      if (compareList.length < 4) {
        setCompareList([...compareList, fund]);
      }
    }
  };

  // Render Fund Details View
  if (fundId) {
    if (loadingDetails) {
      return (
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner message="Fetching verified mutual fund profile and portfolio holdings..." />
        </div>
      );
    }

    if (!fundDetails) {
      return (
        <div className="space-y-6">
          <button
            onClick={() => navigate('/funds')}
            className="flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Mutual Funds Overview
          </button>
          <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Mutual Fund Profile Not Found</h2>
            <p className="text-xs text-slate-400">Verified scheme details for "{fundId}" are currently unavailable from the configured data provider.</p>
          </div>
        </div>
      );
    }

    const {
      name, symbol, category, amc, option, nav, aum, expense_ratio, exit_load,
      min_investment, min_sip, rating, inception_date, risk_level, manager, amc_details,
      performance, holdings, sector_allocation, market_cap_allocation, risk_analysis,
      tax_info, nfo_status, ai_research, status, source, timestamp
    } = fundDetails;

    // Sorting Holdings Table
    let sortedHoldings = holdings ? [...holdings] : [];
    if (holdingsSort === 'desc') {
      sortedHoldings.sort((a, b) => b.weight - a.weight);
    } else if (holdingsSort === 'asc') {
      sortedHoldings.sort((a, b) => a.weight - b.weight);
    } else if (holdingsSort === 'name') {
      sortedHoldings.sort((a, b) => a.company.localeCompare(b.company));
    } else if (holdingsSort === 'sector') {
      sortedHoldings.sort((a, b) => a.sector.localeCompare(b.sector));
    }

    const chartPoints = performance?.chart_data?.[selectedTimeframe] || [];

    return (
      <div className="space-y-8 pb-16">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => navigate('/funds')}
            className="flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Mutual Funds Catalog
          </button>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {status || 'VERIFIED'}
            </span>
            <span className="text-slate-500 hidden sm:inline">• Source: {source || 'AMFI'}</span>
          </div>
        </div>

        {/* 1. FUND OVERVIEW HEADER */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-6 relative overflow-hidden bg-slate-900/90">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {category}
                </span>
                <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                  {option || 'Direct - Growth'}
                </span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                  ★ {rating}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">{name}</h1>
                <p className="text-xs text-slate-400 font-medium mt-1">{amc} • Inception: {inception_date || 'N/A'}</p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] font-sans text-slate-500 block">Current NAV</span>
                <span className="text-xl font-bold text-white">₹{nav}</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-slate-500 block">3Y CAGR</span>
                <span className="text-xl font-bold text-emerald-400">+{performance?.cagr_3y}%</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-slate-500 block">Expense Ratio</span>
                <span className="text-xl font-bold text-slate-200">{expense_ratio}</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-slate-500 block">AUM</span>
                <span className="text-xl font-bold text-white">{aum}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenSipModal(fundDetails)}
                className="py-3 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <Calculator className="w-4 h-4" /> Calculate SIP Return
              </button>

              <button
                onClick={() => toggleCompare(fundDetails)}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  compareList.some(f => f.id === id)
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Layers className="w-4 h-4 text-purple-400" />
                {compareList.some(f => f.id === id) ? 'Added to Compare' : 'Compare Fund'}
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Risk Level: <strong className="text-rose-400">{risk_level || 'VERY HIGH'}</strong>
            </div>
          </div>
        </div>

        {/* 2. PERFORMANCE & HISTORICAL NAV CHART */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Performance & Trailing CAGR Returns
              </h2>
              <p className="text-xs text-slate-400">Historical NAV growth and benchmark relative compounding</p>
            </div>

            {/* Timeframe Selector */}
            <div className="flex gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
              {['1M', '3M', '6M', '1Y', '3Y', '5Y', '10Y', 'MAX'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Return Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">1-Year Return</span>
              <span className="text-base font-bold text-emerald-400">+{performance?.return_1y || 0}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">3-Year CAGR</span>
              <span className="text-base font-bold text-emerald-400">+{performance?.cagr_3y || 0}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">5-Year CAGR</span>
              <span className="text-base font-bold text-emerald-400">+{performance?.cagr_5y || 0}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">10-Year CAGR</span>
              <span className="text-base font-bold text-emerald-400">+{performance?.cagr_10y || 'N/A'}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">Since Inception</span>
              <span className="text-base font-bold text-emerald-400">+{performance?.since_inception || 0}%</span>
            </div>
          </div>

          {/* Simple Visual Performance Line/Chart Container */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>NAV History ({selectedTimeframe})</span>
              <span className="text-emerald-400">Growth of ₹10,000 Initial Investment</span>
            </div>

            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
              {chartPoints.map((pt, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-[10px] font-mono px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-10">
                    ₹{pt.price}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-emerald-400 rounded-t hover:brightness-125 transition-all"
                    style={{ height: `${Math.min(100, Math.max(20, (pt.price / (nav || 100)) * 100))}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-500">{pt.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 & 4. PORTFOLIO HOLDINGS & SECTOR ALLOCATION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Holdings Column */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-400" /> Portfolio Stock Holdings
                </h2>
                <p className="text-xs text-slate-400">Underlying equity portfolio constituents</p>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Sort:</span>
                <select
                  value={holdingsSort}
                  onChange={(e) => setHoldingsSort(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
                >
                  <option value="desc">Highest Weight %</option>
                  <option value="asc">Lowest Weight %</option>
                  <option value="name">Company Name</option>
                  <option value="sector">Sector</option>
                </select>
              </div>
            </div>

            {sortedHoldings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
                Verified portfolio holdings unavailable from the configured data provider.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-900/80 text-[10px] text-slate-500 uppercase border-b border-slate-800">
                      <th className="p-3">Company</th>
                      <th className="p-3 text-right">Weight %</th>
                      <th className="p-3">Sector</th>
                      <th className="p-3 text-right">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sortedHoldings.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-white font-sans">{item.company}</td>
                        <td className="p-3 text-right font-bold text-emerald-400">{item.weight}%</td>
                        <td className="p-3 text-slate-300">{item.sector}</td>
                        <td className="p-3 text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                            {item.cap}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sector & Cap Breakdown Column */}
          <div className="space-y-6">
            {/* Sector Breakdown */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" /> Sector Allocation
              </h2>

              <div className="space-y-3 font-mono text-xs">
                {(sector_allocation || []).map((sec, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>{sec.sector}</span>
                      <span className="font-bold text-white">{sec.percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${sec.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Cap Breakdown */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" /> Market-Cap Allocation
              </h2>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs text-center">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans block">Large Cap</span>
                  <span className="text-base font-bold text-blue-400">{market_cap_allocation?.large_cap || 0}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans block">Mid Cap</span>
                  <span className="text-base font-bold text-emerald-400">{market_cap_allocation?.mid_cap || 0}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans block">Small Cap</span>
                  <span className="text-base font-bold text-amber-400">{market_cap_allocation?.small_cap || 0}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans block">Cash / Debt</span>
                  <span className="text-base font-bold text-slate-300">{market_cap_allocation?.cash_other || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. RISK ANALYSIS & EXPENSE ANALYSIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Risk Ratios Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" /> Quantitative Risk Ratios
            </h2>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans block">Sharpe Ratio</span>
                <span className="text-lg font-bold text-emerald-400">{risk_analysis?.sharpe_ratio || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans block">Beta (Market Relative)</span>
                <span className="text-lg font-bold text-slate-200">{risk_analysis?.beta || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans block">Standard Deviation</span>
                <span className="text-lg font-bold text-slate-200">{risk_analysis?.std_dev ? `${risk_analysis.std_dev}%` : 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans block">Max Drawdown</span>
                <span className="text-lg font-bold text-rose-400">{risk_analysis?.max_drawdown ? `${risk_analysis.max_drawdown}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Expense & Cost Structure Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" /> Expense & Investment Limits
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-sans">Expense Ratio (Direct)</span>
                <span className="font-bold text-white">{expense_ratio}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-sans">Minimum Lumpsum</span>
                <span className="font-bold text-white">₹{min_investment?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-sans">Minimum Monthly SIP</span>
                <span className="font-bold text-white">₹{min_sip?.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-sans block">Exit Load Structure</span>
                <span className="text-[11px] text-slate-300 leading-tight block">{exit_load}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. FUND MANAGER & AMC PROFILE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fund Manager */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Fund Manager Profile
            </h2>
            {manager ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="text-sm font-bold text-white font-sans">{manager.name}</div>
                <div className="text-slate-400">{manager.experience}</div>
                <div className="text-slate-500">Managing Scheme Since: {manager.start_date}</div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Verified fund manager information unavailable.</div>
            )}
          </div>

          {/* AMC House */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" /> Fund House / AMC Details
            </h2>
            {amc_details ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="text-sm font-bold text-white font-sans">{amc_details.name}</div>
                <p className="text-slate-300 font-sans leading-relaxed text-[11px]">{amc_details.description}</p>
                <div className="flex justify-between pt-1 text-slate-400">
                  <span>Total AMC AUM: <strong className="text-white">{amc_details.aum}</strong></span>
                  <a href={amc_details.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                    Official Website <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">AMC details unavailable.</div>
            )}
          </div>
        </div>

        {/* 7. TAX INFORMATION BOX */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-slate-900/60">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" /> Informational Tax Framework
          </h2>
          {tax_info && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono pt-1">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans block">Tax Category</span>
                <span className="font-bold text-white">{tax_info.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans block">Short Term (&lt;12M)</span>
                <span className="font-bold text-rose-400">{tax_info.stcg_rate}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-sans block">Long Term (&gt;12M)</span>
                <span className="font-bold text-emerald-400">{tax_info.ltcg_rate}</span>
              </div>
            </div>
          )}
          <p className="text-[10px] text-slate-500 pt-1 leading-tight font-sans">
            * Disclaimer: {tax_info?.disclaimer || "Informational disclosure only. Does not constitute personal tax or financial advice."}
          </p>
        </div>

        {/* 8. AI RESEARCH SUMMARY & EXPLAINABLE SCORE */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 border border-blue-500/30 space-y-6 bg-slate-900/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {ai_research?.signal || 'RESEARCH PROFILE'}
              </span>
              <h2 className="text-xl font-bold text-white mt-2">AI Quantitative Research Classification</h2>
            </div>

            {ai_research?.score !== null && ai_research?.score !== undefined ? (
              <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Research Score</span>
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">{ai_research.score} / 100</span>
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
                INSUFFICIENT VERIFIED DATA
              </div>
            )}
          </div>

          {/* Score Breakdown Bars */}
          {ai_research?.score_breakdown && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 font-sans block">Performance</span>
                <span className="font-bold text-white">{ai_research.score_breakdown.performance} / 30</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 font-sans block">Risk</span>
                <span className="font-bold text-white">{ai_research.score_breakdown.risk} / 25</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 font-sans block">Cost</span>
                <span className="font-bold text-white">{ai_research.score_breakdown.cost} / 20</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 font-sans block">Diversification</span>
                <span className="font-bold text-white">{ai_research.score_breakdown.diversification} / 15</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 font-sans block">Consistency</span>
                <span className="font-bold text-white">{ai_research.score_breakdown.consistency} / 10</span>
              </div>
            </div>
          )}

          {/* Factors Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
              <h3 className="font-bold text-emerald-400 flex items-center gap-1.5 font-sans">
                <CheckCircle2 className="w-4 h-4" /> Traceable Positive Factors
              </h3>
              <ul className="space-y-2 text-slate-300">
                {(ai_research?.bullish_factors || []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-400 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs">
              <h3 className="font-bold text-rose-400 flex items-center gap-1.5 font-sans">
                <AlertTriangle className="w-4 h-4" /> Risk Considerations
              </h3>
              <ul className="space-y-2 text-slate-300">
                {(ai_research?.risk_factors || []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-rose-400 font-bold">⚠</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW (/funds)
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Wallet className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Mutual Funds Intelligence Hub</h1>
          </div>
          <p className="text-sm text-neutral-light max-w-2xl">
            Compare top Indian Direct Mutual Funds across Flexi Cap, Small Cap, Mid Cap, Large Cap, and Index Funds with verifiable CAGR returns, portfolio holdings, and mathematical SIP return modeling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenSipModal()}
            className="py-3 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <Calculator className="w-4 h-4" /> Open SIP Calculator
          </button>

          {compareList.length > 0 && (
            <button
              onClick={() => setCompareModalOpen(true)}
              className="py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
            >
              <Layers className="w-4 h-4" /> Compare ({compareList.length})
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Flexi Cap', 'Small Cap', 'Mid Cap', 'Large Cap', 'Index Fund'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search fund name or AMC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Mutual Fund Cards Grid */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner message="Fetching verified mutual fund intelligence..." />
        </div>
      ) : funds.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <Info className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Mutual Funds Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your category filter or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funds.map((fund) => {
            const isCompared = compareList.some(f => f.id === fund.id);
            return (
              <motion.div
                key={fund.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-5 group relative"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        {fund.category}
                      </span>
                      <h3
                        onClick={() => navigate(`/funds/${fund.id}`)}
                        className="text-lg font-bold text-white mt-1.5 leading-snug group-hover:text-emerald-400 cursor-pointer transition-colors"
                      >
                        {fund.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{fund.amc}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 whitespace-nowrap">
                      ★ {fund.rating}
                    </span>
                  </div>

                  {/* Pricing & Returns Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">Current NAV</span>
                      <span className="font-bold text-white">₹{fund.nav}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">3Y CAGR</span>
                      <span className="font-bold text-emerald-400">+{fund.performance?.cagr_3y || fund.cagr3y}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">5Y CAGR</span>
                      <span className="font-bold text-emerald-400">+{fund.performance?.cagr_5y || fund.cagr5y}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 block">Expense Ratio</span>
                      <span className="font-bold text-slate-300">{fund.expense_ratio || fund.expenseRatio}</span>
                    </div>
                  </div>

                  {/* Meta Bar */}
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span>AUM: <strong className="text-white">{fund.aum}</strong></span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {fund.status || 'VERIFIED'}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenSipModal(fund)}
                    className="py-2.5 px-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5" /> SIP Calculator →
                  </button>

                  <button
                    onClick={() => navigate(`/funds/${fund.id}`)}
                    className="py-2.5 px-3.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold rounded-xl text-xs transition-colors"
                  >
                    Details →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SIP CALCULATOR MODAL (PROBLEM 1 REQ) */}
      <AnimatePresence>
        {sipModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-slate-900 border border-slate-700 rounded-3xl p-6 lg:p-8 max-w-xl w-full space-y-6 shadow-2xl relative my-8"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-400" /> Mathematically Accurate SIP Calculator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {sipFund ? `Target Fund: ${sipFund.name}` : 'Mutual Fund Systematic Investment Plan Modeler'}
                  </p>
                </div>
                <button
                  onClick={() => setSipModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Calculator Form Inputs */}
              <div className="space-y-4 text-xs font-mono">
                {/* Monthly Investment */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-300 font-sans font-semibold">
                    <label>Monthly Investment (₹)</label>
                    <span className="font-mono text-emerald-400 font-bold">₹{Number(monthlyInvest).toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={monthlyInvest}
                    onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <input
                    type="number"
                    value={monthlyInvest}
                    onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Duration Years */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-300 font-sans font-semibold">
                    <label>Investment Duration (Years)</label>
                    <span className="font-mono text-emerald-400 font-bold">{durationYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <input
                    type="number"
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Expected Return % */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-300 font-sans font-semibold">
                    <label>Expected Annual Return (%)</label>
                    <span className="font-mono text-emerald-400 font-bold">{expectedReturn}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="35"
                    step="0.5"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Initial Lumpsum (Optional) */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-slate-300 font-sans font-semibold block">Initial Lumpsum Investment (Optional ₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={initialLumpsum}
                    onChange={(e) => setInitialLumpsum(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Calculation Controls */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleRunSipCalc}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" /> Calculate Returns
                </button>

                <button
                  onClick={handleResetSip}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs border border-slate-700 transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Results Grid */}
              {sipResult && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-sans text-slate-500 block">Total Invested</span>
                      <span className="text-sm font-bold text-slate-200">₹{sipResult.totalInvested.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-sans text-slate-500 block">Est. Returns</span>
                      <span className="text-sm font-bold text-emerald-400">₹{sipResult.estimatedReturns.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-sans text-slate-500 block">Final Value</span>
                      <span className="text-sm font-bold text-blue-400">₹{sipResult.finalValue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-sans text-slate-500 block">Abs. Return</span>
                      <span className="text-sm font-bold text-emerald-400">+{sipResult.absoluteReturn}%</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-sans leading-tight text-center pt-1">
                    * Disclaimer: Illustrative calculation only. Mutual fund returns are market-linked and not guaranteed.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MULTI-FUND COMPARISON MODAL (REQ 12) */}
      <AnimatePresence>
        {compareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-slate-900 border border-slate-700 rounded-3xl p-6 lg:p-8 max-w-4xl w-full space-y-6 shadow-2xl relative my-8"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" /> Side-by-Side Scheme Comparison
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Comparing {compareList.length} selected mutual funds</p>
                </div>
                <button
                  onClick={() => setCompareModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {compareList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No funds selected for comparison. Click "Compare Fund" on scheme cards.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <th className="p-3 font-sans">Feature / Metric</th>
                        {compareList.map(f => (
                          <th key={f.id} className="p-3 font-sans text-white font-bold max-w-xs">{f.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="p-3 font-bold text-slate-400">Category</td>
                        {compareList.map(f => <td key={f.id} className="p-3 text-slate-200">{f.category}</td>)}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">NAV (₹)</td>
                        {compareList.map(f => <td key={f.id} className="p-3 text-white font-bold">₹{f.nav}</td>)}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">3Y CAGR</td>
                        {compareList.map(f => <td key={f.id} className="p-3 text-emerald-400 font-bold">+{f.performance?.cagr_3y || f.cagr3y}%</td>)}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">5Y CAGR</td>
                        {compareList.map(f => <td key={f.id} className="p-3 text-emerald-400 font-bold">+{f.performance?.cagr_5y || f.cagr5y}%</td>)}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">Expense Ratio</td>
                        {compareList.map(f => <td key={f.id} className="p-3 text-slate-300">{f.expense_ratio || f.expenseRatio}</td>)}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">AUM</td>
                        {compareList.map(f => <td key={f.id} className="p-3 text-slate-200">{f.aum}</td>)}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">Risk Level</td>
                        {compareList.map(f => <td key={f.id} className="p-3 text-rose-400">{f.risk_level || 'VERY HIGH'}</td>)}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-400">Sharpe Ratio</td>
                        {compareList.map(f => <td key={f.id} className="p-3 text-emerald-400">{f.risk_analysis?.sharpe_ratio || 'N/A'}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MutualFunds;
