/**
 * MultiversX Dashboard Component
 * ProfesorXTrader v2.0 - Multi-Chain Trading Interface
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertCircle,
  RefreshCw,
  Zap,
  Target,
  Shield,
  Globe
} from 'lucide-react'

import { 
  useMultiversXAccount, 
  useEGLDPrice, 
  useTokenBalances, 
  useStakingInfo,
  useCrossChainPrices
} from '@/lib/multiversx/hooks'
import { formatCurrency, formatPercentage, formatTokenAmount } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MultiversXDashboardProps {
  className?: string
}

interface QuickAction {
  label: string
  icon: React.ReactNode
  action: () => void
  color: string
  disabled?: boolean
}

export function MultiversXDashboard({ className }: MultiversXDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)
  
  // MultiversX Data Hooks
  const { address, accountInfo, loading: accountLoading, error: accountError } = useMultiversXAccount()
  const { priceData, loading: priceLoading } = useEGLDPrice()
  const { balances, loading: balancesLoading } = useTokenBalances(address || undefined)
  const { stakingInfo, loading: stakingLoading } = useStakingInfo(address || undefined)
  const { prices: crossChainPrices, loading: crossChainLoading } = useCrossChainPrices('EGLD')
  
  // Calculate total portfolio value
  const totalPortfolioValue = React.useMemo(() => {
    if (!accountInfo || !priceData) return 0
    
    const egldValue = parseFloat(accountInfo.balance) * priceData.price / Math.pow(10, 18)
    const tokensValue = balances.reduce((sum, token) => {
      return sum + parseFloat(token.valueUsd || '0')
    }, 0)
    const stakingValue = stakingInfo ? parseFloat(stakingInfo.totalStaked) * priceData.price / Math.pow(10, 18) : 0
    
    return egldValue + tokensValue + stakingValue
  }, [accountInfo, priceData, balances, stakingInfo])
  
  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      label: 'Swap Tokens',
      icon: <RefreshCw className="h-4 w-4" />,
      action: () => setActiveTab('swap'),
      color: 'bg-mvx-primary',
    },
    {
      label: 'Stake EGLD',
      icon: <Shield className="h-4 w-4" />,
      action: () => setActiveTab('staking'),
      color: 'bg-trading-profit',
    },
    {
      label: 'Farm Rewards',
      icon: <Target className="h-4 w-4" />,
      action: () => setActiveTab('farming'),
      color: 'bg-mvx-gold',
    },
    {
      label: 'Bridge Assets',
      icon: <Globe className="h-4 w-4" />,
      action: () => setActiveTab('bridge'),
      color: 'bg-mvx-secondary',
    }
  ]
  
  const handleRefresh = async () => {
    setRefreshing(true)
    // Trigger refetch pentru toate hook-urile
    setTimeout(() => setRefreshing(false), 2000)
  }
  
  if (accountLoading && !address) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-b-2 border-mvx-primary mx-auto"></div>
          <p className="text-muted-foreground">Connecting to MultiversX...</p>
        </div>
      </div>
    )
  }
  
  if (accountError && !address) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Wallet className="h-8 w-8 mx-auto text-muted-foreground" />
            <CardTitle>Connect MultiversX Wallet</CardTitle>
            <CardDescription>
              Connect your MultiversX wallet to start trading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full mvx-button">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header cu Account Info */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold gradient-text">MultiversX Portfolio</h2>
          <p className="text-muted-foreground">
            {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not connected'}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>
      
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mvx-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-mvx-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalPortfolioValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all chains
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* EGLD Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="mvx-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">EGLD Price</CardTitle>
              {priceData && priceData.change24h >= 0 ? (
                <TrendingUp className="h-4 w-4 text-trading-profit" />
              ) : (
                <TrendingDown className="h-4 w-4 text-trading-loss" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {priceData ? formatCurrency(priceData.price) : '--'}
              </div>
              <p className={cn(
                'text-xs',
                priceData?.change24h >= 0 ? 'text-trading-profit' : 'text-trading-loss'
              )}>
                {priceData ? formatPercentage(priceData.change24h) : '--'} (24h)
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* EGLD Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="mvx-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">EGLD Balance</CardTitle>
              <Activity className="h-4 w-4 text-mvx-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {accountInfo ? formatTokenAmount(accountInfo.balance, 18, 4) : '--'}
              </div>
              <p className="text-xs text-muted-foreground">
                {accountInfo && priceData 
                  ? formatCurrency(
                      parseFloat(accountInfo.balance) * priceData.price / Math.pow(10, 18)
                    )
                  : '--'
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Arbitrage Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className={cn(
            'mvx-card',
            crossChainPrices?.arbitrageOpportunity && 'border-mvx-gold bg-gradient-to-br from-mvx-gold/10 to-transparent'
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arbitrage</CardTitle>
              <AlertCircle className={cn(
                'h-4 w-4',
                crossChainPrices?.arbitrageOpportunity ? 'text-mvx-gold animate-pulse' : 'text-muted-foreground'
              )} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {crossChainPrices 
                  ? formatPercentage(crossChainPrices.difference * 100)
                  : '--'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {crossChainPrices?.arbitrageOpportunity ? 'Opportunity detected!' : 'No opportunities'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Quick Actions */}
      <Card className="mvx-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-mvx-gold" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto flex-col gap-2 p-4 hover:scale-102 transition-transform"
                  onClick={action.action}
                  disabled={action.disabled}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    action.color,
                    'text-white'
                  )}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="farming">Farming</TabsTrigger>
          <TabsTrigger value="arbitrage">Arbitrage</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Breakdown */}
            <Card className="mvx-card">
              <CardHeader>
                <CardTitle>Portfolio Breakdown</CardTitle>
                <CardDescription>Asset allocation across MultiversX ecosystem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* EGLD */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-mvx-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">E</span>
                      </div>
                      <div>
                        <p className="font-medium">EGLD</p>
                        <p className="text-sm text-muted-foreground">
                          {accountInfo ? formatTokenAmount(accountInfo.balance, 18, 4) : '0'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {accountInfo && priceData 
                          ? formatCurrency(
                              parseFloat(accountInfo.balance) * priceData.price / Math.pow(10, 18)
                            )
                          : '$0'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {((parseFloat(accountInfo?.balance || '0') * (priceData?.price || 0) / Math.pow(10, 18)) / totalPortfolioValue * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  {/* Top 3 ESDT Tokens */}
                  {balances.slice(0, 3).map((token, index) => (
                    <div key={token.identifier} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-mvx-secondary/20 rounded-full flex items-center justify-center">
                          <span className="text-mvx-secondary text-xs font-bold">
                            {token.ticker.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{token.ticker}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTokenAmount(token.balance, token.decimals, 2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(parseFloat(token.valueUsd))}</p>
                        <p className="text-sm text-muted-foreground">
                          {(parseFloat(token.valueUsd) / totalPortfolioValue * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Staking Overview */}
            <Card className="mvx-card">
              <CardHeader>
                <CardTitle>Staking Overview</CardTitle>
                <CardDescription>EGLD delegation și rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-mvx-primary">
                      {stakingInfo ? formatTokenAmount(stakingInfo.totalStaked, 18, 2) : '0'}
                    </div>
                    <p className="text-sm text-muted-foreground">EGLD Staked</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">APR</span>
                    <Badge variant="secondary" className="bg-trading-profit/20 text-trading-profit">
                      {stakingInfo?.apr ? `${stakingInfo.apr}%` : '8.5%'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Claimable Rewards</span>
                    <span className="font-medium text-mvx-gold">
                      {stakingInfo ? formatTokenAmount(stakingInfo.totalRewards, 18, 4) : '0'} EGLD
                    </span>
                  </div>
                  
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    Staking progress: 75% of target
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tokens" className="space-y-4">
          <Card className="mvx-card">
            <CardHeader>
              <CardTitle>ESDT Tokens</CardTitle>
              <CardDescription>Your MultiversX token holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balancesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-6 w-6 border-b-2 border-mvx-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading tokens...</p>
                  </div>
                ) : balances.length > 0 ? (
                  balances.map((token, index) => (
                    <motion.div
                      key={token.identifier}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-mvx-primary/20 hover:border-mvx-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-mvx-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-mvx-primary font-bold">
                            {token.ticker.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{token.name}</p>
                          <p className="text-sm text-muted-foreground">{token.ticker}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatTokenAmount(token.balance, token.decimals, 2)}
                        </p>
                        <p className="text-sm text-mvx-gold">
                          {formatCurrency(parseFloat(token.valueUsd))}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tokens found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="arbitrage" className="space-y-4">
          <Card className="mvx-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-mvx-gold" />
                Cross-Chain Arbitrage
              </CardTitle>
              <CardDescription>Real-time price differences across exchanges</CardDescription>
            </CardHeader>
            <CardContent>
              {crossChainLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-b-2 border-mvx-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Scanning opportunities...</p>
                </div>
              ) : crossChainPrices ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-mvx-primary/10">
                      <p className="text-sm font-medium text-mvx-primary">MultiversX</p>
                      <p className="text-2xl font-bold">{formatCurrency(crossChainPrices.multiversx)}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-mvx-secondary/10">
                      <p className="text-sm font-medium text-mvx-secondary">Binance</p>
                      <p className="text-2xl font-bold">{formatCurrency(crossChainPrices.binance)}</p>
                    </div>
                  </div>
                  
                  {crossChainPrices.arbitrageOpportunity && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-mvx-gold/10 border border-mvx-gold/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-mvx-gold" />
                        <span className="font-medium text-mvx-gold">Arbitrage Opportunity</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Price difference: {formatPercentage(crossChainPrices.difference * 100)}
                      </p>
                      <Button className="w-full mvx-button">
                        Execute Arbitrage
                      </Button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Unable to load price data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Alte tab-uri vor fi implementate */}
        <TabsContent value="staking">
          <Card className="mvx-card">
            <CardHeader>
              <CardTitle>Staking Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Staking interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="farming">
          <Card className="mvx-card">
            <CardHeader>
              <CardTitle>Yield Farming</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Farming interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card className="mvx-card">
            <CardHeader>
              <CardTitle>AI Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">AI analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MultiversXDashboard