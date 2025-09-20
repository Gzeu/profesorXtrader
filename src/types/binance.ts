/**
 * Tipuri pentru API-ul Binance
 */

export interface BinanceApiCredentials {
  apiKey: string
  secretKey: string
  testnet?: boolean
}

export interface BinanceAccountInfo {
  makerCommission: number
  takerCommission: number
  buyerCommission: number
  sellerCommission: number
  canTrade: boolean
  canWithdraw: boolean
  canDeposit: boolean
  updateTime: number
  accountType: string
  balances: BinanceBalance[]
  permissions: string[]
}

export interface BinanceBalance {
  asset: string
  free: string
  locked: string
}

export interface BinanceFuturesAccountInfo {
  feeTier: number
  canTrade: boolean
  canDeposit: boolean
  canWithdraw: boolean
  updateTime: number
  totalInitialMargin: string
  totalMaintMargin: string
  totalWalletBalance: string
  totalUnrealizedProfit: string
  totalMarginBalance: string
  totalPositionInitialMargin: string
  totalOpenOrderInitialMargin: string
  totalCrossWalletBalance: string
  totalCrossUnPnl: string
  availableBalance: string
  maxWithdrawAmount: string
  assets: BinanceFuturesAsset[]
  positions: BinanceFuturesPosition[]
}

export interface BinanceFuturesAsset {
  asset: string
  walletBalance: string
  unrealizedProfit: string
  marginBalance: string
  maintMargin: string
  initialMargin: string
  positionInitialMargin: string
  openOrderInitialMargin: string
  crossWalletBalance: string
  crossUnPnl: string
  availableBalance: string
  maxWithdrawAmount: string
  marginAvailable: boolean
  updateTime: number
}

export interface BinanceFuturesPosition {
  symbol: string
  initialMargin: string
  maintMargin: string
  unrealizedProfit: string
  positionInitialMargin: string
  openOrderInitialMargin: string
  leverage: string
  isolated: boolean
  entryPrice: string
  markPrice: string
  maxNotional: string
  positionSide: string
  positionAmt: string
  notional: string
  isolatedWallet: string
  updateTime: number
  bidNotional: string
  askNotional: string
}

export interface BinancePrice {
  symbol: string
  price: string
}

export interface BinanceTicker24hr {
  symbol: string
  priceChange: string
  priceChangePercent: string
  weightedAvgPrice: string
  prevClosePrice: string
  lastPrice: string
  lastQty: string
  bidPrice: string
  askPrice: string
  openPrice: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
  openTime: number
  closeTime: number
  firstId: number
  lastId: number
  count: number
}

export interface BinanceKline {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
  quoteAssetVolume: string
  numberOfTrades: number
  takerBuyBaseAssetVolume: string
  takerBuyQuoteAssetVolume: string
}

export interface BinanceWebSocketMessage {
  e: string // Event type
  E: number // Event time
  s: string // Symbol
  c: string // Close price
  o: string // Open price
  h: string // High price
  l: string // Low price
  v: string // Base asset volume
  q: string // Quote asset volume
  P: string // Price change percent
  p: string // Price change
  Q: string // Last quantity
  F: number // First trade ID
  L: number // Last trade ID
  O: number // Statistics open time
  C: number // Statistics close time
  n: number // Total number of trades
}

export interface BinanceApiError {
  code: number
  msg: string
}

// Tipuri pentru store-ul aplicației
export interface TradingPair {
  symbol: string
  baseAsset: string
  quoteAsset: string
  price: number
  change24h: number
  volume24h: number
  lastUpdate: number
}

export interface PortfolioSummary {
  totalBalance: number
  totalBalanceUSD: number
  change24h: number
  change24hPercent: number
  spotBalance: number
  futuresBalance: number
  unrealizedPnL: number
  lastUpdate: number
}

export interface AssetBalance {
  asset: string
  balance: number
  balanceUSD: number
  price: number
  change24h: number
  percentage: number
  type: 'spot' | 'futures'
}
