import { NextRequest, NextResponse } from 'next/server'

interface AnalyticsEvent {
  type: 'page_view' | 'feature_use' | 'trading_action' | 'ai_query' | 'performance' | 'error'
  timestamp: string
  sessionId: string
  data: Record<string, unknown>
  metadata?: {
    userAgent: string
    referrer: string
    url: string
  }
}

interface EventsPayload {
  events: AnalyticsEvent[]
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body: EventsPayload = await request.json()
    
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid events payload' },
        { status: 400 }
      )
    }

    // Process analytics events
    console.log(`Processing ${body.events.length} analytics events`)
    
    // Here you would typically:
    // 1. Validate event structure
    // 2. Store events in database
    // 3. Trigger real-time analytics processing
    // 4. Update user session metrics
    
    // For now, just log the events
    body.events.forEach((event, index) => {
      console.log(`Event ${index + 1}:`, {
        type: event.type,
        sessionId: event.sessionId,
        timestamp: event.timestamp,
        dataKeys: Object.keys(event.data || {})
      })
    })

    return NextResponse.json({
      success: true,
      processed: body.events.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Analytics events processing error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process analytics events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'ProfesorXTrader Analytics API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      'POST /api/analytics/events': 'Submit analytics events',
      'GET /api/analytics/events': 'Service status'
    },
    timestamp: new Date().toISOString()
  })
}