import { ValidationError, ValidationResult } from './price-validation-engine';
import { QualityReport, QualityIssue } from './data-quality-service';

export interface ErrorReport {
  submissionId: string;
  vendorId: string;
  timestamp: Date;
  errorSummary: ErrorSummary;
  detailedErrors: DetailedError[];
  correctionGuidance: CorrectionGuidance[];
  resubmissionRequired: boolean;
  estimatedFixTime: number; // minutes
}

export interface ErrorSummary {
  totalErrors: number;
  totalWarnings: number;
  criticalErrors: number;
  itemsAffected: number;
  categoriesAffected: string[];
  mostCommonError: string;
}

export interface DetailedError {
  id: string;
  field: string;
  itemIndex?: number;
  errorType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  currentValue: any;
  expectedFormat?: string;
  correctionSteps: string[];
  examples: string[];
  relatedErrors?: string[];
}

export interface CorrectionGuidance {
  category: string;
  priority: number;
  title: string;
  description: string;
  steps: CorrectionStep[];
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  preventionTips: string[];
}

export interface CorrectionStep {
  stepNumber: number;
  instruction: string;
  example?: string;
  warning?: string;
  helpLink?: string;
}

export interface ResubmissionTracker {
  submissionId: string;
  originalSubmissionId?: string;
  attemptNumber: number;
  changesRequired: string[];
  changesMade: SubmissionChange[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  lastModified: Date;
}

export interface SubmissionChange {
  field: string;
  itemIndex?: number;
  oldValue: any;
  newValue: any;
  changeType: 'correction' | 'addition' | 'removal';
  timestamp: Date;
  reason: string;
}

export class ErrorReportingService {
  
  // Generate comprehensive error report
  async generateErrorReport(
    submissionId: string,
    vendorId: string,
    validationResult: ValidationResult,
    qualityReport: QualityReport,
    submissionData: any
  ): Promise<ErrorReport> {
    
    const errorSummary = this.createErrorSummary(validationResult, qualityReport);
    const detailedErrors = this.createDetailedErrors(validationResult, submissionData);
    const correctionGuidance = this.generateCorrectionGuidance(detailedErrors, qualityReport);
    const resubmissionRequired = this.determineResubmissionRequired(validationResult, qualityReport);
    const estimatedFixTime = this.estimateFixTime(detailedErrors, correctionGuidance);

    return {
      submissionId,
      vendorId,
      timestamp: new Date(),
      errorSummary,
      detailedErrors,
      correctionGuidance,
      resubmissionRequired,
      estimatedFixTime
    };
  }

