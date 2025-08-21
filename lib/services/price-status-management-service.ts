import { readFileSync } from 'fs';
import { join } from 'path';

// Types for price status management
export interface PriceStatusInfo {
  id: string;
  name: string;
  description: string;
  color: string;
  backgroundColor: string;
  icon: string;
  priority: number;
  displayText: string;
  badgeVariant: string;
  allowedTransitions: string[];
  requiresAction: boolean;
  actionText?: string;
  urgencyLevel?: string;
}

export interface PriceStatusData {
  priceItemId: string;
  productName: string;
  vendorName: string;
  currentStatus: string;
  statusHistory: StatusHistoryEntry[];
  effectiveDate: string;
  expirationDate: string;
  daysUntilExpiration?: number;
  daysSinceExpiration?: number;
  warningThreshold: number;
  isInWarningPeriod?: boolean;
  autoRenewal: boolean;
  lastStatusCheck: string;
  suspensionReason?: string;
  gracePeriodEnd?: string;
  renewalNotificationSent?: boolean;
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  changedBy: string;
  reason: string;
}

export interface StatusTransitionRequest {
  priceItemId: string;
  fromStatus: string;
  toStatus: string;
  reason: string;
  changedBy: string;
  effectiveDate?: Date;
  additionalData?: Record<string, any>;
}

export interface StatusTransitionResult {
  success: boolean;
  message: string;
  newStatus?: string;
  transitionDate?: Date;
  validationErrors?: string[];
}

export interface BulkStatusUpdate {
  priceItemIds: string[];
  targetStatus: string;
  reason: string;
  changedBy: string;
  filters?: {
    currentStatus?: string[];
    vendorIds?: string[];
    expirationDateRange?: {
      startDate: Date;
      endDate: Date;
    };
  };
}

export interface StatusMetrics {
  totalPrices: number;
  statusCounts: Record<string, number>;
  requiresActionCount: number;
  highUrgencyCount: number;
  mediumUrgencyCount: number;
  lowUrgencyCount: number;
  autoRenewalEnabled: number;
  averageDaysUntilExpiration: number;
  lastUpdated: string;
}

export class PriceStatusManagementService {
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
   * Get all available status indicators
   */
  async getStatusIndicators(): Promise<PriceStatusInfo[]> {
    const data = this.loadMockData<any>('price-status-indicators.json');
    return data.statusIndicators;
  }

  /**
   * Get status information for a specific status
   */
  async getStatusInfo(statusId: string): Promise<PriceStatusInfo | null> {
    const indicators = await this.getStatusIndicators();
    return indicators.find(indicator => indicator.id === statusId) || null;
  }

  /**
   * Get price status data for specific items
   */
  async getPriceStatusData(priceItemIds?: string[]): Promise<PriceStatusData[]> {
    const data = this.loadMockData<any>('price-status-indicators.json');
    let statusData = data.priceStatusData;

    if (priceItemIds && priceItemIds.length > 0) {
      statusData = statusData.filter((item: any) => priceItemIds.includes(item.priceItemId));
    }

    return statusData;
  }

  /**
   * Get status metrics and summary
   */
  async getStatusMetrics(): Promise<StatusMetrics> {
    const data = this.loadMockData<any>('price-status-indicators.json');
    return data.statusMetrics;
  }

  /**
   * Update status for a single price item
   */
  async updatePriceStatus(request: StatusTransitionRequest): Promise<StatusTransitionResult> {
    try {
      // Validate the transition
      const validationResult = await this.validateStatusTransition(request);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: 'Status transition validation failed',
          validationErrors: validationResult.errors
        };
      }

      // In a real implementation, this would update the database
      // For mock purposes, we'll simulate the update
      const transitionDate = new Date();
      
      // Simulate status update logic
      await this.simulateStatusUpdate(request, transitionDate);

