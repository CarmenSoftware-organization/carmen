import { 
  PriceAssignmentContext, 
  VendorPriceOption, 
  FallbackScenario,
  FallbackResult,
  AssignmentFailure
} from '@/lib/types/price-management';

// Mock data imports
import fallbackScenariosData from '@/lib/mock/price-management/fallback-scenarios.json';

export class AssignmentFallbackService {
  private fallbackScenarios: FallbackScenario[] = fallbackScenariosData.fallbackScenarios as FallbackScenario[];

  /**
   * Handle assignment failure with appropriate fallback strategy
   */
  async handleAssignmentFailure(
    failure: AssignmentFailure,
    context: PriceAssignmentContext,
    availableVendors: VendorPriceOption[]
  ): Promise<FallbackResult> {
    console.log(`Handling assignment failure: ${failure.reason}`);
    
    // Determine appropriate fallback scenario
    const scenario = this.selectFallbackScenario(failure, context, availableVendors);
    
    // Execute fallback strategy
    const result = await this.executeFallbackStrategy(scenario, failure, context, availableVendors);
    
    // Log fallback action
    await this.logFallbackAction(failure, scenario, result, context);
    
    return result;
  }

  /**
   * Select appropriate fallback scenario based on failure type and context
   */
  private selectFallbackScenario(
    failure: AssignmentFailure,
    context: PriceAssignmentContext,
    availableVendors: VendorPriceOption[]
  ): FallbackScenario {
    // Find matching scenario based on failure type
    let matchingScenarios = this.fallbackScenarios.filter(scenario => 
      scenario.triggerConditions.failureTypes.includes(failure.type)
    );

    // Further filter based on context
    matchingScenarios = matchingScenarios.filter(scenario => {
      return this.evaluateScenarioConditions(scenario, failure, context, availableVendors);
    });

    // Sort by priority and select the best match
    matchingScenarios.sort((a, b) => b.priority - a.priority);
    
    // Return the highest priority scenario or default scenario
    return matchingScenarios[0] || this.getDefaultFallbackScenario();
  }

  /**
   * Evaluate scenario conditions to determine if it applies
   */
  private evaluateScenarioConditions(
    scenario: FallbackScenario,
    failure: AssignmentFailure,
    context: PriceAssignmentContext,
    availableVendors: VendorPriceOption[]
  ): boolean {
    const conditions = scenario.triggerConditions;

    // Check vendor availability
    if (conditions.minVendorsAvailable && availableVendors.length < conditions.minVendorsAvailable) {
      return false;
    }

    // Check urgency level
    if (conditions.urgencyLevel && context.urgencyLevel !== conditions.urgencyLevel) {
      return false;
    }

    // Check category restrictions
    if (conditions.categoryRestrictions && conditions.categoryRestrictions.length > 0) {
      if (!conditions.categoryRestrictions.includes(context.categoryId)) {
        return false;
      }
    }

    // Check quantity thresholds
    if (conditions.quantityThreshold && context.quantity < conditions.quantityThreshold) {
      return false;
    }

    return true;
  }

  /**
   * Execute the selected fallback strategy
   */
  private async executeFallbackStrategy(
    scenario: FallbackScenario,
    failure: AssignmentFailure,
    context: PriceAssignmentContext,
    availableVendors: VendorPriceOption[]
  ): Promise<FallbackResult> {
    console.log(`Executing fallback strategy: ${scenario.name}`);

    switch (scenario.strategy.type) {
      case 'alternative_vendor':
        return await this.executeAlternativeVendorStrategy(scenario, failure, context, availableVendors);
      
      case 'manual_review':
        return await this.executeManualReviewStrategy(scenario, failure, context);
      
      case 'price_escalation':
        return await this.executePriceEscalationStrategy(scenario, failure, context, availableVendors);
      
      case 'delayed_assignment':
        return await this.executeDelayedAssignmentStrategy(scenario, failure, context);
      
      case 'emergency_procurement':
        return await this.executeEmergencyProcurementStrategy(scenario, failure, context, availableVendors);
      
      case 'split_order':
        return await this.executeSplitOrderStrategy(scenario, failure, context, availableVendors);
      
      default:
        return await this.executeDefaultFallbackStrategy(scenario, failure, context);
    }
  }

