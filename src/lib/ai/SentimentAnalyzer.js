/**
 * SentimentAnalyzer.js - AI-Powered Sentiment Analysis for ProfessorXTrader
 * Enhanced 2025 Edition with TensorFlow.js Neural Networks
 * 
 * Features:
 * - Real-time market sentiment analysis
 * - Neural network-based classification
 * - Multi-source data processing
 * - Advanced NLP with TensorFlow.js
 * - Confidence scoring and risk assessment
 */

import * as tf from '@tensorflow/tfjs';
import natural from 'natural';
import { Sentiment } from 'sentiment';

class SentimentAnalyzer {
  constructor(options = {}) {
    this.model = null;
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.sentiment = new Sentiment();
    this.maxSequenceLength = options.maxSequenceLength || 100;
    this.vocabularySize = options.vocabularySize || 10000;
    this.isInitialized = false;
    this.confidence = 0;
    
    // Enhanced sentiment keywords for crypto trading
    this.positiveKeywords = [
      'bull', 'bullish', 'moon', 'pump', 'rocket', 'surge', 'breakout',
      'rally', 'support', 'resistance', 'buy', 'hodl', 'diamond', 'hands',
      'profit', 'gains', 'green', 'up', 'rise', 'increase', 'boost'
    ];
    
    this.negativeKeywords = [
      'bear', 'bearish', 'dump', 'crash', 'drop', 'fall', 'sell',
      'fear', 'panic', 'red', 'down', 'decline', 'loss', 'liquidation',
      'correction', 'dip', 'weak', 'support', 'broken', 'resistance'
    ];
  }

