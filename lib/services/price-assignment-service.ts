import { 
  PriceAssignmentContext, 
  PriceAssignmentResult, 
  VendorPriceOption, 
  BusinessRule,
  PriceAssignmentHistory,
  PriceOverride
} from '@/lib/types/price-management';

// Mock data imports
import priceAssignmentsData from '@/lib/mock/price-management/price-assignments.json';
import confidenceScoringData from '@/lib/mock/price-management/confidence-scoring.json';
import businessRulesData from '@/lib/mock/price-management/business-rules.json';

export class PriceAssignmentService {
  private businessRules: BusinessRule[] = businessRulesData.businessRules as unknown as BusinessRule[];
  private confidenceScoring = confidenceScoringData.confidenceScoring;
  private assignmentReasoningScenarios = confidenceScoringData.assignmentReasoningScenarios;

  /**
   * Assign optimal price for a PR item based on business rules and vendor options
   */
  async assignOptimalPrice(context: PriceAssignmentContext): Promise<PriceAssignmentResult> {
    try {
      // Get available vendor options
      const vendorOptions = await this.getVendorOptions(context);
      
      if (vendorOptions.length === 0) {
        throw new Error('No vendor options available for assignment');
      }

      // Apply business rules to select optimal vendor
      const selectedOption = await this.applyBusinessRules(context, vendorOptions);
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(selectedOption, vendorOptions, context);
      
      // Generate assignment reasoning
      const assignmentReason = this.generateAssignmentReason(selectedOption, vendorOptions, context);
      
      // Get alternative options (excluding selected)
      const alternatives = vendorOptions
        .filter(option => option.vendorId !== selectedOption.vendorId)
        .slice(0, 3); // Limit to top 3 alternatives

      const result: PriceAssignmentResult = {
        prItemId: context.prItemId,
        selectedVendor: {
          id: selectedOption.vendorId,
          name: selectedOption.vendorName,
          rating: selectedOption.rating,
          isPreferred: selectedOption.isPreferred
        },
        assignedPrice: selectedOption.price,
        currency: selectedOption.currency,
        normalizedPrice: selectedOption.normalizedPrice,
        assignmentReason,
        confidence: confidenceScore,
        alternatives: alternatives.map(alt => ({
          vendorId: alt.vendorId,
          vendorName: alt.vendorName,
          price: alt.price,
          currency: alt.currency,
          normalizedPrice: alt.normalizedPrice,
          minQuantity: alt.minQuantity,
          availability: alt.availability,
          leadTime: alt.leadTime,
          rating: alt.rating,
          isPreferred: alt.isPreferred
        })),
        ruleApplied: this.getAppliedRuleId(context, selectedOption),
        assignmentDate: new Date()
      };

      // Log assignment for audit trail
      await this.logAssignment(result, context);

      return result;
    } catch (error) {
      console.error('Price assignment failed:', error);
      throw new Error(`Price assignment failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get alternative vendor options for a given context
   */
  async getAlternativeOptions(context: PriceAssignmentContext): Promise<VendorPriceOption[]> {
    const vendorOptions = await this.getVendorOptions(context);
    return vendorOptions.slice(0, 5); // Return top 5 options
  }

  /**
   * Override an existing price assignment
   */
  async overrideAssignment(prItemId: string, override: PriceOverride): Promise<void> {
    // In a real implementation, this would update the database
    // For now, we'll simulate the override by logging it
    const overrideRecord = {
      prItemId,
      timestamp: new Date(),
      action: 'manual_override',
      vendorId: override.newVendorId,
      price: override.newPrice,
      currency: override.currency,
      reason: override.reason,
      performedBy: override.overriddenBy,
      confidenceScore: 1.0 // Manual overrides get full confidence
    };

    console.log('Price assignment override recorded:', overrideRecord);
    
    // Update assignment history
    await this.updateAssignmentHistory(prItemId, overrideRecord);
  }

  /**
   * Get assignment history for a PR item
   */
  async getAssignmentHistory(prItemId: string): Promise<PriceAssignmentHistory[]> {
    // Return mock history data filtered by prItemId
    return priceAssignmentsData.assignmentHistory.filter(
      history => history.prItemId === prItemId
    ) as unknown as PriceAssignmentHistory[];
  }

  /**
   * Get vendor options for a given context (mock implementation)
   */
  private async getVendorOptions(context: PriceAssignmentContext): Promise<VendorPriceOption[]> {
    // In a real implementation, this would query the database
    // For now, return mock data based on context
    const mockOptions = priceAssignmentsData.vendorSelections.find(
      selection => selection.prItemId === context.prItemId
    );

    if (mockOptions) {
      return mockOptions.availableVendors as unknown as VendorPriceOption[];
    }

    // Return default mock options if no specific data found
    return [
      {
        vendorId: 'vendor-001',
        vendorName: 'Global Office Supplies',
        price: 25.00,
        currency: 'USD',
        normalizedPrice: 25.00,
        minQuantity: 1,
        availability: 'available',
        leadTime: 3,
        rating: 4.5,
        isPreferred: true
      },
      {
        vendorId: 'vendor-002',
        vendorName: 'Premium Office Solutions',
        price: 28.50,
        currency: 'USD',
        normalizedPrice: 28.50,
        minQuantity: 1,
        availability: 'available',
        leadTime: 2,
        rating: 4.8,
        isPreferred: false
      }
    ];
  }

  /**
   * Apply business rules to select optimal vendor
   */
  private async applyBusinessRules(
    context: PriceAssignmentContext, 
    vendorOptions: VendorPriceOption[]
  ): Promise<VendorPriceOption> {
    // Get active business rules sorted by priority
    const activeRules = this.businessRules
      .filter(rule => rule.isActive)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of activeRules) {
      const matchingVendors = this.evaluateRule(rule, context, vendorOptions);
      if (matchingVendors.length > 0) {
        // Return the best option from matching vendors
        return this.selectBestOption(matchingVendors, context);
      }
    }

    // If no rules match, return the best option based on default criteria
    return this.selectBestOption(vendorOptions, context);
  }

  /**
   * Evaluate a business rule against context and vendor options
   */
  private evaluateRule(
    rule: BusinessRule, 
    context: PriceAssignmentContext, 
    vendorOptions: VendorPriceOption[]
  ): VendorPriceOption[] {
    return vendorOptions.filter(vendor => {
      return rule.conditions.every(condition => {
        return this.evaluateCondition(condition, context, vendor);
      });
    });
  }

  /**
   * Evaluate a single rule condition
   */
  private evaluateCondition(condition: any, context: PriceAssignmentContext, vendor: VendorPriceOption): boolean {
    const { field, operator, value } = condition;

    let fieldValue: any;
    
    // Get field value from context or vendor
    switch (field) {
      case 'categoryId':
        fieldValue = context.categoryId;
        break;
      case 'quantity':
        fieldValue = context.quantity;
        break;
      case 'location':
        fieldValue = context.location;
        break;
      case 'vendorRating':
        fieldValue = vendor.rating;
        break;
      case 'isPreferred':
        fieldValue = vendor.isPreferred;
        break;
      case 'price':
        fieldValue = vendor.normalizedPrice;
        break;
      case 'availability':
        fieldValue = vendor.availability;
        break;
      default:
        return true; // Unknown field, assume condition passes
    }

    // Evaluate condition based on operator
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'greaterThan':
        return fieldValue > value;
      case 'lessThan':
        return fieldValue < value;
      case 'contains':
        return Array.isArray(value) ? value.includes(fieldValue) : fieldValue.includes(value);
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'between':
        return Array.isArray(value) && fieldValue >= value[0] && fieldValue <= value[1];
      default:
        return true;
    }
  }

  /**
   * Select the best option from available vendors
   */
  private selectBestOption(vendorOptions: VendorPriceOption[], context: PriceAssignmentContext): VendorPriceOption {
    // Calculate weighted score for each vendor
    const scoredVendors = vendorOptions.map(vendor => ({
      vendor,
      score: this.calculateVendorScore(vendor, context)
    }));

    // Sort by score (highest first) and return the best option
    scoredVendors.sort((a, b) => b.score - a.score);
    return scoredVendors[0].vendor;
  }

  /**
   * Calculate vendor score based on multiple criteria
   */
  private calculateVendorScore(vendor: VendorPriceOption, context: PriceAssignmentContext): number {
    let score = 0;

    // Price competitiveness (lower price = higher score)
    const avgPrice = 30; // Mock average price for calculation
    const priceScore = Math.max(0, (avgPrice - vendor.normalizedPrice) / avgPrice);
    score += priceScore * 0.4;

    // Vendor rating
    score += (vendor.rating / 5) * 0.3;

    // Preferred vendor bonus
    if (vendor.isPreferred) {
      score += 0.2;
    }

    // Availability bonus
    if (vendor.availability === 'available') {
      score += 0.1;
    } else if (vendor.availability === 'limited') {
      score += 0.05;
    }

    // Lead time penalty (shorter lead time = higher score)
    const leadTimeScore = Math.max(0, (14 - vendor.leadTime) / 14);
    score += leadTimeScore * 0.1;

    return Math.min(1, Math.max(0, score)); // Normalize to 0-1 range
  }

  /**
   * Calculate confidence score for the assignment
   */
  private calculateConfidenceScore(
    selectedVendor: VendorPriceOption, 
    allVendors: VendorPriceOption[], 
    context: PriceAssignmentContext
  ): number {
    let confidence = 0.5; // Base confidence

    const factors = this.confidenceScoring.scoringCriteria;

    // Price competitiveness factor
    const avgPrice = allVendors.reduce((sum, v) => sum + v.normalizedPrice, 0) / allVendors.length;
    const priceDiff = (selectedVendor.normalizedPrice - avgPrice) / avgPrice;
    
    // Find price competitiveness factor
    const priceCompetitivenessWeight = factors.find(f => f.criteriaId === 'price_competitiveness')?.weight || 0.35;
    
    if (priceDiff <= -0.15) confidence += priceCompetitivenessWeight * 1.2;
    else if (priceDiff <= -0.10) confidence += priceCompetitivenessWeight * 1.0;
    else if (priceDiff <= -0.05) confidence += priceCompetitivenessWeight * 0.8;
    else if (priceDiff <= 0.05) confidence += priceCompetitivenessWeight * 0.6;
    else confidence += priceCompetitivenessWeight * 0.2;

    // Vendor factors
    const vendorReliabilityWeight = factors.find(f => f.criteriaId === 'vendor_reliability')?.weight || 0.25;
    if (selectedVendor.isPreferred) confidence += vendorReliabilityWeight * 1.2;
    if (selectedVendor.rating >= 4.5) confidence += vendorReliabilityWeight * 1.0;

    // Availability factors
    const availabilityWeight = factors.find(f => f.criteriaId === 'availability_status')?.weight || 0.15;
    switch (selectedVendor.availability) {
      case 'available':
        if (selectedVendor.leadTime <= 2) confidence += availabilityWeight * 1.2;
        else if (selectedVendor.leadTime <= 5) confidence += availabilityWeight * 1.0;
        else confidence += availabilityWeight * 0.8;
        break;
      case 'limited':
        confidence += availabilityWeight * 0.6;
        break;
      case 'unavailable':
        confidence += availabilityWeight * 0.2;
        break;
    }

    // Quality factors
    const qualityWeight = factors.find(f => f.criteriaId === 'quality_rating')?.weight || 0.20;
    if (selectedVendor.rating >= 4.5) confidence += qualityWeight * 1.2;
    else if (selectedVendor.rating >= 4.0) confidence += qualityWeight * 1.0;
    else if (selectedVendor.rating >= 3.5) confidence += qualityWeight * 0.8;
    else if (selectedVendor.rating >= 3.0) confidence += qualityWeight * 0.6;
    else confidence += qualityWeight * 0.4;

    return Math.min(1, Math.max(0.1, confidence)); // Clamp between 0.1 and 1.0
  }

  /**
   * Generate human-readable assignment reasoning
   */
  private generateAssignmentReason(
    selectedVendor: VendorPriceOption, 
    allVendors: VendorPriceOption[], 
    context: PriceAssignmentContext
  ): string {
    // Determine the primary reason for selection
    const isLowestPrice = allVendors.every(v => v.normalizedPrice >= selectedVendor.normalizedPrice);
    const isOnlyAvailable = allVendors.filter(v => v.availability === 'available').length === 1;
    const isPreferred = selectedVendor.isPreferred;
    const hasHighRating = selectedVendor.rating >= 4.5;

    // Find matching reasoning scenario
    let reasoningTemplate = "Selected {vendorName} based on optimal combination of price, quality, and availability";

    if (isOnlyAvailable) {
      reasoningTemplate = this.assignmentReasoningScenarios.find(s => s.reasoningId === 'only_available')?.template || reasoningTemplate;
    } else if (isLowestPrice && isPreferred) {
      reasoningTemplate = this.assignmentReasoningScenarios.find(s => s.reasoningId === 'best_price_preferred')?.template || reasoningTemplate;
    } else if (hasHighRating && !isLowestPrice) {
      reasoningTemplate = this.assignmentReasoningScenarios.find(s => s.reasoningId === 'quality_over_price')?.template || reasoningTemplate;
    } else if (isPreferred) {
      reasoningTemplate = this.assignmentReasoningScenarios.find(s => s.reasoningId === 'strategic_relationship')?.template || reasoningTemplate;
    }

    // Replace template variables
    return reasoningTemplate
      .replace('{vendorName}', selectedVendor.vendorName)
      .replace('{price}', selectedVendor.price.toString())
      .replace('{currency}', selectedVendor.currency)
      .replace('{rating}', selectedVendor.rating.toString());
  }

  /**
   * Get the ID of the applied business rule
   */
  private getAppliedRuleId(context: PriceAssignmentContext, selectedVendor: VendorPriceOption): string | undefined {
    // In a real implementation, this would track which rule was actually applied
    // For now, return a mock rule ID based on vendor characteristics
    if (selectedVendor.isPreferred) {
      return 'rule-001'; // Preferred vendor rule
    } else if (selectedVendor.availability === 'available' && selectedVendor.leadTime <= 3) {
      return 'rule-002'; // Fast delivery rule
    } else {
      return 'rule-003'; // Default assignment rule
    }
  }

  /**
   * Log assignment for audit trail
   */
  private async logAssignment(result: PriceAssignmentResult, context: PriceAssignmentContext): Promise<void> {
    const logEntry = {
      historyId: `ah-${Date.now()}`,
      prItemId: result.prItemId,
      timestamp: result.assignmentDate.toISOString(),
      action: 'initial_assignment',
      vendorId: result.selectedVendor.id,
      price: result.assignedPrice,
      currency: result.currency,
      reason: result.assignmentReason,
      performedBy: 'system',
      ruleId: result.ruleApplied,
      confidenceScore: result.confidence
    };

    console.log('Assignment logged:', logEntry);
  }

  /**
   * Update assignment history
   */
  private async updateAssignmentHistory(prItemId: string, historyEntry: any): Promise<void> {
    // In a real implementation, this would update the database
    console.log('Assignment history updated:', { prItemId, historyEntry });
  }
}

export const priceAssignmentService = new PriceAssignmentService();