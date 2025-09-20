import { NextRequest, NextResponse } from 'next/server'
import { getBinanceClient } from '@/lib/binance-client'

export async function GET(request: NextRequest) {
  try {
    const client = getBinanceClient()
    
    if (!client) {
      return NextResponse.json(
        { error: 'Binance client not initialized' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const get24hr = searchParams.get('24hr') === 'true'

    if (symbol) {
      // Obține prețul pentru un simbol specific
      if (get24hr) {
        const ticker = await client.get24hrTicker(symbol.toUpperCase())
        return NextResponse.json(ticker)
      } else {
        const price = await client.getPrice(symbol.toUpperCase())
        return NextResponse.json(price)
      }
    } else {
      // Obține prețurile pentru toate simbolurile
      if (get24hr) {
        const tickers = await client.getAll24hrTickers()
        return NextResponse.json(tickers)
      } else {
        const prices = await client.getAllPrices()
        return NextResponse.json(prices)
      }
    }
    
  } catch (error: any) {
    console.error('Binance prices API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch price data',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
