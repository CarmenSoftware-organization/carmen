import { 
  PriceAssignmentContext, 
  PriceAssignmentResult, 
  VendorPriceOption,
  AssignmentFailure,
  FallbackResult
} from '@/lib/types/price-management';

import { priceAssignmentService } from './price-assignment-service';
import { vendorSelectionAlgorithm } from './vendor-selection-algorithm';
import { assignmentReasoningService } from './assignment-reasoning-service';
import { alternativeOptionsService } from './alternative-options-service';
import { assignmentAuditService } from './assignment-audit-service';
import { assignmentFallbackService } from './assignment-fallback-service';

/**
 * Main Price Assignment Engine that orchestrates all assignment services
 */
export class PriceAssignmentEngine {
  /**
   * Execute complete price assignment process with comprehensive error handling
   */
  async executeAssignment(context: PriceAssignmentContext): Promise<PriceAssignmentResult | FallbackResult> {
    try {
      // Log assignment attempt
      await assignmentAuditService.logAssignmentEvent({
        type: 'assignment',
        prItemId: context.prItemId,
        userId: 'system',
        userRole: 'system',
        action: 'start_assignment',
        details: {
          productId: context.productId,
          categoryId: context.categoryId,
          quantity: context.quantity,
          location: context.location
        },
        afterState: {
          status: 'in_progress'
        }
      });

      // Step 1: Validate context and available vendors
      const validationResult = await this.validateAssignmentContext(context);
      if (!validationResult.isValid) {
        return await this.handleAssignmentFailure({
          type: 'system_error',
          reason: validationResult.reason || 'Invalid assignment context',
          context,
          timestamp: new Date()
        }, context);
      }

      // Step 2: Execute primary assignment logic
      try {
        const assignmentResult = await priceAssignmentService.assignOptimalPrice(context);
        
        // Step 3: Generate comprehensive reasoning and alternatives
        const reasoning = await assignmentReasoningService.generateAssignmentReasoning(
          {
            vendorId: assignmentResult.selectedVendor.id,
            vendorName: assignmentResult.selectedVendor.name,
            price: assignmentResult.assignedPrice,
            currency: assignmentResult.currency,
            normalizedPrice: assignmentResult.normalizedPrice,
            minQuantity: 1, // Default value
            availability: 'available', // Default value
            leadTime: 3, // Default value
            rating: assignmentResult.selectedVendor.rating,
            isPreferred: assignmentResult.selectedVendor.isPreferred
          },
          assignmentResult.alternatives.map(alt => ({
            vendorId: alt.vendorId,
            vendorName: alt.vendorName,
            price: alt.price,
            currency: alt.currency,
            normalizedPrice: alt.normalizedPrice,
            minQuantity: alt.minQuantity,
            availability: alt.availability as "available" | "limited" | "unavailable",
            leadTime: alt.leadTime,
            rating: alt.rating,
            isPreferred: alt.isPreferred
          })),
          context
        );

        // Step 4: Generate alternative options analysis
        const alternativeOptions = await alternativeOptionsService.generateAlternativeOptions(
          {
            vendorId: assignmentResult.selectedVendor.id,
            vendorName: assignmentResult.selectedVendor.name,
            price: assignmentResult.assignedPrice,
            currency: assignmentResult.currency,
            normalizedPrice: assignmentResult.normalizedPrice,
            minQuantity: 1,
            availability: 'available',
            leadTime: 3,
            rating: assignmentResult.selectedVendor.rating,
            isPreferred: assignmentResult.selectedVendor.isPreferred
          },
          context.availableVendors,
          context
        );

        // Step 5: Log successful assignment
        await assignmentAuditService.logAssignmentEvent({
          type: 'assignment',
          prItemId: context.prItemId,
          userId: 'system',
          userRole: 'system',
          action: 'complete_assignment',
          details: {
            vendorId: assignmentResult.selectedVendor.id,
            price: assignmentResult.assignedPrice,
            currency: assignmentResult.currency,
            reason: assignmentResult.assignmentReason,
            confidenceScore: assignmentResult.confidence
          },
          afterState: {
            status: 'completed',
            vendorId: assignmentResult.selectedVendor.id,
            price: assignmentResult.assignedPrice,
            currency: assignmentResult.currency
          }
        });

        // Enhance result with additional analysis
        const enhancedResult: PriceAssignmentResult = {
          ...assignmentResult,
          // Add reasoning and alternative analysis to the result
          ...(reasoning && { reasoning }),
          ...(alternativeOptions && { alternativeOptions })
        };

        return enhancedResult;

      } catch (assignmentError) {
        console.error('Primary assignment failed:', assignmentError);
        
        // Handle assignment failure with fallback strategies
        return await this.handleAssignmentFailure({
          type: this.categorizeAssignmentError(assignmentError),
          reason: (assignmentError as Error).message,
          context,
          timestamp: new Date(),
          details: { error: assignmentError }
        }, context);
      }

    } catch (error) {
      console.error('Assignment engine error:', error);
      
      // Log critical error
      await assignmentAuditService.logAssignmentEvent({
        type: 'assignment',
        prItemId: context.prItemId,
        userId: 'system',
        userRole: 'system',
        action: 'assignment_error',
        details: {
          error: (error as Error).message,
          stack: (error as Error).stack
        },
        afterState: {
          status: 'error'
        }
      });

      // Return fallback result for critical errors
      return {
        success: false,
        strategy: 'error_handling',
        action: 'critical_error',
        message: `Critical assignment error: ${(error as Error).message}`,
        assignedVendor: null,
        requiresManualIntervention: true,
        nextSteps: [
          'Review system logs',
          'Check data integrity',
          'Manual assignment required'
        ],
        estimatedResolutionTime: '2-4 hours',
        fallbackScenario: {
          id: 'critical-error',
          name: 'Critical Error Handling',
          description: 'Handle critical system errors',
          priority: 10,
          strategy: {
            type: 'manual_review',
            parameters: {}
          },
          triggerConditions: {
            failureTypes: ['system_error']
          },
          expectedResolutionTime: '2-4 hours',
          successRate: 0.95
        }
      };
    }
  }

