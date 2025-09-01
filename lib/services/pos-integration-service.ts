/**
 * POS Integration Service
 * 
 * Handles integration with Point of Sale systems for menu engineering data collection.
 * Provides bulk import, daily synchronization, validation, and mapping capabilities.
 */

import { BaseCalculator, CalculationResult, CalculationContext } from './calculations/base-calculator';
import { EnhancedCacheLayer, CacheDependency } from './cache/enhanced-cache-layer';
import { Recipe } from '@/lib/types/recipe';
import { Money } from '@/lib/types/common';
import { z } from 'zod';

// ====== TYPE DEFINITIONS ======

/**
 * Sales transaction data from POS system
 */
export interface SalesTransaction {
  id: string;
  posTransactionId: string;
  posTransactionNo?: string;
  saleDate: Date;
  quantitySold: number;
  revenue: number;
  discounts: number;
  netRevenue: number;
  locationId?: string;
  locationName?: string;
  departmentId?: string;
  departmentName?: string;
  shiftId?: string;
  shiftName?: string;
  servedById?: string;
  servedByName?: string;
  customerId?: string;
  customerType?: string;
  dayOfWeek: number;
  mealPeriod?: string;
  weatherCondition?: string;
  specialEvent?: string;
  basePrice: number;
  taxAmount: number;
  serviceCharge: number;
  calculatedFoodCost?: number;
  grossProfit?: number;
  profitMargin?: number;
  note?: string;
  info?: Record<string, any>;
  dimension?: Record<string, any>;
}

/**
 * POS item mapping to recipe
 */
export interface POSItemMapping {
  id: string;
  posItemId: string;
  posItemName: string;
  posItemCode?: string;
  recipeId: string;
  recipeName: string;
  recipeCode: string;
  conversionFactor: number; // How many recipe units per POS sale
  isActive: boolean;
  confidence: number; // 0-1 confidence in mapping accuracy
  mappingMethod: 'manual' | 'automatic' | 'ai_suggested';
  lastValidated?: Date;
  validatedBy?: string;
  notes?: string;
}

/**
 * Sales data import batch
 */
export interface SalesDataImportBatch {
  batchId: string;
  source: string;
  importedAt: Date;
  importedBy: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  validationErrors: ValidationError[];
  processingTimeMs: number;
  metadata?: Record<string, any>;
}

/**
 * Validation error detail
 */
export interface ValidationError {
  recordIndex: number;
  field: string;
  value: any;
  error: string;
  severity: 'warning' | 'error';
}

/**
 * Daily sync status
 */
export interface DailySyncStatus {
  date: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial';
  recordsProcessed: number;
  errorCount: number;
  lastAttempt?: Date;
  nextAttempt?: Date;
  retryCount: number;
  errors?: string[];
}

// ====== ZOD VALIDATION SCHEMAS ======

export const SalesTransactionSchema = z.object({
  posTransactionId: z.string().min(1, 'POS transaction ID is required'),
  posTransactionNo: z.string().optional(),
  saleDate: z.date(),
  quantitySold: z.number().positive('Quantity sold must be positive'),
  revenue: z.number().min(0, 'Revenue must be non-negative'),
  discounts: z.number().min(0, 'Discounts must be non-negative'),
  netRevenue: z.number().min(0, 'Net revenue must be non-negative'),
  locationId: z.string().optional(),
  locationName: z.string().optional(),
  departmentId: z.string().optional(),
  departmentName: z.string().optional(),
  shiftId: z.string().optional(),
  shiftName: z.string().optional(),
  servedById: z.string().optional(),
  servedByName: z.string().optional(),
  customerId: z.string().optional(),
  customerType: z.string().optional(),
  dayOfWeek: z.number().int().min(1).max(7),
  mealPeriod: z.string().optional(),
  weatherCondition: z.string().optional(),
  specialEvent: z.string().optional(),
  basePrice: z.number().min(0, 'Base price must be non-negative'),
  taxAmount: z.number().min(0, 'Tax amount must be non-negative'),
  serviceCharge: z.number().min(0, 'Service charge must be non-negative'),
  calculatedFoodCost: z.number().min(0).optional(),
  grossProfit: z.number().optional(),
  profitMargin: z.number().optional(),
  note: z.string().optional(),
  info: z.record(z.any()).optional(),
  dimension: z.record(z.any()).optional()
});

