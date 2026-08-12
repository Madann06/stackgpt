import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Sparkles, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Cpu, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('alex.vance@financial.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setIsLoading(false);
          return;
        }
        await register(fullName, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Authentication failed. Please check credentials.';
      setError(typeof msg === 'string' ? msg : 'Error processing request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError('');
    setIsLoading(true);
    try {
      // Try registering demo account if first time
      try {
        await register('Demo Analyst', 'demo.analyst@stockai.com', 'password123');
      } catch (e) {
        await login('demo.analyst@stockai.com', 'password123');
      }
      navigate('/dashboard');
    } catch (e) {
      await login('alex.vance@financial.ai', 'password123');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center z-10">
        
        {/* Left Side: Brand Narrative & Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 hidden lg:block pr-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-mono">
                Stock<span className="text-blue-500">AI</span> Assistant
              </h1>
              <p className="text-xs text-blue-400 font-mono font-medium">Final-Year Computer Science Project</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-100 leading-tight">
              Next-Generation Financial Intelligence & RAG AI Platform
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connect to real-time market data, upload financial annual report PDFs, index ChromaDB vector embeddings, and receive grounded AI research answers with page citations.
            </p>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">ChromaDB RAG Vector Pipeline</h3>
                <p className="text-xs text-slate-400">Page-by-page PDF text extraction and semantic chunk search.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Live Yahoo Finance Market Data</h3>
                <p className="text-xs text-slate-400">Real-time stock quotes, P/E ratios, EPS, ROE, and historical charts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">FastAPI JWT Security</h3>
                <p className="text-xs text-slate-400">Bcrypt password hashing and OAuth2 Bearer token authentication.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Auth Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-3xl p-8 border border-slate-700/80 shadow-2xl space-y-6 relative"
        >
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => { setIsRegisterMode(false); setError(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                !isRegisterMode ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegisterMode(true); setError(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                isRegisterMode ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-100">
              {isRegisterMode ? 'Create Analyst Account' : 'Analyst Sign In'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegisterMode ? 'Register new credentials to access AI Stock Assistant' : 'Access your AI Stock Research workspace'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field (Register mode only) */}
            {isRegisterMode && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                    required={isRegisterMode}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@financial.ai"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 block">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegisterMode ? 'Register Account' : 'Sign In to Platform'}{' '}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#1E293B] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider absolute">
              OR QUICK ACCESS
            </span>
          </div>

          {/* Quick Demo Login Button */}
          <button
            onClick={handleQuickDemo}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Sparkles className="w-4 h-4 text-blue-400" /> One-Click Demo Analyst Access
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;
