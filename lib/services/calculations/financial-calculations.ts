/**
 * Financial Calculations Service
 * 
 * Handles all financial calculations including taxes, discounts, 
 * currency conversions, and money operations.
 */

import { Money, ExchangeRate, Currency } from '@/lib/types'
import { BaseCalculator, CalculationResult } from './base-calculator'

/**
 * Tax calculation input
 */
export interface TaxCalculationInput {
  subtotal: Money;
  taxRate: number; // as percentage (e.g., 7 for 7%)
  taxIncluded?: boolean;
  currencyCode?: string;
}

/**
 * Tax calculation result
 */
export interface TaxCalculationResult {
  subtotal: Money;
  taxAmount: Money;
  taxRate: number;
  totalAmount: Money;
  taxIncluded: boolean;
}

/**
 * Discount calculation input
 */
export interface DiscountCalculationInput {
  subtotal: Money;
  discountRate?: number; // as percentage
  discountAmount?: Money; // fixed amount
  currencyCode?: string;
}

/**
 * Discount calculation result
 */
export interface DiscountCalculationResult {
  subtotal: Money;
  discountRate: number;
  discountAmount: Money;
  netAmount: Money;
}

/**
 * Currency conversion input
 */
export interface CurrencyConversionInput {
  amount: Money;
  toCurrency: string;
  exchangeRate?: number;
  conversionDate?: Date;
}

/**
 * Currency conversion result
 */
export interface CurrencyConversionResult {
  originalAmount: Money;
  convertedAmount: Money;
  exchangeRate: number;
  conversionDate: Date;
  rateSource?: string;
}

/**
 * Line item total calculation input
 */
export interface LineItemCalculationInput {
  quantity: number;
  unitPrice: Money;
  taxRate?: number;
  discountRate?: number;
  discountAmount?: Money;
  taxIncluded?: boolean;
  currencyCode?: string;
}

/**
 * Line item total calculation result
 */
export interface LineItemCalculationResult {
  quantity: number;
  unitPrice: Money;
  subtotal: Money;
  discountAmount: Money;
  discountRate: number;
  netAmount: Money;
  taxAmount: Money;
  taxRate: number;
  totalAmount: Money;
}

export class FinancialCalculations extends BaseCalculator {
  protected serviceName = 'FinancialCalculations';

  /**
   * Calculate tax amount and total
   */
  async calculateTax(input: TaxCalculationInput): Promise<CalculationResult<TaxCalculationResult>> {
    return this.executeCalculation('calculateTax', input, async (context) => {
      this.validateMoney(input.subtotal, 'subtotal');
      this.validatePercentage(input.taxRate, 'taxRate');

      const { subtotal, taxRate, taxIncluded = false } = input;
      const currencyCode = input.currencyCode || subtotal.currencyCode;

      let taxAmount: Money;
      let netSubtotal: Money;
      let totalAmount: Money;

      if (taxIncluded) {
        // Tax is included in subtotal, extract it
        const taxMultiplier = 1 + (taxRate / 100);
        const netAmount = subtotal.amount / taxMultiplier;
        const tax = subtotal.amount - netAmount;

        netSubtotal = this.createMoney(netAmount, currencyCode);
        taxAmount = this.createMoney(tax, currencyCode);
        totalAmount = subtotal;
      } else {
        // Tax is additional to subtotal
        const tax = subtotal.amount * (taxRate / 100);
        
        netSubtotal = subtotal;
        taxAmount = this.createMoney(tax, currencyCode);
        totalAmount = this.createMoney(subtotal.amount + tax, currencyCode);
      }

      return {
        subtotal: netSubtotal,
        taxAmount,
        taxRate,
        totalAmount,
        taxIncluded
      };
    });
  }

  /**
   * Calculate discount amount and net amount
   */
  async calculateDiscount(input: DiscountCalculationInput): Promise<CalculationResult<DiscountCalculationResult>> {
    return this.executeCalculation('calculateDiscount', input, async (context) => {
      this.validateMoney(input.subtotal, 'subtotal');

      const { subtotal } = input;
      const currencyCode = input.currencyCode || subtotal.currencyCode;

      let discountAmount: Money;
      let discountRate: number;

      if (input.discountAmount) {
        // Fixed discount amount provided
        this.validateMoney(input.discountAmount, 'discountAmount');
        discountAmount = input.discountAmount;
        discountRate = this.safeDivide(discountAmount.amount * 100, subtotal.amount, 0);
      } else if (input.discountRate !== undefined) {
        // Percentage discount provided
        this.validatePercentage(input.discountRate, 'discountRate');
        discountRate = input.discountRate;
        const discountValue = subtotal.amount * (discountRate / 100);
        discountAmount = this.createMoney(discountValue, currencyCode);
      } else {
        // No discount
        discountRate = 0;
        discountAmount = this.createMoney(0, currencyCode);
      }

      const netAmount = this.createMoney(
        subtotal.amount - discountAmount.amount,
        currencyCode
      );

      return {
        subtotal,
        discountRate,
        discountAmount,
        netAmount
      };
    });
  }

