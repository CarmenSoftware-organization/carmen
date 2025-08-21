import { CurrencyManagementService, ExchangeRate } from './currency-management-service';
import { CurrencyConversionService, RateChangeAlert } from './currency-conversion-service';

export interface RateUpdateSchedule {
  id: string;
  name: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  isActive: boolean;
  lastUpdate: string;
  nextUpdate: string;
  currencyPairs: string[];
  sources: string[];
  failureCount: number;
  maxRetries: number;
}

export interface RateUpdateResult {
  updateId: string;
  timestamp: string;
  successful: {
    currencyPair: string;
    previousRate: number;
    newRate: number;
    source: string;
    changePercentage: number;
  }[];
  failed: {
    currencyPair: string;
    error: string;
    source: string;
  }[];
  alerts: RateChangeAlert[];
  summary: {
    totalPairs: number;
    successfulUpdates: number;
    failedUpdates: number;
    significantChanges: number;
  };
}

export interface RateUpdateNotification {
  id: string;
  type: 'success' | 'failure' | 'alert' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
  recipients: string[];
  isRead: boolean;
}

export interface AutomationSettings {
  enableAutomaticUpdates: boolean;
  updateFrequency: 'hourly' | 'daily' | 'weekly';
  alertThreshold: number; // Percentage change threshold for alerts
  maxRetries: number;
  retryDelay: number; // Minutes
  enableNotifications: boolean;
  notificationRecipients: string[];
  businessHoursOnly: boolean;
  businessHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
  excludeWeekends: boolean;
  emergencyContactThreshold: number; // Percentage for emergency alerts
}

export class ExchangeRateAutomationService {
  private static instance: ExchangeRateAutomationService;
  private currencyService: CurrencyManagementService;
  private conversionService: CurrencyConversionService;
  private updateSchedules: RateUpdateSchedule[] = [];
  private updateHistory: RateUpdateResult[] = [];
  private notifications: RateUpdateNotification[] = [];
  private isUpdating = false;

