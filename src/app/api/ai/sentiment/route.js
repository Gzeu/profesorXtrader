import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SentimentAnalyzer } from '../../../../lib/ai/SentimentAnalyzer';

// Rate limiting cache (simple in-memory implementation)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

// Input validation schema
const sentimentSchema = z.object({
  text: z.string().min(1).max(5000),
  sources: z.array(z.string()).optional().default([])
});

// Rate limiting middleware
function checkRateLimit(clientIP) {
  const now = Date.now();
  const userRequests = rateLimitCache.get(clientIP) || [];
  
  // Remove old requests outside the window
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

// Response caching (simple in-memory implementation)
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(data) {
  return JSON.stringify(data);
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
          message: 'Maximum 100 requests per minute allowed',
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = sentimentSchema.parse(body);
    
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

    // Initialize SentimentAnalyzer
    const analyzer = new SentimentAnalyzer();
    await analyzer.initialize();
    
    const startTime = Date.now();
    
    // Perform sentiment analysis
    const result = await analyzer.analyzeSentiment(
      validatedData.text, 
      validatedData.sources
    );
    
    const processingTime = Date.now() - startTime;
    
    // Structure response
    const response = {
      sentiment: result.overallSentiment,
      confidence: result.confidence,
      methods: {
        ruleBased: result.ruleBasedSentiment,
        neural: result.neuralSentiment,
        cryptoSpecific: result.cryptoSpecificSentiment
      },
      analysis: {
        positiveWords: result.positiveWords,
        negativeWords: result.negativeWords,
        neutralWords: result.neutralWords
      },
      metadata: {
        textLength: validatedData.text.length,
        sourcesCount: validatedData.sources.length,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      },
      cached: false
    };
    
    // Cache the response
    setCachedResponse(cacheKey, response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Sentiment analysis API error:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
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
          message: 'Unable to process sentiment analysis. Please try again.',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }
    
    // Generic error handling
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/sentiment',
    method: 'POST',
    description: 'Analyze sentiment of text using multiple AI methods',
    parameters: {
      text: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 5000,
        description: 'Text to analyze for sentiment'
      },
      sources: {
        type: 'array',
        required: false,
        items: 'string',
        description: 'Optional array of source URLs or identifiers'
      }
    },
    response: {
      sentiment: 'number (-1 to 1, where -1 is most negative, 1 is most positive)',
      confidence: 'number (0 to 1, confidence in the analysis)',
      methods: 'object (breakdown by analysis method)',
      analysis: 'object (word categorization and details)',
      metadata: 'object (processing information)'
    },
    rateLimit: '100 requests per minute per IP',
    caching: '5 minute TTL for identical requests'
  });
}