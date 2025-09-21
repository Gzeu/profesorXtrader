import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PricePredictor } from '../../../../lib/ai/PricePredictor';

// Rate limiting cache
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 50; // Lower limit for prediction due to computational cost

// Input validation schema
const predictionSchema = z.object({
  symbol: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']),
  data: z.array(z.number().finite()).min(20).max(1000), // Historical price data
  lookAhead: z.number().int().min(1).max(24).optional().default(1) // Periods to predict ahead
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
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes for predictions

function getCacheKey(data) {
  // Create cache key from symbol, timeframe, and last few data points
  const key = {
    symbol: data.symbol,
    timeframe: data.timeframe,
    lookAhead: data.lookAhead,
    dataHash: data.data.slice(-10).join(',') // Use last 10 points for cache key
  };
  return JSON.stringify(key);
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
          message: 'Maximum 50 requests per minute allowed for predictions',
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = predictionSchema.parse(body);
    
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

    // Initialize PricePredictor
    const predictor = new PricePredictor();
    await predictor.initialize();
    
    const startTime = Date.now();
    
    // Perform price prediction
    const predictionResult = await predictor.predictPrice(
      validatedData.data,
      validatedData.lookAhead
    );
    
    const processingTime = Date.now() - startTime;
    
    // Calculate additional metrics
    const currentPrice = validatedData.data[validatedData.data.length - 1];
    const priceChange = predictionResult.prediction - currentPrice;
    const priceChangePercent = (priceChange / currentPrice) * 100;
    
    // Structure response
    const response = {
      prediction: predictionResult.prediction,
      confidence: predictionResult.confidence,
      range: {
        min: predictionResult.range[0],
        max: predictionResult.range[1]
      },
      analysis: {
        currentPrice,
        predictedChange: priceChange,
        predictedChangePercent: priceChangePercent,
        direction: priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'sideways',
        volatility: predictionResult.volatility || null
      },
      technical: {
        trend: predictionResult.trend || 'neutral',
        momentum: predictionResult.momentum || 0,
        support: predictionResult.support || null,
        resistance: predictionResult.resistance || null
      },
      metadata: {
        symbol: validatedData.symbol,
        timeframe: validatedData.timeframe,
        dataPoints: validatedData.data.length,
        lookAhead: validatedData.lookAhead,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      },
      cached: false
    };
    
    // Cache the response
    setCachedResponse(cacheKey, response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Price prediction API error:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid input data for price prediction',
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
    if (error.message?.includes('TensorFlow') || error.message?.includes('model')) {
      return NextResponse.json(
        {
          error: 'AI processing failed',
          message: 'Unable to generate price prediction. Please check your data.',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }
    
    // Handle insufficient data errors
    if (error.message?.includes('data') || error.message?.includes('length')) {
      return NextResponse.json(
        {
          error: 'Insufficient data',
          message: 'Need at least 20 historical data points for accurate prediction',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // Generic error handling
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred during prediction',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/predict',
    method: 'POST',
    description: 'Predict future price movements using neural network analysis',
    parameters: {
      symbol: {
        type: 'string',
        required: true,
        pattern: '^[A-Z0-9]+$',
        maxLength: 20,
        description: 'Trading symbol (e.g., BTCUSDT, ETHUSDT)'
      },
      timeframe: {
        type: 'string',
        required: true,
        enum: ['1m', '5m', '15m', '1h', '4h', '1d'],
        description: 'Chart timeframe for prediction context'
      },
      data: {
        type: 'array',
        required: true,
        items: 'number',
        minItems: 20,
        maxItems: 1000,
        description: 'Historical price data array (chronologically ordered)'
      },
      lookAhead: {
        type: 'number',
        required: false,
        default: 1,
        min: 1,
        max: 24,
        description: 'Number of periods to predict ahead'
      }
    },
    response: {
      prediction: 'number (predicted price value)',
      confidence: 'number (0-1, confidence in prediction)',
      range: 'object (min/max prediction bounds)',
      analysis: 'object (price change analysis)',
      technical: 'object (technical indicators)',
      metadata: 'object (request and processing info)'
    },
    rateLimit: '50 requests per minute per IP',
    caching: '2 minute TTL for similar requests',
    performance: 'Target response time < 2 seconds'
  });
}