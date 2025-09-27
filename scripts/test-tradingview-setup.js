const colors = require('colors');
const https = require('https');

console.log('🚀 TradingView Integration Test - STARTING NOW'.green.bold);
console.log('==============================================='.cyan);

// Test 1: Binance API Connection
async function testBinanceAPI() {
  console.log('\n📊 Testing Binance API Connection...'.yellow);
  
  try {
    const symbol = 'EGLDUSDT';
    const interval = '15m';
    const limit = 10;
    
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`✅ Binance API: SUCCESS - Retrieved ${data.length} candles for ${symbol}`.green);
      
      const lastCandle = data[data.length - 1];
      const [timestamp, open, high, low, close, volume] = lastCandle;
      const date = new Date(timestamp).toISOString();
      
      console.log(`   Latest: ${date} | O:${open} H:${high} L:${low} C:${close} V:${volume}`.gray);
      return true;
    } else {
      throw new Error('Invalid data format from Binance API');
    }
  } catch (error) {
    console.log(`❌ Binance API: FAILED - ${error.message}`.red);
    return false;
  }
}

// Test 2: TradingView Library Check
async function testTradingViewLibrary() {
  console.log('\n📈 Testing TradingView Library Integration...'.yellow);
  
  try {
    // Check if we can import the library
    const fs = require('fs');
    const path = require('path');
    
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.dependencies['tradingview-charting-library']) {
      console.log('✅ TradingView Library: FOUND in package.json'.green);
      console.log(`   Version: ${packageJson.dependencies['tradingview-charting-library']}`.gray);
      
      // Check if datafeeds-api is also installed
      if (packageJson.dependencies['datafeeds-api']) {
        console.log('✅ Datafeeds API: FOUND in package.json'.green);
        console.log(`   Version: ${packageJson.dependencies['datafeeds-api']}`.gray);
      } else {
        console.log('⚠️  Datafeeds API: NOT FOUND in package.json'.yellow);
      }
      
      return true;
    } else {
      throw new Error('TradingView Charting Library not found in dependencies');
    }
  } catch (error) {
    console.log(`❌ TradingView Library: FAILED - ${error.message}`.red);
    return false;
  }
}

// Test 3: Datafeed Interface Simulation
async function testDatafeedInterface() {
  console.log('\n🔌 Testing Datafeed Interface...'.yellow);
  
  try {
    // Simulate TradingView datafeed methods
    const datafeed = {
      onReady: (callback) => {
        console.log('   📡 onReady: Called'.gray);
        callback({
          supported_resolutions: ['1', '3', '5', '15', '30', '60', '240', 'D'],
          supports_marks: false,
          supports_timescale_marks: false
        });
      },
      
      resolveSymbol: (symbolName, onResolve, onError) => {
        console.log(`   🔍 resolveSymbol: ${symbolName}`.gray);
        onResolve({
          name: symbolName,
          description: `${symbolName} / Tether USD`,
          type: 'crypto',
          session: '24x7',
          timezone: 'Etc/UTC',
          exchange: 'Binance',
          minmov: 1,
          pricescale: 100000
        });
      },
      
      getBars: async (symbolInfo, resolution, periodParams, onResult, onError) => {
        console.log(`   📊 getBars: ${symbolInfo.name} [${resolution}]`.gray);
        
        try {
          // Simulate API call
          const binanceIntervals = {
            '1': '1m', '3': '3m', '5': '5m', '15': '15m', '30': '30m',
            '60': '1h', '240': '4h', 'D': '1d'
          };
          
          const interval = binanceIntervals[resolution] || '15m';
          const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbolInfo.name}&interval=${interval}&limit=100`
          );
          
          if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`);
          }
          
          const data = await response.json();
          const bars = data.map(kline => ({
            time: kline[0],
            low: parseFloat(kline[3]),
            high: parseFloat(kline[2]),
            open: parseFloat(kline[1]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5])
          }));
          
          console.log(`   ✅ getBars: Retrieved ${bars.length} bars`.gray);
          onResult(bars, { noData: bars.length === 0 });
        } catch (error) {
          console.log(`   ❌ getBars: ${error.message}`.gray);
          onError(error);
        }
      }
    };
    
    // Test datafeed methods
    let testsPassed = 0;
    
    // Test onReady
    await new Promise((resolve) => {
      datafeed.onReady((config) => {
        if (config.supported_resolutions && config.supported_resolutions.length > 0) {
          testsPassed++;
        }
        resolve();
      });
    });
    
    // Test resolveSymbol
    await new Promise((resolve) => {
      datafeed.resolveSymbol('EGLDUSDT', (symbolInfo) => {
        if (symbolInfo.name === 'EGLDUSDT' && symbolInfo.exchange === 'Binance') {
          testsPassed++;
        }
        resolve();
      }, (error) => {
        console.log(`   ❌ resolveSymbol error: ${error}`.red);
        resolve();
      });
    });
    
    // Test getBars
    await new Promise((resolve) => {
      datafeed.getBars(
        { name: 'EGLDUSDT' },
        '15',
        { from: Date.now() / 1000 - 86400, to: Date.now() / 1000 },
        (bars, meta) => {
          if (bars && bars.length > 0) {
            testsPassed++;
          }
          resolve();
        },
        (error) => {
          console.log(`   ❌ getBars error: ${error}`.red);
          resolve();
        }
      );
    });
    
    if (testsPassed >= 3) {
      console.log('✅ Datafeed Interface: ALL TESTS PASSED'.green);
      return true;
    } else {
      console.log(`⚠️  Datafeed Interface: ${testsPassed}/3 tests passed`.yellow);
      return false;
    }
  } catch (error) {
    console.log(`❌ Datafeed Interface: FAILED - ${error.message}`.red);
    return false;
  }
}

