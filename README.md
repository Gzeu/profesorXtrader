# 🚀 ProfesorXTrader

**AI-Powered Cryptocurrency Trading Dashboard & Portfolio Management System**

[![CI/CD Pipeline](https://github.com/Gzeu/profesorXtrader/workflows/CI/CD%20Pipeline%20-%20ProfessorXTrader/badge.svg)](https://github.com/Gzeu/profesorXtrader/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.33-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.10-38B2AC)](https://tailwindcss.com/)

## ✨ Features

### 🎯 **Core Trading Features**
- **Real-time Portfolio Tracking** - Monitor your cryptocurrency holdings with live market data
- **Advanced Analytics** - Comprehensive performance metrics, P&L tracking, and risk analysis
- **AI-Powered Analysis** - Machine learning models for price prediction and market sentiment
- **Interactive Charts** - Technical indicators, pattern recognition, and visual analysis tools
- **Live Market Feed** - Real-time price updates and market news integration
- **Risk Management** - Advanced risk metrics including VaR, Sharpe ratio, and drawdown analysis

### 🛠 **Technical Architecture**
- **Next.js 14** with App Router for modern React development
- **TypeScript** for type-safe development
- **Tailwind CSS** + **Radix UI** for beautiful, accessible components
- **TensorFlow.js** for client-side AI model execution
- **Binance API** integration for real-time market data
- **WebSocket** connections for live updates
- **Comprehensive Testing** with Jest and React Testing Library

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.0.0
- npm ≥ 8.0.0
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Gzeu/profesorXtrader.git
cd profesorXtrader

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Binance API Configuration
NEXT_PUBLIC_BINANCE_API_KEY=your_binance_api_key
NEXT_PUBLIC_BINANCE_SECRET_KEY=your_binance_secret_key
NEXT_PUBLIC_BINANCE_TESTNET=true

# AI & Analytics
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_FOUR_MEME_REF_CODE=your_referral_code

# Application Settings
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 📱 Application Structure

### Pages & Navigation
- **Dashboard** (`/`) - Overview of portfolio, recent trades, and key metrics
- **Charts** (`/charts`) - Advanced charting with technical indicators
- **Trading** (`/trading`) - Execute trades and manage positions  
- **AI Analysis** (`/ai-analysis`) - AI predictions and market insights
- **Portfolio** (`/portfolio`) - Asset allocation and performance tracking
- **Live Feed** (`/live-feed`) - Real-time market data and news
- **Settings** (`/settings`) - User preferences and configuration

### Key Components
```
src/
├── services/
│   ├── analytics/          # Trading performance & user analytics
│   ├── binance/           # Binance API integration
│   ├── ai/               # AI model services
│   └── websocket/        # Real-time data connections
├── components/
│   ├── layout/           # Navigation and layout components
│   ├── ui/              # Reusable UI components
│   └── trading/         # Trading-specific components
app/
├── api/                 # Next.js API routes
├── (dashboard)/         # Main application pages
└── globals.css         # Global styles
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Project Standards
- **ESLint** + **Prettier** for code formatting
- **TypeScript** strict mode enabled
- **Conventional Commits** for version control
- **Automated testing** with comprehensive coverage
- **CI/CD pipeline** with GitHub Actions

## 🧠 AI & Machine Learning Features

### Implemented Models
- **Price Prediction** - LSTM neural networks for short-term price forecasting
- **Pattern Detection** - Technical pattern recognition using computer vision
- **Sentiment Analysis** - News and social media sentiment for market insights
- **Risk Assessment** - Portfolio optimization and risk management algorithms

### Model Performance Tracking
- Real-time accuracy monitoring
- A/B testing for model improvements
- Performance metrics (precision, recall, F1-score)
- Recommendation profitability analysis

## 📊 Trading Analytics

### Performance Metrics
- **P&L Tracking** - Realized and unrealized profits/losses
- **Risk Metrics** - VaR, Expected Shortfall, Beta, Correlation
- **Performance Ratios** - Sharpe, Sortino, Calmar ratios
- **Trade Statistics** - Win rate, average win/loss, profit factor
- **Drawdown Analysis** - Maximum and current drawdown tracking

### User Behavior Analytics
- Session tracking and user journey optimization
- Feature usage heat maps
- Performance monitoring (page load, API response times)
- A/B testing framework for UI improvements

## 🔒 Security & Best Practices

- **API Key Management** - Secure storage and rotation
- **Rate Limiting** - Protection against API abuse
- **Input Validation** - Comprehensive data validation
- **Error Handling** - Graceful error recovery
- **CORS Configuration** - Secure cross-origin requests
- **Environment Separation** - Development/staging/production configs

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel
```

### Docker
```bash
# Build Docker image
docker build -t profesorxtrader .

# Run container
docker run -p 3000:3000 profesorxtrader
```

## 🧪 Testing

- **Unit Tests** - Components and utility functions
- **Integration Tests** - API routes and services
- **E2E Tests** - Complete user workflows
- **Performance Tests** - Load testing for API endpoints

## 📈 Performance Optimization

- **Next.js Optimizations** - Image optimization, code splitting
- **Bundle Analysis** - Webpack bundle optimization
- **Caching Strategy** - API response caching and static generation
- **CDN Integration** - Asset delivery optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Binance API** - Cryptocurrency market data
- **TensorFlow.js** - Machine learning capabilities
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Next.js** - React application framework

## 📞 Support

For support and questions:
- **GitHub Issues** - [Create an issue](https://github.com/Gzeu/profesorXtrader/issues)
- **Email** - pricopgeorge@gmail.com
- **Documentation** - [Wiki](https://github.com/Gzeu/profesorXtrader/wiki)

---

**ProfesorXTrader** - Empowering traders with AI-driven insights and professional-grade analytics. 📈🤖