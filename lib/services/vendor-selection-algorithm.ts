import { 
  VendorPriceOption, 
  PriceAssignmentContext, 
  BusinessRule,
  VendorSelectionCriteria,
  VendorSelectionResult
} from '@/lib/types/price-management';

// Mock data imports
import businessRulesData from '@/lib/mock/price-management/business-rules.json';
import priceAssignmentsData from '@/lib/mock/price-management/price-assignments.json';

export class VendorSelectionAlgorithm {
  private businessRules: BusinessRule[] = businessRulesData.businessRules as unknown as BusinessRule[];

  /**
   * Select optimal vendor based on business rules and selection criteria
   */
  async selectOptimalVendor(
    context: PriceAssignmentContext,
    vendorOptions: VendorPriceOption[],
    criteria?: VendorSelectionCriteria
  ): Promise<VendorSelectionResult> {
    if (vendorOptions.length === 0) {
      throw new Error('No vendor options available for selection');
    }

    // Apply business rules filtering
    const ruleFilteredVendors = await this.applyBusinessRulesFiltering(context, vendorOptions);
    
    // If no vendors pass business rules, use all available vendors with warning
    const candidateVendors = ruleFilteredVendors.length > 0 ? ruleFilteredVendors : vendorOptions;
    
    // Apply selection algorithm
    const scoredVendors = await this.scoreVendors(candidateVendors, context, criteria);
    
    // Select the best vendor
    const selectedVendor = scoredVendors[0];
    
    // Generate selection reasoning
    const selectionReason = this.generateSelectionReason(selectedVendor, scoredVendors, context);
    
    return {
      selectedVendor: selectedVendor.vendor,
      selectionScore: selectedVendor.score,
      selectionReason,
      alternativeVendors: scoredVendors.slice(1, 4).map(sv => ({
        vendor: sv.vendor,
        score: sv.score,
        reason: this.generateAlternativeReason(sv, selectedVendor)
      })),
      appliedRules: this.getAppliedRules(context, selectedVendor.vendor),
      selectionCriteria: criteria || this.getDefaultCriteria(),
      selectionTimestamp: new Date()
    };
  }

  /**
   * Apply business rules to filter vendor options
   */
  private async applyBusinessRulesFiltering(
    context: PriceAssignmentContext,
    vendorOptions: VendorPriceOption[]
  ): Promise<VendorPriceOption[]> {
    const activeRules = this.businessRules
      .filter(rule => rule.isActive)
      .sort((a, b) => b.priority - a.priority);

    let filteredVendors = [...vendorOptions];

    for (const rule of activeRules) {
      const ruleResult = this.applyRule(rule, context, filteredVendors);
      
      if (ruleResult.action === 'filter') {
        filteredVendors = ruleResult.vendors;
      } else if (ruleResult.action === 'boost') {
        // Apply score boost to matching vendors
        ruleResult.vendors.forEach(vendor => {
          const vendorIndex = filteredVendors.findIndex(v => v.vendorId === vendor.vendorId);
          if (vendorIndex >= 0) {
            (filteredVendors[vendorIndex] as any).ruleBoost = (filteredVendors[vendorIndex] as any).ruleBoost || 0;
            (filteredVendors[vendorIndex] as any).ruleBoost += ruleResult.boost || 0.1;
          }
        });
      }
    }

    return filteredVendors;
  }

  /**
   * Apply a single business rule
   */
  private applyRule(
    rule: BusinessRule,
    context: PriceAssignmentContext,
    vendors: VendorPriceOption[]
  ): { action: 'filter' | 'boost' | 'none'; vendors: VendorPriceOption[]; boost?: number } {
    const matchingVendors = vendors.filter(vendor => {
      return rule.conditions.every(condition => {
        return this.evaluateRuleCondition(condition, context, vendor);
      });
    });

    // Determine action based on rule actions
    const filterAction = rule.actions.find(action => action.type === 'filterVendors');
    const boostAction = rule.actions.find(action => action.type === 'boostScore');

    if (filterAction && matchingVendors.length > 0) {
      return { action: 'filter', vendors: matchingVendors };
    } else if (boostAction && matchingVendors.length > 0) {
      return { 
        action: 'boost', 
        vendors: matchingVendors, 
        boost: boostAction.parameters?.boost || 0.1 
      };
    }

    return { action: 'none', vendors };
  }

