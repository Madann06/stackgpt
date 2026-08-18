import React, { useState, useEffect, useRef } from 'react';
import { 
  createChart, 
  CandlestickSeries, 
  AreaSeries, 
  LineSeries, 
  HistogramSeries, 
  ColorType, 
  LineStyle, 
  CrosshairMode 
} from 'lightweight-charts';
import { BarChart2, RefreshCw, AlertCircle, CandlestickChart as CandleIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { stockApi } from '../services/stockApi';

/**
 * Safely parse date or time values into valid Lightweight Charts time (YYYY-MM-DD string or Unix timestamp in seconds)
 */
const normalizeTime = (item) => {
  const rawTime = item.time ?? item.date ?? item.timestamp;
  if (rawTime === undefined || rawTime === null) return null;

  // If numeric Unix timestamp
  if (typeof rawTime === 'number') {
    return rawTime > 2000000000 ? Math.floor(rawTime / 1000) : Math.floor(rawTime);
  }

  // If already YYYY-MM-DD string
  if (typeof rawTime === 'string') {
    const trimmed = rawTime.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }

  // Try parsing date string
  const dateCandidates = [rawTime, item.date, item.timestamp].filter(Boolean);
  for (const cand of dateCandidates) {
    if (typeof cand === 'number') {
      return cand > 2000000000 ? Math.floor(cand / 1000) : Math.floor(cand);
    }
    const parsed = Date.parse(cand);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // Fallback: generate a date using current index if invalid string format
  return null;
};

/**
 * Process raw dataset into clean, sorted, deduplicated Lightweight Charts data
 */
const processChartData = (rawData) => {
  if (!Array.isArray(rawData) || rawData.length === 0) return [];

  const timeMap = new Map();
  const now = new Date();

  rawData.forEach((item, index) => {
    let t = normalizeTime(item);
    if (!t) {
      // Fallback date generation if time format is unrecognized (e.g. "Aug 03")
      const d = new Date(now);
      d.setDate(now.getDate() - (rawData.length - index));
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      t = `${year}-${month}-${day}`;
    }

    const open = Number(item.open ?? item.price ?? 0);
    const close = Number(item.close ?? item.price ?? 0);
    const high = Number(item.high ?? Math.max(open, close));
    const low = Number(item.low ?? Math.min(open, close));
    const volume = Number(item.volume ?? 0);
    const ma20 = Number(item.ma20 ?? close);

    if (isNaN(open) || isNaN(close) || isNaN(high) || isNaN(low)) return;

    timeMap.set(t, {
      time: t,
      open,
      high: Math.max(high, open, close),
      low: Math.min(low, open, close),
      close,
      volume,
      ma20,
      date: item.date || String(t),
      timestamp: item.timestamp || String(t),
    });
  });

  // Sort strictly in ascending order by time
  const sorted = Array.from(timeMap.values()).sort((a, b) => {
    if (typeof a.time === 'number' && typeof b.time === 'number') {
      return a.time - b.time;
    }
    return String(a.time).localeCompare(String(b.time));
  });

  return sorted;
};

// Safe Series Adders supporting both Lightweight Charts v4 and v5
const safeAddCandlestick = (chart, options) => {
  if (typeof chart.addCandlestickSeries === 'function') {
    return chart.addCandlestickSeries(options);
  }
  return chart.addSeries(CandlestickSeries, options);
};

const safeAddArea = (chart, options) => {
  if (typeof chart.addAreaSeries === 'function') {
    return chart.addAreaSeries(options);
  }
  return chart.addSeries(AreaSeries, options);
};

const safeAddLine = (chart, options) => {
  if (typeof chart.addLineSeries === 'function') {
    return chart.addLineSeries(options);
  }
  return chart.addSeries(LineSeries, options);
};

const safeAddHistogram = (chart, options) => {
  if (typeof chart.addHistogramSeries === 'function') {
    return chart.addHistogramSeries(options);
  }
  return chart.addSeries(HistogramSeries, options);
};

const StockChart = ({ symbol = 'AAPL', isPositive = true, height = 420 }) => {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('candlestick'); // 'candlestick' | 'line'
  const [chartData, setChartData] = useState([]);
  const [hoveredData, setHoveredData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMA, setShowMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  const timeframes = ['1D', '1W', '1M', '6M', '1Y', 'ALL'];
  const isINR = symbol?.endsWith('.NS') || symbol?.endsWith('.BO');
  const currencySymbol = isINR ? '₹' : '$';

  // 1. Fetch Historical Chart Data
  useEffect(() => {
    let isMounted = true;
    const fetchChart = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const raw = await stockApi.getStockChartData(symbol, timeframe);
        if (isMounted) {
          const cleaned = processChartData(raw);
          if (cleaned.length > 0) {
            setChartData(cleaned);
          } else {
            setError('No historical data available for this timeframe.');
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load chart data:', err);
          setError('Unable to load historical chart dataset.');
          setIsLoading(false);
        }
      }
    };

    fetchChart();
    return () => { isMounted = false; };
  }, [symbol, timeframe]);

  // 2. Render Lightweight Charts Canvas
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    // Destroy existing chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const container = chartContainerRef.current;
    const containerWidth = container.clientWidth || 800;

    // Initialize TradingView Lightweight Chart
    const chart = createChart(container, {
      width: containerWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94A3B8',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace, sans-serif',
      },
      grid: {
        vertLines: { color: '#334155', style: LineStyle.Dotted, visible: false },
        horzLines: { color: '#334155', style: LineStyle.Dotted, visible: true },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#60A5FA',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1E293B',
        },
        horzLine: {
          color: '#60A5FA',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1E293B',
        },
      },
      rightPriceScale: {
        borderColor: '#334155',
        scaleMargins: {
          top: 0.08,
          bottom: showVolume ? 0.22 : 0.08,
        },
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: timeframe === '1D' || timeframe === '1W',
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    chartInstanceRef.current = chart;

    // A. Main Series (Candlestick or Line)
    let mainSeries;
    if (chartType === 'candlestick') {
      mainSeries = safeAddCandlestick(chart, {
        upColor: '#22C55E',
        downColor: '#EF4444',
        borderVisible: false,
        wickUpColor: '#22C55E',
        wickDownColor: '#EF4444',
      });

      const candleData = chartData.map((d) => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      mainSeries.setData(candleData);
    } else {
      mainSeries = safeAddArea(chart, {
        topColor: isPositive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
        bottomColor: isPositive ? 'rgba(34, 197, 94, 0.0)' : 'rgba(239, 68, 68, 0.0)',
        lineColor: isPositive ? '#22C55E' : '#EF4444',
        lineWidth: 2,
      });

      const lineData = chartData.map((d) => ({
        time: d.time,
        value: d.close,
      }));
      mainSeries.setData(lineData);
    }

    // B. 20 MA Line Series Overlay
    let maSeries;
    if (showMA) {
      maSeries = safeAddLine(chart, {
        color: '#60A5FA',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const maData = chartData
        .filter((d) => d.ma20 !== undefined && d.ma20 !== null)
        .map((d) => ({
          time: d.time,
          value: d.ma20,
        }));
      maSeries.setData(maData);
    }

    // C. Volume Histogram Overlay
    let volumeSeries;
    if (showVolume) {
      volumeSeries = safeAddHistogram(chart, {
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        scaleMargins: {
          top: 0.78,
          bottom: 0,
        },
      });

      const volumeData = chartData.map((d) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)',
      }));
      volumeSeries.setData(volumeData);
    }

    // Fit content to screen width
    chart.timeScale().fitContent();

    // Crosshair hover listener for floating info panel
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || param.point === undefined || param.point.x < 0 || param.point.y < 0) {
        setHoveredData(null);
        return;
      }

      const found = chartData.find((d) => d.time === param.time);
      if (found) {
        setHoveredData(found);
      } else {
        setHoveredData(null);
      }
    });

    // Resize Observer for responsive width adjustments
    const handleResize = () => {
      if (container && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: container.clientWidth,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData, chartType, showMA, showVolume, height, isPositive]);

  // Latest active data point for static display if not hovering
  const activeDataPoint = hoveredData || (chartData.length > 0 ? chartData[chartData.length - 1] : null);
  const isBullish = activeDataPoint ? activeDataPoint.close >= activeDataPoint.open : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl space-y-4"
    >
      {/* Chart Top Control Header */}
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-3">
        
        {/* Left Section: Title, Chart Type Toggle & Indicator Overlay Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
            <h2 className="text-xs sm:text-base font-bold text-slate-100 truncate">Historical Price & Technical Analysis</h2>
          </div>

          {/* Chart Type Toggle & Overlays */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs font-mono">
              <button
                type="button"
                onClick={() => setChartType('candlestick')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 min-h-[36px] ${
                  chartType === 'candlestick'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <CandleIcon className="w-3.5 h-3.5" /> Candle
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 min-h-[36px] ${
                  chartType === 'line'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> Line
              </button>
            </div>

            {/* Indicator Overlays: 20 MA & Volume */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowMA(!showMA)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono transition-all border min-h-[36px] ${
                  showMA
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                20 MA
              </button>
              <button
                type="button"
                onClick={() => setShowVolume(!showVolume)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono transition-all border min-h-[36px] ${
                  showVolume
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                Volume
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Scrollable Timeframe Buttons (1D, 1W, 1M, 6M, 1Y, ALL) */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto hide-scrollbar max-w-full">
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all shrink-0 min-h-[36px] ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Floating / Top Info Bar showing hovered Candle OHLCV */}
      {activeDataPoint && (
        <div className="flex flex-wrap items-center justify-between bg-slate-900/80 border border-slate-800/80 px-4 py-2 rounded-xl text-xs font-mono gap-3">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-sans font-bold">{activeDataPoint.date || activeDataPoint.timestamp}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
              isBullish ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {isBullish ? 'BULLISH' : 'BEARISH'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            <span><span className="text-slate-400 font-sans">Open:</span> <strong className="text-slate-200">{currencySymbol}{activeDataPoint.open?.toFixed(2)}</strong></span>
            <span><span className="text-slate-400 font-sans">High:</span> <strong className="text-emerald-400">{currencySymbol}{activeDataPoint.high?.toFixed(2)}</strong></span>
            <span><span className="text-slate-400 font-sans">Low:</span> <strong className="text-rose-400">{currencySymbol}{activeDataPoint.low?.toFixed(2)}</strong></span>
            <span><span className="text-slate-400 font-sans">Close:</span> <strong className="text-slate-100">{currencySymbol}{activeDataPoint.close?.toFixed(2)}</strong></span>
            {showMA && activeDataPoint.ma20 && (
              <span><span className="text-blue-400 font-sans">20 MA:</span> <strong className="text-blue-300">{currencySymbol}{activeDataPoint.ma20?.toFixed(2)}</strong></span>
            )}
            {showVolume && activeDataPoint.volume !== undefined && (
              <span><span className="text-slate-400 font-sans">Vol:</span> <strong className="text-slate-300">
                {activeDataPoint.volume >= 1000000
                  ? `${(activeDataPoint.volume / 1000000).toFixed(2)}M`
                  : activeDataPoint.volume >= 1000
                  ? `${(activeDataPoint.volume / 1000).toFixed(1)}K`
                  : activeDataPoint.volume}
              </strong></span>
            )}
          </div>
        </div>
      )}

      {/* Chart Canvas Container */}
      <div className="w-full relative" style={{ height: `${height}px` }}>
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 rounded-xl backdrop-blur-sm z-20">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Fetching {timeframe} OHLCV Data for ${symbol}...</span>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/85 rounded-xl backdrop-blur-sm z-20 gap-3">
            <AlertCircle className="w-8 h-8 text-amber-400" />
            <p className="text-xs font-mono text-slate-300">{error}</p>
            <button
              onClick={() => setTimeframe((prev) => prev)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-lg transition-colors"
            >
              Retry Load
            </button>
          </div>
        )}

        {/* Lightweight Charts Mount Element */}
        <div ref={chartContainerRef} className="w-full h-full rounded-xl overflow-hidden" />
      </div>

      {/* Footer Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 font-mono pt-1 gap-2 border-t border-slate-800/60">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Bullish Candle / Rise
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span> Bearish Candle / Fall
          </span>
          {showMA && (
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-3 h-0.5 bg-blue-400 inline-block"></span> 20 MA Line
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-500">TradingView Lightweight Charts Engine • Yahoo Finance API</span>
      </div>
    </motion.div>
  );
};

export default StockChart;
