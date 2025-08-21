import { ValidationResult, ValidationError } from './price-validation-engine';

export interface QualityMetrics {
  overallScore: number;
  completenessScore: number;
  accuracyScore: number;
  consistencyScore: number;
  timelinessScore: number;
  validityScore: number;
}

export interface QualityReport {
  submissionId: string;
  vendorId: string;
  timestamp: Date;
  metrics: QualityMetrics;
  issues: QualityIssue[];
  recommendations: string[];
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

export interface QualityIssue {
  category: 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'validity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedItems: number;
  recommendation: string;
}

export interface QualityTrend {
  vendorId: string;
  period: string;
  scoreHistory: Array<{
    date: Date;
    score: number;
    submissionCount: number;
  }>;
  improvement: number; // Percentage change
  trend: 'improving' | 'declining' | 'stable';
}

export class DataQualityService {
  
  // Generate comprehensive quality report
  async generateQualityReport(
    submissionId: string,
    vendorId: string,
    validationResult: ValidationResult,
    submissionData: any
  ): Promise<QualityReport> {
    
    const metrics = await this.calculateQualityMetrics(validationResult, submissionData);
    const issues = this.identifyQualityIssues(validationResult, submissionData);
    const recommendations = this.generateRecommendations(metrics, issues);
    const status = this.determineQualityStatus(metrics.overallScore);

    return {
      submissionId,
      vendorId,
      timestamp: new Date(),
      metrics,
      issues,
      recommendations,
      status
    };
  }

  // Calculate detailed quality metrics
  private async calculateQualityMetrics(
    validationResult: ValidationResult,
    submissionData: any
  ): Promise<QualityMetrics> {
    
    const completenessScore = this.calculateCompletenessScore(submissionData);
    const accuracyScore = this.calculateAccuracyScore(validationResult);
    const consistencyScore = this.calculateConsistencyScore(submissionData);
    const timelinessScore = this.calculateTimelinessScore(submissionData);
    const validityScore = this.calculateValidityScore(submissionData);

    // Overall score is weighted average
    const overallScore = Math.round(
      (completenessScore * 0.25) +
      (accuracyScore * 0.25) +
      (consistencyScore * 0.20) +
      (timelinessScore * 0.15) +
      (validityScore * 0.15)
    );

    return {
      overallScore,
      completenessScore,
      accuracyScore,
      consistencyScore,
      timelinessScore,
      validityScore
    };
  }