  /**
   * Execute alternative vendor strategy
   */
  private async executeAlternativeVendorStrategy(
    scenario: FallbackScenario,
    failure: AssignmentFailure,
    context: PriceAssignmentContext,
    availableVendors: VendorPriceOption[]
  ): Promise<FallbackResult> {
    const strategy = scenario.strategy;
    
    // Filter vendors based on strategy parameters
    let candidateVendors = availableVendors.filter(vendor => {
      // Apply minimum rating filter
      if (strategy.parameters?.minRating && vendor.rating < strategy.parameters.minRating) {
        return false;
      }
      
      // Apply availability filter
      if (strategy.parameters?.requireAvailable && vendor.availability !== 'available') {
        return false;
      }
      
      // Apply preferred vendor filter
      if (strategy.parameters?.preferredOnly && !vendor.isPreferred) {
        return false;
      }
      
      return true;
    });

    if (candidateVendors.length === 0) {
      // No suitable alternatives found, escalate to manual review
      return {
        success: false,
        strategy: 'alternative_vendor',
        action: 'escalate_to_manual',
        message: 'No suitable alternative vendors found matching criteria',
        assignedVendor: null,
        requiresManualIntervention: true,
        nextSteps: [
          'Review vendor criteria and availability',
          'Consider expanding vendor pool',
          'Manual vendor selection required'
        ],
        estimatedResolutionTime: '2-4 hours',
        fallbackScenario: scenario
      };
    }

    // Select best alternative vendor
    const selectedVendor = this.selectBestAlternativeVendor(candidateVendors, context, strategy.parameters);

    return {
      success: true,
      strategy: 'alternative_vendor',
      action: 'vendor_assigned',
      message: `Alternative vendor assigned: ${selectedVendor.vendorName}`,
      assignedVendor: selectedVendor,
      requiresManualIntervention: false,
      nextSteps: [
        'Verify vendor capacity and availability',
        'Confirm pricing and terms',
        'Process assignment'
      ],
      estimatedResolutionTime: '30 minutes',
      fallbackScenario: scenario,
      additionalInfo: {
        originalFailureReason: failure.reason,
        alternativeReason: `Selected based on ${strategy.parameters?.selectionCriteria || 'best available option'}`
      }
    };
  }

  /**
   * Execute manual review strategy
   */
  private async executeManualReviewStrategy(
    scenario: FallbackScenario,
    failure: AssignmentFailure,
    context: PriceAssignmentContext
  ): Promise<FallbackResult> {
    const strategy = scenario.strategy;
    
    // Determine review priority based on context
    const priority = this.determineReviewPriority(failure, context, strategy.parameters);
    
    // Generate review queue entry
    const reviewQueueEntry = {
      id: `review-${Date.now()}`,
      prItemId: context.prItemId,
      priority,
      assignedTo: strategy.parameters?.assignedTo || 'procurement-team',
      dueDate: new Date(Date.now() + (strategy.parameters?.reviewTimeoutHours || 24) * 60 * 60 * 1000),
      failureReason: failure.reason,
      context: {
        productId: context.productId,
        categoryId: context.categoryId,
        quantity: context.quantity,
        requestedDate: context.requestedDate,
        location: context.location,
        department: context.department
      }
    };

    return {
      success: true,
      strategy: 'manual_review',
      action: 'queued_for_review',
      message: `Assignment queued for manual review (Priority: ${priority})`,
      assignedVendor: null,
      requiresManualIntervention: true,
      nextSteps: [
        'Procurement team will review within 24 hours',
        'Manual vendor selection and pricing',
        'Assignment completion notification'
      ],
      estimatedResolutionTime: `${strategy.parameters?.reviewTimeoutHours || 24} hours`,
      fallbackScenario: scenario,
      additionalInfo: {
        reviewQueueEntry,
        escalationPath: strategy.parameters?.escalationPath || ['procurement-manager', 'procurement-director']
      }
    };
  }

