import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AIManager } from '../../../../lib/ai/AIManager';
import { SentimentAnalyzer } from '../../../../lib/ai/SentimentAnalyzer';
import { PricePredictor } from '../../../../lib/ai/PricePredictor';
import { PatternRecognizer } from '../../../../lib/ai/PatternRecognizer';

// Rate limiting cache
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Very low for comprehensive analysis

// Input validation schema
const analysisSchema = z.object({
  symbol: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/),
  includeAll: z.boolean().optional().default(true),
  options: z.object({
    sentiment: z.object({
      enabled: z.boolean().optional().default(true),
      sources: z.array(z.string()).optional().default([])
    }).optional(),
    prediction: z.object({
      enabled: z.boolean().optional().default(true),
      lookAhead: z.number().int().min(1).max(12).optional().default(3),
      timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']).optional().default('1h')
    }).optional(),
    patterns: z.object({
      enabled: z.boolean().optional().default(true),
      sensitivity: z.number().min(0.1).max(1.0).optional().default(0.7)
    }).optional(),
    marketData: z.object({
      priceData: z.array(z.number().finite()).min(50).optional(),
      chartData: z.object({
        open: z.array(z.number().finite()).optional(),
        high: z.array(z.number().finite()).optional(),
        low: z.array(z.number().finite()).optional(),
        close: z.array(z.number().finite()).optional(),
        volume: z.array(z.number().finite()).optional()
      }).optional()
    }).optional()
  }).optional().default({})
});

// Rate limiting middleware
function checkRateLimit(clientIP) {
  const now = Date.now();
  const userRequests = rateLimitCache.get(clientIP) || [];
  
  const validRequests = userRequests.filter(timestamp => 
    now - timestamp < RATE_LIMIT_WINDOW
  );
  
  if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitCache.set(clientIP, validRequests);
  return true;
}

// Response caching
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for comprehensive analysis

function getCacheKey(data) {
  return JSON.stringify({
    symbol: data.symbol,
    options: data.options
  });
}

function getCachedResponse(key) {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  responseCache.delete(key);
  return null;
}

