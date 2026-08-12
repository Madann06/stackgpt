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
                <Link to="/dashboard" className="hover:text-blue-400 transition-colors">Market Dashboard</Link>
              </li>
              <li>
                <Link to="/company" className="hover:text-blue-400 transition-colors">Company Intelligence Browser</Link>
              </li>
              <li>
                <Link to="/company/NVDA" className="hover:text-blue-400 transition-colors">NVIDIA Research</Link>
              </li>

              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">Analyst Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack Badges */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Frontend Architecture</h3>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">React.js</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Vite</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Tailwind CSS</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Framer Motion</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Recharts</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Lucide React</span>
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
