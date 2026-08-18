import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  Sparkles, 
  BarChart2, 
  Award, 
  ShieldAlert, 
  Scale, 
  Newspaper, 
  Cpu, 
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';

import Navbar from '../components/Navbar';
import CompanySelector from '../components/CompanySelector';
import StockOverviewCard from '../components/StockOverviewCard';
import RecommendationCard from '../components/RecommendationCard';
import ConfidenceCard from '../components/ConfidenceCard';
import RiskCard from '../components/RiskCard';
import StockChart from '../components/StockChart';
import FinancialRatios from '../components/FinancialRatios';
import AIAnalysisCard from '../components/AIAnalysisCard';
import NewsSection from '../components/NewsSection';
import PDFUploadModal from '../components/PDFUploadModal';
import AIChatSection from '../components/AIChatSection';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import DurationSelector from '../components/DurationSelector';
import { useUserFeatures } from '../context/UserFeaturesContext';

import { stockApi } from '../services/stockApi';

const CompanyAnalysis = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { addToHistory } = useUserFeatures();

  const [stock, setStock] = useState(null);
  const [news, setNews] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const activeSymbol = symbol ? symbol.toUpperCase() : null;

  useEffect(() => {
    if (!activeSymbol) {
      setStock(null);
      setNews([]);
      setAnalysisData(null);
      setSelectedDuration(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    let timeoutId = null;

    const fetchCompanyData = async () => {
      setIsLoading(true);
      setError(null);
      setAnalysisData(null);
      setSelectedDuration(null);

      // Safety timeout: abort spinner if backend/provider hangs > 12s
      timeoutId = setTimeout(() => {
        if (isMounted && isLoading) {
          setIsLoading(false);
          setError(`Request timeout loading market data for ${activeSymbol}. Please click retry.`);
        }
      }, 12000);

      try {
        const detailsPromise = stockApi.getStockDetails(activeSymbol);
        const newsPromise = stockApi.getStockNews(activeSymbol).catch(() => []);

        const [detailsResult, newsResult] = await Promise.allSettled([
          detailsPromise,
          newsPromise
        ]);

        const details = detailsResult.status === 'fulfilled' ? detailsResult.value : null;
        const newsList = newsResult.status === 'fulfilled' ? newsResult.value : [];

        if (isMounted) {
          if (!details || details.error) {
            setError(`Unable to retrieve market data for ${activeSymbol}. Ticker may be invalid or external data provider rate-limited.`);
            setStock(null);
          } else {
            setStock(details);
            setNews(Array.isArray(newsList) ? newsList : []);
            if (typeof addToHistory === 'function') {
              try {
                addToHistory({ symbol: details.symbol, name: details.name || details.symbol });
              } catch (e) {
                // Ignore history save errors
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(`Unable to retrieve market data for ${activeSymbol}. Request failed.`);
          setStock(null);
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCompanyData();
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeSymbol, addToHistory]);

  const handleRunAnalysis = async (durationKey) => {
    if (!activeSymbol || !durationKey) return;
    setIsAnalyzing(true);
    setSelectedDuration(durationKey);
    try {
      const result = await stockApi.analyzeStock(activeSymbol, durationKey);
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

  // Handler for selecting a company from CompanySelector
  const handleSelectCompany = (selectedSymbol) => {
    navigate(`/company/${selectedSymbol}`);
  };

  return (
    <>
      <div className="max-w-7xl w-full mx-auto space-y-8 pb-8">
        
        {/* If no ticker selected in URL, display CompanySelector browser screen */}
        {!activeSymbol ? (
          <CompanySelector onSelectCompany={handleSelectCompany} />
        ) : (
          <>
            {/* Breadcrumb Navigation & Upload Button Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <Link
                to="/company"
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors font-mono"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Company Selection
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload 10-K Report PDF
                </button>
                <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                  Company Mode • <strong className="text-blue-400">${activeSymbol}</strong>
                </span>
              </div>
            </div>

            {isLoading ? (
              <LoadingSpinner size="large" text={`Loading ${activeSymbol} Market Data...`} />
            ) : error ? (
              <div className="glass-card rounded-2xl p-12 text-center text-red-400 space-y-3 border border-red-500/30">
                <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
                <h3 className="text-lg font-bold text-red-300">Unable to Retrieve Market Data</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">{error}</p>
                <div className="pt-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Retry Loading {activeSymbol}
                  </button>
                </div>
              </div>
            ) : stock ? (
                <>
                  {/* Company Overview Header */}
                  <StockOverviewCard stock={stock} />

                  {/* Duration Selector Input Step */}
                  <DurationSelector
                    symbol={stock.symbol}
                    selectedDuration={selectedDuration}
                    onSelectDuration={(dur) => setSelectedDuration(dur)}
                    onAnalyze={handleRunAnalysis}
                    isAnalyzing={isAnalyzing}
                  />

                  {/* Prediction & Analysis Section (Only rendered after user analyzes) */}
                  {isAnalyzing ? (
                    <LoadingSpinner size="large" text={`Executing ${selectedDuration || 'Horizon'} Backtest & Risk Modeling for ${stock.symbol}...`} />
                  ) : (
                    analysisData && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                      >
                        {/* 3 AI Signal Indicators */}
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

                        {/* AI Research Thesis */}
                        <AIAnalysisCard stock={{ ...stock, ...analysisData }} />
                      </motion.div>
                    )
                  )}

                  {/* Stock Chart */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-400" /> Historical Price Performance & Technical Analysis
                      </h2>
                    </div>
                    <StockChart symbol={stock.symbol} isPositive={stock.isPositive} height={420} />
                  </div>

                  {/* RAG AI Chat & Citation Engine */}
                  <AIChatSection symbol={stock.symbol} selectedDocumentId={selectedDocument?.id} />

                  {/* Financial Ratios Grid */}
                  <FinancialRatios stock={stock} />

                  {/* News Stream */}
                  <NewsSection news={news} />
                </>
              ) : null}
          </>
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

export default CompanyAnalysis;
