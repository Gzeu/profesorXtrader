#!/usr/bin/env node
/**
 * Test XAI Grok Integration for ProfesorXTrader
 * Validates XAI API connection and trading analysis capabilities
 */

const colors = require('colors');

// Mock environment variables for testing
if (!process.env.XAI_API_KEY) {
  console.log('⚠️  XAI_API_KEY not found in environment variables'.yellow);
  console.log('ℹ️  Set XAI_API_KEY in your .env.local or Vercel environment variables'.cyan);
  process.exit(0);
}

// Import XAI Client
let XAIClient;
try {
  const clientPath = '../src/lib/ai/XAIClient.js';
  XAIClient = require(clientPath).default || require(clientPath);
} catch (error) {
  console.error('❌ Failed to import XAIClient:', error.message);
  process.exit(1);
}

async function testXAIIntegration() {
  console.log('🧪 Testing XAI Grok Integration for ProfesorXTrader\n'.bold.blue);
  
  const client = new XAIClient({
    model: 'grok-4-fast', // Most cost-effective for testing
    maxTokens: 1024,
    temperature: 0.3
  });
  
  const tests = [
    {
      name: 'API Connection Test',
      test: async () => {
        await client.initialize();
        return client.initialized;
      }
    },
    {
      name: 'Sentiment Analysis Test',
      test: async () => {
        const result = await client.analyzeSentiment(
          'Bitcoin is showing strong bullish momentum with high volume and breaking resistance levels. Institutional adoption is increasing.',
          'BTCUSDT'
        );
        return result && result.analysis && result.analysis.sentiment;
      }
    },
    {
      name: 'Market Trend Analysis Test',
      test: async () => {
        const mockMarketData = {
          price: 45678.50,
          volume: 1234567890,
          change24h: 3.45,
          rsi: 65.4,
          macd: 'bullish'
        };
        
        const result = await client.analyzeMarketTrend(mockMarketData, 'BTCUSDT');
        return result && result.analysis && result.analysis.trend;
      }
    },
    {
      name: 'Trading Strategy Generation Test',
      test: async () => {
        const mockMarketData = {
          symbol: 'BTCUSDT',
          price: 45678.50,
          support: 44000,
          resistance: 47000,
          rsi: 65.4,
          volume: 1234567890,
          trend: 'bullish'
        };
        
        const result = await client.generateTradingStrategy(mockMarketData, 'medium');
        return result && result.strategy && result.strategy.strategy;
      }
    }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const { name, test } of tests) {
    try {
      console.log(`⏳ Running ${name}...`.yellow);
      const result = await test();
      
      if (result) {
        console.log(`✅ ${name} - PASSED`.green);
        passed++;
      } else {
        console.log(`❌ ${name} - FAILED (no valid result)`.red);
      }
    } catch (error) {
      console.log(`❌ ${name} - FAILED: ${error.message}`.red);
    }
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('📊 Test Results Summary:'.bold.blue);
  console.log(`Passed: ${passed}/${total} tests`.green);
  
  if (passed === total) {
    console.log('🎉 All XAI Grok tests passed! Ready for production.'.bold.green);
    
    console.log('\n🚀 Next Steps:'.bold.cyan);
    console.log('1. Add XAI_API_KEY to Vercel environment variables');
    console.log('2. Deploy to production');
    console.log('3. Test live trading analysis');
    
  } else {
    console.log('⚠️  Some tests failed. Check your XAI API key and network connection.'.yellow);
    process.exit(1);
  }
  
  // Cleanup
  client.dispose();
}

// Performance Test
async function performanceTest() {
  console.log('\n⚡ Performance Test'.bold.yellow);
  
  const client = new XAIClient();
  await client.initialize();
  
  const startTime = Date.now();
  
  try {
    await client.analyzeSentiment('Quick performance test for latency measurement', 'BTCUSDT');
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    console.log(`Response time: ${latency}ms`.cyan);
    
    if (latency < 3000) {
      console.log('✅ Excellent performance (< 3s)'.green);
    } else if (latency < 5000) {
      console.log('⚠️  Acceptable performance (3-5s)'.yellow);
    } else {
      console.log('❌ Slow performance (> 5s)'.red);
    }
  } catch (error) {
    console.log('❌ Performance test failed:', error.message.red);
  }
  
  client.dispose();
}

// Cost Estimation
function estimateCosts() {
  console.log('\n💰 Cost Estimation (XAI Grok 4 Fast)'.bold.magenta);
  console.log('Input tokens: ~$0.05 per million tokens');
  console.log('Output tokens: ~$0.05 per million tokens');
  console.log('Estimated monthly cost for moderate usage: $10-50');
  console.log('💡 Tip: Use grok-4-fast for best cost/performance ratio');
}

// Run all tests
async function runAllTests() {
  try {
    await testXAIIntegration();
    await performanceTest();
    estimateCosts();
  } catch (error) {
    console.error('\n💥 Critical test failure:'.bold.red, error.message);
    process.exit(1);
  }
}

runAllTests();