      return {
        success: true,
        message: `Status successfully updated from ${request.fromStatus} to ${request.toStatus}`,
        newStatus: request.toStatus,
        transitionDate
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Bulk update status for multiple price items
   */
  async bulkUpdateStatus(request: BulkStatusUpdate): Promise<{
    success: boolean;
    message: string;
    updatedCount: number;
    failedCount: number;
    results: StatusTransitionResult[];
  }> {
    try {
      const statusData = await this.getPriceStatusData();
      let targetItems = statusData;

      // Apply filters if provided
      if (request.filters) {
        if (request.filters.currentStatus && request.filters.currentStatus.length > 0) {
          targetItems = targetItems.filter(item => 
            request.filters!.currentStatus!.includes(item.currentStatus)
          );
        }

        if (request.filters.vendorIds && request.filters.vendorIds.length > 0) {
          targetItems = targetItems.filter(item => 
            request.filters!.vendorIds!.includes(item.vendorName) // Mock: using vendorName as ID
          );
        }

        if (request.filters.expirationDateRange) {
          const { startDate, endDate } = request.filters.expirationDateRange;
          targetItems = targetItems.filter(item => {
            const expirationDate = new Date(item.expirationDate);
            return expirationDate >= startDate && expirationDate <= endDate;
          });
        }
      }

      // Filter by specific price item IDs if provided
      if (request.priceItemIds.length > 0) {
        targetItems = targetItems.filter(item => 
          request.priceItemIds.includes(item.priceItemId)
        );
      }

      // Process each item
      const results: StatusTransitionResult[] = [];
      let updatedCount = 0;
      let failedCount = 0;

      for (const item of targetItems) {
        const transitionRequest: StatusTransitionRequest = {
          priceItemId: item.priceItemId,
          fromStatus: item.currentStatus,
          toStatus: request.targetStatus,
          reason: request.reason,
          changedBy: request.changedBy
        };

        const result = await this.updatePriceStatus(transitionRequest);
        results.push(result);

        if (result.success) {
          updatedCount++;
        } else {
          failedCount++;
        }
      }

      return {
        success: failedCount === 0,
        message: `Bulk update completed: ${updatedCount} updated, ${failedCount} failed`,
        updatedCount,
        failedCount,
        results
      };
    } catch (error) {
      return {
        success: false,
        message: `Bulk update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        updatedCount: 0,
        failedCount: 0,
        results: []
      };
    }
  }

  /**
   * Get items requiring action
   */
  async getItemsRequiringAction(urgencyLevel?: string): Promise<PriceStatusData[]> {
    const statusData = await this.getPriceStatusData();
    const statusIndicators = await this.getStatusIndicators();

    const actionRequiredStatuses = statusIndicators
      .filter(indicator => indicator.requiresAction)
      .filter(indicator => !urgencyLevel || indicator.urgencyLevel === urgencyLevel)
      .map(indicator => indicator.id);

    return statusData.filter(item => actionRequiredStatuses.includes(item.currentStatus));
  }

  /**
   * Get status transition history for a price item
   */
  async getStatusHistory(priceItemId: string): Promise<StatusHistoryEntry[]> {
    const statusData = await this.getPriceStatusData([priceItemId]);
    if (statusData.length === 0) {
      return [];
    }

    return statusData[0].statusHistory || [];
  }

  /**
   * Get allowed transitions for a current status
   */
  async getAllowedTransitions(currentStatus: string): Promise<PriceStatusInfo[]> {
    const statusInfo = await this.getStatusInfo(currentStatus);
    if (!statusInfo || !statusInfo.allowedTransitions) {
      return [];
    }

    const allStatuses = await this.getStatusIndicators();
    return allStatuses.filter(status => statusInfo.allowedTransitions.includes(status.id));
  }

  /**
   * Check if prices need status updates (automated status management)
   */
  async checkAndUpdateAutomaticStatuses(): Promise<{
    checkedCount: number;
    updatedCount: number;
    updates: Array<{
      priceItemId: string;
      fromStatus: string;
      toStatus: string;
      reason: string;
    }>;
  }> {
    const statusData = await this.getPriceStatusData();
    const updates: Array<{
      priceItemId: string;
      fromStatus: string;
      toStatus: string;
      reason: string;
    }> = [];

    let updatedCount = 0;

    for (const item of statusData) {
      const now = new Date();
      const expirationDate = new Date(item.expirationDate);
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let newStatus: string | null = null;
      let reason = '';

      // Check for automatic status transitions
      if (item.currentStatus === 'active' && daysUntilExpiration <= item.warningThreshold) {
        newStatus = 'expiring';
        reason = `Entered warning period (${daysUntilExpiration} days remaining)`;
      } else if (item.currentStatus === 'expiring' && daysUntilExpiration <= 0) {
        newStatus = 'expired';
        reason = 'Reached expiration date';
      } else if (item.currentStatus === 'expired' && item.gracePeriodEnd) {
        const gracePeriodEnd = new Date(item.gracePeriodEnd);
        if (now <= gracePeriodEnd) {
          newStatus = 'grace_period';
          reason = 'Entered grace period';
        }
      }

      if (newStatus && newStatus !== item.currentStatus) {
        const transitionRequest: StatusTransitionRequest = {
          priceItemId: item.priceItemId,
          fromStatus: item.currentStatus,
          toStatus: newStatus,
          reason,
          changedBy: 'system'
        };

        const result = await this.updatePriceStatus(transitionRequest);
        if (result.success) {
          updates.push({
            priceItemId: item.priceItemId,
            fromStatus: item.currentStatus,
            toStatus: newStatus,
            reason
          });
          updatedCount++;
        }
      }
    }

    return {
      checkedCount: statusData.length,
      updatedCount,
      updates
    };
  }

  /**
   * Get status dashboard data
   */
  async getStatusDashboard(): Promise<{
    metrics: StatusMetrics;
    recentChanges: StatusHistoryEntry[];
    actionItems: PriceStatusData[];
    statusDistribution: Array<{
      status: string;
      count: number;
      percentage: number;
      color: string;
    }>;
  }> {
    const metrics = await this.getStatusMetrics();
    const statusData = await this.getPriceStatusData();
    const statusIndicators = await this.getStatusIndicators();
    const actionItems = await this.getItemsRequiringAction();

    // Get recent status changes (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentChanges: StatusHistoryEntry[] = [];

    statusData.forEach(item => {
      if (item.statusHistory) {
        const recentItemChanges = item.statusHistory.filter(change => 
          new Date(change.timestamp) >= sevenDaysAgo
        );
        recentChanges.push(...recentItemChanges);
      }
    });

    // Sort by timestamp (most recent first)
    recentChanges.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Create status distribution with colors
    const statusDistribution = Object.entries(metrics.statusCounts).map(([status, count]) => {
      const statusInfo = statusIndicators.find(s => s.id === status);
      return {
        status,
        count: count as number,
        percentage: Math.round((count as number / metrics.totalPrices) * 100),
        color: statusInfo?.color || '#6B7280'
      };
    });

    return {
      metrics,
      recentChanges: recentChanges.slice(0, 10), // Limit to 10 most recent
      actionItems: actionItems.slice(0, 5), // Limit to 5 most urgent
      statusDistribution
    };
  }

  private async validateStatusTransition(request: StatusTransitionRequest): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Check if the current status exists
    const currentStatusInfo = await this.getStatusInfo(request.fromStatus);
    if (!currentStatusInfo) {
      errors.push(`Invalid current status: ${request.fromStatus}`);
    }

    // Check if the target status exists
    const targetStatusInfo = await this.getStatusInfo(request.toStatus);
    if (!targetStatusInfo) {
      errors.push(`Invalid target status: ${request.toStatus}`);
    }

    // Check if the transition is allowed
    if (currentStatusInfo && !currentStatusInfo.allowedTransitions.includes(request.toStatus)) {
      errors.push(`Transition from ${request.fromStatus} to ${request.toStatus} is not allowed`);
    }

    // Validate required fields
    if (!request.reason.trim()) {
      errors.push('Reason is required for status transitions');
    }

    if (!request.changedBy.trim()) {
      errors.push('ChangedBy is required for status transitions');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async simulateStatusUpdate(request: StatusTransitionRequest, transitionDate: Date): Promise<void> {
    // In a real implementation, this would:
    // 1. Update the database record
    // 2. Add entry to status history
    // 3. Trigger any necessary notifications
    // 4. Update related records (e.g., PR assignments)
    
    // For mock purposes, we'll just log the operation
    console.log(`Mock status update: ${request.priceItemId} from ${request.fromStatus} to ${request.toStatus} at ${transitionDate.toISOString()}`);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export const priceStatusManagementService = new PriceStatusManagementService();