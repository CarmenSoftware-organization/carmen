import { 
  VendorPriceOption, 
  PriceAssignmentContext, 
  AlternativeOption,
  VendorComparison,
  ComparisonMetrics
} from '@/lib/types/price-management';

// Mock data imports
import priceAssignmentsData from '@/lib/mock/price-management/price-assignments.json';

export class AlternativeOptionsService {
  /**
   * Generate alternative vendor options with detailed comparison
   */
  async generateAlternativeOptions(
    selectedVendor: VendorPriceOption,
    availableVendors: VendorPriceOption[],
    context: PriceAssignmentContext
  ): Promise<AlternativeOption[]> {
    // Filter out the selected vendor
    const alternatives = availableVendors.filter(vendor => vendor.vendorId !== selectedVendor.vendorId);
    
    // Score and rank alternatives
    const scoredAlternatives = await this.scoreAlternatives(alternatives, selectedVendor, context);
    
    // Generate detailed comparison for each alternative
    const alternativeOptions = await Promise.all(
      scoredAlternatives.slice(0, 5).map(async (alternative) => {
        const comparison = await this.generateVendorComparison(alternative.vendor, selectedVendor, context);
        const recommendation = this.generateAlternativeRecommendation(alternative, selectedVendor, context);
        
        return {
          vendor: alternative.vendor,
          score: alternative.score,
          comparison,
          recommendation,
          switchingCost: this.calculateSwitchingCost(alternative.vendor, selectedVendor, context),
          riskAssessment: this.assessAlternativeRisk(alternative.vendor, selectedVendor, context),
          opportunityAnalysis: this.analyzeOpportunity(alternative.vendor, selectedVendor, context)
        };
      })
    );

    return alternativeOptions;
  }

  /**
   * Generate comprehensive vendor comparison
   */
  async generateVendorComparison(
    alternativeVendor: VendorPriceOption,
    selectedVendor: VendorPriceOption,
    context: PriceAssignmentContext
  ): Promise<VendorComparison> {
    const metrics = this.calculateComparisonMetrics(alternativeVendor, selectedVendor);
    
    return {
      priceComparison: {
        alternativePrice: alternativeVendor.price,
        selectedPrice: selectedVendor.price,
        currency: alternativeVendor.currency,
        difference: alternativeVendor.normalizedPrice - selectedVendor.normalizedPrice,
        percentageDifference: ((alternativeVendor.normalizedPrice - selectedVendor.normalizedPrice) / selectedVendor.normalizedPrice) * 100,
        savings: selectedVendor.normalizedPrice - alternativeVendor.normalizedPrice,
        totalOrderSavings: (selectedVendor.normalizedPrice - alternativeVendor.normalizedPrice) * context.quantity
      },
      qualityComparison: {
        alternativeRating: alternativeVendor.rating,
        selectedRating: selectedVendor.rating,
        ratingDifference: alternativeVendor.rating - selectedVendor.rating,
        qualityAdvantage: this.determineQualityAdvantage(alternativeVendor.rating, selectedVendor.rating)
      },
      deliveryComparison: {
        alternativeLeadTime: alternativeVendor.leadTime,
        selectedLeadTime: selectedVendor.leadTime,
        leadTimeDifference: alternativeVendor.leadTime - selectedVendor.leadTime,
        alternativeAvailability: alternativeVendor.availability,
        selectedAvailability: selectedVendor.availability,
        deliveryAdvantage: this.determineDeliveryAdvantage(alternativeVendor, selectedVendor)
      },
      relationshipComparison: {
        alternativeIsPreferred: alternativeVendor.isPreferred,
        selectedIsPreferred: selectedVendor.isPreferred,
        relationshipAdvantage: this.determineRelationshipAdvantage(alternativeVendor.isPreferred, selectedVendor.isPreferred)
      },
      overallMetrics: metrics,
      recommendationSummary: this.generateComparisonSummary(alternativeVendor, selectedVendor, metrics)
    };
  }

