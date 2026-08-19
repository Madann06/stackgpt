import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { 
  TrendingUp, Sparkles, Lock, Mail, ArrowRight, 
  ShieldCheck, Cpu, Zap, Eye, EyeOff, Github, Server, Globe, ExternalLink, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { stockApi } from '../services/stockApi';

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2.5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 mr-2.5 shrink-0" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [providers, setProviders] = useState({ google: false, facebook: false });

  const { login, loginWithGoogle, loginWithFacebook, handleOAuthToken, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Target path for authenticated redirect
  const from = location.state?.from?.pathname || '/dashboard';

  // Handle OAuth callback token / error in URL query
  useEffect(() => {
    const oauthToken = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(oauthError.replace(/\+/g, ' '));
    } else if (oauthToken) {
      setIsOAuthLoading(true);
      handleOAuthToken(oauthToken).then((success) => {
        setIsOAuthLoading(false);
        if (success) {
          navigate(from, { replace: true });
        } else {
          setError('Failed to authenticate OAuth token. Please try again.');
        }
      });
    }

    // Check third-party OAuth provider availability
    stockApi.getAuthProviders().then((res) => {
      if (res) setProviders(res);
    });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(cleanEmail, password);
      if (result) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 401) {
        setError('Invalid email or password.');
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Unable to sign in. Please check your connection or credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    setIsOAuthLoading(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      setError('Failed to initiate Google sign-in.');
      setIsOAuthLoading(false);
    }
  };

  const handleFacebookClick = async () => {
    setError('');
    setIsOAuthLoading(true);
    try {
      await loginWithFacebook();
    } catch (e) {
      setError('Facebook login is currently not available.');
      setIsOAuthLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError('');
    setIsLoading(true);
    try {
      try {
        await register('Demo Analyst', 'demo.analyst@stockai.com', 'password123');
      } catch (e) {
        await login('demo.analyst@stockai.com', 'password123');
      }
      navigate(from, { replace: true });
    } catch (e) {
      setError('Demo analyst login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Connected Ecosystem Bar */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-6 z-10 px-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-mono text-slate-400">Stack Ecosystem Active</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <a
            href="https://github.com/Madann06/stackgpt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all font-mono text-[11px]"
          >
            <Github className="w-3.5 h-3.5 text-slate-400" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          <a
            href="https://stackgpt-backend.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-all font-mono text-[11px]"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Render API</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          <a
            href="https://stackgpt.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-blue-400 border border-slate-700 transition-all font-mono text-[11px]"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Vercel App</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center z-10">
        
        {/* Left Side: Brand Narrative & Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 hidden lg:block pr-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-400/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-mono">
                Stack<span className="text-cyan-400">GPT</span>
              </h1>
              <p className="text-xs text-cyan-400 font-mono font-medium">AI Financial Intelligence Platform</p>
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
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
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
                <p className="text-xs text-slate-400">Real-time stock quotes, NSE/BSE tickers, P/E ratios, and interactive charts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">FastAPI JWT & Google OAuth 2.0</h3>
                <p className="text-xs text-slate-400">Bcrypt password hashing, Bearer JWT tokens, and Google authentication.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Auth Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-3xl p-8 border border-slate-700/80 shadow-2xl space-y-6 relative bg-slate-900/90"
        >
          <div className="text-center lg:text-left space-y-1">
            <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
            <p className="text-xs text-slate-400">Sign in to your account</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Third-Party OAuth Actions */}
          <div className="space-y-2.5">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoading || isOAuthLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-800 font-semibold rounded-xl border border-slate-300 shadow-md transition-all flex items-center justify-center text-sm font-sans"
            >
              <GoogleIcon />
              <span>{isOAuthLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Optional Facebook Sign In Button */}
            {providers.facebook && (
              <button
                type="button"
                onClick={handleFacebookClick}
                disabled={isLoading || isOAuthLoading}
                className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 text-white font-semibold rounded-xl border border-[#1877F2] shadow-md transition-all flex items-center justify-center text-sm font-sans"
              >
                <FacebookIcon />
                <span>Continue with Facebook</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0F172A] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider absolute">
              OR
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 block">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-900"
                />
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isOAuthLoading}
              className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 group text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Create Account Link */}
          <div className="text-center pt-1">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                Create account
              </Link>
            </p>
          </div>

          {/* Quick Demo Access */}
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={isLoading || isOAuthLoading}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" /> One-Click Demo Analyst Access
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;


