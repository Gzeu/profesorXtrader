/**
 * ProfesorXTrader - Advanced User Analytics System
 * Phase 4 Implementation - Real-time User Behavior Tracking
 * 
 * Features:
 * - Real-time user session tracking
 * - Trading behavior analysis
 * - Performance metrics collection
 * - Heat map data generation
 * - User journey optimization
 */

import { EventEmitter } from 'events';

interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  deviceInfo: {
    userAgent: string;
    screen: { width: number; height: number };
    timezone: string;
  };
  tradingActivity: {
    symbolsViewed: string[];
    indicatorsUsed: string[];
    timeframesAnalyzed: string[];
    aiQueriesCount: number;
    avgSessionDuration: number;
  };
  performanceMetrics: {
    pageLoadTime: number;
    apiResponseTimes: number[];
    errorCount: number;
    featureUsage: Map<string, number>;
  };
}

interface AnalyticsEvent {
  type: 'page_view' | 'feature_use' | 'trading_action' | 'ai_query' | 'performance' | 'error';
  timestamp: Date;
  sessionId: string;
  data: any;
  metadata?: {
    userAgent: string;
    referrer: string;
    url: string;
  };
}

class UserAnalytics extends EventEmitter {
  private sessions: Map<string, UserSession> = new Map();
  private events: AnalyticsEvent[] = [];
  private isTracking: boolean = true;
  private batchSize: number = 50;
  private flushInterval: number = 30000; // 30 seconds

  constructor() {
    super();
    this.initializeTracking();
    this.startPeriodicFlush();
  }

