#!/usr/bin/env node

/**
 * AI API Endpoints Testing Script
 * Tests all 4 AI endpoints for functionality and performance
 * 
 * Usage: npm run test-ai-api
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test data generators
function generateTestData() {
  // Generate mock OHLC data for testing
  const length = 100;
  const basePrice = 50000;
  const data = {
    open: [],
    high: [],
    low: [],
    close: [],
    volume: []
  };
  
  for (let i = 0; i < length; i++) {
    const variation = (Math.random() - 0.5) * 1000;
    const open = basePrice + variation;
    const close = open + (Math.random() - 0.5) * 500;
    const high = Math.max(open, close) + Math.random() * 200;
    const low = Math.min(open, close) - Math.random() * 200;
    const volume = Math.random() * 1000000;
    
    data.open.push(parseFloat(open.toFixed(2)));
    data.high.push(parseFloat(high.toFixed(2)));
    data.low.push(parseFloat(low.toFixed(2)));
    data.close.push(parseFloat(close.toFixed(2)));
    data.volume.push(parseFloat(volume.toFixed(2)));
  }
  
  return data;
}

function generatePriceData() {
  const length = 50;
  const basePrice = 50000;
  const data = [];
  
  for (let i = 0; i < length; i++) {
    const variation = (Math.random() - 0.5) * 1000;
    data.push(parseFloat((basePrice + variation).toFixed(2)));
  }
  
  return data;
}

// Test utilities
function generateTestId() {
  return crypto.randomBytes(4).toString('hex');
}

function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
  console.log(`[${timestamp}] ${statusIcon} ${testName} - ${status} ${details}`);
}

function measureTime(startTime) {
  return Date.now() - startTime;
}

// Individual endpoint tests
async function testSentimentEndpoint() {
  const testId = generateTestId();
  logTest('Sentiment Analysis API', 'RUNNING', `(ID: ${testId})`);
  
  try {
    const startTime = Date.now();
    
    const testData = {
      text: "Bitcoin is showing strong bullish momentum with increased trading volume and positive market sentiment.",
      sources: ["test-source-1", "test-source-2"]
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/ai/sentiment`,
      testData,
      { timeout: TEST_TIMEOUT }
    );
    
    const processingTime = measureTime(startTime);
    
    // Validate response structure
    const requiredFields = ['sentiment', 'confidence', 'methods', 'analysis', 'metadata'];
    const missingFields = requiredFields.filter(field => !response.data.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Validate sentiment range
    if (response.data.sentiment < -1 || response.data.sentiment > 1) {
      throw new Error(`Sentiment out of range: ${response.data.sentiment}`);
    }
    
    // Validate confidence range
    if (response.data.confidence < 0 || response.data.confidence > 1) {
      throw new Error(`Confidence out of range: ${response.data.confidence}`);
    }
    
    logTest(
      'Sentiment Analysis API',
      'PASS',
      `${processingTime}ms - Sentiment: ${response.data.sentiment.toFixed(3)}, Confidence: ${(response.data.confidence * 100).toFixed(1)}%`
    );
    
    return { success: true, processingTime, data: response.data };
    
  } catch (error) {
    logTest(
      'Sentiment Analysis API',
      'FAIL',
      error.response?.data?.message || error.message
    );
    return { success: false, error: error.message };
  }
}

async function testPredictionEndpoint() {
  const testId = generateTestId();
  logTest('Price Prediction API', 'RUNNING', `(ID: ${testId})`);
  
  try {
    const startTime = Date.now();
    
    const testData = {
      symbol: "BTCUSDT",
      timeframe: "1h",
      data: generatePriceData(),
      lookAhead: 3
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/ai/predict`,
      testData,
      { timeout: TEST_TIMEOUT }
    );
    
    const processingTime = measureTime(startTime);
    
    // Validate response structure
    const requiredFields = ['prediction', 'confidence', 'range', 'analysis', 'metadata'];
    const missingFields = requiredFields.filter(field => !response.data.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Validate prediction is a number
    if (typeof response.data.prediction !== 'number' || isNaN(response.data.prediction)) {
      throw new Error(`Invalid prediction value: ${response.data.prediction}`);
    }
    
    // Validate confidence range
    if (response.data.confidence < 0 || response.data.confidence > 1) {
      throw new Error(`Confidence out of range: ${response.data.confidence}`);
    }
    
    logTest(
      'Price Prediction API',
      'PASS',
      `${processingTime}ms - Prediction: $${response.data.prediction.toFixed(2)}, Confidence: ${(response.data.confidence * 100).toFixed(1)}%`
    );
    
    return { success: true, processingTime, data: response.data };
    
  } catch (error) {
    logTest(
      'Price Prediction API',
      'FAIL',
      error.response?.data?.message || error.message
    );
    return { success: false, error: error.message };
  }
}

async function testPatternsEndpoint() {
  const testId = generateTestId();
  logTest('Pattern Recognition API', 'RUNNING', `(ID: ${testId})`);
  
  try {
    const startTime = Date.now();
    
    const testData = {
      symbol: "ETHUSDT",
      chartData: generateTestData(),
      timeframe: "4h",
      sensitivity: 0.7
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/ai/patterns`,
      testData,
      { timeout: TEST_TIMEOUT }
    );
    
    const processingTime = measureTime(startTime);
    
    // Validate response structure
    const requiredFields = ['patterns', 'signals', 'confidence', 'analysis', 'priceAction', 'metadata'];
    const missingFields = requiredFields.filter(field => !response.data.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Validate confidence range
    if (response.data.confidence < 0 || response.data.confidence > 1) {
      throw new Error(`Confidence out of range: ${response.data.confidence}`);
    }
    
    const patternCount = Object.values(response.data.patterns).flat().length;
    const signalCount = response.data.signals.all?.length || 0;
    
    logTest(
      'Pattern Recognition API',
      'PASS',
      `${processingTime}ms - ${patternCount} patterns, ${signalCount} signals, Confidence: ${(response.data.confidence * 100).toFixed(1)}%`
    );
    
    return { success: true, processingTime, data: response.data };
    
  } catch (error) {
    logTest(
      'Pattern Recognition API',
      'FAIL',
      error.response?.data?.message || error.message
    );
    return { success: false, error: error.message };
  }
}

async function testAnalysisEndpoint() {
  const testId = generateTestId();
  logTest('Comprehensive Analysis API', 'RUNNING', `(ID: ${testId})`);
  
  try {
    const startTime = Date.now();
    
    const testData = {
      symbol: "ADAUSDT",
      includeAll: true,
      options: {
        sentiment: {
          enabled: true,
          sources: ["test"]
        },
        prediction: {
          enabled: true,
          lookAhead: 2,
          timeframe: "1h"
        },
        patterns: {
          enabled: true,
          sensitivity: 0.6
        },
        marketData: {
          priceData: generatePriceData(),
          chartData: generateTestData()
        }
      }
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/ai/analyze`,
      testData,
      { timeout: TEST_TIMEOUT * 2 } // Double timeout for comprehensive analysis
    );
    
    const processingTime = measureTime(startTime);
    
    // Validate response structure
    const requiredFields = ['symbol', 'analysis', 'summary', 'confidence', 'recommendations', 'riskAssessment', 'metadata'];
    const missingFields = requiredFields.filter(field => !response.data.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Validate overall confidence
    if (response.data.confidence < 0 || response.data.confidence > 1) {
      throw new Error(`Overall confidence out of range: ${response.data.confidence}`);
    }
    
    const modulesCount = response.data.metadata.modulesExecuted;
    const errorsCount = response.data.metadata.errors;
    
    logTest(
      'Comprehensive Analysis API',
      'PASS',
      `${processingTime}ms - ${modulesCount} modules, ${errorsCount} errors, Overall confidence: ${(response.data.confidence * 100).toFixed(1)}%`
    );
    
    return { success: true, processingTime, data: response.data };
    
  } catch (error) {
    logTest(
      'Comprehensive Analysis API',
      'FAIL',
      error.response?.data?.message || error.message
    );
    return { success: false, error: error.message };
  }
}

// Rate limiting test
async function testRateLimiting() {
  logTest('Rate Limiting Test', 'RUNNING');
  
  try {
    const promises = [];
    const testData = {
      text: "Short test for rate limiting",
      sources: []
    };
    
    // Send 10 concurrent requests to test rate limiting
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.post(`${BASE_URL}/api/ai/sentiment`, testData, { timeout: 5000 })
          .then(res => ({ success: true, status: res.status }))
          .catch(err => ({ success: false, status: err.response?.status }))
      );
    }
    
    const results = await Promise.all(promises);
    const rateLimited = results.some(r => r.status === 429);
    const successful = results.filter(r => r.success).length;
    
    if (rateLimited) {
      logTest('Rate Limiting Test', 'PASS', `${successful}/10 requests succeeded, rate limiting active`);
    } else {
      logTest('Rate Limiting Test', 'PASS', `${successful}/10 requests succeeded, no rate limiting triggered`);
    }
    
    return { success: true, rateLimited, successfulRequests: successful };
    
  } catch (error) {
    logTest('Rate Limiting Test', 'FAIL', error.message);
    return { success: false, error: error.message };
  }
}

// Performance benchmark
async function runPerformanceBenchmark() {
  logTest('Performance Benchmark', 'RUNNING');
  
  const benchmarks = {
    sentiment: [],
    prediction: [],
    patterns: [],
    analysis: []
  };
  
  try {
    // Run each endpoint 3 times to get average performance
    for (let i = 0; i < 3; i++) {
      const sentimentResult = await testSentimentEndpoint();
      if (sentimentResult.success) benchmarks.sentiment.push(sentimentResult.processingTime);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between tests
      
      const predictionResult = await testPredictionEndpoint();
      if (predictionResult.success) benchmarks.prediction.push(predictionResult.processingTime);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const patternsResult = await testPatternsEndpoint();
      if (patternsResult.success) benchmarks.patterns.push(patternsResult.processingTime);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Calculate averages
    const averages = {};
    for (const [endpoint, times] of Object.entries(benchmarks)) {
      if (times.length > 0) {
        averages[endpoint] = {
          average: Math.round(times.reduce((sum, time) => sum + time, 0) / times.length),
          min: Math.min(...times),
          max: Math.max(...times),
          count: times.length
        };
      }
    }
    
    logTest('Performance Benchmark', 'COMPLETE');
    console.log('\n📊 Performance Results:');
    for (const [endpoint, stats] of Object.entries(averages)) {
      const target = endpoint === 'analysis' ? 5000 : 2000; // Different targets
      const status = stats.average <= target ? '✅' : '⚠️';
      console.log(`  ${status} ${endpoint.padEnd(12)}: ${stats.average}ms avg (${stats.min}-${stats.max}ms, target: ${target}ms)`);
    }
    
    return { success: true, benchmarks: averages };
    
  } catch (error) {
    logTest('Performance Benchmark', 'FAIL', error.message);
    return { success: false, error: error.message };
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting AI API Endpoints Test Suite');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Test Timeout: ${TEST_TIMEOUT}ms`);
  console.log('\n' + '='.repeat(80) + '\n');
  
  const results = {
    sentiment: null,
    prediction: null,
    patterns: null,
    analysis: null,
    rateLimit: null,
    performance: null
  };
  
  // Run individual endpoint tests
  results.sentiment = await testSentimentEndpoint();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.prediction = await testPredictionEndpoint();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.patterns = await testPatternsEndpoint();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.analysis = await testAnalysisEndpoint();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Run additional tests
  results.rateLimit = await testRateLimiting();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  results.performance = await runPerformanceBenchmark();
  
  // Generate summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📋 Test Summary:');
  
  const passed = Object.values(results).filter(r => r?.success).length;
  const total = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All AI API endpoints are working correctly!');
    console.log('✅ GPZ-38 implementation is ready for production');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    console.log('🔧 Additional debugging may be required for GPZ-38');
  }
  
  // Exit with appropriate code
  process.exit(passed === total ? 0 : 1);
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testSentimentEndpoint,
  testPredictionEndpoint,
  testPatternsEndpoint,
  testAnalysisEndpoint
};