/**
 * ProfesorXTrader - Advanced Trading Performance Tracking System
 * Phase 4 Implementation - Real-time Trading Analytics & Performance Monitoring
 * 
 * Features:
 * - Real-time P&L tracking
 * - Risk metrics calculation
 * - AI model accuracy monitoring
 * - Portfolio performance analysis
 * - Sharpe ratio & drawdown tracking
 * - Trade execution analytics
 */

import { EventEmitter } from 'events';

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  status: 'filled' | 'partially_filled' | 'cancelled' | 'pending';
  fees: number;
  metadata?: {
    aiRecommendation?: boolean;
    confidence?: number;
    strategy?: string;
    timeframe?: string;
  };
}

interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  openTime: Date;
  roi: number;
  riskAmount: number;
}

interface PerformanceMetrics {
  totalPnL: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  currentDrawdown: number;
  averageHoldTime: number;
  returnOnInvestment: number;
  volatility: number;
  calmarRatio: number;
  sortinoRatio: number;
}

interface AIModelPerformance {
  modelType: 'price_prediction' | 'pattern_detection' | 'sentiment_analysis';
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  precisionScore: number;
  recallScore: number;
  f1Score: number;
  averageConfidence: number;
  profitableRecommendations: number;
  recommendationProfitability: number;
  modelVersion: string;
  lastUpdated: Date;
}

interface RiskMetrics {
  portfolioValue: number;
  maxRiskPerTrade: number;
  currentRiskExposure: number;
  riskPercentage: number;
  valueAtRisk: number; // VaR
  expectedShortfall: number; // ES/CVaR
  beta: number;
  correlation: Map<string, number>;
  leverageRatio: number;
}

class TradingPerformanceTracker extends EventEmitter {
  private trades: Map<string, Trade> = new Map();
  private positions: Map<string, Position> = new Map();
  private dailyPnL: Map<string, number> = new Map(); // date -> PnL
  private aiModelPerformance: Map<string, AIModelPerformance> = new Map();
  private portfolioHistory: Array<{timestamp: Date, value: number}> = [];
  private initialCapital: number = 10000; // Default starting capital
  private currentCapital: number = 10000;

  constructor(initialCapital?: number) {
    super();
    if (initialCapital) {
      this.initialCapital = initialCapital;
      this.currentCapital = initialCapital;
    }
    this.startPerformanceTracking();
  }