  /**
   * Convert currency amount
   */
  async convertCurrency(input: CurrencyConversionInput): Promise<CalculationResult<CurrencyConversionResult>> {
    return this.executeCalculation('convertCurrency', input, async (context) => {
      this.validateMoney(input.amount, 'amount');
      
      if (!input.toCurrency) {
        throw this.createError(
          'Target currency is required',
          'MISSING_TARGET_CURRENCY',
          context
        );
      }

      const { amount, toCurrency } = input;
      
      // If same currency, no conversion needed
      if (amount.currencyCode === toCurrency.toUpperCase()) {
        return {
          originalAmount: amount,
          convertedAmount: amount,
          exchangeRate: 1.0,
          conversionDate: new Date(),
          rateSource: 'SAME_CURRENCY'
        };
      }

      let exchangeRate: number;
      let rateSource = 'PROVIDED';
      const conversionDate = input.conversionDate || new Date();

      if (input.exchangeRate) {
        exchangeRate = input.exchangeRate;
        this.validatePositive(exchangeRate, 'exchangeRate');
      } else {
        // In a real implementation, this would fetch from exchange rate service
        // For now, we'll use a mock rate
        exchangeRate = 1.0;
        rateSource = 'MOCK_RATE';
      }

      const convertedValue = amount.amount * exchangeRate;
      const convertedAmount = this.createMoney(convertedValue, toCurrency);

      return {
        originalAmount: amount,
        convertedAmount,
        exchangeRate,
        conversionDate,
        rateSource
      };
    });
  }

  /**
   * Calculate complete line item totals with tax and discount
   */
  async calculateLineItemTotal(input: LineItemCalculationInput): Promise<CalculationResult<LineItemCalculationResult>> {
    return this.executeCalculation('calculateLineItemTotal', input, async (context) => {
      this.validatePositive(input.quantity, 'quantity');
      this.validateMoney(input.unitPrice, 'unitPrice');

      const {
        quantity,
        unitPrice,
        taxRate = 0,
        discountRate = 0,
        discountAmount,
        taxIncluded = false
      } = input;

      const currencyCode = input.currencyCode || unitPrice.currencyCode;

      // Calculate subtotal
      const subtotalValue = quantity * unitPrice.amount;
      const subtotal = this.createMoney(subtotalValue, currencyCode);

      // Calculate discount
      const discountInput: DiscountCalculationInput = {
        subtotal,
        discountRate,
        discountAmount,
        currencyCode
      };
      const discountResult = await this.calculateDiscount(discountInput);

      // Calculate tax on net amount (after discount)
      const taxInput: TaxCalculationInput = {
        subtotal: discountResult.value.netAmount,
        taxRate,
        taxIncluded,
        currencyCode
      };
      const taxResult = await this.calculateTax(taxInput);

      return {
        quantity,
        unitPrice,
        subtotal,
        discountAmount: discountResult.value.discountAmount,
        discountRate: discountResult.value.discountRate,
        netAmount: discountResult.value.netAmount,
        taxAmount: taxResult.value.taxAmount,
        taxRate: taxResult.value.taxRate,
        totalAmount: taxResult.value.totalAmount
      };
    });
  }

  /**
   * Add multiple money amounts (must be same currency)
   */
  async addMoney(amounts: Money[]): Promise<CalculationResult<Money>> {
    return this.executeCalculation('addMoney', { amounts }, async (context) => {
      if (!amounts || amounts.length === 0) {
        throw this.createError(
          'At least one amount is required',
          'NO_AMOUNTS_PROVIDED',
          context
        );
      }

      const baseCurrency = amounts[0].currencyCode;
      let total = 0;

      for (let i = 0; i < amounts.length; i++) {
        const amount = amounts[i];
        this.validateMoney(amount, `amounts[${i}]`);
        
        if (amount.currencyCode !== baseCurrency) {
          throw this.createError(
            `All amounts must be in the same currency. Expected ${baseCurrency}, got ${amount.currencyCode} at index ${i}`,
            'CURRENCY_MISMATCH',
            context
          );
        }

        total += amount.amount;
      }

      return this.createMoney(total, baseCurrency);
    });
  }

  /**
   * Calculate percentage of an amount
   */
  async calculatePercentage(amount: Money, percentage: number): Promise<CalculationResult<Money>> {
    return this.executeCalculation('calculatePercentage', { amount, percentage }, async (context) => {
      this.validateMoney(amount, 'amount');
      this.validatePercentage(percentage, 'percentage');

      const result = amount.amount * (percentage / 100);
      return this.createMoney(result, amount.currencyCode);
    });
  }

  /**
   * Compare two money amounts (returns -1, 0, 1)
   */
  async compareMoney(amount1: Money, amount2: Money): Promise<CalculationResult<number>> {
    return this.executeCalculation('compareMoney', { amount1, amount2 }, async (context) => {
      this.validateMoney(amount1, 'amount1');
      this.validateMoney(amount2, 'amount2');

      if (amount1.currencyCode !== amount2.currencyCode) {
        throw this.createError(
          `Cannot compare amounts in different currencies: ${amount1.currencyCode} vs ${amount2.currencyCode}`,
          'CURRENCY_MISMATCH',
          context
        );
      }

      if (amount1.amount < amount2.amount) return -1;
      if (amount1.amount > amount2.amount) return 1;
      return 0;
    });
  }
}