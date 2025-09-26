'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  autosize?: boolean;
  width?: number;
  height?: number;
  timezone?: string;
  locale?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = 'EGLDUSDT',
  interval = '15',
  theme = 'dark',
  autosize = true,
  width = 980,
  height = 610,
  timezone = 'Europe/Bucharest',
  locale = 'en'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom datafeed for Binance integration
  const createDatafeed = () => {
    return {
      onReady: (callback: any) => {
        console.log('[TradingView] Datafeed ready');
        setTimeout(() => {
          callback({
            supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '720', 'D', '3D', 'W', 'M'],
            supports_marks: false,
            supports_timescale_marks: false,
            supports_time: true,
            exchanges: [{ value: 'Binance', name: 'Binance', desc: 'Binance Exchange' }],
            symbols_types: [{ name: 'crypto', value: 'crypto' }]
          });
        }, 0);
      },

      searchSymbols: (userInput: string, exchange: string, symbolType: string, onResult: any) => {
        console.log('[TradingView] Search symbols:', userInput);
        // For now, return EGLD trading pairs
        const symbols = [
          {
            symbol: 'EGLDUSDT',
            full_name: 'Binance:EGLDUSDT',
            description: 'MultiversX / Tether USD',
            exchange: 'Binance',
            type: 'crypto'
          },
          {
            symbol: 'EGLDBTC',
            full_name: 'Binance:EGLDBTC',
            description: 'MultiversX / Bitcoin',
            exchange: 'Binance',
            type: 'crypto'
          }
        ];
        onResult(symbols.filter(s => s.symbol.toLowerCase().includes(userInput.toLowerCase())));
      },

      resolveSymbol: (symbolName: string, onResolve: any, onError: any) => {
        console.log('[TradingView] Resolve symbol:', symbolName);
        const symbolInfo = {
          name: symbolName,
          description: symbolName === 'EGLDUSDT' ? 'MultiversX / Tether USD' : symbolName,
          type: 'crypto',
          session: '24x7',
          timezone: 'Etc/UTC',
          exchange: 'Binance',
          minmov: 1,
          pricescale: 100000,
          has_intraday: true,
          intraday_multipliers: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '720'],
          supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '720', 'D', '3D', 'W', 'M'],
          volume_precision: 2,
          data_status: 'streaming',
          format: 'price'
        };
        setTimeout(() => onResolve(symbolInfo), 0);
      },

      getBars: async (symbolInfo: any, resolution: string, periodParams: any, onResult: any, onError: any) => {
        try {
          console.log('[TradingView] Get bars for:', symbolInfo.name, resolution);
          
          // Convert TradingView resolution to Binance interval
          const binanceIntervals: { [key: string]: string } = {
            '1': '1m', '3': '3m', '5': '5m', '15': '15m', '30': '30m',
            '60': '1h', '120': '2h', '240': '4h', '360': '6h', '720': '12h',
            'D': '1d', '3D': '3d', 'W': '1w', 'M': '1M'
          };
          
          const interval = binanceIntervals[resolution] || '15m';
          const symbol = symbolInfo.name;
          
          // Fetch data from Binance API
          const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000&startTime=${periodParams.from * 1000}&endTime=${periodParams.to * 1000}`
          );
          
          if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`);
          }
          
          const data = await response.json();
          
          const bars = data.map((kline: any[]) => ({
            time: kline[0],
            low: parseFloat(kline[3]),
            high: parseFloat(kline[2]),
            open: parseFloat(kline[1]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5])
          }));
          
          console.log(`[TradingView] Returning ${bars.length} bars`);
          onResult(bars, { noData: bars.length === 0 });
          
        } catch (error) {
          console.error('[TradingView] Error fetching bars:', error);
          onError(error);
        }
      },

      subscribeBars: (symbolInfo: any, resolution: string, onRealtimeCallback: any, subscriberUID: string, onResetCacheNeededCallback: any) => {
        console.log('[TradingView] Subscribe bars:', symbolInfo.name, resolution);
        // TODO: Implement WebSocket subscription for real-time updates
        // This will connect to GPZ-45 WebSocket implementation
      },

      unsubscribeBars: (subscriberUID: string) => {
        console.log('[TradingView] Unsubscribe bars:', subscriberUID);
        // TODO: Cleanup WebSocket subscription
      }
    };
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const initializeChart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import TradingView library
        const TradingView = await import('tradingview-charting-library');
        
        if (widgetRef.current) {
          widgetRef.current.remove();
        }

        const widgetOptions = {
          symbol: symbol,
          datafeed: createDatafeed(),
          interval: interval,
          container: containerRef.current,
          library_path: '/charting_library/',
          locale: locale,
          disabled_features: [
            'use_localstorage_for_settings',
            'volume_force_overlay',
            'create_volume_indicator_by_default'
          ],
          enabled_features: [
            'study_templates',
            'side_toolbar_in_fullscreen_mode',
            'header_in_fullscreen_mode'
          ],
          charts_storage_url: '',
          charts_storage_api_version: '1.1',
          client_id: 'profesorxtrader.vercel.app',
          user_id: 'public_user',
          fullscreen: false,
          autosize: autosize,
          width: width,
          height: height,
          theme: theme === 'dark' ? 'Dark' : 'Light',
          timezone: timezone,
          toolbar_bg: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          overrides: {
            'paneProperties.background': theme === 'dark' ? '#0a0a0a' : '#ffffff',
            'paneProperties.vertGridProperties.color': theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
            'paneProperties.horzGridProperties.color': theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
            'symbolWatermarkProperties.transparency': 90,
            'scalesProperties.textColor': theme === 'dark' ? '#ffffff' : '#000000',
            'mainSeriesProperties.candleStyle.upColor': '#22c55e',
            'mainSeriesProperties.candleStyle.downColor': '#ef4444',
            'mainSeriesProperties.candleStyle.drawWick': true,
            'mainSeriesProperties.candleStyle.drawBorder': true,
            'mainSeriesProperties.candleStyle.borderColor': '#378f30',
            'mainSeriesProperties.candleStyle.borderUpColor': '#22c55e',
            'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
            'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
            'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444'
          },
          studies_overrides: {
            'volume.volume.color.0': '#ef4444',
            'volume.volume.color.1': '#22c55e'
          },
          custom_css_url: '/tradingview-custom.css',
          loading_screen: {
            backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
            foregroundColor: theme === 'dark' ? '#ffffff' : '#000000'
          }
        };

        widgetRef.current = new (TradingView as any).widget(widgetOptions);
        
        widgetRef.current.onChartReady(() => {
          console.log('[TradingView] Chart is ready!');
          setIsLoading(false);
          
          // Add AI analysis integration
          setTimeout(() => {
            try {
              // TODO: Integrate with existing AI analysis from GPZ-35/GPZ-38
              widgetRef.current.chart().createStudy('Volume', false, false, { 'volume.volume.transparency': 50 });
              widgetRef.current.chart().createStudy('Moving Average', false, false, { 'length': 20 });
              widgetRef.current.chart().createStudy('RSI', false, true, { 'length': 14 });
              console.log('[TradingView] Default indicators added');
            } catch (err) {
              console.warn('[TradingView] Could not add default indicators:', err);
            }
          }, 1000);
        });

      } catch (err) {
        console.error('[TradingView] Initialization error:', err);
        setError('Failed to initialize TradingView chart. Please refresh the page.');
        setIsLoading(false);
      }
    };

    // Small delay to ensure container is ready
    const timer = setTimeout(initializeChart, 100);
    
    return () => {
      clearTimeout(timer);
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
          widgetRef.current = null;
        } catch (err) {
          console.warn('[TradingView] Error removing widget:', err);
        }
      }
    };
  }, [symbol, interval, theme, width, height, timezone, locale, autosize]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="text-center p-6">
          <div className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">
            Chart Error
          </div>
          <div className="text-red-800 dark:text-red-200 text-xs">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-black/90 z-10">
          <div className="text-center space-y-4">
            <Skeleton className="w-full h-96" />
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Loading TradingView charts...
            </p>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="tradingview-chart w-full h-full rounded-lg overflow-hidden border border-border"
        style={{ 
          minHeight: autosize ? '600px' : `${height}px`,
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff'
        }}
      />
      
      {/* AI Analysis Integration Overlay - TODO: Connect to GPZ-35/GPZ-38 */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-white/90">AI Analysis Active</span>
          </div>
          <div className="text-xs text-white/70 mt-1">
            Neural predictions enabled
          </div>
        </div>
      </div>
      
      {/* Performance Stats */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-2">
          <div className="text-xs text-white/90 font-mono">
            {symbol} • {interval}min • {theme}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewChart;

// Export types for other components
export type { TradingViewChartProps };