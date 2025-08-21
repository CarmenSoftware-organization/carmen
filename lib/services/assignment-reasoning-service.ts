import { 
  VendorPriceOption, 
  PriceAssignmentContext, 
  AssignmentReasoning,
  ConfidenceScore,
  ReasoningFactor
} from '@/lib/types/price-management';

// Mock data imports
import confidenceScoringData from '@/lib/mock/price-management/confidence-scoring.json';

export class AssignmentReasoningService {
  private confidenceScoring = confidenceScoringData.confidenceScoring;
  private reasoningScenarios = confidenceScoringData.assignmentReasoningScenarios;
  private confidenceFactors = confidenceScoringData.confidenceFactors;

  /**
   * Generate comprehensive assignment reasoning
   */
  async generateAssignmentReasoning(
    selectedVendor: VendorPriceOption,
    alternativeVendors: VendorPriceOption[],
    context: PriceAssignmentContext
  ): Promise<AssignmentReasoning> {
    // Calculate confidence score
    const confidenceScore = await this.calculateConfidenceScore(selectedVendor, alternativeVendors, context);
    
    // Generate primary reasoning
    const primaryReason = this.generatePrimaryReason(selectedVendor, alternativeVendors, context);
    
    // Generate detailed reasoning factors
    const reasoningFactors = this.generateReasoningFactors(selectedVendor, alternativeVendors, context);
    
    // Generate risk assessment
    const riskAssessment = this.generateRiskAssessment(selectedVendor, context);
    
    // Generate alternative analysis
    const alternativeAnalysis = this.generateAlternativeAnalysis(alternativeVendors, selectedVendor);

    return {
      primaryReason,
      confidenceScore,
      reasoningFactors,
      riskAssessment,
      alternativeAnalysis,
      recommendationStrength: this.getRecommendationStrength(confidenceScore.overall),
      generatedAt: new Date()
    };
  }

  /**
   * Calculate comprehensive confidence score
   */
  async calculateConfidenceScore(
    selectedVendor: VendorPriceOption,
    alternativeVendors: VendorPriceOption[],
    context: PriceAssignmentContext
  ): Promise<ConfidenceScore> {
    const allVendors = [selectedVendor, ...alternativeVendors];
    
    // Calculate individual factor scores
    const priceConfidence = this.calculatePriceConfidence(selectedVendor, allVendors);
    const vendorConfidence = this.calculateVendorConfidence(selectedVendor);
    const availabilityConfidence = this.calculateAvailabilityConfidence(selectedVendor);
    const qualityConfidence = this.calculateQualityConfidence(selectedVendor);
    const contextConfidence = this.calculateContextConfidence(selectedVendor, context);

    // Get weights from scoring criteria
    const criteria = this.confidenceScoring.scoringCriteria;
    const priceWeight = criteria.find(c => c.criteriaId === 'price_competitiveness')?.weight || 0.35;
    const vendorWeight = criteria.find(c => c.criteriaId === 'vendor_reliability')?.weight || 0.25;
    const qualityWeight = criteria.find(c => c.criteriaId === 'quality_rating')?.weight || 0.20;
    const availabilityWeight = criteria.find(c => c.criteriaId === 'availability_status')?.weight || 0.15;
    const strategicWeight = criteria.find(c => c.criteriaId === 'strategic_preference')?.weight || 0.05;

    // Calculate weighted overall confidence
    const overall = (
      priceConfidence * priceWeight +
      vendorConfidence * vendorWeight +
      qualityConfidence * qualityWeight +
      availabilityConfidence * availabilityWeight +
      contextConfidence * strategicWeight
    );

    return {
      overall: Math.max(0.1, Math.min(1.0, overall)),
      breakdown: {
        price: priceConfidence,
        vendor: vendorConfidence,
        availability: availabilityConfidence,
        quality: qualityConfidence,
        context: contextConfidence
      },
      factors: this.getConfidenceFactorDetails(selectedVendor, allVendors, context),
      category: this.getConfidenceCategory(overall)
    };
  }

