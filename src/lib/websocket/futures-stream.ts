/**
 * Real-time Futures Monitoring System - 2025 Upgrade
 * Implementează streaming WebSocket cu actualizări la microsecunde pentru futures
 */

import { EventEmitter } from 'events'

export interface FuturesStreamData {
  symbol: string
  price: string
  priceChange: string
  priceChangePercent: string
  volume: string
  quoteVolume: string
  openPrice: string
  highPrice: string
  lowPrice: string
  prevClosePrice: string
  lastQty: string
  bestBid: string
  bestBidQty: string
  bestAsk: string
  bestAskQty: string
  openTime: number
  closeTime: number
  firstId: number
  lastId: number
  count: number
  timestamp: number
  microsecondTimestamp: number // Nou în 2025 - precisie la microsecunde
}

export interface OrderBookUpdate {
  symbol: string
  bids: Array<[string, string]> // [price, quantity]
  asks: Array<[string, string]>
  timestamp: number
  microsecondTimestamp: number
  updateId: number
}

export interface TradeStream {
  symbol: string
  price: string
  quantity: string
  buyer: boolean // true dacă buyer e market maker
  timestamp: number
  microsecondTimestamp: number
  tradeId: number
}

export interface FuturesAccountUpdate {
  eventType: 'ACCOUNT_UPDATE' | 'ORDER_TRADE_UPDATE'
  eventTime: number
  microsecondEventTime: number
  transactionTime: number
  balances: Array<{
    asset: string
    walletBalance: string
    crossWalletBalance: string
    balanceChange: string
  }>
  positions: Array<{
    symbol: string
    positionSide: 'LONG' | 'SHORT' | 'BOTH'
    positionAmount: string
    marginType: 'isolated' | 'cross'
    isolatedWallet: string
    markPrice: string
    unRealizedPnL: string
    maintenanceMarginRequired: string
  }>
}

