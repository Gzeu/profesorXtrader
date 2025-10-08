/**
 * MultiversX Network Configuration
 * ProfesorXTrader v2.0
 */

import { EnvironmentsEnum } from '@multiversx/sdk-dapp/types'

interface MultiversXConfig {
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

interface NetworkConfig {
  [key: string]: MultiversXConfig
}

export const networks: NetworkConfig = {
  devnet: {
    chainId: 'D',
    name: 'Devnet',
    egldLabel: 'xEGLD',
    decimals: 18,
    gasPerDataByte: 1500,
    apiTimeout: 4000,
    walletConnectDeepLink: 'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/',
    apiAddress: 'https://devnet-api.multiversx.com',
    explorerAddress: 'https://devnet-explorer.multiversx.com',
    walletAddress: 'https://devnet-wallet.multiversx.com/dapp/init',
    bridgeAddress: 'https://devnet-bridge.multiversx.com'
  },
  testnet: {
    chainId: 'T',
    name: 'Testnet',
    egldLabel: 'xEGLD',
    decimals: 18,
    gasPerDataByte: 1500,
    apiTimeout: 4000,
    walletConnectDeepLink: 'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/',
    apiAddress: 'https://testnet-api.multiversx.com',
    explorerAddress: 'https://testnet-explorer.multiversx.com',
    walletAddress: 'https://testnet-wallet.multiversx.com/dapp/init',
    bridgeAddress: 'https://testnet-bridge.multiversx.com'
  },
  mainnet: {
    chainId: '1',
    name: 'Mainnet',
    egldLabel: 'EGLD',
    decimals: 18,
    gasPerDataByte: 1500,
    apiTimeout: 4000,
    walletConnectDeepLink: 'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/',
    apiAddress: 'https://api.multiversx.com',
    explorerAddress: 'https://explorer.multiversx.com',
    walletAddress: 'https://wallet.multiversx.com/dapp/init',
    bridgeAddress: 'https://bridge.multiversx.com'
  }
}

// Current network based on environment
export const currentNetwork = process.env.NEXT_PUBLIC_MVX_NETWORK || 'devnet'
export const networkConfig = networks[currentNetwork]

// Smart Contract Addresses
export const contracts = {
  dex: process.env.NEXT_PUBLIC_MVX_DEX_CONTRACT || 'erd1qqqqqqqqqqqqqpgqq66xk9gfr4esuhem3jru86wg5hvp33a62jps2fy57p',
  farm: process.env.NEXT_PUBLIC_MVX_FARM_CONTRACT || 'erd1qqqqqqqqqqqqqpgqzqvm5ywqqf524efwrhr039tjs29w0qltkklsa05pk7',
  staking: process.env.NEXT_PUBLIC_MVX_STAKING_CONTRACT || 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l'
}

// DApp Configuration
export const dAppConfig = {
  environment: currentNetwork as EnvironmentsEnum,
  chainId: networkConfig.chainId,
  apiAddress: networkConfig.apiAddress,
  explorerAddress: networkConfig.explorerAddress,
  walletAddress: networkConfig.walletAddress,
  walletConnectV2ProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_V2_PROJECT_ID || '',
  apiTimeout: networkConfig.apiTimeout,
  sampleAuthenticatedDomains: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000']
}

// Trading Pairs Configuration
export const tradingPairs = {
  egld: {
    symbol: 'EGLD',
    identifier: 'EGLD',
    decimals: 18,
    ticker: 'EGLD'
  },
  usdc: {
    symbol: 'USDC',
    identifier: 'USDC-c76f1f',
    decimals: 6,
    ticker: 'USDC'
  },
  wegld: {
    symbol: 'WEGLD',
    identifier: 'WEGLD-bd4d79',
    decimals: 18,
    ticker: 'WEGLD'
  }
}

// API Endpoints
export const apiEndpoints = {
  economics: `${networkConfig.apiAddress}/economics`,
  tokens: `${networkConfig.apiAddress}/tokens`,
  accounts: `${networkConfig.apiAddress}/accounts`,
  transactions: `${networkConfig.apiAddress}/transactions`,
  blocks: `${networkConfig.apiAddress}/blocks`,
  stats: `${networkConfig.apiAddress}/stats`
}

// WebSocket Configuration pentru real-time data
export const wsConfig = {
  url: `wss://api.multiversx.com/socket`,
  reconnectAttempts: 5,
  reconnectDelay: 3000,
  pingInterval: 30000
}

export default {
  networks,
  currentNetwork,
  networkConfig,
  contracts,
  dAppConfig,
  tradingPairs,
  apiEndpoints,
  wsConfig
}