export const POSItemMappingSchema = z.object({
  posItemId: z.string().min(1, 'POS item ID is required'),
  posItemName: z.string().min(1, 'POS item name is required'),
  posItemCode: z.string().optional(),
  recipeId: z.string().min(1, 'Recipe ID is required'),
  recipeName: z.string().min(1, 'Recipe name is required'),
  recipeCode: z.string().min(1, 'Recipe code is required'),
  conversionFactor: z.number().positive('Conversion factor must be positive'),
  isActive: z.boolean(),
  confidence: z.number().min(0).max(1),
  mappingMethod: z.enum(['manual', 'automatic', 'ai_suggested']),
  lastValidated: z.date().optional(),
  validatedBy: z.string().optional(),
  notes: z.string().optional()
});

export const SalesDataImportBatchSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  importedBy: z.string().min(1, 'Imported by is required'),
  metadata: z.record(z.any()).optional()
});

// ====== INTERFACE DEFINITIONS ======

export interface ImportSalesDataInput {
  transactions: Partial<SalesTransaction>[];
  source: string;
  importedBy: string;
  batchSize?: number;
  validateOnly?: boolean;
  skipDuplicates?: boolean;
  metadata?: Record<string, any>;
}

export interface ImportSalesDataResult {
  batchId: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  validationErrors: ValidationError[];
  processingTimeMs: number;
  duplicatesSkipped: number;
  transactions: SalesTransaction[];
}

export interface ValidateSalesDataInput {
  transactions: Partial<SalesTransaction>[];
  strictValidation?: boolean;
  checkDuplicates?: boolean;
  existingTransactionIds?: string[];
}

export interface ValidateSalesDataResult {
  valid: boolean;
  validTransactions: SalesTransaction[];
  invalidTransactions: Array<{
    transaction: Partial<SalesTransaction>;
    errors: ValidationError[];
  }>;
  duplicates: string[];
  summary: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    duplicateRecords: number;
  };
}

export interface MapPOSItemsInput {
  posItems: Array<{
    posItemId: string;
    posItemName: string;
    posItemCode?: string;
    category?: string;
    description?: string;
  }>;
  availableRecipes: Recipe[];
  mappingStrategy?: 'name_similarity' | 'code_match' | 'ai_enhanced';
  confidenceThreshold?: number;
  autoApprove?: boolean;
}

export interface MapPOSItemsResult {
  totalItems: number;
  mappedItems: number;
  unmappedItems: number;
  highConfidenceMappings: POSItemMapping[];
  lowConfidenceMappings: POSItemMapping[];
  unmappedPOSItems: Array<{
    posItemId: string;
    posItemName: string;
    reason: string;
  }>;
  suggestions: Array<{
    posItemId: string;
    suggestions: Array<{
      recipeId: string;
      recipeName: string;
      confidence: number;
      reason: string;
    }>;
  }>;
}

export interface SyncDailySalesInput {
  date: Date;
  sources?: string[];
  retryFailedRecords?: boolean;
  maxRetries?: number;
  batchSize?: number;
}

export interface SyncDailySalesResult {
  date: Date;
  status: 'completed' | 'partial' | 'failed';
  recordsProcessed: number;
  errorCount: number;
  sources: Array<{
    source: string;
    recordsProcessed: number;
    errors: number;
    status: 'completed' | 'failed';
  }>;
  processingTimeMs: number;
  nextSyncTime?: Date;
}

// ====== POS INTEGRATION SERVICE ======

/**
 * POS Integration Service for menu engineering data collection
 */
export class POSIntegrationService extends BaseCalculator {
  protected serviceName = 'POSIntegrationService';
  
  constructor(
    private cache: EnhancedCacheLayer,
    private defaultBatchSize: number = 1000,
    private maxRetries: number = 3,
    private syncIntervalHours: number = 24
  ) {
    super();
  }

