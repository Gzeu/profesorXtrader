/**
 * ProfesorXTrader - Advanced Custom Alerting System
 * Phase 4 Implementation - AI-Powered Smart Alerts & Notifications
 * 
 * Features:
 * - Custom price alerts with AI predictions
 * - Performance threshold alerts
 * - Risk management notifications
 * - AI model accuracy alerts
 * - Multi-channel notifications (email, webhook, browser)
 * - Smart alert filtering and prioritization
 */

import { EventEmitter } from 'events';

interface Alert {
  id: string;
  type: 'price' | 'performance' | 'risk' | 'ai_model' | 'system' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  symbol?: string;
  currentValue?: number;
  thresholdValue?: number;
  timestamp: Date;
  isActive: boolean;
  isAcknowledged: boolean;
  channels: Array<'browser' | 'email' | 'webhook' | 'sms'>;
  metadata?: {
    aiPrediction?: {
      confidence: number;
      timeframe: string;
      expectedDirection: 'up' | 'down' | 'sideways';
    };
    tradingContext?: {
      position?: string;
      riskAmount?: number;
      stopLoss?: number;
    };
    systemContext?: {
      component: string;
      errorCode?: string;
      affectedFeatures?: string[];
    };
  };
}

interface AlertRule {
  id: string;
  name: string;
  type: Alert['type'];
  isEnabled: boolean;
  condition: {
    operator: '>' | '<' | '=' | '>=' | '<=' | '!=' | 'contains' | 'change';
    value: number | string;
    field: string; // e.g., 'price', 'volume', 'rsi', 'accuracy'
  };
  symbol?: string;
  severity: Alert['severity'];
  channels: Alert['channels'];
  cooldownMinutes: number; // Prevent spam
  lastTriggered?: Date;
  triggerCount: number;
  aiEnhanced: boolean; // Use AI to enhance alert logic
  customLogic?: string; // Custom JavaScript for complex conditions
}

interface NotificationConfig {
  email?: {
    enabled: boolean;
    addresses: string[];
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
  webhook?: {
    enabled: boolean;
    urls: string[];
    headers?: Record<string, string>;
    retryAttempts: number;
  };
  browser?: {
    enabled: boolean;
    soundEnabled: boolean;
    desktopNotifications: boolean;
  };
  sms?: {
    enabled: boolean;
    phoneNumbers: string[];
    provider: 'twilio' | 'aws_sns';
    credentials?: Record<string, string>;
  };
}

class AlertManager extends EventEmitter {
  private alerts: Map<string, Alert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private notificationConfig: NotificationConfig = {
    browser: { enabled: true, soundEnabled: true, desktopNotifications: true }
  };
  private alertHistory: Alert[] = [];
  private isProcessing: boolean = false;
  private processingInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.initializeAlertManager();
  }

