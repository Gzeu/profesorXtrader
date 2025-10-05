'use client'

import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, PieChart } from 'lucide-react'

export default function PortfolioPage() {
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
            <h1 className='text-3xl font-bold'>Portfolio</h1>
            <p className='text-muted-foreground'>Track your performance and asset allocation</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$12,456.78</div>
                <p className='text-xs text-green-600'>+2.3% today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>P&L Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-green-600'>+$234.56</div>
                <p className='text-xs text-muted-foreground'>+1.9%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>73.2%</div>
                <p className='text-xs text-muted-foreground'>Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Active Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>5</div>
                <p className='text-xs text-muted-foreground'>3 long, 2 short</p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <PieChart className='w-5 h-5 mr-2' />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-3 h-3 bg-orange-500 rounded-full'></div>
                      <span>BTC</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-semibold'>45.2%</div>
                      <div className='text-sm text-muted-foreground'>$5,623</div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                      <span>ETH</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-semibold'>28.7%</div>
                      <div className='text-sm text-muted-foreground'>$3,574</div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                      <span>ADA</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-semibold'>15.3%</div>
                      <div className='text-sm text-muted-foreground'>$1,905</div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                      <span>Others</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-semibold'>10.8%</div>
                      <div className='text-sm text-muted-foreground'>$1,355</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <BarChart3 className='w-5 h-5 mr-2' />
                  Performance (30D)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-48 bg-muted rounded-lg flex items-center justify-center'>
                  <div className='text-center'>
                    <BarChart3 className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
                    <p className='text-muted-foreground'>Performance Chart</p>
                    <Badge variant='outline' className='mt-2'>Interactive</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trades */}
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <div className='font-semibold'>BTC/USDT</div>
                    <div className='text-sm text-muted-foreground'>Long position closed</div>
                  </div>
                  <div className='text-right'>
                    <Badge variant='default'>+$123.78</Badge>
                    <div className='text-sm text-green-600 mt-1'>+2.3%</div>
                  </div>
                </div>

                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <div className='font-semibold'>ETH/USDT</div>
                    <div className='text-sm text-muted-foreground'>Short position closed</div>
                  </div>
                  <div className='text-right'>
                    <Badge variant='secondary'>-$45.23</Badge>
                    <div className='text-sm text-red-600 mt-1'>-0.9%</div>
                  </div>
                </div>

                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <div className='font-semibold'>ADA/USDT</div>
                    <div className='text-sm text-muted-foreground'>Long position closed</div>
                  </div>
                  <div className='text-right'>
                    <Badge variant='default'>+$67.89</Badge>
                    <div className='text-sm text-green-600 mt-1'>+3.1%</div>
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