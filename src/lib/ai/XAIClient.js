/**
 * XAIClient.js - xAI Grok integration for ProfesorXTrader
 * Professional trading AI analysis with Grok models
 */

class XAIClient {
  constructor(options = {}) {
    this.apiKey = process.env.XAI_API_KEY;
    this.baseUrl = options.baseUrl || 'https://api.x.ai/v1';
    this.model = options.model || 'grok-4-fast'; // Most cost-effective
    this.maxTokens = options.maxTokens || 2048;
    this.temperature = options.temperature || 0.3;
    this.initialized = false;
    
    if (!this.apiKey) {
      console.warn('⚠️ XAI_API_KEY not found. Grok features will be disabled.');
    }
  }

  async initialize() {
    if (!this.apiKey) {
      throw new Error('XAI API key is required for Grok integration');
    }
    
    try {
      // Test API connection
      await this.testConnection();
      this.initialized = true;
      console.log(`✅ XAI Grok Client initialized with model: ${this.model}`);
      return true;
    } catch (error) {
      console.error('❌ XAI Client initialization failed:', error.message);
      throw error;
    }
  }

  async testConnection() {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{
          role: 'user',
          content: 'Test connection. Reply with "OK"'
        }],
        max_tokens: 10,
        temperature: 0
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`XAI API Error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  async analyzeSentiment(text, symbol = 'CRYPTO') {
    if (!this.initialized) await this.initialize();
    
    const prompt = `
Analyze the market sentiment for ${symbol} based on this text:

"${text}"

Provide analysis in this JSON format:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 0.95,
  "score": 0.75,
  "reasoning": "Brief explanation",
  "keyFactors": ["factor1", "factor2"],
  "tradingSignal": "buy|sell|hold"
}

Be precise and focus on trading implications.`;

    try {
      const response = await this.makeRequest([{
        role: 'system',
        content: 'You are a professional cryptocurrency trading analyst. Provide accurate, concise market sentiment analysis.'
      }, {
        role: 'user',
        content: prompt
      }]);

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from Grok');

      // Parse JSON response
      const analysis = JSON.parse(content.replace(/```json\n?|```/g, ''));
      
      return {
        provider: 'xai-grok',
        model: this.model,
        analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('XAI sentiment analysis failed:', error.message);
      throw error;
    }
  }

  async analyzeMarketTrend(marketData, symbol) {
    if (!this.initialized) await this.initialize();
    
    const { price, volume, change24h, rsi, macd } = marketData;
    
    const prompt = `
Analyze this market data for ${symbol}:

Price: $${price}
Volume: ${volume}
24h Change: ${change24h}%
RSI: ${rsi || 'N/A'}
MACD: ${macd || 'N/A'}

Provide professional trading analysis in JSON format:
{
  "trend": "bullish|bearish|sideways",
  "strength": "strong|moderate|weak",
  "confidence": 0.85,
  "timeframe": "short|medium|long",
  "keyLevels": {
    "support": 45000,
    "resistance": 48000
  },
  "tradingAction": "buy|sell|hold",
  "riskLevel": "low|medium|high",
  "reasoning": "Technical analysis summary"
}

Focus on actionable trading insights.`;

    try {
      const response = await this.makeRequest([{
        role: 'system',
        content: 'You are an expert cryptocurrency technical analyst. Provide data-driven trading analysis with specific price levels and risk assessment.'
      }, {
        role: 'user',
        content: prompt
      }]);

      const content = response.choices[0]?.message?.content;
      const analysis = JSON.parse(content.replace(/```json\n?|```/g, ''));
      
      return {
        provider: 'xai-grok',
        model: this.model,
        symbol,
        analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('XAI market trend analysis failed:', error.message);
      throw error;
    }
  }

  async generateTradingStrategy(marketData, riskTolerance = 'medium') {
    if (!this.initialized) await this.initialize();
    
    const prompt = `
Generate a trading strategy with this data:
${JSON.stringify(marketData, null, 2)}

Risk Tolerance: ${riskTolerance}

Provide strategy in JSON format:
{
  "strategy": "DCA|swing|scalp|hodl",
  "entryPrice": 45500,
  "stopLoss": 43000,
  "takeProfit": [47000, 48500, 50000],
  "positionSize": "2-5% of portfolio",
  "timeframe": "1-7 days",
  "riskReward": 2.5,
  "confidence": 0.78,
  "reasoning": "Strategy explanation"
}`;

    try {
      const response = await this.makeRequest([{
        role: 'system',
        content: 'You are a professional trading strategist. Generate practical, risk-managed trading strategies with specific entry/exit points.'
      }, {
        role: 'user',
        content: prompt
      }]);

      const content = response.choices[0]?.message?.content;
      const strategy = JSON.parse(content.replace(/```json\n?|```/g, ''));
      
      return {
        provider: 'xai-grok',
        model: this.model,
        strategy,
        riskTolerance,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('XAI trading strategy failed:', error.message);
      throw error;
    }
  }

  async makeRequest(messages) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`XAI API Error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  dispose() {
    this.initialized = false;
    console.log('🔄 XAI Client disposed');
  }
}

export default XAIClient;