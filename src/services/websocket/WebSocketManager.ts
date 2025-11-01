/**
 * 🚀 ProfesorXTrader - WebSocket Manager
 * Real-time price feeds across all supported chains
 * Supports: Binance, CoinGecko, MultiversX, Cross-chain aggregation
 * Version: 2.1.0
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';

// Types for different data sources
interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  timestamp: number;
  source: 'binance' | 'coingecko' | 'multiversx' | 'aggregated';
  chain?: string;
}

interface TradeData {
  symbol: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
  source: string;
}

interface OHLCVData {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  interval: string;
  source: string;
}

interface WebSocketConfig {
  url: string;
  reconnectDelay: number;
  maxReconnectAttempts: number;
  pingInterval: number;
  apiKey?: string;
}

class WebSocketManager extends EventEmitter {
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private priceCache: Map<string, PriceData> = new Map();
  private isConnected: Map<string, boolean> = new Map();
  private pingIntervals: Map<string, NodeJS.Timeout> = new Map();
  
  // Configuration for different data sources
  private configs: Map<string, WebSocketConfig> = new Map([
    ['binance', {
      url: 'wss://stream.binance.com:9443/ws/',
      reconnectDelay: 5000,
      maxReconnectAttempts: 10,
      pingInterval: 30000
    }],
    ['binance-futures', {
      url: 'wss://fstream.binance.com/ws/',
      reconnectDelay: 5000,
      maxReconnectAttempts: 10,
      pingInterval: 30000
    }],
    ['coingecko', {
      url: 'wss://ws-api.coingecko.com/v1/websocket',
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      pingInterval: 25000,
      apiKey: process.env.COINGECKO_API_KEY
    }],
    ['multiversx', {
      url: 'wss://api.multiversx.com/websockets/hub/events',
      reconnectDelay: 5000,
      maxReconnectAttempts: 8,
      pingInterval: 30000
    }]
  ]);

  constructor() {
    super();
    this.setupErrorHandling();
  }

  /**
   * 🔌 Connect to a specific data source
   */
  async connect(source: string): Promise<boolean> {
    try {
      const config = this.configs.get(source);
      if (!config) {
        throw new Error(`Unknown source: ${source}`);
      }

      if (this.isConnected.get(source)) {
        console.log(`✅ ${source} already connected`);
        return true;
      }

      const ws = new WebSocket(config.url);
      this.connections.set(source, ws);
      this.reconnectAttempts.set(source, 0);

      return new Promise((resolve, reject) => {
        ws.on('open', () => {
          console.log(`🚀 Connected to ${source} WebSocket`);
          this.isConnected.set(source, true);
          this.setupPing(source);
          this.authenticate(source, ws);
          resolve(true);
        });

        ws.on('message', (data) => {
          this.handleMessage(source, data);
        });

        ws.on('close', (code, reason) => {
          console.log(`🔌 ${source} connection closed: ${code} - ${reason}`);
          this.isConnected.set(source, false);
          this.cleanup(source);
          this.attemptReconnect(source);
        });

        ws.on('error', (error) => {
          console.error(`❌ ${source} WebSocket error:`, error);
          this.isConnected.set(source, false);
          reject(error);
        });

        ws.on('pong', () => {
          // Connection is alive
        });

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected.get(source)) {
            reject(new Error(`Connection timeout for ${source}`));
          }
        }, 10000);
      });
    } catch (error) {
      console.error(`Failed to connect to ${source}:`, error);
      return false;
    }
  }

  /**
   * 🔐 Authenticate with services that require it
   */
  private authenticate(source: string, ws: WebSocket) {
    const config = this.configs.get(source);
    if (!config?.apiKey) return;

    switch (source) {
      case 'coingecko':
        ws.send(JSON.stringify({
          method: 'AUTHENTICATE',
          params: {
            api_key: config.apiKey
          }
        }));
        break;
    }
  }

  /**
   * 📡 Subscribe to price updates for specific symbols
   */
  subscribeToPrice(source: string, symbols: string[]): boolean {
    const ws = this.connections.get(source);
    if (!ws || !this.isConnected.get(source)) {
      console.error(`❌ ${source} not connected`);
      return false;
    }

    // Store subscriptions
    if (!this.subscriptions.has(source)) {
      this.subscriptions.set(source, new Set());
    }
    const sourceSubscriptions = this.subscriptions.get(source)!;
    symbols.forEach(symbol => sourceSubscriptions.add(symbol));

    try {
      switch (source) {
        case 'binance':
        case 'binance-futures':
          this.subscribeBinance(ws, symbols);
          break;
        case 'coingecko':
          this.subscribeCoinGecko(ws, symbols);
          break;
        case 'multiversx':
          this.subscribeMultiversX(ws, symbols);
          break;
      }
      return true;
    } catch (error) {
      console.error(`Failed to subscribe to ${source}:`, error);
      return false;
    }
  }

  /**
   * 📊 Binance WebSocket subscription
   */
  private subscribeBinance(ws: WebSocket, symbols: string[]) {
    const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: streams,
      id: Date.now()
    };
    ws.send(JSON.stringify(subscribeMessage));
    console.log(`📡 Binance: Subscribed to ${symbols.length} symbols`);
  }

  /**
   * 🦎 CoinGecko WebSocket subscription
   */
  private subscribeCoinGecko(ws: WebSocket, symbols: string[]) {
    // CoinGecko uses different symbol format (coin_id format)
    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: {
        channel: 'CGSimplePrice', // Real-time price channel
        coin_ids: symbols
      },
      id: Date.now()
    };
    ws.send(JSON.stringify(subscribeMessage));
    console.log(`🦎 CoinGecko: Subscribed to ${symbols.length} coins`);
  }

  /**
   * ⚡ MultiversX WebSocket subscription
   */
  private subscribeMultiversX(ws: WebSocket, symbols: string[]) {
    const subscribeMessage = {
      SubscribeToEvents: {
        EventsFilter: {
          Address: symbols, // Contract addresses or token identifiers
          Events: ['ESDTTransfer', 'ESDTNFTTransfer', 'MultiESDTNFTTransfer']
        }
      }
    };
    ws.send(JSON.stringify(subscribeMessage));
    console.log(`⚡ MultiversX: Subscribed to ${symbols.length} tokens`);
  }

  /**
   * 📨 Handle incoming WebSocket messages
   */
  private handleMessage(source: string, data: WebSocket.Data) {
    try {
      const message = JSON.parse(data.toString());
      
      switch (source) {
        case 'binance':
        case 'binance-futures':
          this.handleBinanceMessage(message);
          break;
        case 'coingecko':
          this.handleCoinGeckoMessage(message);
          break;
        case 'multiversx':
          this.handleMultiversXMessage(message);
          break;
      }
    } catch (error) {
      console.error(`Error parsing ${source} message:`, error);
    }
  }

  /**
   * 📊 Handle Binance price updates
   */
  private handleBinanceMessage(message: any) {
    if (message.e === '24hrTicker') {
      const priceData: PriceData = {
        symbol: message.s,
        price: parseFloat(message.c),
        change24h: parseFloat(message.p),
        changePercent24h: parseFloat(message.P),
        volume24h: parseFloat(message.v),
        timestamp: message.E,
        source: 'binance'
      };
      
      this.updatePriceCache(priceData);
      this.emit('priceUpdate', priceData);
    }
  }

  /**
   * 🦎 Handle CoinGecko price updates
   */
  private handleCoinGeckoMessage(message: any) {
    if (message.channel === 'CGSimplePrice' && message.data) {
      const data = message.data;
      const priceData: PriceData = {
        symbol: data.coin_id,
        price: data.usd_price || 0,
        change24h: data.usd_24h_change || 0,
        changePercent24h: data.usd_24h_vol || 0,
        volume24h: data.usd_24h_vol || 0,
        timestamp: Date.now(),
        source: 'coingecko'
      };
      
      this.updatePriceCache(priceData);
      this.emit('priceUpdate', priceData);
    }
  }

  /**
   * ⚡ Handle MultiversX events
   */
  private handleMultiversXMessage(message: any) {
    if (message.events) {
      message.events.forEach((event: any) => {
        if (event.identifier === 'ESDTTransfer') {
          // Extract price data from ESDT transfers
          const priceData: PriceData = {
            symbol: event.topics[0], // Token identifier
            price: parseFloat(event.topics[2]) / Math.pow(10, 18), // Assuming 18 decimals
            change24h: 0,
            changePercent24h: 0,
            volume24h: 0,
            timestamp: event.timestamp,
            source: 'multiversx',
            chain: 'MultiversX'
          };
          
          this.updatePriceCache(priceData);
          this.emit('priceUpdate', priceData);
        }
      });
    }
  }

  /**
   * 💾 Update price cache and emit aggregated data
   */
  private updatePriceCache(priceData: PriceData) {
    const key = `${priceData.source}_${priceData.symbol}`;
    this.priceCache.set(key, priceData);
    
    // Emit aggregated price if we have multiple sources for the same symbol
    this.emitAggregatedPrice(priceData.symbol);
  }

  /**
   * 📊 Emit aggregated price data from multiple sources
   */
  private emitAggregatedPrice(symbol: string) {
    const relatedPrices = Array.from(this.priceCache.values())
      .filter(price => price.symbol.includes(symbol) || symbol.includes(price.symbol));
    
    if (relatedPrices.length > 1) {
      const avgPrice = relatedPrices.reduce((sum, price) => sum + price.price, 0) / relatedPrices.length;
      const totalVolume = relatedPrices.reduce((sum, price) => sum + price.volume24h, 0);
      
      const aggregatedData: PriceData = {
        symbol: symbol,
        price: avgPrice,
        change24h: relatedPrices[0].change24h, // Use first source for now
        changePercent24h: relatedPrices[0].changePercent24h,
        volume24h: totalVolume,
        timestamp: Date.now(),
        source: 'aggregated'
      };
      
      this.emit('aggregatedPrice', aggregatedData);
    }
  }

  /**
   * ❤️ Setup ping/pong for connection health
   */
  private setupPing(source: string) {
    const config = this.configs.get(source);
    if (!config) return;

    const interval = setInterval(() => {
      const ws = this.connections.get(source);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, config.pingInterval);

    this.pingIntervals.set(source, interval);
  }

  /**
   * 🔄 Attempt to reconnect
   */
  private async attemptReconnect(source: string) {
    const config = this.configs.get(source);
    if (!config) return;

    const attempts = this.reconnectAttempts.get(source) || 0;
    if (attempts >= config.maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts reached for ${source}`);
      this.emit('maxReconnectAttemptsReached', source);
      return;
    }

    this.reconnectAttempts.set(source, attempts + 1);
    console.log(`🔄 Reconnecting to ${source} (attempt ${attempts + 1})...`);

    setTimeout(async () => {
      try {
        await this.connect(source);
        // Resubscribe to previous subscriptions
        const subscriptions = this.subscriptions.get(source);
        if (subscriptions && subscriptions.size > 0) {
          this.subscribeToPrice(source, Array.from(subscriptions));
        }
      } catch (error) {
        console.error(`Failed to reconnect to ${source}:`, error);
      }
    }, config.reconnectDelay);
  }

  /**
   * 🧹 Cleanup resources
   */
  private cleanup(source: string) {
    const pingInterval = this.pingIntervals.get(source);
    if (pingInterval) {
      clearInterval(pingInterval);
      this.pingIntervals.delete(source);
    }
  }

  /**
   * 🚨 Setup error handling
   */
  private setupErrorHandling() {
    this.on('error', (error) => {
      console.error('WebSocketManager error:', error);
    });

    process.on('SIGINT', () => {
      console.log('Gracefully closing WebSocket connections...');
      this.disconnectAll();
      process.exit(0);
    });
  }

  /**
   * 📋 Get current connection status
   */
  getConnectionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [source] of this.configs) {
      status[source] = this.isConnected.get(source) || false;
    }
    return status;
  }

  /**
   * 💰 Get cached price data
   */
  getCachedPrice(symbol: string, source?: string): PriceData | undefined {
    if (source) {
      return this.priceCache.get(`${source}_${symbol}`);
    }
    
    // Return most recent price from any source
    const prices = Array.from(this.priceCache.values())
      .filter(price => price.symbol === symbol)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return prices[0];
  }

  /**
   * 📊 Get all cached prices
   */
  getAllCachedPrices(): PriceData[] {
    return Array.from(this.priceCache.values());
  }

  /**
   * 🔌 Disconnect from specific source
   */
  disconnect(source: string) {
    const ws = this.connections.get(source);
    if (ws) {
      ws.close();
      this.connections.delete(source);
      this.isConnected.set(source, false);
      this.cleanup(source);
      console.log(`🔌 Disconnected from ${source}`);
    }
  }

  /**
   * 🔌 Disconnect from all sources
   */
  disconnectAll() {
    for (const source of this.connections.keys()) {
      this.disconnect(source);
    }
    console.log('🔌 All WebSocket connections closed');
  }

  /**
   * 📊 Get performance metrics
   */
  getMetrics() {
    return {
      totalConnections: this.connections.size,
      activeConnections: Array.from(this.isConnected.values()).filter(Boolean).length,
      cachedPrices: this.priceCache.size,
      totalSubscriptions: Array.from(this.subscriptions.values())
        .reduce((total, subs) => total + subs.size, 0),
      connectionStatus: this.getConnectionStatus()
    };
  }
}

export { WebSocketManager, PriceData, TradeData, OHLCVData };
export default WebSocketManager;