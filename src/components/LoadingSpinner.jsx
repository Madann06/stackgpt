import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', text = 'Analyzing Stock Intelligence...' }) => {
  const spinnerSizes = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className={`${spinnerSizes[size]} border-slate-700 border-t-blue-500 border-r-blue-400 rounded-full`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
        </div>
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="text-slate-400 text-sm font-medium tracking-wide flex items-center gap-2"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
