/**
 * 🌐 ProfesorXTrader - Cross-Chain Price Feed Service
 * Unified price streaming across multiple blockchain networks
 * Real-time arbitrage opportunity detection
 * Version: 2.1.0
 */

import { EventEmitter } from 'events';
import WebSocketManager, { PriceData } from './WebSocketManager';
import PriceAggregator, { AggregatedPrice } from './PriceAggregator';

interface ChainConfig {
  name: string;
  chainId: string;
  rpcUrl: string;
  wsUrl?: string;
  nativeToken: string;
  blockTime: number; // seconds
  gasToken: string;
}

interface ArbitrageOpportunity {
  symbol: string;
  buyChain: string;
  sellChain: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  profitPercent: number;
  minVolume: number;
  maxVolume: number;
  estimatedGasCost: number;
  netProfit: number;
  timestamp: number;
  confidence: number;
}

interface CrossChainPrice {
  symbol: string;
  prices: Map<string, PriceData>; // chain -> price data
  aggregated: AggregatedPrice;
  arbitrageOpportunities: ArbitrageOpportunity[];
  lastUpdate: number;
}

class CrossChainPriceFeed extends EventEmitter {
  private wsManager: WebSocketManager;
  private priceAggregator: PriceAggregator;
  private crossChainPrices: Map<string, CrossChainPrice> = new Map();
  private chainConfigs: Map<string, ChainConfig> = new Map();
  private isActive = false;

  // Supported chains configuration
  private supportedChains: ChainConfig[] = [
    {
      name: 'Ethereum',
      chainId: '1',
      rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/',
      wsUrl: 'wss://eth-mainnet.ws.alchemyapi.io/v2/',
      nativeToken: 'ETH',
      blockTime: 12,
      gasToken: 'ETH'
    },
    {
      name: 'Binance Smart Chain',
      chainId: '56',
      rpcUrl: 'https://bsc-dataseed1.binance.org/',
      wsUrl: 'wss://bsc-ws-node.nariox.org:443/ws',
      nativeToken: 'BNB',
      blockTime: 3,
      gasToken: 'BNB'
    },
    {
      name: 'MultiversX',
      chainId: 'mainnet',
      rpcUrl: 'https://api.multiversx.com',
      wsUrl: 'wss://api.multiversx.com/websockets/hub/events',
      nativeToken: 'EGLD',
      blockTime: 6,
      gasToken: 'EGLD'
    },
    {
      name: 'Arbitrum',
      chainId: '42161',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      nativeToken: 'ETH',
      blockTime: 1,
      gasToken: 'ETH'
    },
    {
      name: 'Base',
      chainId: '8453',
      rpcUrl: 'https://mainnet.base.org',
      nativeToken: 'ETH',
      blockTime: 2,
      gasToken: 'ETH'
    },
    {
      name: 'Polygon',
      chainId: '137',
      rpcUrl: 'https://polygon-rpc.com/',
      nativeToken: 'MATIC',
      blockTime: 2,
      gasToken: 'MATIC'
    }
  ];

  // Popular cross-chain tokens to monitor
  private crossChainTokens = [
    'USDT', 'USDC', 'ETH', 'BTC', 'BNB', 'MATIC', 'EGLD',
    'LINK', 'UNI', 'AAVE', 'SUSHI', 'CRV', 'COMP', 'MKR'
  ];

  // Arbitrage detection settings
  private arbitrageConfig = {
    minProfitPercent: 0.5, // 0.5% minimum profit
    maxGasCostPercent: 50,  // Max 50% of profit can be gas costs
    minVolumeUSD: 1000,     // Minimum $1000 volume
    maxPriceAge: 30000      // 30 seconds max price age
  };

  constructor() {
    super();
    this.wsManager = new WebSocketManager();
    this.priceAggregator = new PriceAggregator();
    this.initializeChains();
    this.setupEventHandlers();
  }

  /**
   * 🔄 Initialize supported chains
   */
  private initializeChains() {
    this.supportedChains.forEach(config => {
      this.chainConfigs.set(config.name, config);
    });
    console.log(`🌐 Initialized ${this.supportedChains.length} cross-chain configurations`);
  }

