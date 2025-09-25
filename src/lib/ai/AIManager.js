/**
 * AIManager.js - Updated for Groq integration
 * Orchestrates AI modules for ProfesorXTrader with Groq support
 */
import SentimentAnalyzer from './SentimentAnalyzer';
import PricePredictor from './PricePredictor';
import PatternRecognizer from './PatternRecognizer';
import GroqClient from './GroqClient';

class AIManager {
  constructor(options = {}) {
    this.sentiment = new SentimentAnalyzer(options.sentiment);
    this.predictor = new PricePredictor(options.predictor);
    this.patterns = new PatternRecognizer(options.patterns);
    
    // Initialize Groq client if enabled
    this.aiProvider = process.env.AI_PROVIDER || 'groq';
    if (this.aiProvider === 'groq' && process.env.GROQ_API_KEY) {
      this.groqClient = new GroqClient(options.groq);
    }
    
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return true;
    
    try {
      await this.sentiment.initialize();
      
      if (this.groqClient) {
        await this.groqClient.initialize();
      }
      
      this.initialized = true;
      console.log(`✅ AIManager initialized with provider: ${this.aiProvider}`);
      return true;
    } catch (error) {
      console.error('❌ AIManager initialization failed:', error.message);
      throw error;
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

      // Enhanced analysis with Groq if available
      if (this.groqClient && texts.length) {
        try {
          const groqAnalysis = await this.groqClient.analyzeSentiment(
            texts.join(' '), 
            symbol
          );
          results.groqAnalysis = groqAnalysis;
        } catch (error) {
          console.warn('Groq analysis failed:', error.message);
        }
      }

    } catch (error) {
      console.error('Market analysis failed:', error.message);
      results.error = error.message;
    }

    return results;
  }

  async getAIInsights(marketData, symbol) {
    if (!this.groqClient) {
      throw new Error('AI insights require Groq integration. Check GROQ_API_KEY.');
    }

    try {
      return await this.groqClient.analyzeMarketTrend(marketData, symbol);
    } catch (error) {
      console.error('AI insights failed:', error.message);
      throw error;
    }
  }

  getStatus() {
    return {
      initialized: this.initialized,
      provider: this.aiProvider,
      groqAvailable: !!this.groqClient,
      modules: {
        sentiment: this.sentiment.initialized || false,
        predictor: this.predictor.initialized || false,
        patterns: this.patterns.initialized || false,
        groq: this.groqClient?.initialized || false
      }
    };
  }

  dispose() {
    this.sentiment.dispose();
    this.predictor.dispose();
    this.patterns.dispose();
    if (this.groqClient) this.groqClient.dispose();
    this.initialized = false;
  }
}

export default AIManager;