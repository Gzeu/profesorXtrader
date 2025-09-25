/**
 * GroqClient.js - Groq AI Client for ProfesorXTrader
 * Handles Groq API communications with optimized prompts for trading analysis
 */

import Groq from 'groq-sdk';

class GroqClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.GROQ_API_KEY;
    this.model = options.model || 'llama-3.1-70b-versatile';
    this.maxTokens = options.maxTokens || 4000;
    this.temperature = options.temperature || 0.1;
    
    if (!this.apiKey) {
      throw new Error('Groq API key required. Set GROQ_API_KEY environment variable.');
    }
    
    this.client = new Groq({ apiKey: this.apiKey });
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return true;
    
    try {
      const testResponse = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: 'Test' }],
        model: this.model,
        max_tokens: 10
      });
      
      this.initialized = !!testResponse?.choices?.[0]?.message?.content;
      console.log(`✅ Groq client initialized: ${this.model}`);
      return this.initialized;
    } catch (error) {
      console.error('❌ Groq initialization failed:', error.message);
      throw error;
    }
  }

  async createCompletion(prompt, options = {}) {
    if (!this.initialized) await this.initialize();

    try {
      const response = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a professional cryptocurrency trading analyst.' },
          { role: 'user', content: prompt }
        ],
        model: options.model || this.model,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature
      });

      return {
        content: response.choices[0].message.content,
        model: response.model,
        usage: response.usage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Groq API failed: ${error.message}`);
    }
  }

  async analyzeSentiment(text, symbol) {
    const prompt = `Analyze sentiment for ${symbol}: "${text}". Return JSON with score (-1 to 1), confidence (0 to 1), and drivers.`;
    return this.createCompletion(prompt);
  }

  async analyzeMarketTrend(marketData, symbol) {
    const prompt = `Analyze ${symbol} market data: ${JSON.stringify(marketData)}. Return JSON with trend, confidence, levels, recommendations.`;
    return this.createCompletion(prompt, { maxTokens: 2000 });
  }
}

export default GroqClient;