  // Calculate completeness score (0-100)
  private calculateCompletenessScore(submissionData: any): number {
    if (!submissionData.items || submissionData.items.length === 0) return 0;

    let totalFields = 0;
    let completedFields = 0;

    const requiredFields = ['productId', 'productName', 'unitPrice', 'currency', 'validFrom', 'validTo'];
    const optionalFields = ['minQuantity', 'bulkPrice', 'bulkMinQuantity'];

    submissionData.items.forEach((item: any) => {
      // Check required fields
      requiredFields.forEach(field => {
        totalFields++;
        if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
          completedFields++;
        }
      });

      // Check optional fields (partial credit)
      optionalFields.forEach(field => {
        totalFields += 0.5; // Optional fields worth half
        if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
          completedFields += 0.5;
        }
      });
    });

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }

  // Calculate accuracy score based on validation results
  private calculateAccuracyScore(validationResult: ValidationResult): number {
    if (validationResult.itemsValidated === 0) return 0;

    const errorRate = validationResult.itemsWithErrors / validationResult.itemsValidated;
    const warningRate = validationResult.itemsWithWarnings / validationResult.itemsValidated;

    // Start with perfect score and deduct for issues
    let score = 100;
    score -= (errorRate * 60); // Errors are more severe
    score -= (warningRate * 20); // Warnings are less severe

    return Math.max(0, Math.round(score));
  }

  // Calculate consistency score
  private calculateConsistencyScore(submissionData: any): number {
    if (!submissionData.items || submissionData.items.length < 2) return 100;

    let consistencyIssues = 0;
    const items = submissionData.items;

    // Check currency consistency
    const currencies = [...new Set(items.map((item: any) => item.currency))];
    if (currencies.length > 2) {
      consistencyIssues += 10; // Multiple currencies might be inconsistent
    }

    // Check price range consistency (detect outliers)
    const prices = items.map((item: any) => item.unitPrice).filter((price: number) => price > 0);
    if (prices.length > 0) {
      const mean = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
      const outliers = prices.filter((price: number) => Math.abs(price - mean) > mean * 2);
      consistencyIssues += (outliers.length / prices.length) * 30;
    }

    // Check date consistency
    const dateRanges = items.map((item: any) => {
      if (item.validFrom && item.validTo) {
        return new Date(item.validTo).getTime() - new Date(item.validFrom).getTime();
      }
      return null;
    }).filter((range: number | null) => range !== null);

    if (dateRanges.length > 1) {
      const avgRange = dateRanges.reduce((sum: number, range: number) => sum + range, 0) / dateRanges.length;
      const inconsistentRanges = dateRanges.filter((range: number) => Math.abs(range - avgRange) > avgRange * 0.5);
      consistencyIssues += (inconsistentRanges.length / dateRanges.length) * 20;
    }

    return Math.max(0, Math.round(100 - consistencyIssues));
  }

  // Calculate timeliness score
  private calculateTimelinessScore(submissionData: any): number {
    const submissionDate = new Date();
    let score = 100;

    // Check if prices are submitted close to effective date
    if (submissionData.effectiveDate) {
      const effectiveDate = new Date(submissionData.effectiveDate);
      const daysDifference = Math.abs((effectiveDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference > 30) {
        score -= 20; // Submitted too far in advance or too late
      } else if (daysDifference > 7) {
        score -= 10; // Reasonable timing but not optimal
      }
    }

    // Check if this is a regular submission (would need historical data)
    // For now, assume regular submissions are better
    
    return Math.max(0, score);
  }

  // Calculate validity score
  private calculateValidityScore(submissionData: any): number {
    if (!submissionData.items || submissionData.items.length === 0) return 0;

    let validItems = 0;
    const currentDate = new Date();

    submissionData.items.forEach((item: any) => {
      if (item.validFrom && item.validTo) {
        const validFrom = new Date(item.validFrom);
        const validTo = new Date(item.validTo);
        
        // Check if validity period is reasonable
        const validityDays = (validTo.getTime() - validFrom.getTime()) / (1000 * 60 * 60 * 24);
        
        if (validityDays >= 30 && validityDays <= 365 && validTo > currentDate) {
          validItems++;
        }
      }
    });

    return submissionData.items.length > 0 ? 
      Math.round((validItems / submissionData.items.length) * 100) : 0;
  }

  // Identify specific quality issues
  private identifyQualityIssues(
    validationResult: ValidationResult,
    submissionData: any
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Completeness issues
    if (submissionData.items) {
      const incompleteItems = submissionData.items.filter((item: any) => 
        !item.productId || !item.productName || !item.unitPrice
      ).length;

      if (incompleteItems > 0) {
        issues.push({
          category: 'completeness',
          severity: incompleteItems > submissionData.items.length * 0.1 ? 'high' : 'medium',
          description: `${incompleteItems} items have missing required fields`,
          affectedItems: incompleteItems,
          recommendation: 'Complete all required fields: Product ID, Product Name, and Unit Price'
        });
      }
    }

    // Accuracy issues from validation
    if (validationResult.itemsWithErrors > 0) {
      issues.push({
        category: 'accuracy',
        severity: validationResult.itemsWithErrors > validationResult.itemsValidated * 0.1 ? 'high' : 'medium',
        description: `${validationResult.itemsWithErrors} items have validation errors`,
        affectedItems: validationResult.itemsWithErrors,
        recommendation: 'Review and correct validation errors before resubmission'
      });
    }

    // Consistency issues
    if (submissionData.items) {
      const currencies = [...new Set(submissionData.items.map((item: any) => item.currency))];
      if (currencies.length > 2) {
        issues.push({
          category: 'consistency',
          severity: 'medium',
          description: `Multiple currencies used: ${currencies.join(', ')}`,
          affectedItems: submissionData.items.length,
          recommendation: 'Consider using consistent currency or clearly specify currency preferences'
        });
      }
    }

    // Validity issues
    const expiredItems = submissionData.items?.filter((item: any) => {
      if (item.validTo) {
        return new Date(item.validTo) <= new Date();
      }
      return false;
    }).length || 0;

    if (expiredItems > 0) {
      issues.push({
        category: 'validity',
        severity: 'high',
        description: `${expiredItems} items have expired validity dates`,
        affectedItems: expiredItems,
        recommendation: 'Update validity dates to ensure prices are current'
      });
    }

    return issues;
  }

  // Generate recommendations based on quality analysis
  private generateRecommendations(metrics: QualityMetrics, issues: QualityIssue[]): string[] {
    const recommendations: string[] = [];

    // Overall score recommendations
    if (metrics.overallScore < 70) {
      recommendations.push('Overall data quality needs improvement. Focus on addressing critical issues first.');
    }

    // Specific metric recommendations
    if (metrics.completenessScore < 80) {
      recommendations.push('Improve data completeness by filling in all required fields and relevant optional fields.');
    }

    if (metrics.accuracyScore < 80) {
      recommendations.push('Review and correct validation errors to improve data accuracy.');
    }

    if (metrics.consistencyScore < 80) {
      recommendations.push('Ensure consistent formatting and values across all price items.');
    }

    if (metrics.timelinessScore < 80) {
      recommendations.push('Submit price updates closer to their effective dates for better timeliness.');
    }

    if (metrics.validityScore < 80) {
      recommendations.push('Ensure all price validity periods are current and reasonable (30-365 days).');
    }

    // Issue-specific recommendations
    const criticalIssues = issues.filter(issue => issue.severity === 'critical' || issue.severity === 'high');
    if (criticalIssues.length > 0) {
      recommendations.push('Address critical and high-severity issues immediately before resubmission.');
    }

    // Best practices
    if (metrics.overallScore >= 90) {
      recommendations.push('Excellent data quality! Continue following current submission practices.');
    } else if (metrics.overallScore >= 80) {
      recommendations.push('Good data quality. Minor improvements could enhance submission excellence.');
    }

    return recommendations;
  }

  // Determine overall quality status
  private determineQualityStatus(overallScore: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (overallScore >= 90) return 'excellent';
    if (overallScore >= 80) return 'good';
    if (overallScore >= 70) return 'fair';
    if (overallScore >= 50) return 'poor';
    return 'critical';
  }

  // Get quality trends for vendor
  async getVendorQualityTrend(vendorId: string, days: number = 90): Promise<QualityTrend> {
    // This would typically fetch from database
    // For now, return mock trend data
    const mockHistory = Array.from({ length: Math.min(days / 7, 12) }, (_, i) => ({
      date: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)),
      score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      submissionCount: Math.floor(Math.random() * 5) + 1
    })).reverse();

    const firstScore = mockHistory[0]?.score || 0;
    const lastScore = mockHistory[mockHistory.length - 1]?.score || 0;
    const improvement = firstScore > 0 ? ((lastScore - firstScore) / firstScore) * 100 : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (improvement > 5) trend = 'improving';
    else if (improvement < -5) trend = 'declining';

    return {
      vendorId,
      period: `${days} days`,
      scoreHistory: mockHistory,
      improvement: Math.round(improvement),
      trend
    };
  }

  // Flag submissions for manual review
  async flagForManualReview(
    submissionId: string,
    qualityReport: QualityReport,
    reason: string
  ): Promise<void> {
    // This would typically update database status
    console.log(`Flagging submission ${submissionId} for manual review: ${reason}`);
    
    // Could trigger notifications to reviewers
    // Could update submission status in database
    // Could create review tasks
  }

  // Auto-approve high quality submissions
  async autoApproveIfQualified(
    submissionId: string,
    qualityReport: QualityReport
  ): Promise<boolean> {
    const autoApprovalThreshold = 85;
    const criticalIssues = qualityReport.issues.filter(
      issue => issue.severity === 'critical' || issue.severity === 'high'
    );

    if (qualityReport.metrics.overallScore >= autoApprovalThreshold && criticalIssues.length === 0) {
      console.log(`Auto-approving submission ${submissionId} with quality score ${qualityReport.metrics.overallScore}`);
      return true;
    }

    return false;
  }
}

// Export singleton instance
export const dataQualityService = new DataQualityService();