  /**
   * Import sales data from POS system with comprehensive validation
   */
  async importSalesData(input: ImportSalesDataInput): Promise<CalculationResult<ImportSalesDataResult>> {
    return this.executeCalculation('importSalesData', input, async (context) => {
      const startTime = Date.now();
      const batchId = this.generateBatchId();
      const batchSize = input.batchSize || this.defaultBatchSize;
      
      // Validate input
      if (!input.transactions || input.transactions.length === 0) {
        throw this.createError(
          'No transactions provided for import',
          'NO_TRANSACTIONS',
          context
        );
      }

      // Validate batch metadata
      try {
        SalesDataImportBatchSchema.parse({
          source: input.source,
          importedBy: input.importedBy,
          metadata: input.metadata
        });
      } catch (error) {
        throw this.createError(
          'Invalid batch metadata',
          'INVALID_BATCH_METADATA',
          context,
          error as Error
        );
      }

      let successfulRecords = 0;
      let failedRecords = 0;
      let duplicatesSkipped = 0;
      const validationErrors: ValidationError[] = [];
      const processedTransactions: SalesTransaction[] = [];

      // Get existing transaction IDs if checking for duplicates
      const existingTransactionIds = input.skipDuplicates 
        ? await this.getExistingTransactionIds(context)
        : [];

      // Process transactions in batches
      for (let i = 0; i < input.transactions.length; i += batchSize) {
        const batch = input.transactions.slice(i, i + batchSize);
        const batchResult = await this.processSalesDataBatch(
          batch,
          i,
          existingTransactionIds,
          input.validateOnly || false,
          context
        );

        successfulRecords += batchResult.successful;
        failedRecords += batchResult.failed;
        duplicatesSkipped += batchResult.duplicatesSkipped;
        validationErrors.push(...batchResult.errors);
        processedTransactions.push(...batchResult.transactions);
      }

      const processingTimeMs = Date.now() - startTime;

      // Create import batch record if not validation only
      if (!input.validateOnly) {
        await this.createImportBatchRecord({
          batchId,
          source: input.source,
          importedAt: new Date(),
          importedBy: input.importedBy,
          totalRecords: input.transactions.length,
          successfulRecords,
          failedRecords,
          validationErrors,
          processingTimeMs,
          metadata: input.metadata
        }, context);
      }

      // Cache results for quick retrieval
      const dependencies: CacheDependency[] = [
        { type: 'entity', identifier: 'sales_transactions' },
        { type: 'entity', identifier: `import_batch_${batchId}` }
      ];

      const result: ImportSalesDataResult = {
        batchId,
        totalRecords: input.transactions.length,
        successfulRecords,
        failedRecords,
        validationErrors,
        processingTimeMs,
        duplicatesSkipped,
        transactions: processedTransactions
      };

      // Cache the result
      await this.cache.getOrCompute(
        this.serviceName,
        'importSalesData',
        { batchId },
        async () => this.createResult(result, context),
        dependencies
      );

      return result;
    });
  }

