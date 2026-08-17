import os

pages = [
    ('Markets', 'Markets Overview'),
    ('Screener', 'Stock Screener'),
    ('Heatmap', 'Market Heatmap'),
    ('TopPerformers', 'Top Performers'),
    ('Sectors', 'Sectors'),
    ('IPO', 'IPO Center'),
    ('News', 'Market News'),
    ('Regulations', 'Regulations'),
    ('MutualFunds', 'Mutual Funds'),
    ('AIResearch', 'AI Research'),
    ('Settings', 'Settings'),
    ('Wishlist', 'My Wishlist'),
    ('History', 'Recently Viewed'),
    ('Calculator', 'Investment Calculator')
]

template = """import React from 'react';

const {name} = () => {{
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <div className="glass-panel rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-4xl">🚧</div>
          <h2 className="text-xl font-semibold text-white">Page Under Construction</h2>
          <p className="text-neutral-light">The {title} functionality is being wired to the backend API.</p>
        </div>
      </div>
    </div>
  );
}};

export default {name};
"""

os.makedirs('src/pages', exist_ok=True)
for name, title in pages:
    with open(f'src/pages/{name}.jsx', 'w', encoding='utf-8') as f:
        f.write(template.format(name=name, title=title))
print('Successfully created all placeholder pages.')
