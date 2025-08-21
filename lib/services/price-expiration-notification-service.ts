import { readFileSync } from 'fs';
import { join } from 'path';

// Types for notification service
export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'dashboard';
  category: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueue {
  id: string;
  templateId: string;
  recipientEmail: string;
  recipientName: string;
  recipientType: 'purchaser' | 'vendor' | 'manager' | 'approver';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  scheduledAt: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
  retryCount?: number;
  lastError?: string;
  createdAt: string;
}

export interface NotificationRequest {
  templateId: string;
  recipients: Array<{
    email: string;
    name: string;
    type: 'purchaser' | 'vendor' | 'manager' | 'approver';
  }>;
  data: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  scheduledAt?: Date;
  batchId?: string;
}

export interface BulkNotificationRequest {
  templateId: string;
  recipients: Array<{
    email: string;
    name: string;
    type: 'purchaser' | 'vendor' | 'manager' | 'approver';
    data: Record<string, any>;
  }>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  scheduledAt?: Date;
  batchSize?: number;
}

export interface NotificationResult {
  success: boolean;
  message: string;
  notificationId?: string;
  scheduledAt?: Date;
  errors?: string[];
}

export interface NotificationSettings {
  defaultSender: string;
  senderName: string;
  retryAttempts: number;
  retryInterval: number;
  batchSize: number;
  enableSMS: boolean;
  enablePushNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  escalationRules: Array<{
    condition: string;
    action: string;
    enabled: boolean;
  }>;
}

export interface ExpirationNotificationSchedule {
  priceItemId: string;
  productName: string;
  vendorName: string;
  expirationDate: Date;
  warningDays: number[];
  notifications: Array<{
    daysBeforeExpiration: number;
    templateId: string;
    recipients: string[];
    status: 'scheduled' | 'sent' | 'failed';
    scheduledAt?: Date;
    sentAt?: Date;
  }>;
}

export class PriceExpirationNotificationService {
  private mockDataPath = join(process.cwd(), 'lib/mock/price-management');

