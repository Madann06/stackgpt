import React from 'react';
import { ShieldCheck, Scale, FileText, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

const REGULATIONS_DATA = [
  {
    title: "SEBI (LODR) Disclosure Requirements Amendment 2024",
    agency: "SEBI",
    date: "Effective Oct 2024",
    impact: "High",
    summary: "Mandatory 24-hour material event disclosures for top 500 listed entities, including executive leadership changes, major litigations, and ESG compliance filings."
  },
  {
    title: "RBI Guidelines on Digital Lending & NBFC Risk Weights",
    agency: "RBI",
    date: "Effective Nov 2024",
    impact: "High",
    summary: "Increased risk weights on unsecured consumer credit and credit card exposure to ensure capital adequacy across private sector banks and NBFCs."
  },
  {
    title: "T+0 Instant Settlement Framework Expansion",
    agency: "SEBI & Clearing Corps",
    date: "Phase II Deployment",
    impact: "Medium",
    summary: "Optional same-day instant settlement facility introduced for retail investors across selected 500 equity instruments."
  },
  {
    title: "Prohibition of Insider Trading (PIT) Structural Digital Database",
    agency: "SEBI",
    date: "Mandatory Compliance",
    impact: "Critical",
    summary: "Requirement for listed entities and intermediaries to maintain non-tamperable digital audit logs of UPSI (Unpublished Price Sensitive Information) sharing."
  }
];

const Regulations = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Regulatory & Compliance Center</h1>
          </div>
          <p className="text-sm text-neutral-light max-w-2xl">
            Official Indian regulatory updates, SEBI circulars, RBI monetary directives, and corporate governance compliance standards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REGULATIONS_DATA.map((item, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {item.agency} Directive
              </span>
              <span className="text-xs font-mono text-slate-400">{item.date}</span>
            </div>

            <h2 className="text-lg font-bold text-white leading-snug">{item.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Impact Level: <strong className="text-amber-400">{item.impact}</strong></span>
              <span className="text-cyan-400 font-semibold cursor-pointer hover:underline">Read Circular PDF →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Regulations;
