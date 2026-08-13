import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import TopTicker from './TopTicker';

const DashboardLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden text-slate-100">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopTicker />
        <TopNavbar setIsMobileOpen={setIsMobileOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 hide-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
