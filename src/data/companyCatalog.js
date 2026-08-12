// Curated catalog of global and Indian equities categorized by industry sector

export const CATEGORIES = [
  'All',
  'Technology',
  'Banking & Finance',
  'Healthcare',
  'Automobile',
  'Energy',
  'Consumer',
  'Industrial',
  'Telecommunications'
];

export const COMPANY_CATALOG = [
  // Technology
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    industry: 'Semiconductors',
    logo: 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    industry: 'Software & Cloud',
    logo: 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services Ltd.',
    sector: 'Technology',
    industry: 'IT Services & Consulting',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'INFY.NS',
    name: 'Infosys Limited',
    sector: 'Technology',
    industry: 'IT Services & Consulting',
    logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Technology',
    industry: 'Internet Content & Search',
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=120&auto=format&fit=crop&q=80'
  },

  // Banking & Finance
  {
    symbol: 'HDFCBANK.NS',
    name: 'HDFC Bank Limited',
    sector: 'Banking & Finance',
    industry: 'Private Banking',
    logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'ICICIBANK.NS',
    name: 'ICICI Bank Limited',
    sector: 'Banking & Finance',
    industry: 'Private Banking',
    logo: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'SBIN.NS',
    name: 'State Bank of India',
    sector: 'Banking & Finance',
    industry: 'Public Banking',
    logo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    sector: 'Banking & Finance',
    industry: 'Investment Banking',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80'
  },

  // Healthcare
  {
    symbol: 'SUNPHARMA.NS',
    name: 'Sun Pharmaceutical Industries Ltd.',
    sector: 'Healthcare',
    industry: 'Pharmaceuticals',
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'CIPLA.NS',
    name: 'Cipla Limited',
    sector: 'Healthcare',
    industry: 'Pharmaceuticals',
    logo: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'PFE',
    name: 'Pfizer Inc.',
    sector: 'Healthcare',
    industry: 'Biotechnology & Pharma',
    logo: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    sector: 'Healthcare',
    industry: 'Medical Devices & Health',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=80'
  },

  // Automobile
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'Automobile',
    industry: 'Electric Auto Vehicles',
    logo: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'TATAMOTORS.NS',
    name: 'Tata Motors Limited',
    sector: 'Automobile',
    industry: 'Auto Manufacturers & EVs',
    logo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'M&M.NS',
    name: 'Mahindra & Mahindra Ltd.',
    sector: 'Automobile',
    industry: 'SUVs & Farm Equipment',
    logo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'F',
    name: 'Ford Motor Company',
    sector: 'Automobile',
    industry: 'Auto Manufacturers',
    logo: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=120&auto=format&fit=crop&q=80'
  },

  // Energy
  {
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Ltd.',
    sector: 'Energy',
    industry: 'Oil, Gas & Energy Conglomerate',
    logo: 'https://images.unsplash.com/photo-1542744094-3a3172756015?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'ONGC.NS',
    name: 'Oil & Natural Gas Corp Ltd.',
    sector: 'Energy',
    industry: 'Oil & Gas Exploration',
    logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    sector: 'Energy',
    industry: 'Integrated Oil & Gas',
    logo: 'https://images.unsplash.com/photo-1527018601619-a508a2be00ed?w=120&auto=format&fit=crop&q=80'
  },

  // Consumer
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    sector: 'Consumer',
    industry: 'E-Commerce & Retail',
    logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'ITC.NS',
    name: 'ITC Limited',
    sector: 'Consumer',
    industry: 'FMCG & Consumer Goods',
    logo: 'https://images.unsplash.com/photo-1556742049-0a675629c425?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'HINDUNILVR.NS',
    name: 'Hindustan Unilever Ltd.',
    sector: 'Consumer',
    industry: 'FMCG & Home Care',
    logo: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'WMT',
    name: 'Walmart Inc.',
    sector: 'Consumer',
    industry: 'Hypermarkets & Retail',
    logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=120&auto=format&fit=crop&q=80'
  },

  // Industrial
  {
    symbol: 'LT.NS',
    name: 'Larsen & Toubro Ltd.',
    sector: 'Industrial',
    industry: 'Engineering & Construction',
    logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'CAT',
    name: 'Caterpillar Inc.',
    sector: 'Industrial',
    industry: 'Heavy Construction Machinery',
    logo: 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'GE',
    name: 'General Electric Company',
    sector: 'Industrial',
    industry: 'Aerospace & Energy Power',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80'
  },

  // Telecommunications
  {
    symbol: 'BHARTIARTL.NS',
    name: 'Bharti Airtel Limited',
    sector: 'Telecommunications',
    industry: 'Telecom & 5G Infrastructure',
    logo: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'T',
    name: 'AT&T Inc.',
    sector: 'Telecommunications',
    industry: 'Telecom Services',
    logo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=120&auto=format&fit=crop&q=80'
  },
  {
    symbol: 'VZ',
    name: 'Verizon Communications',
    sector: 'Telecommunications',
    industry: 'Wireless & Broadband',
    logo: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=120&auto=format&fit=crop&q=80'
  }
];