  /**
   * Execute price escalation strategy
   */
  private async executePriceEscalationStrategy(
    scenario: FallbackScenario,
    failure: AssignmentFailure,
    context: PriceAssignmentContext,
    availableVendors: VendorPriceOption[]
  ): Promise<FallbackResult> {
    const strategy = scenario.strategy;
    const maxPriceIncrease = strategy.parameters?.maxPriceIncrease || 0.2; // 20% default
    
    // Find vendors within the escalated price range
    const originalBudget = context.budgetLimit || 100; // Mock budget
    const escalatedBudget = originalBudget * (1 + maxPriceIncrease);
    
    const affordableVendors = availableVendors.filter(vendor => 
      vendor.normalizedPrice <= escalatedBudget
    );

    if (affordableVendors.length === 0) {
      return {
        success: false,
        strategy: 'price_escalation',
        action: 'escalation_failed',
        message: `No vendors found within escalated budget (${escalatedBudget.toFixed(2)})`,
        assignedVendor: null,
        requiresManualIntervention: true,
        nextSteps: [
          'Review budget constraints',
          'Consider alternative products',
          'Seek budget approval for higher amounts'
        ],
        estimatedResolutionTime: '1-2 days',
        fallbackScenario: scenario
      };
    }

    // Select best vendor within escalated budget
    const selectedVendor = affordableVendors.reduce((best, current) => 
      current.rating > best.rating ? current : best
    );

    return {
      success: true,
      strategy: 'price_escalation',
      action: 'vendor_assigned_escalated',
      message: `Vendor assigned with price escalation: ${selectedVendor.vendorName} (${selectedVendor.price} ${selectedVendor.currency})`,
      assignedVendor: selectedVendor,
      requiresManualIntervention: strategy.parameters?.requireApproval || false,
      nextSteps: [
        'Budget escalation approval required',
        'Confirm vendor assignment',
        'Process escalated order'
      ],
      estimatedResolutionTime: '2-4 hours',
      fallbackScenario: scenario,
      additionalInfo: {
        originalBudget,
        escalatedBudget,
        priceIncrease: ((selectedVendor.normalizedPrice - originalBudget) / originalBudget) * 100,
        approvalRequired: strategy.parameters?.requireApproval || false
      }
    };
  }

  /**
   * Execute delayed assignment strategy
   */
  private async executeDelayedAssignmentStrategy(
    scenario: FallbackScenario,
    failure: AssignmentFailure,
    context: PriceAssignmentContext
  ): Promise<FallbackResult> {
    const strategy = scenario.strategy;
    const delayHours = strategy.parameters?.delayHours || 24;
    const retryDate = new Date(Date.now() + delayHours * 60 * 60 * 1000);

    return {
      success: true,
      strategy: 'delayed_assignment',
      action: 'assignment_delayed',
      message: `Assignment delayed for ${delayHours} hours to allow for vendor availability updates`,
      assignedVendor: null,
      requiresManualIntervention: false,
      nextSteps: [
        'Monitor vendor availability updates',
        'Automatic retry scheduled',
        'Manual intervention if retry fails'
      ],
      estimatedResolutionTime: `${delayHours} hours`,
      fallbackScenario: scenario,
      additionalInfo: {
        retryDate: retryDate.toISOString(),
        maxRetries: strategy.parameters?.maxRetries || 3,
        retryInterval: strategy.parameters?.retryInterval || 'daily'
      }
    };
  }

