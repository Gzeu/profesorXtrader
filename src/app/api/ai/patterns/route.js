import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PatternRecognizer } from '../../../../lib/ai/PatternRecognizer';

// Rate limiting cache
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Lower for pattern analysis

// Input validation schema
const patternSchema = z.object({
  symbol: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/),
  chartData: z.object({
    open: z.array(z.number().finite()).min(50),
    high: z.array(z.number().finite()).min(50),
    low: z.array(z.number().finite()).min(50),
    close: z.array(z.number().finite()).min(50),
    volume: z.array(z.number().finite()).min(50).optional(),
    timestamps: z.array(z.number().int()).min(50).optional()
  }).refine(data => {
    const lengths = [data.open.length, data.high.length, data.low.length, data.close.length];
    return lengths.every(len => len === lengths[0]);
  }, {
    message: "All OHLC arrays must have the same length"
  }),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']).optional().default('1h'),
  sensitivity: z.number().min(0.1).max(1.0).optional().default(0.7)
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
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes for pattern analysis

function getCacheKey(data) {
  // Create cache key from symbol and recent OHLC data
  const recentData = {
    symbol: data.symbol,
    timeframe: data.timeframe,
    sensitivity: data.sensitivity,
    dataHash: data.chartData.close.slice(-20).join(',') // Last 20 close prices
  };
  return JSON.stringify(recentData);
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
          message: 'Maximum 30 requests per minute allowed for pattern analysis',
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = patternSchema.parse(body);
    
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

    // Initialize PatternRecognizer
    const recognizer = new PatternRecognizer();
    await recognizer.initialize();
    
    const startTime = Date.now();
    
    // Perform pattern recognition
    const patternResult = await recognizer.analyzePatterns(
      validatedData.chartData,
      validatedData.sensitivity
    );
    
    const processingTime = Date.now() - startTime;
    
    // Calculate additional insights
    const currentPrice = validatedData.chartData.close[validatedData.chartData.close.length - 1];
    const priceRange = {
      min: Math.min(...validatedData.chartData.low),
      max: Math.max(...validatedData.chartData.high),
      current: currentPrice
    };
    
    // Categorize patterns by type and strength
    const categorizedPatterns = {
      bullish: patternResult.patterns?.filter(p => p.type === 'bullish') || [],
      bearish: patternResult.patterns?.filter(p => p.type === 'bearish') || [],
      neutral: patternResult.patterns?.filter(p => p.type === 'neutral') || [],
      reversal: patternResult.patterns?.filter(p => p.category === 'reversal') || [],
      continuation: patternResult.patterns?.filter(p => p.category === 'continuation') || []
    };
    
    // Generate trading signals
    const signals = patternResult.signals || [];
    const strongSignals = signals.filter(s => s.strength > 0.7);
    const mediumSignals = signals.filter(s => s.strength > 0.4 && s.strength <= 0.7);
    
    // Structure response
    const response = {
      patterns: categorizedPatterns,
      signals: {
        all: signals,
        strong: strongSignals,
        medium: mediumSignals,
        count: signals.length
      },
      confidence: patternResult.overallConfidence || 0,
      analysis: {
        trend: patternResult.trend || 'sideways',
        momentum: patternResult.momentum || 'neutral',
        volatility: patternResult.volatility || 'medium',
        marketStructure: patternResult.marketStructure || 'ranging'
      },
      priceAction: {
        currentPrice,
        priceRange,
        support: patternResult.supportLevels || [],
        resistance: patternResult.resistanceLevels || [],
        keyLevels: patternResult.keyLevels || []
      },
      technicalIndicators: {
        rsi: patternResult.rsi || null,
        macd: patternResult.macd || null,
        bollinger: patternResult.bollingerBands || null,
        fibonacci: patternResult.fibonacciLevels || null
      },
      metadata: {
        symbol: validatedData.symbol,
        timeframe: validatedData.timeframe,
        dataPoints: validatedData.chartData.close.length,
        sensitivity: validatedData.sensitivity,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      },
      cached: false
    };
    
    // Cache the response
    setCachedResponse(cacheKey, response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Pattern recognition API error:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid chart data or parameters',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.received
          }))
        },
        { status: 400 }
      );
    }
    
    // Handle AI processing errors
    if (error.message?.includes('TensorFlow') || error.message?.includes('pattern')) {
      return NextResponse.json(
        {
          error: 'Pattern analysis failed',
          message: 'Unable to analyze chart patterns. Please verify your data format.',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }
    
    // Handle data format errors
    if (error.message?.includes('OHLC') || error.message?.includes('length')) {
      return NextResponse.json(
        {
          error: 'Invalid chart data',
          message: 'OHLC arrays must have equal length and minimum 50 data points',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // Generic error handling
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred during pattern analysis',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/patterns',
    method: 'POST',
    description: 'Analyze chart patterns and generate trading signals',
    parameters: {
      symbol: {
        type: 'string',
        required: true,
        pattern: '^[A-Z0-9]+$',
        maxLength: 20,
        description: 'Trading symbol (e.g., BTCUSDT, ETHUSDT)'
      },
      chartData: {
        type: 'object',
        required: true,
        properties: {
          open: 'array of numbers (minimum 50 points)',
          high: 'array of numbers (minimum 50 points)',
          low: 'array of numbers (minimum 50 points)',
          close: 'array of numbers (minimum 50 points)',
          volume: 'array of numbers (optional)',
          timestamps: 'array of timestamps (optional)'
        },
        description: 'OHLC chart data with equal array lengths'
      },
      timeframe: {
        type: 'string',
        required: false,
        default: '1h',
        enum: ['1m', '5m', '15m', '1h', '4h', '1d'],
        description: 'Chart timeframe for context'
      },
      sensitivity: {
        type: 'number',
        required: false,
        default: 0.7,
        min: 0.1,
        max: 1.0,
        description: 'Pattern detection sensitivity (higher = more patterns)'
      }
    },
    response: {
      patterns: 'object (categorized chart patterns)',
      signals: 'object (trading signals by strength)',
      confidence: 'number (overall analysis confidence)',
      analysis: 'object (trend, momentum, volatility)',
      priceAction: 'object (support/resistance levels)',
      technicalIndicators: 'object (RSI, MACD, etc.)',
      metadata: 'object (processing information)'
    },
    rateLimit: '30 requests per minute per IP',
    caching: '3 minute TTL for similar requests',
    dataRequirements: 'Minimum 50 OHLC data points for accurate analysis'
  });
}