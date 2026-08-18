import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, Lock, Mail, User as UserIcon, ArrowRight, 
  Eye, EyeOff, ShieldCheck, Github, Server, Globe, ExternalLink, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(fullName, email, password);
      if (result) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'An account with this email already exists or registration is unavailable.';
      setError(typeof msg === 'string' ? msg : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async (gEmail, gName) => {
    setError('');
    setIsLoading(true);
    setIsGoogleModalOpen(false);
    try {
      const targetEmail = gEmail || 'analyst.google@gmail.com';
      const targetName = gName || targetEmail.split('@')[0].replace('.', ' ').toUpperCase();
      
      await loginWithGoogle({
        email: targetEmail,
        name: targetName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      });
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError('Google Sign-Up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Connected Ecosystem Bar */}
      <div className="w-full max-w-md flex flex-wrap items-center justify-between gap-2 mb-4 z-10 px-1">
        <span className="text-[11px] font-mono text-slate-400">Stack Architecture</span>
        <div className="flex items-center gap-2 text-xs">
          <a
            href="https://github.com/Madann06/stackgpt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-mono"
          >
            <Github className="w-3 h-3 text-slate-400" />
            <span>GitHub</span>
          </a>
          <a
            href="https://stackgpt-backend.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700 text-[10px] font-mono"
          >
            <Server className="w-3 h-3 text-cyan-400" />
            <span>Render</span>
          </a>
          <a
            href="https://stackgpt.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 hover:text-blue-400 border border-slate-700 text-[10px] font-mono"
          >
            <Globe className="w-3 h-3 text-blue-400" />
            <span>Vercel</span>
          </a>
        </div>
      </div>

      <div className="w-full max-w-md z-10 space-y-5">
        <div className="flex items-center justify-center gap-3">
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

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 border border-slate-700/80 shadow-2xl space-y-5 bg-slate-900/90"
        >
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-slate-100">Create Account</h2>
            <p className="text-xs text-slate-400">Register new credentials for financial AI research</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* Google Sign-Up Button */}
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-800 font-semibold rounded-xl border border-slate-300 shadow-md transition-all flex items-center justify-center text-sm font-sans"
          >
            <GoogleIcon />
            <span>Sign up with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0F172A] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider absolute">
              OR FILL DETAILS
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 group text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Interactive Google Sign-In Selection Modal */}
      <AnimatePresence>
        {isGoogleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-slate-100"
            >
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-white flex items-center justify-center shadow-md">
                  <GoogleIcon />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Sign up with Google</h3>
                <p className="text-xs text-slate-400">Connect your Google account instantly</p>
              </div>

              {/* Instant Verified Profiles */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleGoogleSignUp('analyst.google@gmail.com', 'Google Portfolio Analyst')}
                  className="w-full p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 flex items-center gap-3 transition-all text-left"
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
                    alt="Google Account"
                    className="w-10 h-10 rounded-full border border-cyan-500/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-100 truncate">Google Portfolio Analyst</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">analyst.google@gmail.com</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                </button>
              </div>

              {/* Custom Google Email Input */}
              <div className="space-y-2 pt-2 border-t border-slate-700">
                <label className="text-[11px] font-semibold text-slate-300 block">Or use your Google email:</label>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-sans mb-1"
                />
                <input
                  type="email"
                  placeholder="your.name@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  disabled={!customGoogleEmail.includes('@')}
                  onClick={() => handleGoogleSignUp(customGoogleEmail, customGoogleName)}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all mt-1"
                >
                  Create with this Account
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;

