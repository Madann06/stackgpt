import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Heart, Github, Terminal, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#0B1120] text-slate-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-slate-100 text-base tracking-tight">
                AI Stock <span className="text-blue-500">Research Assistant</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              An advanced financial intelligence dashboard powered by quantitative neural models and real-time market sentiment analysis for Computer Science Engineering.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> System Operational • v2.4.0-stable
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Platform Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Market Dashboard</Link>
              </li>
              <li>
                <Link to="/markets" className="hover:text-cyan-400 transition-colors">Live Indian Markets (NSE/BSE)</Link>
              </li>
              <li>
                <Link to="/screener" className="hover:text-cyan-400 transition-colors">AI Stock Screener</Link>
              </li>
              <li>
                <Link to="/ai-research" className="hover:text-cyan-400 transition-colors">RAG AI Document Research</Link>
              </li>
            </ul>
          </div>

          {/* Cloud & Architecture Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Cloud Architecture</h3>
            <div className="flex flex-col gap-2 text-xs">
              <a
                href="https://github.com/Madann06/stackgpt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all font-mono text-[11px]"
              >
                <Github className="w-4 h-4 text-slate-400" />
                <span>GitHub Repository</span>
              </a>

              <a
                href="https://stackgpt-backend.onrender.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-all font-mono text-[11px]"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Render API (FastAPI)</span>
              </a>

              <a
                href="https://stackgpt.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-400 transition-all font-mono text-[11px]"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Vercel App (React+Vite)</span>
              </a>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-4">
          <p>© 2026 AI Stock Research Assistant. Final-Year Computer Science Project.</p>
          <p className="text-center sm:text-right">
            Disclaimer: Educational demonstration tool. Not financial investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
