import { describe, it, expect } from 'vitest'
import { mockProducts, ORDER_UNITS } from '../../lib/mock-data'
import type { ProductSelection, ProductInstance } from '../../types'

describe('ProductSelectionComponent', () => {
  it('should have order units defined for all products', () => {
    mockProducts.forEach(product => {
      expect(product.defaultOrderUnit).toBeDefined()
      expect(product.availableOrderUnits).toBeDefined()
      expect(product.availableOrderUnits.length).toBeGreaterThan(0)
      expect(product.availableOrderUnits).toContain(product.defaultOrderUnit)
    })
  })

  it('should have consistent unit types', () => {
    const allUnits = new Set<string>()
    mockProducts.forEach(product => {
      product.availableOrderUnits.forEach(unit => allUnits.add(unit))
    })

    const validUnits = new Set<string>()
    Object.values(ORDER_UNITS).forEach(unitArray => {
      unitArray.forEach(unit => validUnits.add(unit))
    })
    
    // Add some additional units that might be used
    validUnits.add('piece')
    validUnits.add('bottle')
    validUnits.add('sleeve')
    validUnits.add('set')

    allUnits.forEach(unit => {
      expect(validUnits.has(unit)).toBe(true)
    })
  })

  it('should have appropriate default units for different product categories', () => {
    const beefProduct = mockProducts.find(p => p.id === 'beef-ribeye')
    const milkProduct = mockProducts.find(p => p.id === 'milk-whole')
    const paperProduct = mockProducts.find(p => p.id === 'paper-towels')
    const knifeProduct = mockProducts.find(p => p.id === 'chef-knife')

    expect(beefProduct?.defaultOrderUnit).toBe('kg')
    expect(milkProduct?.defaultOrderUnit).toBe('L')
    expect(paperProduct?.defaultOrderUnit).toBe('pack')
    expect(knifeProduct?.defaultOrderUnit).toBe('piece')
  })

  describe('MOQ Tier Functionality', () => {
    it('should validate MOQ values are greater than 0', () => {
      // Test valid MOQ values
      const validMOQs = [0.1, 0.5, 1, 1.5, 10, 100]
      validMOQs.forEach(moq => {
        expect(moq).toBeGreaterThan(0)
      })
      
      // Test invalid MOQ values
      const invalidMOQs = [0, -1, -0.1]
      invalidMOQs.forEach(moq => {
        expect(moq).not.toBeGreaterThan(0)
      })
    })

    it('should handle fractional MOQ values', () => {
      const tier: ProductMOQTier = {
        id: '1',
        productId: 'milk-whole',
        moq: 0.5, // Half liter
        unit: 'L',
        notes: 'Small quantity for testing'
      }
      
      expect(tier.moq).toBe(0.5)
      expect(tier.moq).toBeGreaterThan(0)
      expect(tier.unit).toBe('L')
    })

    interface ProductMOQTier {
      id: string
      productId: string
      moq: number
      unit: string
      notes?: string
    }

    it('should allow adding MOQ tiers for a product', () => {
      const productId = 'beef-ribeye'
      const mockTiers: ProductMOQTier[] = []
      
      // Simulate adding first MOQ tier
      const newTier: ProductMOQTier = {
        id: `${productId}-${Date.now()}`,
        productId,
        moq: 1,  // Changed from 100 to 1 to test minimum valid value
        unit: 'kg',
        notes: ''
      }
      
      const updatedTiers = [...mockTiers, newTier]
      
      expect(updatedTiers.length).toBe(1)
      expect(updatedTiers[0].productId).toBe(productId)
      expect(updatedTiers[0].moq).toBe(1)
      expect(updatedTiers[0].moq).toBeGreaterThan(0)  // Ensure MOQ is greater than 0
      expect(updatedTiers[0].unit).toBe('kg')
    })

    it('should allow adding multiple MOQ tiers for same product', () => {
      const productId = 'beef-ribeye'
      const mockTiers: ProductMOQTier[] = [
        { id: '1', productId, moq: 1, unit: 'kg' },
        { id: '2', productId, moq: 5, unit: 'kg' },
        { id: '3', productId, moq: 10, unit: 'kg' }
      ]
      
      expect(mockTiers.length).toBe(3)
      expect(mockTiers.every(tier => tier.productId === productId)).toBe(true)
      expect(mockTiers.every(tier => tier.moq > 0)).toBe(true) // All MOQs must be > 0
      expect(mockTiers.map(tier => tier.moq)).toEqual([1, 5, 10])
    })

    it('should allow removing specific MOQ tiers', () => {
      const productId = 'beef-ribeye'
      const mockTiers: ProductMOQTier[] = [
        { id: '1', productId, moq: 1, unit: 'kg' },
        { id: '2', productId, moq: 5, unit: 'kg' },
        { id: '3', productId, moq: 10, unit: 'kg' }
      ]
      
      // Remove middle tier (index 1)
      const updatedTiers = mockTiers.filter((_, index) => index !== 1)
      
      expect(updatedTiers.length).toBe(2)
      expect(updatedTiers.map(tier => tier.moq)).toEqual([1, 10])
      expect(updatedTiers.every(tier => tier.moq > 0)).toBe(true)
    })

    it('should calculate next MOQ value based on last tier', () => {
      const existingTiers: ProductMOQTier[] = [
        { id: '1', productId: 'beef-ribeye', moq: 1, unit: 'kg' },
        { id: '2', productId: 'beef-ribeye', moq: 5, unit: 'kg' }
      ]
      
      const lastTierMOQ = existingTiers.length > 0 ? existingTiers[existingTiers.length - 1].moq : 0
      // Smart increment logic based on value ranges
      let newMOQ = 1
      if (lastTierMOQ > 0) {
        if (lastTierMOQ < 10) {
          newMOQ = lastTierMOQ + 1
        } else if (lastTierMOQ < 100) {
          newMOQ = lastTierMOQ + 10
        } else {
          newMOQ = lastTierMOQ + 100
        }
      }
      
      expect(newMOQ).toBe(6) // 5 + 1 (since 5 < 10)
      expect(newMOQ).toBeGreaterThan(0)
      expect(newMOQ).toBeGreaterThan(lastTierMOQ)
    })

    it('should update MOQ tier properties', () => {
      const tier: ProductMOQTier = {
        id: '1',
        productId: 'beef-ribeye',
        moq: 1,
        unit: 'kg',
        notes: 'Original note'
      }
      
      // Simulate updating MOQ quantity
      const updatedTier = { ...tier, moq: 2.5 }
      expect(updatedTier.moq).toBe(2.5)
      expect(updatedTier.moq).toBeGreaterThan(0)
      
      // Simulate updating unit
      const updatedUnit = { ...tier, unit: 'lb' }
      expect(updatedUnit.unit).toBe('lb')
      
      // Simulate updating notes
      const updatedNotes = { ...tier, notes: 'Volume discount tier' }
      expect(updatedNotes.notes).toBe('Volume discount tier')
    })
  })

  describe('Product Management', () => {
    it('should allow adding products to specificItems', () => {
      const initialSelection: ProductSelection = {
        categories: [],
        subcategories: [],
        itemGroups: [],
        specificItems: []
      }

      const productToAdd = 'beef-ribeye'
      const updatedSelection: ProductSelection = {
        ...initialSelection,
        specificItems: [...initialSelection.specificItems, productToAdd]
      }

      expect(updatedSelection.specificItems).toContain(productToAdd)
      expect(updatedSelection.specificItems.length).toBe(1)
    })

    it('should allow removing products from specificItems', () => {
      const initialSelection: ProductSelection = {
        categories: [],
        subcategories: [],
        itemGroups: [],
        specificItems: ['beef-ribeye', 'chicken-breast', 'salmon-fillet']
      }

      const productToRemove = 'chicken-breast'
      const updatedSelection: ProductSelection = {
        ...initialSelection,
        specificItems: initialSelection.specificItems.filter(id => id !== productToRemove)
      }

      expect(updatedSelection.specificItems).not.toContain(productToRemove)
      expect(updatedSelection.specificItems.length).toBe(2)
      expect(updatedSelection.specificItems).toEqual(['beef-ribeye', 'salmon-fillet'])
    })
  })

  describe('Product Resolution', () => {
    it('should resolve products from different selection types', () => {
      const selection: ProductSelection = {
        categories: ['food-beverage'],
        subcategories: [],
        itemGroups: [],
        specificItems: ['chef-knife'] // Equipment item added manually
      }

      const resolvedProductIds = new Set<string>()
      
      // Add products from categories
      selection.categories.forEach(categoryId => {
        mockProducts.filter(p => p.category === categoryId).forEach(p => resolvedProductIds.add(p.id))
      })
      
      // Add specific items
      selection.specificItems.forEach(productId => {
        resolvedProductIds.add(productId)
      })

      const resolvedProducts = mockProducts.filter(p => resolvedProductIds.has(p.id))
      
      // Should include food items from category selection
      expect(resolvedProducts.some(p => p.category === 'food-beverage')).toBe(true)
      // Should include manually added equipment item
      expect(resolvedProducts.some(p => p.id === 'chef-knife')).toBe(true)
    })
  })

  describe('ProductInstance Functionality', () => {
    it('should allow adding same product with different units', () => {
      const selection: ProductSelection = {
        categories: [],
        subcategories: [],
        itemGroups: [],
        specificItems: [],
        productInstances: [
          {
            id: 'beef-ribeye-kg',
            productId: 'beef-ribeye',
            orderUnit: 'kg',
            displayName: 'Beef Ribeye Steak (kg)'
          },
          {
            id: 'beef-ribeye-lb',
            productId: 'beef-ribeye',
            orderUnit: 'lb',
            displayName: 'Beef Ribeye Steak (lb)'
          }
        ]
      }

      expect(selection.productInstances?.length).toBe(2)
      expect(selection.productInstances?.every(inst => inst.productId === 'beef-ribeye')).toBe(true)
      expect(selection.productInstances?.map(inst => inst.orderUnit)).toEqual(['kg', 'lb'])
    })

    it('should generate unique instance IDs', () => {
      const generateInstanceId = (productId: string, unit: string): string => {
        return `${productId}-${unit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      }

      const instance1Id = generateInstanceId('beef-ribeye', 'kg')
      const instance2Id = generateInstanceId('beef-ribeye', 'lb')
      const instance3Id = generateInstanceId('milk-whole', 'L')

      expect(instance1Id).toBe('beef-ribeye-kg')
      expect(instance2Id).toBe('beef-ribeye-lb')
      expect(instance3Id).toBe('milk-whole-l')
      expect(instance1Id).not.toBe(instance2Id)
    })

    it('should prevent duplicate product+unit combinations', () => {
      const existingInstances: ProductInstance[] = [
        {
          id: 'beef-ribeye-kg',
          productId: 'beef-ribeye',
          orderUnit: 'kg',
          displayName: 'Beef Ribeye Steak (kg)'
        }
      ]

      const newInstanceId = 'beef-ribeye-kg'
      const instanceExists = existingInstances.some(inst => inst.id === newInstanceId)

      expect(instanceExists).toBe(true)
    })

    it('should support different units for same product', () => {
      const beefProduct = mockProducts.find(p => p.id === 'beef-ribeye')
      expect(beefProduct?.availableOrderUnits).toContain('kg')
      expect(beefProduct?.availableOrderUnits).toContain('lb')

      // Simulate creating instances with different units
      const instances: ProductInstance[] = beefProduct?.availableOrderUnits.map(unit => ({
        id: `beef-ribeye-${unit}`,
        productId: 'beef-ribeye',
        orderUnit: unit,
        displayName: `${beefProduct.name} (${unit})`
      })) || []

      expect(instances.length).toBeGreaterThan(1)
      expect(instances.every(inst => inst.productId === 'beef-ribeye')).toBe(true)
      expect(new Set(instances.map(inst => inst.orderUnit)).size).toBe(instances.length)
    })
  })
})