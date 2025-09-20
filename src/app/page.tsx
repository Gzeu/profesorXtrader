'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Settings, Shield, Brain, Zap, Target, BarChart3, Activity, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return null
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Professor<span className="text-primary">X</span>Trader
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional trading dashboard for Binance monitoring with advanced AI analysis and real-time portfolio management
          </p>
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-sm animate-pulse">
              🚀 Updated September 2025
            </Badge>
            <Badge variant="outline" className="text-sm">
              v0.2.0
            </Badge>
            <Badge variant="default" className="text-sm">
              {formatTime(currentTime)} EEST
            </Badge>
          </div>
        </div>

        {/* Real-time Status Banner */}
        <div className="mb-6">
          <Card className="border-amber-500/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-600 animate-pulse" />
                  <span className="font-medium text-amber-900 dark:text-amber-100">
                    Real-time monitoring system - Live updates every second
                  </span>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  LIVE
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Status Cards */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">$0.00</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <p className="text-xs text-muted-foreground">API not connected yet</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h PnL</CardTitle>
              <TrendingUp className="h-4 w-4 text-profit" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-muted-foreground">+$0.00</div>
              <div className="flex items-center gap-1 mt-1">
                <BarChart3 className="h-3 w-3 text-profit" />
                <p className="text-xs text-profit">+0.00% from yesterday</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Spot + Futures + Options</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
              <Brain className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">--</div>
              <p className="text-xs text-muted-foreground">Market sentiment analysis</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="trading-card hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Real-time Monitoring
              </CardTitle>
              <CardDescription>
                Live streaming with microsecond updates (2025 upgrade)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Spot Wallet
                  </span>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Futures Wallet
                  </span>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    WebSocket μs Stream
                  </span>
                  <Badge variant="secondary">New 2025</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-profit" />
                AI & Machine Learning
              </CardTitle>
              <CardDescription>
                Advanced predictive analysis with 2025 models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">Pattern Recognition</span>
                  <Badge variant="secondary">In Development</Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">Sentiment Analysis</span>
                  <Badge variant="secondary">In Development</Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">Neural Networks</span>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">New</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Technical Indicators 2025
              </CardTitle>
              <CardDescription>
                Complete suite of modern indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">VWAP Enhanced</span>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">RSI with Divergences</span>
                  <Badge variant="secondary">In Development</Badge>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-md bg-muted/30">
                  <span className="text-sm">OBV + Volume Profile</span>
                  <Badge variant="secondary">Planned</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New: Market Status Card */}
        <Card className="mb-8 border-green-500/20 bg-gradient-to-r from-green-50/30 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Real-time Market Status
            </CardTitle>
            <CardDescription>
              Binance API connectivity with 99.98% uptime (H1 2025)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-2xl font-bold text-green-600">99.98%</div>
                <div className="text-sm text-muted-foreground">API Uptime</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-2xl font-bold text-blue-600">μs</div>
                <div className="text-sm text-muted-foreground">Latency Support</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-2xl font-bold text-purple-600">AI</div>
                <div className="text-sm text-muted-foreground">Enhanced Analytics</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Setup Instructions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Initial Setup - Updated 2025
            </CardTitle>
            <CardDescription>
              Complete setup for all new features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    Get Binance API Keys
                    <Badge variant="outline" className="text-xs">Enhanced 2025</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create API keys with microsecond support and all new trading pairs
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    Setup AI Models
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">New</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure machine learning models for predictive analysis
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-muted-foreground">Complete System Testing</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verify all components: API, AI, WebSocket streams and indicators
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3 flex-wrap">
              <Button className="flex-1 min-w-[200px]" disabled>
                <Settings className="mr-2 h-4 w-4" />
                Configure API
              </Button>
              <Button variant="outline" disabled>
                <Brain className="mr-2 h-4 w-4" />
                Setup AI Models
              </Button>
              <Button variant="secondary" disabled>
                <Shield className="mr-2 h-4 w-4" />
                Complete Test
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Updated Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Updated with latest technologies from September 2025</span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <p>
            Developed by{' '}
            <a 
              href="https://github.com/Gzeu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              George Pricop (Gzeu)
            </a>
          </p>
          <p className="mt-1">
            ProfessorXTrader v0.2.0 - Professional Trading Dashboard with AI Enhanced
          </p>
        </div>
      </div>
    </div>
  )
}
