import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Search, 
  Bookmark, 
  Sparkles, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Bell, 
  ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import TopMarketTicker from './TopMarketTicker';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Company Analysis', path: '/company', icon: TrendingUp },
  ];


  const isActive = (path) => {
    if (path.startsWith('/company') && location.pathname.startsWith('/company')) return true;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur-xl">
      {/* Top Market Ticker Bar */}
      <TopMarketTicker />

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-100 tracking-tight group-hover:text-blue-400 transition-colors">
                  Stock<span className="text-blue-500">AI</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">AI Stock Research Assistant</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                    active 
                      ? 'text-white bg-blue-600/20 border border-blue-500/30 shadow-inner' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                  {link.name}
                  {active && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Embedded Compact Search Bar (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-xs xl:max-w-md">
            <SearchBar placeholder="Search AAPL, NVDA, TSLA..." />
          </div>

          {/* Action Icons & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Mobile/Tablet Search Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications Badge */}
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900" />
            </button>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-200 leading-none">{user?.name || 'Analyst'}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{user?.role || 'PRO Member'}</p>
                </div>
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/30 border border-slate-700"
                />
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5" /> Sign In
              </Link>
            )}

            {/* Mobile Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 pt-16 flex flex-col items-center"
          >
            <button
              onClick={() => setShowSearchModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full max-w-lg">
              <SearchBar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-800 bg-[#1E293B] overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              <div className="mb-3">
                <SearchBar />
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                      active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
