/**
 * AIManager.js - Orchestrates AI modules for ProfessorXTrader
 * Wires SentimentAnalyzer, PricePredictor, PatternRecognizer into a unified API
 */
import SentimentAnalyzer from './SentimentAnalyzer';
import PricePredictor from './PricePredictor';
import PatternRecognizer from './PatternRecognizer';

class AIManager {
  constructor(options = {}) {
    this.sentiment = new SentimentAnalyzer(options.sentiment);
    this.predictor = new PricePredictor(options.predictor);
    this.patterns = new PatternRecognizer(options.patterns);
  }

  async init() {
    await this.sentiment.initialize();
    return true;
  }

  async analyzeMarket({ texts = [], symbol, ohlcv = [], patternWindow = [] }) {
    const [sentimentResults, nextPrice, patternResult] = await Promise.all([
      this.sentiment.batchAnalyze(texts, symbol),
      ohlcv.length ? this.predictor.predictNext(ohlcv) : Promise.resolve(null),
      patternWindow.length ? this.patterns.predict(patternWindow) : Promise.resolve(null)
    ]);

    const avgSent = sentimentResults.length
      ? sentimentResults.reduce((s, r) => s + r.score, 0) / sentimentResults.length
      : 0;

    const sentimentConfidence = sentimentResults.length
      ? sentimentResults.reduce((s, r) => s + r.confidence, 0) / sentimentResults.length
      : 0;

    return {
      sentiment: {
        averageScore: avgSent,
        averageConfidence: sentimentConfidence,
        label: this.sentiment.classifySentiment(avgSent),
        details: sentimentResults
      },
      prediction: nextPrice,
      pattern: patternResult,
      timestamp: new Date().toISOString(),
    };
  }

  dispose() {
    this.sentiment.dispose();
    this.predictor.dispose();
    this.patterns.dispose();
  }
}

export default AIManager;
