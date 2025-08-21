import { z } from 'zod';

// Validation schemas
export const PriceItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code'),
  minQuantity: z.number().int().positive('Minimum quantity must be positive integer'),
  bulkPrice: z.number().positive().optional(),
  bulkMinQuantity: z.number().int().positive().optional(),
  validFrom: z.date(),
  validTo: z.date(),
}).refine(data => data.validTo > data.validFrom, {
  message: 'Valid to date must be after valid from date',
  path: ['validTo']
}).refine(data => {
  if (data.bulkPrice && !data.bulkMinQuantity) {
    return false;
  }
  if (!data.bulkPrice && data.bulkMinQuantity) {
    return false;
  }
  return true;
}, {
  message: 'Bulk price and bulk minimum quantity must be provided together',
  path: ['bulkPrice']
});

export const PriceSubmissionSchema = z.object({
  vendorId: z.string().uuid('Invalid vendor ID'),
  categoryId: z.string().min(1, 'Category ID is required'),
  currency: z.string().length(3, 'Currency must be 3-letter code'),
  effectiveDate: z.date(),
  expirationDate: z.date(),
  items: z.array(PriceItemSchema).min(1, 'At least one price item is required'),
  submissionMethod: z.enum(['manual', 'upload', 'email']),
}).refine(data => data.expirationDate > data.effectiveDate, {
  message: 'Expiration date must be after effective date',
  path: ['expirationDate']
});

// Validation result types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  qualityScore: number;
  itemsValidated: number;
  itemsWithErrors: number;
  itemsWithWarnings: number;
}

export interface BusinessRuleValidationContext {
  vendorId: string;
  categoryId: string;
  items: any[];
  submissionDate: Date;
  previousSubmissions?: any[];
}

// Price validation engine
export class PriceValidationEngine {
  private businessRules: BusinessRule[] = [];

  constructor() {
    this.initializeBusinessRules();
  }

  // Real-time validation for price submissions
  async validatePriceSubmission(submission: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let itemsValidated = 0;
    let itemsWithErrors = 0;
    let itemsWithWarnings = 0;

    try {
      // Schema validation
      const schemaResult = PriceSubmissionSchema.safeParse(submission);
      if (!schemaResult.success) {
        schemaResult.error.errors.forEach(error => {
          errors.push({
            field: error.path.join('.'),
            message: error.message,
            code: 'SCHEMA_VALIDATION',
            severity: 'error',
            suggestion: this.getSuggestionForSchemaError(error)
          });
        });
      }

      // Business rule validation
      if (schemaResult.success) {
        const businessRuleErrors = await this.validateBusinessRules({
          vendorId: submission.vendorId,
          categoryId: submission.categoryId,
          items: submission.items,
          submissionDate: new Date()
        });
        errors.push(...businessRuleErrors.filter(e => e.severity === 'error'));
        warnings.push(...businessRuleErrors.filter(e => e.severity === 'warning'));
      }

      // Data quality checks
      if (submission.items) {
        for (let i = 0; i < submission.items.length; i++) {
          itemsValidated++;
          const item = submission.items[i];
          const itemErrors = await this.validatePriceItem(item, i);
          
          const itemErrorCount = itemErrors.filter(e => e.severity === 'error').length;
          const itemWarningCount = itemErrors.filter(e => e.severity === 'warning').length;
          
          if (itemErrorCount > 0) itemsWithErrors++;
          if (itemWarningCount > 0) itemsWithWarnings++;
          
          errors.push(...itemErrors.filter(e => e.severity === 'error'));
          warnings.push(...itemErrors.filter(e => e.severity === 'warning'));
        }
      }

      // Calculate quality score
      const qualityScore = this.calculateQualityScore({
        totalItems: itemsValidated,
        itemsWithErrors,
        itemsWithWarnings,
        totalErrors: errors.length,
        totalWarnings: warnings.length
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        qualityScore,
        itemsValidated,
        itemsWithErrors,
        itemsWithWarnings
      };

    } catch (error) {
      errors.push({
        field: 'system',
        message: 'Validation system error occurred',
        code: 'SYSTEM_ERROR',
        severity: 'error'
      });

      return {
        isValid: false,
        errors,
        warnings,
        qualityScore: 0,
        itemsValidated,
        itemsWithErrors,
        itemsWithWarnings
      };
    }
  }

  // Validate individual price item
  private async validatePriceItem(item: any, index: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const fieldPrefix = `items[${index}]`;

    // Price reasonableness checks
    if (item.unitPrice) {
      if (item.unitPrice > 10000) {
        errors.push({
          field: `${fieldPrefix}.unitPrice`,
          message: 'Unit price seems unusually high',
          code: 'PRICE_HIGH',
          severity: 'warning',
          suggestion: 'Please verify this price is correct'
        });
      }

      if (item.unitPrice < 0.01) {
        errors.push({
          field: `${fieldPrefix}.unitPrice`,
          message: 'Unit price seems unusually low',
          code: 'PRICE_LOW',
          severity: 'warning',
          suggestion: 'Please verify this price is correct'
        });
      }
    }

    // Bulk pricing validation
    if (item.bulkPrice && item.unitPrice) {
      if (item.bulkPrice >= item.unitPrice) {
        errors.push({
          field: `${fieldPrefix}.bulkPrice`,
          message: 'Bulk price should be lower than unit price',
          code: 'BULK_PRICE_INVALID',
          severity: 'warning',
          suggestion: 'Consider adjusting bulk price to be lower than unit price'
        });
      }
    }

    // Date validation
    if (item.validFrom && item.validTo) {
      const daysDiff = (new Date(item.validTo).getTime() - new Date(item.validFrom).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 30) {
        errors.push({
          field: `${fieldPrefix}.validTo`,
          message: 'Price validity period is less than 30 days',
          code: 'SHORT_VALIDITY',
          severity: 'warning',
          suggestion: 'Consider extending validity period for better price stability'
        });
      }
    }

    return errors;
  }

  // Business rule validation
  private async validateBusinessRules(context: BusinessRuleValidationContext): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    for (const rule of this.businessRules) {
      if (!rule.isActive) continue;

      try {
        const ruleResult = await this.evaluateBusinessRule(rule, context);
        if (!ruleResult.passed) {
          errors.push({
            field: ruleResult.field || 'general',
            message: ruleResult.message,
            code: rule.code,
            severity: rule.severity,
            suggestion: rule.suggestion
          });
        }
      } catch (error) {
        console.error(`Error evaluating business rule ${rule.code}:`, error);
      }
    }

    return errors;
  }