  /**
   * Execute emergency procurement strategy
   */
  private async executeEmergencyProcurementStrategy(
    scenario: FallbackScenario,
    failure: AssignmentFailure,
    context: PriceAssignmentContext,
    availableVendors: VendorPriceOption[]
  ): Promise<FallbackResult> {
    const strategy = scenario.strategy;
    
    // Find any available vendor regardless of normal constraints
    const emergencyVendors = availableVendors.filter(vendor => 
      vendor.availability === 'available' || vendor.availability === 'limited'
    );

    if (emergencyVendors.length === 0) {
      return {
        success: false,
        strategy: 'emergency_procurement',
        action: 'emergency_failed',
        message: 'No vendors available for emergency procurement',
        assignedVendor: null,
        requiresManualIntervention: true,
        nextSteps: [
          'Contact vendors directly',
          'Explore external procurement options',
          'Consider product alternatives'
        ],
        estimatedResolutionTime: '4-8 hours',
        fallbackScenario: scenario
      };
    }

    // Select vendor with shortest lead time
    const selectedVendor = emergencyVendors.reduce((fastest, current) => 
      current.leadTime < fastest.leadTime ? current : fastest
    );

    return {
      success: true,
      strategy: 'emergency_procurement',
      action: 'emergency_vendor_assigned',
      message: `Emergency vendor assigned: ${selectedVendor.vendorName} (${selectedVendor.leadTime} days lead time)`,
      assignedVendor: selectedVendor,
      requiresManualIntervention: true,
      nextSteps: [
        'Immediate vendor contact required',
        'Expedited processing approval',
        'Rush order placement'
      ],
      estimatedResolutionTime: '1-2 hours',
      fallbackScenario: scenario,
      additionalInfo: {
        emergencyPremium: strategy.parameters?.emergencyPremium || 0.15,
        expeditedProcessing: true,
        approvalLevel: 'director'
      }
    };
  }

  /**
   * Execute split order strategy
   */
  private async executeSplitOrderStrategy(
    scenario: FallbackScenario,
    failure: AssignmentFailure,
    context: PriceAssignmentContext,
    availableVendors: VendorPriceOption[]
  ): Promise<FallbackResult> {
    const strategy = scenario.strategy;
    const maxSplits = strategy.parameters?.maxSplits || 3;
    
    // Find vendors with partial availability
    const partialVendors = availableVendors.filter(vendor => 
      vendor.availability === 'available' || vendor.availability === 'limited'
    );

    if (partialVendors.length < 2) {
      return {
        success: false,
        strategy: 'split_order',
        action: 'split_not_possible',
        message: 'Insufficient vendors available for order splitting',
        assignedVendor: null,
        requiresManualIntervention: true,
        nextSteps: [
          'Consider alternative strategies',
          'Manual vendor negotiation',
          'Product substitution evaluation'
        ],
        estimatedResolutionTime: '2-4 hours',
        fallbackScenario: scenario
      };
    }

    // Create split assignments
    const splits = this.createOrderSplits(context, partialVendors, maxSplits);

    return {
      success: true,
      strategy: 'split_order',
      action: 'order_split_assigned',
      message: `Order split across ${splits.length} vendors`,
      assignedVendor: null, // Multiple vendors
      requiresManualIntervention: true,
      nextSteps: [
        'Confirm split quantities with vendors',
        'Coordinate delivery schedules',
        'Process multiple purchase orders'
      ],
      estimatedResolutionTime: '3-6 hours',
      fallbackScenario: scenario,
      additionalInfo: {
        splits,
        coordinationRequired: true,
        deliveryComplexity: 'high'
      }
    };
  }

  /**
   * Execute default fallback strategy
   */
  private async executeDefaultFallbackStrategy(
    scenario: FallbackScenario,
    failure: AssignmentFailure,
    context: PriceAssignmentContext
  ): Promise<FallbackResult> {
    return {
      success: false,
      strategy: 'default',
      action: 'manual_intervention_required',
      message: 'Assignment failed - manual intervention required',
      assignedVendor: null,
      requiresManualIntervention: true,
      nextSteps: [
        'Review failure details',
        'Manual vendor selection',
        'Custom assignment processing'
      ],
      estimatedResolutionTime: '4-8 hours',
      fallbackScenario: scenario,
      additionalInfo: {
        originalFailure: failure,
        escalationRequired: true
      }
    };
  }

