#!/usr/bin/env node
/**
 * Production Verification Script pentru ProfesorXTrader 2025
 * Testează toate feature-urile și endpoint-urile în production
 */

const https = require('https')
const http = require('http')
const { performance } = require('perf_hooks')

// Configuration
const PRODUCTION_URL = 'https://profesor-x-trader.vercel.app'
const DEV_URL = 'https://profesor-x-trader-git-fix-ci-gzeus-projects.vercel.app'
const TIMEOUT = 10000 // 10 seconds

class ProductionVerifier {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    }
  }

  async makeRequest(url, timeout = TIMEOUT) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now()
      const urlObj = new URL(url)
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: timeout,
        headers: {
          'User-Agent': 'ProfesorXTrader-ProductionVerifier/1.0',
          'Accept': 'application/json'
        }
      }

      const protocol = urlObj.protocol === 'https:' ? https : http
      
      const req = protocol.request(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          const endTime = performance.now()
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime: Math.round(endTime - startTime),
            size: Buffer.byteLength(data, 'utf8')
          })
        })
      })

      req.on('error', reject)
      req.on('timeout', () => {
        req.destroy()
        reject(new Error(`Request timeout after ${timeout}ms`))
      })
      
      req.end()
    })
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Testing: ${name}...`)
    this.results.total++
    
    try {
      const result = await testFn()
      if (result.success) {
        console.log(`✅ PASS: ${name}`)
        if (result.metrics) {
          console.log(`   Metrics: ${JSON.stringify(result.metrics)}`)
        }
        this.results.passed++
        this.results.tests.push({ name, status: 'PASS', ...result })
      } else {
        console.log(`❌ FAIL: ${name} - ${result.error}`)
        this.results.failed++
        this.results.tests.push({ name, status: 'FAIL', error: result.error })
      }
    } catch (error) {
      console.log(`❌ ERROR: ${name} - ${error.message}`)
      this.results.failed++
      this.results.tests.push({ name, status: 'ERROR', error: error.message })
    }
  }

  async testMainSiteAccess() {
    return this.runTest('Main Site Access', async () => {
      const response = await this.makeRequest(PRODUCTION_URL)
      return {
        success: response.status === 200,
        error: response.status !== 200 ? `HTTP ${response.status}` : null,
        metrics: {
          responseTime: `${response.responseTime}ms`,
          size: `${Math.round(response.size / 1024)}KB`
        }
      }
    })
  }

  async testHealthEndpoint() {
    return this.runTest('Health Endpoint', async () => {
      const response = await this.makeRequest(`${PRODUCTION_URL}/api/health`)
      const isJSON = response.headers['content-type']?.includes('application/json')
      
      let healthData = null
      if (isJSON) {
        try {
          healthData = JSON.parse(response.data)
        } catch (e) {
          return { success: false, error: 'Invalid JSON response' }
        }
      }
      
      return {
        success: response.status === 200 && healthData?.status,
        error: response.status !== 200 ? `HTTP ${response.status}` : 
               !healthData?.status ? 'No status in response' : null,
        metrics: {
          responseTime: `${response.responseTime}ms`,
          healthStatus: healthData?.status,
          features: healthData?.features ? Object.keys(healthData.features).length : 0
        }
      }
    })
  }

  async testStatusEndpoint() {
    return this.runTest('Status Endpoint', async () => {
      const response = await this.makeRequest(`${PRODUCTION_URL}/api/status`)
      const isJSON = response.headers['content-type']?.includes('application/json')
      
      let statusData = null
      if (isJSON) {
        try {
          statusData = JSON.parse(response.data)
        } catch (e) {
          return { success: false, error: 'Invalid JSON response' }
        }
      }
      
      return {
        success: response.status === 200 && statusData?.overall,
        error: response.status !== 200 ? `HTTP ${response.status}` : 
               !statusData?.overall ? 'No overall status' : null,
        metrics: {
          responseTime: `${response.responseTime}ms`,
          overall: statusData?.overall,
          version: statusData?.deployment?.version,
          features: statusData?.features ? Object.keys(statusData.features).length : 0
        }
      }
    })
  }

  async testCriticalEndpoints() {
    const endpoints = [
      '/api/config',
      '/api/binance/test'
    ]

    for (const endpoint of endpoints) {
      await this.runTest(`Endpoint ${endpoint}`, async () => {
        const response = await this.makeRequest(`${PRODUCTION_URL}${endpoint}`)
        return {
          success: response.status === 200 || response.status === 405, // 405 for POST-only endpoints
          error: ![200, 405].includes(response.status) ? `HTTP ${response.status}` : null,
          metrics: {
            responseTime: `${response.responseTime}ms`,
            status: response.status
          }
        }
      })
    }
  }

  async testPerformance() {
    return this.runTest('Performance Benchmark', async () => {
      const iterations = 5
      const times = []
      
      for (let i = 0; i < iterations; i++) {
        const response = await this.makeRequest(`${PRODUCTION_URL}/api/health`)
        times.push(response.responseTime)
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length
      const maxTime = Math.max(...times)
      const minTime = Math.min(...times)
      
      return {
        success: avgTime < 2000, // Under 2 seconds average
        error: avgTime >= 2000 ? `Average response time ${avgTime}ms too slow` : null,
        metrics: {
          averageTime: `${Math.round(avgTime)}ms`,
          minTime: `${minTime}ms`,
          maxTime: `${maxTime}ms`,
          iterations: iterations
        }
      }
    })
  }

  async testSecurityHeaders() {
    return this.runTest('Security Headers', async () => {
      const response = await this.makeRequest(PRODUCTION_URL)
      const headers = response.headers
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options', 
        'x-xss-protection'
      ]
      
      const missingHeaders = requiredHeaders.filter(header => !headers[header])
      
      return {
        success: missingHeaders.length === 0,
        error: missingHeaders.length > 0 ? `Missing headers: ${missingHeaders.join(', ')}` : null,
        metrics: {
          securityHeaders: requiredHeaders.length - missingHeaders.length,
          totalHeaders: requiredHeaders.length
        }
      }
    })
  }

  async compareUrls() {
    return this.runTest('URL Comparison (Main vs Dev)', async () => {
      try {
        const [prodResponse, devResponse] = await Promise.all([
          this.makeRequest(`${PRODUCTION_URL}/api/health`),
          this.makeRequest(`${DEV_URL}/api/health`)
        ])
        
        const bothWork = prodResponse.status === 200 && devResponse.status === 200
        const timeDiff = Math.abs(prodResponse.responseTime - devResponse.responseTime)
        
        return {
          success: bothWork,
          error: !bothWork ? `Prod: ${prodResponse.status}, Dev: ${devResponse.status}` : null,
          metrics: {
            prodTime: `${prodResponse.responseTime}ms`,
            devTime: `${devResponse.responseTime}ms`,
            timeDifference: `${timeDiff}ms`
          }
        }
      } catch (error) {
        return {
          success: false,
          error: `Comparison failed: ${error.message}`
        }
      }
    })
  }

  async runAllTests() {
    console.log('🚀 ProfesorXTrader 2025 - Production Verification Suite')
    console.log('='.repeat(60))
    console.log(`Production URL: ${PRODUCTION_URL}`)
    console.log(`Development URL: ${DEV_URL}`)
    console.log(`Timeout: ${TIMEOUT}ms`)
    console.log('='.repeat(60))

    await this.testMainSiteAccess()
    await this.testHealthEndpoint()
    await this.testStatusEndpoint()
    await this.testCriticalEndpoints()
    await this.testPerformance()
    await this.testSecurityHeaders()
    await this.compareUrls()

    this.printSummary()
  }

  printSummary() {
    console.log('\n' + '='.repeat(60))
    console.log('📈 PRODUCTION VERIFICATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Tests: ${this.results.total}`)
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    console.log(`Success Rate: ${Math.round((this.results.passed / this.results.total) * 100)}%`)
    
    if (this.results.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Production is ready! 🎉')
    } else {
      console.log('\n⚠️  Some tests failed. Review the issues above.')
    }
    
    console.log('\n🔗 Quick Access:')
    console.log(`Main Site: ${PRODUCTION_URL}`)
    console.log(`Health: ${PRODUCTION_URL}/api/health`)
    console.log(`Status: ${PRODUCTION_URL}/api/status`)
    console.log('='.repeat(60))
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new ProductionVerifier()
  verifier.runAllTests().catch(console.error)
}

module.exports = ProductionVerifier