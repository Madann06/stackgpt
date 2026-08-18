import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, LineChart, Search, Sparkles, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = ({ onOpenMobileMenu }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Markets', path: '/markets', icon: LineChart },
    { name: 'Screener', path: '/screener', icon: Search },
    { name: 'AI Hub', path: '/ai-research', icon: Sparkles }
  ];

  const isPathActive = (path) => location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0B1220]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isPathActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center min-w-[60px] min-h-[48px] px-2 py-1 rounded-xl transition-all ${
                active ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-cyan-500/15 border border-cyan-500/30 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon className={`w-5 h-5 z-10 transition-transform ${active ? 'scale-110 text-cyan-400' : ''}`} />
              <span className="text-[10px] tracking-tight mt-1 font-medium z-10">{item.name}</span>
            </NavLink>
          );
        })}

        {/* Menu Button to trigger mobile drawer */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open Navigation Menu"
          className="relative flex flex-col items-center justify-center min-w-[60px] min-h-[48px] px-2 py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Menu className="w-5 h-5 z-10" />
          <span className="text-[10px] tracking-tight mt-1 font-medium z-10">Menu</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
