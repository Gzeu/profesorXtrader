import { NextRequest, NextResponse } from 'next/server'
import { BinanceClient, getBinanceClient } from '@/lib/binance-client'

export async function GET(request: NextRequest) {
  try {
    const client = getBinanceClient()
    
    if (!client) {
      return NextResponse.json(
        { error: 'Binance client not initialized' },
        { status: 400 }
      )
    }

    // Obține informațiile despre contul Spot
    const spotAccount = await client.getAccountInfo()
    
    // Obține informațiile despre contul Futures
    let futuresAccount = null
    try {
      futuresAccount = await client.getFuturesAccountInfo()
    } catch (error) {
      console.log('Futures account not available or no permissions:', error)
    }

    return NextResponse.json({
      spot: spotAccount,
      futures: futuresAccount,
      timestamp: Date.now()
    })
    
  } catch (error: any) {
    console.error('Binance API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch account information',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