  /**
   * Score alternative vendors relative to selected vendor
   */
  private async scoreAlternatives(
    alternatives: VendorPriceOption[],
    selectedVendor: VendorPriceOption,
    context: PriceAssignmentContext
  ): Promise<Array<{ vendor: VendorPriceOption; score: number; breakdown: any }>> {
    return alternatives.map(vendor => {
      const breakdown = this.calculateAlternativeScoreBreakdown(vendor, selectedVendor, context);
      const totalScore = this.calculateAlternativeTotalScore(breakdown);
      
      return {
        vendor,
        score: totalScore,
        breakdown
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate detailed score breakdown for alternative
   */
  private calculateAlternativeScoreBreakdown(
    alternative: VendorPriceOption,
    selected: VendorPriceOption,
    context: PriceAssignmentContext
  ): any {
    return {
      priceAdvantage: this.calculatePriceAdvantage(alternative, selected),
      qualityAdvantage: this.calculateQualityAdvantage(alternative, selected),
      deliveryAdvantage: this.calculateDeliveryAdvantage(alternative, selected),
      relationshipAdvantage: this.calculateRelationshipAdvantage(alternative, selected),
      riskFactor: this.calculateRiskFactor(alternative, selected),
      opportunityScore: this.calculateOpportunityScore(alternative, selected, context)
    };
  }

  /**
   * Calculate price advantage score
   */
  private calculatePriceAdvantage(alternative: VendorPriceOption, selected: VendorPriceOption): number {
    const priceDiff = selected.normalizedPrice - alternative.normalizedPrice;
    const percentageSavings = (priceDiff / selected.normalizedPrice) * 100;
    
    // Score based on percentage savings
    if (percentageSavings >= 20) return 1.0;
    if (percentageSavings >= 15) return 0.8;
    if (percentageSavings >= 10) return 0.6;
    if (percentageSavings >= 5) return 0.4;
    if (percentageSavings >= 0) return 0.2;
    
    // Penalty for higher price
    if (percentageSavings >= -5) return -0.2;
    if (percentageSavings >= -10) return -0.4;
    if (percentageSavings >= -15) return -0.6;
    return -0.8;
  }

  /**
   * Calculate quality advantage score
   */
  private calculateQualityAdvantage(alternative: VendorPriceOption, selected: VendorPriceOption): number {
    const ratingDiff = alternative.rating - selected.rating;
    
    if (ratingDiff >= 1.0) return 1.0;
    if (ratingDiff >= 0.5) return 0.6;
    if (ratingDiff >= 0.2) return 0.3;
    if (ratingDiff >= -0.2) return 0.0;
    if (ratingDiff >= -0.5) return -0.3;
    if (ratingDiff >= -1.0) return -0.6;
    return -1.0;
  }

  /**
   * Calculate delivery advantage score
   */
  private calculateDeliveryAdvantage(alternative: VendorPriceOption, selected: VendorPriceOption): number {
    let score = 0;
    
    // Availability comparison
    const availabilityScore = this.getAvailabilityScore(alternative.availability) - 
                             this.getAvailabilityScore(selected.availability);
    score += availabilityScore * 0.6;
    
    // Lead time comparison (shorter is better)
    const leadTimeDiff = selected.leadTime - alternative.leadTime;
    if (leadTimeDiff >= 3) score += 0.4;
    else if (leadTimeDiff >= 1) score += 0.2;
    else if (leadTimeDiff >= -1) score += 0.0;
    else if (leadTimeDiff >= -3) score -= 0.2;
    else score -= 0.4;
    
    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Calculate relationship advantage score
   */
  private calculateRelationshipAdvantage(alternative: VendorPriceOption, selected: VendorPriceOption): number {
    if (alternative.isPreferred && !selected.isPreferred) return 0.5;
    if (!alternative.isPreferred && selected.isPreferred) return -0.5;
    return 0;
  }

  /**
   * Calculate risk factor
   */
  private calculateRiskFactor(alternative: VendorPriceOption, selected: VendorPriceOption): number {
    let riskScore = 0;
    
    // Rating-based risk
    if (alternative.rating < 3.5) riskScore += 0.3;
    else if (alternative.rating < 4.0) riskScore += 0.1;
    
    // Availability risk
    if (alternative.availability === 'unavailable') riskScore += 0.4;
    else if (alternative.availability === 'limited') riskScore += 0.2;
    
    // Lead time risk
    if (alternative.leadTime > 10) riskScore += 0.2;
    else if (alternative.leadTime > 7) riskScore += 0.1;
    
    return riskScore;
  }

  /**
   * Calculate opportunity score
   */
  private calculateOpportunityScore(
    alternative: VendorPriceOption,
    selected: VendorPriceOption,
    context: PriceAssignmentContext
  ): number {
    let opportunityScore = 0;
    
    // Price opportunity
    const priceSavings = selected.normalizedPrice - alternative.normalizedPrice;
    const totalSavings = priceSavings * context.quantity;
    if (totalSavings > 100) opportunityScore += 0.3;
    else if (totalSavings > 50) opportunityScore += 0.2;
    else if (totalSavings > 20) opportunityScore += 0.1;
    
    // Quality opportunity
    if (alternative.rating > selected.rating + 0.5) opportunityScore += 0.2;
    
    // Strategic opportunity
    if (alternative.isPreferred && !selected.isPreferred) opportunityScore += 0.2;
    
    // Delivery opportunity
    if (alternative.leadTime < selected.leadTime - 2) opportunityScore += 0.1;
    
    return opportunityScore;
  }

  /**
   * Calculate total alternative score
   */
  private calculateAlternativeTotalScore(breakdown: any): number {
    const weights = {
      priceAdvantage: 0.35,
      qualityAdvantage: 0.25,
      deliveryAdvantage: 0.20,
      relationshipAdvantage: 0.10,
      opportunityScore: 0.10
    };
    
    const score = 
      breakdown.priceAdvantage * weights.priceAdvantage +
      breakdown.qualityAdvantage * weights.qualityAdvantage +
      breakdown.deliveryAdvantage * weights.deliveryAdvantage +
      breakdown.relationshipAdvantage * weights.relationshipAdvantage +
      breakdown.opportunityScore * weights.opportunityScore -
      breakdown.riskFactor * 0.2; // Risk penalty
    
    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Calculate comparison metrics
   */
  private calculateComparisonMetrics(
    alternative: VendorPriceOption,
    selected: VendorPriceOption
  ): ComparisonMetrics {
    return {
      overallScore: this.calculateOverallComparisonScore(alternative, selected),
      priceScore: this.calculatePriceAdvantage(alternative, selected),
      qualityScore: this.calculateQualityAdvantage(alternative, selected),
      deliveryScore: this.calculateDeliveryAdvantage(alternative, selected),
      relationshipScore: this.calculateRelationshipAdvantage(alternative, selected),
      riskScore: this.calculateRiskFactor(alternative, selected),
      recommendation: this.getMetricsRecommendation(alternative, selected)
    };
  }

  /**
   * Calculate overall comparison score
   */
  private calculateOverallComparisonScore(alternative: VendorPriceOption, selected: VendorPriceOption): number {
    const priceScore = this.calculatePriceAdvantage(alternative, selected) * 0.4;
    const qualityScore = this.calculateQualityAdvantage(alternative, selected) * 0.3;
    const deliveryScore = this.calculateDeliveryAdvantage(alternative, selected) * 0.2;
    const relationshipScore = this.calculateRelationshipAdvantage(alternative, selected) * 0.1;
    
    return priceScore + qualityScore + deliveryScore + relationshipScore;
  }

  /**
   * Generate alternative recommendation
   */
  private generateAlternativeRecommendation(
    alternative: { vendor: VendorPriceOption; score: number; breakdown: any },
    selectedVendor: VendorPriceOption,
    context: PriceAssignmentContext
  ): any {
    const vendor = alternative.vendor;
    const breakdown = alternative.breakdown;
    
    let recommendation = 'consider';
    let reasoning = [];
    let confidence = 0.5;
    
    // Determine recommendation level
    if (alternative.score > 0.3) {
      recommendation = 'strongly_recommend';
      confidence = 0.8;
    } else if (alternative.score > 0.1) {
      recommendation = 'recommend';
      confidence = 0.7;
    } else if (alternative.score > -0.1) {
      recommendation = 'consider';
      confidence = 0.5;
    } else {
      recommendation = 'not_recommended';
      confidence = 0.3;
    }
    
    // Generate reasoning
    if (breakdown.priceAdvantage > 0.2) {
      reasoning.push(`Significant cost savings: ${((selectedVendor.normalizedPrice - vendor.normalizedPrice) * context.quantity).toFixed(2)} USD total`);
    }
    
    if (breakdown.qualityAdvantage > 0.2) {
      reasoning.push(`Higher quality rating: ${vendor.rating}/5 vs ${selectedVendor.rating}/5`);
    }
    
    if (breakdown.deliveryAdvantage > 0.2) {
      reasoning.push(`Better delivery terms: ${vendor.availability} with ${vendor.leadTime} days lead time`);
    }
    
    if (breakdown.relationshipAdvantage > 0) {
      reasoning.push('Preferred vendor status provides strategic advantage');
    }
    
    if (breakdown.riskFactor > 0.3) {
      reasoning.push('Higher risk due to performance or availability concerns');
    }
    
    return {
      level: recommendation,
      confidence,
      reasoning: reasoning.length > 0 ? reasoning : ['Standard alternative option'],
      actionItems: this.generateActionItems(vendor, selectedVendor, breakdown),
      timeline: this.estimateImplementationTimeline(vendor, selectedVendor),
      impact: this.assessImplementationImpact(vendor, selectedVendor, context)
    };
  }

  /**
   * Calculate switching cost
   */
  private calculateSwitchingCost(
    alternative: VendorPriceOption,
    selected: VendorPriceOption,
    context: PriceAssignmentContext
  ): any {
    // Mock switching cost calculation
    const baseCost = 50; // Base administrative cost
    const relationshipCost = selected.isPreferred && !alternative.isPreferred ? 100 : 0;
    const qualityCost = alternative.rating < selected.rating ? 75 : 0;
    const deliveryCost = alternative.leadTime > selected.leadTime ? 25 : 0;
    
    const totalCost = baseCost + relationshipCost + qualityCost + deliveryCost;
    
    return {
      totalCost,
      breakdown: {
        administrative: baseCost,
        relationship: relationshipCost,
        quality: qualityCost,
        delivery: deliveryCost
      },
      paybackPeriod: this.calculatePaybackPeriod(alternative, selected, context, totalCost)
    };
  }

  /**
   * Assess alternative risk
   */
  private assessAlternativeRisk(
    alternative: VendorPriceOption,
    selected: VendorPriceOption,
    context: PriceAssignmentContext
  ): any {
    const risks = [];
    
    if (alternative.rating < selected.rating - 0.5) {
      risks.push({
        type: 'quality',
        level: 'medium',
        description: 'Lower vendor rating may impact product quality'
      });
    }
    
    if (alternative.availability === 'limited' && selected.availability === 'available') {
      risks.push({
        type: 'availability',
        level: 'medium',
        description: 'Limited stock availability may cause delays'
      });
    }
    
    if (alternative.leadTime > selected.leadTime + 3) {
      risks.push({
        type: 'delivery',
        level: 'low',
        description: 'Extended lead time may impact project timeline'
      });
    }
    
    if (!alternative.isPreferred && selected.isPreferred) {
      risks.push({
        type: 'relationship',
        level: 'low',
        description: 'Loss of preferred vendor benefits'
      });
    }
    
    return {
      overallLevel: this.calculateOverallRiskLevel(risks),
      identifiedRisks: risks,
      mitigationStrategies: this.generateRiskMitigations(risks)
    };
  }

  /**
   * Analyze opportunity
   */
  private analyzeOpportunity(
    alternative: VendorPriceOption,
    selected: VendorPriceOption,
    context: PriceAssignmentContext
  ): any {
    const opportunities = [];
    
    const priceSavings = selected.normalizedPrice - alternative.normalizedPrice;
    if (priceSavings > 0) {
      opportunities.push({
        type: 'cost_savings',
        value: priceSavings * context.quantity,
        description: `Potential savings of ${(priceSavings * context.quantity).toFixed(2)} USD`
      });
    }
    
    if (alternative.rating > selected.rating + 0.3) {
      opportunities.push({
        type: 'quality_improvement',
        value: alternative.rating - selected.rating,
        description: `Quality improvement from ${selected.rating}/5 to ${alternative.rating}/5`
      });
    }
    
    if (alternative.leadTime < selected.leadTime - 2) {
      opportunities.push({
        type: 'faster_delivery',
        value: selected.leadTime - alternative.leadTime,
        description: `${selected.leadTime - alternative.leadTime} days faster delivery`
      });
    }
    
    if (alternative.isPreferred && !selected.isPreferred) {
      opportunities.push({
        type: 'strategic_relationship',
        value: 1,
        description: 'Strengthen preferred vendor relationship'
      });
    }
    
    return {
      totalOpportunityValue: this.calculateTotalOpportunityValue(opportunities),
      identifiedOpportunities: opportunities,
      implementationPriority: this.calculateImplementationPriority(opportunities),
      expectedROI: this.calculateExpectedROI(opportunities, alternative, selected, context)
    };
  }

  /**
   * Helper methods
   */
  private getAvailabilityScore(availability: string): number {
    switch (availability) {
      case 'available': return 1.0;
      case 'limited': return 0.5;
      case 'unavailable': return 0.0;
      default: return 0.5;
    }
  }

  private determineQualityAdvantage(altRating: number, selRating: number): string {
    const diff = altRating - selRating;
    if (diff > 0.5) return 'significantly_better';
    if (diff > 0.2) return 'better';
    if (diff > -0.2) return 'similar';
    if (diff > -0.5) return 'worse';
    return 'significantly_worse';
  }

  private determineDeliveryAdvantage(alt: VendorPriceOption, sel: VendorPriceOption): string {
    const availabilityDiff = this.getAvailabilityScore(alt.availability) - this.getAvailabilityScore(sel.availability);
    const leadTimeDiff = sel.leadTime - alt.leadTime;
    
    if (availabilityDiff > 0 || leadTimeDiff > 2) return 'better';
    if (availabilityDiff < 0 || leadTimeDiff < -2) return 'worse';
    return 'similar';
  }

  private determineRelationshipAdvantage(altPreferred: boolean, selPreferred: boolean): string {
    if (altPreferred && !selPreferred) return 'better';
    if (!altPreferred && selPreferred) return 'worse';
    return 'similar';
  }

  private generateComparisonSummary(alt: VendorPriceOption, sel: VendorPriceOption, metrics: ComparisonMetrics): string {
    if (metrics.overallScore > 0.3) {
      return `${alt.vendorName} offers significant advantages over current selection`;
    } else if (metrics.overallScore > 0.1) {
      return `${alt.vendorName} provides moderate advantages worth considering`;
    } else if (metrics.overallScore > -0.1) {
      return `${alt.vendorName} is comparable to current selection`;
    } else {
      return `Current selection is preferable to ${alt.vendorName}`;
    }
  }

  private getMetricsRecommendation(alt: VendorPriceOption, sel: VendorPriceOption): string {
    const overallScore = this.calculateOverallComparisonScore(alt, sel);
    
    if (overallScore > 0.3) return 'switch';
    if (overallScore > 0.1) return 'consider';
    return 'maintain';
  }

  private generateActionItems(alt: VendorPriceOption, sel: VendorPriceOption, breakdown: any): string[] {
    const actions = [];
    
    if (breakdown.priceAdvantage > 0.2) {
      actions.push('Negotiate with current vendor to match pricing');
    }
    
    if (breakdown.qualityAdvantage > 0.2) {
      actions.push('Request quality samples from alternative vendor');
    }
    
    if (breakdown.deliveryAdvantage > 0.2) {
      actions.push('Verify delivery capabilities and lead times');
    }
    
    if (breakdown.riskFactor > 0.3) {
      actions.push('Conduct thorough vendor assessment');
    }
    
    return actions.length > 0 ? actions : ['Monitor vendor performance'];
  }

  private estimateImplementationTimeline(alt: VendorPriceOption, sel: VendorPriceOption): string {
    if (alt.isPreferred) return '1-2 weeks';
    if (alt.rating >= 4.0) return '2-3 weeks';
    return '3-4 weeks';
  }

  private assessImplementationImpact(alt: VendorPriceOption, sel: VendorPriceOption, context: PriceAssignmentContext): string {
    const priceDiff = Math.abs(alt.normalizedPrice - sel.normalizedPrice);
    const qualityDiff = Math.abs(alt.rating - sel.rating);
    
    if (priceDiff > 10 || qualityDiff > 0.5) return 'high';
    if (priceDiff > 5 || qualityDiff > 0.3) return 'medium';
    return 'low';
  }

  private calculatePaybackPeriod(alt: VendorPriceOption, sel: VendorPriceOption, context: PriceAssignmentContext, switchingCost: number): string {
    const monthlySavings = (sel.normalizedPrice - alt.normalizedPrice) * context.quantity;
    
    if (monthlySavings <= 0) return 'No payback - higher cost';
    
    const months = switchingCost / monthlySavings;
    
    if (months < 1) return 'Less than 1 month';
    if (months < 6) return `${Math.ceil(months)} months`;
    if (months < 12) return `${Math.ceil(months)} months`;
    return 'More than 1 year';
  }

  private calculateOverallRiskLevel(risks: any[]): string {
    if (risks.some(r => r.level === 'high')) return 'high';
    if (risks.some(r => r.level === 'medium')) return 'medium';
    return 'low';
  }

  private generateRiskMitigations(risks: any[]): string[] {
    return risks.map(risk => {
      switch (risk.type) {
        case 'quality': return 'Request quality certifications and samples';
        case 'availability': return 'Establish backup inventory arrangements';
        case 'delivery': return 'Plan for extended delivery timeline';
        case 'relationship': return 'Negotiate similar terms with new vendor';
        default: return 'Monitor and assess regularly';
      }
    });
  }

  private calculateTotalOpportunityValue(opportunities: any[]): number {
    return opportunities.reduce((total, opp) => {
      if (opp.type === 'cost_savings') return total + opp.value;
      return total + (opp.value * 10); // Mock value conversion
    }, 0);
  }

  private calculateImplementationPriority(opportunities: any[]): string {
    const totalValue = this.calculateTotalOpportunityValue(opportunities);
    
    if (totalValue > 500) return 'high';
    if (totalValue > 100) return 'medium';
    return 'low';
  }

  private calculateExpectedROI(opportunities: any[], alt: VendorPriceOption, sel: VendorPriceOption, context: PriceAssignmentContext): number {
    const totalValue = this.calculateTotalOpportunityValue(opportunities);
    const implementationCost = 100; // Mock implementation cost
    
    return totalValue > 0 ? ((totalValue - implementationCost) / implementationCost) * 100 : 0;
  }
}

export const alternativeOptionsService = new AlternativeOptionsService();