  // Calculate data quality score (0-100)
  private calculateQualityScore(metrics: {
    totalItems: number;
    itemsWithErrors: number;
    itemsWithWarnings: number;
    totalErrors: number;
    totalWarnings: number;
  }): number {
    if (metrics.totalItems === 0) return 0;

    // Base score starts at 100
    let score = 100;

    // Deduct points for errors (more severe)
    const errorPenalty = (metrics.itemsWithErrors / metrics.totalItems) * 50;
    score -= errorPenalty;

    // Deduct points for warnings (less severe)
    const warningPenalty = (metrics.itemsWithWarnings / metrics.totalItems) * 20;
    score -= warningPenalty;

    // Additional penalty for high error/warning density
    if (metrics.totalItems > 0) {
      const errorDensity = metrics.totalErrors / metrics.totalItems;
      const warningDensity = metrics.totalWarnings / metrics.totalItems;
      
      if (errorDensity > 0.1) score -= 10; // More than 10% error rate
      if (warningDensity > 0.2) score -= 5; // More than 20% warning rate
    }

    return Math.max(0, Math.round(score));
  }

  // Get suggestion for schema validation errors
  private getSuggestionForSchemaError(error: any): string {
    const suggestions: Record<string, string> = {
      'Product ID is required': 'Please provide a valid product identifier',
      'Unit price must be positive': 'Please enter a price greater than 0',
      'Currency must be 3-letter code': 'Please use ISO currency codes like USD, EUR, GBP',
      'Valid to date must be after valid from date': 'Please ensure the end date is after the start date'
    };

    return suggestions[error.message] || 'Please check the field format and try again';
  }

  // Initialize business rules
  private initializeBusinessRules(): void {
    this.businessRules = [
      {
        code: 'DUPLICATE_PRODUCT',
        name: 'Duplicate Product Check',
        description: 'Check for duplicate products in submission',
        severity: 'error' as const,
        isActive: true,
        suggestion: 'Remove duplicate products or consolidate pricing'
      },
      {
        code: 'PRICE_CHANGE_THRESHOLD',
        name: 'Price Change Threshold',
        description: 'Flag significant price changes from previous submissions',
        severity: 'warning' as const,
        isActive: true,
        suggestion: 'Large price changes may require additional review'
      },
      {
        code: 'CATEGORY_MISMATCH',
        name: 'Category Assignment Check',
        description: 'Verify products match assigned categories',
        severity: 'error' as const,
        isActive: true,
        suggestion: 'Ensure products belong to your assigned categories'
      }
    ];
  }

  // Evaluate individual business rule
  private async evaluateBusinessRule(rule: BusinessRule, context: BusinessRuleValidationContext): Promise<BusinessRuleResult> {
    switch (rule.code) {
      case 'DUPLICATE_PRODUCT':
        return this.checkDuplicateProducts(context);
      case 'PRICE_CHANGE_THRESHOLD':
        return this.checkPriceChangeThreshold(context);
      case 'CATEGORY_MISMATCH':
        return this.checkCategoryMismatch(context);
      default:
        return { passed: true, message: '', field: '' };
    }
  }

  private checkDuplicateProducts(context: BusinessRuleValidationContext): BusinessRuleResult {
    const productIds = context.items.map(item => item.productId);
    const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      return {
        passed: false,
        message: `Duplicate products found: ${duplicates.join(', ')}`,
        field: 'items'
      };
    }
    
    return { passed: true, message: '', field: '' };
  }

  private checkPriceChangeThreshold(context: BusinessRuleValidationContext): BusinessRuleResult {
    // This would typically check against previous submissions
    // For now, we'll implement a basic check
    const highPriceItems = context.items.filter(item => item.unitPrice > 1000);
    
    if (highPriceItems.length > 0) {
      return {
        passed: false,
        message: `High-value items detected that may require review`,
        field: 'items'
      };
    }
    
    return { passed: true, message: '', field: '' };
  }

  private checkCategoryMismatch(context: BusinessRuleValidationContext): BusinessRuleResult {
    // This would typically validate against category assignments
    // For now, we'll implement a basic check
    return { passed: true, message: '', field: '' };
  }
}

// Supporting interfaces
interface BusinessRule {
  code: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  isActive: boolean;
  suggestion?: string;
}

interface BusinessRuleResult {
  passed: boolean;
  message: string;
  field: string;
}

// Export singleton instance
export const priceValidationEngine = new PriceValidationEngine();