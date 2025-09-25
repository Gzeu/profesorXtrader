/**
 * AIManager.js - Updated for XAI Grok integration
 * Orchestrates AI modules for ProfesorXTrader with XAI Grok support
 * Supports both Groq (local) and XAI Grok (production)
 */
import SentimentAnalyzer from './SentimentAnalyzer';
import PricePredictor from './PricePredictor';
import PatternRecognizer from './PatternRecognizer';
import GroqClient from './GroqClient';
import XAIClient from './XAIClient';

class AIManager {
  constructor(options = {}) {
    this.sentiment = new SentimentAnalyzer(options.sentiment);
    this.predictor = new PricePredictor(options.predictor);
    this.patterns = new PatternRecognizer(options.patterns);
    
    // AI Provider Selection Logic
    this.aiProvider = this.selectAIProvider();
    this.aiClient = this.initializeAIClient(options);
    
    this.initialized = false;
    
    console.log(`🤖 AIManager configured with provider: ${this.aiProvider}`);
  }

  selectAIProvider() {
    // Priority: XAI Grok > Groq > None
    if (process.env.XAI_API_KEY) {
      return 'xai';
    } else if (process.env.GROQ_API_KEY) {
      return 'groq';
    } else {
      return process.env.AI_PROVIDER || 'none';
    }
  }

  initializeAIClient(options) {
    switch (this.aiProvider) {
      case 'xai':
        if (process.env.XAI_API_KEY) {
          return new XAIClient(options.xai);
        }
        break;
      case 'groq':
        if (process.env.GROQ_API_KEY) {
          return new GroqClient(options.groq);
        }
        break;
      default:
        console.warn('⚠️ No AI provider configured. Advanced features disabled.');
        return null;
    }
    return null;
  }

  async initialize() {
    if (this.initialized) return true;
    
    try {
      await this.sentiment.initialize();
      
      if (this.aiClient) {
        await this.aiClient.initialize();
      }
      
      this.initialized = true;
      console.log(`✅ AIManager initialized with provider: ${this.aiProvider}`);
      return true;
    } catch (error) {
      console.error('❌ AIManager initialization failed:', error.message);
      
      // Fallback: disable AI client if initialization fails
      if (this.aiClient) {
        console.log('🔄 Disabling AI client due to initialization failure');
        this.aiClient = null;
      }
      
      // Continue with basic functionality
      this.initialized = true;
      return true;
    }
  }

  async analyzeMarket({ texts = [], symbol, ohlcv = [], patternWindow = [] }) {
    if (!this.initialized) await this.initialize();
    
    const results = {
      timestamp: new Date().toISOString(),
      symbol,
      provider: this.aiProvider
    };

    try {
      // Sentiment Analysis
      const sentimentResults = await this.sentiment.batchAnalyze(texts, symbol);
      const avgSent = sentimentResults.length 
        ? sentimentResults.reduce((s, r) => s + r.score, 0) / sentimentResults.length 
        : 0;
      const sentimentConfidence = sentimentResults.length
        ? sentimentResults.reduce((s, r) => s + r.confidence, 0) / sentimentResults.length
        : 0;

      results.sentiment = {
        averageScore: avgSent,
        averageConfidence: sentimentConfidence,
        label: this.sentiment.classifySentiment(avgSent),
        details: sentimentResults
      };

      // Price Prediction
      if (ohlcv.length) {
        results.prediction = await this.predictor.predictNext(ohlcv);
      }

      // Pattern Recognition  
      if (patternWindow.length) {
        results.pattern = await this.patterns.predict(patternWindow);
      }

      // Enhanced analysis with AI provider
      if (this.aiClient && texts.length) {
        try {
          const aiAnalysis = await this.aiClient.analyzeSentiment(
            texts.join(' '), 
            symbol
          );
          results.aiAnalysis = aiAnalysis;
        } catch (error) {
          console.warn(`${this.aiProvider.toUpperCase()} analysis failed:`, error.message);
        }
      }

    } catch (error) {
      console.error('Market analysis failed:', error.message);
      results.error = error.message;
    }

    return results;
  }

  async getAIInsights(marketData, symbol) {
    if (!this.aiClient) {
      throw new Error(`AI insights require ${this.aiProvider.toUpperCase()} integration. Check API key.`);
    }

    try {
      return await this.aiClient.analyzeMarketTrend(marketData, symbol);
    } catch (error) {
      console.error('AI insights failed:', error.message);
      throw error;
    }
  }

  async generateTradingStrategy(marketData, riskTolerance = 'medium') {
    if (!this.aiClient || !this.aiClient.generateTradingStrategy) {
      throw new Error('Trading strategy generation requires XAI Grok integration.');
    }

    try {
      return await this.aiClient.generateTradingStrategy(marketData, riskTolerance);
    } catch (error) {
      console.error('Trading strategy generation failed:', error.message);
      throw error;
    }
  }

  getStatus() {
    return {
      initialized: this.initialized,
      provider: this.aiProvider,
      aiClientAvailable: !!this.aiClient,
      capabilities: {
        sentiment: true,
        prediction: true,
        patterns: true,
        aiInsights: !!this.aiClient,
        tradingStrategy: !!(this.aiClient?.generateTradingStrategy)
      },
      modules: {
        sentiment: this.sentiment.initialized || false,
        predictor: this.predictor.initialized || false,
        patterns: this.patterns.initialized || false,
        aiClient: this.aiClient?.initialized || false
      }
    };
  }

  dispose() {
    this.sentiment.dispose();
    this.predictor.dispose();
    this.patterns.dispose();
    if (this.aiClient) this.aiClient.dispose();
    this.initialized = false;
  }
}

export default AIManager;