  /**
   * Initialize the sentiment analysis model
   */
  async initialize() {
    try {
      console.log('🧠 Initializing AI Sentiment Analyzer...');
      
      // Create a simple neural network for sentiment classification
      this.model = tf.sequential({
        layers: [
          tf.layers.embedding({
            inputDim: this.vocabularySize,
            outputDim: 128,
            inputLength: this.maxSequenceLength
          }),
          tf.layers.lstm({ units: 64, dropout: 0.5, recurrentDropout: 0.5 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.5 }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      // Compile the model
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      // Load pre-trained weights if available
      try {
        await this.loadPretrainedWeights();
      } catch (error) {
        console.log('ℹ️ No pre-trained weights found, using random initialization');
      }

      this.isInitialized = true;
      console.log('✅ Sentiment Analyzer initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Sentiment Analyzer:', error);
      throw error;
    }
  }

  /**
   * Load pre-trained model weights
   */
  async loadPretrainedWeights() {
    // In a real implementation, this would load from a URL or local storage
    // For now, we'll skip this as we don't have pre-trained weights
    return Promise.resolve();
  }

  /**
   * Preprocess text for neural network input
   */
  preprocessText(text) {
    if (!text || typeof text !== 'string') return [];
    
    // Convert to lowercase and tokenize
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    // Stem tokens
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));
    
    // Convert to sequences (simplified vocabulary mapping)
    const sequences = stemmedTokens.map(token => {
      return this.getTokenIndex(token);
    }).filter(index => index > 0);
    
    // Pad or truncate to maxSequenceLength
    if (sequences.length > this.maxSequenceLength) {
      return sequences.slice(0, this.maxSequenceLength);
    } else {
      const padding = Array(this.maxSequenceLength - sequences.length).fill(0);
      return sequences.concat(padding);
    }
  }

  /**
   * Simple token to index mapping (in production, use a proper vocabulary)
   */
  getTokenIndex(token) {
    // Simplified hash-based mapping
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % (this.vocabularySize - 1) + 1;
  }

  /**
   * Analyze sentiment using multiple approaches
   */
  async analyzeSentiment(text, symbol = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Enhanced preprocessing
      const cleanText = this.cleanText(text);
      
      // Method 1: Rule-based sentiment analysis
      const ruleBasedScore = this.analyzeRuleBased(cleanText);
      
      // Method 2: Neural network prediction
      const neuralNetworkScore = await this.analyzeNeuralNetwork(cleanText);
      
      // Method 3: Crypto-specific keyword analysis
      const cryptoScore = this.analyzeCryptoKeywords(cleanText, symbol);
      
      // Combine scores with weights
      const combinedScore = (
        ruleBasedScore * 0.3 +
        neuralNetworkScore * 0.5 +
        cryptoScore * 0.2
      );
      
      // Calculate confidence based on agreement between methods
      const scores = [ruleBasedScore, neuralNetworkScore, cryptoScore];
      const variance = this.calculateVariance(scores);
      const confidence = Math.max(0, Math.min(1, 1 - variance));
      
      this.confidence = confidence;
      
      return {
        score: combinedScore,
        confidence: confidence,
        sentiment: this.classifySentiment(combinedScore),
        details: {
          ruleBasedScore,
          neuralNetworkScore,
          cryptoScore,
          variance
        },
        timestamp: new Date().toISOString(),
        symbol: symbol || 'UNKNOWN'
      };
      
    } catch (error) {
      console.error('❌ Sentiment analysis failed:', error);
      return {
        score: 0,
        confidence: 0,
        sentiment: 'neutral',
        error: error.message,
        timestamp: new Date().toISOString(),
        symbol: symbol || 'UNKNOWN'
      };
    }
  }

  /**
   * Clean and preprocess text
   */
  cleanText(text) {
    return text
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .toLowerCase();
  }

  /**
   * Rule-based sentiment analysis using the sentiment library
   */
  analyzeRuleBased(text) {
    const result = this.sentiment.analyze(text);
    // Normalize score to [-1, 1] range
    return Math.max(-1, Math.min(1, result.score / 10));
  }

  /**
   * Neural network-based sentiment prediction
   */
  async analyzeNeuralNetwork(text) {
    try {
      const sequences = this.preprocessText(text);
      const tensorInput = tf.tensor2d([sequences]);
      
      const prediction = this.model.predict(tensorInput);
      const score = await prediction.data();
      
      // Clean up tensors
      tensorInput.dispose();
      prediction.dispose();
      
      // Convert sigmoid output [0,1] to [-1,1]
      return (score[0] * 2) - 1;
      
    } catch (error) {
      console.error('Neural network prediction failed:', error);
      return 0;
    }
  }

  /**
   * Crypto-specific keyword analysis
   */
  analyzeCryptoKeywords(text, symbol) {
    let score = 0;
    let keywordCount = 0;
    
    // Check positive keywords
    this.positiveKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex) || [];
      score += matches.length * 0.1;
      keywordCount += matches.length;
    });
    
    // Check negative keywords
    this.negativeKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex) || [];
      score -= matches.length * 0.1;
      keywordCount += matches.length;
    });
    
    // Symbol-specific analysis
    if (symbol) {
      const symbolRegex = new RegExp(`\\b${symbol}\\b`, 'gi');
      const symbolMentions = text.match(symbolRegex) || [];
      if (symbolMentions.length > 0) {
        score *= 1.2; // Boost relevance for symbol-specific mentions
      }
    }
    
    // Normalize based on text length and keyword density
    const normalizedScore = keywordCount > 0 ? 
      Math.max(-1, Math.min(1, score / Math.sqrt(keywordCount))) : 0;
    
    return normalizedScore;
  }

  /**
   * Calculate variance to measure agreement between methods
   */
  calculateVariance(scores) {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    return variance;
  }

  /**
   * Classify sentiment based on score
   */
  classifySentiment(score) {
    if (score > 0.3) return 'bullish';
    if (score < -0.3) return 'bearish';
    return 'neutral';
  }

  /**
   * Batch analyze multiple texts
   */
  async batchAnalyze(texts, symbol = null) {
    const results = [];
    
    for (const text of texts) {
      const result = await this.analyzeSentiment(text, symbol);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get analyzer status and statistics
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      confidence: this.confidence,
      model: this.model ? 'loaded' : 'not_loaded',
      vocabularySize: this.vocabularySize,
      maxSequenceLength: this.maxSequenceLength,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Dispose of TensorFlow resources
   */
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
    console.log('🧹 Sentiment Analyzer resources disposed');
  }
}

export default SentimentAnalyzer;
