/**
 * ProfesorXTrader - Advanced Analytics Dashboard API
 * Phase 4 Implementation - Real-time Analytics Dashboard Endpoint
 * 
 * GET /api/analytics/dashboard
 * Returns comprehensive analytics data for dashboard display
 */

import { NextRequest, NextResponse } from 'next/server';
import { userAnalytics } from '@/services/analytics/UserAnalytics';
import { tradingPerformanceTracker } from '@/services/analytics/TradingPerformance';
import { aiModelOptimizer } from '@/services/ai/ModelOptimizer';

interface DashboardData {
  timestamp: string;
  userAnalytics: {
    activeSessions: number;
    totalEvents: number;
    topFeatures: Array<{feature: string, usage: number}>;
    averageSessionDuration: number;
    errorRate: number;
    heatMapData: Array<{
      element: string;
      interactions: number;
      position: { x: number, y: number };
      effectiveness: number;
    }>;
  };
  tradingPerformance: {
    summary: any;
    aiPerformance: any[];
    riskMetrics: any;
    recentTrades: any[];
    positions: any[];
    recommendations: string[];
  };
  aiModels: {
    optimizationStatus: {
      isOptimizing: boolean;
      queueLength: number;
      modelCount: number;
      ensembleCount: number;
    };
    performanceData: any[];
  };
  systemMetrics: {
    uptime: number;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    apiLatency: {
      average: number;
      p95: number;
      p99: number;
    };
    errorCounts: {
      last24h: number;
      lastHour: number;
    };
  };
}

// Cache for performance metrics
let metricsCache: {
  data: DashboardData | null;
  lastUpdated: number;
} = {
  data: null,
  lastUpdated: 0
};

const CACHE_DURATION = 30 * 1000; // 30 seconds

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const now = Date.now();
    
    // Return cached data if available and recent
    if (metricsCache.data && (now - metricsCache.lastUpdated) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: metricsCache.data,
        cached: true,
        cacheAge: now - metricsCache.lastUpdated
      });
    }

    // Get user analytics data
    const userAnalyticsData = {
      ...userAnalytics.getAnalyticsSummary(),
      heatMapData: userAnalytics.generateHeatMapData()
    };

    // Get trading performance data
    const tradingPerformanceData = tradingPerformanceTracker.generatePerformanceReport();

    // Get AI model optimization status
    const aiModelData = {
      optimizationStatus: aiModelOptimizer.getOptimizationStatus(),
      performanceData: aiModelOptimizer.exportPerformanceData()
    };

    // Get system metrics
    const systemMetrics = await getSystemMetrics();

    const dashboardData: DashboardData = {
      timestamp: new Date().toISOString(),
      userAnalytics: userAnalyticsData,
      tradingPerformance: tradingPerformanceData,
      aiModels: aiModelData,
      systemMetrics
    };

    // Update cache
    metricsCache = {
      data: dashboardData,
      lastUpdated: now
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      cached: false,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics dashboard API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate analytics dashboard data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Get system performance metrics
 */
async function getSystemMetrics() {
  const uptime = process.uptime();
  
  // Memory usage
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const memoryPercentage = (usedMemory / totalMemory) * 100;

  // Mock API latency data (in production, would come from monitoring service)
  const apiLatency = {
    average: Math.random() * 100 + 50, // 50-150ms
    p95: Math.random() * 200 + 150,    // 150-350ms
    p99: Math.random() * 300 + 350     // 350-650ms
  };

  // Mock error counts (in production, would come from error tracking)
  const errorCounts = {
    last24h: Math.floor(Math.random() * 10),
    lastHour: Math.floor(Math.random() * 3)
  };

  return {
    uptime: Math.floor(uptime),
    memoryUsage: {
      used: Math.floor(usedMemory / 1024 / 1024), // MB
      total: Math.floor(totalMemory / 1024 / 1024), // MB
      percentage: Math.round(memoryPercentage * 100) / 100
    },
    apiLatency,
    errorCounts
  };
}

/**
 * POST /api/analytics/dashboard - Update analytics settings
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, settings } = body;

    switch (action) {
      case 'clear_cache':
        metricsCache = { data: null, lastUpdated: 0 };
        return NextResponse.json({
          success: true,
          message: 'Analytics cache cleared'
        });

      case 'update_settings':
        // In a real implementation, would update analytics settings
        return NextResponse.json({
          success: true,
          message: 'Analytics settings updated',
          settings
        });

      case 'export_data':
        const exportData = {
          userAnalytics: userAnalytics.exportData(),
          tradingPerformance: tradingPerformanceTracker.generatePerformanceReport(),
          aiModels: aiModelOptimizer.exportPerformanceData(),
          timestamp: new Date().toISOString()
        };
        
        return NextResponse.json({
          success: true,
          data: exportData
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Analytics dashboard POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process analytics request'
    }, { status: 500 });
  }
}