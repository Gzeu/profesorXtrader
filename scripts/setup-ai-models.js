#!/usr/bin/env node

/**
 * ProfesorXTrader - AI Models Setup Script
 * This script handles the initialization and configuration of AI models for trading analysis
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const AI_CONFIG_DIR = path.join(process.cwd(), 'config', 'ai');
const MODELS_CONFIG_FILE = path.join(AI_CONFIG_DIR, 'models.json');
const TENSORFLOW_MODELS_DIR = path.join(process.cwd(), 'public', 'models');

// Default AI Models Configuration
const DEFAULT_MODELS_CONFIG = {
  tensorflow: {
    pricePredictor: {
      name: 'LSTM Price Predictor',
      url: 'https://storage.googleapis.com/tfjs-models/tfjs/price-predictor/model.json',
      localPath: path.join(TENSORFLOW_MODELS_DIR, 'price-predictor'),
      version: '1.0.0',
      enabled: true
    },
    sentimentAnalyzer: {
      name: 'Sentiment Analysis Model',
      url: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment-analysis/model.json',
      localPath: path.join(TENSORFLOW_MODELS_DIR, 'sentiment-analyzer'),
      version: '1.0.0',
      enabled: true
    },
    technicalIndicator: {
      name: 'Technical Indicators Predictor',
      url: 'https://storage.googleapis.com/tfjs-models/tfjs/technical-indicators/model.json',
      localPath: path.join(TENSORFLOW_MODELS_DIR, 'technical-indicators'),
      version: '1.0.0',
      enabled: false // Will be implemented later
    }
  },
  apis: {
    openai: {
      enabled: false,
      model: 'gpt-3.5-turbo',
      maxTokens: 1000
    },
    anthropic: {
      enabled: false,
      model: 'claude-3-sonnet-20240229',
      maxTokens: 1000
    },
    groq: {
      enabled: true,
      model: 'llama3-8b-8192',
      maxTokens: 1000
    }
  },
  settings: {
    cacheDuration: 3600000, // 1 hour in milliseconds
    batchSize: 100,
    maxConcurrentRequests: 5,
    retryAttempts: 3,
    retryDelay: 1000
  }
};

// Utility functions
function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  }
}

function writeConfigFile(configPath, config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✓ Configuration saved to: ${configPath}`);
  } catch (error) {
    console.error(`✗ Failed to write config file: ${error.message}`);
    throw error;
  }
}

async function downloadModel(modelConfig, modelName) {
  if (!modelConfig.enabled) {
    console.log(`⏭ Skipping disabled model: ${modelName}`);
    return;
  }

  try {
    console.log(`📦 Downloading model: ${modelConfig.name}...`);
    
    // Create local directory
    createDirectoryIfNotExists(modelConfig.localPath);
    
    // For now, we'll just create a placeholder since actual TensorFlow models
    // would require specific training data and infrastructure
    const placeholderModel = {
      name: modelConfig.name,
      version: modelConfig.version,
      status: 'placeholder',
      description: 'This is a placeholder model configuration. Replace with actual trained model.',
      inputShape: [null, 60, 5], // Example: 60 time steps, 5 features (OHLCV)
      outputShape: [null, 1], // Example: 1 prediction value
      created: new Date().toISOString()
    };
    
    const modelFilePath = path.join(modelConfig.localPath, 'model.json');
    fs.writeFileSync(modelFilePath, JSON.stringify(placeholderModel, null, 2));
    
    console.log(`✓ Model placeholder created: ${modelConfig.name}`);
    
  } catch (error) {
    console.error(`✗ Failed to download model ${modelName}: ${error.message}`);
    throw error;
  }
}

function validateEnvironment() {
  console.log('🔍 Validating environment...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.warn(`⚠ Node.js version ${nodeVersion} detected. Recommended: >= 18.x`);
  } else {
    console.log(`✓ Node.js version: ${nodeVersion}`);
  }
  
  // Check required directories
  const requiredDirs = [
    path.join(process.cwd(), 'config'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'src')
  ];
  
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`📁 Creating required directory: ${dir}`);
      createDirectoryIfNotExists(dir);
    } else {
      console.log(`✓ Directory exists: ${dir}`);
    }
  });
}

function checkEnvironmentVariables() {
  console.log('🔑 Checking environment variables...');
  
  const requiredEnvVars = [
    'BINANCE_API_KEY',
    'BINANCE_SECRET_KEY',
    'NEXT_PUBLIC_BINANCE_API_URL'
  ];
  
  const optionalEnvVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GROQ_API_KEY'
  ];
  
  // Check required variables
  const missingRequired = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingRequired.length > 0) {
    console.warn(`⚠ Missing required environment variables: ${missingRequired.join(', ')}`);
    console.log('  Create a .env.local file with these variables for full functionality.');
  } else {
    console.log('✓ All required environment variables are set');
  }
  
  // Check optional variables
  const missingOptional = optionalEnvVars.filter(envVar => !process.env[envVar]);
  if (missingOptional.length > 0) {
    console.log(`ℹ Optional environment variables not set: ${missingOptional.join(', ')}`);
    console.log('  These are needed for specific AI features.');
  }
}

async function main() {
  console.log('🚀 ProfesorXTrader - AI Models Setup');
  console.log('=====================================');
  
  try {
    // Step 1: Validate environment
    validateEnvironment();
    
    // Step 2: Check environment variables
    checkEnvironmentVariables();
    
    // Step 3: Create configuration directories
    createDirectoryIfNotExists(AI_CONFIG_DIR);
    createDirectoryIfNotExists(TENSORFLOW_MODELS_DIR);
    
    // Step 4: Write configuration file
    writeConfigFile(MODELS_CONFIG_FILE, DEFAULT_MODELS_CONFIG);
    
    // Step 5: Download/setup models
    console.log('\n🧠 Setting up AI models...');
    const models = DEFAULT_MODELS_CONFIG.tensorflow;
    
    for (const [modelName, modelConfig] of Object.entries(models)) {
      await downloadModel(modelConfig, modelName);
    }
    
    // Step 6: Create example environment file if it doesn't exist
    const envExamplePath = path.join(process.cwd(), '.env.example');
    if (!fs.existsSync(envExamplePath)) {
      const envExample = `# Binance API Configuration (Required)
BINANCE_API_KEY=your_binance_api_key_here
BINANCE_SECRET_KEY=your_binance_secret_key_here
NEXT_PUBLIC_BINANCE_API_URL=https://api.binance.com

# AI API Keys (Optional)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Application Settings
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
`;
      fs.writeFileSync(envExamplePath, envExample);
      console.log('✓ Created .env.example file');
    }
    
    console.log('\n✅ AI models setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Copy .env.example to .env.local and fill in your API keys');
    console.log('   2. Run `npm run test-api` to verify Binance connection');
    console.log('   3. Run `npm run dev` to start the development server');
    console.log('\n💡 For production use, replace placeholder models with trained models.');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_MODELS_CONFIG,
  createDirectoryIfNotExists,
  writeConfigFile,
  validateEnvironment
};