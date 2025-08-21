import { 
  EnhancedPRItem, 
  PRPriceAssignmentContext, 
  PRPriceAssignmentResult,
  PriceHistoryEntry,
  VendorComparison,
  PriceAlert,
  PriceOverrideEntry
} from '../types/enhanced-pr-types';
import { PriceAssignmentResult } from '../types/price-management';

// Mock data imports
import prAssignmentsData from '../mock/price-management/pr-price-assignments.json';
import priceHistoryData from '../mock/price-management/price-history.json';
import priceAlertsData from '../mock/price-management/price-alerts.json';

export class PRPriceAssignmentService {
  /**
   * Assign prices for all items in a Purchase Request
   */
  async assignPricesForPR(prId: string): Promise<PRPriceAssignmentResult> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get PR items that need price assignment
      const prItems = prAssignmentsData.prItemAssignments.filter(
        item => item.prNumber === prId || item.prItemId.includes(prId.split('-').pop() || '')
      );

      let assignedItems = 0;
      let failedItems = 0;
      let manualReviewItems = 0;
      let totalSavings = 0;
      let totalConfidence = 0;
      const alerts: PriceAlert[] = [];

      for (const item of prItems) {
        if (item.priceAssignment) {
          assignedItems++;
          totalConfidence += item.priceAssignment.confidence;
          
          // Calculate potential savings
          const alternatives = item.priceAssignment.alternatives;
          if (alternatives.length > 0) {
            const lowestPrice = Math.min(...alternatives.map(alt => alt.normalizedPrice));
            const currentPrice = item.priceAssignment.normalizedPrice;
            if (lowestPrice < currentPrice) {
              totalSavings += (currentPrice - lowestPrice) * item.quantity;
            }
          }
        } else {
          if (Math.random() > 0.8) {
            failedItems++;
          } else {
            manualReviewItems++;
          }
        }
      }

      // Get relevant alerts
      const relevantAlerts = priceAlertsData.priceAlerts.filter(alert => 
        alert.affectedPRs.includes(prId)
      ).map(alert => ({
        id: alert.id,
        type: alert.type as any,
        severity: alert.severity as any,
        message: alert.message,
        impact: alert.impact,
        recommendedAction: alert.recommendedAction,
        effectiveDate: new Date(alert.effectiveDate),
        detectedDate: new Date(alert.detectedDate),
        isAcknowledged: alert.isAcknowledged,
        acknowledgedBy: alert.acknowledgedBy || undefined,
        acknowledgedDate: alert.acknowledgedDate ? new Date(alert.acknowledgedDate) : undefined
      }));

      const averageConfidence = assignedItems > 0 ? totalConfidence / assignedItems : 0;

