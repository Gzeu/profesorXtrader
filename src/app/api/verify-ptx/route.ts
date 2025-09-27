import { NextRequest, NextResponse } from 'next/server';
import { PTXVerificationService } from '../../../services/ptx-verification';
import { VerificationRequest } from '../../../types/ptx';

// Initialize verification service
const verificationService = new PTXVerificationService(
  process.env.JWT_SECRET
);

// POST /api/verify-ptx - Complete PTX holder verification
export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();
    
    // Validate request body
    if (!body.walletAddress || !body.signature || !body.message || !body.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check timestamp validity (within 5 minutes)
    const now = Date.now();
    const timeDiff = Math.abs(now - body.timestamp);
    if (timeDiff > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Request timestamp expired' },
        { status: 400 }
      );
    }

    // Perform verification
    const result = await verificationService.completeVerification(body);
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('PTX verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/verify-ptx/check - Check PTX balance without full verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const balanceResult = await verificationService.verifyPTXBalance(walletAddress);
    
    return NextResponse.json({
      isHolder: balanceResult.isHolder,
      balance: balanceResult.balanceFormatted,
      accessLevel: balanceResult.accessLevel,
      verified: balanceResult.verified,
    }, { status: 200 });
  } catch (error) {
    console.error('PTX balance check API error:', error);
    return NextResponse.json(
      { error: 'Failed to check PTX balance' },
      { status: 500 }
    );
  }
}