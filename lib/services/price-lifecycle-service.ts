import { readFileSync } from 'fs';
import { join } from 'path';

// Types for price lifecycle management
export interface PriceLifecycleState {
  id: string;
  name: string;
  description: string;
  color: string;
  backgroundColor: string;
  icon: string;
  priority: number;
  displayText: string;
  badgeVariant: string;
  allowTransitions: string[];
  requiresAction: boolean;
  actionText?: string;
  urgencyLevel?: string;
}

export interface ValidityPeriod {
  id: string;
  priceItemId: string;
  vendorId: string;
  productId: string;
  effectiveDate: string;
  expirationDate: string;
  currentState: string;
  warningDays: number;
  autoRenewal: boolean;
  renewalNotificationSent: boolean;
  suspensionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StateTransitionRule {
  fromState: string;
  toState: string;
  condition: string;
  requiredRole: string;
  autoTransition: boolean;
}

export interface LifecycleEvent {
  id: string;
  priceItemId: string;
  eventType: 'state_change' | 'renewal' | 'expiration' | 'suspension' | 'activation';
  fromState?: string;
  toState?: string;
  timestamp: Date;
  triggeredBy: string;
  reason: string;
  metadata?: Record<string, any>;
}

export interface RenewalRequest {
  priceItemId: string;
  newExpirationDate: Date;
  newPrice?: number;
  currency?: string;
  reason: string;
  requestedBy: string;
  autoApprove?: boolean;
}

export interface RenewalResult {
  success: boolean;
  message: string;
  renewalId?: string;
  newExpirationDate?: Date;
  previousExpirationDate?: Date;
  approvalRequired?: boolean;
  errors?: string[];
}

export interface LifecycleMetrics {
  totalPrices: number;
  stateDistribution: Record<string, number>;
  averageLifecycleDuration: number;
  renewalRate: number;
  expirationRate: number;
  autoRenewalSuccessRate: number;
  manualInterventionRate: number;
  lastUpdated: Date;
}

export interface ExpirationForecast {
  period: string;
  expiringCount: number;
  totalValue: number;
  highRiskCount: number;
  autoRenewalCount: number;
  manualActionRequired: number;
}

export class PriceLifecycleService {
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
   * Get all lifecycle states
   */
  async getLifecycleStates(): Promise<PriceLifecycleState[]> {
    const data = this.loadMockData<any>('price-lifecycle-states.json');
    return data.priceLifecycleStates;
  }

  /**
   * Get validity periods for price items
   */
  async getValidityPeriods(priceItemIds?: string[]): Promise<ValidityPeriod[]> {
    const data = this.loadMockData<any>('price-lifecycle-states.json');
    let periods = data.validityPeriods;

    if (priceItemIds && priceItemIds.length > 0) {
      periods = periods.filter((period: any) => priceItemIds.includes(period.priceItemId));
    }

    return periods;
  }

  /**
   * Get state transition rules
   */
  async getStateTransitionRules(): Promise<StateTransitionRule[]> {
    const data = this.loadMockData<any>('price-lifecycle-states.json');
    return data.stateTransitionRules;
  }

  /**
   * Transition price to a new lifecycle state
   */
  async transitionPriceState(
    priceItemId: string,
    toState: string,
    reason: string,
    triggeredBy: string,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    message: string;
    fromState?: string;
    toState?: string;
    transitionDate?: Date;
    errors?: string[];
  }> {
    try {
      // Get current validity period
      const validityPeriods = await this.getValidityPeriods([priceItemId]);
      if (validityPeriods.length === 0) {
        return {
          success: false,
          message: 'Price item not found',
          errors: ['Invalid price item ID']
        };
      }

      const currentPeriod = validityPeriods[0];
      const fromState = currentPeriod.currentState;

      // Validate transition
      const validationResult = await this.validateStateTransition(fromState, toState, triggeredBy);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: 'State transition validation failed',
          errors: validationResult.errors
        };
      }

      // Perform the transition
      const transitionDate = new Date();
      await this.executeStateTransition(priceItemId, fromState, toState, reason, triggeredBy, transitionDate, metadata);

      // Log the lifecycle event
      await this.logLifecycleEvent({
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        priceItemId,
        eventType: 'state_change',
        fromState,
        toState,
        timestamp: transitionDate,
        triggeredBy,
        reason,
        metadata
      });

