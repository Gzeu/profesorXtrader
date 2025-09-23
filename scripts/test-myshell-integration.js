#!/usr/bin/env node
/**
 * Test script pentru MyShell integration
 * Testeaza toate endpoint-urile si functionalitatile
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000';
const TEST_SYMBOLS = ['bitcoin', 'ethereum', 'solana', 'cardano'];

class MyShellIntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async runAllTests() {
    console.log('🚀 Starting MyShell Integration Tests...\n'.cyan);
    console.log(`Base URL: ${BASE_URL}`.gray);
    console.log(`Test Symbols: ${TEST_SYMBOLS.join(', ')}\n`.gray);

    try {
      // Test API Health
      await this.testApiHealth();
      
      // Test MyShell Main Endpoint
      await this.testMyShellEndpoint();
      
      // Test All Actions
      await this.testTechnicalAnalysis();
      await this.testAIPrediction();
      await this.testPortfolioAnalysis();
      await this.testComprehensiveAnalysis();
      
      // Test Webhook
      await this.testWebhook();
      
      // Test Error Handling
      await this.testErrorHandling();
      
      // Test Rate Limiting (if implemented)
      await this.testRateLimiting();
      
      // Performance Tests
      await this.testPerformance();
      
    } catch (error) {
      console.error('❌ Test suite failed:'.red, error.message);
    }

    this.printResults();
  }

  async testApiHealth() {
    console.log('🏥 Testing API Health...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/myshell`);
      
      this.assert(
        response.status === 200,
        'API Health Check',
        'Health endpoint should return 200'
      );
      
      this.assert(
        response.data.service === 'ProfesorXtrader MyShell Integration',
        'Service Name',
        'Should return correct service name'
      );
      
      this.assert(
        Array.isArray(response.data.available_actions),
        'Available Actions',
        'Should return array of available actions'
      );
      
    } catch (error) {
      this.assert(false, 'API Health Check', error.message);
    }
  }

  async testMyShellEndpoint() {
    console.log('🔗 Testing MyShell Main Endpoint...');
    
    const testData = {
      action: 'technical_analysis',
      symbol: 'bitcoin',
      timeframe: '1h'
    };
    
    try {
      const response = await axios.post(`${BASE_URL}/api/myshell`, testData);
      
      this.assert(
        response.status === 200,
        'MyShell Endpoint Status',
        'Should return 200 status'
      );
      
      this.assert(
        response.data.success === true,
        'Response Success',
        'Response should indicate success'
      );
      
      this.assert(
        response.data.data !== undefined,
        'Response Data',
        'Should return analysis data'
      );
      
      this.assert(
        response.data.timestamp !== undefined,
        'Response Timestamp',
        'Should include timestamp'
      );
      
    } catch (error) {
      this.assert(false, 'MyShell Endpoint', error.message);
    }
  }

  async testTechnicalAnalysis() {
    console.log('📊 Testing Technical Analysis...');
    
    const testData = {
      action: 'technical_analysis',
      symbol: 'bitcoin',
      timeframe: '1h'
    };
    
    try {
      const response = await axios.post(`${BASE_URL}/api/myshell`, testData);
      const data = response.data.data;
      
      this.assert(
        data.symbol === 'BITCOIN',
        'Symbol Formatting',
        'Symbol should be uppercase'
      );
      
      this.assert(
        data.technical_indicators !== undefined,
        'Technical Indicators',
        'Should return technical indicators'
      );
      
      this.assert(
        data.technical_indicators.rsi !== undefined,
        'RSI Indicator',
        'Should include RSI analysis'
      );
      
      this.assert(
        data.technical_indicators.trend !== undefined,
        'Trend Analysis',
        'Should include trend analysis'
      );
      
    } catch (error) {
      this.assert(false, 'Technical Analysis', error.message);
    }
  }

  async testAIPrediction() {
    console.log('🤖 Testing AI Prediction...');
    
    const testData = {
      action: 'ai_prediction',
      symbol: 'ethereum',
      coindata: {
        market_data: {
          current_price: { usd: 2500 },
          price_change_percentage_24h: 3.5
        }
      }
    };
    
    try {
      const response = await axios.post(`${BASE_URL}/api/myshell`, testData);
      const data = response.data.data;
      
      this.assert(
        data.sentiment !== undefined,
        'Sentiment Analysis',
        'Should return sentiment analysis'
      );
      
      this.assert(
        data.patterns !== undefined,
        'Pattern Recognition',
        'Should return pattern analysis'
      );
      
      this.assert(
        data.prediction !== undefined,
        'Price Prediction',
        'Should return price prediction'
      );
      
      this.assert(
        data.confidence >= 0 && data.confidence <= 100,
        'Confidence Score',
        'Confidence should be between 0-100'
      );
      
    } catch (error) {
      this.assert(false, 'AI Prediction', error.message);
    }
  }

  async testPortfolioAnalysis() {
    console.log('💼 Testing Portfolio Analysis...');
    
    const testData = {
      action: 'portfolio_analysis',
      symbol: 'portfolio',
      holdings: [
        { symbol: 'BTC', value: 5000 },
        { symbol: 'ETH', value: 3000 },
        { symbol: 'SOL', value: 2000 }
      ]
    };
    
    try {
      const response = await axios.post(`${BASE_URL}/api/myshell`, testData);
      const data = response.data.data;
      
      this.assert(
        data.risk_score !== undefined,
        'Risk Score',
        'Should return risk score'
      );
      
      this.assert(
        Array.isArray(data.recommendations),
        'Recommendations',
        'Should return array of recommendations'
      );
      
    } catch (error) {
      this.assert(false, 'Portfolio Analysis', error.message);
    }
  }

  async testComprehensiveAnalysis() {
    console.log('🎯 Testing Comprehensive Analysis...');
    
    const testData = {
      action: 'comprehensive_analysis',
      symbol: 'solana',
      timeframe: '1h',
      coindata: {
        market_data: {
          current_price: { usd: 150 },
          price_change_percentage_24h: -2.1
        }
      }
    };
    
    try {
      const response = await axios.post(`${BASE_URL}/api/myshell`, testData);
      const data = response.data.data;
      
      this.assert(
        data.technical_analysis !== undefined,
        'Technical Component',
        'Should include technical analysis'
      );
      
      this.assert(
        data.ai_analysis !== undefined,
        'AI Component',
        'Should include AI analysis'
      );
      
      this.assert(
        data.overall_signal !== undefined,
        'Overall Signal',
        'Should provide overall trading signal'
      );
      
      this.assert(
        data.summary !== undefined,
        'Analysis Summary',
        'Should provide summary'
      );
      
    } catch (error) {
      this.assert(false, 'Comprehensive Analysis', error.message);
    }
  }

  async testWebhook() {
    console.log('🔗 Testing Webhook Endpoint...');
    
    const testData = {
      event_type: 'message_received',
      user_id: 'test_user_123',
      message: 'Analyze Bitcoin',
      session_id: 'test_session_456'
    };
    
    try {
      const response = await axios.post(`${BASE_URL}/api/myshell/webhook`, testData);
      
      this.assert(
        response.status === 200,
        'Webhook Status',
        'Webhook should return 200'
      );
      
      this.assert(
        response.data.status === 'processed',
        'Webhook Processing',
        'Webhook should process message'
      );
      
    } catch (error) {
      this.assert(false, 'Webhook Test', error.message);
    }
  }

  async testErrorHandling() {
    console.log('⚠️ Testing Error Handling...');
    
    // Test invalid action
    try {
      const response = await axios.post(`${BASE_URL}/api/myshell`, {
        action: 'invalid_action',
        symbol: 'bitcoin'
      });
      
      this.assert(
        response.status === 500,
        'Invalid Action Error',
        'Should return 500 for invalid action'
      );
      
    } catch (error) {
      if (error.response && error.response.status === 500) {
        this.assert(true, 'Invalid Action Error', 'Correctly handled invalid action');
      } else {
        this.assert(false, 'Invalid Action Error', 'Unexpected error handling');
      }
    }
    
    // Test missing symbol
    try {
      const response = await axios.post(`${BASE_URL}/api/myshell`, {
        action: 'technical_analysis'
        // missing symbol
      });
      
    } catch (error) {
      if (error.response && error.response.status === 500) {
        this.assert(true, 'Missing Symbol Error', 'Correctly handled missing symbol');
      } else {
        this.assert(false, 'Missing Symbol Error', 'Unexpected error handling');
      }
    }
  }

  async testRateLimiting() {
    console.log('🚦 Testing Rate Limiting...');
    
    // This is a basic test - actual rate limiting would need more sophisticated testing
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        axios.post(`${BASE_URL}/api/myshell`, {
          action: 'technical_analysis',
          symbol: 'bitcoin'
        })
      );
    }
    
    try {
      const responses = await Promise.allSettled(requests);
      const successful = responses.filter(r => r.status === 'fulfilled').length;
      
      this.assert(
        successful > 0,
        'Rate Limiting',
        `${successful}/5 requests successful (rate limiting may apply)`
      );
      
    } catch (error) {
      this.assert(false, 'Rate Limiting Test', error.message);
    }
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...');
    
    const testData = {
      action: 'comprehensive_analysis',
      symbol: 'bitcoin',
      timeframe: '1h'
    };
    
    try {
      const startTime = Date.now();
      const response = await axios.post(`${BASE_URL}/api/myshell`, testData);
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      this.assert(
        responseTime < 5000,
        'Response Time',
        `Response time: ${responseTime}ms (should be < 5000ms)`
      );
      
      this.assert(
        response.status === 200,
        'Performance Test Success',
        'Performance test completed successfully'
      );
      
    } catch (error) {
      this.assert(false, 'Performance Test', error.message);
    }
  }

  assert(condition, testName, message) {
    this.results.total++;
    
    if (condition) {
      this.results.passed++;
      console.log(`  ✅ ${testName}: ${message}`.green);
    } else {
      this.results.failed++;
      console.log(`  ❌ ${testName}: ${message}`.red);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS'.cyan.bold);
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`.green);
    console.log(`Failed: ${this.results.failed}`.red);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed! MyShell integration is ready! 🚀'.green.bold);
    } else {
      console.log('\n⚠️ Some tests failed. Check the issues above.'.yellow.bold);
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new MyShellIntegrationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = MyShellIntegrationTester;