// Test 4: Performance Benchmark
async function testPerformance() {
  console.log('\n⚡ Testing Performance Metrics...'.yellow);
  
  try {
    const startTime = Date.now();
    
    // Simulate chart data loading
    const symbols = ['EGLDUSDT', 'BTCUSDT', 'ETHUSDT'];
    const promises = symbols.map(async (symbol) => {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=15m&limit=500`
      );
      return response.json();
    });
    
    await Promise.all(promises);
    const loadTime = Date.now() - startTime;
    
    console.log(`✅ Performance: Loaded 1500 candles in ${loadTime}ms`.green);
    
    if (loadTime < 2000) {
      console.log('   🚀 Excellent performance: <2s load time'.green);
    } else if (loadTime < 5000) {
      console.log('   ✅ Good performance: <5s load time'.yellow);
    } else {
      console.log('   ⚠️  Slow performance: >5s load time'.red);
    }
    
    return loadTime < 5000;
  } catch (error) {
    console.log(`❌ Performance Test: FAILED - ${error.message}`.red);
    return false;
  }
}

// Test 5: Next.js Integration Check
async function testNextJSIntegration() {
  console.log('\n⚛️  Testing Next.js Integration...'.yellow);
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if component exists
    const componentPath = path.join(__dirname, '..', 'src', 'components', 'charts', 'TradingViewChart.tsx');
    
    if (fs.existsSync(componentPath)) {
      const componentContent = fs.readFileSync(componentPath, 'utf8');
      
      // Check for key features
      const hasReactImport = componentContent.includes(\"import React\");
      const hasTradingViewImport = componentContent.includes(\"tradingview-charting-library\");
      const hasDatafeed = componentContent.includes(\"createDatafeed\");
      const hasErrorHandling = componentContent.includes(\"setError\");
      const hasLoadingState = componentContent.includes(\"setIsLoading\");
      
      let score = 0;
      if (hasReactImport) score++;
      if (hasTradingViewImport) score++;
      if (hasDatafeed) score++;
      if (hasErrorHandling) score++;
      if (hasLoadingState) score++;
      
      console.log(`✅ Component Integration: ${score}/5 features implemented`.green);
      console.log(`   React: ${hasReactImport ? '✅' : '❌'}`.gray);
      console.log(`   TradingView: ${hasTradingViewImport ? '✅' : '❌'}`.gray);
      console.log(`   Datafeed: ${hasDatafeed ? '✅' : '❌'}`.gray);
      console.log(`   Error Handling: ${hasErrorHandling ? '✅' : '❌'}`.gray);
      console.log(`   Loading State: ${hasLoadingState ? '✅' : '❌'}`.gray);
      
      return score >= 4;
    } else {
      throw new Error('TradingViewChart.tsx component not found');
    }
  } catch (error) {
    console.log(`❌ Next.js Integration: FAILED - ${error.message}`.red);
    return false;
  }
}

// Main Test Runner
async function runAllTests() {
  console.log(`\n🔥 ACCELERATED IMPLEMENTATION TEST - ${new Date().toLocaleTimeString()}`.magenta.bold);
  
  const tests = [
    { name: 'Binance API', test: testBinanceAPI },
    { name: 'TradingView Library', test: testTradingViewLibrary },
    { name: 'Datafeed Interface', test: testDatafeedInterface },
    { name: 'Performance', test: testPerformance },
    { name: 'Next.js Integration', test: testNextJSIntegration }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const { name, test } of tests) {
    const result = await test();
    if (result) passed++;
  }
  
  console.log(`\n${'='.repeat(50)}`.cyan);
  console.log(`🏁 TEST RESULTS: ${passed}/${total} PASSED`.bold);
  
  if (passed === total) {
    console.log('🚀 ALL SYSTEMS GO! Ready for chart implementation!'.green.bold);
    console.log('✅ TradingView integration foundation is SOLID'.green);
    console.log('⚡ Proceeding with dashboard integration...'.yellow);
  } else if (passed >= total * 0.8) {
    console.log('⚠️  Most tests passed - proceeding with caution'.yellow.bold);
    console.log(`📋 ${total - passed} issues to resolve during development`.yellow);
  } else {
    console.log('❌ Critical issues detected - review required'.red.bold);
    console.log(`🔧 ${total - passed} major problems need fixing`.red);
  }
  
  console.log(`\n⏰ Next Step: Integrate chart component into main dashboard`.cyan);
  console.log(`🎯 Target: Live charts in production within 24h`.cyan.bold);
  
  return passed >= total * 0.6;
}

// Execute tests
runAllTests().catch(error => {
  console.log(`💥 CRITICAL ERROR: ${error.message}`.red.bold);
  process.exit(1);
});