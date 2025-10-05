'use client'

import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

export default function TradingPage() {
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
            <h1 className='text-3xl font-bold'>Active Trading</h1>
            <p className='text-muted-foreground'>Manage your positions and execute trades</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Portfolio Overview */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <DollarSign className='w-5 h-5 mr-2' />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span>Total Balance</span>
                    <span className='text-lg font-bold'>,456.78</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>P&L Today</span>
                    <span className='text-green-600 font-semibold'>+.56</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Open Positions</span>
                    <Badge variant='default'>3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button className='w-full' size='sm'>
                  <TrendingUp className='w-4 h-4 mr-2' />
                  Buy BTC
                </Button>
                <Button className='w-full' variant='outline' size='sm'>
                  <TrendingDown className='w-4 h-4 mr-2' />
                  Sell ETH
                </Button>
                <Button className='w-full' variant='secondary' size='sm'>
                  <Activity className='w-4 h-4 mr-2' />
                  View Orders
                </Button>
              </CardContent>
            </Card>

            {/* Market Status */}
            <Card>
              <CardHeader>
                <CardTitle>Market Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span>BTC/USDT</span>
                    <div className='text-right'>
                      <div className='font-semibold'>,250</div>
                      <div className='text-green-600 text-sm'>+2.1%</div>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>ETH/USDT</span>
                    <div className='text-right'>
                      <div className='font-semibold'>,450</div>
                      <div className='text-red-600 text-sm'>-0.8%</div>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>BNB/USDT</span>
                    <div className='text-right'>
                      <div className='font-semibold'></div>
                      <div className='text-green-600 text-sm'>+1.4%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Open Positions */}
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='font-semibold'>BTC/USDT Long</div>
                    <div className='text-sm text-muted-foreground'>Entry: ,800</div>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold text-green-600'>+.78</div>
                    <div className='text-sm text-muted-foreground'>+0.37%</div>
                  </div>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='font-semibold'>ETH/USDT Short</div>
                    <div className='text-sm text-muted-foreground'>Entry: ,480</div>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold text-red-600'>-.45</div>
                    <div className='text-sm text-muted-foreground'>-0.94%</div>
                  </div>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <div className='font-semibold'>ADA/USDT Long</div>
                    <div className='text-sm text-muted-foreground'>Entry: .485</div>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold text-green-600'>+.34</div>
                    <div className='text-sm text-muted-foreground'>+2.54%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
