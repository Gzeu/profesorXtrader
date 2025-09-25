#!/usr/bin/env node

/**
 * ProfesorXTrader - Groq Integration Test Script
 * Tests Groq API connectivity and trading analysis capabilities
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

async function testGroqIntegration() {
  console.log('🤖 ProfesorXTrader - Groq Integration Test');
  console.log('==========================================');
  
  try {
    // Test environment variables
    console.log('\n🔑 Environment Check:');
    if (!process.env.GROQ_API_KEY) {
      console.log('❌ GROQ_API_KEY missing from .env.local');
      process.exit(1);
    }
    console.log('✅ GROQ_API_KEY found');
    
    // Test Groq SDK
    console.log('\n📦 Testing Groq SDK:');
    let Groq;
    try {
      const groqModule = await import('groq-sdk');
      Groq = groqModule.default;
      console.log('✅ Groq SDK imported successfully');
    } catch (error) {
      console.log('❌ Groq SDK not found. Run: npm install groq-sdk');
      process.exit(1);
    }
    
    // Test API connection
    console.log('\n🔗 Testing API Connection:');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const model = 'llama-3.1-70b-versatile';
    
    const startTime = Date.now();
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Test connection' }],
      model: model,
      max_tokens: 10
    });
    const latency = Date.now() - startTime;
    
    if (response?.choices?.[0]?.message?.content) {
      console.log(`✅ Connection successful (${latency}ms)`);
      console.log(`🤖 Model: ${model}`);
      console.log(`📊 Usage: ${JSON.stringify(response.usage)}`);
    }
    
    // Test trading analysis
    console.log('\n💹 Testing Trading Analysis:');
    const tradingResponse = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a crypto trading analyst.' },
        { role: 'user', content: 'Analyze Bitcoin sentiment: "BTC showing bullish momentum"' }
      ],
      model: model,
      max_tokens: 200,
      temperature: 0.1
    });
    
    if (tradingResponse?.choices?.[0]?.message?.content) {
      console.log('✅ Trading analysis working');
      console.log(`Sample: ${tradingResponse.choices[0].message.content.slice(0, 100)}...`);
    }
    
    console.log('\n✨ All tests passed!');
    console.log('🚀 Groq integration ready!');
    console.log('\nNext: Set AI_PROVIDER=groq in .env.local and run npm run dev');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testGroqIntegration().catch(console.error);
}

module.exports = { testGroqIntegration };