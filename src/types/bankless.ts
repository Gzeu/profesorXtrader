// Bankless Onchain types and interfaces
// Type definitions for blockchain data interaction

export interface BlockchainNetwork {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  supported: boolean;
}

export interface ContractInfo {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: string;
  abi?: any[];
  sourceCode?: string;
  verified: boolean;
}

export interface TransactionData {
  hash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed?: string;
  timestamp: number;
  status: boolean;
  data?: string;
  logs?: EventLog[];
}

export interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  removed: boolean;
}

export interface TokenTransfer {
  from: string;
  to: string;
  value: string;
  tokenAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  decimals?: number;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface Portfolio {
  address: string;
  totalValueUSD: number;
  tokens: TokenBalance[];
  nfts: NFTBalance[];
  defiPositions: DefiPosition[];
  lastUpdated: number;
}

export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: number;
  priceUSD?: number;
  valueUSD?: number;
  change24h?: number;
}

export interface NFTBalance {
  contractAddress: string;
  tokenId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  collectionName?: string;
  floorPrice?: number;
}

export interface DefiPosition {
  protocol: string;
  position: string;
  tokens: TokenBalance[];
  totalValueUSD: number;
  apr?: number;
  rewards?: TokenBalance[];
}

export interface PriceData {
  symbol: string;
  price: number;
  priceUSD: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  timestamp: number;
}

export interface OnchainMetrics {
  network: string;
  blockNumber: number;
  gasPrice: number;
  gasLimit: number;
  difficulty?: string;
  hashRate?: string;
  activeAddresses24h?: number;
  transactionCount24h?: number;
  avgBlockTime: number;
  timestamp: number;
}

export interface SmartContractCall {
  network: string;
  contractAddress: string;
  methodName: string;
  methodSignature: string;
  inputs: ContractInput[];
  outputs: ContractOutput[];
  gasEstimate?: number;
  value?: string;
}

export interface ContractInput {
  name: string;
  type: string;
  value: any;
}

export interface ContractOutput {
  name: string;
  type: string;
  value: any;
}

export interface EventFilter {
  network: string;
  contractAddresses: string[];
  topics: (string | null)[];
  fromBlock?: number;
  toBlock?: number | 'latest';
  limit?: number;
}

export interface BanklessError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface BanklessApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: BanklessError;
  requestId?: string;
  rateLimit?: {
    remaining: number;
    reset: number;
  };
}

export interface OnchainAnalytics {
  address: string;
  network: string;
  totalTransactions: number;
  totalVolume: string;
  firstTransaction: number;
  lastTransaction: number;
  uniqueInteractions: number;
  gasSpent: string;
  tokenInteractions: string[];
  defiProtocols: string[];
  risk: {
    score: number;
    factors: string[];
  };
}

export interface LiquidityPool {
  address: string;
  protocol: string;
  token0: {
    address: string;
    symbol: string;
    reserve: string;
  };
  token1: {
    address: string;
    symbol: string;
    reserve: string;
  };
  totalValueLocked: number;
  volume24h: number;
  fee: number;
  apr: number;
}

// Enum definitions
export enum SupportedNetworks {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  BASE = 'base',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism'
}

export enum TokenStandards {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155'
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  DROPPED = 'dropped'
}

export enum EventTypes {
  TRANSFER = 'Transfer',
  APPROVAL = 'Approval',
  SWAP = 'Swap',
  MINT = 'Mint',
  BURN = 'Burn',
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal'
}

// Utility types
export type NetworkIdentifier = keyof typeof SupportedNetworks;
export type ContractAddress = `0x${string}`;
export type TransactionHash = `0x${string}`;
export type BlockNumber = number | 'latest' | 'pending';

// Configuration interfaces
export interface BanklessConfig {
  apiToken: string;
  rateLimitPerMinute: number;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  enableCaching: boolean;
  cacheExpiration: number;
  supportedNetworks: SupportedNetworks[];
}

export interface CacheConfig {
  enabled: boolean;
  maxSize: number;
  ttl: number; // Time to live in seconds
  prefix: string;
}

// Hook interfaces for React integration
export interface UseBanklessOptions {
  enabled?: boolean;
  refetchInterval?: number;
  retryOnMount?: boolean;
  suspense?: boolean;
  cacheTime?: number;
  staleTime?: number;
}

export interface BanklessQueryResult<T> {
  data?: T;
  error?: BanklessError;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<void>;
  isFetching: boolean;
}

// WebSocket types for real-time data
export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
}

export interface WebSocketMessage {
  type: 'subscription' | 'data' | 'error' | 'heartbeat';
  channel?: string;
  data?: any;
  error?: BanklessError;
  timestamp: number;
}

export interface SubscriptionParams {
  channel: string;
  network: string;
  address?: string;
  events?: string[];
  filters?: Record<string, any>;
}