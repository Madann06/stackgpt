// Mock Stock Database with realistic financial datasets, Indian NSE stocks, and AI signals

export const MOCK_STOCKS = {
  // Indian NSE Market Leaders
  'RELIANCE.NS': {
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Ltd.',
    sector: 'Energy',
    industry: 'Oil, Gas & Retail Conglomerate',
    logo: 'https://images.unsplash.com/photo-1542744094-3a3172756015?w=120&auto=format&fit=crop&q=80',
    currentPrice: 2940.50,
    change: 35.80,
    changePercent: 1.23,
    isPositive: true,
    currency: 'INR',
    recommendation: 'BUY',
    recommendationScore: 8.6,
    aiConfidence: 89,
    riskLevel: 'Low',
    riskScore: 28,
    marketCap: '₹19.85L Cr',
    peRatio: 26.4,
    eps: 111.35,
    roe: '10.8%',
    dividendYield: '0.34%',
    pbRatio: 2.35,
    debtToEquity: '0.38',
    profitMargin: '8.9%',
    week52High: 3024.90,
    week52Low: 2220.30,
    avgVolume: '8.4M',
    beta: 0.88,
    aiSummary: `Reliance Industries commands market leadership across Energy, Telecom (Jio), and Retail. Expanding green energy CapEx and 5G subscriber monetization fuel long-term earnings compounding.`,
    aiBullishFactors: [
      'Jio Infocomm subscriber ARPU expansion following tariff revisions',
      'Reliance Retail store footprint expansion and digital commerce integration',
      'Giga-factory commissioning for Solar and Battery Energy Storage'
    ],
    aiBearishFactors: [
      'Volatile global oil refining gross margins (GRM)',
      'Substantial ongoing CapEx commitment in green hydrogen and retail infrastructure'
    ],
    analystTargets: {
      low: 2650.00,
      average: 3180.00,
      high: 3450.00,
      totalAnalysts: 36
    },
    riskBreakdown: {
      volatility: 'Low',
      financialHealth: 'Exceptional (9.5/10)',
      macroSensitivity: 'Moderate',
      regulatoryRisk: 'Low'
    }
  },
  'TCS.NS': {
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services Ltd.',
    sector: 'Technology',
    industry: 'IT Services & Consulting',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80',
    currentPrice: 4210.20,
    change: 48.50,
    changePercent: 1.17,
    isPositive: true,
    currency: 'INR',
    recommendation: 'BUY',
    recommendationScore: 8.7,
    aiConfidence: 87,
    riskLevel: 'Low',
    riskScore: 24,
    marketCap: '₹15.22L Cr',
    peRatio: 31.8,
    eps: 132.40,
    roe: '48.5%',
    dividendYield: '1.28%',
    pbRatio: 14.2,
    debtToEquity: '0.08',
    profitMargin: '24.2%',
    week52High: 4585.00,
    week52Low: 3310.00,
    avgVolume: '2.8M',
    beta: 0.65,
    aiSummary: `TCS demonstrates gold-standard IT services margin resilience (24.5%+ EBIT), backed by a massive deal win pipeline in enterprise cloud transformation, GenAI modernization, and cybersecurity.`,
    aiBullishFactors: [
      'Record $10B+ quarterly deal total contract value (TCV)',
      'Industry-leading operating margin profile and zero net debt balance sheet',
      'Aggressive AI workforce upskilling (>500,000 engineers trained in GenAI)'
    ],
    aiBearishFactors: [
      'Cautious discretionary IT spending by North American banking clients',
      'Currency fluctuation sensitivity relative to USD and EUR'
    ],
    analystTargets: {
      low: 3800.00,
      average: 4450.00,
      high: 4900.00,
      totalAnalysts: 42
    },
    riskBreakdown: {
      volatility: 'Low',
      financialHealth: 'Pristine (9.8/10)',
      macroSensitivity: 'Low',
      regulatoryRisk: 'Low'
    }
  },
  'INFY.NS': {
    symbol: 'INFY.NS',
    name: 'Infosys Limited',
    sector: 'Technology',
    industry: 'IT Services & Consulting',
    logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80',
    currentPrice: 1825.40,
    change: 22.10,
    changePercent: 1.23,
    isPositive: true,
    currency: 'INR',
    recommendation: 'BUY',
    recommendationScore: 8.3,
    aiConfidence: 84,
    riskLevel: 'Low',
    riskScore: 30,
    marketCap: '₹7.58L Cr',
    peRatio: 28.5,
    eps: 64.05,
    roe: '31.2%',
    dividendYield: '2.14%',
    pbRatio: 8.9,
    debtToEquity: '0.09',
    profitMargin: '17.8%',
    week52High: 1958.90,
    week52Low: 1355.00,
    avgVolume: '6.1M',
    beta: 0.82,
    aiSummary: `Infosys benefits from strong enterprise cloud adoption (Topaz AI framework) and steady dividend payouts. Cost optimization programs continue to buffer operational margins.`,
    aiBullishFactors: [
      'Topaz GenAI suite driving deal conversion in retail and financial services',
      'Consistent 85%+ capital return policy via dividends and buybacks'
    ],
    aiBearishFactors: [
      'Slower decision-making cycles for large digital transformation contracts'
    ],
    analystTargets: {
      low: 1600.00,
      average: 1920.00,
      high: 2150.00,
      totalAnalysts: 38
    },
    riskBreakdown: {
      volatility: 'Low',
      financialHealth: 'Strong (9.2/10)',
      macroSensitivity: 'Moderate',
      regulatoryRisk: 'Low'
    }
  },
  'TATAMOTORS.NS': {
    symbol: 'TATAMOTORS.NS',
    name: 'Tata Motors Limited',
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    logo: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=120&auto=format&fit=crop&q=80',
    currentPrice: 1045.80,
    change: 18.40,
    changePercent: 1.79,
    isPositive: true,
    currency: 'INR',
    recommendation: 'STRONG BUY',
    recommendationScore: 9.1,
    aiConfidence: 90,
    riskLevel: 'Medium',
    riskScore: 44,
    marketCap: '₹3.85L Cr',
    peRatio: 12.4,
    eps: 84.30,
    roe: '44.8%',
    dividendYield: '0.57%',
    pbRatio: 4.1,
    debtToEquity: '0.85',
    profitMargin: '7.2%',
    week52High: 1179.00,
    week52Low: 593.50,
    avgVolume: '14.2M',
    beta: 1.45,
    aiSummary: `Tata Motors is undergoing massive debt deleveraging led by Jaguar Land Rover (JLR) margin expansion and a 70%+ market share dominance in Indian electric passenger vehicles.`,
    aiBullishFactors: [
      'JLR order book remaining robust with high-margin Range Rover models',
      'Undisputed market monopoly in Indian EV segment (Nexon EV, Punch EV)',
      'Demerger of Commercial and Passenger Vehicle divisions unlocking shareholder value'
    ],
    aiBearishFactors: [
      'Global luxury car market slowdown risk in European and UK markets'
    ],
    analystTargets: {
      low: 920.00,
      average: 1150.00,
      high: 1300.00,
      totalAnalysts: 32
    },
    riskBreakdown: {
      volatility: 'Moderate',
      financialHealth: 'Solid (8.5/10)',
      macroSensitivity: 'Moderate',
      regulatoryRisk: 'Low'
    }
  },

  // US Global Leaders
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120&auto=format&fit=crop&q=80',
    currentPrice: 229.35,
    change: 3.42,
    changePercent: 1.51,
    isPositive: true,
    currency: 'USD',
    recommendation: 'BUY',
    recommendationScore: 8.4,
    aiConfidence: 82,
    riskLevel: 'Medium',
    riskScore: 42,
    marketCap: '3.50T',
    peRatio: 29.8,
    eps: 6.43,
    roe: '31.0%',
    dividendYield: '0.44%',
    pbRatio: 48.2,
    debtToEquity: '1.45',
    profitMargin: '26.4%',
    week52High: 237.23,
    week52Low: 164.08,
    avgVolume: '54.2M',
    beta: 1.04,
    aiSummary: `Apple demonstrates robust revenue resiliency led by growing Services margin expansion (+74% GM) and robust iPhone 16 supercycle adoption.`,
    aiBullishFactors: [
      'High-margin Services segment revenue accelerating at 14% YoY',
      'On-device AI integration triggering an extended hardware upgrade cycle'
    ],
    aiBearishFactors: [
      'Regulatory scrutiny surrounding App Store commission structures in EU & US'
    ],
    analystTargets: { low: 195.00, average: 245.00, high: 275.00, totalAnalysts: 38 },
    riskBreakdown: { volatility: 'Low', financialHealth: 'Exceptional (9.4/10)', macroSensitivity: 'Moderate', regulatoryRisk: 'High' }
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    industry: 'Semiconductors',
    logo: 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=120&auto=format&fit=crop&q=80',
    currentPrice: 128.50,
    change: 4.85,
    changePercent: 3.92,
    isPositive: true,
    currency: 'USD',
    recommendation: 'STRONG BUY',
    recommendationScore: 9.2,
    aiConfidence: 91,
    riskLevel: 'High',
    riskScore: 68,
    marketCap: '3.15T',
    peRatio: 64.2,
    eps: 2.00,
    roe: '54.8%',
    dividendYield: '0.03%',
    pbRatio: 38.5,
    debtToEquity: '0.22',
    profitMargin: '55.3%',
    week52High: 140.76,
    week52Low: 39.23,
    avgVolume: '88.9M',
    beta: 1.68,
    aiSummary: `NVIDIA remains the undisputed monopoly leader in AI datacenter compute infrastructure, commanding over 85% market share.`,
    aiBullishFactors: ['Blackwell B200 GPU architecture sold out for next 12 months'],
    aiBearishFactors: ['High customer concentration with top 4 cloud providers'],
    analystTargets: { low: 110.00, average: 152.00, high: 175.00, totalAnalysts: 44 },
    riskBreakdown: { volatility: 'High', financialHealth: 'Strong (8.9/10)', macroSensitivity: 'High', regulatoryRisk: 'Moderate' }
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    logo: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=120&auto=format&fit=crop&q=80',
    currentPrice: 248.20,
    change: -2.15,
    changePercent: -0.86,
    isPositive: false,
    currency: 'USD',
    recommendation: 'HOLD',
    recommendationScore: 5.8,
    aiConfidence: 64,
    riskLevel: 'High',
    riskScore: 74,
    marketCap: '790.4B',
    peRatio: 61.5,
    eps: 4.03,
    roe: '19.2%',
    dividendYield: 'N/A',
    pbRatio: 11.4,
    debtToEquity: '0.08',
    profitMargin: '12.8%',
    week52High: 271.00,
    week52Low: 138.80,
    avgVolume: '96.1M',
    beta: 2.31,
    aiSummary: `Tesla balances core EV automotive margin compression against potential option value in FSD v12 and Optimus robotics.`,
    aiBullishFactors: ['FSD v12 neural net architecture showing exponential improvement'],
    aiBearishFactors: ['Auto gross margin compression due to EV price reductions'],
    analystTargets: { low: 120.00, average: 235.00, high: 310.00, totalAnalysts: 35 },
    riskBreakdown: { volatility: 'Very High', financialHealth: 'Solid (7.8/10)', macroSensitivity: 'High', regulatoryRisk: 'High' }
  }
};