  private defaultSettings: AutomationSettings = {
    enableAutomaticUpdates: true,
    updateFrequency: 'hourly',
    alertThreshold: 2.0,
    maxRetries: 3,
    retryDelay: 15,
    enableNotifications: true,
    notificationRecipients: ['admin@company.com'],
    businessHoursOnly: false,
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC'
    },
    excludeWeekends: false,
    emergencyContactThreshold: 10.0
  };

  private constructor() {
    this.currencyService = CurrencyManagementService.getInstance();
    this.conversionService = CurrencyConversionService.getInstance();
    this.initializeSchedules();
  }

  public static getInstance(): ExchangeRateAutomationService {
    if (!ExchangeRateAutomationService.instance) {
      ExchangeRateAutomationService.instance = new ExchangeRateAutomationService();
    }
    return ExchangeRateAutomationService.instance;
  }

  private initializeSchedules(): void {
    // Initialize default update schedules
    this.updateSchedules = [
      {
        id: 'schedule-001',
        name: 'Hourly Major Currencies',
        frequency: 'hourly',
        isActive: true,
        lastUpdate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        nextUpdate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        currencyPairs: ['USD/EUR', 'USD/GBP', 'USD/JPY', 'USD/CAD'],
        sources: ['ECB', 'BOE', 'BOJ', 'BOC'],
        failureCount: 0,
        maxRetries: 3
      },
      {
        id: 'schedule-002',
        name: 'Daily All Currencies',
        frequency: 'daily',
        isActive: true,
        lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        currencyPairs: ['USD/EUR', 'USD/GBP', 'USD/JPY', 'USD/CAD', 'USD/AUD', 'EUR/GBP'],
        sources: ['ECB', 'BOE', 'BOJ', 'BOC', 'RBA'],
        failureCount: 0,
        maxRetries: 3
      }
    ];
  }

  /**
   * Execute automatic rate updates based on schedules
   */
  async executeScheduledUpdates(): Promise<RateUpdateResult[]> {
    if (this.isUpdating) {
      console.log('Rate update already in progress, skipping...');
      return [];
    }

    this.isUpdating = true;
    const results: RateUpdateResult[] = [];

    try {
      const now = new Date();
      const dueSchedules = this.updateSchedules.filter(schedule => 
        schedule.isActive && new Date(schedule.nextUpdate) <= now
      );

      for (const schedule of dueSchedules) {
        try {
          const result = await this.executeScheduleUpdate(schedule);
          results.push(result);
          
          // Update schedule
          await this.updateScheduleAfterExecution(schedule, true);
        } catch (error) {
          console.error(`Failed to execute schedule ${schedule.id}:`, error);
          await this.updateScheduleAfterExecution(schedule, false);
        }
      }
    } finally {
      this.isUpdating = false;
    }

    return results;
  }

  /**
   * Execute update for a specific schedule
   */
  private async executeScheduleUpdate(schedule: RateUpdateSchedule): Promise<RateUpdateResult> {
    const updateId = `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    const successful: RateUpdateResult['successful'] = [];
    const failed: RateUpdateResult['failed'] = [];
    const alerts: RateChangeAlert[] = [];

    // Get current rates for comparison
    const currentRates = await this.currencyService.getCurrentExchangeRates();
    const currentRateMap = new Map(
      currentRates.map(rate => [`${rate.fromCurrency}/${rate.toCurrency}`, rate])
    );

    for (const currencyPair of schedule.currencyPairs) {
      try {
        const [fromCurrency, toCurrency] = currencyPair.split('/');
        const currentRate = currentRateMap.get(currencyPair);
        
        // Simulate fetching new rate (in real system, this would call external API)
        const newRate = await this.fetchMockExchangeRate(fromCurrency, toCurrency);
        
        if (newRate) {
          const previousRate = currentRate?.rate || 0;
          const changePercentage = previousRate > 0 
            ? ((newRate.rate - previousRate) / previousRate) * 100 
            : 0;

          successful.push({
            currencyPair,
            previousRate,
            newRate: newRate.rate,
            source: newRate.source,
            changePercentage: Math.round(changePercentage * 100) / 100
          });

          // Check for significant changes
          if (Math.abs(changePercentage) >= this.defaultSettings.alertThreshold) {
            const alert: RateChangeAlert = {
              currencyPair,
              previousRate,
              currentRate: newRate.rate,
              changePercentage,
              threshold: this.defaultSettings.alertThreshold,
              alertType: changePercentage > 0 ? 'increase' : 'decrease',
              timestamp
            };
            alerts.push(alert);
          }
        } else {
          failed.push({
            currencyPair,
            error: 'Failed to fetch exchange rate',
            source: 'unknown'
          });
        }
      } catch (error) {
        failed.push({
          currencyPair,
          error: error instanceof Error ? error.message : 'Unknown error',
          source: 'system'
        });
      }
    }

    const result: RateUpdateResult = {
      updateId,
      timestamp,
      successful,
      failed,
      alerts,
      summary: {
        totalPairs: schedule.currencyPairs.length,
        successfulUpdates: successful.length,
        failedUpdates: failed.length,
        significantChanges: alerts.length
      }
    };

    // Store result in history
    this.updateHistory.push(result);
    
    // Generate notifications
    await this.generateUpdateNotifications(result, schedule);

    return result;
  }

  /**
   * Mock exchange rate fetching (simulates external API call)
   */
  private async fetchMockExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Simulated API failure');
    }

    // Get current rate and apply small random change
    const currentRate = await this.currencyService.getExchangeRate(fromCurrency, toCurrency);
    
    if (!currentRate) {
      return null;
    }

    // Apply random change (±2%)
    const changePercent = (Math.random() - 0.5) * 4; // -2% to +2%
    const newRate = currentRate.rate * (1 + changePercent / 100);

    return {
      id: `rate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromCurrency,
      toCurrency,
      rate: Math.round(newRate * 1000000) / 1000000, // 6 decimal places
      rateDate: new Date().toISOString().split('T')[0],
      source: currentRate.source,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Update schedule after execution
   */
  private async updateScheduleAfterExecution(schedule: RateUpdateSchedule, success: boolean): Promise<void> {
    const now = new Date();
    
    if (success) {
      schedule.lastUpdate = now.toISOString();
      schedule.failureCount = 0;
      
      // Calculate next update time
      switch (schedule.frequency) {
        case 'hourly':
          schedule.nextUpdate = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
          break;
        case 'daily':
          schedule.nextUpdate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'weekly':
          schedule.nextUpdate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
      }
    } else {
      schedule.failureCount++;
      
      // If max retries exceeded, disable schedule
      if (schedule.failureCount >= schedule.maxRetries) {
        schedule.isActive = false;
        await this.createNotification(
          'warning',
          'Schedule Disabled',
          `Schedule "${schedule.name}" has been disabled due to repeated failures`,
          { scheduleId: schedule.id, failureCount: schedule.failureCount }
        );
      } else {
        // Schedule retry
        const retryDelay = this.defaultSettings.retryDelay * schedule.failureCount;
        schedule.nextUpdate = new Date(now.getTime() + retryDelay * 60 * 1000).toISOString();
      }
    }
  }

  /**
   * Generate notifications based on update results
   */
  private async generateUpdateNotifications(result: RateUpdateResult, schedule: RateUpdateSchedule): Promise<void> {
    // Success notification for significant updates
    if (result.summary.successfulUpdates > 0) {
      await this.createNotification(
        'success',
        'Exchange Rates Updated',
        `Successfully updated ${result.summary.successfulUpdates} currency pairs`,
        { updateId: result.updateId, scheduleId: schedule.id }
      );
    }

    // Failure notifications
    if (result.summary.failedUpdates > 0) {
      await this.createNotification(
        'failure',
        'Rate Update Failures',
        `Failed to update ${result.summary.failedUpdates} currency pairs`,
        { updateId: result.updateId, failures: result.failed }
      );
    }

    // Alert notifications for significant changes
    for (const alert of result.alerts) {
      const isEmergency = Math.abs(alert.changePercentage) >= this.defaultSettings.emergencyContactThreshold;
      
      await this.createNotification(
        isEmergency ? 'alert' : 'warning',
        `Significant Rate Change: ${alert.currencyPair}`,
        `${alert.currencyPair} changed by ${alert.changePercentage.toFixed(2)}% (${alert.previousRate} → ${alert.currentRate})`,
        { alert, isEmergency }
      );
    }
  }

  /**
   * Create notification
   */
  private async createNotification(
    type: RateUpdateNotification['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const notification: RateUpdateNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      data,
      recipients: this.defaultSettings.notificationRecipients,
      isRead: false
    };

    this.notifications.push(notification);
    
    // In a real system, this would send actual notifications (email, SMS, etc.)
    console.log(`Notification created: ${type} - ${title}`);
  }

  /**
   * Get update schedules
   */
  async getUpdateSchedules(): Promise<RateUpdateSchedule[]> {
    return this.updateSchedules;
  }

  /**
   * Create new update schedule
   */
  async createUpdateSchedule(schedule: Omit<RateUpdateSchedule, 'id' | 'lastUpdate' | 'failureCount'>): Promise<RateUpdateSchedule> {
    const newSchedule: RateUpdateSchedule = {
      ...schedule,
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdate: new Date().toISOString(),
      failureCount: 0
    };

    this.updateSchedules.push(newSchedule);
    return newSchedule;
  }

  /**
   * Update existing schedule
   */
  async updateSchedule(scheduleId: string, updates: Partial<RateUpdateSchedule>): Promise<RateUpdateSchedule | null> {
    const scheduleIndex = this.updateSchedules.findIndex(s => s.id === scheduleId);
    
    if (scheduleIndex === -1) {
      return null;
    }

    this.updateSchedules[scheduleIndex] = {
      ...this.updateSchedules[scheduleIndex],
      ...updates
    };

    return this.updateSchedules[scheduleIndex];
  }

  /**
   * Delete schedule
   */
  async deleteSchedule(scheduleId: string): Promise<boolean> {
    const scheduleIndex = this.updateSchedules.findIndex(s => s.id === scheduleId);
    
    if (scheduleIndex === -1) {
      return false;
    }

    this.updateSchedules.splice(scheduleIndex, 1);
    return true;
  }

  /**
   * Get update history
   */
  async getUpdateHistory(limit: number = 50): Promise<RateUpdateResult[]> {
    return this.updateHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get notifications
   */
  async getNotifications(unreadOnly: boolean = false): Promise<RateUpdateNotification[]> {
    let notifications = this.notifications;
    
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.isRead);
    }

    return notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return false;
    }

    notification.isRead = true;
    return true;
  }

  /**
   * Get automation settings
   */
  async getAutomationSettings(): Promise<AutomationSettings> {
    return this.defaultSettings;
  }

  /**
   * Update automation settings
   */
  async updateAutomationSettings(settings: Partial<AutomationSettings>): Promise<AutomationSettings> {
    this.defaultSettings = {
      ...this.defaultSettings,
      ...settings
    };

    return this.defaultSettings;
  }

  /**
   * Manual rate update trigger
   */
  async triggerManualUpdate(currencyPairs?: string[]): Promise<RateUpdateResult> {
    const updateId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    // Use provided pairs or default to all major pairs
    const pairsToUpdate = currencyPairs || ['USD/EUR', 'USD/GBP', 'USD/JPY', 'USD/CAD', 'USD/AUD'];
    
    const successful: RateUpdateResult['successful'] = [];
    const failed: RateUpdateResult['failed'] = [];
    const alerts: RateChangeAlert[] = [];

    for (const currencyPair of pairsToUpdate) {
      try {
        const [fromCurrency, toCurrency] = currencyPair.split('/');
        const currentRate = await this.currencyService.getExchangeRate(fromCurrency, toCurrency);
        const newRate = await this.fetchMockExchangeRate(fromCurrency, toCurrency);
        
        if (newRate && currentRate) {
          const changePercentage = ((newRate.rate - currentRate.rate) / currentRate.rate) * 100;

          successful.push({
            currencyPair,
            previousRate: currentRate.rate,
            newRate: newRate.rate,
            source: newRate.source,
            changePercentage: Math.round(changePercentage * 100) / 100
          });

          if (Math.abs(changePercentage) >= this.defaultSettings.alertThreshold) {
            alerts.push({
              currencyPair,
              previousRate: currentRate.rate,
              currentRate: newRate.rate,
              changePercentage,
              threshold: this.defaultSettings.alertThreshold,
              alertType: changePercentage > 0 ? 'increase' : 'decrease',
              timestamp
            });
          }
        }
      } catch (error) {
        failed.push({
          currencyPair,
          error: error instanceof Error ? error.message : 'Unknown error',
          source: 'manual'
        });
      }
    }

    const result: RateUpdateResult = {
      updateId,
      timestamp,
      successful,
      failed,
      alerts,
      summary: {
        totalPairs: pairsToUpdate.length,
        successfulUpdates: successful.length,
        failedUpdates: failed.length,
        significantChanges: alerts.length
      }
    };

    this.updateHistory.push(result);
    
    await this.createNotification(
      'success',
      'Manual Rate Update Completed',
      `Manual update completed: ${result.summary.successfulUpdates}/${result.summary.totalPairs} successful`,
      { updateId: result.updateId, isManual: true }
    );

    return result;
  }

  /**
   * Get rate update statistics
   */
  async getUpdateStatistics(days: number = 30): Promise<{
    totalUpdates: number;
    successfulUpdates: number;
    failedUpdates: number;
    averageSuccessRate: number;
    mostVolatilePair: string;
    updateFrequency: { date: string; count: number }[];
    alertFrequency: { date: string; count: number }[];
  }> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentHistory = this.updateHistory.filter(
      h => new Date(h.timestamp) >= cutoffDate
    );

    const totalUpdates = recentHistory.length;
    const successfulUpdates = recentHistory.reduce((sum, h) => sum + h.summary.successfulUpdates, 0);
    const failedUpdates = recentHistory.reduce((sum, h) => sum + h.summary.failedUpdates, 0);
    const averageSuccessRate = totalUpdates > 0 ? (successfulUpdates / (successfulUpdates + failedUpdates)) * 100 : 0;

    // Find most volatile currency pair
    const volatilityMap = new Map<string, number[]>();
    recentHistory.forEach(h => {
      h.successful.forEach(s => {
        if (!volatilityMap.has(s.currencyPair)) {
          volatilityMap.set(s.currencyPair, []);
        }
        volatilityMap.get(s.currencyPair)!.push(Math.abs(s.changePercentage));
      });
    });

    let mostVolatilePair = 'N/A';
    let maxVolatility = 0;
    volatilityMap.forEach((changes, pair) => {
      const avgVolatility = changes.reduce((sum, change) => sum + change, 0) / changes.length;
      if (avgVolatility > maxVolatility) {
        maxVolatility = avgVolatility;
        mostVolatilePair = pair;
      }
    });

    // Generate frequency data
    const updateFrequency: { date: string; count: number }[] = [];
    const alertFrequency: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayUpdates = recentHistory.filter(h => h.timestamp.startsWith(date));
      const dayAlerts = dayUpdates.reduce((sum, h) => sum + h.alerts.length, 0);

      updateFrequency.push({ date, count: dayUpdates.length });
      alertFrequency.push({ date, count: dayAlerts });
    }

    return {
      totalUpdates,
      successfulUpdates,
      failedUpdates,
      averageSuccessRate: Math.round(averageSuccessRate * 100) / 100,
      mostVolatilePair,
      updateFrequency,
      alertFrequency
    };
  }
}

export default ExchangeRateAutomationService;