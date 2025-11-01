/**
 * 📊 ProfesorXTrader - Price Aggregator Service
 * Advanced cross-chain price aggregation with anomaly detection
 * Combines data from multiple sources for accurate pricing
 * Version: 2.1.0
 */

import { EventEmitter } from 'events';
import { PriceData } from './WebSocketManager';

interface AggregatedPrice {
  symbol: string;
  price: number;
  confidence: number;
  sources: string[];
  volume24h: number;
  change24h: number;
  changePercent24h: number;
  timestamp: number;
  vwap: number; // Volume Weighted Average Price
  spread: number; // Price spread across sources
  outliers: string[]; // Sources flagged as outliers
}

interface PriceSource {
  source: string;
  weight: number;
  reliability: number;
  latency: number;
  lastUpdate: number;
}

interface AggregationConfig {
  minSources: number;
  maxSpreadPercent: number;
  outlierThreshold: number;
  staleDataThreshold: number; // milliseconds
  volumeWeightFactor: number;
}

class PriceAggregator extends EventEmitter {
  private priceHistory: Map<string, PriceData[]> = new Map();
  private sourcesReliability: Map<string, PriceSource> = new Map();
  private aggregationCache: Map<string, AggregatedPrice> = new Map();
  private historyLimit = 100;
  
  private config: AggregationConfig = {
    minSources: 2,
    maxSpreadPercent: 5.0, // 5% max spread
    outlierThreshold: 2.0, // Standard deviations
    staleDataThreshold: 60000, // 1 minute
    volumeWeightFactor: 0.7
  };

  // Source weights and reliability scores
  private defaultSources: Map<string, PriceSource> = new Map([
    ['binance', { source: 'binance', weight: 1.0, reliability: 0.98, latency: 0, lastUpdate: 0 }],
    ['coingecko', { source: 'coingecko', weight: 0.8, reliability: 0.92, latency: 0, lastUpdate: 0 }],
    ['multiversx', { source: 'multiversx', weight: 0.6, reliability: 0.85, latency: 0, lastUpdate: 0 }]
  ]);

  constructor(config?: Partial<AggregationConfig>) {
    super();
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initializeSources();
    this.startPerformanceMonitoring();
  }

  /**
   * 🔄 Initialize source reliability tracking
   */
  private initializeSources() {
    for (const [source, data] of this.defaultSources) {
      this.sourcesReliability.set(source, { ...data });
    }
  }

  /**
   * 📊 Add price data from any source
   */
  addPriceData(priceData: PriceData) {
    const { symbol, source } = priceData;
    const key = symbol.toUpperCase();
    
    // Update source reliability metrics
    this.updateSourceMetrics(source, priceData.timestamp);
    
    // Add to price history
    if (!this.priceHistory.has(key)) {
      this.priceHistory.set(key, []);
    }
    
    const history = this.priceHistory.get(key)!;
    history.push(priceData);
    
    // Keep only recent history
    if (history.length > this.historyLimit) {
      history.splice(0, history.length - this.historyLimit);
    }
    
    // Trigger aggregation
    this.aggregatePrice(key);
  }

  /**
   * 📋 Update source performance metrics
   */
  private updateSourceMetrics(source: string, timestamp: number) {
    const sourceData = this.sourcesReliability.get(source);
    if (sourceData) {
      const now = Date.now();
      const latency = now - timestamp;
      
      // Update latency with exponential moving average
      sourceData.latency = sourceData.latency === 0 ? latency : 
        (sourceData.latency * 0.7) + (latency * 0.3);
      
      sourceData.lastUpdate = now;
      
      // Adjust reliability based on latency
      if (latency > 5000) { // High latency
        sourceData.reliability = Math.max(0.5, sourceData.reliability * 0.98);
      } else if (latency < 1000) { // Low latency
        sourceData.reliability = Math.min(1.0, sourceData.reliability * 1.001);
      }
    }
  }

  /**
   * 📋 Aggregate prices from multiple sources
   */
  private aggregatePrice(symbol: string) {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length === 0) return;
    
    const now = Date.now();
    
    // Get recent prices from each source
    const recentPrices = this.getRecentPricesPerSource(history, now);
    
    if (recentPrices.length < this.config.minSources) {
      // Not enough sources, emit warning
      this.emit('warning', {
        symbol,
        message: `Insufficient sources: ${recentPrices.length}/${this.config.minSources}`,
        sources: recentPrices.map(p => p.source)
      });
      return;
    }
    