      return {
        prId,
        totalItems: prItems.length,
        assignedItems,
        failedItems,
        manualReviewItems,
        totalSavings,
        averageConfidence,
        assignmentSummary: {
          autoAssigned: assignedItems,
          manualOverride: 0,
          requiresReview: manualReviewItems
        },
        alerts: relevantAlerts,
        recommendations: this.generateRecommendations(assignedItems, failedItems, manualReviewItems, totalSavings)
      };
    } catch (error) {
      console.error('Error assigning prices for PR:', error);
      throw new Error('Failed to assign prices for Purchase Request');
    }
  }

  /**
   * Assign price for a specific PR item
   */
  async assignPriceForItem(prItemId: string): Promise<PriceAssignmentResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const itemData = prAssignmentsData.prItemAssignments.find(
        item => item.prItemId === prItemId
      );

      if (!itemData?.priceAssignment) {
        throw new Error('No price assignment data found for item');
      }

      return {
        ...itemData.priceAssignment,
        assignmentDate: new Date(itemData.priceAssignment.assignmentDate)
      };
    } catch (error) {
      console.error('Error assigning price for item:', error);
      throw new Error('Failed to assign price for item');
    }
  }

  /**
   * Override price for a PR item
   */
  async overrideItemPrice(prItemId: string, override: PriceOverrideEntry): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real implementation, this would update the database
      console.log('Price override applied:', { prItemId, override });
      
      // Simulate successful override
      return Promise.resolve();
    } catch (error) {
      console.error('Error overriding item price:', error);
      throw new Error('Failed to override item price');
    }
  }

  /**
   * Get vendor comparison data for a PR item
   */
  async getVendorComparison(prItemId: string): Promise<VendorComparison[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const itemData = prAssignmentsData.prItemAssignments.find(
        item => item.prItemId === prItemId
      );

      if (!itemData?.vendorOptions) {
        return [];
      }

      // Convert vendor options to comparison format
      const comparisons: VendorComparison[] = itemData.vendorOptions.map(vendor => {
        const selectedPrice = itemData.priceAssignment?.assignedPrice || vendor.price;
        const savings = selectedPrice - vendor.normalizedPrice;
        const savingsPercentage = selectedPrice > 0 ? (savings / selectedPrice) * 100 : 0;

        return {
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName,
          price: vendor.price,
          currency: vendor.currency,
          normalizedPrice: vendor.normalizedPrice,
          availability: vendor.availability as "available" | "limited" | "unavailable",
          leadTime: vendor.leadTime,
          rating: vendor.rating,
          isPreferred: vendor.isPreferred,
          minQuantity: vendor.minQuantity,
          totalCost: vendor.normalizedPrice * itemData.quantity,
          savings: Math.max(0, savings),
          savingsPercentage: Math.max(0, savingsPercentage),
          qualityScore: vendor.rating * 20, // Convert 5-star to 100-point scale
          deliveryScore: Math.max(0, 100 - (vendor.leadTime * 10)), // Lower lead time = higher score
          overallScore: this.calculateOverallScore(vendor)
        };
      });

      // Sort by overall score descending
      return comparisons.sort((a, b) => b.overallScore - a.overallScore);
    } catch (error) {
      console.error('Error getting vendor comparison:', error);
      throw new Error('Failed to get vendor comparison data');
    }
  }

  /**
   * Get price history for a product
   */
  async getPriceHistory(productId: string): Promise<PriceHistoryEntry[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const productHistory = priceHistoryData.priceHistory.find(
        item => item.productId === productId
      );

      if (!productHistory) {
        return [];
      }

      return productHistory.history.map(entry => ({
        date: new Date(entry.date),
        price: entry.price,
        currency: entry.currency,
        vendorId: entry.vendorId,
        vendorName: entry.vendorName,
        changePercentage: entry.changePercentage
      }));
    } catch (error) {
      console.error('Error getting price history:', error);
      throw new Error('Failed to get price history');
    }
  }

  /**
   * Get price alerts for a PR item
   */
  async getPriceAlerts(prItemId: string): Promise<PriceAlert[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      // Find the product associated with this PR item
      const itemData = prAssignmentsData.prItemAssignments.find(
        item => item.prItemId === prItemId
      );

      if (!itemData) {
        return [];
      }

      // Get alerts for this product
      const alerts = priceAlertsData.priceAlerts.filter(alert => 
        alert.productId === itemData.productId
      );

      return alerts.map(alert => ({
        id: alert.id,
        type: alert.type as any,
        severity: alert.severity as any,
        message: alert.message,
        impact: alert.impact,
        recommendedAction: alert.recommendedAction,
        effectiveDate: new Date(alert.effectiveDate),
        detectedDate: new Date(alert.detectedDate),
        isAcknowledged: alert.isAcknowledged,
        acknowledgedBy: alert.acknowledgedBy || undefined,
        acknowledgedDate: alert.acknowledgedDate ? new Date(alert.acknowledgedDate) : undefined
      }));
    } catch (error) {
      console.error('Error getting price alerts:', error);
      throw new Error('Failed to get price alerts');
    }
  }

  /**
   * Acknowledge a price alert
   */
  async acknowledgePriceAlert(alertId: string, userId: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // In a real implementation, this would update the database
      console.log('Price alert acknowledged:', { alertId, userId });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error acknowledging price alert:', error);
      throw new Error('Failed to acknowledge price alert');
    }
  }

  /**
   * Convert PR items to enhanced PR items with price assignment data
   */
  async enhancePRItems(prItems: any[], prId: string): Promise<EnhancedPRItem[]> {
    try {
      const enhancedItems: EnhancedPRItem[] = [];

      for (const item of prItems) {
        // Find matching assignment data
        const assignmentData = prAssignmentsData.prItemAssignments.find(
          assignment => assignment.productId === item.id || assignment.prItemId === item.id
        );

        // Get price history
        const priceHistory = await this.getPriceHistory(item.id);
        
        // Get price alerts
        const priceAlerts = await this.getPriceAlerts(item.id);

        // Get vendor comparison data
        const vendorComparisons = assignmentData?.vendorOptions ? 
          await this.getVendorComparison(item.id) : [];

        const enhancedItem: EnhancedPRItem = {
          ...item,
          priceAssignment: assignmentData?.priceAssignment ? {
            ...assignmentData.priceAssignment,
            assignmentDate: new Date(assignmentData.priceAssignment.assignmentDate)
          } : undefined,
          vendorOptions: assignmentData?.vendorOptions,
          priceHistory,
          currencyInfo: assignmentData?.currencyInfo ? {
            ...assignmentData.currencyInfo,
            lastUpdated: new Date(assignmentData.currencyInfo.lastUpdated)
          } : undefined,
          isAutoAssigned: assignmentData?.isAutoAssigned || false,
          isManualOverride: assignmentData?.isManualOverride || false,
          assignmentConfidence: assignmentData?.assignmentConfidence,
          priceAlerts,
          hasActiveAlerts: priceAlerts.some(alert => !alert.isAcknowledged),
          assignmentStatus: this.determineAssignmentStatus(assignmentData),
          assignmentDate: assignmentData?.priceAssignment ? 
            new Date(assignmentData.priceAssignment.assignmentDate) : undefined,
          assignedBy: assignmentData?.priceAssignment ? 'system' : undefined,
          overrideHistory: assignmentData?.overrideHistory || [],
          canOverride: true,
          alternativeVendors: vendorComparisons,
          savingsOpportunity: this.calculateSavingsOpportunity(assignmentData)
        };

        enhancedItems.push(enhancedItem);
      }

      return enhancedItems;
    } catch (error) {
      console.error('Error enhancing PR items:', error);
      throw new Error('Failed to enhance PR items with price data');
    }
  }

  /**
   * Determine assignment status based on assignment data
   */
  private determineAssignmentStatus(assignmentData: any): 'pending' | 'assigned' | 'failed' | 'manual_review' {
    if (!assignmentData) {
      return 'pending';
    }

    if (assignmentData.assignmentStatus) {
      return assignmentData.assignmentStatus;
    }

    if (assignmentData.priceAssignment) {
      return 'assigned';
    }

    if (assignmentData.assignmentFailureReason) {
      return 'failed';
    }

    return 'pending';
  }

  /**
   * Trigger automatic price assignment for a PR
   */
  async triggerPriceAssignment(prId: string, itemIds?: string[]): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would trigger the price assignment engine
      console.log('Price assignment triggered for PR:', prId, 'Items:', itemIds);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error triggering price assignment:', error);
      throw new Error('Failed to trigger price assignment');
    }
  }

  /**
   * Get assignment statistics for a PR
   */
  async getAssignmentStatistics(prId: string): Promise<{
    totalItems: number;
    assignedItems: number;
    pendingItems: number;
    failedItems: number;
    manualReviewItems: number;
    averageConfidence: number;
    totalSavings: number;
  }> {
    try {
      const prItems = prAssignmentsData.prItemAssignments.filter(
        item => item.prNumber === prId || item.prItemId.includes(prId.split('-').pop() || '')
      );

      const totalItems = prItems.length;
      const assignedItems = prItems.filter(item => item.priceAssignment).length;
      const pendingItems = prItems.filter(item => !item.priceAssignment && !item.assignmentFailureReason).length;
      const failedItems = prItems.filter(item => item.assignmentFailureReason).length;
      const manualReviewItems = prItems.filter(item => item.assignmentStatus === 'manual_review').length;

      const confidenceScores = prItems
        .filter(item => item.assignmentConfidence)
        .map(item => item.assignmentConfidence);
      const averageConfidence = confidenceScores.length > 0 ? 
        confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length : 0;

      const totalSavings = prItems.reduce((sum, item) => {
        const savings = this.calculateSavingsOpportunity(item);
        return sum + (savings?.potentialSavings || 0);
      }, 0);

      return {
        totalItems,
        assignedItems,
        pendingItems,
        failedItems,
        manualReviewItems,
        averageConfidence,
        totalSavings
      };
    } catch (error) {
      console.error('Error getting assignment statistics:', error);
      throw new Error('Failed to get assignment statistics');
    }
  }

  private calculateOverallScore(vendor: any): number {
    const priceScore = 100 - ((vendor.normalizedPrice / 100) * 10); // Arbitrary price scoring
    const qualityScore = vendor.rating * 20;
    const deliveryScore = Math.max(0, 100 - (vendor.leadTime * 10));
    const preferenceScore = vendor.isPreferred ? 20 : 0;

    return (priceScore * 0.3 + qualityScore * 0.3 + deliveryScore * 0.2 + preferenceScore * 0.2);
  }

  private calculateSavingsOpportunity(assignmentData: any): any {
    if (!assignmentData?.priceAssignment?.alternatives?.length) {
      return null;
    }

    const currentPrice = assignmentData.priceAssignment.normalizedPrice;
    const alternatives = assignmentData.priceAssignment.alternatives;
    const lowestPrice = Math.min(...alternatives.map((alt: any) => alt.normalizedPrice));
    
    if (lowestPrice >= currentPrice) {
      return null;
    }

    const bestAlternative = alternatives.find((alt: any) => alt.normalizedPrice === lowestPrice);
    const savings = currentPrice - lowestPrice;
    const savingsPercentage = (savings / currentPrice) * 100;

    return {
      potentialSavings: savings,
      savingsPercentage,
      bestAlternativeVendor: {
        vendorId: bestAlternative.vendorId,
        vendorName: bestAlternative.vendorName,
        price: bestAlternative.normalizedPrice,
        savings
      },
      riskAssessment: savingsPercentage > 15 ? 'high' : savingsPercentage > 5 ? 'medium' : 'low',
      recommendation: savingsPercentage > 10 ? 
        'Consider switching vendor for significant savings' : 
        'Current vendor selection is optimal'
    };
  }

  private generateRecommendations(assigned: number, failed: number, review: number, savings: number): string[] {
    const recommendations: string[] = [];

    if (assigned > 0) {
      recommendations.push(`Successfully assigned prices to ${assigned} items`);
    }

    if (savings > 0) {
      recommendations.push(`Potential savings of $${savings.toFixed(2)} identified`);
    }

    if (failed > 0) {
      recommendations.push(`${failed} items failed assignment - check vendor availability`);
    }

    if (review > 0) {
      recommendations.push(`${review} items require manual review`);
    }

    if (assigned === 0 && failed === 0 && review === 0) {
      recommendations.push('No items processed - check PR data');
    }

    return recommendations;
  }
}

// Export singleton instance
export const prPriceAssignmentService = new PRPriceAssignmentService();