  /**
   * Helper methods
   */
  private getDefaultFallbackScenario(): FallbackScenario {
    return {
      id: 'default-fallback',
      name: 'Default Manual Review',
      description: 'Default fallback when no specific scenario matches',
      priority: 0,
      strategy: {
        type: 'manual_review',
        parameters: {
          reviewTimeoutHours: 24,
          assignedTo: 'procurement-team'
        }
      },
      triggerConditions: {
        failureTypes: ['unknown'],
        minVendorsAvailable: 0
      },
      expectedResolutionTime: '24 hours',
      successRate: 0.95
    };
  }

  private selectBestAlternativeVendor(
    vendors: VendorPriceOption[],
    context: PriceAssignmentContext,
    parameters: any
  ): VendorPriceOption {
    // Sort by selection criteria
    const criteria = parameters?.selectionCriteria || 'rating';
    
    switch (criteria) {
      case 'price':
        return vendors.reduce((best, current) => 
          current.normalizedPrice < best.normalizedPrice ? current : best
        );
      case 'rating':
        return vendors.reduce((best, current) => 
          current.rating > best.rating ? current : best
        );
      case 'leadTime':
        return vendors.reduce((best, current) => 
          current.leadTime < best.leadTime ? current : best
        );
      default:
        // Balanced selection
        return vendors.reduce((best, current) => {
          const bestScore = (best.rating / 5) * 0.5 + (1 - best.normalizedPrice / 100) * 0.3 + (best.isPreferred ? 0.2 : 0);
          const currentScore = (current.rating / 5) * 0.5 + (1 - current.normalizedPrice / 100) * 0.3 + (current.isPreferred ? 0.2 : 0);
          return currentScore > bestScore ? current : best;
        });
    }
  }

  private determineReviewPriority(
    failure: AssignmentFailure,
    context: PriceAssignmentContext,
    parameters: any
  ): 'low' | 'medium' | 'high' | 'urgent' {
    // Determine priority based on failure type and context
    if (failure.type === 'no_vendors_available' || context.urgencyLevel === 'urgent') {
      return 'urgent';
    }
    
    if (failure.type === 'budget_exceeded' || context.quantity > 100) {
      return 'high';
    }
    
    if (failure.type === 'business_rules_conflict') {
      return 'medium';
    }
    
    return 'low';
  }

  private createOrderSplits(
    context: PriceAssignmentContext,
    vendors: VendorPriceOption[],
    maxSplits: number
  ): any[] {
    const splits: any[] = [];
    const totalQuantity = context.quantity;
    const vendorsToUse = vendors.slice(0, maxSplits);
    
    // Simple equal split for demonstration
    const baseQuantity = Math.floor(totalQuantity / vendorsToUse.length);
    const remainder = totalQuantity % vendorsToUse.length;
    
    vendorsToUse.forEach((vendor, index) => {
      const quantity = baseQuantity + (index < remainder ? 1 : 0);
      splits.push({
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        quantity,
        price: vendor.price,
        currency: vendor.currency,
        totalCost: vendor.price * quantity,
        leadTime: vendor.leadTime
      });
    });
    
    return splits;
  }

  private async logFallbackAction(
    failure: AssignmentFailure,
    scenario: FallbackScenario,
    result: FallbackResult,
    context: PriceAssignmentContext
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date(),
      prItemId: context.prItemId,
      failureType: failure.type,
      failureReason: failure.reason,
      fallbackStrategy: scenario.strategy.type,
      fallbackResult: result.success ? 'success' : 'failed',
      assignedVendor: result.assignedVendor?.vendorId,
      requiresManualIntervention: result.requiresManualIntervention,
      estimatedResolutionTime: result.estimatedResolutionTime
    };
    
    console.log('Fallback action logged:', logEntry);
  }
}

export const assignmentFallbackService = new AssignmentFallbackService();