  /**
   * Evaluate a rule condition
   */
  private evaluateRuleCondition(
    condition: any,
    context: PriceAssignmentContext,
    vendor: VendorPriceOption
  ): boolean {
    const { field, operator, value } = condition;

    let fieldValue: any;
    
    // Map field to actual value
    switch (field) {
      case 'category':
        fieldValue = context.categoryId;
        break;
      case 'quantity':
        fieldValue = context.quantity;
        break;
      case 'location':
        fieldValue = context.location;
        break;
      case 'department':
        fieldValue = context.department;
        break;
      case 'vendorRating':
        fieldValue = vendor.rating;
        break;
      case 'vendorPreferred':
        fieldValue = vendor.isPreferred;
        break;
      case 'price':
        fieldValue = vendor.normalizedPrice;
        break;
      case 'availability':
        fieldValue = vendor.availability;
        break;
      case 'leadTime':
        fieldValue = vendor.leadTime;
        break;
      case 'minQuantity':
        fieldValue = vendor.minQuantity;
        break;
      default:
        return true;
    }

    // Apply operator
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'notEquals':
        return fieldValue !== value;
      case 'greaterThan':
        return fieldValue > value;
      case 'greaterThanOrEqual':
        return fieldValue >= value;
      case 'lessThan':
        return fieldValue < value;
      case 'lessThanOrEqual':
        return fieldValue <= value;
      case 'contains':
        return Array.isArray(value) ? value.includes(fieldValue) : 
               typeof fieldValue === 'string' ? fieldValue.includes(value) : false;
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'between':
        return Array.isArray(value) && value.length === 2 && 
               fieldValue >= value[0] && fieldValue <= value[1];
      default:
        return true;
    }
  }

  /**
   * Score vendors based on multiple criteria
   */
  private async scoreVendors(
    vendors: VendorPriceOption[],
    context: PriceAssignmentContext,
    criteria?: VendorSelectionCriteria
  ): Promise<Array<{ vendor: VendorPriceOption; score: number; breakdown: any }>> {
    const selectionCriteria = criteria || this.getDefaultCriteria();
    
    const scoredVendors = vendors.map(vendor => {
      const breakdown = this.calculateScoreBreakdown(vendor, vendors, context, selectionCriteria);
      const totalScore = this.calculateTotalScore(breakdown, selectionCriteria);
      
      return {
        vendor,
        score: totalScore,
        breakdown
      };
    });

    // Sort by score (highest first)
    return scoredVendors.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate detailed score breakdown for a vendor
   */
  private calculateScoreBreakdown(
    vendor: VendorPriceOption,
    allVendors: VendorPriceOption[],
    context: PriceAssignmentContext,
    criteria: VendorSelectionCriteria
  ): any {
    const breakdown = {
      priceScore: 0,
      qualityScore: 0,
      reliabilityScore: 0,
      availabilityScore: 0,
      preferenceScore: 0,
      ruleBoost: (vendor as any).ruleBoost || 0
    };

    // Price competitiveness score (lower price = higher score)
    const prices = allVendors.map(v => v.normalizedPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    if (priceRange > 0) {
      breakdown.priceScore = (maxPrice - vendor.normalizedPrice) / priceRange;
    } else {
      breakdown.priceScore = 1; // All prices are the same
    }

    // Quality score (based on vendor rating)
    breakdown.qualityScore = vendor.rating / 5;

    // Reliability score (mock calculation based on rating and preferred status)
    breakdown.reliabilityScore = (vendor.rating / 5) * 0.8 + (vendor.isPreferred ? 0.2 : 0);

    // Availability score
    switch (vendor.availability) {
      case 'available':
        breakdown.availabilityScore = 1.0 - (vendor.leadTime / 14); // Normalize lead time
        break;
      case 'limited':
        breakdown.availabilityScore = 0.6 - (vendor.leadTime / 14);
        break;
      case 'unavailable':
        breakdown.availabilityScore = 0.2;
        break;
      default:
        breakdown.availabilityScore = 0.5;
    }

    // Preference score
    breakdown.preferenceScore = vendor.isPreferred ? 1.0 : 0.0;

    // Ensure all scores are between 0 and 1
    Object.keys(breakdown).forEach(key => {
      if (key !== 'ruleBoost') {
        (breakdown as any)[key] = Math.max(0, Math.min(1, (breakdown as any)[key]));
      }
    });

    return breakdown;
  }

  /**
   * Calculate total weighted score
   */
  private calculateTotalScore(breakdown: any, criteria: VendorSelectionCriteria): number {
    const weightedScore = 
      breakdown.priceScore * criteria.priceWeight +
      breakdown.qualityScore * criteria.qualityWeight +
      breakdown.reliabilityScore * criteria.reliabilityWeight +
      breakdown.availabilityScore * criteria.availabilityWeight +
      breakdown.preferenceScore * criteria.preferenceWeight +
      breakdown.ruleBoost;

    return Math.max(0, Math.min(1, weightedScore));
  }

  /**
   * Generate selection reasoning
   */
  private generateSelectionReason(
    selectedVendor: { vendor: VendorPriceOption; score: number; breakdown: any },
    allScoredVendors: Array<{ vendor: VendorPriceOption; score: number; breakdown: any }>,
    context: PriceAssignmentContext
  ): string {
    const vendor = selectedVendor.vendor;
    const breakdown = selectedVendor.breakdown;
    
    // Identify the strongest factors
    const factors = [];
    
    if (breakdown.priceScore > 0.8) {
      factors.push('competitive pricing');
    }
    
    if (breakdown.qualityScore > 0.8) {
      factors.push('high quality rating');
    }
    
    if (breakdown.reliabilityScore > 0.8) {
      factors.push('proven reliability');
    }
    
    if (breakdown.availabilityScore > 0.8) {
      factors.push('immediate availability');
    }
    
    if (breakdown.preferenceScore > 0) {
      factors.push('preferred vendor status');
    }
    
    if (breakdown.ruleBoost > 0) {
      factors.push('business rule compliance');
    }

    let reason = `Selected ${vendor.vendorName}`;
    
    if (factors.length > 0) {
      reason += ` based on ${factors.join(', ')}`;
    } else {
      reason += ' as the best available option';
    }
    
    reason += ` (score: ${selectedVendor.score.toFixed(2)})`;
    
    return reason;
  }

  /**
   * Generate reasoning for alternative vendors
   */
  private generateAlternativeReason(
    alternative: { vendor: VendorPriceOption; score: number; breakdown: any },
    selected: { vendor: VendorPriceOption; score: number; breakdown: any }
  ): string {
    const vendor = alternative.vendor;
    const breakdown = alternative.breakdown;
    
    // Compare with selected vendor to identify why it wasn't chosen
    const reasons = [];
    
    if (breakdown.priceScore < selected.breakdown.priceScore - 0.1) {
      reasons.push('higher price');
    }
    
    if (breakdown.qualityScore < selected.breakdown.qualityScore - 0.1) {
      reasons.push('lower quality rating');
    }
    
    if (breakdown.availabilityScore < selected.breakdown.availabilityScore - 0.1) {
      reasons.push('limited availability');
    }
    
    if (!vendor.isPreferred && selected.vendor.isPreferred) {
      reasons.push('not a preferred vendor');
    }

    let reason = `${vendor.vendorName}`;
    
    if (reasons.length > 0) {
      reason += ` - not selected due to ${reasons.join(', ')}`;
    } else {
      reason += ` - close alternative option`;
    }
    
    reason += ` (score: ${alternative.score.toFixed(2)})`;
    
    return reason;
  }

  /**
   * Get applied rules for the selection
   */
  private getAppliedRules(context: PriceAssignmentContext, selectedVendor: VendorPriceOption): string[] {
    const appliedRules = [];
    
    // Check which rules would apply to the selected vendor
    for (const rule of this.businessRules.filter(r => r.isActive)) {
      const matches = rule.conditions.every(condition => {
        return this.evaluateRuleCondition(condition, context, selectedVendor);
      });
      
      if (matches) {
        appliedRules.push(rule.id);
      }
    }
    
    return appliedRules;
  }

  /**
   * Get default selection criteria
   */
  private getDefaultCriteria(): VendorSelectionCriteria {
    // Use criteria from mock data if available
    const mockCriteria = priceAssignmentsData.vendorSelections[0]?.selectionCriteria;
    
    if (mockCriteria) {
      return {
        priceWeight: mockCriteria.priceWeight,
        qualityWeight: mockCriteria.qualityWeight,
        reliabilityWeight: mockCriteria.reliabilityWeight,
        availabilityWeight: mockCriteria.leadTimeWeight, // Map leadTimeWeight to availabilityWeight
        preferenceWeight: 0.1 // Default preference weight
      };
    }

    // Default criteria
    return {
      priceWeight: 0.35,
      qualityWeight: 0.25,
      reliabilityWeight: 0.20,
      availabilityWeight: 0.15,
      preferenceWeight: 0.05
    };
  }

  /**
   * Validate vendor selection criteria
   */
  validateCriteria(criteria: VendorSelectionCriteria): boolean {
    const totalWeight = criteria.priceWeight + criteria.qualityWeight + 
                       criteria.reliabilityWeight + criteria.availabilityWeight + 
                       criteria.preferenceWeight;
    
    return Math.abs(totalWeight - 1.0) < 0.01; // Allow small floating point differences
  }

  /**
   * Get vendor selection statistics
   */
  async getSelectionStatistics(
    context: PriceAssignmentContext,
    vendorOptions: VendorPriceOption[]
  ): Promise<any> {
    const scoredVendors = await this.scoreVendors(vendorOptions, context);
    
    return {
      totalVendors: vendorOptions.length,
      availableVendors: vendorOptions.filter(v => v.availability === 'available').length,
      preferredVendors: vendorOptions.filter(v => v.isPreferred).length,
      averageRating: vendorOptions.reduce((sum, v) => sum + v.rating, 0) / vendorOptions.length,
      priceRange: {
        min: Math.min(...vendorOptions.map(v => v.normalizedPrice)),
        max: Math.max(...vendorOptions.map(v => v.normalizedPrice)),
        average: vendorOptions.reduce((sum, v) => sum + v.normalizedPrice, 0) / vendorOptions.length
      },
      leadTimeRange: {
        min: Math.min(...vendorOptions.map(v => v.leadTime)),
        max: Math.max(...vendorOptions.map(v => v.leadTime)),
        average: vendorOptions.reduce((sum, v) => sum + v.leadTime, 0) / vendorOptions.length
      },
      topVendor: scoredVendors[0]?.vendor,
      scoreDistribution: scoredVendors.map(sv => ({
        vendorId: sv.vendor.vendorId,
        vendorName: sv.vendor.vendorName,
        score: sv.score
      }))
    };
  }
}

export const vendorSelectionAlgorithm = new VendorSelectionAlgorithm();