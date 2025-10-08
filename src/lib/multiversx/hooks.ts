/**
 * MultiversX React Hooks
 * ProfesorXTrader v2.0 - Wallet Integration & Real-time Data
 */

import { useState, useEffect, useCallback } from 'react'
import { useGetAccountInfo, useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks'
import { Address, TokenTransfer } from '@multiversx/sdk-core'
import { apiEndpoints, networkConfig } from './config'
import type { AccountInfo, EGLDPrice, TokenBalance, StakingInfo } from './types'

/**
 * Hook pentru informațiile contului MultiversX
 */
export const useMultiversXAccount = () => {
  const { address, account } = useGetAccountInfo()
  const networkConfig = useGetNetworkConfig()
  
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchAccountInfo = useCallback(async () => {
    if (!address) return
    
    try {
      setLoading(true)
      const response = await fetch(`${apiEndpoints.accounts}/${address}`)
      const data = await response.json()
      
      setAccountInfo({
        address: data.address,
        balance: data.balance,
        nonce: data.nonce,
        shard: data.shard,
        assets: data.assets || {},
        totalUsdValue: data.totalUsdValue || '0'
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account info')
    } finally {
      setLoading(false)
    }
  }, [address])
  
  useEffect(() => {
    fetchAccountInfo()
  }, [fetchAccountInfo])
  
  return {
    address,
    account,
    accountInfo,
    loading,
    error,
    refetch: fetchAccountInfo,
    networkConfig
  }
}

/**
 * Hook pentru prețul EGLD în timp real
 */
export const useEGLDPrice = () => {
  const [priceData, setPriceData] = useState<EGLDPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`${apiEndpoints.economics}`)
        const data = await response.json()
        
        setPriceData({
          price: parseFloat(data.price || '0'),
          marketCap: parseFloat(data.marketCap || '0'),
          volume24h: parseFloat(data.volume24h || '0'),
          change24h: parseFloat(data.priceChange24h || '0'),
          circulatingSupply: parseFloat(data.circulatingSupply || '0'),
          totalSupply: parseFloat(data.totalSupply || '0'),
          lastUpdate: Date.now()
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch EGLD price')
      } finally {
        setLoading(false)
      }
    }
    
    // Initial fetch
    fetchPrice()
    
    // Update every 30 seconds
    const interval = setInterval(fetchPrice, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  return { priceData, loading, error }
}

/**
 * Hook pentru balante ESDT tokens
 */
export const useTokenBalances = (address?: string) => {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchBalances = useCallback(async () => {
    if (!address) return
    
    try {
      setLoading(true)
      const response = await fetch(`${apiEndpoints.accounts}/${address}/tokens?size=100`)
      const data = await response.json()
      
      const formattedBalances: TokenBalance[] = data.map((token: any) => ({
        identifier: token.identifier,
        name: token.name || token.identifier,
        ticker: token.ticker,
        balance: token.balance,
        decimals: token.decimals,
        valueUsd: token.valueUsd || '0',
        price: token.price || '0',
        marketCap: token.marketCap || '0'
      }))
      
      setBalances(formattedBalances)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token balances')
    } finally {
      setLoading(false)
    }
  }, [address])
  
  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])
  
  return { balances, loading, error, refetch: fetchBalances }
}

/**
 * Hook pentru informații staking
 */
export const useStakingInfo = (address?: string) => {
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchStakingInfo = useCallback(async () => {
    if (!address) return
    
    try {
      setLoading(true)
      const response = await fetch(`${apiEndpoints.accounts}/${address}/delegation`)
      const data = await response.json()
      
      if (data.length > 0) {
        const totalStaked = data.reduce((sum: number, delegation: any) => 
          sum + parseFloat(delegation.userActiveStake || '0'), 0
        )
        const totalRewards = data.reduce((sum: number, delegation: any) => 
          sum + parseFloat(delegation.claimableRewards || '0'), 0
        )
        
        setStakingInfo({
          totalStaked: totalStaked.toString(),
          totalRewards: totalRewards.toString(),
          delegations: data,
          apr: 8.5, // Fetch from API în viitor
          lastUpdate: Date.now()
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staking info')
    } finally {
      setLoading(false)
    }
  }, [address])
  
  useEffect(() => {
    fetchStakingInfo()
  }, [fetchStakingInfo])
  
  return { stakingInfo, loading, error, refetch: fetchStakingInfo }
}

/**
 * Hook pentru cross-chain price comparison
 */
export const useCrossChainPrices = (symbol: string = 'EGLD') => {
  const [prices, setPrices] = useState<{
    multiversx: number
    binance: number
    difference: number
    arbitrageOpportunity: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchCrossChainPrices = async () => {
      try {
        const [mvxResponse, binanceResponse] = await Promise.all([
          fetch(`${apiEndpoints.economics}`),
          fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`)
        ])
        
        const mvxData = await mvxResponse.json()
        const binanceData = await binanceResponse.json()
        
        const mvxPrice = parseFloat(mvxData.price || '0')
        const binancePrice = parseFloat(binanceData.price || '0')
        const difference = Math.abs(mvxPrice - binancePrice) / mvxPrice
        
        setPrices({
          multiversx: mvxPrice,
          binance: binancePrice,
          difference,
          arbitrageOpportunity: difference > 0.005 // 0.5% threshold
        })
      } catch (err) {
        console.error('Failed to fetch cross-chain prices:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCrossChainPrices()
    const interval = setInterval(fetchCrossChainPrices, 30000)
    
    return () => clearInterval(interval)
  }, [symbol])
  
  return { prices, loading }
}

/**
 * Hook pentru real-time WebSocket connection
 */
export const useMultiversXWebSocket = (events: string[] = ['price_update']) => {
  const [connected, setConnected] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Implementation pentru WebSocket connection
    // Se va implementa când API-ul WebSocket va fi disponibil oficial
    
    return () => {
      // Cleanup
    }
  }, [events])
  
  return { connected, data, error }
}