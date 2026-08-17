import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User, Clock, AlertCircle, LogOut } from 'lucide-react';
import SearchBar from '../SearchBar';
import { useAuth } from '../../context/AuthContext';

const TopNavbar = ({ setIsMobileOpen }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Format time in IST
  const timeString = currentTime.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const dateString = currentTime.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-card border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden text-neutral-light hover:text-white"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block w-full max-w-md">
          <SearchBar placeholder="Search NSE/BSE stocks, tickers..." className="w-full" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Market Status */}
        <div className="hidden sm:flex items-center gap-2 bg-background/50 border border-white/5 rounded-full px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-xs font-medium text-neutral-light">MARKET OPEN</span>
        </div>

        {/* IST Clock */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-light border-l border-white/10 pl-4">
          <Clock size={14} />
          <span>{dateString} {timeString} IST</span>
        </div>

        {/* User Account & Logout */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-100">{user?.name || 'Analyst'}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/40 text-xs font-bold font-mono">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all ml-1"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
