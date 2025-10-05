'use client'

import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, TrendingUp, TrendingDown, Clock } from 'lucide-react'

export default function LivePage() {
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
            <h1 className='text-3xl font-bold'>Live Market Feed</h1>
            <p className='text-muted-foreground'>Real-time market data and alerts</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Market Overview */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Activity className='w-5 h-5 mr-2' />
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span>BTC Dominance</span>
                    <Badge variant='default'>52.3%</Badge>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Total Market Cap</span>
                    <span className='font-semibold'>.7T</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>24h Volume</span>
                    <span className='font-semibold'>.2B</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Active Traders</span>
                    <Badge variant='secondary'>1.2M</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Price Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <div className='font-medium'>BTC > ,000</div>
                      <div className='text-sm text-muted-foreground'>Triggered 2min ago</div>
                    </div>
                    <Badge variant='default'>ACTIVE</Badge>
                  </div>

                  <div className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <div className='font-medium'>ETH < ,400</div>
                      <div className='text-sm text-muted-foreground'>Waiting...</div>
                    </div>
                    <Badge variant='secondary'>PENDING</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Movers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Movers (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <TrendingUp className='w-4 h-4 text-green-600' />
                      <span>SOL</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-semibold text-green-600'>+12.4%</div>
                      <div className='text-sm text-muted-foreground'>.50</div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <TrendingUp className='w-4 h-4 text-green-600' />
                      <span>AVAX</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-semibold text-green-600'>+8.7%</div>
                      <div className='text-sm text-muted-foreground'>.20</div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <TrendingDown className='w-4 h-4 text-red-600' />
                      <span>LTC</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-semibold text-red-600'>-3.2%</div>
                      <div className='text-sm text-muted-foreground'>.10</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Price Ticker */}
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Clock className='w-5 h-5 mr-2' />
                Live Price Ticker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                <div className='text-center p-3 border rounded-lg'>
                  <div className='font-semibold'>BTC</div>
                  <div className='text-lg font-bold'>,250</div>
                  <Badge variant='default' className='text-xs'>+2.1%</Badge>
                </div>

                <div className='text-center p-3 border rounded-lg'>
                  <div className='font-semibold'>ETH</div>
                  <div className='text-lg font-bold'>,450</div>
                  <Badge variant='destructive' className='text-xs'>-0.8%</Badge>
                </div>

                <div className='text-center p-3 border rounded-lg'>
                  <div className='font-semibold'>BNB</div>
                  <div className='text-lg font-bold'></div>
                  <Badge variant='default' className='text-xs'>+1.4%</Badge>
                </div>

                <div className='text-center p-3 border rounded-lg'>
                  <div className='font-semibold'>ADA</div>
                  <div className='text-lg font-bold'>.485</div>
                  <Badge variant='default' className='text-xs'>+3.2%</Badge>
                </div>

                <div className='text-center p-3 border rounded-lg'>
                  <div className='font-semibold'>SOL</div>
                  <div className='text-lg font-bold'>.50</div>
                  <Badge variant='default' className='text-xs'>+12.4%</Badge>
                </div>

                <div className='text-center p-3 border rounded-lg'>
                  <div className='font-semibold'>DOT</div>
                  <div className='text-lg font-bold'>.25</div>
                  <Badge variant='secondary' className='text-xs'>-1.1%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
