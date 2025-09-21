#!/usr/bin/env node

/**
 * ProfesorXTrader - Binance API Connection Test
 * This script tests the connection to Binance API and validates credentials
 */

const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Binance API Configuration
const BINANCE_API_URL = process.env.NEXT_PUBLIC_BINANCE_API_URL || 'https://api.binance.com';
const API_KEY = process.env.BINANCE_API_KEY;
const SECRET_KEY = process.env.BINANCE_SECRET_KEY;

// Test endpoints
const ENDPOINTS = {
  serverTime: '/api/v3/time',
  exchangeInfo: '/api/v3/exchangeInfo',
  accountInfo: '/api/v3/account', // Requires authentication
  ticker24hr: '/api/v3/ticker/24hr?symbol=BTCUSDT'
};

// Utility functions
function createSignature(queryString, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(queryString)
    .digest('hex');
}

function createAuthHeaders(queryString = '') {
  if (!API_KEY || !SECRET_KEY) {
    return null;
  }

  const timestamp = Date.now();
  const signatureString = queryString ? `${queryString}&timestamp=${timestamp}` : `timestamp=${timestamp}`;
  const signature = createSignature(signatureString, SECRET_KEY);

  return {
    'X-MBX-APIKEY': API_KEY,
    'Content-Type': 'application/json'
  };
}

async function testEndpoint(name, endpoint, requiresAuth = false) {
  try {
    console.log(`\n🔍 Testing ${name}...`);
    
    let url = `${BINANCE_API_URL}${endpoint}`;
    let headers = {};
    
    if (requiresAuth) {
      if (!API_KEY || !SECRET_KEY) {
        console.log(`⚠️ Skipping ${name} - API credentials not provided`);
        return { success: false, reason: 'no_credentials' };
      }
      
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = createSignature(queryString, SECRET_KEY);
      
      url += `?${queryString}&signature=${signature}`;
      headers = createAuthHeaders();
    }
    
    const response = await axios.get(url, { 
      headers,
      timeout: 10000 // 10 second timeout
    });
    
    if (response.status === 200) {
      console.log(`✅ ${name}: Success`);
      
      // Log some basic info about the response
      if (name === 'Server Time') {
        const serverTime = new Date(response.data.serverTime);
        console.log(`   Server Time: ${serverTime.toISOString()}`);
        
        // Check time sync
        const localTime = Date.now();
        const timeDiff = Math.abs(localTime - response.data.serverTime);
        if (timeDiff > 5000) {
          console.log(`   ⚠️ Time difference: ${timeDiff}ms (should be < 5000ms)`);
        } else {
          console.log(`   ✅ Time sync: ${timeDiff}ms`);
        }
      } else if (name === 'Exchange Info') {
        console.log(`   Symbols available: ${response.data.symbols.length}`);
      } else if (name === 'Account Info') {
        console.log(`   Account Type: ${response.data.accountType}`);
        console.log(`   Can Trade: ${response.data.canTrade}`);
        console.log(`   Can Withdraw: ${response.data.canWithdraw}`);
        console.log(`   Balances: ${response.data.balances.length} assets`);
      } else if (name === 'BTCUSDT 24hr Ticker') {
        console.log(`   Price: $${parseFloat(response.data.lastPrice).toFixed(2)}`);
        console.log(`   24h Change: ${parseFloat(response.data.priceChangePercent).toFixed(2)}%`);
      }
      
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.log(`❌ ${name}: Failed`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.msg || error.response.statusText}`);
      
      if (error.response.status === 401) {
        console.log(`   💡 Check your API key and secret`);
      } else if (error.response.status === 403) {
        console.log(`   💡 API key permissions might be insufficient`);
      }
    } else if (error.code === 'ENOTFOUND') {
      console.log(`   💡 Network error - check your internet connection`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    
    return { success: false, error: error.message };
  }
}

function displayEnvironmentInfo() {
  console.log('🌐 Environment Information:');
  console.log(`   Binance API URL: ${BINANCE_API_URL}`);
  console.log(`   API Key: ${API_KEY ? `${API_KEY.substring(0, 8)}...` : 'Not provided'}`);
  console.log(`   Secret Key: ${SECRET_KEY ? 'Provided (hidden)' : 'Not provided'}`);
  console.log(`   Node.js Version: ${process.version}`);
}

function displayRecommendations(results) {
  console.log('\n📋 Recommendations:');
  
  const hasCredentials = API_KEY && SECRET_KEY;
  const publicTestsPassed = results.serverTime?.success && results.exchangeInfo?.success && results.ticker?.success;
  const authTestPassed = results.accountInfo?.success;
  
  if (!hasCredentials) {
    console.log('   1. Set up your Binance API credentials in .env.local');
    console.log('   2. Make sure API key has "Spot & Margin Trading" permissions');
    console.log('   3. Consider enabling "Futures Trading" if you plan to use futures');
  } else if (hasCredentials && !authTestPassed) {
    console.log('   1. Verify your API key and secret are correct');
    console.log('   2. Check API key permissions in Binance account');
    console.log('   3. Ensure API key is not restricted by IP (if applicable)');
  } else if (publicTestsPassed && authTestPassed) {
    console.log('   ✅ All tests passed! Your Binance API setup is ready.');
    console.log('   💡 You can now run `npm run dev` to start the application');
  }
  
  if (results.serverTime?.success === false) {
    console.log('   ⚠️ Server connectivity issues detected');
    console.log('   💡 Check your internet connection and firewall settings');
  }
}

async function main() {
  console.log('🚀 ProfesorXTrader - Binance API Connection Test');
  console.log('==============================================');
  
  displayEnvironmentInfo();
  
  const results = {};
  
  // Test public endpoints (no authentication required)
  results.serverTime = await testEndpoint('Server Time', ENDPOINTS.serverTime);
  results.exchangeInfo = await testEndpoint('Exchange Info', ENDPOINTS.exchangeInfo);
  results.ticker = await testEndpoint('BTCUSDT 24hr Ticker', ENDPOINTS.ticker24hr);
  
  // Test authenticated endpoint
  results.accountInfo = await testEndpoint('Account Info', ENDPOINTS.accountInfo, true);
  
  // Summary
  console.log('\n📊 Test Summary:');
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r.success).length;
  const skippedTests = Object.values(results).filter(r => r.reason === 'no_credentials').length;
  
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${totalTests - passedTests - skippedTests}`);
  console.log(`   Skipped: ${skippedTests}`);
  
  displayRecommendations(results);
  
  // Exit with appropriate code
  const allCriticalTestsPassed = results.serverTime?.success && results.exchangeInfo?.success;
  if (!allCriticalTestsPassed) {
    console.log('\n❌ Critical tests failed. Please resolve issues before proceeding.');
    process.exit(1);
  } else {
    console.log('\n✅ Basic connectivity tests passed!');
    process.exit(0);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Test script failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  testEndpoint,
  createSignature,
  createAuthHeaders
};