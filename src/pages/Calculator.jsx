import React, { useState } from 'react';
import { Calculator as CalcIcon, IndianRupee, PieChart, TrendingUp } from 'lucide-react';

const Calculator = () => {
  const [activeTab, setActiveTab] = useState('return');

  // Return Calculator State
  const [invAmount, setInvAmount] = useState(100000);
  const [buyPrice, setBuyPrice] = useState(500);
  const [sellPrice, setSellPrice] = useState(650);

  // SIP Calculator State
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate] = useState(12);

  // Return Calc Logic
  const shares = invAmount / buyPrice;
  const currentValue = shares * sellPrice;
  const profit = currentValue - invAmount;
  const returnPct = ((profit / invAmount) * 100).toFixed(2);

  // SIP Calc Logic
  const months = sipYears * 12;
  const monthlyRate = sipRate / 12 / 100;
  const sipTotalInvested = sipAmount * months;
  // FV = P × ({[1 + i]^n - 1} / i) × (1 + i)
  const sipFutureValue = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const sipProfit = sipFutureValue - sipTotalInvested;

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <CalcIcon className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-white">Investment Calculators</h1>
      </div>

      <div className="flex gap-2 p-1 bg-card rounded-xl w-max border border-white/5">
        <button 
          onClick={() => setActiveTab('return')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'return' ? 'bg-primary text-white shadow' : 'text-neutral-light hover:text-white'}`}
        >
          Stock Return
        </button>
        <button 
          onClick={() => setActiveTab('sip')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'sip' ? 'bg-primary text-white shadow' : 'text-neutral-light hover:text-white'}`}
        >
          SIP Calculator
        </button>
      </div>

      {activeTab === 'return' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">Input Details</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-light uppercase tracking-wider">Total Investment</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
                <input type="number" value={invAmount} onChange={(e) => setInvAmount(Number(e.target.value))} className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white font-mono focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-light uppercase tracking-wider">Buy Price</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
                  <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-2 py-2.5 text-white font-mono focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-light uppercase tracking-wider">Sell Price</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
                  <input type="number" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-2 py-2.5 text-white font-mono focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-neutral-light/70 pt-2 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary inline-block"></span> Number of shares: <strong className="text-white">{shares.toFixed(2)}</strong>
            </p>
          </div>

          {/* Outputs */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-center border-t-4 border-t-primary">
            <h3 className="text-lg font-bold text-white mb-6">Estimated Returns</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-sm text-neutral-light">Invested Amount</span>
                <span className="text-xl font-mono text-white">{formatINR(invAmount)}</span>
              </div>
              
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-sm text-neutral-light">Current Value</span>
                <span className="text-xl font-mono font-bold text-white">{formatINR(currentValue)}</span>
              </div>

              <div className="flex justify-between items-end bg-background/50 p-3 rounded-lg border border-white/5">
                <span className="text-sm font-semibold text-white">Total Profit/Loss</span>
                <div className="text-right">
                  <span className={`text-2xl font-mono font-bold block ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {profit >= 0 ? '+' : ''}{formatINR(profit)}
                  </span>
                  <span className={`text-sm font-semibold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {profit >= 0 ? '+' : ''}{returnPct}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sip' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SIP Inputs */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">SIP Details</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-light uppercase tracking-wider">Monthly Investment</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
                <input type="number" value={sipAmount} onChange={(e) => setSipAmount(Number(e.target.value))} className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white font-mono focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-neutral-light uppercase tracking-wider">Expected Return Rate (p.a)</label>
                <span className="text-xs font-bold text-primary">{sipRate}%</span>
              </div>
              <input type="range" min="1" max="30" value={sipRate} onChange={(e) => setSipRate(Number(e.target.value))} className="w-full accent-primary" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-neutral-light uppercase tracking-wider">Time Period</label>
                <span className="text-xs font-bold text-primary">{sipYears} Years</span>
              </div>
              <input type="range" min="1" max="40" value={sipYears} onChange={(e) => setSipYears(Number(e.target.value))} className="w-full accent-primary" />
            </div>
          </div>

          {/* SIP Outputs */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-center border-t-4 border-t-success">
            <h3 className="text-lg font-bold text-white mb-6">Wealth Projection</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-sm text-neutral-light">Total Invested</span>
                <span className="text-xl font-mono text-white">{formatINR(sipTotalInvested)}</span>
              </div>
              
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-sm text-neutral-light">Est. Returns Generated</span>
                <span className="text-xl font-mono text-success">{formatINR(sipProfit)}</span>
              </div>

              <div className="flex justify-between items-end bg-background/50 p-3 rounded-lg border border-white/5">
                <span className="text-sm font-semibold text-white">Total Value</span>
                <div className="text-right">
                  <span className="text-3xl font-mono font-bold text-success block">
                    {formatINR(sipFutureValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-card/50 p-4 rounded-xl border border-white/5 text-xs text-neutral-light flex items-start gap-2">
        <PieChart className="w-4 h-4 shrink-0 text-primary mt-0.5" />
        <p>
          <strong>Disclaimer:</strong> This calculator provides mathematical estimates based on user inputs. 
          It does not guarantee future returns. Real market returns are subject to volatility, taxes, and brokerage fees.
        </p>
      </div>

    </div>
  );
};

export default Calculator;
