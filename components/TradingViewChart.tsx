// TradingView Advanced Charting Component for ProfessorXTrader
// GPZ-37 Implementation - Professional Trading Charts with AI Integration

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Brain, Zap } from 'lucide-react';

// TradingView Widget Interface
interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  locale?: string;
  height?: number;
  width?: string;
  autosize?: boolean;
  enableAI?: boolean;
  onSymbolChange?: (symbol: string) => void;
  aiAnalysisData?: {
    sentiment: number;
    confidence: number;
    signals: string[];
    predictions: {
      price: number;
      timeframe: string;
      probability: number;
    }[];
  };
}

// AI Analysis Overlay Component
const AIAnalysisOverlay: React.FC<{
  data?: TradingViewChartProps['aiAnalysisData'];
  isVisible: boolean;
}> = ({ data, isVisible }) => {
  if (!isVisible || !data) return null;

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-500';
    if (sentiment < -0.3) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.3) return 'Bullish';
    if (sentiment < -0.3) return 'Bearish';
    return 'Neutral';
  };

  return (
    <div className="absolute top-4 right-4 z-10 space-y-2">
      {/* AI Sentiment Indicator */}
      <Card className="p-3 bg-black/80 backdrop-blur-sm border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-medium text-white">AI Analysis</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-300">Sentiment:</span>
            <Badge className={`text-xs ${getSentimentColor(data.sentiment)}`}>
              {getSentimentLabel(data.sentiment)}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-300">Confidence:</span>
            <span className="text-xs text-white font-mono">
              {(data.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Price Predictions */}
      {data.predictions.length > 0 && (
        <Card className="p-3 bg-black/80 backdrop-blur-sm border border-gray-700 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-white">Predictions</span>
          </div>
          
          <div className="space-y-1">
            {data.predictions.slice(0, 2).map((pred, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-xs text-gray-300">{pred.timeframe}:</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white font-mono">
                    ${pred.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({(pred.probability * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Signals */}
      {data.signals.length > 0 && (
        <Card className="p-3 bg-black/80 backdrop-blur-sm border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-white">Signals</span>
          </div>
          
          <div className="space-y-1">
            {data.signals.slice(0, 3).map((signal, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {signal}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = 'BINANCE:BTCUSDT',
  interval = '1D',
  theme = 'dark',
  locale = 'en',
  height = 600,
  width = '100%',
  autosize = true,
  enableAI = true,
  onSymbolChange,
  aiAnalysisData
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(enableAI);
  const [currentSymbol, setCurrentSymbol] = useState(symbol);

  // TradingView Widget Configuration
  const getWidgetConfig = () => ({
    symbol: currentSymbol,
    interval: interval,
    container: containerRef.current,
    library_path: '/static/charting_library/',
    locale: locale,
    timezone: 'Etc/UTC',
    theme: theme,
    style: '1',
    toolbar_bg: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    enable_publishing: false,
    allow_symbol_change: true,
    save_image: true,
    hide_top_toolbar: false,
    hide_legend: false,
    hide_side_toolbar: false,
    details: true,
    hotlist: true,
    calendar: true,
    studies: [
      'RSI@tv-basicstudies',
      'MACD@tv-basicstudies',
      'MA@tv-basicstudies'
    ],
    // Custom styling for ProfessorXTrader theme
    overrides: {
      'paneProperties.background': theme === 'dark' ? '#0f0f0f' : '#ffffff',
      'paneProperties.vertGridProperties.color': theme === 'dark' ? '#1f1f1f' : '#f0f0f0',
      'paneProperties.horzGridProperties.color': theme === 'dark' ? '#1f1f1f' : '#f0f0f0',
      'scalesProperties.textColor': theme === 'dark' ? '#888888' : '#333333',
    },
    // AI Integration hooks
    symbol_search_request_delay: 1000,
    auto_save_delay: 5,
    disabled_features: [
      'use_localstorage_for_settings',
      'volume_force_overlay'
    ],
    enabled_features: [
      'study_templates',
      'side_toolbar_in_fullscreen_mode',
      'header_compare',
      'header_symbol_search',
      'symbol_search_hot_key'
    ]
  });

  // Initialize TradingView Widget
  useEffect(() => {
    const initializeWidget = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if TradingView library is loaded
        if (typeof window !== 'undefined' && (window as any).TradingView) {
          const widget = new (window as any).TradingView.widget(getWidgetConfig());
          
          widget.onChartReady(() => {
            setIsLoading(false);
            
            // Set up AI integration callbacks
            if (enableAI) {
              widget.subscribe('onSymbolChange', (symbolInfo: any) => {
                setCurrentSymbol(symbolInfo.name);
                onSymbolChange?.(symbolInfo.name);
              });
            }
          });

          widgetRef.current = widget;
        } else {
          // For development - use embedded widget as fallback
          setError('TradingView library not found. Please install the library.');
          setIsLoading(false);
        }
      } catch (err) {
        setError(`Widget initialization failed: ${err}`);
        setIsLoading(false);
      }
    };

    if (containerRef.current) {
      initializeWidget();
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [currentSymbol, interval, theme]);

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="relative" style={{ height, width }}>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-gray-400">Loading TradingView Charts...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Handle error state - show embedded widget as fallback
  if (error) {
    return (
      <Card className="relative" style={{ height, width }}>
        <div className="w-full h-full">
          {/* TradingView Embedded Widget Fallback */}
          <div
            className="tradingview-widget-container"
            style={{ height: '100%', width: '100%' }}
          >
            <div className="tradingview-widget-container__widget"></div>
            <script
              type="text/javascript"
              src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  autosize: true,
                  symbol: currentSymbol,
                  interval: interval,
                  timezone: "Etc/UTC",
                  theme: theme,
                  style: "1",
                  locale: "en",
                  enable_publishing: false,
                  allow_symbol_change: true,
                  calendar: false,
                  support_host: "https://www.tradingview.com"
                })
              }}
            />
          </div>
        </div>

        {/* AI Analysis Overlay */}
        <AIAnalysisOverlay
          data={aiAnalysisData}
          isVisible={showAI && enableAI}
        />

        {/* AI Toggle Button */}
        {enableAI && (
          <div className="absolute top-4 left-4 z-20">
            <Button
              onClick={() => setShowAI(!showAI)}
              variant={showAI ? "default" : "outline"}
              size="sm"
              className="bg-black/80 backdrop-blur-sm border-gray-700"
            >
              <Brain className="w-4 h-4 mr-1" />
              AI Analysis
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="relative" style={{ height, width }}>
      {/* AI Toggle Button */}
      {enableAI && (
        <div className="absolute top-4 left-4 z-20">
          <Button
            onClick={() => setShowAI(!showAI)}
            variant={showAI ? "default" : "outline"}
            size="sm"
            className="bg-black/80 backdrop-blur-sm border-gray-700"
          >
            <Brain className="w-4 h-4 mr-1" />
            AI Analysis
          </Button>
        </div>
      )}

      {/* TradingView Chart Container */}
      <div
        ref={containerRef}
        className="w-full h-full rounded-lg overflow-hidden border border-gray-700"
        style={{ height, width }}
      />

      {/* AI Analysis Overlay */}
      <AIAnalysisOverlay
        data={aiAnalysisData}
        isVisible={showAI && enableAI}
      />
    </div>
  );
};

export default TradingViewChart;
export type { TradingViewChartProps };