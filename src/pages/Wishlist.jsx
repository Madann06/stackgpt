import React from 'react';
import { useUserFeatures } from '../context/UserFeaturesContext';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useUserFeatures();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Star className="w-5 h-5 fill-primary" />
        </div>
        <h1 className="text-2xl font-bold text-white">My Wishlist</h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 max-w-md">
            <Star className="w-12 h-12 text-neutral-light mx-auto" />
            <h2 className="text-xl font-semibold text-white">Your wishlist is empty</h2>
            <p className="text-neutral-light">Search for companies or mutual funds and click the star icon to add them to your wishlist for quick access.</p>
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.symbol} 
              className="glass-card p-5 rounded-xl border border-white/5 relative group hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.symbol}</h3>
                  <p className="text-xs text-neutral-light line-clamp-1">{item.name || 'Company Name'}</p>
                </div>
                <button 
                  onClick={() => removeFromWishlist(item.symbol)}
                  className="text-neutral-light hover:text-danger transition-colors p-1"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
                <Link to={`/company/${item.symbol}`} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                  View Analysis <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-[10px] text-neutral-light flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
                  </span>
                  LIVE
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