    // Detect and remove outliers
    const { cleanPrices, outliers } = this.detectOutliers(recentPrices);
    
    // Calculate aggregated price
    const aggregated = this.calculateAggregatedPrice(symbol, cleanPrices, outliers);
    
    if (aggregated) {
      this.aggregationCache.set(symbol, aggregated);
      this.emit('aggregatedPrice', aggregated);
    }
  }

  /**
   * 🕰️ Get most recent price from each source
   */
  private getRecentPricesPerSource(history: PriceData[], now: number): PriceData[] {
    const sourceMap = new Map<string, PriceData>();
    
    // Get most recent price from each source
    history.forEach(price => {
      if (now - price.timestamp < this.config.staleDataThreshold) {
        const current = sourceMap.get(price.source);
        if (!current || price.timestamp > current.timestamp) {
          sourceMap.set(price.source, price);
        }
      }
    });
    
    return Array.from(sourceMap.values());
  }

  /**
   * 🎯 Detect price outliers using statistical methods
   */
  private detectOutliers(prices: PriceData[]): { cleanPrices: PriceData[], outliers: string[] } {
    if (prices.length < 3) {
      return { cleanPrices: prices, outliers: [] };
    }
    
    const priceValues = prices.map(p => p.price);
    const mean = priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length;
    const stdDev = Math.sqrt(
      priceValues.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / priceValues.length
    );
    
    const outliers: string[] = [];
    const cleanPrices: PriceData[] = [];
    
    prices.forEach(price => {
      const zScore = Math.abs((price.price - mean) / stdDev);
      if (zScore > this.config.outlierThreshold) {
        outliers.push(price.source);
        console.warn(`⚠️ Price outlier detected: ${price.source} - ${price.symbol} at $${price.price} (z-score: ${zScore.toFixed(2)})`);
      } else {
        cleanPrices.push(price);
      }
    });
    
    return { cleanPrices, outliers };
  }

  /**
   * 📋 Calculate weighted aggregated price
   */
  private calculateAggregatedPrice(
    symbol: string, 
    prices: PriceData[], 
    outliers: string[]
  ): AggregatedPrice | null {
    if (prices.length === 0) return null;
    
    let totalWeight = 0;
    let weightedPrice = 0;
    let totalVolume = 0;
    let volumeWeightedPrice = 0;
    
    const priceValues = prices.map(p => p.price);
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const spread = maxPrice > 0 ? ((maxPrice - minPrice) / minPrice) * 100 : 0;
    
    // Check if spread is too high
    if (spread > this.config.maxSpreadPercent) {
      this.emit('warning', {
        symbol,
        message: `High price spread: ${spread.toFixed(2)}%`,
        spread,
        prices: prices.map(p => ({ source: p.source, price: p.price }))
      });
    }
    
    prices.forEach(price => {
      const sourceData = this.sourcesReliability.get(price.source);
      if (!sourceData) return;
      
      // Calculate composite weight (reliability + recency + volume)
      const recencyWeight = this.calculateRecencyWeight(price.timestamp);
      const volumeWeight = price.volume24h / Math.max(1, Math.max(...prices.map(p => p.volume24h)));
      
      const compositeWeight = (
        sourceData.weight * sourceData.reliability * recencyWeight * 0.5 +
        volumeWeight * this.config.volumeWeightFactor * 0.5
      );
      
      weightedPrice += price.price * compositeWeight;
      totalWeight += compositeWeight;
      
      // Volume weighted calculation
      if (price.volume24h > 0) {
        volumeWeightedPrice += price.price * price.volume24h;
        totalVolume += price.volume24h;
      }
    });
    
    const finalPrice = totalWeight > 0 ? weightedPrice / totalWeight : prices[0].price;
    const vwap = totalVolume > 0 ? volumeWeightedPrice / totalVolume : finalPrice;
    
    // Calculate confidence based on sources and spread
    const confidence = this.calculateConfidence(prices.length, spread, outliers.length);
    
    // Calculate average change
    const avgChange24h = prices.reduce((sum, p) => sum + p.change24h, 0) / prices.length;
    const avgChangePercent24h = prices.reduce((sum, p) => sum + p.changePercent24h, 0) / prices.length;
    
    return {
      symbol,
      price: finalPrice,
      confidence,
      sources: prices.map(p => p.source),
      volume24h: totalVolume,
      change24h: avgChange24h,
      changePercent24h: avgChangePercent24h,
      timestamp: Math.max(...prices.map(p => p.timestamp)),
      vwap,
      spread,
      outliers
    };
  }

  /**
   * ⏰ Calculate recency weight (more recent = higher weight)
   */
  private calculateRecencyWeight(timestamp: number): number {
    const now = Date.now();
    const age = now - timestamp;
    const maxAge = this.config.staleDataThreshold;
    
    return Math.max(0.1, 1 - (age / maxAge));
  }

  /**
   * 🎯 Calculate confidence score
   */
  private calculateConfidence(sourceCount: number, spread: number, outlierCount: number): number {
    let confidence = 1.0;
    
    // Reduce confidence based on source count
    if (sourceCount < 3) confidence *= 0.8;
    if (sourceCount < 2) confidence *= 0.6;
    
    // Reduce confidence based on spread
    if (spread > this.config.maxSpreadPercent) {
      confidence *= Math.max(0.3, 1 - (spread / 20));
    }
    
    // Reduce confidence based on outliers
    if (outlierCount > 0) {
      confidence *= Math.max(0.5, 1 - (outlierCount * 0.2));
    }
    
    return Math.max(0.0, Math.min(1.0, confidence));
  }

  /**
   * 📋 Get aggregated price for symbol
   */
  getAggregatedPrice(symbol: string): AggregatedPrice | null {
    return this.aggregationCache.get(symbol.toUpperCase()) || null;
  }

  /**
   * 📊 Get all aggregated prices
   */
  getAllAggregatedPrices(): AggregatedPrice[] {
    return Array.from(this.aggregationCache.values());
  }

  /**
   * 📋 Get price history for symbol
   */
  getPriceHistory(symbol: string, limit?: number): PriceData[] {
    const history = this.priceHistory.get(symbol.toUpperCase()) || [];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * 📋 Get source reliability metrics
   */
  getSourceMetrics(): Map<string, PriceSource> {
    return new Map(this.sourcesReliability);
  }

  /**
   * ⚙️ Update aggregation configuration
   */
  updateConfig(newConfig: Partial<AggregationConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  /**
   * 🧹 Clear old data to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now();
    const maxAge = this.config.staleDataThreshold * 10; // Keep 10x threshold
    
    for (const [symbol, history] of this.priceHistory) {
      const filteredHistory = history.filter(price => now - price.timestamp < maxAge);
      if (filteredHistory.length === 0) {
        this.priceHistory.delete(symbol);
        this.aggregationCache.delete(symbol);
      } else {
        this.priceHistory.set(symbol, filteredHistory);
      }
    }
  }

  /**
   * 📋 Start performance monitoring
   */
  private startPerformanceMonitoring() {
    // Cleanup every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
    
    // Emit metrics every minute
    setInterval(() => {
      this.emit('metrics', this.getMetrics());
    }, 60 * 1000);
  }

  /**
   * 📋 Get performance metrics
   */
  getMetrics() {
    const sourceMetrics = Array.from(this.sourcesReliability.entries()).reduce((acc, [source, data]) => {
      acc[source] = {
        reliability: data.reliability,
        avgLatency: data.latency,
        lastUpdate: data.lastUpdate
      };
      return acc;
    }, {} as Record<string, any>);
    
    return {
      totalSymbols: this.priceHistory.size,
      aggregatedPrices: this.aggregationCache.size,
      totalPricePoints: Array.from(this.priceHistory.values())
        .reduce((sum, history) => sum + history.length, 0),
      sources: sourceMetrics,
      config: this.config
    };
  }

  /**
   * 📊 Export aggregated data for analysis
   */
  exportData() {
    return {
      aggregatedPrices: Object.fromEntries(this.aggregationCache),
      priceHistory: Object.fromEntries(
        Array.from(this.priceHistory.entries()).map(([symbol, history]) => [
          symbol,
          history.slice(-50) // Last 50 data points
        ])
      ),
      sourceMetrics: Object.fromEntries(this.sourcesReliability),
      timestamp: Date.now()
    };
  }
}

export { PriceAggregator, AggregatedPrice, PriceSource, AggregationConfig };
export default PriceAggregator;