  /**
   * Initialize performance tracking
   */
  private startPerformanceTracking(): void {
    // Update portfolio value every minute
    setInterval(() => {
      this.updatePortfolioValue();
    }, 60000);

    // Calculate daily metrics
    setInterval(() => {
      this.calculateDailyMetrics();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  /**
   * Record a new trade
   */
  recordTrade(trade: Omit<Trade, 'id'>): string {
    const tradeId = this.generateTradeId();
    const fullTrade: Trade = {
      ...trade,
      id: tradeId
    };

    this.trades.set(tradeId, fullTrade);
    this.updatePositions(fullTrade);
    this.emit('trade_recorded', fullTrade);
    
    return tradeId;
  }

  /**
   * Update positions based on trade
   */
  private updatePositions(trade: Trade): void {
    let position = this.positions.get(trade.symbol);
    
    if (!position) {
      // Create new position
      position = {
        symbol: trade.symbol,
        side: trade.side === 'BUY' ? 'LONG' : 'SHORT',
        size: trade.side === 'BUY' ? trade.quantity : -trade.quantity,
        entryPrice: trade.price,
        currentPrice: trade.price,
        unrealizedPnL: 0,
        realizedPnL: 0,
        openTime: trade.timestamp,
        roi: 0,
        riskAmount: trade.quantity * trade.price * 0.02 // 2% risk default
      };
    } else {
      // Update existing position
      const oldSize = position.size;
      const tradeSize = trade.side === 'BUY' ? trade.quantity : -trade.quantity;
      const newSize = oldSize + tradeSize;
      
      if (Math.sign(oldSize) !== Math.sign(newSize) && oldSize !== 0) {
        // Position reversal or closure
        const closedSize = Math.min(Math.abs(oldSize), Math.abs(tradeSize));
        const realizedPnL = closedSize * (trade.price - position.entryPrice) * Math.sign(oldSize);
        position.realizedPnL += realizedPnL;
        this.currentCapital += realizedPnL;
      }
      
      if (newSize === 0) {
        // Position closed
        this.positions.delete(trade.symbol);
        return;
      } else {
        // Update position
        if (Math.sign(oldSize) === Math.sign(tradeSize)) {
          // Adding to position
          position.entryPrice = (position.entryPrice * Math.abs(oldSize) + trade.price * Math.abs(tradeSize)) / (Math.abs(oldSize) + Math.abs(tradeSize));
        }
        position.size = newSize;
        position.side = newSize > 0 ? 'LONG' : 'SHORT';
      }
    }
    
    this.positions.set(trade.symbol, position);
  }

  /**
   * Update current prices and unrealized P&L
   */
  updateMarketPrices(prices: Map<string, number>): void {
    this.positions.forEach((position, symbol) => {
      const currentPrice = prices.get(symbol);
      if (currentPrice) {
        position.currentPrice = currentPrice;
        position.unrealizedPnL = position.size * (currentPrice - position.entryPrice);
        position.roi = (position.unrealizedPnL / (Math.abs(position.size) * position.entryPrice)) * 100;
      }
    });
    
    this.emit('positions_updated', Array.from(this.positions.values()));
  }

  /**
   * Record AI model prediction and outcome
   */
  recordAIPrediction(prediction: {
    modelType: AIModelPerformance['modelType'];
    symbol: string;
    prediction: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    actualOutcome?: 'correct' | 'incorrect';
    profitLoss?: number;
    modelVersion?: string;
  }): void {
    const modelKey = prediction.modelType;
    let modelPerf = this.aiModelPerformance.get(modelKey);
    
    if (!modelPerf) {
      modelPerf = {
        modelType: prediction.modelType,
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0,
        precisionScore: 0,
        recallScore: 0,
        f1Score: 0,
        averageConfidence: 0,
        profitableRecommendations: 0,
        recommendationProfitability: 0,
        modelVersion: prediction.modelVersion || '1.0.0',
        lastUpdated: new Date()
      };
    }
    
    modelPerf.totalPredictions++;
    
    if (prediction.actualOutcome === 'correct') {
      modelPerf.correctPredictions++;
    }
    
    if (prediction.profitLoss && prediction.profitLoss > 0) {
      modelPerf.profitableRecommendations++;
    }
    
    // Update metrics
    modelPerf.accuracy = (modelPerf.correctPredictions / modelPerf.totalPredictions) * 100;
    modelPerf.averageConfidence = this.calculateMovingAverage(
      modelPerf.averageConfidence,
      prediction.confidence,
      modelPerf.totalPredictions
    );
    
    modelPerf.lastUpdated = new Date();
    this.aiModelPerformance.set(modelKey, modelPerf);
    
    this.emit('ai_prediction_recorded', { prediction, performance: modelPerf });
  }

  /**
   * Calculate comprehensive performance metrics
   */
  calculatePerformanceMetrics(): PerformanceMetrics {
    const trades = Array.from(this.trades.values());
    const filledTrades = trades.filter(t => t.status === 'filled');
    
    // Calculate basic metrics
    const totalPnL = this.calculateTotalPnL();
    const realizedPnL = this.calculateRealizedPnL();
    const unrealizedPnL = this.calculateUnrealizedPnL();
    
    // Trade statistics
    const totalTrades = filledTrades.length;
    const profitableTrades = this.getProfitableTrades();
    const winningTrades = profitableTrades.length;
    const losingTrades = totalTrades - winningTrades;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    // Average win/loss
    const averageWin = winningTrades > 0 
      ? profitableTrades.reduce((sum, trade) => sum + this.getTradePnL(trade), 0) / winningTrades 
      : 0;
    
    const losingTradesList = this.getLosingTrades();
    const averageLoss = losingTrades > 0
      ? Math.abs(losingTradesList.reduce((sum, trade) => sum + this.getTradePnL(trade), 0) / losingTrades)
      : 0;
    
    // Advanced metrics
    const profitFactor = averageLoss > 0 ? (averageWin * winningTrades) / (averageLoss * losingTrades) : 0;
    const sharpeRatio = this.calculateSharpeRatio();
    const maxDrawdown = this.calculateMaxDrawdown();
    const currentDrawdown = this.calculateCurrentDrawdown();
    const averageHoldTime = this.calculateAverageHoldTime();
    const returnOnInvestment = ((this.currentCapital - this.initialCapital) / this.initialCapital) * 100;
    const volatility = this.calculateVolatility();
    const calmarRatio = maxDrawdown > 0 ? returnOnInvestment / maxDrawdown : 0;
    const sortinoRatio = this.calculateSortinoRatio();
    
    return {
      totalPnL,
      realizedPnL,
      unrealizedPnL,
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averageWin,
      averageLoss,
      profitFactor,
      sharpeRatio,
      maxDrawdown,
      currentDrawdown,
      averageHoldTime,
      returnOnInvestment,
      volatility,
      calmarRatio,
      sortinoRatio
    };
  }

  /**
   * Calculate current risk metrics
   */
  calculateRiskMetrics(): RiskMetrics {
    const portfolioValue = this.currentCapital;
    const maxRiskPerTrade = portfolioValue * 0.02; // 2% max risk per trade
    const currentRiskExposure = this.calculateCurrentRiskExposure();
    const riskPercentage = (currentRiskExposure / portfolioValue) * 100;
    
    return {
      portfolioValue,
      maxRiskPerTrade,
      currentRiskExposure,
      riskPercentage,
      valueAtRisk: this.calculateVaR(),
      expectedShortfall: this.calculateES(),
      beta: this.calculateBeta(),
      correlation: this.calculateCorrelations(),
      leverageRatio: this.calculateLeverageRatio()
    };
  }

  /**
   * Get AI model performance summary
   */
  getAIModelPerformance(): Map<string, AIModelPerformance> {
    return new Map(this.aiModelPerformance);
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): {
    summary: PerformanceMetrics;
    aiPerformance: Array<AIModelPerformance>;
    riskMetrics: RiskMetrics;
    recentTrades: Trade[];
    positions: Position[];
    recommendations: string[];
  } {
    const summary = this.calculatePerformanceMetrics();
    const aiPerformance = Array.from(this.aiModelPerformance.values());
    const riskMetrics = this.calculateRiskMetrics();
    const recentTrades = this.getRecentTrades(10);
    const positions = Array.from(this.positions.values());
    const recommendations = this.generateRecommendations(summary, riskMetrics);
    
    return {
      summary,
      aiPerformance,
      riskMetrics,
      recentTrades,
      positions,
      recommendations
    };
  }

  // Private calculation methods
  private generateTradeId(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateTotalPnL(): number {
    return this.calculateRealizedPnL() + this.calculateUnrealizedPnL();
  }

  private calculateRealizedPnL(): number {
    return Array.from(this.positions.values())
      .reduce((sum, pos) => sum + pos.realizedPnL, 0);
  }

  private calculateUnrealizedPnL(): number {
    return Array.from(this.positions.values())
      .reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  }

  private getProfitableTrades(): Trade[] {
    return Array.from(this.trades.values())
      .filter(trade => this.getTradePnL(trade) > 0);
  }

  private getLosingTrades(): Trade[] {
    return Array.from(this.trades.values())
      .filter(trade => this.getTradePnL(trade) < 0);
  }

  private getTradePnL(trade: Trade): number {
    // Simplified - in reality would need more complex calculation
    return 0; // Placeholder
  }

  private calculateSharpeRatio(): number {
    const returns = this.calculateDailyReturns();
    if (returns.length < 2) return 0;
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized
  }

  private calculateMaxDrawdown(): number {
    let maxDrawdown = 0;
    let peak = this.initialCapital;
    
    this.portfolioHistory.forEach(record => {
      if (record.value > peak) {
        peak = record.value;
      }
      const drawdown = (peak - record.value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    return maxDrawdown * 100;
  }

  private calculateCurrentDrawdown(): number {
    const peak = Math.max(...this.portfolioHistory.map(h => h.value));
    const currentValue = this.currentCapital;
    return peak > 0 ? ((peak - currentValue) / peak) * 100 : 0;
  }

  private calculateAverageHoldTime(): number {
    const filledTrades = Array.from(this.trades.values())
      .filter(t => t.status === 'filled');
    
    if (filledTrades.length < 2) return 0;
    
    // Simplified calculation
    return 24; // 24 hours average (placeholder)
  }

  private calculateVolatility(): number {
    const returns = this.calculateDailyReturns();
    if (returns.length < 2) return 0;
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance * 252) * 100; // Annualized volatility in %
  }

  private calculateSortinoRatio(): number {
    const returns = this.calculateDailyReturns();
    const negativeReturns = returns.filter(r => r < 0);
    
    if (negativeReturns.length === 0) return 0;
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const downwardDeviation = Math.sqrt(
      negativeReturns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / negativeReturns.length
    );
    
    return downwardDeviation > 0 ? (avgReturn / downwardDeviation) * Math.sqrt(252) : 0;
  }

  private calculateDailyReturns(): number[] {
    const returns: number[] = [];
    
    for (let i = 1; i < this.portfolioHistory.length; i++) {
      const prev = this.portfolioHistory[i - 1].value;
      const current = this.portfolioHistory[i].value;
      if (prev > 0) {
        returns.push((current - prev) / prev);
      }
    }
    
    return returns;
  }

  private calculateCurrentRiskExposure(): number {
    return Array.from(this.positions.values())
      .reduce((sum, pos) => sum + pos.riskAmount, 0);
  }

  private calculateVaR(confidenceLevel: number = 0.95): number {
    const returns = this.calculateDailyReturns();
    if (returns.length === 0) return 0;
    
    returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * returns.length);
    return Math.abs(returns[index] || 0) * this.currentCapital;
  }

  private calculateES(confidenceLevel: number = 0.95): number {
    const returns = this.calculateDailyReturns();
    if (returns.length === 0) return 0;
    
    returns.sort((a, b) => a - b);
    const cutoff = Math.floor((1 - confidenceLevel) * returns.length);
    const tailReturns = returns.slice(0, cutoff);
    
    if (tailReturns.length === 0) return 0;
    
    const avgTailReturn = tailReturns.reduce((a, b) => a + b, 0) / tailReturns.length;
    return Math.abs(avgTailReturn) * this.currentCapital;
  }

  private calculateBeta(): number {
    // Simplified - would need market benchmark data
    return 1.0;
  }

  private calculateCorrelations(): Map<string, number> {
    // Simplified - would calculate correlations between positions
    return new Map();
  }

  private calculateLeverageRatio(): number {
    const totalPositionValue = Array.from(this.positions.values())
      .reduce((sum, pos) => sum + Math.abs(pos.size * pos.currentPrice), 0);
    
    return this.currentCapital > 0 ? totalPositionValue / this.currentCapital : 0;
  }

  private updatePortfolioValue(): void {
    const totalValue = this.currentCapital + this.calculateUnrealizedPnL();
    this.portfolioHistory.push({
      timestamp: new Date(),
      value: totalValue
    });
    
    // Keep only last 365 days of history
    if (this.portfolioHistory.length > 365) {
      this.portfolioHistory = this.portfolioHistory.slice(-365);
    }
  }

  private calculateDailyMetrics(): void {
    const today = new Date().toISOString().split('T')[0];
    const todayPnL = this.calculateTotalPnL();
    this.dailyPnL.set(today, todayPnL);
  }

  private calculateMovingAverage(current: number, newValue: number, count: number): number {
    return ((current * (count - 1)) + newValue) / count;
  }

  private getRecentTrades(count: number): Trade[] {
    return Array.from(this.trades.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }

  private generateRecommendations(metrics: PerformanceMetrics, risk: RiskMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.winRate < 40) {
      recommendations.push('Consider reviewing your trading strategy - win rate is below 40%');
    }
    
    if (risk.riskPercentage > 10) {
      recommendations.push('Risk exposure is high - consider reducing position sizes');
    }
    
    if (metrics.sharpeRatio < 1) {
      recommendations.push('Sharpe ratio is low - focus on risk-adjusted returns');
    }
    
    if (metrics.maxDrawdown > 20) {
      recommendations.push('Max drawdown is significant - implement better risk management');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const tradingPerformanceTracker = new TradingPerformanceTracker();
export default TradingPerformanceTracker;
export type { Trade, Position, PerformanceMetrics, AIModelPerformance, RiskMetrics };