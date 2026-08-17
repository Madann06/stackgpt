import React from 'react';
import { useUserFeatures } from '../context/UserFeaturesContext';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Trash2 } from 'lucide-react';

const History = () => {
  const { history, clearHistory } = useUserFeatures();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Recently Viewed</h1>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 text-xs font-semibold text-danger hover:text-danger/80 transition-colors px-3 py-1.5 rounded-lg border border-danger/20 hover:border-danger/40 bg-danger/5"
          >
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 max-w-md">
            <Clock className="w-12 h-12 text-neutral-light mx-auto" />
            <h2 className="text-xl font-semibold text-white">No history yet</h2>
            <p className="text-neutral-light">Pages and companies you view will appear here for easy access.</p>
            <Link to="/markets" className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors">
              Explore Markets <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
          <div className="divide-y divide-white/5">
            {history.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div>
                  <Link to={`/company/${item.symbol}`} className="text-base font-bold text-white hover:text-primary transition-colors">
                    {item.symbol}
                  </Link>
                  <p className="text-xs text-neutral-light">{item.name || 'Company Profile'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-light font-mono block mb-1">
                    {new Date(item.viewedAt).toLocaleString()}
                  </span>
                  <Link to={`/company/${item.symbol}`} className="text-xs font-semibold text-primary hover:underline">
                    View Again
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
