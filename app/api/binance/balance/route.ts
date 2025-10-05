import { NextRequest, NextResponse } from 'next/server'

// Mock Binance balance data for development
const mockBalanceData = {
  balances: [
    {
      asset: 'BTC',
      free: '0.05623487',
      locked: '0.00000000',
      valueUSD: 3456.78
    },
    {
      asset: 'ETH', 
      free: '1.45892341',
      locked: '0.00000000',
      valueUSD: 2574.23
    },
    {
      asset: 'ADA',
      free: '1500.00000000',
      locked: '0.00000000', 
      valueUSD: 487.50
    },
    {
      asset: 'USDT',
      free: '2938.47',
      locked: '150.00',
      valueUSD: 3088.47
    }
  ],
  totalValueUSD: 9606.98,
  lastUpdated: new Date().toISOString()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

    // In production, you would:
    // 1. Validate API keys from headers/auth
    // 2. Make actual Binance API calls
    // 3. Handle rate limiting
    // 4. Implement proper error handling

    if (symbol) {
      const balance = mockBalanceData.balances.find(
        b => b.asset.toLowerCase() === symbol.toLowerCase()
      )
      
      if (!balance) {
        return NextResponse.json(
          { error: `Balance not found for ${symbol}` },
          { status: 404 }
        )
      }

      return NextResponse.json(balance)
    }

    // Return all balances
    return NextResponse.json(mockBalanceData)

  } catch (error) {
    console.error('Binance balance API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch balance data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}