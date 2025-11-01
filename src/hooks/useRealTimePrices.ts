/**
 * 📡 ProfesorXTrader - Real-Time Price Hook
 * React hook for consuming real-time cross-chain price data
 * Optimized for performance with automatic cleanup
 * Version: 2.1.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import CrossChainPriceFeed, { CrossChainPrice, ArbitrageOpportunity } from '../services/websocket/CrossChainPriceFeed';
import { PriceData } from '../services/websocket/WebSocketManager';
import { AggregatedPrice } from '../services/websocket/PriceAggregator';

interface UseRealTimePricesOptions {
  symbols?: string[];
  enableArbitrage?: boolean;
  updateInterval?: number; // milliseconds
  maxHistorySize?: number;
}

interface PriceSubscription {
  symbol: string;
  price: CrossChainPrice | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
}

interface UseRealTimePricesReturn {
  // Price data
  prices: Map<string, PriceSubscription>;
  aggregatedPrices: Map<string, AggregatedPrice>;
  
  // Arbitrage opportunities
  arbitrageOpportunities: ArbitrageOpportunity[];
  topArbitrageOpportunity: ArbitrageOpportunity | null;
  
  // Connection status
  isConnected: boolean;
  connectionStatus: Record<string, boolean>;
  
  // Controls
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
  refresh: () => void;
  
  // Metrics
  metrics: any;
  
  // Error handling
  errors: string[];
  clearErrors: () => void;
}

// Global price feed instance (singleton)
let globalPriceFeed: CrossChainPriceFeed | null = null;

const useRealTimePrices = (options: UseRealTimePricesOptions = {}): UseRealTimePricesReturn => {
  const {
    symbols = [],
    enableArbitrage = true,
    updateInterval = 1000,
    maxHistorySize = 100
  } = options;

  // State management
  const [prices, setPrices] = useState<Map<string, PriceSubscription>>(new Map());
  const [aggregatedPrices, setAggregatedPrices] = useState<Map<string, AggregatedPrice>>(new Map());
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<any>({});

  // Refs for cleanup and performance
  const priceFeedRef = useRef<CrossChainPriceFeed | null>(null);
  const subscribedSymbolsRef = useRef<Set<string>>(new Set());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  /**
   * 📡 Initialize price feed (singleton pattern)
   */
  const initializePriceFeed = useCallback(async () => {
    if (!globalPriceFeed) {
      globalPriceFeed = new CrossChainPriceFeed();
      
      // Setup event listeners
      globalPriceFeed.on('started', (data) => {
        if (mountedRef.current) {
          setIsConnected(true);
          setConnectionStatus(globalPriceFeed!.getMetrics().wsMetrics.connectionStatus || {});
        }
      });

      globalPriceFeed.on('crossChainPriceUpdate', (crossChainPrice: CrossChainPrice) => {
        if (mountedRef.current) {
          updatePriceSubscription(crossChainPrice);
        }
      });

      globalPriceFeed.on('arbitrageOpportunity', (data) => {
        if (mountedRef.current && enableArbitrage) {
          setArbitrageOpportunities(prev => {
            const newOpportunities = [...prev];
            const existingIndex = newOpportunities.findIndex(op => op.symbol === data.symbol);
            
            if (existingIndex >= 0) {
              newOpportunities[existingIndex] = data.opportunities[0]; // Best opportunity
            } else {
              newOpportunities.push(data.opportunities[0]);
            }
            
            return newOpportunities
              .sort((a, b) => b.netProfit - a.netProfit)
              .slice(0, maxHistorySize);
          });
        }
      });

      globalPriceFeed.on('warning', (warning) => {
        if (mountedRef.current) {
          setErrors(prev => [...prev, `${warning.symbol}: ${warning.message}`].slice(-10));
        }
      });

      globalPriceFeed.on('stopped', () => {
        if (mountedRef.current) {
          setIsConnected(false);
          setConnectionStatus({});
        }
      });

      // Start the price feed
      try {
        const started = await globalPriceFeed.start();
        if (!started) {
          throw new Error('Failed to start price feed');
        }
      } catch (error) {
        console.error('Failed to initialize price feed:', error);
        if (mountedRef.current) {
          setErrors(prev => [...prev, `Initialization error: ${error}`]);
        }
      }
    }
    
    priceFeedRef.current = globalPriceFeed;
  }, [enableArbitrage, maxHistorySize]);

  /**
   * 📋 Update price subscription state
   */
  const updatePriceSubscription = useCallback((crossChainPrice: CrossChainPrice) => {
    setPrices(prev => {
      const newPrices = new Map(prev);
      newPrices.set(crossChainPrice.symbol, {
        symbol: crossChainPrice.symbol,
        price: crossChainPrice,
        isLoading: false,
        error: null,
        lastUpdate: crossChainPrice.lastUpdate
      });
      return newPrices;
    });

    // Update aggregated prices
    if (crossChainPrice.aggregated) {
      setAggregatedPrices(prev => {
        const newAggregated = new Map(prev);
        newAggregated.set(crossChainPrice.symbol, crossChainPrice.aggregated);
        return newAggregated;
      });
    }
  }, []);

  /**
   * 📡 Subscribe to symbols
   */
  const subscribe = useCallback((symbolsToSubscribe: string[]) => {
    if (!priceFeedRef.current || !isConnected) return;

    symbolsToSubscribe.forEach(symbol => {
      const normalizedSymbol = symbol.toUpperCase();
      if (!subscribedSymbolsRef.current.has(normalizedSymbol)) {
        subscribedSymbolsRef.current.add(normalizedSymbol);
        
        // Initialize loading state
        setPrices(prev => {
          const newPrices = new Map(prev);
          newPrices.set(normalizedSymbol, {
            symbol: normalizedSymbol,
            price: null,
            isLoading: true,
            error: null,
            lastUpdate: 0
          });
          return newPrices;
        });
      }
    });
  }, [isConnected]);

  /**
   * 🚫 Unsubscribe from symbols
   */
  const unsubscribe = useCallback((symbolsToUnsubscribe: string[]) => {
    symbolsToUnsubscribe.forEach(symbol => {
      const normalizedSymbol = symbol.toUpperCase();
      subscribedSymbolsRef.current.delete(normalizedSymbol);
      
      setPrices(prev => {
        const newPrices = new Map(prev);
        newPrices.delete(normalizedSymbol);
        return newPrices;
      });
      
      setAggregatedPrices(prev => {
        const newAggregated = new Map(prev);
        newAggregated.delete(normalizedSymbol);
        return newAggregated;
      });
    });
  }, []);

  /**
   * 🔄 Refresh data
   */
  const refresh = useCallback(() => {
    if (priceFeedRef.current) {
      const currentMetrics = priceFeedRef.current.getMetrics();
      setMetrics(currentMetrics);
      setConnectionStatus(currentMetrics.wsMetrics?.connectionStatus || {});
      
      // Update arbitrage opportunities
      const opportunities = priceFeedRef.current.getArbitrageOpportunities();
      setArbitrageOpportunities(opportunities.slice(0, maxHistorySize));
    }
  }, [maxHistorySize]);

  /**
   * 🧹 Clear errors
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  /**
   * 🔄 Periodic updates
   */
  useEffect(() => {
    if (isConnected && updateInterval > 0) {
      const interval = setInterval(() => {
        refresh();
      }, updateInterval);
      
      updateTimeoutRef.current = interval;
      
      return () => {
        if (updateTimeoutRef.current) {
          clearInterval(updateTimeoutRef.current);
        }
      };
    }
  }, [isConnected, updateInterval, refresh]);

  /**
   * 📡 Initialize and subscribe to initial symbols
   */
  useEffect(() => {
    initializePriceFeed();
    
    return () => {
      mountedRef.current = false;
    };
  }, [initializePriceFeed]);

  /**
   * 📡 Subscribe to initial symbols when connected
   */
  useEffect(() => {
    if (isConnected && symbols.length > 0) {
      subscribe(symbols);
    }
  }, [isConnected, symbols, subscribe]);

  /**
   * 🧹 Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearInterval(updateTimeoutRef.current);
      }
      mountedRef.current = false;
    };
  }, []);

  // Calculate top arbitrage opportunity
  const topArbitrageOpportunity = arbitrageOpportunities.length > 0 ? arbitrageOpportunities[0] : null;

  return {
    // Price data
    prices,
    aggregatedPrices,
    
    // Arbitrage opportunities
    arbitrageOpportunities,
    topArbitrageOpportunity,
    
    // Connection status
    isConnected,
    connectionStatus,
    
    // Controls
    subscribe,
    unsubscribe,
    refresh,
    
    // Metrics
    metrics,
    
    // Error handling
    errors,
    clearErrors
  };
};

/**
 * 📋 Hook for getting a single price
 */