  /**
   * 📡 Setup event handlers
   */
  private setupEventHandlers() {
    // Handle price updates from WebSocket manager
    this.wsManager.on('priceUpdate', (priceData: PriceData) => {
      this.handlePriceUpdate(priceData);
    });

    // Handle aggregated prices
    this.priceAggregator.on('aggregatedPrice', (aggregated: AggregatedPrice) => {
      this.handleAggregatedPrice(aggregated);
    });

    // Handle warnings and alerts
    this.priceAggregator.on('warning', (warning) => {
      this.emit('warning', warning);
    });
  }

  /**
   * 🚀 Start cross-chain price monitoring
   */
  async start(): Promise<boolean> {
    try {
      console.log('🚀 Starting cross-chain price feed...');
      
      // Connect to all supported WebSocket sources
      const connections = await Promise.allSettled([
        this.wsManager.connect('binance'),
        this.wsManager.connect('coingecko'),
        this.wsManager.connect('multiversx')
      ]);

      const successfulConnections = connections.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      if (successfulConnections === 0) {
        throw new Error('Failed to connect to any WebSocket sources');
      }

      console.log(`✅ Connected to ${successfulConnections}/3 WebSocket sources`);
      
      // Subscribe to cross-chain tokens
      this.subscribeToTokens();
      
      this.isActive = true;
      this.emit('started', { connections: successfulConnections });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to start cross-chain price feed:', error);
      return false;
    }
  }

  /**
   * 📡 Subscribe to cross-chain token prices
   */
  private subscribeToTokens() {
    // Subscribe to Binance (spot and futures)
    const binanceSymbols = this.crossChainTokens.map(token => `${token}USDT`);
    this.wsManager.subscribeToPrice('binance', binanceSymbols);
    
    // Subscribe to CoinGecko (using coin IDs)
    const coingeckoIds = this.getCoinGeckoIds(this.crossChainTokens);
    this.wsManager.subscribeToPrice('coingecko', coingeckoIds);
    
    // Subscribe to MultiversX tokens
    const multiversxTokens = this.getMultiversXTokens(this.crossChainTokens);
    this.wsManager.subscribeToPrice('multiversx', multiversxTokens);
    
    console.log(`📡 Subscribed to ${this.crossChainTokens.length} cross-chain tokens`);
  }

  /**
   * 🦎 Get CoinGecko coin IDs for tokens
   */
  private getCoinGeckoIds(tokens: string[]): string[] {
    const coinGeckoMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'USDT': 'tether',
      'USDC': 'usd-coin',
      'MATIC': 'matic-network',
      'EGLD': 'multiversx-egld',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'AAVE': 'aave',
      'SUSHI': 'sushi',
      'CRV': 'curve-dao-token',
      'COMP': 'compound',
      'MKR': 'maker'
    };
    
