import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserFeaturesProvider } from './context/UserFeaturesContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompanyAnalysis from './pages/CompanyAnalysis';
import DashboardLayout from './components/layout/DashboardLayout';

// New Pages
import Markets from './pages/Markets';
import Screener from './pages/Screener';
import Heatmap from './pages/Heatmap';
import TopPerformers from './pages/TopPerformers';
import Sectors from './pages/Sectors';
import IPO from './pages/IPO';
import News from './pages/News';
import Regulations from './pages/Regulations';
import MutualFunds from './pages/MutualFunds';
import AIResearch from './pages/AIResearch';
import Settings from './pages/Settings';
import Wishlist from './pages/Wishlist';
import History from './pages/History';
import Calculator from './pages/Calculator';

function App() {
  return (
    <AuthProvider>
      <UserFeaturesProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
          
          {/* Dashboard Layout Routes */}
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/markets" element={<DashboardLayout><Markets /></DashboardLayout>} />
          <Route path="/screener" element={<DashboardLayout><Screener /></DashboardLayout>} />
          <Route path="/heatmap" element={<DashboardLayout><Heatmap /></DashboardLayout>} />
          <Route path="/performers" element={<DashboardLayout><TopPerformers /></DashboardLayout>} />
          <Route path="/sectors" element={<DashboardLayout><Sectors /></DashboardLayout>} />
          <Route path="/ipo" element={<DashboardLayout><IPO /></DashboardLayout>} />
          <Route path="/news" element={<DashboardLayout><News /></DashboardLayout>} />
          <Route path="/regulations" element={<DashboardLayout><Regulations /></DashboardLayout>} />
          <Route path="/funds" element={<DashboardLayout><MutualFunds /></DashboardLayout>} />
          <Route path="/ai-research" element={<DashboardLayout><AIResearch /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
          
          <Route path="/wishlist" element={<DashboardLayout><Wishlist /></DashboardLayout>} />
          <Route path="/history" element={<DashboardLayout><History /></DashboardLayout>} />
          <Route path="/calculator" element={<DashboardLayout><Calculator /></DashboardLayout>} />
          
          <Route path="/company" element={<DashboardLayout><CompanyAnalysis /></DashboardLayout>} />
          <Route path="/company/:symbol" element={<DashboardLayout><CompanyAnalysis /></DashboardLayout>} />
          
          {/* Catch-all */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      </UserFeaturesProvider>
    </AuthProvider>
  );
}

export default App;
