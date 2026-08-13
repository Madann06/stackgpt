import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Search, 
  BarChart2, 
  Award, 
  ShieldAlert, 
  ChevronRight, 
  Cpu,
  Upload,
  Bot
} from 'lucide-react';
import { motion } from 'framer-motion';

import SearchBar from '../components/SearchBar';
import StockOverviewCard from '../components/StockOverviewCard';
import RecommendationCard from '../components/RecommendationCard';
import ConfidenceCard from '../components/ConfidenceCard';
import RiskCard from '../components/RiskCard';
import StockChart from '../components/StockChart';
import FinancialRatios from '../components/FinancialRatios';
import NewsSection from '../components/NewsSection';
import PDFUploadModal from '../components/PDFUploadModal';
import AIChatSection from '../components/AIChatSection';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import DurationSelector from '../components/DurationSelector';

import { stockApi } from '../services/stockApi';

const Dashboard = () => {
  const [featuredSymbol, setFeaturedSymbol] = useState('RELIANCE.NS');
  const [stockData, setStockData] = useState(null);
  const [allStocks, setAllStocks] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      setIsLoading(true);
      setAnalysisData(null);
      setSelectedDuration(null);
      const [details, stocksList, newsList] = await Promise.all([
        stockApi.getStockDetails(featuredSymbol),
        stockApi.getAllStocks(),
        stockApi.getStockNews(featuredSymbol)
      ]);

      if (isMounted) {
        setStockData(details);
        setAllStocks(stocksList);
        setNews(newsList);
        setIsLoading(false);
      }
    };

    loadDashboardData();
    return () => { isMounted = false; };
  }, [featuredSymbol]);

  const handleRunAnalysis = async (durationKey) => {
    if (!featuredSymbol || !durationKey) return;
    setIsAnalyzing(true);
    setSelectedDuration(durationKey);
    try {
      const result = await stockApi.analyzeStock(featuredSymbol, durationKey);
      setAnalysisData(result);
    } catch (e) {
      console.error("Failed to run stock analysis:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHorizonChangeFromCard = (newDurationKey) => {
    handleRunAnalysis(newDurationKey);
  };

  return (
    <>
      <div className="max-w-7xl w-full mx-auto space-y-8 pb-8">
        
        {/* Hero Welcome & Search Banner */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-card to-background p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden"
        >
          <div className="space-y-3 z-10">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
                <Sparkles className="w-3.5 h-3.5" /> LIVE MARKET & RAG AI HUB
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Indian Market Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-neutral-light max-w-xl">
              Search live NSE/BSE tickers, analyze real-time financial ratios, or upload annual report PDFs to execute grounded RAG AI search.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Upload Report PDF
              </button>
            </div>
          </div>
        </motion.div>

        {/* Ticker Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 font-mono text-xs hide-scrollbar">
          <span className="text-neutral-light text-[11px] uppercase font-bold shrink-0 mr-1">Quick Select:</span>
          {allStocks.map((s) => (
            <button
              key={s.symbol}
              onClick={() => setFeaturedSymbol(s.symbol)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all shrink-0 ${
                featuredSymbol === s.symbol
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 font-bold'
                  : 'bg-card text-neutral-light border-white/5 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{s.symbol}</span>
              <span className={`text-[10px] ${s.isPositive ? 'text-success' : 'text-danger'}`}>
                {s.isPositive ? '+' : ''}{s.changePercent}%
              </span>
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <LoadingSpinner size="large" text="Connecting to Live Stock Market Intelligence..." />
        ) : (
          stockData && (
            <>
              {/* Primary Stock Overview Card */}
              <StockOverviewCard stock={stockData} />

              {/* Duration Selector Input Step */}
              <DurationSelector
                symbol={stockData.symbol}
                selectedDuration={selectedDuration}
                onSelectDuration={(dur) => setSelectedDuration(dur)}
                onAnalyze={handleRunAnalysis}
                isAnalyzing={isAnalyzing}
              />

              {/* Prediction & Analysis Cards Grid (Rendered upon user selecting duration and analyzing) */}
              {isAnalyzing ? (
                <LoadingSpinner size="large" text={`Executing ${selectedDuration || 'Horizon'} Backtest & Risk Modeling for ${stockData.symbol}...`} />
              ) : (
                analysisData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RecommendationCard
                      recommendation={analysisData.recommendation}
                      recommendationScore={analysisData.recommendationScore}
                      analystTargets={analysisData.analystTargets}
                      durationLabel={analysisData.durationLabel}
                    />
                    <ConfidenceCard
                      profitProbability={analysisData.profitProbability}
                      timeHorizon={analysisData.timeHorizonDays}
                      durationLabel={analysisData.durationLabel}
                      currentDuration={analysisData.duration}
                      historicalSamples={analysisData.historicalSamples}
                      profitableSamples={analysisData.profitableSamples}
                      lossSamples={analysisData.lossSamples}
                      averageReturn={analysisData.averageReturn}
                      medianReturn={analysisData.medianReturn}
                      maxReturn={analysisData.maxReturn}
                      maxLoss={analysisData.maxLoss}
                      reliability={analysisData.reliability}
                      onHorizonChange={handleHorizonChangeFromCard}
                    />
                    <RiskCard
                      riskLevel={analysisData.riskLevel}
                      riskScore={analysisData.riskScore}
                      riskBreakdown={analysisData.riskBreakdown}
                      durationLabel={analysisData.durationLabel}
                    />
                  </div>
                )
              )}

              {/* Stock Chart Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-primary" /> Interactive Stock Chart
                  </h2>
                  <Link
                    to={`/company/${featuredSymbol}`}
                    className="text-xs text-primary hover:text-primary-light flex items-center gap-1 font-semibold transition-colors"
                  >
                    Full Company Analysis <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <StockChart symbol={stockData.symbol} isPositive={stockData.isPositive} height={380} />
              </div>

              {/* RAG AI Chat Section */}
              <AIChatSection symbol={stockData.symbol} selectedDocumentId={selectedDocument?.id} />

              {/* Financial Ratios Grid */}
              <FinancialRatios stock={stockData} />

              {/* Financial News Section */}
              <NewsSection news={news} />
            </>
          )
        )}
      </div>

      {/* PDF Upload Modal */}
      <PDFUploadModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onDocumentSelected={(doc) => setSelectedDocument(doc)}
      />

      <Footer />
    </>
  );
};

export default Dashboard;