      return {
        success: true,
        message: `Successfully transitioned from ${fromState} to ${toState}`,
        fromState,
        toState,
        transitionDate
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to transition state: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Renew a price item
   */
  async renewPrice(request: RenewalRequest): Promise<RenewalResult> {
    try {
      // Get current validity period
      const validityPeriods = await this.getValidityPeriods([request.priceItemId]);
      if (validityPeriods.length === 0) {
        return {
          success: false,
          message: 'Price item not found',
          errors: ['Invalid price item ID']
        };
      }

      const currentPeriod = validityPeriods[0];
      const previousExpirationDate = new Date(currentPeriod.expirationDate);

      // Validate renewal request
      const validationResult = await this.validateRenewalRequest(request, currentPeriod);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: 'Renewal validation failed',
          errors: validationResult.errors
        };
      }

      // Execute renewal
      const renewalId = `renewal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await this.executeRenewal(request, renewalId);

      // Log the lifecycle event
      await this.logLifecycleEvent({
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        priceItemId: request.priceItemId,
        eventType: 'renewal',
        timestamp: new Date(),
        triggeredBy: request.requestedBy,
        reason: request.reason,
        metadata: {
          renewalId,
          previousExpirationDate: previousExpirationDate.toISOString(),
          newExpirationDate: request.newExpirationDate.toISOString(),
          newPrice: request.newPrice,
          currency: request.currency
        }
      });

      // Transition to appropriate state
      const newState = request.autoApprove ? 'active' : 'pending_approval';
      await this.transitionPriceState(
        request.priceItemId,
        newState,
        'Price renewed',
        request.requestedBy,
        { renewalId }
      );

      return {
        success: true,
        message: 'Price renewed successfully',
        renewalId,
        newExpirationDate: request.newExpirationDate,
        previousExpirationDate,
        approvalRequired: !request.autoApprove
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to renew price: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Process automatic state transitions
   */
  async processAutomaticTransitions(): Promise<{
    processedCount: number;
    transitionCount: number;
    transitions: Array<{
      priceItemId: string;
      fromState: string;
      toState: string;
      reason: string;
    }>;
  }> {
    const validityPeriods = await this.getValidityPeriods();
    const transitionRules = await this.getStateTransitionRules();
    const autoRules = transitionRules.filter(rule => rule.autoTransition);

    const transitions: Array<{
      priceItemId: string;
      fromState: string;
      toState: string;
      reason: string;
    }> = [];

    let transitionCount = 0;

    for (const period of validityPeriods) {
      const now = new Date();
      const expirationDate = new Date(period.expirationDate);
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check each auto transition rule
      for (const rule of autoRules) {
        if (period.currentState === rule.fromState) {
          let shouldTransition = false;
          let reason = '';

          switch (rule.condition) {
            case 'within_warning_period':
              shouldTransition = daysUntilExpiration <= period.warningDays && daysUntilExpiration > 0;
              reason = `Entered warning period (${daysUntilExpiration} days remaining)`;
              break;
            case 'past_expiration_date':
              shouldTransition = daysUntilExpiration <= 0;
              reason = 'Reached expiration date';
              break;
            case 'approved':
              // This would be triggered by an approval workflow
              shouldTransition = false; // Not auto-triggered
              break;
            default:
              shouldTransition = false;
          }

          if (shouldTransition) {
            const transitionResult = await this.transitionPriceState(
              period.priceItemId,
              rule.toState,
              reason,
              'system'
            );

            if (transitionResult.success) {
              transitions.push({
                priceItemId: period.priceItemId,
                fromState: rule.fromState,
                toState: rule.toState,
                reason
              });
              transitionCount++;
            }
            break; // Only apply one transition per period per run
          }
        }
      }
    }

    return {
      processedCount: validityPeriods.length,
      transitionCount,
      transitions
    };
  }

  /**
   * Get lifecycle metrics
   */
  async getLifecycleMetrics(): Promise<LifecycleMetrics> {
    const validityPeriods = await this.getValidityPeriods();
    const versionHistory = this.loadMockData<any>('price-version-history.json');

    // Calculate state distribution
    const stateDistribution = validityPeriods.reduce((acc, period) => {
      acc[period.currentState] = (acc[period.currentState] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average lifecycle duration (mock calculation)
    const averageLifecycleDuration = 180; // Mock: 180 days average

    // Calculate renewal rate
    const renewableStates = ['active', 'expiring', 'expired'];
    const renewablePrices = validityPeriods.filter(p => renewableStates.includes(p.currentState));
    const renewedPrices = versionHistory.priceVersionHistory.filter((v: any) => v.version > 1);
    const renewalRate = renewablePrices.length > 0 ? renewedPrices.length / renewablePrices.length : 0;

    // Calculate expiration rate
    const expiredPrices = validityPeriods.filter(p => p.currentState === 'expired' || p.currentState === 'grace_period');
    const expirationRate = validityPeriods.length > 0 ? expiredPrices.length / validityPeriods.length : 0;

    // Calculate auto-renewal success rate
    const autoRenewalPrices = validityPeriods.filter(p => p.autoRenewal);
    const autoRenewalSuccessRate = 0.85; // Mock: 85% success rate

    // Calculate manual intervention rate
    const lifecycleStates = await this.getLifecycleStates();
    const actionRequiredStates = lifecycleStates.filter(s => s.requiresAction).map(s => s.id);
    const manualInterventionPrices = validityPeriods.filter(p => actionRequiredStates.includes(p.currentState));
    const manualInterventionRate = validityPeriods.length > 0 ? manualInterventionPrices.length / validityPeriods.length : 0;

    return {
      totalPrices: validityPeriods.length,
      stateDistribution,
      averageLifecycleDuration,
      renewalRate: Math.round(renewalRate * 100) / 100,
      expirationRate: Math.round(expirationRate * 100) / 100,
      autoRenewalSuccessRate: Math.round(autoRenewalSuccessRate * 100) / 100,
      manualInterventionRate: Math.round(manualInterventionRate * 100) / 100,
      lastUpdated: new Date()
    };
  }

  /**
   * Get expiration forecast
   */
  async getExpirationForecast(days: number = 90): Promise<ExpirationForecast[]> {
    const validityPeriods = await this.getValidityPeriods();
    const forecast: ExpirationForecast[] = [];
    const now = new Date();

    // Generate weekly forecast
    for (let week = 0; week < Math.ceil(days / 7); week++) {
      const weekStart = new Date(now.getTime() + week * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      const expiringInWeek = validityPeriods.filter(period => {
        const expirationDate = new Date(period.expirationDate);
        return expirationDate >= weekStart && expirationDate < weekEnd;
      });

      const totalValue = expiringInWeek.reduce((sum, period) => {
        // Mock calculation - in real implementation, this would be based on actual price values
        return sum + 1000; // Mock: $1000 average value per price item
      }, 0);

      const highRiskCount = expiringInWeek.filter(period => !period.autoRenewal).length;
      const autoRenewalCount = expiringInWeek.filter(period => period.autoRenewal).length;

      forecast.push({
        period: `Week ${week + 1} (${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]})`,
        expiringCount: expiringInWeek.length,
        totalValue,
        highRiskCount,
        autoRenewalCount,
        manualActionRequired: highRiskCount
      });
    }

    return forecast;
  }

  /**
   * Get lifecycle events for a price item
   */
  async getLifecycleEvents(priceItemId: string): Promise<LifecycleEvent[]> {
    // In a real implementation, this would query the database
    // For mock purposes, we'll generate some sample events
    const events: LifecycleEvent[] = [
      {
        id: `event-${priceItemId}-001`,
        priceItemId,
        eventType: 'state_change',
        fromState: 'draft',
        toState: 'active',
        timestamp: new Date('2024-01-01T00:00:00Z'),
        triggeredBy: 'system',
        reason: 'Initial activation'
      },
      {
        id: `event-${priceItemId}-002`,
        priceItemId,
        eventType: 'state_change',
        fromState: 'active',
        toState: 'expiring',
        timestamp: new Date('2024-08-01T00:00:00Z'),
        triggeredBy: 'system',
        reason: 'Entered warning period'
      }
    ];

    return events;
  }

  private async validateStateTransition(
    fromState: string,
    toState: string,
    triggeredBy: string
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Get transition rules
    const transitionRules = await this.getStateTransitionRules();
    const applicableRule = transitionRules.find(rule => 
      rule.fromState === fromState && rule.toState === toState
    );

    if (!applicableRule) {
      errors.push(`Transition from ${fromState} to ${toState} is not allowed`);
    } else {
      // Check role requirements
      if (applicableRule.requiredRole !== 'system' && triggeredBy === 'system') {
        errors.push(`Transition requires ${applicableRule.requiredRole} role, but was triggered by system`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async validateRenewalRequest(
    request: RenewalRequest,
    currentPeriod: ValidityPeriod
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate new expiration date
    const currentExpiration = new Date(currentPeriod.expirationDate);
    if (request.newExpirationDate <= currentExpiration) {
      errors.push('New expiration date must be after current expiration date');
    }

    // Validate new expiration date is not too far in the future (e.g., max 2 years)
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
    if (request.newExpirationDate > maxFutureDate) {
      errors.push('New expiration date cannot be more than 2 years in the future');
    }

    // Validate price if provided
    if (request.newPrice !== undefined && request.newPrice <= 0) {
      errors.push('New price must be greater than zero');
    }

    // Validate required fields
    if (!request.reason.trim()) {
      errors.push('Reason is required for renewal');
    }

    if (!request.requestedBy.trim()) {
      errors.push('RequestedBy is required for renewal');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async executeStateTransition(
    priceItemId: string,
    fromState: string,
    toState: string,
    reason: string,
    triggeredBy: string,
    transitionDate: Date,
    metadata?: Record<string, any>
  ): Promise<void> {
    // In a real implementation, this would update the database
    // For mock purposes, we'll just log the operation
    console.log(`Mock state transition: ${priceItemId} from ${fromState} to ${toState} at ${transitionDate.toISOString()}`);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async executeRenewal(request: RenewalRequest, renewalId: string): Promise<void> {
    // In a real implementation, this would:
    // 1. Update the validity period in the database
    // 2. Create a new price version if price changed
    // 3. Update related records
    
    // For mock purposes, we'll just log the operation
    console.log(`Mock renewal: ${request.priceItemId} renewed until ${request.newExpirationDate.toISOString()}, renewalId: ${renewalId}`);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async logLifecycleEvent(event: LifecycleEvent): Promise<void> {
    // In a real implementation, this would insert the event into the database
    // For mock purposes, we'll just log it
    console.log(`Mock lifecycle event: ${event.eventType} for ${event.priceItemId} at ${event.timestamp.toISOString()}`);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

export const priceLifecycleService = new PriceLifecycleService();