/**
 * Client pentru API-ul Binance
 * Această clasă gestionează toate interacțiunile cu API-ul Binance
 */

import crypto from 'crypto'
import axios, { AxiosInstance } from 'axios'
import type {
  BinanceApiCredentials,
  BinanceAccountInfo,
  BinanceFuturesAccountInfo,
  BinancePrice,
  BinanceTicker24hr,
  BinanceKline,
  BinanceApiError
} from '@/types/binance'

export class BinanceClient {
  private apiKey: string
  private secretKey: string
  private baseURL: string
  private futuresBaseURL: string
  private client: AxiosInstance
  private futuresClient: AxiosInstance

  constructor(credentials: BinanceApiCredentials) {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey
    
    // URL-uri pentru testnet sau mainnet
    if (credentials.testnet) {
      this.baseURL = 'https://testnet.binance.vision/api/v3'
      this.futuresBaseURL = 'https://testnet.binancefuture.com/fapi/v1'
    } else {
      this.baseURL = 'https://api.binance.com/api/v3'
      this.futuresBaseURL = 'https://fapi.binance.com/fapi/v1'
    }

    // Configurare client-uri axios
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })

    this.futuresClient = axios.create({
      baseURL: this.futuresBaseURL,
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })
  }

  /**
   * Generează semnătura pentru request-urile autentificate
   */
  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex')
  }

  /**
   * Creează query string pentru request-uri autentificate
   */
  private createAuthenticatedParams(params: Record<string, any> = {}): string {
    const timestamp = Date.now()
    const queryParams = {
      ...params,
      timestamp,
      recvWindow: 5000
    }

    const queryString = new URLSearchParams(queryParams).toString()
    const signature = this.generateSignature(queryString)
    
    return `${queryString}&signature=${signature}`
  }

  /**
   * Testează conectivitatea cu API-ul Binance
   */
  async testConnectivity(): Promise<boolean> {
    try {
      await this.client.get('/ping')
      return true
    } catch (error) {
      console.error('Binance connectivity test failed:', error)
      return false
    }
  }

  /**
   * Obține informațiile despre cont (Spot)
   */
  async getAccountInfo(): Promise<BinanceAccountInfo> {
    try {
      const params = this.createAuthenticatedParams()
      const response = await this.client.get(`/account?${params}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        const apiError: BinanceApiError = error.response.data
        throw new Error(`Binance API Error ${apiError.code}: ${apiError.msg}`)
      }
      throw error
    }
  }

  /**
   * Obține informațiile despre contul Futures
   */
  async getFuturesAccountInfo(): Promise<BinanceFuturesAccountInfo> {
    try {
      const params = this.createAuthenticatedParams()
      const response = await this.futuresClient.get(`/account?${params}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        const apiError: BinanceApiError = error.response.data
        throw new Error(`Binance Futures API Error ${apiError.code}: ${apiError.msg}`)
      }
      throw error
    }
  }

  /**
   * Obține prețul pentru un simbol specific
   */
  async getPrice(symbol: string): Promise<BinancePrice> {
    try {
      const response = await this.client.get(`/ticker/price?symbol=${symbol}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get price for ${symbol}: ${error}`)
    }
  }

  /**
   * Obține prețurile pentru toate simbolurile
   */
  async getAllPrices(): Promise<BinancePrice[]> {
    try {
      const response = await this.client.get('/ticker/price')
      return response.data
    } catch (error) {
      throw new Error(`Failed to get all prices: ${error}`)
    }
  }

  /**
   * Obține statisticile 24h pentru un simbol
   */
  async get24hrTicker(symbol: string): Promise<BinanceTicker24hr> {
    try {
      const response = await this.client.get(`/ticker/24hr?symbol=${symbol}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get 24hr ticker for ${symbol}: ${error}`)
    }
  }

  /**
   * Obține statisticile 24h pentru toate simbolurile
   */
  async getAll24hrTickers(): Promise<BinanceTicker24hr[]> {
    try {
      const response = await this.client.get('/ticker/24hr')
      return response.data
    } catch (error) {
      throw new Error(`Failed to get all 24hr tickers: ${error}`)
    }
  }

  /**
   * Obține datele kline (candlestick) pentru un simbol
   */
  async getKlines(symbol: string, interval: string, limit: number = 500): Promise<BinanceKline[]> {
    try {
      const response = await this.client.get(
        `/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      )
      
      return response.data.map((kline: any[]) => ({
        openTime: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5],
        closeTime: kline[6],
        quoteAssetVolume: kline[7],
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: kline[9],
        takerBuyQuoteAssetVolume: kline[10]
      }))
    } catch (error) {
      throw new Error(`Failed to get klines for ${symbol}: ${error}`)
    }
  }

  /**
   * Obține informațiile despre server
   */
  async getServerTime(): Promise<number> {
    try {
      const response = await this.client.get('/time')
      return response.data.serverTime
    } catch (error) {
      throw new Error(`Failed to get server time: ${error}`)
    }
  }

  /**
   * Validează credențialele API
   */
  async validateCredentials(): Promise<boolean> {
    try {
      await this.getAccountInfo()
      return true
    } catch (error) {
      console.error('Invalid Binance credentials:', error)
      return false
    }
  }
}

// Singleton instance pentru utilizarea globală
let binanceClient: BinanceClient | null = null

export function initializeBinanceClient(credentials: BinanceApiCredentials): BinanceClient {
  binanceClient = new BinanceClient(credentials)
  return binanceClient
}

export function getBinanceClient(): BinanceClient | null {
  return binanceClient
}
