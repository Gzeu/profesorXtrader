import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChartLine, TrendingUp, BarChart3 } from 'lucide-react'

export default function ChartsPage() {
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
            <h1 className='text-3xl font-bold'>Trading Charts</h1>
            <p className='text-muted-foreground'>Advanced charting and technical analysis</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <ChartLine className='w-5 h-5 mr-2' />
                  BTC/USDT - 1H Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-64 bg-muted rounded-lg flex items-center justify-center'>
                  <div className='text-center'>
                    <ChartLine className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
                    <p className='text-muted-foreground'>TradingView Chart Component</p>
                    <Badge variant='outline' className='mt-2'>Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <BarChart3 className='w-5 h-5 mr-2' />
                  Volume Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span>Volume (24h)</span>
                    <Badge variant='default'>2.1M BTC</Badge>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Market Cap</span>
                    <Badge variant='secondary'></Badge>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Dominance</span>
                    <Badge variant='outline'>52.3%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <TrendingUp className='w-5 h-5 mr-2' />
                  Technical Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='text-center p-4 border rounded-lg'>
                    <div className='text-2xl font-bold text-green-600'>67.5</div>
                    <div className='text-sm text-muted-foreground'>RSI</div>
                  </div>
                  <div className='text-center p-4 border rounded-lg'>
                    <div className='text-2xl font-bold text-blue-600'>0.382</div>
                    <div className='text-sm text-muted-foreground'>Fib Level</div>
                  </div>
                  <div className='text-center p-4 border rounded-lg'>
                    <div className='text-2xl font-bold text-purple-600'>+1.2%</div>
                    <div className='text-sm text-muted-foreground'>MACD</div>
                  </div>
                  <div className='text-center p-4 border rounded-lg'>
                    <div className='text-2xl font-bold text-orange-600'>85</div>
                    <div className='text-sm text-muted-foreground'>Stochastic</div>
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
