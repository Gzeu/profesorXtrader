'use client';

import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Zap, 
  Brain,
  RefreshCcw,
  Settings,
  Maximize2
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for TradingView component to prevent SSR issues
const TradingViewChart = dynamic(
  () => import('@/components/charts/TradingViewChart'),
  { 
    ssr: false,
    loading: () => <ChartLoadingSkeleton />
  }
);

// Loading skeleton for chart
function ChartLoadingSkeleton() {
  return (
    <div className="w-full h-[600px] rounded-lg border border-border bg-card animate-pulse">
      <div className="p-4">
        <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
        <div className="h-80 bg-muted rounded mb-4"></div>
        <div className="flex space-x-4">
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="h-4 bg-muted rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

// Trading symbols configuration
const TRADING_SYMBOLS = [
  { value: 'EGLDUSDT', label: 'EGLD/USDT', description: 'MultiversX' },
  { value: 'BTCUSDT', label: 'BTC/USDT', description: 'Bitcoin' },
  { value: 'ETHUSDT', label: 'ETH/USDT', description: 'Ethereum' },
  { value: 'ADAUSDT', label: 'ADA/USDT', description: 'Cardano' },
  { value: 'SOLUSDT', label: 'SOL/USDT', description: 'Solana' },
  { value: 'DOTUSDT', label: 'DOT/USDT', description: 'Polkadot' }
];

// Timeframe intervals
const TIMEFRAMES = [
  { value: '1', label: '1m' },
  { value: '3', label: '3m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '30', label: '30m' },
  { value: '60', label: '1h' },
  { value: '240', label: '4h' },
  { value: 'D', label: '1D' }
];

export default function ChartsPage() {
  const { theme } = useTheme();
  const [selectedSymbol, setSelectedSymbol] = useState('EGLDUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);

  // Get current symbol info
  const currentSymbol = TRADING_SYMBOLS.find(s => s.value === selectedSymbol) || TRADING_SYMBOLS[0];

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50' : 'container mx-auto p-6'
    }`}>
      {/* Header */}
      {!isFullscreen && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Trading Charts
              </h1>
              <p className="text-muted-foreground mt-2">
                Professional TradingView charts with AI-powered analysis
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                AI Active
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Live Data
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Chart Controls */}
      <div className={`grid gap-6 ${
        isFullscreen 
          ? 'grid-cols-1 p-4' 
          : 'grid-cols-1 lg:grid-cols-4'
      }`}>
        
        {/* Chart Section */}
        <div className={`${
          isFullscreen 
            ? 'col-span-1' 
            : 'lg:col-span-3'
        }`}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Symbol Selector */}
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRADING_SYMBOLS.map((symbol) => (
                        <SelectItem key={symbol.value} value={symbol.value}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-mono">{symbol.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {symbol.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Timeframe Selector */}
                  <div className="flex items-center space-x-1">
                    {TIMEFRAMES.map((tf) => (
                      <Button
                        key={tf.value}
                        variant={selectedTimeframe === tf.value ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedTimeframe(tf.value)}
                        className="h-8 px-3 text-xs"
                      >
                        {tf.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* AI Toggle */}
                  <Button
                    variant={aiAnalysisEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAiAnalysisEnabled(!aiAnalysisEnabled)}
                    className="flex items-center gap-1"
                  >
                    <Brain className="w-4 h-4" />
                    AI Analysis
                  </Button>

                  {/* Fullscreen Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="flex items-center gap-1"
                  >
                    <Maximize2 className="w-4 h-4" />
                    {isFullscreen ? 'Exit' : 'Fullscreen'}
                  </Button>

                  {/* Refresh */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* TradingView Chart */}
              <div className={`${
                isFullscreen 
                  ? 'h-[calc(100vh-120px)]' 
                  : 'h-[600px]'
              }`}>
                <Suspense fallback={<ChartLoadingSkeleton />}>
                  <TradingViewChart
                    symbol={selectedSymbol}
                    interval={selectedTimeframe}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    autosize={true}
                    height={isFullscreen ? window.innerHeight - 120 : 600}
                    timezone="Europe/Bucharest"
                    locale="en"
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        {!isFullscreen && (
          <div className="lg:col-span-1">
            <div className="space-y-6">
              
              {/* Current Symbol Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Market Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Symbol</span>
                      <Badge variant="outline">{currentSymbol.label}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currentSymbol.description}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Timeframe</div>
                      <div className="font-mono">{TIMEFRAMES.find(tf => tf.value === selectedTimeframe)?.label}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Exchange</div>
                      <div>Binance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Analysis
                  </CardTitle>
                  <CardDescription>
                    Real-time market sentiment and predictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiAnalysisEnabled ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sentiment</span>
                        <Badge variant="default" className="bg-green-500">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Bullish
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Confidence</span>
                        <div className="text-sm font-mono">78%</div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground border-l-2 border-blue-500 pl-3">
                        AI detected strong support at current levels with bullish momentum indicators.
                      </div>
                      
                      <Button size="sm" className="w-full" variant="outline">
                        <Zap className="w-4 h-4 mr-2" />
                        View Detailed Analysis
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Brain className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <div className="text-sm text-muted-foreground">AI Analysis Disabled</div>
                      <Button 
                        size="sm" 
                        onClick={() => setAiAnalysisEnabled(true)}
                        className="mt-2"
                      >
                        Enable AI
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Portfolio
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Trading Signals
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Historical Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-50"
        >
          Exit Fullscreen
        </Button>
      )}
    </div>
  );
}