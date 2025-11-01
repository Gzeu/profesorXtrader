/**
 * 💹 ProfesorXTrader - Real-Time Price Display Component
 * Live price monitoring with cross-chain arbitrage alerts
 * Optimized for performance with virtualization
 * Version: 2.1.0
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, TrendingDown, Zap, Globe, Activity, Eye, EyeOff } from 'lucide-react';
import useRealTimePrices, { useArbitrageOpportunities, usePriceFeedMetrics } from '@/hooks/useRealTimePrices';
import { CrossChainPrice, ArbitrageOpportunity } from '@/services/websocket/CrossChainPriceFeed';

interface RealTimePriceDisplayProps {
  symbols?: string[];
  showArbitrage?: boolean;
  compact?: boolean;
  maxItems?: number;
}

interface PriceCardProps {
  symbol: string;
  crossChainPrice: CrossChainPrice;
  compact?: boolean;
}

interface ArbitrageCardProps {
  opportunity: ArbitrageOpportunity;
  compact?: boolean;
}

/**
 * 💹 Individual price card component
 */
const PriceCard: React.FC<PriceCardProps> = ({ symbol, crossChainPrice, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { aggregated, prices: chainPrices, arbitrageOpportunities } = crossChainPrice;
  
  const priceChange = aggregated.changePercent24h || 0;
  const isPositive = priceChange >= 0;
  const hasArbitrage = arbitrageOpportunities.length > 0;
  
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toFixed(0);
  };
  
  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className={`${compact ? 'p-3' : 'p-4'} ${hasArbitrage ? 'ring-2 ring-yellow-400' : ''}`}>
        <CardHeader className={`${compact ? 'pb-2' : 'pb-3'} flex flex-row items-center justify-between`}>
          <CardTitle className={`${compact ? 'text-lg' : 'text-xl'} font-bold`}>
            {symbol}
            {hasArbitrage && (
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="ml-2 inline-block"
              >
                <Zap className="w-4 h-4 text-yellow-500" />
              </motion.span>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Badge variant={aggregated.confidence > 0.8 ? 'default' : 'secondary'}>
              {(aggregated.confidence * 100).toFixed(0)}%
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Main Price Display */}
          <div className="flex items-center justify-between">
            <div>
              <div className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold`}>
                ${formatPrice(aggregated.price)}
              </div>
              <div className="text-sm text-muted-foreground">
                VWAP: ${formatPrice(aggregated.vwap)}
              </div>
            </div>
            
            <div className="text-right">
              <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span className="font-semibold">
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatVolume(aggregated.volume24h)}
              </div>
            </div>
          </div>
          
          {/* Price Spread Info */}
          {aggregated.spread > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Spread:</span>
              <span className={aggregated.spread > 2 ? 'text-yellow-500' : 'text-muted-foreground'}>
                {aggregated.spread.toFixed(2)}%
              </span>
            </div>
          )}
          
          {/* Sources */}
          <div className="flex flex-wrap gap-1">
            {aggregated.sources.map((source, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
          
          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-3 border-t"
              >
                {/* Chain-specific prices */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Chain Prices:</h4>
                  {Array.from(chainPrices.entries()).map(([chain, priceData]) => (
                    <div key={chain} className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        {chain}
                      </span>
                      <span className="font-mono">${formatPrice(priceData.price)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Arbitrage opportunities */}
                {hasArbitrage && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center">
                      <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                      Arbitrage Opportunities:
                    </h4>
                    {arbitrageOpportunities.slice(0, 3).map((opportunity, index) => (
                      <div key={index} className="text-sm p-2 bg-yellow-50 rounded-md dark:bg-yellow-900/20">
                        <div className="flex justify-between items-center">
                          <span>{opportunity.buyChain} → {opportunity.sellChain}</span>
                          <span className="font-semibold text-green-600">
                            +{opportunity.profitPercent.toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Net Profit: ${opportunity.netProfit.toFixed(2)} | 
                          Confidence: {(opportunity.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * 🔍 Arbitrage opportunity card
 */
const ArbitrageCard: React.FC<ArbitrageCardProps> = ({ opportunity, compact = false }) => {
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200">
        <CardHeader className={`${compact ? 'pb-2' : 'pb-3'}`}>
          <CardTitle className={`${compact ? 'text-lg' : 'text-xl'} flex items-center`}>
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            {opportunity.symbol} Arbitrage
            <Badge className="ml-2 bg-green-100 text-green-800">
              +{opportunity.profitPercent.toFixed(2)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Buy on</div>
              <div className="font-semibold text-blue-600">{opportunity.buyChain}</div>
              <div className="font-mono text-lg">${formatPrice(opportunity.buyPrice)}</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Sell on</div>
              <div className="font-semibold text-green-600">{opportunity.sellChain}</div>
              <div className="font-mono text-lg">${formatPrice(opportunity.sellPrice)}</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Net Profit</div>
              <div className="font-bold text-green-600">${opportunity.netProfit.toFixed(2)}</div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Confidence</div>
              <div className={`font-semibold ${
                opportunity.confidence > 0.8 ? 'text-green-600' : 
                opportunity.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(opportunity.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          
          {!compact && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Estimated Gas: ${opportunity.estimatedGasCost.toFixed(2)}</div>
              <div>Volume Range: ${opportunity.minVolume.toFixed(0)} - ${opportunity.maxVolume.toFixed(0)}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * 📊 Connection status indicator
 */
const ConnectionStatus: React.FC<{ metrics: any; connectionStatus: Record<string, boolean> }> = ({ 
  metrics, 
  connectionStatus 
}) => {
  const totalConnections = Object.keys(connectionStatus).length;
  const activeConnections = Object.values(connectionStatus).filter(Boolean).length;
  const isFullyConnected = activeConnections === totalConnections && totalConnections > 0;
  
  return (
    <div className="flex items-center space-x-2 text-sm">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Activity className={`w-4 h-4 ${
          isFullyConnected ? 'text-green-500' : 
          activeConnections > 0 ? 'text-yellow-500' : 'text-red-500'
        }`} />
      </motion.div>
      <span className="text-muted-foreground">
        Connected: {activeConnections}/{totalConnections}
      </span>
      {metrics.trackedTokens && (
        <span className="text-muted-foreground">
          | Tracking: {metrics.trackedTokens} tokens
        </span>
      )}
    </div>
  );
};

/**
 * 💹 Main Real-Time Price Display Component
 */
const RealTimePriceDisplay: React.FC<RealTimePriceDisplayProps> = ({
  symbols = ['BTC', 'ETH', 'BNB', 'EGLD', 'USDT', 'USDC'],
  showArbitrage = true,
  compact = false,
  maxItems = 50
}) => {
  const [selectedTab, setSelectedTab] = useState<'prices' | 'arbitrage'>('prices');
  
  const {
    prices,
    aggregatedPrices,
    isConnected,
    subscribe,
    refresh,
    errors,
    clearErrors
  } = useRealTimePrices({ symbols, enableArbitrage: showArbitrage });
  
  const { opportunities } = useArbitrageOpportunities(0.5);
  const { metrics, connectionStatus } = usePriceFeedMetrics();
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);
  
  const pricesArray = useMemo(() => {
    return Array.from(prices.values())
      .filter(subscription => subscription.price)
      .slice(0, maxItems)
      .sort((a, b) => {
        const aVolume = a.price?.aggregated?.volume24h || 0;
        const bVolume = b.price?.aggregated?.volume24h || 0;
        return bVolume - aVolume;
      });
  }, [prices, maxItems]);
  
  const topOpportunities = useMemo(() => {
    return opportunities
      .filter(op => op.confidence > 0.5)
      .slice(0, Math.min(10, maxItems));
  }, [opportunities, maxItems]);
  
  if (!isConnected) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Activity className="w-8 h-8 mx-auto text-muted-foreground" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold">Connecting to Price Feeds...</h3>
            <p className="text-muted-foreground">Initializing real-time connections</p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Prices</h2>
          <ConnectionStatus metrics={metrics} connectionStatus={connectionStatus} />
        </div>
        
        {showArbitrage && (
          <div className="flex space-x-2">
            <Button
              variant={selectedTab === 'prices' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('prices')}
            >
              Prices ({pricesArray.length})
            </Button>
            <Button
              variant={selectedTab === 'arbitrage' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('arbitrage')}
            >
              <Zap className="w-4 h-4 mr-1" />
              Arbitrage ({topOpportunities.length})
            </Button>
          </div>
        )}
      </div>
      
      {/* Error display */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="bg-red-50 border-red-200 dark:bg-red-900/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                    <span className="text-sm font-medium">Connection Issues</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearErrors}>
                    Dismiss
                  </Button>
                </div>
                <div className="mt-2 text-xs space-y-1">
                  {errors.slice(-3).map((error, index) => (
                    <div key={index} className="text-red-600">{error}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'prices' ? (
          <motion.div
            key="prices"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`grid gap-4 ${
              compact ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {pricesArray.map((subscription) => (
              <PriceCard
                key={subscription.symbol}
                symbol={subscription.symbol}
                crossChainPrice={subscription.price!}
                compact={compact}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="arbitrage"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`grid gap-4 ${
              compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {topOpportunities.map((opportunity, index) => (
              <ArbitrageCard
                key={`${opportunity.symbol}-${index}`}
                opportunity={opportunity}
                compact={compact}
              />
            ))}
            
            {topOpportunities.length === 0 && (
              <Card className="p-8">
                <div className="text-center text-muted-foreground">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No arbitrage opportunities found</p>
                  <p className="text-sm">Monitoring for profitable trades...</p>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTimePriceDisplay;