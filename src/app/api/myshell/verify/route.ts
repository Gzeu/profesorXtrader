import { NextRequest, NextResponse } from 'next/server';
import { PTXVerificationService } from '../../../../services/ptx-verification';
import { MYSHELL_CONFIG } from '../../../../lib/ptx-config';

// Initialize verification service
const verificationService = new PTXVerificationService(
  process.env.JWT_SECRET
);

// Middleware to verify PTX access for MyShell integration
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verificationService.verifyAccessToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      );
    }

    // Re-verify current PTX balance for security
    const balanceCheck = await verificationService.verifyPTXBalance(decoded.wallet);
    
    if (!balanceCheck.isHolder) {
      return NextResponse.json(
        { error: 'PTX balance no longer meets minimum requirements' },
        { status: 403 }
      );
    }

    // Return access information for MyShell
    return NextResponse.json({
      hasAccess: true,
      userWallet: decoded.wallet,
      ptxBalance: balanceCheck.balanceFormatted,
      accessLevel: balanceCheck.accessLevel,
      agentUrl: MYSHELL_CONFIG.agentUrl,
      profileUrl: MYSHELL_CONFIG.profileUrl,
      launchpadUrl: MYSHELL_CONFIG.launchpadUrl,
      features: {
        basic: balanceCheck.accessLevel !== 'none',
        advanced: ['advanced', 'premium'].includes(balanceCheck.accessLevel),
        premium: balanceCheck.accessLevel === 'premium',
      },
      timestamp: Date.now(),
    }, { status: 200 });
  } catch (error) {
    console.error('MyShell verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick access verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const token = searchParams.get('token');
    
    if (!wallet || !token) {
      return NextResponse.json(
        { error: 'Missing wallet or token parameter' },
        { status: 400 }
      );
    }

    const decoded = verificationService.verifyAccessToken(token);
    
    if (!decoded || decoded.wallet.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json(
        { hasAccess: false, error: 'Invalid verification' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      hasAccess: true,
      accessLevel: decoded.accessLevel,
      agentUrl: MYSHELL_CONFIG.agentUrl,
    }, { status: 200 });
  } catch (error) {
    console.error('MyShell quick verification error:', error);
    return NextResponse.json(
      { hasAccess: false, error: 'Verification failed' },
      { status: 200 }
    );
  }
}