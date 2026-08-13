import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, User, Clock, AlertCircle } from 'lucide-react';

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

        <div className="hidden md:flex relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-light" size={18} />
          <input 
            type="text" 
            placeholder="Search NSE/BSE stocks, mutual funds, IPOs..." 
            className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white placeholder-neutral-dark"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <kbd className="hidden lg:inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px] text-neutral-light font-mono">
              CTRL K
            </kbd>
          </div>
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
