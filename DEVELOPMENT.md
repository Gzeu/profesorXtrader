# ProfessorXTrader - Development Guide

## 🚀 Quick Start

### Prerequisites (2025 Enhanced)
- Node.js 18.17.0+ (required for TensorFlow.js support)
- npm 9.0.0+ or yarn
- Binance account with API keys (microsecond support)
- Minimum 4GB RAM (for ML models)

### Installation

```bash
# Clone repository
git clone https://github.com/Gzeu/profesorXtrader.git
cd profesorXtrader

# Install dependencies (including AI/ML packages)
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Binance API keys

# Setup AI models (new in v0.2.0)
npm run ai-setup

# Test Binance connection
npm run test-api

# Run development server
npm run dev
```

## 🎯 Immediate Next Steps

### 🔥 Priority 1: AI Implementation ([GPZ-32](https://linear.app/gpz/issue/GPZ-32))

**Start immediately with:**

1. **TensorFlow.js Setup** (Day 1-2)
   ```bash
   # Install TensorFlow.js dependencies
   npm install @tensorflow/tfjs @tensorflow/tfjs-node
   
   # Create AI utilities structure
   mkdir -p src/lib/ai/{models,utils,training}
   mkdir -p src/components/ai
   mkdir -p src/hooks/ai
   ```

2. **Basic Neural Network Foundation** (Day 3-5)
   ```typescript
   // src/lib/ai/models/sentiment-model.ts
   import * as tf from '@tensorflow/tfjs';
   
   export class SentimentModel {
     private model: tf.LayersModel | null = null;
     
     async loadModel() {
       // Load pre-trained model or create new one
     }
     
     async analyzeSentiment(data: number[]): Promise<number> {
       // Implement sentiment analysis
     }
   }
   ```

3. **Market Data Processing** (Day 6-10)
   - Integrate with existing Binance data streams
   - Create data preprocessing pipeline
   - Implement pattern recognition algorithms

### 📈 Priority 2: TradingView Integration ([GPZ-31](https://linear.app/gpz/issue/GPZ-31))

**After AI foundation (Week 2-3):**

1. **Install TradingView Library**
   ```bash
   npm install tradingview-charting-library
   ```

2. **Create Chart Component**
   ```typescript
   // src/components/charts/TradingViewChart.tsx
   import { useEffect, useRef } from 'react';
   
   export function TradingViewChart({ symbol, interval }) {
     // Implement TradingView widget
   }
   ```

## 🛠 Development Workflow

### Linear Integration

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/GPZ-32-ai-implementation
   ```

2. **Update Linear Task Status**
   - Move from "Backlog" to "In Progress"
   - Add time estimates and progress updates
   - Link commits to Linear issue

3. **Commit Convention**
   ```bash
   git commit -m "feat(ai): implement sentiment analysis core
   
   - Add TensorFlow.js sentiment model
   - Create data preprocessing pipeline
   - Integrate with Binance market data
   
   Closes GPZ-32"
   ```

### Code Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/ai/             # AI API endpoints (NEW)
│   ├── api/binance/        # Binance API endpoints
│   └── api/indicators/     # Technical indicators (NEW)
├── components/             # React components
│   ├── ai/                 # AI-related components (NEW)
│   ├── charts/             # TradingView integration (NEW)
│   └── indicators/         # Technical indicators UI (NEW)
├── hooks/                  # Custom React hooks
│   ├── useAI.ts           # AI features hooks (NEW)
│   └── useIndicators.ts   # Technical indicators (NEW)
├── lib/                    # Utility libraries
│   ├── ai/                 # AI & ML utilities (NEW)
│   ├── indicators/         # Technical analysis (NEW)
│   └── binance-client.ts   # Enhanced Binance client
└── types/                  # TypeScript definitions
    ├── ai.ts              # AI types (NEW)
    └── indicators.ts      # Technical indicators (NEW)
```

## 🧪 Testing Strategy

### Unit Tests
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### AI Model Testing
```typescript
// src/lib/ai/__tests__/sentiment-model.test.ts
import { SentimentModel } from '../models/sentiment-model';

describe('SentimentModel', () => {
  it('should analyze market sentiment correctly', async () => {
    const model = new SentimentModel();
    await model.loadModel();
    
    const sentiment = await model.analyzeSentiment([...]);
    expect(sentiment).toBeGreaterThanOrEqual(0);
    expect(sentiment).toBeLessThanOrEqual(1);
  });
});
```

### Integration Tests
- Test Binance API integration
- Test WebSocket connections
- Test AI model predictions with real data

## 🚀 Deployment

### Vercel Setup
1. Connect GitHub repository to Vercel
2. Add environment variables:
   ```
   BINANCE_API_KEY=your_key
   BINANCE_SECRET_KEY=your_secret
   ENABLE_AI_FEATURES=true
   TENSORFLOW_BACKEND=cpu
   ```
3. Deploy automatically on push to main

### Environment Variables
```bash
# .env.local
BINANCE_API_KEY=your_api_key_here
BINANCE_SECRET_KEY=your_secret_key_here
BINANCE_TESTNET=false

# New in v0.2.0
ENABLE_AI_FEATURES=true
TENSORFLOW_BACKEND=webgl
SENTIMENT_API_KEY=optional_key_here
```

## 📊 Performance Optimization

### AI Models
- Use WebGL backend for better performance
- Implement model caching
- Optimize data preprocessing

### WebSocket Optimization
- Implement connection pooling
- Use compression for data streams
- Add latency monitoring

### Bundle Optimization
- Code splitting for AI components
- Lazy loading for heavy libraries
- Service worker for offline functionality

## 🔧 Debugging

### AI Development
```typescript
// Enable TensorFlow.js debugging
import * as tf from '@tensorflow/tfjs';
tf.ENV.set('DEBUG', true);

// Log model performance
console.log('Model prediction time:', performance.now() - startTime);
```

### WebSocket Debugging
```typescript
// Enable WebSocket debugging
const ws = new WebSocket(url);
ws.addEventListener('open', () => console.log('WebSocket connected'));
ws.addEventListener('error', (error) => console.error('WebSocket error:', error));
```

## 📅 Sprint Planning

### Current Sprint (Week 38-40)
- [x] Project management setup
- [ ] Start GPZ-32: AI Implementation
- [ ] TensorFlow.js foundation
- [ ] Basic sentiment analysis

### Next Sprint (Week 41-43)
- [ ] Complete AI sentiment analysis
- [ ] Pattern recognition algorithms
- [ ] Start GPZ-31: TradingView integration

### Future Sprints
- [ ] WebSocket μs precision (GPZ-33)
- [ ] Portfolio performance tracking (GPZ-34)
- [ ] Testing and optimization

## 📝 Documentation

### Code Documentation
- Use JSDoc for all functions
- Document AI model parameters
- Include usage examples

### API Documentation
- Document all API endpoints
- Include request/response examples
- Add error handling documentation

---

**Ready to start?** Begin with [GPZ-32 - AI Implementation](https://linear.app/gpz/issue/GPZ-32) 🚀

**Questions?** Check the [Project Management](docs/PROJECT_MANAGEMENT.md) documentation.

**Last Updated:** September 21, 2025