  /**
   * Get assignment recommendations for a given context
   */
  async getAssignmentRecommendations(context: PriceAssignmentContext): Promise<any> {
    try {
      // Get vendor selection analysis
      const selectionResult = await vendorSelectionAlgorithm.selectOptimalVendor(
        context,
        context.availableVendors
      );

      // Get alternative options
      const alternatives = await alternativeOptionsService.generateAlternativeOptions(
        selectionResult.selectedVendor,
        context.availableVendors,
        context
      );

      // Get assignment statistics
      const statistics = await vendorSelectionAlgorithm.getSelectionStatistics(
        context,
        context.availableVendors
      );

      return {
        recommendedVendor: selectionResult.selectedVendor,
        selectionReason: selectionResult.selectionReason,
        confidence: selectionResult.selectionScore,
        alternatives: alternatives.slice(0, 3),
        statistics,
        riskFactors: this.identifyRiskFactors(context, selectionResult.selectedVendor),
        opportunities: this.identifyOpportunities(context, alternatives)
      };

    } catch (error) {
      console.error('Failed to get assignment recommendations:', error);
      throw new Error(`Recommendation generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Validate assignment integrity for a PR item
   */
  async validateAssignment(prItemId: string): Promise<any> {
    try {
      // Get assignment history
      const history = await assignmentAuditService.getAssignmentHistory(prItemId);
      
      // Validate integrity
      const integrityResult = await assignmentAuditService.validateAssignmentIntegrity(prItemId);
      
      // Get current assignment status
      const currentAssignment = history.find(h => h.eventType === 'initial_assignment') || 
                               history.find(h => h.eventType === 'manual_override');

      return {
        prItemId,
        currentAssignment,
        history,
        integrity: integrityResult,
        recommendations: this.generateValidationRecommendations(integrityResult, history)
      };

    } catch (error) {
      console.error('Assignment validation failed:', error);
      throw new Error(`Assignment validation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get assignment performance metrics
   */
  async getAssignmentMetrics(startDate: Date, endDate: Date): Promise<any> {
    try {
      const metrics = await assignmentAuditService.getAssignmentMetrics(startDate, endDate);
      
      return {
        ...metrics,
        period: {
          start: startDate,
          end: endDate,
          days: Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
        },
        efficiency: {
          automationRate: metrics.automaticAssignments / Math.max(metrics.totalAssignments, 1) * 100,
          successRate: (metrics.totalAssignments - metrics.overrideRate) / Math.max(metrics.totalAssignments, 1) * 100,
          averageResolutionTime: this.calculateAverageResolutionTime(metrics)
        },
        trends: {
          assignmentTrend: metrics.assignmentTrends?.trend || 'stable',
          qualityTrend: this.calculateQualityTrend(metrics),
          efficiencyTrend: this.calculateEfficiencyTrend(metrics)
        }
      };

    } catch (error) {
      console.error('Failed to get assignment metrics:', error);
      throw new Error(`Metrics calculation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Private helper methods
   */
  private async validateAssignmentContext(context: PriceAssignmentContext): Promise<{ isValid: boolean; reason?: string }> {
    // Validate required fields
    if (!context.prItemId) {
      return { isValid: false, reason: 'Missing PR Item ID' };
    }

    if (!context.productId) {
      return { isValid: false, reason: 'Missing Product ID' };
    }

    if (!context.categoryId) {
      return { isValid: false, reason: 'Missing Category ID' };
    }

    if (context.quantity <= 0) {
      return { isValid: false, reason: 'Invalid quantity' };
    }

    if (!context.availableVendors || context.availableVendors.length === 0) {
      return { isValid: false, reason: 'No vendors available' };
    }

    // Validate vendor data
    for (const vendor of context.availableVendors) {
      if (!vendor.vendorId || !vendor.vendorName) {
        return { isValid: false, reason: 'Invalid vendor data' };
      }
      
      if (vendor.price <= 0) {
        return { isValid: false, reason: 'Invalid vendor pricing' };
      }
    }

    return { isValid: true };
  }

  private async handleAssignmentFailure(
    failure: AssignmentFailure,
    context: PriceAssignmentContext
  ): Promise<FallbackResult> {
    try {
      // Log the failure
      await assignmentAuditService.logAssignmentEvent({
        type: 'assignment',
        prItemId: context.prItemId,
        userId: 'system',
        userRole: 'system',
        action: 'assignment_failed',
        details: {
          failureType: failure.type,
          failureReason: failure.reason,
          availableVendors: context.availableVendors.length
        },
        afterState: {
          status: 'failed'
        }
      });

      // Execute fallback strategy
      const fallbackResult = await assignmentFallbackService.handleAssignmentFailure(
        failure,
        context,
        context.availableVendors
      );

      return fallbackResult;

    } catch (fallbackError) {
      console.error('Fallback handling failed:', fallbackError);
      
      // Return manual intervention result as last resort
      return {
        success: false,
        strategy: 'manual_intervention',
        action: 'fallback_failed',
        message: 'Assignment and fallback failed - manual intervention required',
        assignedVendor: null,
        requiresManualIntervention: true,
        nextSteps: [
          'Review failure details',
          'Manual vendor selection',
          'System health check'
        ],
        estimatedResolutionTime: '4-8 hours',
        fallbackScenario: {
          id: 'last-resort',
          name: 'Last Resort Manual Intervention',
          description: 'Final fallback when all automated options fail',
          priority: 0,
          strategy: {
            type: 'manual_review',
            parameters: {}
          },
          triggerConditions: {
            failureTypes: ['system_error']
          },
          expectedResolutionTime: '4-8 hours',
          successRate: 1.0
        }
      };
    }
  }

  private categorizeAssignmentError(error: any): AssignmentFailure['type'] {
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('no vendor') || errorMessage.includes('vendor options')) {
      return 'no_vendors_available';
    }
    
    if (errorMessage.includes('budget') || errorMessage.includes('price')) {
      return 'budget_exceeded';
    }
    
    if (errorMessage.includes('rule') || errorMessage.includes('conflict')) {
      return 'business_rules_conflict';
    }
    
    if (errorMessage.includes('unavailable') || errorMessage.includes('stock')) {
      return 'vendor_unavailable';
    }
    
    return 'system_error';
  }

  private identifyRiskFactors(context: PriceAssignmentContext, selectedVendor: VendorPriceOption): any[] {
    const risks = [];
    
    if (selectedVendor.rating < 4.0) {
      risks.push({
        type: 'quality',
        level: 'medium',
        description: 'Vendor rating below 4.0 may indicate quality concerns'
      });
    }
    
    if (selectedVendor.availability === 'limited') {
      risks.push({
        type: 'availability',
        level: 'medium',
        description: 'Limited stock availability may cause delays'
      });
    }
    
    if (selectedVendor.leadTime > 7) {
      risks.push({
        type: 'delivery',
        level: 'low',
        description: 'Extended lead time may impact project timeline'
      });
    }
    
    if (context.quantity < selectedVendor.minQuantity) {
      risks.push({
        type: 'quantity',
        level: 'medium',
        description: 'Order quantity below vendor minimum requirement'
      });
    }
    
    return risks;
  }

  private identifyOpportunities(context: PriceAssignmentContext, alternatives: any[]): any[] {
    const opportunities = [];
    
    // Look for cost savings opportunities
    const costSavingAlternatives = alternatives.filter(alt => 
      alt.comparison?.priceComparison?.savings > 0
    );
    
    if (costSavingAlternatives.length > 0) {
      const maxSavings = Math.max(...costSavingAlternatives.map(alt => 
        alt.comparison.priceComparison.totalOrderSavings
      ));
      
      opportunities.push({
        type: 'cost_savings',
        value: maxSavings,
        description: `Potential savings of up to ${maxSavings.toFixed(2)} USD with alternative vendors`
      });
    }
    
    // Look for quality improvement opportunities
    const qualityAlternatives = alternatives.filter(alt => 
      alt.comparison?.qualityComparison?.ratingDifference > 0.3
    );
    
    if (qualityAlternatives.length > 0) {
      opportunities.push({
        type: 'quality_improvement',
        description: 'Higher quality vendors available with better ratings'
      });
    }
    
    // Look for delivery improvement opportunities
    const deliveryAlternatives = alternatives.filter(alt => 
      alt.comparison?.deliveryComparison?.leadTimeDifference < -2
    );
    
    if (deliveryAlternatives.length > 0) {
      opportunities.push({
        type: 'faster_delivery',
        description: 'Faster delivery options available with shorter lead times'
      });
    }
    
    return opportunities;
  }

  private generateValidationRecommendations(integrityResult: any, history: any[]): string[] {
    const recommendations = [];
    
    if (!integrityResult.isValid) {
      recommendations.push('Address data integrity issues before proceeding');
    }
    
    if (integrityResult.warnings?.length > 0) {
      recommendations.push('Review and resolve warning conditions');
    }
    
    if (history.length > 5) {
      recommendations.push('High number of assignment changes - review business rules');
    }
    
    const recentOverrides = history.filter(h => 
      h.eventType === 'manual_override' && 
      new Date().getTime() - h.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    );
    
    if (recentOverrides.length > 2) {
      recommendations.push('Frequent recent overrides - consider rule optimization');
    }
    
    return recommendations.length > 0 ? recommendations : ['Assignment appears healthy'];
  }

  private calculateAverageResolutionTime(metrics: any): string {
    // Mock calculation - in real implementation would analyze actual resolution times
    const baseTime = 30; // minutes
    const complexityFactor = metrics.overrideRate > 20 ? 1.5 : 1.0;
    const avgTime = baseTime * complexityFactor;
    
    return `${avgTime.toFixed(0)} minutes`;
  }

  private calculateQualityTrend(metrics: any): 'improving' | 'stable' | 'declining' {
    // Mock calculation based on confidence scores and override rates
    if (metrics.averageConfidenceScore > 0.8 && metrics.overrideRate < 15) {
      return 'improving';
    } else if (metrics.averageConfidenceScore < 0.6 || metrics.overrideRate > 25) {
      return 'declining';
    }
    return 'stable';
  }

  private calculateEfficiencyTrend(metrics: any): 'improving' | 'stable' | 'declining' {
    // Mock calculation based on automation rate and assignment trends
    const automationRate = metrics.automaticAssignments / Math.max(metrics.totalAssignments, 1) * 100;
    
    if (automationRate > 80 && metrics.assignmentTrends?.trend === 'increasing') {
      return 'improving';
    } else if (automationRate < 60 || metrics.assignmentTrends?.trend === 'decreasing') {
      return 'declining';
    }
    return 'stable';
  }
}

export const priceAssignmentEngine = new PriceAssignmentEngine();