// Realistic Historical Chart Data Generator
export const generateChartData = (basePrice, timeframe = '1M', isPositive = true) => {
  let points = 30;
  let volatility = basePrice * 0.015;
  let dateFormat = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (timeframe === '1D') {
    points = 24;
    volatility = basePrice * 0.004;
    dateFormat = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (timeframe === '1W') {
    points = 7;
    volatility = basePrice * 0.008;
    dateFormat = (d) => d.toLocaleDateString('en-US', { weekday: 'short' });
  } else if (timeframe === '1M') {
    points = 30;
    volatility = basePrice * 0.012;
  } else if (timeframe === '6M') {
    points = 26;
    volatility = basePrice * 0.025;
    dateFormat = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (timeframe === '1Y') {
    points = 52;
    volatility = basePrice * 0.035;
    dateFormat = (d) => d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  } else if (timeframe === 'ALL') {
    points = 60;
    volatility = basePrice * 0.06;
    dateFormat = (d) => d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }

  const data = [];
  const startPrice = isPositive ? basePrice * 0.88 : basePrice * 1.12;
  let current = startPrice;

  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const time = new Date(now);
    if (timeframe === '1D') time.setHours(now.getHours() - i);
    else if (timeframe === '1W') time.setDate(now.getDate() - i);
    else if (timeframe === '1M') time.setDate(now.getDate() - i);
    else if (timeframe === '6M') time.setDate(now.getDate() - (i * 7));
    else if (timeframe === '1Y') time.setDate(now.getDate() - (i * 7));
    else if (timeframe === 'ALL') time.setMonth(now.getMonth() - i);

    const progress = 1 - (i / points);
    const target = startPrice + (basePrice - startPrice) * progress;
    const randomNoise = (Math.random() - 0.48) * volatility;
    current = target + randomNoise;

    if (i === 0) current = basePrice;

    const close = parseFloat(current.toFixed(2));
    const open = parseFloat((close * (0.995 + Math.random() * 0.01)).toFixed(2));
    const high = parseFloat((Math.max(open, close) + Math.random() * volatility * 0.5).toFixed(2));
    const low = parseFloat((Math.min(open, close) - Math.random() * volatility * 0.5).toFixed(2));
    const volume = Math.floor(Math.random() * 15000000) + 10000000;

    const timeStrFormat = (timeframe === '1D' || timeframe === '1W') 
      ? Math.floor(time.getTime() / 1000) 
      : time.toISOString().split('T')[0];

    data.push({
      time: timeStrFormat,
      timestamp: dateFormat(time),
      date: time.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      price: close,
      close: close,
      open: open,
      high: high,
      low: low,
      ma20: close,
      volume: volume
    });
  }

  // Calculate actual rolling 20 Simple Moving Average
  for (let idx = 0; idx < data.length; idx++) {
    const windowStart = Math.max(0, idx - 19);
    const windowSlice = data.slice(windowStart, idx + 1);
    const avg = windowSlice.reduce((sum, item) => sum + item.close, 0) / windowSlice.length;
    data[idx].ma20 = parseFloat(avg.toFixed(2));
  }

  return data;
};

// Mock Financial News Items
export const MOCK_NEWS = [
  {
    id: 1,
    symbol: 'RELIANCE.NS',
    title: 'Reliance Retail Revenue Crosses ₹3 Lakh Crore Annual Benchmark',
    summary: 'JioMart and physical retail store expansion fuel record consumer business operating revenues.',
    source: 'Economic Times',
    timeAgo: '2 hours ago',
    sentiment: 'Bullish',
    url: '#'
  },
  {
    id: 2,
    symbol: 'TCS.NS',
    title: 'TCS Secures $1.2B Mega Cloud Transformation Contract in Europe',
    summary: 'Multi-year IT services deal covers enterprise AI integration, cloud migration, and cybersecurity.',
    source: 'Business Standard',
    timeAgo: '4 hours ago',
    sentiment: 'Bullish',
    url: '#'
  },
  {
    id: 3,
    symbol: 'TATAMOTORS.NS',
    title: 'Tata Motors EV Sales Expand 45% YoY Led by Punch EV Demand',
    summary: 'Domestic passenger electric vehicle market share reaches 72% as manufacturing capacity ramps up.',
    source: 'CNBC TV18',
    timeAgo: '5 hours ago',
    sentiment: 'Bullish',
    url: '#'
  },
  {
    id: 4,
    symbol: 'AAPL',
    title: 'Apple Intelligence Rollout Triggers Surging Hardware Pre-Orders',
    summary: 'Supply chain analysis indicates a 15% increase in component orders for iPhone 16 Pro models.',
    source: 'Bloomberg Financial',
    timeAgo: '3 hours ago',
    sentiment: 'Bullish',
    url: '#'
  }
];

// Market Trending Data for Dashboard
export const MARKET_INDICES = [
  { name: 'NIFTY 50', value: '24,685.10', change: '+182.40', percent: '+0.74%', isPositive: true },
  { name: 'SENSEX', value: '80,950.30', change: '+540.20', percent: '+0.67%', isPositive: true },
  { name: 'S&P 500', value: '5,594.32', change: '+24.15', percent: '+0.43%', isPositive: true },
  { name: 'Nasdaq 100', value: '19,732.10', change: '+142.80', percent: '+0.73%', isPositive: true },
  { name: 'USD / INR', value: '83.92', change: '-0.05', percent: '-0.06%', isPositive: false }
];
