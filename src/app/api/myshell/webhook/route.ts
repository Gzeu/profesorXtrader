import { NextRequest, NextResponse } from 'next/server';

// MyShell webhook endpoint for bot interactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[MyShell Webhook] Received:', JSON.stringify(body, null, 2));
    
    // Handle different webhook events
    const { event_type, user_id, message, session_id } = body;
    
    switch (event_type) {
      case 'message_received':
        return handleMessageReceived(message, user_id, session_id);
      
      case 'session_started':
        return handleSessionStarted(user_id, session_id);
        
      case 'session_ended':
        return handleSessionEnded(user_id, session_id);
        
      default:
        console.log(`[MyShell Webhook] Unknown event type: ${event_type}`);
        return NextResponse.json({ status: 'ignored' });
    }
    
  } catch (error) {
    console.error('[MyShell Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleMessageReceived(message: string, userId: string, sessionId: string) {
  // Log user interaction for analytics
  console.log(`[MyShell] User ${userId} sent: ${message}`);
  
  // You can add custom logic here for tracking user behavior
  // or triggering specific actions based on messages
  
  return NextResponse.json({
    status: 'processed',
    user_id: userId,
    session_id: sessionId,
    timestamp: new Date().toISOString()
  });
}

async function handleSessionStarted(userId: string, sessionId: string) {
  console.log(`[MyShell] Session started for user ${userId}`);
  
  // Track new user sessions
  return NextResponse.json({
    status: 'session_started',
    welcome_message: 'Welcome to ProfesorXtrader AI!'
  });
}

async function handleSessionEnded(userId: string, sessionId: string) {
  console.log(`[MyShell] Session ended for user ${userId}`);
  
  return NextResponse.json({
    status: 'session_ended'
  });
}

// Health check
export async function GET() {
  return NextResponse.json({
    service: 'ProfesorXtrader MyShell Webhook',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}