  private loadMockData<T>(filename: string): T {
    try {
      const filePath = join(this.mockDataPath, filename);
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading mock data from ${filename}:`, error);
      throw new Error(`Failed to load mock data: ${filename}`);
    }
  }

  /**
   * Get all notification templates
   */
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    const data = this.loadMockData<any>('notification-templates.json');
    return data.notificationTemplates;
  }

  /**
   * Get a specific notification template
   */
  async getNotificationTemplate(templateId: string): Promise<NotificationTemplate | null> {
    const templates = await this.getNotificationTemplates();
    return templates.find(template => template.id === templateId) || null;
  }

  /**
   * Send a single notification
   */
  async sendNotification(request: NotificationRequest): Promise<NotificationResult> {
    try {
      // Validate template exists
      const template = await this.getNotificationTemplate(request.templateId);
      if (!template) {
        return {
          success: false,
          message: `Template not found: ${request.templateId}`,
          errors: ['Invalid template ID']
        };
      }

      // Validate template is active
      if (!template.isActive) {
        return {
          success: false,
          message: `Template is inactive: ${request.templateId}`,
          errors: ['Template is not active']
        };
      }

      // Process each recipient
      const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const scheduledAt = request.scheduledAt || new Date();

      for (const recipient of request.recipients) {
        await this.queueNotification({
          templateId: request.templateId,
          recipient,
          data: request.data,
          priority: request.priority || 'medium',
          scheduledAt,
          batchId: request.batchId
        });
      }

      return {
        success: true,
        message: `Notification queued for ${request.recipients.length} recipient(s)`,
        notificationId,
        scheduledAt
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(request: BulkNotificationRequest): Promise<{
    success: boolean;
    message: string;
    totalRecipients: number;
    queuedCount: number;
    failedCount: number;
    batchId: string;
    results: NotificationResult[];
  }> {
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const results: NotificationResult[] = [];
    let queuedCount = 0;
    let failedCount = 0;

    const batchSize = request.batchSize || 50;
    const scheduledAt = request.scheduledAt || new Date();

    // Process recipients in batches
    for (let i = 0; i < request.recipients.length; i += batchSize) {
      const batch = request.recipients.slice(i, i + batchSize);
      
      for (const recipient of batch) {
        try {
          const result = await this.sendNotification({
            templateId: request.templateId,
            recipients: [{
              email: recipient.email,
              name: recipient.name,
              type: recipient.type
            }],
            data: recipient.data,
            priority: request.priority,
            scheduledAt,
            batchId
          });

          results.push(result);
          
          if (result.success) {
            queuedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
          results.push({
            success: false,
            message: `Failed to queue notification for ${recipient.email}`,
            errors: [error instanceof Error ? error.message : 'Unknown error']
          });
        }
      }

      // Add delay between batches to avoid overwhelming the system
      if (i + batchSize < request.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return {
      success: failedCount === 0,
      message: `Bulk notification completed: ${queuedCount} queued, ${failedCount} failed`,
      totalRecipients: request.recipients.length,
      queuedCount,
      failedCount,
      batchId,
      results
    };
  }

  /**
   * Schedule expiration notifications for price items
   */
  async scheduleExpirationNotifications(priceItems: Array<{
    priceItemId: string;
    productName: string;
    vendorName: string;
    vendorEmail: string;
    purchaserEmail: string;
    expirationDate: Date;
    warningDays: number[];
    autoRenewal: boolean;
  }>): Promise<{
    success: boolean;
    message: string;
    scheduledCount: number;
    schedules: ExpirationNotificationSchedule[];
  }> {
    const schedules: ExpirationNotificationSchedule[] = [];
    let scheduledCount = 0;

    for (const item of priceItems) {
      const schedule: ExpirationNotificationSchedule = {
        priceItemId: item.priceItemId,
        productName: item.productName,
        vendorName: item.vendorName,
        expirationDate: item.expirationDate,
        warningDays: item.warningDays,
        notifications: []
      };

      // Schedule notifications for each warning day
      for (const warningDays of item.warningDays) {
        const notificationDate = new Date(item.expirationDate);
        notificationDate.setDate(notificationDate.getDate() - warningDays);

        // Skip if notification date is in the past
        if (notificationDate <= new Date()) {
          continue;
        }

        // Determine template based on warning days
        let templateId = 'standard_expiration_warning';
        if (warningDays <= 7) {
          templateId = 'critical_expiration_alert';
        }

        const recipients = [item.purchaserEmail];
        if (warningDays <= 14) {
          recipients.push(item.vendorEmail); // Include vendor for urgent notifications
        }

        // Schedule notification
        const notificationResult = await this.sendNotification({
          templateId,
          recipients: recipients.map(email => ({
            email,
            name: email.split('@')[0], // Mock name from email
            type: email === item.vendorEmail ? 'vendor' : 'purchaser'
          })),
          data: {
            productName: item.productName,
            vendorName: item.vendorName,
            daysUntilExpiration: warningDays,
            expirationDate: item.expirationDate.toISOString().split('T')[0],
            autoRenewal: item.autoRenewal
          },
          priority: warningDays <= 7 ? 'high' : 'medium',
          scheduledAt: notificationDate
        });

        schedule.notifications.push({
          daysBeforeExpiration: warningDays,
          templateId,
          recipients,
          status: notificationResult.success ? 'scheduled' : 'failed',
          scheduledAt: notificationResult.success ? notificationDate : undefined
        });

        if (notificationResult.success) {
          scheduledCount++;
        }
      }

      schedules.push(schedule);
    }

    return {
      success: true,
      message: `Scheduled ${scheduledCount} expiration notifications for ${priceItems.length} price items`,
      scheduledCount,
      schedules
    };
  }

  /**
   * Get notification queue status
   */
  async getNotificationQueue(filters?: {
    status?: string[];
    priority?: string[];
    templateId?: string;
    recipientType?: string[];
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
  }): Promise<NotificationQueue[]> {
    const data = this.loadMockData<any>('notification-templates.json');
    let queue = data.notificationQueue;

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        queue = queue.filter((item: any) => filters.status!.includes(item.status));
      }

      if (filters.priority && filters.priority.length > 0) {
        queue = queue.filter((item: any) => filters.priority!.includes(item.priority));
      }

      if (filters.templateId) {
        queue = queue.filter((item: any) => item.templateId === filters.templateId);
      }

      if (filters.recipientType && filters.recipientType.length > 0) {
        queue = queue.filter((item: any) => filters.recipientType!.includes(item.recipientType));
      }

      if (filters.dateRange) {
        const { startDate, endDate } = filters.dateRange;
        queue = queue.filter((item: any) => {
          const scheduledAt = new Date(item.scheduledAt);
          return scheduledAt >= startDate && scheduledAt <= endDate;
        });
      }
    }

    return queue;
  }

  /**
   * Process pending notifications (simulate email sending)
   */
  async processPendingNotifications(batchSize: number = 10): Promise<{
    processedCount: number;
    successCount: number;
    failedCount: number;
    results: Array<{
      notificationId: string;
      status: 'sent' | 'failed';
      error?: string;
    }>;
  }> {
    const pendingNotifications = await this.getNotificationQueue({
      status: ['pending']
    });

    const batch = pendingNotifications.slice(0, batchSize);
    const results: Array<{
      notificationId: string;
      status: 'sent' | 'failed';
      error?: string;
    }> = [];

    let successCount = 0;
    let failedCount = 0;

    for (const notification of batch) {
      try {
        // Simulate email sending
        const success = await this.simulateEmailSending(notification);
        
        if (success) {
          results.push({
            notificationId: notification.id,
            status: 'sent'
          });
          successCount++;
        } else {
          results.push({
            notificationId: notification.id,
            status: 'failed',
            error: 'Simulated email sending failure'
          });
          failedCount++;
        }
      } catch (error) {
        results.push({
          notificationId: notification.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failedCount++;
      }
    }

    return {
      processedCount: batch.length,
      successCount,
      failedCount,
      results
    };
  }

  /**
   * Get notification statistics
   */
  async getNotificationStatistics(dateRange?: {
    startDate: Date;
    endDate: Date;
  }): Promise<{
    totalNotifications: number;
    statusCounts: Record<string, number>;
    priorityCounts: Record<string, number>;
    templateUsage: Record<string, number>;
    recipientTypeCounts: Record<string, number>;
    successRate: number;
    averageDeliveryTime: number;
  }> {
    const queue = await this.getNotificationQueue(dateRange ? { dateRange } : undefined);

    const statusCounts = queue.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = queue.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const templateUsage = queue.reduce((acc, item) => {
      acc[item.templateId] = (acc[item.templateId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recipientTypeCounts = queue.reduce((acc, item) => {
      acc[item.recipientType] = (acc[item.recipientType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sentNotifications = queue.filter(item => item.status === 'sent' || item.status === 'delivered');
    const successRate = queue.length > 0 ? (sentNotifications.length / queue.length) * 100 : 0;

    // Calculate average delivery time for delivered notifications
    const deliveredNotifications = queue.filter(item => item.status === 'delivered' && item.sentAt && item.deliveredAt);
    const averageDeliveryTime = deliveredNotifications.length > 0
      ? deliveredNotifications.reduce((sum, item) => {
          const sentTime = new Date(item.sentAt!).getTime();
          const deliveredTime = new Date(item.deliveredAt!).getTime();
          return sum + (deliveredTime - sentTime);
        }, 0) / deliveredNotifications.length / 1000 // Convert to seconds
      : 0;

    return {
      totalNotifications: queue.length,
      statusCounts,
      priorityCounts,
      templateUsage,
      recipientTypeCounts,
      successRate: Math.round(successRate * 100) / 100,
      averageDeliveryTime: Math.round(averageDeliveryTime * 100) / 100
    };
  }

  /**
   * Cancel scheduled notifications
   */
  async cancelNotifications(notificationIds: string[], reason: string): Promise<{
    success: boolean;
    message: string;
    cancelledCount: number;
    failedCount: number;
  }> {
    let cancelledCount = 0;
    let failedCount = 0;

    for (const notificationId of notificationIds) {
      try {
        // In a real implementation, this would update the database
        // For mock purposes, we'll simulate the cancellation
        const success = await this.simulateNotificationCancellation(notificationId, reason);
        
        if (success) {
          cancelledCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
      }
    }

    return {
      success: failedCount === 0,
      message: `Cancelled ${cancelledCount} notifications, ${failedCount} failed`,
      cancelledCount,
      failedCount
    };
  }

  private async queueNotification(params: {
    templateId: string;
    recipient: {
      email: string;
      name: string;
      type: 'purchaser' | 'vendor' | 'manager' | 'approver';
    };
    data: Record<string, any>;
    priority: 'low' | 'medium' | 'high' | 'critical';
    scheduledAt: Date;
    batchId?: string;
  }): Promise<void> {
    // In a real implementation, this would insert into the database
    // For mock purposes, we'll simulate the queueing
    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Mock notification queued: ${notificationId} for ${params.recipient.email} using template ${params.templateId}`);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async simulateEmailSending(notification: NotificationQueue): Promise<boolean> {
    // Simulate email sending with 90% success rate
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    return Math.random() > 0.1;
  }

  private async simulateNotificationCancellation(notificationId: string, reason: string): Promise<boolean> {
    // Simulate cancellation with 95% success rate
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`Mock notification cancelled: ${notificationId}, reason: ${reason}`);
    return Math.random() > 0.05;
  }
}

export const priceExpirationNotificationService = new PriceExpirationNotificationService();