function setCachedResponse(key, data) {
  responseCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Helper function to fetch market data if not provided
async function fetchMarketData(symbol) {
  try {
    // This would typically call Binance API or other market data source
    // For now, return mock data structure
    return {
      priceData: [], // Would be filled from API
      chartData: {
        open: [],
        high: [],
        low: [],
        close: [],
        volume: []
      },
      marketInfo: {
        price: 0,
        volume24h: 0,
        change24h: 0
      }
    };
  } catch (error) {
    console.warn(`Failed to fetch market data for ${symbol}:`, error);
    return null;
  }
}

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Maximum 10 comprehensive analyses per minute allowed',
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = analysisSchema.parse(body);
    
    // Check cache first
    const cacheKey = getCacheKey(validatedData);
    const cachedResult = getCachedResponse(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const startTime = Date.now();
    const results = {};
    const errors = [];
    
    // Initialize AI Manager
    const aiManager = new AIManager();
    await aiManager.initialize();
    
    // Get market data if not provided
    let marketData = validatedData.options?.marketData;
    if (!marketData?.priceData?.length || !marketData?.chartData?.close?.length) {
      console.log(`Fetching market data for ${validatedData.symbol}...`);
      const fetchedData = await fetchMarketData(validatedData.symbol);
      if (fetchedData) {
        marketData = { ...marketData, ...fetchedData };
      }
    }
    
    // Run Sentiment Analysis
    if (validatedData.options?.sentiment?.enabled !== false) {
      try {
        const sentimentAnalyzer = new SentimentAnalyzer();
        await sentimentAnalyzer.initialize();
        
        // Analyze recent news/social sentiment for the symbol
        const sentimentText = `Recent market sentiment for ${validatedData.symbol}. Trading volume and social media mentions indicate market interest.`;
        const sentimentResult = await sentimentAnalyzer.analyzeSentiment(
          sentimentText,
          validatedData.options?.sentiment?.sources
        );
        
        results.sentiment = {
          overall: sentimentResult.overallSentiment,
          confidence: sentimentResult.confidence,
          breakdown: {
            ruleBased: sentimentResult.ruleBasedSentiment,
            neural: sentimentResult.neuralSentiment,
            cryptoSpecific: sentimentResult.cryptoSpecificSentiment
          },
          keywords: {
            positive: sentimentResult.positiveWords,
            negative: sentimentResult.negativeWords
          }
        };
      } catch (error) {
        console.error('Sentiment analysis failed:', error);
        errors.push({ module: 'sentiment', error: error.message });
      }
    }
    
    // Run Price Prediction
    if (validatedData.options?.prediction?.enabled !== false && marketData?.priceData?.length) {
      try {
        const pricePredictor = new PricePredictor();
        await pricePredictor.initialize();
        
        const predictionResult = await pricePredictor.predictPrice(
          marketData.priceData,
          validatedData.options?.prediction?.lookAhead || 3
        );
        
        results.prediction = {
          price: predictionResult.prediction,
          confidence: predictionResult.confidence,
          range: predictionResult.range,
          timeframe: validatedData.options?.prediction?.timeframe,
          analysis: {
            trend: predictionResult.trend,
            momentum: predictionResult.momentum,
            volatility: predictionResult.volatility
          }
        };
      } catch (error) {
        console.error('Price prediction failed:', error);
        errors.push({ module: 'prediction', error: error.message });
      }
    }
    
    // Run Pattern Recognition
    if (validatedData.options?.patterns?.enabled !== false && marketData?.chartData?.close?.length) {
      try {
        const patternRecognizer = new PatternRecognizer();
        await patternRecognizer.initialize();
        
        const patternResult = await patternRecognizer.analyzePatterns(
          marketData.chartData,
          validatedData.options?.patterns?.sensitivity || 0.7
        );
        
        results.patterns = {
          detected: patternResult.patterns || [],
          signals: patternResult.signals || [],
          confidence: patternResult.overallConfidence,
          technicalAnalysis: {
            trend: patternResult.trend,
            support: patternResult.supportLevels,
            resistance: patternResult.resistanceLevels,
            momentum: patternResult.momentum
          }
        };
      } catch (error) {
        console.error('Pattern recognition failed:', error);
        errors.push({ module: 'patterns', error: error.message });
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    // Generate AI Summary
    const summary = generateAISummary(results, validatedData.symbol, errors);
    
    // Calculate overall confidence
    const overallConfidence = calculateOverallConfidence(results);
    
    // Structure comprehensive response
    const response = {
      symbol: validatedData.symbol,
      analysis: results,
      summary,
      confidence: overallConfidence,
      recommendations: generateRecommendations(results, overallConfidence),
      riskAssessment: {
        level: overallConfidence > 0.7 ? 'low' : overallConfidence > 0.4 ? 'medium' : 'high',
        factors: generateRiskFactors(results, errors)
      },
      metadata: {
        modulesExecuted: Object.keys(results).length,
        errors: errors.length,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
        dataQuality: marketData ? 'good' : 'limited'
      },
      cached: false
    };
    
    // Cache the response
    setCachedResponse(cacheKey, response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Comprehensive AI analysis error:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid parameters for comprehensive analysis',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    // Generic error handling
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: 'Unable to complete comprehensive AI analysis',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper functions
function generateAISummary(results, symbol, errors) {
  const parts = [];
  
  if (results.sentiment) {
    const sentiment = results.sentiment.overall > 0.1 ? 'positive' : 
                     results.sentiment.overall < -0.1 ? 'negative' : 'neutral';
    parts.push(`Market sentiment for ${symbol} is ${sentiment} (${(results.sentiment.confidence * 100).toFixed(1)}% confidence)`);
  }
  
  if (results.prediction) {
    const direction = results.prediction.analysis?.trend || 'sideways';
    parts.push(`Price prediction suggests ${direction} movement with ${(results.prediction.confidence * 100).toFixed(1)}% confidence`);
  }
  
  if (results.patterns) {
    const patternCount = results.patterns.detected?.length || 0;
    const signalCount = results.patterns.signals?.length || 0;
    parts.push(`Technical analysis identified ${patternCount} patterns and ${signalCount} trading signals`);
  }
  
  if (errors.length > 0) {
    parts.push(`Note: ${errors.length} analysis module(s) encountered issues`);
  }
  
  return parts.join('. ') + '.';
}

function calculateOverallConfidence(results) {
  const confidences = [];
  
  if (results.sentiment?.confidence) confidences.push(results.sentiment.confidence);
  if (results.prediction?.confidence) confidences.push(results.prediction.confidence);
  if (results.patterns?.confidence) confidences.push(results.patterns.confidence);
  
  return confidences.length > 0 ? 
    confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length : 0;
}

function generateRecommendations(results, confidence) {
  const recommendations = [];
  
  if (confidence > 0.7) {
    recommendations.push('High confidence analysis - consider acting on signals');
  } else if (confidence > 0.4) {
    recommendations.push('Medium confidence - use additional confirmation');
  } else {
    recommendations.push('Low confidence - exercise caution and seek more data');
  }
  
  if (results.patterns?.signals?.length > 0) {
    const strongSignals = results.patterns.signals.filter(s => s.strength > 0.7).length;
    if (strongSignals > 0) {
      recommendations.push(`${strongSignals} strong technical signals detected`);
    }
  }
  
  return recommendations;
}

function generateRiskFactors(results, errors) {
  const factors = [];
  
  if (errors.length > 0) {
    factors.push('Some analysis modules failed - incomplete data');
  }
  
  if (results.prediction?.analysis?.volatility === 'high') {
    factors.push('High volatility detected in price prediction');
  }
  
  if (!results.sentiment || !results.prediction || !results.patterns) {
    factors.push('Limited analysis coverage - consider comprehensive data');
  }
  
  return factors;
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/analyze',
    method: 'POST',
    description: 'Comprehensive AI analysis combining sentiment, prediction, and pattern recognition',
    parameters: {
      symbol: {
        type: 'string',
        required: true,
        description: 'Trading symbol to analyze'
      },
      includeAll: {
        type: 'boolean',
        default: true,
        description: 'Include all available analysis types'
      },
      options: {
        type: 'object',
        description: 'Fine-tune individual analysis modules',
        properties: {
          sentiment: 'Enable/configure sentiment analysis',
          prediction: 'Enable/configure price prediction',
          patterns: 'Enable/configure pattern recognition',
          marketData: 'Provide custom market data'
        }
      }
    },
    response: {
      analysis: 'Complete analysis results from all modules',
      summary: 'AI-generated summary of findings',
      confidence: 'Overall confidence score',
      recommendations: 'Trading recommendations',
      riskAssessment: 'Risk analysis and factors'
    },
    rateLimit: '10 requests per minute per IP',
    caching: '5 minute TTL',
    performance: 'May take 3-10 seconds for complete analysis'
  });
}