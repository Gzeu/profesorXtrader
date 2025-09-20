import { NextRequest, NextResponse } from 'next/server'
import { initializeBinanceClient } from '@/lib/binance-client'

// Stochează configurația în memorie (pentru dezvoltare)
// Într-un mediu de producție, acestea ar trebui stocate în baza de date
let appConfig = {
  binanceConfigured: false,
  testnet: false,
  lastConfigured: null as number | null
}

export async function GET() {
  return NextResponse.json({
    configured: appConfig.binanceConfigured,
    testnet: appConfig.testnet,
    lastConfigured: appConfig.lastConfigured
  })
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, secretKey, testnet } = await request.json()
    
    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: 'API key and secret key are required' },
        { status: 400 }
      )
    }

    // Inițializează clientul Binance
    const client = initializeBinanceClient({
      apiKey,
      secretKey,
      testnet: testnet || false
    })

    // Testează credențialele
    const isValid = await client.validateCredentials()
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid API credentials' },
        { status: 401 }
      )
    }

    // Actualizează configurația
    appConfig = {
      binanceConfigured: true,
      testnet: testnet || false,
      lastConfigured: Date.now()
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully',
      testnet: testnet || false
    })
    
  } catch (error: any) {
    console.error('Configuration error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to save configuration',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  appConfig = {
    binanceConfigured: false,
    testnet: false,
    lastConfigured: null
  }

  return NextResponse.json({
    success: true,
    message: 'Configuration cleared successfully'
  })
}
