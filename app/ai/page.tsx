'use client'

import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react'

export default function AIPage() {
  return (
    <div className='flex h-screen bg-background'>
      <div className='w-64 border-r bg-card'>
        <div className='p-6'>
          <h1 className='text-2xl font-bold text-primary mb-6'>ProfesorXTrader</h1>
        </div>
        <Navigation />
      </div>

      <div className='flex-1 overflow-auto'>
        <div className='p-6'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold'>AI Analysis</h1>
            <p className='text-muted-foreground'>Machine learning insights and predictions</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* AI Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Brain className='w-5 h-5 mr-2' />
                  Price Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='p-4 border rounded-lg'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='font-semibold'>BTC/USDT (24h)</span>
                      <Badge variant='default'>78% Confidence</Badge>
                    </div>
                    <div className='text-2xl font-bold text-green-600'>,250</div>
                    <div className='text-sm text-muted-foreground'>Predicted target</div>
                  </div>

                  <div className='p-4 border rounded-lg'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='font-semibold'>ETH/USDT (12h)</span>
                      <Badge variant='secondary'>65% Confidence</Badge>
                    </div>
                    <div className='text-2xl font-bold text-blue-600'>,520</div>
                    <div className='text-sm text-muted-foreground'>Predicted target</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Sentiment */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <TrendingUp className='w-5 h-5 mr-2' />
                  Market Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span>Fear & Greed Index</span>
                    <Badge variant='default'>Neutral (52)</Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Social Media Buzz</span>
                    <Badge variant='secondary'>High</Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>News Sentiment</span>
                    <Badge variant='outline'>Positive</Badge>
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    🟢 Overall market sentiment is bullish with increased social activity
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <AlertTriangle className='w-5 h-5 mr-2' />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='p-4 border rounded-lg'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='font-semibold'>Portfolio Risk</span>
                      <Badge variant='default'>Medium</Badge>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Diversification score: 7.2/10
                    </div>
                  </div>

                  <div className='p-4 border rounded-lg'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='font-semibold'>Market Volatility</span>
                      <Badge variant='secondary'>High</Badge>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      VIX: 23.4 (Elevated levels)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Signals */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Target className='w-5 h-5 mr-2' />
                  AI Trading Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <div className='font-medium'>BTC Long Signal</div>
                      <div className='text-sm text-muted-foreground'>Based on trend analysis</div>
                    </div>
                    <div className='text-right'>
                      <Badge variant='default'>BUY</Badge>
                      <div className='text-sm text-green-600 mt-1'>85% accuracy</div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <div className='font-medium'>ETH Reversal Pattern</div>
                      <div className='text-sm text-muted-foreground'>Double bottom formation</div>
                    </div>
                    <div className='text-right'>
                      <Badge variant='secondary'>WATCH</Badge>
                      <div className='text-sm text-blue-600 mt-1'>72% probability</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
