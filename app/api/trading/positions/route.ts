import { NextRequest, NextResponse } from 'next/server'

// Mock trading positions data
const mockPositions = {
  positions: [
    {
      id: 'pos_001',
      symbol: 'BTCUSDT',
      side: 'LONG',
      size: 0.05,
      entryPrice: 64580.50,
      currentPrice: 65123.75,
      unrealizedPnL: 27.16,
      realizedPnL: 0,
      roi: 0.84,
      openTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      riskAmount: 64.58
    },
    {
      id: 'pos_002', 
      symbol: 'ETHUSDT',
      side: 'SHORT',
      size: 1.2,
      entryPrice: 2456.80,
      currentPrice: 2423.45,
      unrealizedPnL: 40.02,
      realizedPnL: 0,
      roi: 1.36,
      openTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      riskAmount: 49.14
    },
    {
      id: 'pos_003',
      symbol: 'ADAUSDT', 
      side: 'LONG',
      size: 1500,
      entryPrice: 0.3250,
      currentPrice: 0.3312,
      unrealizedPnL: 9.30,
      realizedPnL: 0,
      roi: 1.91,
      openTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      riskAmount: 9.75
    }
  ],
  summary: {
    totalPositions: 3,
    totalUnrealizedPnL: 76.48,
    totalRiskAmount: 123.47,
    profitablePositions: 3,
    losingPositions: 0
  },
  lastUpdated: new Date().toISOString()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

    if (symbol) {
      const position = mockPositions.positions.find(
        p => p.symbol.toLowerCase() === symbol.toLowerCase()
      )
      
      if (!position) {
        return NextResponse.json(
          { error: `Position not found for ${symbol}` },
          { status: 404 }
        )
      }

      return NextResponse.json(position)
    }

    // Return all positions
    return NextResponse.json(mockPositions)

  } catch (error) {
    console.error('Trading positions API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch positions data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Create new position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { symbol, side, size, price } = body
    
    if (!symbol || !side || !size || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, side, size, price' },
        { status: 400 }
      )
    }

    // Mock position creation
    const newPosition = {
      id: `pos_${Date.now()}`,
      symbol: symbol.toUpperCase(),
      side: side.toUpperCase(),
      size: parseFloat(size),
      entryPrice: parseFloat(price),
      currentPrice: parseFloat(price),
      unrealizedPnL: 0,
      realizedPnL: 0,
      roi: 0,
      openTime: new Date().toISOString(),
      riskAmount: parseFloat(size) * parseFloat(price) * 0.02
    }

    console.log('New position created:', newPosition)

    return NextResponse.json({
      success: true,
      position: newPosition
    }, { status: 201 })

  } catch (error) {
    console.error('Create position error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create position',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}