  /**
   * Initialize analytics tracking system
   */
  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('page_view', {
        visible: !document.hidden,
        timestamp: new Date()
      });
    });

    // Track user interactions
    window.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.analytics) {
        this.trackFeatureUsage(target.dataset.analytics);
      }
    });

    // Track performance metrics
    if ('performance' in window) {
      this.trackPerformanceMetrics();
    }
  }

  /**
   * Start a new user session
   */
  startSession(deviceInfo?: any): string {
    const sessionId = this.generateSessionId();
    const session: UserSession = {
      sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      deviceInfo: deviceInfo || this.getDeviceInfo(),
      tradingActivity: {
        symbolsViewed: [],
        indicatorsUsed: [],
        timeframesAnalyzed: [],
        aiQueriesCount: 0,
        avgSessionDuration: 0
      },
      performanceMetrics: {
        pageLoadTime: 0,
        apiResponseTimes: [],
        errorCount: 0,
        featureUsage: new Map()
      }
    };

    this.sessions.set(sessionId, session);
    this.emit('session_start', session);
    
    return sessionId;
  }

  /**
   * Track a user event
   */
  trackEvent(type: AnalyticsEvent['type'], data: any, sessionId?: string): void {
    if (!this.isTracking) return;

    const event: AnalyticsEvent = {
      type,
      timestamp: new Date(),
      sessionId: sessionId || this.getCurrentSessionId(),
      data,
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href
      }
    };

    this.events.push(event);
    this.updateSessionActivity(event.sessionId);
    this.emit('event_tracked', event);

    // Auto-flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Track trading activity
   */
  trackTradingActivity(activity: {
    action: 'view_symbol' | 'use_indicator' | 'change_timeframe' | 'ai_analysis';
    symbol?: string;
    indicator?: string;
    timeframe?: string;
    sessionId?: string;
  }): void {
    const sessionId = activity.sessionId || this.getCurrentSessionId();
    const session = this.sessions.get(sessionId);
    
    if (!session) return;

    switch (activity.action) {
      case 'view_symbol':
        if (activity.symbol && !session.tradingActivity.symbolsViewed.includes(activity.symbol)) {
          session.tradingActivity.symbolsViewed.push(activity.symbol);
        }
        break;
      case 'use_indicator':
        if (activity.indicator && !session.tradingActivity.indicatorsUsed.includes(activity.indicator)) {
          session.tradingActivity.indicatorsUsed.push(activity.indicator);
        }
        break;
      case 'change_timeframe':
        if (activity.timeframe && !session.tradingActivity.timeframesAnalyzed.includes(activity.timeframe)) {
          session.tradingActivity.timeframesAnalyzed.push(activity.timeframe);
        }
        break;
      case 'ai_analysis':
        session.tradingActivity.aiQueriesCount++;
        break;
    }

    this.trackEvent('trading_action', activity, sessionId);
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName: string, sessionId?: string): void {
    const sid = sessionId || this.getCurrentSessionId();
    const session = this.sessions.get(sid);
    
    if (session) {
      const currentCount = session.performanceMetrics.featureUsage.get(featureName) || 0;
      session.performanceMetrics.featureUsage.set(featureName, currentCount + 1);
    }

    this.trackEvent('feature_use', { feature: featureName }, sid);
  }

  /**
   * Track AI model performance
   */
  trackAIPerformance(modelData: {
    modelType: 'price_prediction' | 'pattern_detection' | 'sentiment_analysis';
    accuracy: number;
    processingTime: number;
    inputSize: number;
    confidence: number;
  }): void {
    this.trackEvent('ai_query', {
      model: modelData.modelType,
      metrics: {
        accuracy: modelData.accuracy,
        processingTime: modelData.processingTime,
        inputSize: modelData.inputSize,
        confidence: modelData.confidence
      },
      timestamp: new Date()
    });
  }

  /**
   * Track performance metrics
   */
  private trackPerformanceMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const sessionId = this.getCurrentSessionId();
      const session = this.sessions.get(sessionId);
      
      if (session) {
        session.performanceMetrics.pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
      }

      this.trackEvent('performance', {
        pageLoad: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        firstPaint: this.getFirstPaintTime(),
        memoryUsage: this.getMemoryUsage()
      });
    }
  }

  /**
   * Get analytics summary for dashboard
   */
  getAnalyticsSummary(): {
    activeSessions: number;
    totalEvents: number;
    topFeatures: Array<{feature: string, usage: number}>;
    averageSessionDuration: number;
    errorRate: number;
  } {
    const activeSessions = this.sessions.size;
    const totalEvents = this.events.length;
    
    // Calculate top features across all sessions
    const featureUsage = new Map<string, number>();
    this.sessions.forEach(session => {
      session.performanceMetrics.featureUsage.forEach((count, feature) => {
        const currentCount = featureUsage.get(feature) || 0;
        featureUsage.set(feature, currentCount + count);
      });
    });

    const topFeatures = Array.from(featureUsage.entries())
      .map(([feature, usage]) => ({ feature, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    // Calculate average session duration
    const sessionDurations = Array.from(this.sessions.values())
      .map(session => session.lastActivity.getTime() - session.startTime.getTime());
    const averageSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 0;

    // Calculate error rate
    const errorEvents = this.events.filter(e => e.type === 'error').length;
    const errorRate = totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;

    return {
      activeSessions,
      totalEvents,
      topFeatures,
      averageSessionDuration,
      errorRate
    };
  }

  /**
   * Generate heat map data for UI optimization
   */
  generateHeatMapData(): Array<{
    element: string;
    interactions: number;
    position: { x: number, y: number };
    effectiveness: number;
  }> {
    const elementInteractions = new Map<string, number>();
    
    this.events
      .filter(e => e.type === 'feature_use')
      .forEach(event => {
        const element = event.data.feature;
        const currentCount = elementInteractions.get(element) || 0;
        elementInteractions.set(element, currentCount + 1);
      });

    return Array.from(elementInteractions.entries())
      .map(([element, interactions]) => ({
        element,
        interactions,
        position: this.getElementPosition(element),
        effectiveness: this.calculateEffectiveness(element, interactions)
      }))
      .sort((a, b) => b.interactions - a.interactions);
  }

  /**
   * Flush events to storage/API
   */
  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Send to analytics API endpoint
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: eventsToFlush,
          timestamp: new Date()
        })
      });

      this.emit('events_flushed', eventsToFlush.length);
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-add events back to queue
      this.events.unshift(...eventsToFlush);
    }
  }

  /**
   * Start periodic event flushing
   */
  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentSessionId(): string {
    return Array.from(this.sessions.keys())[0] || this.startSession();
  }

  private updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private getFirstPaintTime(): number {
    const paintTiming = performance.getEntriesByType('paint');
    const firstPaint = paintTiming.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getMemoryUsage(): any {
    return (performance as any).memory || { usedJSHeapSize: 0, totalJSHeapSize: 0 };
  }

  private getElementPosition(elementId: string): { x: number, y: number } {
    // Mock implementation - in real app, would get actual element positions
    return { x: Math.random() * 100, y: Math.random() * 100 };
  }

  private calculateEffectiveness(element: string, interactions: number): number {
    // Mock effectiveness calculation based on interactions vs expected usage
    return Math.min(interactions / 10, 1) * 100;
  }

  /**
   * Clean up old sessions and events
   */
  cleanup(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Remove old sessions
    this.sessions.forEach((session, sessionId) => {
      if (now.getTime() - session.lastActivity.getTime() > maxAge) {
        this.sessions.delete(sessionId);
      }
    });

    // Remove old events
    this.events = this.events.filter(event => 
      now.getTime() - event.timestamp.getTime() < maxAge
    );
  }

  /**
   * Export analytics data for reporting
   */
  exportData(): {
    sessions: UserSession[];
    events: AnalyticsEvent[];
    summary: any;
  } {
    return {
      sessions: Array.from(this.sessions.values()),
      events: [...this.events],
      summary: this.getAnalyticsSummary()
    };
  }
}

// Singleton instance
export const userAnalytics = new UserAnalytics();
export default UserAnalytics;
export type { UserSession, AnalyticsEvent };