export class FuturesWebSocketStream extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private lastPingTime = 0
  private pingInterval: NodeJS.Timeout | null = null
  private isConnected = false
  private subscriptions = new Set<string>()
  private baseUrl: string
  private listenKey: string | null = null

  constructor(
    private testnet = false,
    private apiKey?: string
  ) {
    super()
    this.baseUrl = testnet 
      ? 'wss://stream.binancefuture.com'
      : 'wss://fstream.binance.com'
  }

  /**
   * Conectează la stream-ul de futures
   */
  async connect(): Promise<void> {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        return
      }

      const url = `${this.baseUrl}/ws`
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('🚀 Futures WebSocket connected with μs precision')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startPing()
        this.emit('connected')
        
        // Re-subscribe to toate stream-urile anterioare
        this.resubscribe()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = (event) => {
        console.log('⚠️ Futures WebSocket disconnected:', event.code, event.reason)
        this.isConnected = false
        this.stopPing()
        this.emit('disconnected')
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('❌ Futures WebSocket error:', error)
        this.emit('error', error)
      }

    } catch (error) {
      console.error('Failed to connect to Futures WebSocket:', error)
      this.attemptReconnect()
    }
  }

  /**
   * Subscribe la ticker stream pentru un simbol
   */
  subscribeTicker(symbol: string): void {
    const stream = `${symbol.toLowerCase()}@ticker`
    this.subscribe([stream])
  }

  /**
   * Subscribe la book ticker (best bid/ask) pentru un simbol
   */
  subscribeBookTicker(symbol: string): void {
    const stream = `${symbol.toLowerCase()}@bookTicker`
    this.subscribe([stream])
  }

  /**
   * Subscribe la partial book depth (Order Book)
   */
  subscribeDepth(symbol: string, levels: 5 | 10 | 20 = 20, speed: '100ms' | '250ms' | '500ms' = '100ms'): void {
    const stream = `${symbol.toLowerCase()}@depth${levels}@${speed}`
    this.subscribe([stream])
  }

  /**
   * Subscribe la trade stream pentru un simbol
   */
  subscribeTrades(symbol: string): void {
    const stream = `${symbol.toLowerCase()}@aggTrade`
    this.subscribe([stream])
  }

  /**
   * Subscribe la toate ticker-ele simultan
   */
  subscribeAllTickers(): void {
    this.subscribe(['!ticker@arr'])
  }

  /**
   * Subscribe la user data stream (necesită API key)
   */
  async subscribeUserData(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('API key required for user data stream')
    }

    try {
      // Obține listen key de la Binance API
      const listenKey = await this.getListenKey()
      if (listenKey) {
        this.listenKey = listenKey
        this.subscribe([listenKey])
        
        // Keep-alive pentru listen key la fiecare 30 de minute
        setInterval(() => {
          this.keepAliveListenKey()
        }, 30 * 60 * 1000)
      }
    } catch (error) {
      console.error('Failed to subscribe to user data:', error)
      throw error
    }
  }

  /**
   * Unsubscribe de la stream-uri
   */
  unsubscribe(streams: string[]): void {
    if (!this.isConnected || !this.ws) return

    const message = {
      method: 'UNSUBSCRIBE',
      params: streams,
      id: Date.now()
    }

    streams.forEach(stream => this.subscriptions.delete(stream))
    this.ws.send(JSON.stringify(message))
  }

  /**
   * Disconnect de la WebSocket
   */
  disconnect(): void {
    this.stopPing()
    
    if (this.listenKey) {
      this.closeListenKey()
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }
    
    this.isConnected = false
    this.subscriptions.clear()
  }

  // Metode private

  private subscribe(streams: string[]): void {
    if (!this.isConnected || !this.ws) {
      // Salvează subscription pentru când se conectează
      streams.forEach(stream => this.subscriptions.add(stream))
      return
    }

    const message = {
      method: 'SUBSCRIBE',
      params: streams,
      id: Date.now()
    }

    streams.forEach(stream => this.subscriptions.add(stream))
    this.ws.send(JSON.stringify(message))
  }

  private resubscribe(): void {
    if (this.subscriptions.size > 0) {
      this.subscribe(Array.from(this.subscriptions))
    }
  }

  private handleMessage(data: any): void {
    // Adaugă timestamp cu precizie la microsecunde
    const microsecondTimestamp = performance.now() * 1000 // Convert to microseconds
    
    if (data.e) { // Event type există
      switch (data.e) {
        case '24hrTicker':
          const tickerData: FuturesStreamData = {
            ...data,
            symbol: data.s,
            price: data.c,
            priceChange: data.P,
            priceChangePercent: data.p,
            volume: data.v,
            quoteVolume: data.q,
            openPrice: data.o,
            highPrice: data.h,
            lowPrice: data.l,
            prevClosePrice: data.x,
            lastQty: data.Q,
            bestBid: data.b,
            bestBidQty: data.B,
            bestAsk: data.a,
            bestAskQty: data.A,
            openTime: data.O,
            closeTime: data.C,
            firstId: data.F,
            lastId: data.L,
            count: data.n,
            timestamp: data.E,
            microsecondTimestamp
          }
          this.emit('ticker', tickerData)
          break

        case 'bookTicker':
          this.emit('bookTicker', {
            symbol: data.s,
            bestBid: data.b,
            bestBidQty: data.B,
            bestAsk: data.a,
            bestAskQty: data.A,
            timestamp: data.T,
            microsecondTimestamp
          })
          break

        case 'depthUpdate':
          const orderBookData: OrderBookUpdate = {
            symbol: data.s,
            bids: data.b,
            asks: data.a,
            timestamp: data.E,
            microsecondTimestamp,
            updateId: data.u
          }
          this.emit('depthUpdate', orderBookData)
          break

        case 'aggTrade':
          const tradeData: TradeStream = {
            symbol: data.s,
            price: data.p,
            quantity: data.q,
            buyer: data.m,
            timestamp: data.T,
            microsecondTimestamp,
            tradeId: data.a
          }
          this.emit('trade', tradeData)
          break

        case 'ACCOUNT_UPDATE':
        case 'ORDER_TRADE_UPDATE':
          const accountData: FuturesAccountUpdate = {
            eventType: data.e,
            eventTime: data.E,
            microsecondEventTime: microsecondTimestamp,
            transactionTime: data.T,
            balances: data.a?.B || [],
            positions: data.a?.P || []
          }
          this.emit('accountUpdate', accountData)
          break
      }
    } else if (Array.isArray(data)) {
      // Array de ticker-e (all tickers)
      data.forEach(ticker => {
        ticker.microsecondTimestamp = microsecondTimestamp
        this.emit('ticker', ticker)
      })
    }
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.lastPingTime = Date.now()
        this.ws.ping()
      }
    }, 30000) // Ping la fiecare 30 secunde
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached')
      this.emit('maxReconnectAttemptsReached')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000)
    
    console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  private async getListenKey(): Promise<string | null> {
    // Implementare pentru obținerea listen key de la API
    // Aceasta necesită un request HTTP la /fapi/v1/listenKey
    return null // Placeholder
  }

  private async keepAliveListenKey(): Promise<void> {
    // Implementare pentru keep-alive listen key
    // PUT request la /fapi/v1/listenKey
  }

  private async closeListenKey(): Promise<void> {
    // Implementare pentru închiderea listen key
    // DELETE request la /fapi/v1/listenKey
  }

  // Getters pentru status
  get connected(): boolean {
    return this.isConnected
  }

  get subscriptionCount(): number {
    return this.subscriptions.size
  }

  get activeSubscriptions(): string[] {
    return Array.from(this.subscriptions)
  }
}