  /**
   * Calculate price-related confidence
   */
  private calculatePriceConfidence(selectedVendor: VendorPriceOption, allVendors: VendorPriceOption[]): number {
    const prices = allVendors.map(v => v.normalizedPrice);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const selectedPrice = selectedVendor.normalizedPrice;
    
    const priceDifference = (selectedPrice - avgPrice) / avgPrice;
    
    // Apply confidence factors based on price competitiveness
    let confidence = 0.5; // Base confidence
    
    if (priceDifference <= -0.15) {
      confidence += Math.abs(this.confidenceFactors.priceFactors.above15Percent);
    } else if (priceDifference <= -0.10) {
      confidence += this.confidenceFactors.priceFactors.within15Percent;
    } else if (priceDifference <= -0.05) {
      confidence += this.confidenceFactors.priceFactors.within10Percent;
    } else if (Math.abs(priceDifference) <= 0.05) {
      confidence += this.confidenceFactors.priceFactors.within5Percent;
    } else {
      confidence += this.confidenceFactors.priceFactors.above15Percent;
    }
    
    // Bonus for being the lowest price
    if (selectedPrice === Math.min(...prices)) {
      confidence += this.confidenceFactors.priceFactors.bestPrice;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate vendor-related confidence
   */
  private calculateVendorConfidence(selectedVendor: VendorPriceOption): number {
    let confidence = 0.5; // Base confidence
    
    // Preferred vendor bonus
    if (selectedVendor.isPreferred) {
      confidence += this.confidenceFactors.vendorFactors.preferredVendor;
    }
    
    // Rating-based confidence
    if (selectedVendor.rating >= 4.5) {
      confidence += this.confidenceFactors.vendorFactors.highRating;
    } else if (selectedVendor.rating < 3.0) {
      confidence += this.confidenceFactors.vendorFactors.problematicHistory;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate availability-related confidence
   */
  private calculateAvailabilityConfidence(selectedVendor: VendorPriceOption): number {
    let confidence = 0.5; // Base confidence
    
    switch (selectedVendor.availability) {
      case 'available':
        if (selectedVendor.leadTime <= 2) {
          confidence += this.confidenceFactors.availabilityFactors.immediateAvailable;
        } else if (selectedVendor.leadTime <= 5) {
          confidence += this.confidenceFactors.availabilityFactors.shortLeadTime;
        } else {
          confidence += this.confidenceFactors.availabilityFactors.standardLeadTime;
        }
        break;
      case 'limited':
        confidence += this.confidenceFactors.availabilityFactors.longLeadTime;
        break;
      case 'unavailable':
        confidence += this.confidenceFactors.availabilityFactors.outOfStock;
        break;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate quality-related confidence
   */
  private calculateQualityConfidence(selectedVendor: VendorPriceOption): number {
    let confidence = 0.5; // Base confidence
    
    if (selectedVendor.rating >= 4.5) {
      confidence += this.confidenceFactors.qualityFactors.excellentQuality;
    } else if (selectedVendor.rating >= 4.0) {
      confidence += this.confidenceFactors.qualityFactors.goodQuality;
    } else if (selectedVendor.rating >= 3.5) {
      confidence += this.confidenceFactors.qualityFactors.averageQuality;
    } else if (selectedVendor.rating >= 3.0) {
      confidence += this.confidenceFactors.qualityFactors.belowAverageQuality;
    } else {
      confidence += this.confidenceFactors.qualityFactors.poorQuality;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate context-related confidence
   */
  private calculateContextConfidence(selectedVendor: VendorPriceOption, context: PriceAssignmentContext): number {
    let confidence = 0.5; // Base confidence
    
    // Strategic considerations
    if (selectedVendor.isPreferred) {
      confidence += this.confidenceFactors.vendorFactors.strategicPartner;
    }
    
    // Quantity matching
    if (context.quantity >= selectedVendor.minQuantity) {
      confidence += 0.1; // Bonus for meeting minimum quantity
    } else {
      confidence -= 0.05; // Penalty for not meeting minimum
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Generate primary reasoning text
   */
  private generatePrimaryReason(
    selectedVendor: VendorPriceOption,
    alternativeVendors: VendorPriceOption[],
    context: PriceAssignmentContext
  ): string {
    const allVendors = [selectedVendor, ...alternativeVendors];
    
    // Determine primary selection factors
    const isLowestPrice = allVendors.every(v => v.normalizedPrice >= selectedVendor.normalizedPrice);
    const isOnlyAvailable = allVendors.filter(v => v.availability === 'available').length === 1;
    const isPreferred = selectedVendor.isPreferred;
    const hasHighRating = selectedVendor.rating >= 4.5;
    const hasShortLeadTime = selectedVendor.leadTime <= 3;

    // Find matching reasoning scenario
    let scenario = this.reasoningScenarios.find(s => {
      switch (s.reasoningId) {
        case 'only_available':
          return isOnlyAvailable;
        case 'best_price_preferred':
          return isLowestPrice && isPreferred;
        case 'quality_over_price':
          return hasHighRating && !isLowestPrice;
        case 'strategic_relationship':
          return isPreferred && !isLowestPrice;
        default:
          return false;
      }
    });

    // Default scenario if no specific match
    if (!scenario) {
      scenario = {
        template: "Selected {vendorName} based on optimal combination of price ({price} {currency}), quality (rating: {rating}/5), and availability",
        reasoningId: 'balanced_selection',
        scenario: 'balanced_selection',
        confidenceImpact: 0.0,
        applicableWhen: ['default']
      };
    }

    // Replace template variables
    return scenario.template
      .replace('{vendorName}', selectedVendor.vendorName)
      .replace('{price}', selectedVendor.price.toFixed(2))
      .replace('{currency}', selectedVendor.currency)
      .replace('{rating}', selectedVendor.rating.toString())
      .replace('{leadTime}', selectedVendor.leadTime.toString());
  }

  /**
   * Generate detailed reasoning factors
   */
  private generateReasoningFactors(
    selectedVendor: VendorPriceOption,
    alternativeVendors: VendorPriceOption[],
    context: PriceAssignmentContext
  ): ReasoningFactor[] {
    const factors: ReasoningFactor[] = [];
    const allVendors = [selectedVendor, ...alternativeVendors];

    // Price factor
    const avgPrice = allVendors.reduce((sum, v) => sum + v.normalizedPrice, 0) / allVendors.length;
    const priceDiff = ((selectedVendor.normalizedPrice - avgPrice) / avgPrice) * 100;
    
    factors.push({
      category: 'price',
      description: `Price competitiveness: ${selectedVendor.price} ${selectedVendor.currency}`,
      impact: priceDiff <= 0 ? 'positive' : 'negative',
      weight: 0.35,
      details: `${priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(1)}% vs average market price`
    });

    // Quality factor
    factors.push({
      category: 'quality',
      description: `Vendor quality rating: ${selectedVendor.rating}/5`,
      impact: selectedVendor.rating >= 4.0 ? 'positive' : selectedVendor.rating >= 3.5 ? 'neutral' : 'negative',
      weight: 0.20,
      details: `Based on historical performance and customer feedback`
    });

    // Availability factor
    factors.push({
      category: 'availability',
      description: `Availability: ${selectedVendor.availability} (${selectedVendor.leadTime} days lead time)`,
      impact: selectedVendor.availability === 'available' && selectedVendor.leadTime <= 5 ? 'positive' : 
              selectedVendor.availability === 'limited' ? 'neutral' : 'negative',
      weight: 0.15,
      details: `Current stock status and delivery timeline`
    });

    // Vendor relationship factor
    if (selectedVendor.isPreferred) {
      factors.push({
        category: 'relationship',
        description: 'Preferred vendor status',
        impact: 'positive',
        weight: 0.15,
        details: 'Strategic partnership with established relationship'
      });
    }

    // Quantity matching factor
    if (context.quantity < selectedVendor.minQuantity) {
      factors.push({
        category: 'quantity',
        description: `Minimum quantity requirement: ${selectedVendor.minQuantity} (requested: ${context.quantity})`,
        impact: 'negative',
        weight: 0.10,
        details: 'Order quantity below vendor minimum requirement'
      });
    }

    return factors;
  }

  /**
   * Generate risk assessment
   */
  private generateRiskAssessment(selectedVendor: VendorPriceOption, context: PriceAssignmentContext): any {
    const risks = [];
    const mitigations = [];

    // Price risk
    if (selectedVendor.normalizedPrice > 50) { // Mock threshold
      risks.push({
        type: 'price',
        level: 'medium',
        description: 'Higher than average market price',
        probability: 0.3
      });
      mitigations.push('Monitor market prices for future opportunities');
    }

    // Availability risk
    if (selectedVendor.availability === 'limited') {
      risks.push({
        type: 'availability',
        level: 'medium',
        description: 'Limited stock availability',
        probability: 0.4
      });
      mitigations.push('Consider placing order soon to secure inventory');
    }

    // Lead time risk
    if (selectedVendor.leadTime > 7) {
      risks.push({
        type: 'delivery',
        level: 'low',
        description: 'Extended lead time may impact project timeline',
        probability: 0.2
      });
      mitigations.push('Plan for extended delivery timeline');
    }

    // Vendor performance risk
    if (selectedVendor.rating < 4.0) {
      risks.push({
        type: 'performance',
        level: selectedVendor.rating < 3.0 ? 'high' : 'medium',
        description: 'Below average vendor performance rating',
        probability: selectedVendor.rating < 3.0 ? 0.6 : 0.3
      });
      mitigations.push('Monitor delivery and quality closely');
    }

    return {
      overallRiskLevel: this.calculateOverallRisk(risks),
      identifiedRisks: risks,
      recommendedMitigations: mitigations,
      riskScore: risks.reduce((sum, risk) => sum + risk.probability, 0) / Math.max(risks.length, 1)
    };
  }

  /**
   * Generate alternative analysis
   */
  private generateAlternativeAnalysis(alternativeVendors: VendorPriceOption[], selectedVendor: VendorPriceOption): any {
    return alternativeVendors.slice(0, 3).map(vendor => ({
      vendorId: vendor.vendorId,
      vendorName: vendor.vendorName,
      price: vendor.price,
      currency: vendor.currency,
      rating: vendor.rating,
      availability: vendor.availability,
      leadTime: vendor.leadTime,
      comparisonWithSelected: {
        priceDifference: vendor.normalizedPrice - selectedVendor.normalizedPrice,
        ratingDifference: vendor.rating - selectedVendor.rating,
        leadTimeDifference: vendor.leadTime - selectedVendor.leadTime,
        availabilityComparison: this.compareAvailability(vendor.availability, selectedVendor.availability)
      },
      notSelectedReason: this.generateNotSelectedReason(vendor, selectedVendor)
    }));
  }

  /**
   * Get confidence factor details
   */
  private getConfidenceFactorDetails(
    selectedVendor: VendorPriceOption,
    allVendors: VendorPriceOption[],
    context: PriceAssignmentContext
  ): any {
    return {
      priceFactors: {
        isLowestPrice: allVendors.every(v => v.normalizedPrice >= selectedVendor.normalizedPrice),
        priceCompetitiveness: this.calculatePriceCompetitiveness(selectedVendor, allVendors),
        marketPosition: this.getMarketPosition(selectedVendor, allVendors)
      },
      vendorFactors: {
        isPreferred: selectedVendor.isPreferred,
        rating: selectedVendor.rating,
        reliabilityScore: this.calculateReliabilityScore(selectedVendor)
      },
      availabilityFactors: {
        stockStatus: selectedVendor.availability,
        leadTime: selectedVendor.leadTime,
        deliveryReliability: this.calculateDeliveryReliability(selectedVendor)
      }
    };
  }

  /**
   * Get confidence category based on score
   */
  private getConfidenceCategory(score: number): string {
    const scenarios = this.confidenceScoring.scoringScenarios;
    
    for (const scenario of scenarios) {
      if (score >= scenario.confidenceRange[0] && score <= scenario.confidenceRange[1]) {
        return scenario.name;
      }
    }
    
    return 'Unknown';
  }

  /**
   * Get recommendation strength
   */
  private getRecommendationStrength(confidenceScore: number): 'strong' | 'moderate' | 'weak' {
    if (confidenceScore >= 0.8) return 'strong';
    if (confidenceScore >= 0.6) return 'moderate';
    return 'weak';
  }

  /**
   * Helper methods
   */
  private calculateOverallRisk(risks: any[]): 'low' | 'medium' | 'high' {
    if (risks.some(r => r.level === 'high')) return 'high';
    if (risks.some(r => r.level === 'medium')) return 'medium';
    return 'low';
  }

  private compareAvailability(availability1: string, availability2: string): string {
    const availabilityOrder: { [key: string]: number } = { 'available': 3, 'limited': 2, 'unavailable': 1 };
    const score1 = availabilityOrder[availability1] || 0;
    const score2 = availabilityOrder[availability2] || 0;
    
    if (score1 > score2) return 'better';
    if (score1 < score2) return 'worse';
    return 'same';
  }

  private generateNotSelectedReason(alternative: VendorPriceOption, selected: VendorPriceOption): string {
    const reasons = [];
    
    if (alternative.normalizedPrice > selected.normalizedPrice) {
      const diff = ((alternative.normalizedPrice - selected.normalizedPrice) / selected.normalizedPrice * 100).toFixed(1);
      reasons.push(`${diff}% higher price`);
    }
    
    if (alternative.rating < selected.rating) {
      reasons.push('lower quality rating');
    }
    
    if (alternative.leadTime > selected.leadTime) {
      reasons.push('longer lead time');
    }
    
    if (!alternative.isPreferred && selected.isPreferred) {
      reasons.push('not a preferred vendor');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'lower overall score';
  }

  private calculatePriceCompetitiveness(vendor: VendorPriceOption, allVendors: VendorPriceOption[]): number {
    const prices = allVendors.map(v => v.normalizedPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    
    if (range === 0) return 1;
    return (maxPrice - vendor.normalizedPrice) / range;
  }

  private getMarketPosition(vendor: VendorPriceOption, allVendors: VendorPriceOption[]): string {
    const prices = allVendors.map(v => v.normalizedPrice).sort((a, b) => a - b);
    const position = prices.indexOf(vendor.normalizedPrice) + 1;
    const total = prices.length;
    
    if (position === 1) return 'lowest';
    if (position <= total * 0.33) return 'low';
    if (position <= total * 0.67) return 'medium';
    return 'high';
  }

  private calculateReliabilityScore(vendor: VendorPriceOption): number {
    // Mock calculation based on rating and preferred status
    return (vendor.rating / 5) * 0.8 + (vendor.isPreferred ? 0.2 : 0);
  }

  private calculateDeliveryReliability(vendor: VendorPriceOption): number {
    // Mock calculation based on lead time and availability
    let score = 0.5;
    
    if (vendor.availability === 'available') {
      score += 0.3;
      if (vendor.leadTime <= 3) score += 0.2;
      else if (vendor.leadTime <= 7) score += 0.1;
    } else if (vendor.availability === 'limited') {
      score += 0.1;
    }
    
    return Math.min(1, score);
  }
}

export const assignmentReasoningService = new AssignmentReasoningService();