  /**
   * Validate sales data comprehensively
   */
  async validateSalesData(input: ValidateSalesDataInput): Promise<CalculationResult<ValidateSalesDataResult>> {
    return this.executeCalculation('validateSalesData', input, async (context) => {
      const validTransactions: SalesTransaction[] = [];
      const invalidTransactions: Array<{
        transaction: Partial<SalesTransaction>;
        errors: ValidationError[];
      }> = [];
      const duplicates: string[] = [];

      const existingIds = input.existingTransactionIds || [];

      for (let i = 0; i < input.transactions.length; i++) {
        const transaction = input.transactions[i];
        const errors: ValidationError[] = [];

        // Schema validation
        try {
          const validatedTransaction = SalesTransactionSchema.parse(transaction);
          
          // Additional business rule validation
          const businessRuleErrors = await this.validateBusinessRules(
            validatedTransaction,
            input.strictValidation || false,
            context
          );
          
          if (businessRuleErrors.length === 0) {
            // Check for duplicates
            if (input.checkDuplicates && transaction.posTransactionId) {
              if (existingIds.includes(transaction.posTransactionId)) {
                duplicates.push(transaction.posTransactionId);
              } else {
                validTransactions.push({
                  ...validatedTransaction,
                  id: this.generateTransactionId()
                });
              }
            } else {
              validTransactions.push({
                ...validatedTransaction,
                id: this.generateTransactionId()
              });
            }
          } else {
            errors.push(...businessRuleErrors.map(error => ({
              recordIndex: i,
              field: error.field,
              value: error.value,
              error: error.message,
              severity: error.severity as 'warning' | 'error'
            })));
          }
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            errors.push(...validationError.errors.map(error => ({
              recordIndex: i,
              field: error.path.join('.'),
              value: error.code === 'invalid_type' ? transaction : null,
              error: error.message,
              severity: 'error' as const
            })));
          } else {
            errors.push({
              recordIndex: i,
              field: 'unknown',
              value: transaction,
              error: 'Unknown validation error',
              severity: 'error'
            });
          }
        }

        if (errors.length > 0) {
          invalidTransactions.push({
            transaction,
            errors
          });
        }
      }

      const result: ValidateSalesDataResult = {
        valid: invalidTransactions.length === 0,
        validTransactions,
        invalidTransactions,
        duplicates,
        summary: {
          totalRecords: input.transactions.length,
          validRecords: validTransactions.length,
          invalidRecords: invalidTransactions.length,
          duplicateRecords: duplicates.length
        }
      };

      return result;
    });
  }

  /**
   * Map POS items to recipes with intelligent matching
   */
  async mapPOSItemsToRecipes(input: MapPOSItemsInput): Promise<CalculationResult<MapPOSItemsResult>> {
    return this.executeCalculation('mapPOSItemsToRecipes', input, async (context) => {
      const highConfidenceMappings: POSItemMapping[] = [];
      const lowConfidenceMappings: POSItemMapping[] = [];
      const unmappedPOSItems: Array<{
        posItemId: string;
        posItemName: string;
        reason: string;
      }> = [];
      const suggestions: Array<{
        posItemId: string;
        suggestions: Array<{
          recipeId: string;
          recipeName: string;
          confidence: number;
          reason: string;
        }>;
      }> = [];

      const strategy = input.mappingStrategy || 'name_similarity';
      const confidenceThreshold = input.confidenceThreshold || 0.7;

      for (const posItem of input.posItems) {
        const mappingCandidates = await this.findMappingCandidates(
          posItem,
          input.availableRecipes,
          strategy,
          context
        );

        if (mappingCandidates.length === 0) {
          unmappedPOSItems.push({
            posItemId: posItem.posItemId,
            posItemName: posItem.posItemName,
            reason: 'No matching recipes found'
          });
          continue;
        }

        // Sort by confidence
        mappingCandidates.sort((a, b) => b.confidence - a.confidence);
        
        const bestMatch = mappingCandidates[0];
        
        if (bestMatch.confidence >= confidenceThreshold) {
          const mapping: POSItemMapping = {
            id: this.generateMappingId(),
            posItemId: posItem.posItemId,
            posItemName: posItem.posItemName,
            posItemCode: posItem.posItemCode,
            recipeId: bestMatch.recipeId,
            recipeName: bestMatch.recipeName,
            recipeCode: bestMatch.recipeCode,
            conversionFactor: bestMatch.conversionFactor,
            isActive: input.autoApprove || false,
            confidence: bestMatch.confidence,
            mappingMethod: strategy === 'ai_enhanced' ? 'ai_suggested' : 'automatic',
            notes: bestMatch.reason
          };

          if (bestMatch.confidence >= 0.9) {
            highConfidenceMappings.push(mapping);
          } else {
            lowConfidenceMappings.push(mapping);
          }
        } else {
          unmappedPOSItems.push({
            posItemId: posItem.posItemId,
            posItemName: posItem.posItemName,
            reason: `Low confidence match (${(bestMatch.confidence * 100).toFixed(1)}%)`
          });

          // Provide suggestions for manual review
          suggestions.push({
            posItemId: posItem.posItemId,
            suggestions: mappingCandidates.slice(0, 3).map(candidate => ({
              recipeId: candidate.recipeId,
              recipeName: candidate.recipeName,
              confidence: candidate.confidence,
              reason: candidate.reason
            }))
          });
        }
      }

      const result: MapPOSItemsResult = {
        totalItems: input.posItems.length,
        mappedItems: highConfidenceMappings.length + lowConfidenceMappings.length,
        unmappedItems: unmappedPOSItems.length,
        highConfidenceMappings,
        lowConfidenceMappings,
        unmappedPOSItems,
        suggestions
      };

      return result;
    });
  }

  /**
   * Synchronize daily sales data with retry logic
   */
  async syncDailySales(input: SyncDailySalesInput): Promise<CalculationResult<SyncDailySalesResult>> {
    return this.executeCalculation('syncDailySales', input, async (context) => {
      const startTime = Date.now();
      const sources = input.sources || await this.getActiveSources(context);
      const maxRetries = input.maxRetries || this.maxRetries;
      const batchSize = input.batchSize || this.defaultBatchSize;

      const sourceResults: Array<{
        source: string;
        recordsProcessed: number;
        errors: number;
        status: 'completed' | 'failed';
      }> = [];

      let totalRecordsProcessed = 0;
      let totalErrorCount = 0;

      for (const source of sources) {
        let retryCount = 0;
        let sourceSuccess = false;
        let sourceRecordsProcessed = 0;
        let sourceErrors = 0;

        while (retryCount <= maxRetries && !sourceSuccess) {
          try {
            const syncResult = await this.syncSourceData(
              source,
              input.date,
              batchSize,
              input.retryFailedRecords || false,
              context
            );

            sourceRecordsProcessed = syncResult.recordsProcessed;
            sourceErrors = syncResult.errorCount;
            sourceSuccess = syncResult.status === 'completed';
            
          } catch (error) {
            console.error(`[${this.serviceName}] Sync failed for source ${source}, attempt ${retryCount + 1}:`, error);
            sourceErrors++;
            retryCount++;
            
            if (retryCount <= maxRetries) {
              // Exponential backoff
              await this.delay(Math.pow(2, retryCount) * 1000);
            }
          }
        }

        sourceResults.push({
          source,
          recordsProcessed: sourceRecordsProcessed,
          errors: sourceErrors,
          status: sourceSuccess ? 'completed' : 'failed'
        });

        totalRecordsProcessed += sourceRecordsProcessed;
        totalErrorCount += sourceErrors;
      }

      const processingTimeMs = Date.now() - startTime;
      const overallStatus = sourceResults.every(s => s.status === 'completed') 
        ? 'completed' 
        : sourceResults.some(s => s.status === 'completed') 
          ? 'partial' 
          : 'failed';

      // Schedule next sync
      const nextSyncTime = new Date(input.date);
      nextSyncTime.setHours(nextSyncTime.getHours() + this.syncIntervalHours);

      const result: SyncDailySalesResult = {
        date: input.date,
        status: overallStatus,
        recordsProcessed: totalRecordsProcessed,
        errorCount: totalErrorCount,
        sources: sourceResults,
        processingTimeMs,
        nextSyncTime
      };

      // Cache sync status
      const dependencies: CacheDependency[] = [
        { type: 'entity', identifier: 'daily_sync_status' },
        { type: 'entity', identifier: `sync_${input.date.toISOString().split('T')[0]}` }
      ];

      await this.cache.getOrCompute(
        this.serviceName,
        'syncDailySales',
        { date: input.date },
        async () => this.createResult(result, context),
        dependencies
      );

      return result;
    });
  }

  // ====== PRIVATE HELPER METHODS ======

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMappingId(): string {
    return `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async processSalesDataBatch(
    batch: Partial<SalesTransaction>[],
    offset: number,
    existingTransactionIds: string[],
    validateOnly: boolean,
    context: CalculationContext
  ) {
    let successful = 0;
    let failed = 0;
    let duplicatesSkipped = 0;
    const errors: ValidationError[] = [];
    const transactions: SalesTransaction[] = [];

    for (let i = 0; i < batch.length; i++) {
      const transaction = batch[i];
      const recordIndex = offset + i;

      try {
        // Check for duplicates
        if (transaction.posTransactionId && existingTransactionIds.includes(transaction.posTransactionId)) {
          duplicatesSkipped++;
          continue;
        }

        // Validate transaction
        const validatedTransaction = SalesTransactionSchema.parse(transaction);
        
        // Additional business rules validation
        const businessRuleErrors = await this.validateBusinessRules(validatedTransaction, false, context);
        
        if (businessRuleErrors.length === 0) {
          const processedTransaction: SalesTransaction = {
            ...validatedTransaction,
            id: this.generateTransactionId()
          };

          if (!validateOnly) {
            // Here you would normally save to database
            // await this.saveSalesTransaction(processedTransaction, context);
          }
          
          transactions.push(processedTransaction);
          successful++;
        } else {
          failed++;
          errors.push(...businessRuleErrors.map(error => ({
            recordIndex,
            field: error.field,
            value: error.value,
            error: error.message,
            severity: error.severity as 'warning' | 'error'
          })));
        }
      } catch (validationError) {
        failed++;
        if (validationError instanceof z.ZodError) {
          errors.push(...validationError.errors.map(error => ({
            recordIndex,
            field: error.path.join('.'),
            value: transaction,
            error: error.message,
            severity: 'error' as const
          })));
        } else {
          errors.push({
            recordIndex,
            field: 'unknown',
            value: transaction,
            error: 'Unknown validation error',
            severity: 'error'
          });
        }
      }
    }

    return { successful, failed, duplicatesSkipped, errors, transactions };
  }

  private async validateBusinessRules(
    transaction: z.infer<typeof SalesTransactionSchema>,
    strict: boolean,
    context: CalculationContext
  ): Promise<Array<{ field: string; value: any; message: string; severity: string }>> {
    const errors: Array<{ field: string; value: any; message: string; severity: string }> = [];

    // Revenue consistency checks
    if (transaction.netRevenue > transaction.revenue) {
      errors.push({
        field: 'netRevenue',
        value: transaction.netRevenue,
        message: 'Net revenue cannot exceed gross revenue',
        severity: 'error'
      });
    }

    if (transaction.revenue - transaction.discounts !== transaction.netRevenue) {
      const expectedNetRevenue = transaction.revenue - transaction.discounts;
      if (Math.abs(expectedNetRevenue - transaction.netRevenue) > 0.01) { // Allow for rounding
        errors.push({
          field: 'netRevenue',
          value: transaction.netRevenue,
          message: `Net revenue should be ${expectedNetRevenue} (revenue - discounts)`,
          severity: strict ? 'error' : 'warning'
        });
      }
    }

    // Date validation
    const now = new Date();
    const maxFutureDate = new Date(now);
    maxFutureDate.setDate(maxFutureDate.getDate() + 1); // Allow 1 day future

    if (transaction.saleDate > maxFutureDate) {
      errors.push({
        field: 'saleDate',
        value: transaction.saleDate,
        message: 'Sale date cannot be more than 1 day in the future',
        severity: 'error'
      });
    }

    const minPastDate = new Date(now);
    minPastDate.setFullYear(minPastDate.getFullYear() - 2); // Allow 2 years in the past

    if (transaction.saleDate < minPastDate) {
      errors.push({
        field: 'saleDate',
        value: transaction.saleDate,
        message: 'Sale date cannot be more than 2 years in the past',
        severity: strict ? 'error' : 'warning'
      });
    }

    // Day of week validation
    const calculatedDayOfWeek = transaction.saleDate.getDay() === 0 ? 7 : transaction.saleDate.getDay(); // Convert Sunday from 0 to 7
    if (transaction.dayOfWeek !== calculatedDayOfWeek) {
      errors.push({
        field: 'dayOfWeek',
        value: transaction.dayOfWeek,
        message: `Day of week should be ${calculatedDayOfWeek} for ${transaction.saleDate.toISOString().split('T')[0]}`,
        severity: strict ? 'error' : 'warning'
      });
    }

    return errors;
  }

  private async findMappingCandidates(
    posItem: { posItemId: string; posItemName: string; posItemCode?: string; category?: string; description?: string },
    recipes: Recipe[],
    strategy: string,
    context: CalculationContext
  ) {
    const candidates: Array<{
      recipeId: string;
      recipeName: string;
      recipeCode: string;
      confidence: number;
      reason: string;
      conversionFactor: number;
    }> = [];

    for (const recipe of recipes) {
      let confidence = 0;
      let reason = '';
      
      switch (strategy) {
        case 'name_similarity':
          confidence = this.calculateNameSimilarity(posItem.posItemName, recipe.name);
          reason = `Name similarity: ${(confidence * 100).toFixed(1)}%`;
          break;
          
        case 'code_match':
          if (posItem.posItemCode && recipe.recipeCode) {
            confidence = posItem.posItemCode.toLowerCase() === recipe.recipeCode.toLowerCase() ? 1.0 : 0;
            reason = confidence === 1.0 ? 'Exact code match' : 'No code match';
          }
          break;
          
        case 'ai_enhanced':
          // This would integrate with an AI service for enhanced matching
          confidence = this.calculateEnhancedSimilarity(posItem, recipe);
          reason = `AI-enhanced matching score: ${(confidence * 100).toFixed(1)}%`;
          break;
      }

      if (confidence > 0.1) { // Only include candidates with some similarity
        candidates.push({
          recipeId: recipe.id,
          recipeName: recipe.name,
          recipeCode: recipe.recipeCode,
          confidence,
          reason,
          conversionFactor: 1.0 // Default conversion factor
        });
      }
    }

    return candidates;
  }

  private calculateNameSimilarity(posName: string, recipeName: string): number {
    // Simple similarity calculation using Levenshtein distance
    const name1 = posName.toLowerCase().trim();
    const name2 = recipeName.toLowerCase().trim();
    
    if (name1 === name2) return 1.0;
    
    const maxLength = Math.max(name1.length, name2.length);
    if (maxLength === 0) return 1.0;
    
    const distance = this.levenshteinDistance(name1, name2);
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private calculateEnhancedSimilarity(
    posItem: { posItemId: string; posItemName: string; posItemCode?: string; category?: string; description?: string },
    recipe: Recipe
  ): number {
    // Enhanced similarity calculation combining multiple factors
    let totalScore = 0;
    let totalWeight = 0;

    // Name similarity (weight: 0.6)
    const nameScore = this.calculateNameSimilarity(posItem.posItemName, recipe.name);
    totalScore += nameScore * 0.6;
    totalWeight += 0.6;

    // Code similarity (weight: 0.3)
    if (posItem.posItemCode && recipe.recipeCode) {
      const codeScore = this.calculateNameSimilarity(posItem.posItemCode, recipe.recipeCode);
      totalScore += codeScore * 0.3;
      totalWeight += 0.3;
    }

    // Description similarity (weight: 0.1)
    if (posItem.description && recipe.description) {
      const descScore = this.calculateNameSimilarity(posItem.description, recipe.description);
      totalScore += descScore * 0.1;
      totalWeight += 0.1;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private async getExistingTransactionIds(context: CalculationContext): Promise<string[]> {
    // This would query the database for existing POS transaction IDs
    // For now, return empty array
    return [];
  }

  private async createImportBatchRecord(batch: SalesDataImportBatch, context: CalculationContext): Promise<void> {
    // This would create a record in the database for the import batch
    console.log(`[${this.serviceName}] Created import batch record:`, batch.batchId);
  }

  private async getActiveSources(context: CalculationContext): Promise<string[]> {
    // This would query the database for active POS data sources
    return ['pos_system_1', 'pos_system_2'];
  }

  private async syncSourceData(
    source: string,
    date: Date,
    batchSize: number,
    retryFailed: boolean,
    context: CalculationContext
  ): Promise<{ recordsProcessed: number; errorCount: number; status: 'completed' | 'failed' }> {
    // This would implement the actual data synchronization logic
    // For now, return mock results
    return {
      recordsProcessed: Math.floor(Math.random() * 1000) + 100,
      errorCount: Math.floor(Math.random() * 10),
      status: Math.random() > 0.1 ? 'completed' : 'failed'
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create POS Integration Service instance with default configuration
 */
export function createPOSIntegrationService(cache: EnhancedCacheLayer): POSIntegrationService {
  return new POSIntegrationService(
    cache,
    process.env.POS_IMPORT_BATCH_SIZE ? parseInt(process.env.POS_IMPORT_BATCH_SIZE) : 1000,
    process.env.POS_SYNC_MAX_RETRIES ? parseInt(process.env.POS_SYNC_MAX_RETRIES) : 3,
    process.env.POS_SYNC_INTERVAL_HOURS ? parseInt(process.env.POS_SYNC_INTERVAL_HOURS) : 24
  );
}