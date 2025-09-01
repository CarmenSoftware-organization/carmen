/**
 * Base Calculator Service
 * 
 * Abstract base class providing common calculation functionality and patterns.
 * All calculation services inherit from this base to ensure consistency.
 */

import { Money } from '@/lib/types'

/**
 * Calculation result with metadata
 */
export interface CalculationResult<T = any> {
  value: T;
  calculatedAt: Date;
  calculationId: string;
  confidence: number; // 0-1, indicates reliability of calculation
  metadata?: Record<string, any>;
  warnings?: string[];
  errors?: string[];
}

/**
 * Calculation context for auditing and debugging
 */
export interface CalculationContext {
  calculationId: string;
  userId?: string;
  timestamp: Date;
  source: string; // Which service/method performed the calculation
  inputs: Record<string, any>;
  cacheable: boolean;
  cacheKey?: string;
  cacheTtl?: number; // TTL in seconds
}

/**
 * Base calculation error
 */
export class CalculationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: CalculationContext,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'CalculationError';
  }
}

/**
 * Abstract base calculator
 */
export abstract class BaseCalculator {
  protected abstract serviceName: string;
  protected defaultCacheTtl: number = 300; // 5 minutes

  /**
   * Generate unique calculation ID
   */
  protected generateCalculationId(): string {
    return `calc_${this.serviceName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create calculation context
   */
  protected createContext(
    source: string, 
    inputs: Record<string, any>,
    cacheable: boolean = true,
    cacheTtl?: number,
    userId?: string
  ): CalculationContext {
    const calculationId = this.generateCalculationId();
    return {
      calculationId,
      userId,
      timestamp: new Date(),
      source: `${this.serviceName}.${source}`,
      inputs,
      cacheable,
      cacheKey: cacheable ? this.generateCacheKey(source, inputs) : undefined,
      cacheTtl: cacheTtl ?? this.defaultCacheTtl
    };
  }

  /**
   * Generate cache key from source and inputs
   */
  protected generateCacheKey(source: string, inputs: Record<string, any>): string {
    const inputsHash = Buffer.from(JSON.stringify(inputs)).toString('base64');
    return `${this.serviceName}:${source}:${inputsHash}`;
  }

  /**
   * Create successful calculation result
   */
  protected createResult<T>(
    value: T,
    context: CalculationContext,
    confidence: number = 1.0,
    metadata?: Record<string, any>,
    warnings?: string[]
  ): CalculationResult<T> {
    return {
      value,
      calculatedAt: context.timestamp,
      calculationId: context.calculationId,
      confidence,
      metadata,
      warnings
    };
  }

  /**
   * Create error result
   */
  protected createError(
    message: string,
    code: string,
    context: CalculationContext,
    cause?: Error
  ): CalculationError {
    return new CalculationError(message, code, context, cause);
  }

  /**
   * Safe division with zero check
   */
  protected safeDivide(numerator: number, denominator: number, defaultValue: number = 0): number {
    if (denominator === 0) {
      return defaultValue;
    }
    return numerator / denominator;
  }

  /**
   * Round money amount to currency decimal places
   */
  protected roundMoney(amount: number, decimalPlaces: number = 2): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(amount * factor) / factor;
  }

  /**
   * Validate money object
   */
  protected validateMoney(money: Money, fieldName: string): void {
    if (!money) {
      throw this.createError(
        `${fieldName} is required`,
        'INVALID_MONEY_OBJECT',
        this.createContext('validateMoney', { money, fieldName }, false)
      );
    }
    
    if (typeof money.amount !== 'number' || isNaN(money.amount)) {
      throw this.createError(
        `${fieldName}.amount must be a valid number`,
        'INVALID_MONEY_AMOUNT',
        this.createContext('validateMoney', { money, fieldName }, false)
      );
    }

    if (!money.currencyCode || typeof money.currencyCode !== 'string') {
      throw this.createError(
        `${fieldName}.currencyCode is required`,
        'INVALID_CURRENCY_CODE',
        this.createContext('validateMoney', { money, fieldName }, false)
      );
    }
  }

  /**
   * Create money object
   */
  protected createMoney(amount: number, currencyCode: string, decimalPlaces: number = 2): Money {
    return {
      amount: this.roundMoney(amount, decimalPlaces),
      currencyCode: currencyCode.toUpperCase()
    };
  }

  /**
   * Validate percentage (0-100)
   */
  protected validatePercentage(value: number, fieldName: string): void {
    if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
      throw this.createError(
        `${fieldName} must be a number between 0 and 100`,
        'INVALID_PERCENTAGE',
        this.createContext('validatePercentage', { value, fieldName }, false)
      );
    }
  }

  /**
   * Validate positive number
   */
  protected validatePositive(value: number, fieldName: string): void {
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      throw this.createError(
        `${fieldName} must be a positive number`,
        'INVALID_POSITIVE_NUMBER',
        this.createContext('validatePositive', { value, fieldName }, false)
      );
    }
  }

  /**
   * Log calculation for debugging
   */
  protected logCalculation(context: CalculationContext, result: any, executionTimeMs?: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${context.calculationId}] ${context.source}:`, {
        inputs: context.inputs,
        result: typeof result === 'object' ? JSON.stringify(result) : result,
        executionTime: executionTimeMs ? `${executionTimeMs}ms` : 'N/A',
        cached: !!context.cacheKey
      });
    }
  }

  /**
   * Execute calculation with error handling and logging
   */
  protected async executeCalculation<T>(
    source: string,
    inputs: Record<string, any>,
    calculationFn: (context: CalculationContext) => Promise<T> | T,
    cacheable: boolean = true,
    userId?: string
  ): Promise<CalculationResult<T>> {
    const startTime = Date.now();
    const context = this.createContext(source, inputs, cacheable, undefined, userId);

    try {
      const result = await calculationFn(context);
      const executionTime = Date.now() - startTime;
      
      this.logCalculation(context, result, executionTime);
      
      return this.createResult(result, context, 1.0, { executionTime });
    } catch (error) {
      if (error instanceof CalculationError) {
        throw error;
      }
      
      throw this.createError(
        `Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CALCULATION_FAILED',
        context,
        error instanceof Error ? error : undefined
      );
    }
  }
}