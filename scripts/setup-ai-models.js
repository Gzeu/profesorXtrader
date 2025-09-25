#!/usr/bin/env node

/**
 * ProfesorXTrader - AI Models Setup Script (Updated for Groq)
 * Handles AI models initialization with Groq integration
 */

const fs = require('fs');
const path = require('path');

// Configuration directories
const AI_CONFIG_DIR = path.join(process.cwd(), 'config', 'ai');
const MODELS_CONFIG_FILE = path.join(AI_CONFIG_DIR, 'models.json');

// Updated AI Models Configuration with Groq priority
const DEFAULT_MODELS_CONFIG = {
  apis: {
    groq: {
      enabled: true,
      model: 'llama-3.1-70b-versatile',
      maxTokens: 4000,
      temperature: 0.1,
      priority: 1 // Highest priority
    },
    openai: {
      enabled: false, // Disabled by default
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      priority: 2
    }
  },
  tensorflow: {
    pricePredictor: {
      name: 'LSTM Price Predictor',
      enabled: true,
      version: '1.0.0'
    },
    sentimentAnalyzer: {
      name: 'Sentiment Analysis Model',
      enabled: true,
      version: '1.0.0'
    }
  },
  settings: {
    defaultProvider: 'groq',
    cacheDuration: 300000, // 5 minutes
    maxConcurrentRequests: 5,
    retryAttempts: 3
  }
};

function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

function writeConfigFile(configPath, config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Configuration saved: ${configPath}`);
  } catch (error) {
    console.error(`❌ Failed to write config: ${error.message}`);
    throw error;
  }
}

function checkEnvironmentVariables() {
  console.log('🔑 Checking environment variables...');
  
  const requiredVars = ['BINANCE_API_KEY', 'BINANCE_SECRET_KEY'];
  const aiVars = ['GROQ_API_KEY', 'OPENAI_API_KEY'];
  
  const missingRequired = requiredVars.filter(v => !process.env[v]);
  const missingAI = aiVars.filter(v => !process.env[v]);
  
  if (missingRequired.length > 0) {
    console.log(`⚠️ Missing required: ${missingRequired.join(', ')}`);
  }
  
  if (missingAI.length === aiVars.length) {
    console.log('⚠️ No AI API keys found. Add GROQ_API_KEY for AI features.');
  } else {
    console.log('✅ AI API keys configured');
  }
}

async function main() {
  console.log('🚀 ProfesorXTrader - AI Setup (Groq Enabled)');
  console.log('============================================');
  
  try {
    // Create directories
    createDirectoryIfNotExists(AI_CONFIG_DIR);
    
    // Check environment
    checkEnvironmentVariables();
    
    // Write configuration
    writeConfigFile(MODELS_CONFIG_FILE, DEFAULT_MODELS_CONFIG);
    
    // Create updated .env.example if needed
    const envExamplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      console.log('✅ .env.example already updated');
    }
    
    console.log('\n✨ AI setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Add GROQ_API_KEY to .env.local');
    console.log('   2. Set AI_PROVIDER=groq in .env.local');
    console.log('   3. Run: npm run test-groq');
    console.log('   4. Run: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_MODELS_CONFIG,
  createDirectoryIfNotExists,
  writeConfigFile
};