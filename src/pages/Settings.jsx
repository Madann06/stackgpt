import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Key, Bell, Shield, Database, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [apiKey, setApiKey] = useState('sk-live-stockai-xxxx-9821');
  const [refreshInterval, setRefreshInterval] = useState('5m');
  const [notifications, setNotifications] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Account & Platform Settings</h1>
          </div>
          <p className="text-sm text-neutral-light">
            Manage your AI Stock Research workspace, data refresh intervals, API access keys, and security preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" /> Analyst Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                readOnly
                value={user?.name || "Senior Portfolio Analyst"}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Email Address</label>
              <input
                type="text"
                readOnly
                value={user?.email || "demo.analyst@stockai.com"}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Data & API Configuration */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" /> Data Provider & Refresh Intervals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Cache TTL Refresh Interval</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              >
                <option value="1m">1 Minute (High Frequency)</option>
                <option value="5m">5 Minutes (Recommended)</option>
                <option value="15m">15 Minutes (Low Bandwidth)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Live Market Provider</label>
              <input
                type="text"
                readOnly
                value="Yahoo Finance (Cached) / Commercial Ready"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Save Notification */}
        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> Platform settings updated successfully!
          </div>
        )}

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Workspace Settings
        </button>
      </form>
    </div>
  );
};

export default Settings;