  // Create error summary
  private createErrorSummary(
    validationResult: ValidationResult,
    qualityReport: QualityReport
  ): ErrorSummary {
    
    const criticalErrors = validationResult.errors.filter(e => e.severity === 'error').length;
    const criticalIssues = qualityReport.issues.filter(i => i.severity === 'critical' || i.severity === 'high');
    
    // Find most common error
    const errorCounts = validationResult.errors.reduce((acc, error) => {
      acc[error.code] = (acc[error.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonError = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Determine affected categories
    const categoriesAffected = [...new Set(
      validationResult.errors
        .map(e => e.field.split('.')[0])
        .filter(category => category !== 'system')
    )];

    return {
      totalErrors: validationResult.errors.length,
      totalWarnings: validationResult.warnings.length,
      criticalErrors: criticalErrors + criticalIssues.length,
      itemsAffected: validationResult.itemsWithErrors,
      categoriesAffected,
      mostCommonError
    };
  }

  // Create detailed error information
  private createDetailedErrors(
    validationResult: ValidationResult,
    submissionData: any
  ): DetailedError[] {
    
    const detailedErrors: DetailedError[] = [];
    
    validationResult.errors.forEach((error, index) => {
      const detailedError = this.createDetailedError(error, index, submissionData, validationResult);
      detailedErrors.push(detailedError);
    });

    validationResult.warnings.forEach((warning, index) => {
      const detailedError = this.createDetailedError(warning, index + validationResult.errors.length, submissionData, validationResult);
      detailedErrors.push(detailedError);
    });

    return detailedErrors;
  }

  // Create individual detailed error
  private createDetailedError(
    error: ValidationError,
    index: number,
    submissionData: any,
    validationResult: ValidationResult
  ): DetailedError {
    
    const fieldParts = error.field.split('.');
    const itemIndex = fieldParts[0] === 'items' && fieldParts[1] ? parseInt(fieldParts[1].replace(/[\[\]]/g, '')) : undefined;
    
    let currentValue: any = submissionData;
    try {
      fieldParts.forEach(part => {
        const cleanPart = part.replace(/[\[\]]/g, '');
        if (!isNaN(Number(cleanPart))) {
          currentValue = currentValue[Number(cleanPart)];
        } else {
          currentValue = currentValue[cleanPart];
        }
      });
    } catch {
      currentValue = 'Unable to retrieve';
    }

    const correctionInfo = this.getCorrectionInfo(error.code, error.field);

    return {
      id: `error_${index}`,
      field: error.field,
      itemIndex,
      errorType: error.code,
      severity: this.mapSeverity(error.severity),
      message: error.message,
      currentValue,
      expectedFormat: correctionInfo.expectedFormat,
      correctionSteps: correctionInfo.steps,
      examples: correctionInfo.examples,
      relatedErrors: this.findRelatedErrors(error, validationResult.errors)
    };
  }

  // Get correction information for specific error types
  private getCorrectionInfo(errorCode: string, field: string): {
    expectedFormat?: string;
    steps: string[];
    examples: string[];
  } {
    
    const correctionMap: Record<string, any> = {
      'SCHEMA_VALIDATION': {
        expectedFormat: 'Valid data format according to schema',
        steps: [
          'Check the field format requirements',
          'Ensure all required fields are provided',
          'Verify data types match expected format'
        ],
        examples: [
          'Product ID: "PROD-12345"',
          'Unit Price: 29.99',
          'Currency: "USD"'
        ]
      },
      'PRICE_HIGH': {
        expectedFormat: 'Reasonable price range',
        steps: [
          'Verify the price is correct',
          'Check for decimal point errors',
          'Confirm currency is appropriate'
        ],
        examples: [
          'Instead of: 1000000, use: 1000.00',
          'Check: $10,000 vs $100.00'
        ]
      },
      'PRICE_LOW': {
        expectedFormat: 'Positive price value',
        steps: [
          'Ensure price is greater than 0',
          'Check for missing decimal places',
          'Verify currency conversion if applicable'
        ],
        examples: [
          'Instead of: 0.001, use: 1.00',
          'Instead of: 0, use: actual price'
        ]
      },
      'BULK_PRICE_INVALID': {
        expectedFormat: 'Bulk price lower than unit price',
        steps: [
          'Set bulk price lower than unit price',
          'Ensure bulk minimum quantity is specified',
          'Verify bulk pricing makes economic sense'
        ],
        examples: [
          'Unit Price: $10.00, Bulk Price: $8.50',
          'Bulk Min Quantity: 100 units'
        ]
      },
      'SHORT_VALIDITY': {
        expectedFormat: 'Validity period of at least 30 days',
        steps: [
          'Extend the validity end date',
          'Ensure minimum 30-day validity period',
          'Consider business cycle requirements'
        ],
        examples: [
          'Valid From: 2024-01-01, Valid To: 2024-02-01 (31 days)',
          'Recommended: 90-day validity periods'
        ]
      },
      'DUPLICATE_PRODUCT': {
        expectedFormat: 'Unique products per submission',
        steps: [
          'Remove duplicate product entries',
          'Consolidate pricing for same product',
          'Use different SKUs if variants exist'
        ],
        examples: [
          'Keep only one entry per Product ID',
          'Use PROD-001-RED, PROD-001-BLUE for variants'
        ]
      }
    };

    return correctionMap[errorCode] || {
      steps: ['Review the error message', 'Correct the identified issue', 'Resubmit the data'],
      examples: ['Follow the format requirements', 'Check similar successful submissions']
    };
  }

  // Generate correction guidance
  private generateCorrectionGuidance(
    detailedErrors: DetailedError[],
    qualityReport: QualityReport
  ): CorrectionGuidance[] {
    
    const guidance: CorrectionGuidance[] = [];
    
    // Group errors by category
    const errorsByCategory = this.groupErrorsByCategory(detailedErrors);
    
    Object.entries(errorsByCategory).forEach(([category, errors], index) => {
      const categoryGuidance = this.createCategoryGuidance(category, errors, index + 1);
      guidance.push(categoryGuidance);
    });

    // Add quality-specific guidance
    qualityReport.issues.forEach((issue, index) => {
      const qualityGuidance = this.createQualityGuidance(issue, guidance.length + index + 1);
      guidance.push(qualityGuidance);
    });

    return guidance.sort((a, b) => a.priority - b.priority);
  }

  // Group errors by category for guidance
  private groupErrorsByCategory(errors: DetailedError[]): Record<string, DetailedError[]> {
    return errors.reduce((acc, error) => {
      const category = this.getCategoryFromErrorType(error.errorType);
      if (!acc[category]) acc[category] = [];
      acc[category].push(error);
      return acc;
    }, {} as Record<string, DetailedError[]>);
  }

  // Get category from error type
  private getCategoryFromErrorType(errorType: string): string {
    const categoryMap: Record<string, string> = {
      'SCHEMA_VALIDATION': 'Format & Structure',
      'PRICE_HIGH': 'Price Validation',
      'PRICE_LOW': 'Price Validation',
      'BULK_PRICE_INVALID': 'Price Validation',
      'SHORT_VALIDITY': 'Date & Validity',
      'DUPLICATE_PRODUCT': 'Data Consistency'
    };
    
    return categoryMap[errorType] || 'General';
  }

  // Create category-specific guidance
  private createCategoryGuidance(
    category: string,
    errors: DetailedError[],
    priority: number
  ): CorrectionGuidance {
    
    const guidanceMap: Record<string, any> = {
      'Format & Structure': {
        title: 'Fix Data Format and Structure Issues',
        description: 'Correct formatting and structural problems in your submission',
        difficulty: 'easy' as const,
        estimatedTime: 10,
        preventionTips: [
          'Use provided templates when available',
          'Validate data before submission',
          'Follow field format requirements exactly'
        ]
      },
      'Price Validation': {
        title: 'Resolve Price Validation Issues',
        description: 'Address pricing-related validation problems',
        difficulty: 'medium' as const,
        estimatedTime: 15,
        preventionTips: [
          'Double-check price calculations',
          'Verify currency and decimal places',
          'Ensure bulk pricing is logical'
        ]
      },
      'Date & Validity': {
        title: 'Correct Date and Validity Issues',
        description: 'Fix date ranges and validity periods',
        difficulty: 'easy' as const,
        estimatedTime: 5,
        preventionTips: [
          'Use consistent date formats',
          'Ensure validity periods are reasonable',
          'Check for date logic errors'
        ]
      },
      'Data Consistency': {
        title: 'Improve Data Consistency',
        description: 'Resolve consistency and duplication issues',
        difficulty: 'medium' as const,
        estimatedTime: 20,
        preventionTips: [
          'Review data for duplicates before submission',
          'Use consistent naming conventions',
          'Validate cross-field relationships'
        ]
      }
    };

    const config = guidanceMap[category] || {
      title: 'Address General Issues',
      description: 'Resolve various data quality issues',
      difficulty: 'medium' as const,
      estimatedTime: 15,
      preventionTips: ['Review submission carefully', 'Follow best practices']
    };

    const steps: CorrectionStep[] = errors.map((error, index) => ({
      stepNumber: index + 1,
      instruction: `${error.message}: ${error.correctionSteps[0] || 'Review and correct'}`,
      example: error.examples[0],
      warning: error.severity === 'critical' ? 'This is a critical error that must be fixed' : undefined
    }));

    return {
      category,
      priority,
      title: config.title,
      description: config.description,
      steps,
      estimatedTime: config.estimatedTime,
      difficulty: config.difficulty,
      preventionTips: config.preventionTips
    };
  }

  // Create quality-specific guidance
  private createQualityGuidance(issue: QualityIssue, priority: number): CorrectionGuidance {
    return {
      category: issue.category,
      priority,
      title: `Improve ${issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}`,
      description: issue.description,
      steps: [{
        stepNumber: 1,
        instruction: issue.recommendation,
        example: this.getExampleForQualityIssue(issue.category)
      }],
      estimatedTime: this.getTimeForQualityIssue(issue.severity),
      difficulty: this.getDifficultyForQualityIssue(issue.severity),
      preventionTips: this.getPreventionTipsForQuality(issue.category)
    };
  }

  // Helper methods for quality guidance
  private getExampleForQualityIssue(category: string): string {
    const examples: Record<string, string> = {
      'completeness': 'Fill in Product Name: "Premium Widget Set"',
      'accuracy': 'Correct price format: 29.99 instead of "29.99$"',
      'consistency': 'Use consistent currency: USD for all items',
      'timeliness': 'Submit prices 7-14 days before effective date',
      'validity': 'Set validity period: 90 days from effective date'
    };
    return examples[category] || 'Follow best practices for data quality';
  }

  private getTimeForQualityIssue(severity: string): number {
    const timeMap: Record<string, number> = {
      'critical': 30,
      'high': 20,
      'medium': 15,
      'low': 10
    };
    return timeMap[severity] || 15;
  }

  private getDifficultyForQualityIssue(severity: string): 'easy' | 'medium' | 'hard' {
    const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
      'critical': 'hard',
      'high': 'medium',
      'medium': 'medium',
      'low': 'easy'
    };
    return difficultyMap[severity] || 'medium';
  }

  private getPreventionTipsForQuality(category: string): string[] {
    const tipsMap: Record<string, string[]> = {
      'completeness': [
        'Use checklists to ensure all fields are filled',
        'Review submission before finalizing',
        'Use templates with pre-filled required fields'
      ],
      'accuracy': [
        'Double-check calculations and formats',
        'Use validation tools before submission',
        'Review common error patterns'
      ],
      'consistency': [
        'Establish data entry standards',
        'Use consistent formats across all entries',
        'Review for consistency before submission'
      ],
      'timeliness': [
        'Plan submissions in advance',
        'Set reminders for regular updates',
        'Submit updates promptly when prices change'
      ],
      'validity': [
        'Plan validity periods based on business cycles',
        'Set reasonable expiration dates',
        'Update prices before expiration'
      ]
    };
    return tipsMap[category] || ['Follow data quality best practices'];
  }

  // Utility methods
  private mapSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
    const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
      'error': 'high',
      'warning': 'medium',
      'info': 'low'
    };
    return severityMap[severity] || 'medium';
  }

  private findRelatedErrors(error: ValidationError, allErrors: ValidationError[]): string[] {
    return allErrors
      .filter(e => e !== error && (e.field === error.field || e.code === error.code))
      .map(e => e.message)
      .slice(0, 3); // Limit to 3 related errors
  }

  private determineResubmissionRequired(
    validationResult: ValidationResult,
    qualityReport: QualityReport
  ): boolean {
    const criticalErrors = validationResult.errors.filter(e => e.severity === 'error').length;
    const criticalIssues = qualityReport.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length;
    
    return criticalErrors > 0 || criticalIssues > 0 || qualityReport.metrics.overallScore < 70;
  }

  private estimateFixTime(
    detailedErrors: DetailedError[],
    correctionGuidance: CorrectionGuidance[]
  ): number {
    const errorTime = detailedErrors.reduce((total, error) => {
      const timeMap: Record<string, number> = {
        'critical': 10,
        'high': 7,
        'medium': 5,
        'low': 3
      };
      return total + (timeMap[error.severity] || 5);
    }, 0);

    const guidanceTime = correctionGuidance.reduce((total, guidance) => {
      return total + guidance.estimatedTime;
    }, 0);

    return Math.max(errorTime, guidanceTime);
  }

  // Track resubmission changes
  async trackResubmission(
    submissionId: string,
    originalSubmissionId: string,
    changesRequired: string[],
    attemptNumber: number
  ): Promise<ResubmissionTracker> {
    
    return {
      submissionId,
      originalSubmissionId,
      attemptNumber,
      changesRequired,
      changesMade: [],
      status: 'pending',
      lastModified: new Date()
    };
  }

  // Record submission changes
  async recordSubmissionChange(
    trackerId: string,
    change: Omit<SubmissionChange, 'timestamp'>
  ): Promise<void> {
    const submissionChange: SubmissionChange = {
      ...change,
      timestamp: new Date()
    };
    
    // This would typically update the database
    console.log(`Recording change for tracker ${trackerId}:`, submissionChange);
  }

  // Generate change summary
  async generateChangeSummary(trackerId: string): Promise<{
    totalChanges: number;
    changesByType: Record<string, number>;
    completionRate: number;
    remainingChanges: string[];
  }> {
    // This would typically fetch from database
    // For now, return mock data
    return {
      totalChanges: 5,
      changesByType: {
        'correction': 3,
        'addition': 1,
        'removal': 1
      },
      completionRate: 80,
      remainingChanges: ['Fix remaining price validation errors']
    };
  }
}

// Export singleton instance
export const errorReportingService = new ErrorReportingService();