    return tokens.map(token => coinGeckoMap[token]).filter(Boolean);
  }

  /**
   * ⚡ Get MultiversX token identifiers
   */
  private getMultiversXTokens(tokens: string[]): string[] {
    const multiversxMap: Record<string, string> = {
      'EGLD': 'EGLD',
      'USDC': 'USDC-c76f1f',
      'ETH': 'WETH-b4ca29',
      'BTC': 'WBTC-5349b3'
    };
    
    return tokens.map(token => multiversxMap[token]).filter(Boolean);
  }

  /**
   * 📋 Handle individual price updates
   */
  private handlePriceUpdate(priceData: PriceData) {
    // Add to price aggregator
    this.priceAggregator.addPriceData(priceData);
    
    // Determine chain from source
    const chain = this.mapSourceToChain(priceData.source);
    if (!chain) return;
    
    // Update cross-chain price data
    const symbol = this.normalizeSymbol(priceData.symbol);
    if (!this.crossChainPrices.has(symbol)) {
      this.crossChainPrices.set(symbol, {
        symbol,
        prices: new Map(),
        aggregated: {} as AggregatedPrice,
        arbitrageOpportunities: [],
        lastUpdate: Date.now()
      });
    }
    
    const crossChainPrice = this.crossChainPrices.get(symbol)!;
    crossChainPrice.prices.set(chain, priceData);
    crossChainPrice.lastUpdate = Date.now();
    
    // Check for arbitrage opportunities
    this.detectArbitrageOpportunities(symbol);
  }

  /**
   * 📋 Handle aggregated price updates
   */
  private handleAggregatedPrice(aggregated: AggregatedPrice) {
    const crossChainPrice = this.crossChainPrices.get(aggregated.symbol);
    if (crossChainPrice) {
      crossChainPrice.aggregated = aggregated;
      this.emit('crossChainPriceUpdate', crossChainPrice);
    }
  }

  /**
   * 🗺️ Map WebSocket source to blockchain
   */
  private mapSourceToChain(source: string): string | null {
    const sourceChainMap: Record<string, string> = {
      'binance': 'Binance Smart Chain',
      'coingecko': 'Ethereum', // Default to Ethereum for CoinGecko
      'multiversx': 'MultiversX'
    };
    
    return sourceChainMap[source] || null;
  }

  /**
   * 🏷️ Normalize symbol format
   */
  private normalizeSymbol(symbol: string): string {
    return symbol.replace(/USDT$|BUSD$|USD$/, '').toUpperCase();
  }

  /**
   * 🔍 Detect arbitrage opportunities
   */
  private detectArbitrageOpportunities(symbol: string) {
    const crossChainPrice = this.crossChainPrices.get(symbol);
    if (!crossChainPrice || crossChainPrice.prices.size < 2) return;
    
    const opportunities: ArbitrageOpportunity[] = [];
    const priceEntries = Array.from(crossChainPrice.prices.entries());
    const now = Date.now();
    
    // Compare prices across all chain pairs
    for (let i = 0; i < priceEntries.length; i++) {
      for (let j = i + 1; j < priceEntries.length; j++) {
        const [chain1, price1] = priceEntries[i];
        const [chain2, price2] = priceEntries[j];
        
        // Skip if prices are too old
        if (now - price1.timestamp > this.arbitrageConfig.maxPriceAge ||
            now - price2.timestamp > this.arbitrageConfig.maxPriceAge) {
          continue;
        }
        
        // Calculate arbitrage opportunity
        const opportunity = this.calculateArbitrage(symbol, chain1, price1, chain2, price2);
        if (opportunity && opportunity.profitPercent >= this.arbitrageConfig.minProfitPercent) {
          opportunities.push(opportunity);
        }
      }
    }
    
    // Update opportunities and emit if found
    crossChainPrice.arbitrageOpportunities = opportunities;
    
    if (opportunities.length > 0) {
      this.emit('arbitrageOpportunity', {
        symbol,
        opportunities: opportunities.sort((a, b) => b.netProfit - a.netProfit)
      });
    }
  }

  /**
   * 📋 Calculate arbitrage opportunity
   */
  private calculateArbitrage(
    symbol: string,
    chain1: string,
    price1: PriceData,
    chain2: string,
    price2: PriceData
  ): ArbitrageOpportunity | null {
    const buyPrice = Math.min(price1.price, price2.price);
    const sellPrice = Math.max(price1.price, price2.price);
    const buyChain = price1.price < price2.price ? chain1 : chain2;
    const sellChain = price1.price < price2.price ? chain2 : chain1;
    
    const profit = sellPrice - buyPrice;
    const profitPercent = (profit / buyPrice) * 100;
    
    if (profitPercent < this.arbitrageConfig.minProfitPercent) {
      return null;
    }
    
    // Estimate gas costs (simplified)
    const buyChainConfig = this.chainConfigs.get(buyChain);
    const sellChainConfig = this.chainConfigs.get(sellChain);
    
    const estimatedGasCost = this.estimateGasCosts(buyChainConfig, sellChainConfig, buyPrice);
    const netProfit = profit - estimatedGasCost;
    const netProfitPercent = (netProfit / buyPrice) * 100;
    
    // Check if gas costs are too high
    if (estimatedGasCost > (profit * this.arbitrageConfig.maxGasCostPercent / 100)) {
      return null;
    }
    
    // Estimate volumes (simplified)
    const minVolume = Math.max(this.arbitrageConfig.minVolumeUSD, estimatedGasCost * 10);
    const maxVolume = Math.min(price1.volume24h, price2.volume24h) * 0.1; // 10% of daily volume
    
    // Calculate confidence based on various factors
    const confidence = this.calculateArbitrageConfidence(
      profitPercent,
      price1.timestamp,
      price2.timestamp,
      price1.volume24h,
      price2.volume24h
    );
    
    return {
      symbol,
      buyChain,
      sellChain,
      buyPrice,
      sellPrice,
      profit,
      profitPercent,
      minVolume,
      maxVolume,
      estimatedGasCost,
      netProfit,
      timestamp: Math.max(price1.timestamp, price2.timestamp),
      confidence
    };
  }

  /**
   * ⛽ Estimate cross-chain gas costs
   */
  private estimateGasCosts(
    buyChain?: ChainConfig,
    sellChain?: ChainConfig,
    tradeAmount?: number
  ): number {
    if (!buyChain || !sellChain || !tradeAmount) return 0;
    
    // Simplified gas cost estimation
    const baseCosts: Record<string, number> = {
      'Ethereum': 50,      // $50 base cost
      'Binance Smart Chain': 2,  // $2 base cost
      'MultiversX': 0.01,   // $0.01 base cost
      'Arbitrum': 5,       // $5 base cost
      'Base': 3,           // $3 base cost
      'Polygon': 1         // $1 base cost
    };
    
    const buyGasCost = baseCosts[buyChain.name] || 10;
    const sellGasCost = baseCosts[sellChain.name] || 10;
    const bridgeCost = 20; // Estimated bridge cost
    
    return buyGasCost + sellGasCost + bridgeCost;
  }

  /**
   * 🎯 Calculate arbitrage confidence score
   */
  private calculateArbitrageConfidence(
    profitPercent: number,
    timestamp1: number,
    timestamp2: number,
    volume1: number,
    volume2: number
  ): number {
    let confidence = 1.0;
    
    // Reduce confidence for lower profits
    if (profitPercent < 1.0) confidence *= 0.7;
    if (profitPercent < 0.5) confidence *= 0.5;
    
    // Reduce confidence for stale data
    const maxAge = Math.max(Date.now() - timestamp1, Date.now() - timestamp2);
    if (maxAge > 10000) confidence *= 0.8; // 10 seconds
    if (maxAge > 30000) confidence *= 0.5; // 30 seconds
    
    // Reduce confidence for low volume
    const minVolume = Math.min(volume1, volume2);
    if (minVolume < 10000) confidence *= 0.6;  // Less than $10k volume
    if (minVolume < 1000) confidence *= 0.3;   // Less than $1k volume
    
    return Math.max(0.0, Math.min(1.0, confidence));
  }

  /**
   * 📋 Get cross-chain price data
   */
  getCrossChainPrice(symbol: string): CrossChainPrice | null {
    return this.crossChainPrices.get(symbol.toUpperCase()) || null;
  }

  /**
   * 📋 Get all cross-chain prices
   */
  getAllCrossChainPrices(): CrossChainPrice[] {
    return Array.from(this.crossChainPrices.values());
  }

  /**
   * 🔍 Get current arbitrage opportunities
   */
  getArbitrageOpportunities(): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    
    for (const crossChainPrice of this.crossChainPrices.values()) {
      opportunities.push(...crossChainPrice.arbitrageOpportunities);
    }
    
    return opportunities.sort((a, b) => b.netProfit - a.netProfit);
  }

  /**
   * 📋 Get supported chains
   */
  getSupportedChains(): ChainConfig[] {
    return [...this.supportedChains];
  }

  /**
   * 📋 Get performance metrics
   */
  getMetrics() {
    return {
      isActive: this.isActive,
      trackedTokens: this.crossChainPrices.size,
      totalArbitrageOpportunities: this.getArbitrageOpportunities().length,
      wsMetrics: this.wsManager.getMetrics(),
      aggregatorMetrics: this.priceAggregator.getMetrics(),
      supportedChains: this.supportedChains.length
    };
  }

  /**
   * 🔌 Stop cross-chain price monitoring
   */
  stop() {
    this.wsManager.disconnectAll();
    this.isActive = false;
    this.emit('stopped');
    console.log('🔌 Cross-chain price feed stopped');
  }
}

export { CrossChainPriceFeed, ChainConfig, ArbitrageOpportunity, CrossChainPrice };
export default CrossChainPriceFeed;