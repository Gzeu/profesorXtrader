/**
 * Hook React pentru integrarea cu sistemul de streaming futures
 * Gestionează conexiunile WebSocket și actualizările în timp real
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { 
  FuturesWebSocketStream, 
  FuturesStreamData, 
  OrderBookUpdate, 
  TradeStream, 
  FuturesAccountUpdate 
} from '@/lib/websocket/futures-stream'

export interface UseFuturesStreamOptions {
  testnet?: boolean
  apiKey?: string
  autoConnect?: boolean
  symbols?: string[]
  includeOrderBook?: boolean
  includeTrades?: boolean
  includeUserData?: boolean
}

export interface FuturesStreamState {
  connected: boolean
  error: string | null
  reconnectAttempts: number
  lastUpdate: number
  subscriptions: string[]
}

export interface FuturesMarketData {
  tickers: Map<string, FuturesStreamData>
  orderBooks: Map<string, OrderBookUpdate>
  trades: Map<string, TradeStream[]>
  accountData: FuturesAccountUpdate | null
}

type StreamEventHandler = {
  onTicker?: (data: FuturesStreamData) => void
  onOrderBook?: (data: OrderBookUpdate) => void
  onTrade?: (data: TradeStream) => void
  onAccountUpdate?: (data: FuturesAccountUpdate) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
}

const MAX_TRADES_PER_SYMBOL = 100 // Limitează istoric trade-uri pentru performance

export function useFuturesStream(
  options: UseFuturesStreamOptions = {},
  eventHandlers: StreamEventHandler = {}
) {
  const {
    testnet = false,
    apiKey,
    autoConnect = true,
    symbols = [],
    includeOrderBook = false,
    includeTrades = false,
    includeUserData = false
  } = options

  // State management
  const [state, setState] = useState<FuturesStreamState>({
    connected: false,
    error: null,
    reconnectAttempts: 0,
    lastUpdate: 0,
    subscriptions: []
  })

  const [marketData, setMarketData] = useState<FuturesMarketData>({
    tickers: new Map(),
    orderBooks: new Map(),
    trades: new Map(),
    accountData: null
  })

  // Refs pentru WebSocket și performance tracking
  const wsRef = useRef<FuturesWebSocketStream | null>(null)
  const performanceMetrics = useRef({
    messagesPerSecond: 0,
    avgLatency: 0,
    messageCount: 0,
    lastMeasurement: Date.now()
  })

  // Inițializare WebSocket
  const initializeWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect()
    }

    wsRef.current = new FuturesWebSocketStream(testnet, apiKey)

    // Event listeners
    wsRef.current.on('connected', () => {
      console.log('🟢 Futures stream connected')
      setState(prev => ({ ...prev, connected: true, error: null, reconnectAttempts: 0 }))
      eventHandlers.onConnect?.()
    })

    wsRef.current.on('disconnected', () => {
      console.log('🔴 Futures stream disconnected')
      setState(prev => ({ ...prev, connected: false }))
      eventHandlers.onDisconnect?.()
    })

    wsRef.current.on('error', (error: any) => {
      console.error('❌ Futures stream error:', error)
      setState(prev => ({ ...prev, error: error.message || 'WebSocket error' }))
      eventHandlers.onError?.(error)
    })

    wsRef.current.on('ticker', (data: FuturesStreamData) => {
      updatePerformanceMetrics()
      
      setMarketData(prev => ({
        ...prev,
        tickers: new Map(prev.tickers.set(data.symbol, data))
      }))
      
      setState(prev => ({ ...prev, lastUpdate: Date.now() }))
      eventHandlers.onTicker?.(data)
    })

    wsRef.current.on('depthUpdate', (data: OrderBookUpdate) => {
      updatePerformanceMetrics()
      
      if (includeOrderBook) {
        setMarketData(prev => ({
          ...prev,
          orderBooks: new Map(prev.orderBooks.set(data.symbol, data))
        }))
      }
      
      eventHandlers.onOrderBook?.(data)
    })

    wsRef.current.on('trade', (data: TradeStream) => {
      updatePerformanceMetrics()
      
      if (includeTrades) {
        setMarketData(prev => {
          const currentTrades = prev.trades.get(data.symbol) || []
          const newTrades = [...currentTrades, data].slice(-MAX_TRADES_PER_SYMBOL)
          
          return {
            ...prev,
            trades: new Map(prev.trades.set(data.symbol, newTrades))
          }
        })
      }
      
      eventHandlers.onTrade?.(data)
    })

    wsRef.current.on('accountUpdate', (data: FuturesAccountUpdate) => {
      updatePerformanceMetrics()
      
      setMarketData(prev => ({
        ...prev,
        accountData: data
      }))
      
      eventHandlers.onAccountUpdate?.(data)
    })

  }, [testnet, apiKey, includeOrderBook, includeTrades, eventHandlers])

  // Performance tracking
  const updatePerformanceMetrics = useCallback(() => {
    const now = Date.now()
    const metrics = performanceMetrics.current
    
    metrics.messageCount++
    
    // Actualizează metrici la fiecare secundă
    if (now - metrics.lastMeasurement >= 1000) {
      metrics.messagesPerSecond = metrics.messageCount
      metrics.messageCount = 0
      metrics.lastMeasurement = now
    }
  }, [])

  // Conectare și management subscription-uri
  const connect = useCallback(async () => {
    if (!wsRef.current) {
      initializeWebSocket()
    }

    try {
      await wsRef.current?.connect()
      
      // Subscribe la simboluri specifice
      if (symbols.length > 0) {
        symbols.forEach(symbol => {
          wsRef.current?.subscribeTicker(symbol)
          
          if (includeOrderBook) {
            wsRef.current?.subscribeDepth(symbol, 20, '100ms')
          }
          
          if (includeTrades) {
            wsRef.current?.subscribeTrades(symbol)
          }
        })
      } else {
        // Subscribe la toate ticker-ele dacă nu sunt specificate simboluri
        wsRef.current?.subscribeAllTickers()
      }
      
      // Subscribe la user data dacă e cerut
      if (includeUserData && apiKey) {
        await wsRef.current?.subscribeUserData()
      }
      
      // Update subscriptions list
      setState(prev => ({
        ...prev,
        subscriptions: wsRef.current?.activeSubscriptions || []
      }))
      
    } catch (error) {
      console.error('Failed to connect to futures stream:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to connect to futures stream',
        reconnectAttempts: prev.reconnectAttempts + 1
      }))
    }
  }, [symbols, includeOrderBook, includeTrades, includeUserData, apiKey, initializeWebSocket])

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect()
    setState(prev => ({ 
      ...prev, 
      connected: false, 
      subscriptions: [],
      error: null 
    }))
  }, [])

  // Subscribe/unsubscribe individual symbols
  const subscribeSymbol = useCallback((symbol: string) => {
    if (!wsRef.current?.connected) return
    
    wsRef.current.subscribeTicker(symbol)
    
    if (includeOrderBook) {
      wsRef.current.subscribeDepth(symbol, 20, '100ms')
    }
    
    if (includeTrades) {
      wsRef.current.subscribeTrades(symbol)
    }
    
    setState(prev => ({
      ...prev,
      subscriptions: wsRef.current?.activeSubscriptions || []
    }))
  }, [includeOrderBook, includeTrades])

  const unsubscribeSymbol = useCallback((symbol: string) => {
    if (!wsRef.current?.connected) return
    
    const streams = [
      `${symbol.toLowerCase()}@ticker`,
      ...(includeOrderBook ? [`${symbol.toLowerCase()}@depth20@100ms`] : []),
      ...(includeTrades ? [`${symbol.toLowerCase()}@aggTrade`] : [])
    ]
    
    wsRef.current.unsubscribe(streams)
    
    setState(prev => ({
      ...prev,
      subscriptions: wsRef.current?.activeSubscriptions || []
    }))
  }, [includeOrderBook, includeTrades])

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  // Cleanup pe unmount
  useEffect(() => {
    return () => {
      wsRef.current?.disconnect()
    }
  }, [])

  // Utility functions
  const getTickerData = useCallback((symbol: string): FuturesStreamData | null => {
    return marketData.tickers.get(symbol) || null
  }, [marketData.tickers])

  const getOrderBook = useCallback((symbol: string): OrderBookUpdate | null => {
    return marketData.orderBooks.get(symbol) || null
  }, [marketData.orderBooks])

  const getTrades = useCallback((symbol: string): TradeStream[] => {
    return marketData.trades.get(symbol) || []
  }, [marketData.trades])

  const getPerformanceMetrics = useCallback(() => {
    return { ...performanceMetrics.current }
  }, [])

  return {
    // State
    ...state,
    marketData,
    
    // Actions
    connect,
    disconnect,
    subscribeSymbol,
    unsubscribeSymbol,
    
    // Getters
    getTickerData,
    getOrderBook,
    getTrades,
    getPerformanceMetrics,
    
    // WebSocket instance (pentru advanced usage)
    ws: wsRef.current
  }
}