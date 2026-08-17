import React from 'react';

const News = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Market News</h1>
      <div className="glass-panel rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-4xl">🚧</div>
          <h2 className="text-xl font-semibold text-white">Page Under Construction</h2>
          <p className="text-neutral-light">The Market News functionality is being wired to the backend API.</p>
        </div>
      </div>
    </div>
  );
};

export default News;
