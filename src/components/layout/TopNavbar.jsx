import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, User, Clock, AlertCircle } from 'lucide-react';
import SearchBar from '../SearchBar';

const TopNavbar = ({ setIsMobileOpen }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
        {/* Market Status (Placeholder for now) */}
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

        <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
          <button className="relative text-neutral-light hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-card"></span>
            </span>
          </button>
          <button className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
