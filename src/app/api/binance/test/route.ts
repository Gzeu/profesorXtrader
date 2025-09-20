import { NextRequest, NextResponse } from 'next/server'
import { BinanceClient } from '@/lib/binance-client'

export async function POST(request: NextRequest) {
  try {
    const { apiKey, secretKey, testnet } = await request.json()
    
    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: 'API key and secret key are required' },
        { status: 400 }
      )
    }

    // Creează un client temporar pentru test
    const testClient = new BinanceClient({
      apiKey,
      secretKey,
      testnet: testnet || false
    })

    // Testează conectivitatea
    const isConnected = await testClient.testConnectivity()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Failed to connect to Binance API' },
        { status: 400 }
      )
    }

    // Testează autentificarea
    const isValid = await testClient.validateCredentials()
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid API credentials' },
        { status: 401 }
      )
    }

    // Obține informațiile de bază despre cont
    const accountInfo = await testClient.getAccountInfo()
    const serverTime = await testClient.getServerTime()

    return NextResponse.json({
      success: true,
      message: 'API credentials are valid',
      accountType: accountInfo.accountType,
      canTrade: accountInfo.canTrade,
      canWithdraw: accountInfo.canWithdraw,
      canDeposit: accountInfo.canDeposit,
      permissions: accountInfo.permissions,
      serverTime,
      testnet: testnet || false
    })
    
  } catch (error: any) {
    console.error('Binance API test error:', error)
    
    return NextResponse.json(
      { 
        error: 'API test failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
