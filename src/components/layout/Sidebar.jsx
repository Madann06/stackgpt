import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, LineChart, TrendingUp, Search, 
  Layers, Database, Newspaper, ShieldAlert, 
  Wallet, PieChart, X, Settings, Target,
  Star, Clock, Calculator, LogOut, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  const handleLogout = async () => {
    setIsMobileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
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

  const userFeatures = [
    { name: 'Wishlist', path: '/wishlist', icon: <Star size={20} /> },
    { name: 'History', path: '/history', icon: <Clock size={20} /> },
    { name: 'Calculator', path: '/calculator', icon: <Calculator size={20} /> }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        aria-label="Sidebar Navigation"
        className={`
          fixed top-0 left-0 h-full w-72 sm:w-64 bg-[#111827] border-r border-white/10 z-50
          transform transition-transform duration-300 ease-in-out shadow-2xl
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex-shrink-0
        `}
      >
        <div className="p-4 border-b border-white/5 flex justify-between items-center h-16 bg-[#0B1220]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
              AI
            </div>
            <span className="font-bold text-lg tracking-wide text-white">StockAI<span className="text-cyan-400"> India</span></span>
          </div>
          <button 
            type="button"
            aria-label="Close drawer"
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-3 h-[calc(100vh-4rem)] overflow-y-auto hide-scrollbar flex flex-col gap-1 pb-16 lg:pb-4">
          {/* User Account Card on Mobile Drawer */}
          {isAuthenticated && (
            <div className="lg:hidden mb-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 font-bold text-xs">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="truncate max-w-[130px]">
                  <p className="text-xs font-bold text-slate-100 truncate">{user?.name || 'Analyst'}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">Main Menu</div>
          
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all min-h-[44px]
                ${isActive 
                  ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/20 shadow-sm' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'}
              `}
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}

          <div className="mt-4 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">My Workspace</div>
          
          {userFeatures.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all min-h-[44px]
                ${isActive 
                  ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/20 shadow-sm' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'}
              `}
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}

          <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
            <NavLink
              to="/settings"
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-[40px]
                ${isActive 
                  ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/20 shadow-sm' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'}
              `}
            >
              <Settings size={18} />
              <span className="text-sm font-medium">Settings</span>
            </NavLink>

            {/* Cloud & Source Ecosystem Badges */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>STACK DEPLOYMENT</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1">
                <a
                  href="https://github.com/Madann06/stackgpt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-mono text-center transition-all"
                >
                  GitHub
                </a>
                <a
                  href="https://stackgpt-backend.onrender.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1 px-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-mono text-center transition-all"
                >
                  Render
                </a>
                <a
                  href="https://stackgpt.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1 px-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-mono text-center transition-all"
                >
                  Vercel
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
