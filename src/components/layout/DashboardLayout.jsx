import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import TopTicker from './TopTicker';
import BottomNav from './BottomNav';

const DashboardLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden text-slate-100">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopTicker />
        <TopNavbar setIsMobileOpen={setIsMobileOpen} />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-24 lg:pb-6 hide-scrollbar relative w-full">
          {children}
        </main>
      </div>

      <BottomNav onOpenMobileMenu={() => setIsMobileOpen(true)} />
    </div>
  );
};

export default DashboardLayout;