export const usePrice = (symbol: string) => {
  const { prices, aggregatedPrices, isConnected } = useRealTimePrices({ 
    symbols: [symbol] 
  });
  
  const priceSubscription = prices.get(symbol.toUpperCase());
  const aggregatedPrice = aggregatedPrices.get(symbol.toUpperCase());
  
  return {
    price: priceSubscription?.price,
    aggregatedPrice,
    isLoading: priceSubscription?.isLoading || false,
    error: priceSubscription?.error,
    isConnected,
    lastUpdate: priceSubscription?.lastUpdate || 0
  };
};

/**
 * 🔍 Hook for arbitrage opportunities
 */
export const useArbitrageOpportunities = (minProfitPercent = 0.5) => {
  const { arbitrageOpportunities, topArbitrageOpportunity, isConnected } = useRealTimePrices({
    enableArbitrage: true
  });
  
  const filteredOpportunities = arbitrageOpportunities.filter(
    opportunity => opportunity.profitPercent >= minProfitPercent
  );
  
  return {
    opportunities: filteredOpportunities,
    topOpportunity: topArbitrageOpportunity && topArbitrageOpportunity.profitPercent >= minProfitPercent 
      ? topArbitrageOpportunity 
      : null,
    count: filteredOpportunities.length,
    isConnected
  };
};

/**
 * 📋 Hook for connection metrics
 */
export const usePriceFeedMetrics = () => {
  const { metrics, connectionStatus, isConnected } = useRealTimePrices();
  
  return {
    metrics,
    connectionStatus,
    isConnected,
    totalConnections: Object.keys(connectionStatus).length,
    activeConnections: Object.values(connectionStatus).filter(Boolean).length
  };
};

export default useRealTimePrices;