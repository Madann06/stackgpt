import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Clock, LogOut, X, Sparkles, Github, Server, Globe, ExternalLink } from 'lucide-react';
import SearchBar from '../SearchBar';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const TopNavbar = ({ setIsMobileOpen }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSearchOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Format time in IST
  const timeString = currentTime.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit'
  });
  
  const dateString = currentTime.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short'
  });

  return (
    <>
      <header className="h-16 bg-[#111827] border-b border-white/5 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-30 w-full select-none">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Menu Drawer Toggle Button */}
          <button 
            type="button"
            aria-label="Open sidebar menu"
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden text-slate-300 hover:text-white p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          >
            <Menu size={22} />
          </button>

          {/* Mobile Branding (Visible on mobile/tablet when search bar is hidden) */}
          <div className="md:hidden flex items-center gap-2">
            <span className="font-bold text-base tracking-wide text-white">Stack<span className="text-cyan-400">GPT</span></span>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block w-full max-w-md">
            <SearchBar placeholder="Search NSE/BSE stocks, tickers..." className="w-full" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Search Button Icon */}
          <button
            type="button"
            aria-label="Search stocks"
            onClick={() => setIsMobileSearchOpen(true)}
            className="md:hidden p-2 text-slate-300 hover:text-cyan-400 hover:bg-white/5 border border-white/5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Search size={20} />
          </button>

          {/* Ecosystem Quick Links (GitHub, Render, Vercel) */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/90 border border-white/10 rounded-xl px-2 py-1">
            <a
              href="https://github.com/Madann06/stackgpt"
              target="_blank"
              rel="noopener noreferrer"
              title="View Source on GitHub"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-mono"
            >
              <Github size={13} />
              <span>GitHub</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://stackgpt-backend.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              title="Render Backend API Documentation"
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-mono"
            >
              <Server size={13} className="text-cyan-400" />
              <span>Render</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://stackgpt.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              title="Vercel Production Deployment"
              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-mono"
            >
              <Globe size={13} className="text-blue-400" />
              <span>Vercel</span>
            </a>
          </div>

          {/* Market Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-emerald-500/30 rounded-full px-2.5 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">LIVE</span>
          </div>

          {/* IST Clock */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-white/10 pl-3">
            <Clock size={14} />
            <span className="font-mono text-[11px]">{dateString} {timeString} IST</span>
          </div>

          {/* User Account & Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5 border-l border-white/10 pl-2 sm:pl-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-100">{user?.name || 'Analyst'}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">{user?.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 text-xs font-bold font-mono">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log Out"
                  aria-label="Log Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all min-h-[38px]"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Full Screen Mobile Search Overlay Modal */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#0B1220]/98 backdrop-blur-2xl p-4 flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sparkles size={18} /> Search Indian Stocks & Tickers
              </div>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="pt-4 flex-1">
              <SearchBar 
                placeholder="Type ticker or company (e.g. RELIANCE, TCS, INFY)..."
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopNavbar;
