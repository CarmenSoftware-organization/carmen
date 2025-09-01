/**
 * Financial Calculations Service Tests
 * 
 * Comprehensive tests for financial calculation functionality including
 * tax calculations, discounts, currency conversions, and line item totals.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FinancialCalculations } from '../calculations/financial-calculations'
import type { Money } from '@/lib/types'

describe('FinancialCalculations', () => {
  let financialCalc: FinancialCalculations

  beforeEach(() => {
    financialCalc = new FinancialCalculations()
  })

  // Helper function to create money objects
  const createMoney = (amount: number, currency: string = 'USD'): Money => ({
    amount,
    currencyCode: currency
  })

  describe('Tax Calculations', () => {
    it('should calculate tax when not included in subtotal', async () => {
      const result = await financialCalc.calculateTax({
        subtotal: createMoney(100),
        taxRate: 10,
        taxIncluded: false
      })

      expect(result.value.subtotal.amount).toBe(100)
      expect(result.value.taxAmount.amount).toBe(10)
      expect(result.value.totalAmount.amount).toBe(110)
      expect(result.value.taxIncluded).toBe(false)
    })

    it('should calculate tax when included in subtotal', async () => {
      const result = await financialCalc.calculateTax({
        subtotal: createMoney(110),
        taxRate: 10,
        taxIncluded: true
      })

      expect(result.value.subtotal.amount).toBeCloseTo(100, 2)
      expect(result.value.taxAmount.amount).toBeCloseTo(10, 2)
      expect(result.value.totalAmount.amount).toBe(110)
      expect(result.value.taxIncluded).toBe(true)
    })

    it('should handle zero tax rate', async () => {
      const result = await financialCalc.calculateTax({
        subtotal: createMoney(100),
        taxRate: 0
      })

      expect(result.value.taxAmount.amount).toBe(0)
      expect(result.value.totalAmount.amount).toBe(100)
    })

    it('should throw error for invalid tax rate', async () => {
      await expect(financialCalc.calculateTax({
        subtotal: createMoney(100),
        taxRate: -5
      })).rejects.toThrow('taxRate must be a number between 0 and 100')
    })
  })

  describe('Discount Calculations', () => {
    it('should calculate percentage discount', async () => {
      const result = await financialCalc.calculateDiscount({
        subtotal: createMoney(100),
        discountRate: 15
      })

      expect(result.value.discountAmount.amount).toBe(15)
      expect(result.value.discountRate).toBe(15)
      expect(result.value.netAmount.amount).toBe(85)
    })

    it('should calculate fixed amount discount', async () => {
      const result = await financialCalc.calculateDiscount({
        subtotal: createMoney(100),
        discountAmount: createMoney(20)
      })

      expect(result.value.discountAmount.amount).toBe(20)
      expect(result.value.discountRate).toBe(20)
      expect(result.value.netAmount.amount).toBe(80)
    })

    it('should handle no discount', async () => {
      const result = await financialCalc.calculateDiscount({
        subtotal: createMoney(100)
      })

      expect(result.value.discountAmount.amount).toBe(0)
      expect(result.value.discountRate).toBe(0)
      expect(result.value.netAmount.amount).toBe(100)
    })

    it('should calculate discount rate from fixed amount', async () => {
      const result = await financialCalc.calculateDiscount({
        subtotal: createMoney(100),
        discountAmount: createMoney(25)
      })

      expect(result.value.discountRate).toBe(25)
    })
  })

  describe('Currency Conversion', () => {
    it('should convert currency with provided rate', async () => {
      const result = await financialCalc.convertCurrency({
        amount: createMoney(100, 'USD'),
        toCurrency: 'EUR',
        exchangeRate: 0.85
      })

      expect(result.value.originalAmount.amount).toBe(100)
      expect(result.value.originalAmount.currencyCode).toBe('USD')
      expect(result.value.convertedAmount.amount).toBe(85)
      expect(result.value.convertedAmount.currencyCode).toBe('EUR')
      expect(result.value.exchangeRate).toBe(0.85)
    })

    it('should handle same currency conversion', async () => {
      const result = await financialCalc.convertCurrency({
        amount: createMoney(100, 'USD'),
        toCurrency: 'USD'
      })

      expect(result.value.exchangeRate).toBe(1.0)
      expect(result.value.convertedAmount.amount).toBe(100)
      expect(result.value.rateSource).toBe('SAME_CURRENCY')
    })

    it('should handle case insensitive currency codes', async () => {
      const result = await financialCalc.convertCurrency({
        amount: createMoney(100, 'USD'),
        toCurrency: 'usd'
      })

      expect(result.value.convertedAmount.currencyCode).toBe('USD')
    })
  })

  describe('Line Item Calculations', () => {
    it('should calculate complete line item with tax and discount', async () => {
      const result = await financialCalc.calculateLineItemTotal({
        quantity: 5,
        unitPrice: createMoney(20),
        taxRate: 10,
        discountRate: 15,
        taxIncluded: false
      })

      const expected = result.value
      expect(expected.subtotal.amount).toBe(100) // 5 * 20
      expect(expected.discountAmount.amount).toBe(15) // 15% of 100
      expect(expected.netAmount.amount).toBe(85) // 100 - 15
      expect(expected.taxAmount.amount).toBe(8.5) // 10% of 85
      expect(expected.totalAmount.amount).toBe(93.5) // 85 + 8.5
    })

    it('should calculate line item with fixed discount amount', async () => {
      const result = await financialCalc.calculateLineItemTotal({
        quantity: 2,
        unitPrice: createMoney(50),
        taxRate: 8,
        discountAmount: createMoney(10)
      })

      expect(result.value.subtotal.amount).toBe(100)
      expect(result.value.discountAmount.amount).toBe(10)
      expect(result.value.netAmount.amount).toBe(90)
      expect(result.value.taxAmount.amount).toBe(7.2) // 8% of 90
    })

    it('should handle line item without discounts or tax', async () => {
      const result = await financialCalc.calculateLineItemTotal({
        quantity: 3,
        unitPrice: createMoney(25)
      })

      expect(result.value.subtotal.amount).toBe(75)
      expect(result.value.discountAmount.amount).toBe(0)
      expect(result.value.netAmount.amount).toBe(75)
      expect(result.value.taxAmount.amount).toBe(0)
      expect(result.value.totalAmount.amount).toBe(75)
    })
  })

  describe('Money Operations', () => {
    it('should add multiple money amounts', async () => {
      const amounts = [
        createMoney(25),
        createMoney(50),
        createMoney(25)
      ]

      const result = await financialCalc.addMoney(amounts)
      expect(result.value.amount).toBe(100)
      expect(result.value.currencyCode).toBe('USD')
    })

    it('should throw error for currency mismatch in addition', async () => {
      const amounts = [
        createMoney(25, 'USD'),
        createMoney(50, 'EUR')
      ]

      await expect(financialCalc.addMoney(amounts))
        .rejects.toThrow('All amounts must be in the same currency')
    })

    it('should calculate percentage of amount', async () => {
      const result = await financialCalc.calculatePercentage(
        createMoney(200),
        15
      )

      expect(result.value.amount).toBe(30)
    })

    it('should compare money amounts', async () => {
      const amount1 = createMoney(100)
      const amount2 = createMoney(150)
      const amount3 = createMoney(100)

      const result1 = await financialCalc.compareMoney(amount1, amount2)
      expect(result1.value).toBe(-1) // less than

      const result2 = await financialCalc.compareMoney(amount2, amount1)
      expect(result2.value).toBe(1) // greater than

      const result3 = await financialCalc.compareMoney(amount1, amount3)
      expect(result3.value).toBe(0) // equal
    })
  })

  describe('Error Handling', () => {
    it('should validate money objects', async () => {
      await expect(financialCalc.calculateTax({
        subtotal: null as any,
        taxRate: 10
      })).rejects.toThrow('subtotal is required')

      await expect(financialCalc.calculateTax({
        subtotal: { amount: NaN, currencyCode: 'USD' },
        taxRate: 10
      })).rejects.toThrow('subtotal.amount must be a valid number')

      await expect(financialCalc.calculateTax({
        subtotal: { amount: 100, currencyCode: '' },
        taxRate: 10
      })).rejects.toThrow('subtotal.currencyCode is required')
    })

    it('should validate percentage values', async () => {
      await expect(financialCalc.calculateTax({
        subtotal: createMoney(100),
        taxRate: 150
      })).rejects.toThrow('taxRate must be a number between 0 and 100')
    })

    it('should validate positive numbers', async () => {
      await expect(financialCalc.calculateLineItemTotal({
        quantity: -1,
        unitPrice: createMoney(100)
      })).rejects.toThrow('quantity must be a positive number')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small amounts', async () => {
      const result = await financialCalc.calculateTax({
        subtotal: createMoney(0.01),
        taxRate: 5
      })

      expect(result.value.taxAmount.amount).toBeCloseTo(0.0005, 4)
    })

    it('should handle high precision calculations', async () => {
      const result = await financialCalc.calculateDiscount({
        subtotal: createMoney(99.99),
        discountRate: 33.33
      })

      expect(result.value.discountAmount.amount).toBeCloseTo(33.33, 2)
    })

    it('should round money amounts properly', async () => {
      const result = await financialCalc.calculateTax({
        subtotal: createMoney(10.005),
        taxRate: 10
      })

      // Tax should be properly rounded
      expect(result.value.taxAmount.amount).toBeCloseTo(1, 2)
    })
  })
})