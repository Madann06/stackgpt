import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, LineChart, TrendingUp, Search, 
  Layers, Database, Newspaper, ShieldAlert, 
  Wallet, PieChart, Menu, X, Settings, Target
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Markets', path: '/markets', icon: <LineChart size={20} /> },
    { name: 'Screener', path: '/screener', icon: <Search size={20} /> },
    { name: 'Heatmap', path: '/heatmap', icon: <PieChart size={20} /> },
    { name: 'Top Performers', path: '/performers', icon: <TrendingUp size={20} /> },
    { name: 'Sectors', path: '/sectors', icon: <Layers size={20} /> },
    { name: 'IPO', path: '/ipo', icon: <Target size={20} /> },
    { name: 'News', path: '/news', icon: <Newspaper size={20} /> },
    { name: 'Regulations', path: '/regulations', icon: <ShieldAlert size={20} /> },
    { name: 'Mutual Funds', path: '/funds', icon: <Wallet size={20} /> },
    { name: 'AI Research', path: '/ai-research', icon: <Database size={20} /> }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-card border-r border-white/5 z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex-shrink-0
      `}>
        <div className="p-4 border-b border-white/5 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
              AI
            </div>
            <span className="font-bold text-lg tracking-wide text-white">StockAI<span className="text-primary"> India</span></span>
          </div>
          <button 
            className="lg:hidden text-neutral-light hover:text-white"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 h-[calc(100vh-4rem)] overflow-y-auto hide-scrollbar flex flex-col gap-1">
          <div className="text-xs font-semibold text-neutral mb-2 uppercase tracking-wider px-3">Menu</div>
          
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary/15 text-primary' 
                  : 'text-neutral-light hover:bg-white/5 hover:text-white'}
              `}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          ))}

          <div className="mt-auto pt-4 border-t border-white/5">
            <NavLink
              to="/settings"
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary/15 text-primary' 
                  : 'text-neutral-light hover:bg-white/5 hover:text-white'}
              `}
            >
              <Settings size={20} />
              <span className="font-medium text-sm">Settings</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