  /**
   * Initialize alert manager
   */
  private initializeAlertManager(): void {
    // Start alert processing loop
    this.processingInterval = setInterval(() => {
      this.processAlerts();
    }, 5000); // Check every 5 seconds

    // Load default alert rules
    this.loadDefaultAlertRules();

    // Setup cleanup for old alerts
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 60 * 60 * 1000); // Hourly cleanup
  }

  /**
   * Load default alert rules
   */
  private loadDefaultAlertRules(): void {
    const defaultRules: Omit<AlertRule, 'id'>[] = [
      {
        name: 'High Price Movement',
        type: 'price',
        isEnabled: true,
        condition: {
          operator: 'change',
          value: 5, // 5% change
          field: 'price'
        },
        severity: 'high',
        channels: ['browser', 'email'],
        cooldownMinutes: 15,
        triggerCount: 0,
        aiEnhanced: true
      },
      {
        name: 'Low Portfolio Performance',
        type: 'performance',
        isEnabled: true,
        condition: {
          operator: '<',
          value: -10, // -10% performance
          field: 'totalReturn'
        },
        severity: 'critical',
        channels: ['browser', 'email', 'webhook'],
        cooldownMinutes: 60,
        triggerCount: 0,
        aiEnhanced: false
      },
      {
        name: 'High Risk Exposure',
        type: 'risk',
        isEnabled: true,
        condition: {
          operator: '>',
          value: 15, // 15% risk exposure
          field: 'riskPercentage'
        },
        severity: 'high',
        channels: ['browser'],
        cooldownMinutes: 30,
        triggerCount: 0,
        aiEnhanced: false
      },
      {
        name: 'AI Model Low Accuracy',
        type: 'ai_model',
        isEnabled: true,
        condition: {
          operator: '<',
          value: 60, // Below 60% accuracy
          field: 'accuracy'
        },
        severity: 'medium',
        channels: ['browser'],
        cooldownMinutes: 120,
        triggerCount: 0,
        aiEnhanced: false
      },
      {
        name: 'System High Memory Usage',
        type: 'system',
        isEnabled: true,
        condition: {
          operator: '>',
          value: 85, // 85% memory usage
          field: 'memoryPercentage'
        },
        severity: 'medium',
        channels: ['browser'],
        cooldownMinutes: 10,
        triggerCount: 0,
        aiEnhanced: false
      }
    ];

    defaultRules.forEach(rule => {
      const ruleId = this.generateAlertId('rule');
      this.alertRules.set(ruleId, { ...rule, id: ruleId });
    });
  }

  /**
   * Create a new alert
   */
  createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'isActive'>): string {
    const alertId = this.generateAlertId('alert');
    const alert: Alert = {
      ...alertData,
      id: alertId,
      timestamp: new Date(),
      isActive: true
    };

    this.alerts.set(alertId, alert);
    this.alertHistory.push(alert);
    
    // Emit event for real-time updates
    this.emit('alert_created', alert);
    
    // Send notifications
    this.sendNotifications(alert);
    
    return alertId;
  }

  /**
   * Create alert rule
   */
  createAlertRule(ruleData: Omit<AlertRule, 'id' | 'triggerCount' | 'lastTriggered'>): string {
    const ruleId = this.generateAlertId('rule');
    const rule: AlertRule = {
      ...ruleData,
      id: ruleId,
      triggerCount: 0
    };

    this.alertRules.set(ruleId, rule);
    this.emit('alert_rule_created', rule);
    
    return ruleId;
  }

  /**
   * Update alert rule
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates };
    this.alertRules.set(ruleId, updatedRule);
    this.emit('alert_rule_updated', updatedRule);
    
    return true;
  }

  /**
   * Delete alert rule
   */
  deleteAlertRule(ruleId: string): boolean {
    const deleted = this.alertRules.delete(ruleId);
    if (deleted) {
      this.emit('alert_rule_deleted', ruleId);
    }
    return deleted;
  }

  /**
   * Check market data against alert rules
   */
  checkPriceAlerts(marketData: {
    symbol: string;
    price: number;
    volume: number;
    change24h: number;
    rsi?: number;
    volume_profile?: any;
  }): void {
    this.alertRules.forEach(rule => {
      if (rule.type === 'price' && rule.isEnabled && this.canTriggerRule(rule)) {
        const shouldTrigger = this.evaluateCondition(rule.condition, {
          price: marketData.price,
          volume: marketData.volume,
          change24h: marketData.change24h,
          rsi: marketData.rsi || 0
        });

        if (shouldTrigger) {
          this.triggerAlert(rule, {
            symbol: marketData.symbol,
            currentValue: marketData.price,
            thresholdValue: rule.condition.value as number
          });
        }
      }
    });
  }

  /**
   * Check trading performance against alert rules
   */
  checkPerformanceAlerts(performanceData: {
    totalReturn: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
  }): void {
    this.alertRules.forEach(rule => {
      if (rule.type === 'performance' && rule.isEnabled && this.canTriggerRule(rule)) {
        const shouldTrigger = this.evaluateCondition(rule.condition, performanceData);

        if (shouldTrigger) {
          this.triggerAlert(rule, {
            currentValue: performanceData[rule.condition.field as keyof typeof performanceData],
            thresholdValue: rule.condition.value as number
          });
        }
      }
    });
  }

  /**
   * Check risk metrics against alert rules
   */
  checkRiskAlerts(riskData: {
    riskPercentage: number;
    valueAtRisk: number;
    leverageRatio: number;
    currentDrawdown: number;
  }): void {
    this.alertRules.forEach(rule => {
      if (rule.type === 'risk' && rule.isEnabled && this.canTriggerRule(rule)) {
        const shouldTrigger = this.evaluateCondition(rule.condition, riskData);

        if (shouldTrigger) {
          this.triggerAlert(rule, {
            currentValue: riskData[rule.condition.field as keyof typeof riskData],
            thresholdValue: rule.condition.value as number
          });
        }
      }
    });
  }

  /**
   * Check AI model performance against alert rules
   */
  checkAIModelAlerts(modelData: {
    modelType: string;
    accuracy: number;
    loss: number;
    predictionLatency: number;
  }): void {
    this.alertRules.forEach(rule => {
      if (rule.type === 'ai_model' && rule.isEnabled && this.canTriggerRule(rule)) {
        const shouldTrigger = this.evaluateCondition(rule.condition, modelData);

        if (shouldTrigger) {
          this.triggerAlert(rule, {
            currentValue: modelData[rule.condition.field as keyof typeof modelData],
            thresholdValue: rule.condition.value as number,
            metadata: {
              systemContext: {
                component: `AI Model: ${modelData.modelType}`,
                affectedFeatures: ['Predictions', 'Analysis']
              }
            }
          });
        }
      }
    });
  }

  /**
   * Trigger an alert based on rule
   */
  private triggerAlert(rule: AlertRule, alertData: {
    symbol?: string;
    currentValue?: number;
    thresholdValue?: number;
    metadata?: Alert['metadata'];
  }): void {
    const message = this.generateAlertMessage(rule, alertData);
    
    const alert: Omit<Alert, 'id' | 'timestamp' | 'isActive'> = {
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message,
      symbol: alertData.symbol,
      currentValue: alertData.currentValue,
      thresholdValue: alertData.thresholdValue,
      isAcknowledged: false,
      channels: rule.channels,
      metadata: alertData.metadata
    };

    // Enhance with AI if enabled
    if (rule.aiEnhanced) {
      this.enhanceAlertWithAI(alert, rule);
    }

    const alertId = this.createAlert(alert);
    
    // Update rule stats
    rule.triggerCount++;
    rule.lastTriggered = new Date();
    
    this.emit('rule_triggered', { rule, alertId });
  }

  /**
   * Enhance alert with AI predictions
   */
  private async enhanceAlertWithAI(alert: Omit<Alert, 'id' | 'timestamp' | 'isActive'>, rule: AlertRule): Promise<void> {
    // Mock AI enhancement - in production would call actual AI service
    const aiPrediction = {
      confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
      timeframe: '1-4 hours',
      expectedDirection: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down'
    };

    if (!alert.metadata) alert.metadata = {};
    alert.metadata.aiPrediction = aiPrediction;

    // Adjust severity based on AI confidence
    if (aiPrediction.confidence > 0.9 && alert.severity !== 'critical') {
      alert.severity = 'high';
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(rule: AlertRule, alertData: {
    symbol?: string;
    currentValue?: number;
    thresholdValue?: number;
  }): string {
    const { symbol, currentValue, thresholdValue } = alertData;
    
    switch (rule.type) {
      case 'price':
        return `${symbol || 'Asset'} price ${rule.condition.operator} ${thresholdValue}. Current: ${currentValue}`;
      case 'performance':
        return `Portfolio ${rule.condition.field} is ${currentValue}%, threshold: ${thresholdValue}%`;
      case 'risk':
        return `Risk ${rule.condition.field} is ${currentValue}%, exceeding threshold of ${thresholdValue}%`;
      case 'ai_model':
        return `AI model ${rule.condition.field} is ${currentValue}%, below threshold of ${thresholdValue}%`;
      case 'system':
        return `System ${rule.condition.field} is ${currentValue}%, exceeding threshold of ${thresholdValue}%`;
      default:
        return `Alert condition met: ${rule.condition.field} ${rule.condition.operator} ${thresholdValue}`;
    }
  }

  /**
   * Evaluate condition against data
   */
  private evaluateCondition(condition: AlertRule['condition'], data: Record<string, any>): boolean {
    const fieldValue = data[condition.field];
    if (fieldValue === undefined) return false;

    switch (condition.operator) {
      case '>':
        return fieldValue > condition.value;
      case '<':
        return fieldValue < condition.value;
      case '>=':
        return fieldValue >= condition.value;
      case '<=':
        return fieldValue <= condition.value;
      case '=':
        return fieldValue === condition.value;
      case '!=':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'change':
        // For percentage change conditions
        return Math.abs(fieldValue) >= Math.abs(condition.value as number);
      default:
        return false;
    }
  }

  /**
   * Check if rule can be triggered (respects cooldown)
   */
  private canTriggerRule(rule: AlertRule): boolean {
    if (!rule.lastTriggered) return true;
    
    const cooldownMs = rule.cooldownMinutes * 60 * 1000;
    const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
    
    return timeSinceLastTrigger >= cooldownMs;
  }

  /**
   * Send notifications for an alert
   */
  private async sendNotifications(alert: Alert): Promise<void> {
    for (const channel of alert.channels) {
      try {
        switch (channel) {
          case 'browser':
            await this.sendBrowserNotification(alert);
            break;
          case 'email':
            await this.sendEmailNotification(alert);
            break;
          case 'webhook':
            await this.sendWebhookNotification(alert);
            break;
          case 'sms':
            await this.sendSMSNotification(alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
      }
    }
  }

  /**
   * Send browser notification
   */
  private async sendBrowserNotification(alert: Alert): Promise<void> {
    if (!this.notificationConfig.browser?.enabled) return;

    // Emit event for browser notification
    this.emit('browser_notification', {
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      sound: this.notificationConfig.browser.soundEnabled
    });

    // Desktop notification if supported and enabled
    if (typeof window !== 'undefined' && 
        this.notificationConfig.browser.desktopNotifications &&
        'Notification' in window) {
      
      if (Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(alert.title, {
              body: alert.message,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
  }

  /**
   * Send email notification (placeholder)
   */
  private async sendEmailNotification(alert: Alert): Promise<void> {
    // In production, would integrate with email service
    console.log(`Email notification: ${alert.title} - ${alert.message}`);
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: Alert): Promise<void> {
    if (!this.notificationConfig.webhook?.enabled || !this.notificationConfig.webhook.urls.length) {
      return;
    }

    const payload = {
      alert: {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        symbol: alert.symbol,
        currentValue: alert.currentValue,
        thresholdValue: alert.thresholdValue,
        timestamp: alert.timestamp
      },
      source: 'ProfesorXTrader',
      version: '1.0.0'
    };

    for (const url of this.notificationConfig.webhook.urls) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.notificationConfig.webhook.headers
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error(`Failed to send webhook to ${url}:`, error);
      }
    }
  }

  /**
   * Send SMS notification (placeholder)
   */
  private async sendSMSNotification(alert: Alert): Promise<void> {
    // In production, would integrate with SMS service
    console.log(`SMS notification: ${alert.title} - ${alert.message}`);
  }

  /**
   * Process pending alerts
   */
  private processAlerts(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Auto-acknowledge low severity alerts after 24 hours
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      this.alerts.forEach(alert => {
        if (alert.severity === 'low' && 
            !alert.isAcknowledged && 
            alert.timestamp < dayAgo) {
          alert.isAcknowledged = true;
          this.emit('alert_auto_acknowledged', alert);
        }
      });
      
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Clean up old alerts
   */
  private cleanupOldAlerts(): void {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Remove acknowledged alerts older than a week
    this.alerts.forEach((alert, id) => {
      if (alert.isAcknowledged && alert.timestamp < weekAgo) {
        this.alerts.delete(id);
      }
    });
    
    // Keep only last 1000 alerts in history
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }
  }

  // Utility methods
  private generateAlertId(type: string): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;
    
    alert.isAcknowledged = true;
    this.emit('alert_acknowledged', alert);
    return true;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.isActive);
  }

  /**
   * Get alert rules
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * Update notification config
   */
  updateNotificationConfig(config: Partial<NotificationConfig>): void {
    this.notificationConfig = { ...this.notificationConfig, ...config };
    this.emit('notification_config_updated', this.notificationConfig);
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): {
    totalAlerts: number;
    activeAlerts: number;
    acknowledgedAlerts: number;
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    rulesCount: number;
    enabledRulesCount: number;
  } {
    const alerts = Array.from(this.alerts.values());
    const alertsByType: Record<string, number> = {};
    const alertsBySeverity: Record<string, number> = {};
    
    alerts.forEach(alert => {
      alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
    });
    
    const rules = Array.from(this.alertRules.values());
    
    return {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => a.isActive).length,
      acknowledgedAlerts: alerts.filter(a => a.isAcknowledged).length,
      alertsByType,
      alertsBySeverity,
      rulesCount: rules.length,
      enabledRulesCount: rules.filter(r => r.isEnabled).length
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    this.alerts.clear();
    this.alertRules.clear();
    this.alertHistory = [];
  }
}

// Export singleton instance
export const alertManager = new AlertManager();
export default AlertManager;
export type { Alert, AlertRule, NotificationConfig };