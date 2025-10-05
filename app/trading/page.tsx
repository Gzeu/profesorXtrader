'use client'

import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react'

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
            <h1 className='text-3xl font-bold'>Trading</h1>
            <p className='text-muted-foreground'>Execute trades and manage positions</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Account Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$12,456.78</div>
                <p className='text-xs text-green-600'>Available for trading</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Open Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>5</div>
                <p className='text-xs text-muted-foreground'>3 profitable, 2 at loss</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Today's P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-green-600'>+$234.56</div>
                <p className='text-xs text-green-600'>+1.88%</p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Open Positions */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Activity className='w-5 h-5 mr-2' />
                  Open Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <Badge variant='default'>LONG</Badge>
                        <span className='font-semibold'>BTC/USDT</span>
                      </div>
                      <div className='text-sm text-muted-foreground'>Size: 0.05 BTC</div>
                    </div>
                    <div className='text-right'>
                      <div className='flex items-center text-green-600'>
                        <TrendingUp className='w-4 h-4 mr-1' />
                        +$156.78
                      </div>
                      <div className='text-sm text-green-600'>+2.3%</div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <Badge variant='destructive'>SHORT</Badge>
                        <span className='font-semibold'>ETH/USDT</span>
                      </div>
                      <div className='text-sm text-muted-foreground'>Size: 2.1 ETH</div>
                    </div>
                    <div className='text-right'>
                      <div className='flex items-center text-red-600'>
                        <TrendingDown className='w-4 h-4 mr-1' />
                        -$45.23
                      </div>
                      <div className='text-sm text-red-600'>-1.2%</div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <Badge variant='default'>LONG</Badge>
                        <span className='font-semibold'>ADA/USDT</span>
                      </div>
                      <div className='text-sm text-muted-foreground'>Size: 1,500 ADA</div>
                    </div>
                    <div className='text-right'>
                      <div className='flex items-center text-green-600'>
                        <TrendingUp className='w-4 h-4 mr-1' />
                        +$67.89
                      </div>
                      <div className='text-sm text-green-600'>+4.1%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Trade */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Target className='w-5 h-5 mr-2' />
                  Quick Trade
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <Button className='w-full bg-green-600 hover:bg-green-700'>
                    BUY
                  </Button>
                  <Button className='w-full bg-red-600 hover:bg-red-700'>
                    SELL
                  </Button>
                </div>

                <div className='space-y-3'>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>Symbol</label>
                    <select className='w-full p-2 border rounded-md bg-background'>
                      <option>BTC/USDT</option>
                      <option>ETH/USDT</option>
                      <option>ADA/USDT</option>
                      <option>DOT/USDT</option>
                    </select>
                  </div>

                  <div>
                    <label className='text-sm font-medium mb-1 block'>Amount (USDT)</label>
                    <input 
                      type='number' 
                      placeholder='100.00' 
                      className='w-full p-2 border rounded-md bg-background'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium mb-1 block'>Order Type</label>
                    <select className='w-full p-2 border rounded-md bg-background'>
                      <option>Market</option>
                      <option>Limit</option>
                      <option>Stop Loss</option>
                      <option>Take Profit</option>
                    </select>
                  </div>
                </div>

                <Button className='w-full'>Place Order</Button>
              </CardContent>
            </Card>
          </div>

          {/* Order History */}
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='default'>FILLED</Badge>
                      <span className='font-semibold'>BTC/USDT</span>
                    </div>
                    <div className='text-sm text-muted-foreground'>Market Buy - 0.05 BTC</div>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold'>$3,245.67</div>
                    <div className='text-sm text-muted-foreground'>12:34 PM</div>
                  </div>
                </div>

                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='secondary'>CANCELLED</Badge>
                      <span className='font-semibold'>ETH/USDT</span>
                    </div>
                    <div className='text-sm text-muted-foreground'>Limit Sell - 1.2 ETH</div>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold'>$2,456.00</div>
                    <div className='text-sm text-muted-foreground'>11:28 AM</div>
                  </div>
                </div>

                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='default'>FILLED</Badge>
                      <span className='font-semibold'>ADA/USDT</span>
                    </div>
                    <div className='text-sm text-muted-foreground'>Market Buy - 1,500 ADA</div>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold'>$487.50</div>
                    <div className='text-sm text-muted-foreground'>10:15 AM</div>
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