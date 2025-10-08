/**
 * MultiversX Type Definitions
 * ProfesorXTrader v2.0 - Complete type safety pentru MultiversX integration
 */

// Network & Configuration Types
export interface NetworkConfig {
  chainId: string
  name: string
  egldLabel: string
  decimals: number
  gasPerDataByte: number
  apiTimeout: number
  walletConnectDeepLink: string
  apiAddress: string
  explorerAddress: string
  walletAddress: string
  bridgeAddress?: string
}

// Account & Wallet Types
export interface AccountInfo {
  address: string
  balance: string
  nonce: number
  shard: number
  assets?: Record<string, any>
  totalUsdValue: string
}

export interface TokenBalance {
  identifier: string
  name: string
  ticker: string
  balance: string
  decimals: number
  valueUsd: string
  price: string
  marketCap: string
  svgUrl?: string
  website?: string
  description?: string
}

export interface WalletConnection {
  address: string | null
  connected: boolean
  connecting: boolean
  wallet: string | null
  balance: string
  error: string | null
}

// Price & Market Data Types
export interface EGLDPrice {
  price: number
  marketCap: number
  volume24h: number
  change24h: number
  circulatingSupply: number
  totalSupply: number
  lastUpdate: number
}

export interface TokenPrice {
  identifier: string
  price: number
  marketCap: number
  volume24h: number
  change24h: number
  change7d: number
  lastUpdate: number
}

export interface CrossChainPrices {
  multiversx: number
  binance: number
  ethereum: number
  difference: number
  arbitrageOpportunity: boolean
  bestBuy: string
  bestSell: string
  potentialProfit: number
}

// Trading Types
export interface TradingPair {
  baseToken: {
    identifier: string
    symbol: string
    decimals: number
  }
  quoteToken: {
    identifier: string
    symbol: string
    decimals: number
  }
  address: string
  state: 'Active' | 'Inactive' | 'PartialActive'
  liquidityPoolToken: {
    identifier: string
    name: string
  }
  totalFeePercent: number
  specialFeePercent: number
}

export interface SwapTransaction {
  tokenIn: string
  tokenOut: string
  amountIn: string
  amountOut: string
  slippage: number
  priceImpact: number
  fee: string
  gasLimit: number
  estimatedGas: string
}

export interface ArbitrageOpportunity {
  id: string
  tokenSymbol: string
  buyExchange: string
  sellExchange: string
  buyPrice: number
  sellPrice: number
  profitPercent: number
  estimatedProfit: string
  volume: string
  timestamp: number
  risk: 'Low' | 'Medium' | 'High'
  status: 'Active' | 'Executed' | 'Expired'
}

// Staking & DeFi Types
export interface StakingInfo {
  totalStaked: string
  totalRewards: string
  delegations: Delegation[]
  apr: number
  lastUpdate: number
}

export interface Delegation {
  address: string
  contract: string
  userActiveStake: string
  claimableRewards: string
  userUndelegatedList: any[]
}

export interface FarmInfo {
  farmToken: {
    identifier: string
    name: string
  }
  farmingToken: {
    identifier: string
    name: string
  }
  rewardToken: {
    identifier: string
    name: string
  }
  address: string
  totalStaked: string
  apr: number
  state: 'Active' | 'Inactive'
  rewardsLeft: string
}

export interface UserFarmPosition {
  farmAddress: string
  stakedAmount: string
  rewardsEarned: string
  lastHarvestTime: number
  apr: number
}

// Smart Contract Types
export interface SmartContractInteraction {
  contractAddress: string
  functionName: string
  arguments: any[]
  gasLimit: number
  value?: string
  chainId: string
}

export interface TransactionResult {
  hash: string
  status: 'pending' | 'success' | 'fail'
  gasUsed?: number
  fee?: string
  timestamp: number
  blockHash?: string
  blockNumber?: number
}

// AI & Analytics Types
export interface AIAnalysis {
  symbol: string
  prediction: {
    price: number
    confidence: number
    timeframe: string
    direction: 'bullish' | 'bearish' | 'neutral'
  }
  technicalAnalysis: {
    rsi: number
    macd: {
      value: number
      signal: number
      histogram: number
    }
    bollinger: {
      upper: number
      middle: number
      lower: number
    }
  }
  sentiment: {
    score: number
    label: 'positive' | 'negative' | 'neutral'
    sources: string[]
  }
  lastUpdate: number
}

export interface MarketAlert {
  id: string
  type: 'price' | 'volume' | 'sentiment' | 'arbitrage'
  symbol: string
  condition: string
  currentValue: number
  targetValue: number
  triggered: boolean
  timestamp: number
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Dashboard & UI Types
export interface DashboardConfig {
  theme: 'light' | 'dark' | 'multiversx'
  layout: 'default' | 'trading' | 'portfolio' | 'analytics'
  widgets: {
    [key: string]: {
      enabled: boolean
      position: { x: number; y: number }
      size: { width: number; height: number }
    }
  }
  notifications: {
    priceAlerts: boolean
    portfolioUpdates: boolean
    stakingRewards: boolean
    arbitrageOpportunities: boolean
  }
}

export interface UserPreferences {
  defaultNetwork: 'devnet' | 'testnet' | 'mainnet'
  primaryCurrency: 'USD' | 'EUR' | 'RON'
  language: 'en' | 'ro'
  timezone: string
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  tradingExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  timestamp: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  size: number
  totalPages: number
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'price_update' | 'balance_update' | 'transaction_update' | 'alert'
  data: any
  timestamp: number
}

export interface WebSocketConfig {
  url: string
  reconnectAttempts: number
  reconnectDelay: number
  pingInterval: number
  autoReconnect: boolean
}

// Error Types
export interface MultiversXError {
  code: string
  message: string
  data?: any
  timestamp: number
}

export type ErrorType = 
  | 'NETWORK_ERROR'
  | 'WALLET_ERROR'
  | 'CONTRACT_ERROR'
  | 'API_ERROR'
  | 'VALIDATION_ERROR'
  | 'INSUFFICIENT_FUNDS'
  | 'TRANSACTION_FAILED'

// Export types pentru convenient usage
export type MultiversXNetwork = 'devnet' | 'testnet' | 'mainnet'
export type WalletProvider = 'extension' | 'web' | 'mobile' | 'ledger' | 'walletconnect'
export type TransactionStatus = 'pending' | 'success' | 'fail' | 'cancelled'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type TradingAction = 'buy' | 'sell' | 'swap' | 'stake' | 'unstake' | 'claim'

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface DashboardCardProps extends BaseComponentProps {
  title: string
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
}

export interface ChartProps extends BaseComponentProps {
  data: any[]
  height?: number
  timeframe?: '1h' | '4h' | '1d' | '1w' | '1M'
  indicators?: string[]
  crosshair?: boolean
  volume?: boolean
}