import React, { useState } from 'react';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Sparkles, X, Clock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NewsSection = ({ news = [] }) => {
  const [filter, setFilter] = useState('ALL');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredNews = news.filter(item => {
    if (filter === 'BULLISH') return item.sentiment === 'Bullish';
    if (filter === 'BEARISH') return item.sentiment === 'Bearish';
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-400" /> Latest Financial News & Sentiment
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time market press releases, earnings updates, and institutional analysis</p>
        </div>

        {/* Sentiment Filter Tabs */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-mono self-start sm:self-auto">
          {['ALL', 'BULLISH', 'BEARISH'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.map((article) => {
          const isBullish = article.sentiment === 'Bullish';
          return (
            <motion.div
              key={article.id}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              onClick={() => setSelectedArticle(article)}
              className="bg-[#1E293B]/90 hover:bg-[#243347] p-5 rounded-xl border border-slate-700/60 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Meta Top Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-400 truncate">{article.source}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 shrink-0 ${
                      isBullish
                        ? 'bg-green-500/15 text-green-400 border-green-500/30'
                        : 'bg-red-500/15 text-red-400 border-red-500/30'
                    }`}
                  >
                    {isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {article.sentiment}
                  </span>
                </div>

                {/* Article Headline */}
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>

                {/* Article Brief */}
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              {/* Bottom Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-4 mt-4 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {article.timeAgo}
                </span>
                <span className="text-blue-400 group-hover:underline flex items-center gap-1 font-sans font-semibold">
                  <Sparkles className="w-3 h-3" /> AI Insight
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Article Detail & AI Insight Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#1E293B] border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 relative"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md font-mono">
                  {selectedArticle.symbol}
                </span>
                <span className="text-xs text-slate-400">{selectedArticle.source}</span>
                <span className="text-xs text-slate-500">• {selectedArticle.timeAgo}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-100">{selectedArticle.title}</h2>

              {/* AI Executive Summary Box */}
              <div className="bg-blue-950/40 border border-blue-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> AI News Analysis Engine
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedArticle.summary}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-blue-900/50 font-mono">
                  <span>Sentiment Impact: <strong className={selectedArticle.sentiment === 'Bullish' ? 'text-green-400' : 'text-red-400'}>{selectedArticle.sentiment}</strong></span>
                  <span>Confidence: 94%</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Close Insight
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NewsSection;
