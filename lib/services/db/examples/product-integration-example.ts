/**
 * Product Service Integration Example
 * 
 * Demonstrates how to use the product service with real-world scenarios
 * including CRUD operations, inventory calculations, and error handling.
 */

import { productService, type CreateProductInput, type UpdateProductInput, type ProductFilters } from '../product-service'
import type { ProductType, ProductStatus } from '@/lib/types/product'
import type { Money } from '@/lib/types/common'

/**
 * Example: Complete Product Management Workflow
 */
export class ProductManagementExample {

  /**
   * Example 1: Create a new raw material product
   */
  async createRawMaterialProduct() {
    console.log('=== Creating Raw Material Product ===')
    
    const productData: CreateProductInput = {
      productName: 'High-Grade Steel Sheet',
      displayName: 'Steel Sheet - Premium Grade',
      description: 'High-quality steel sheet for manufacturing applications. Meets ASTM standards for strength and durability.',
      shortDescription: 'Premium steel sheet for manufacturing',
      productType: 'raw_material',
      status: 'active',
      categoryId: 'cat-metals-001', // Assuming metals category exists
      subcategoryId: 'subcat-steel-001',
      specifications: [
        {
          name: 'Thickness',
          value: '2.0',
          unit: 'mm',
          category: 'Physical',
          isRequired: true,
          displayOrder: 1
        },
        {
          name: 'Grade',
          value: 'ASTM A36',
          category: 'Material',
          isRequired: true,
          displayOrder: 2
        },
        {
          name: 'Surface Finish',
          value: 'Hot Rolled',
          category: 'Manufacturing',
          isRequired: false,
          displayOrder: 3
        }
      ],
      baseUnit: 'sqm',
      alternativeUnits: [
        {
          unit: 'sheet',
          conversionFactor: 2.4, // 2.4 sqm per standard sheet
          isActive: true,
          isPurchaseUnit: true,
          isSalesUnit: false,
          isInventoryUnit: false,
          barcode: '1234567890123'
        },
        {
          unit: 'kg',
          conversionFactor: 0.157, // kg per sqm (based on thickness and density)
          isActive: true,
          isPurchaseUnit: false,
          isSalesUnit: false,
          isInventoryUnit: true
        }
      ],
      isInventoried: true,
      isSerialTrackingRequired: false,
      isBatchTrackingRequired: true,
      shelfLifeDays: undefined, // No expiry for steel
      storageConditions: 'Dry environment, protected from moisture and corrosion',
      handlingInstructions: 'Use proper lifting equipment. Wear protective gear when handling.',
      isPurchasable: true,
      isSellable: false,
      defaultVendorId: 'vendor-steel-supplier-001',
      minimumOrderQuantity: 10,
      maximumOrderQuantity: 1000,
      standardOrderQuantity: 100,
      leadTimeDays: 14,
      standardCost: {
        amount: 85.50,
        currency: 'USD'
      },
      weight: 15.7, // kg per sqm
      weightUnit: 'kg',
      dimensions: {
        length: 2000,
        width: 1000,
        height: 2,
        unit: 'mm'
      },
      color: 'Metallic Gray',
      material: 'Carbon Steel',
      hazardousClassification: undefined,
      regulatoryApprovals: ['ASTM A36', 'ISO 9001'],
      safetyDataSheetUrl: 'https://example.com/sds/steel-sheet-a36.pdf',
      keywords: ['steel', 'sheet', 'metal', 'raw material', 'ASTM A36', 'manufacturing'],
      tags: ['high-grade', 'structural', 'durable'],
      notes: 'Preferred supplier: SteelCorp Inc. Regular quality inspections required.',
      createdBy: 'user-procurement-manager'
    }

    try {
      const result = await productService.createProduct(productData)
      
      if (result.success) {
        console.log('✅ Product created successfully:', result.data?.productCode)
        console.log('   Product ID:', result.data?.id)
        console.log('   Product Name:', result.data?.productName)
        console.log('   Standard Cost:', result.data?.standardCost)
        return result.data
      } else {
        console.error('❌ Failed to create product:', result.error)
        return null
      }
    } catch (error) {
      console.error('💥 Exception creating product:', error)
      return null
    }
  }

  /**
   * Example 2: Search and filter products
   */
  async searchProducts() {
    console.log('\n=== Searching Products ===')
    
    // Search for active raw materials in metals category
    const filters: ProductFilters = {
      search: 'steel',
      productType: ['raw_material'],
      status: ['active'],
      isInventoried: true,
      isPurchasable: true,
      priceRange: {
        min: 50,
        max: 200,
        currency: 'USD'
      }
    }

    const pagination = {
      page: 1,
      limit: 10,
      sortBy: 'product_name' as const,
      sortOrder: 'asc' as const
    }

    try {
      const result = await productService.getProducts(filters, pagination)
      
      if (result.success) {
        console.log(`✅ Found ${result.data?.length} products`)
        console.log('   Total products matching filter:', result.metadata?.total)
        
        result.data?.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.productCode} - ${product.productName}`)
          console.log(`      Status: ${product.status}, Type: ${product.productType}`)
          console.log(`      Standard Cost: ${product.standardCost?.amount} ${product.standardCost?.currency}`)
        })
        
        return result.data
      } else {
        console.error('❌ Failed to search products:', result.error)
        return []
      }
    } catch (error) {
      console.error('💥 Exception searching products:', error)
      return []
    }
  }

  /**
   * Example 3: Update product with cost and specification changes
   */
  async updateProductCosts(productId: string) {
    console.log('\n=== Updating Product Costs ===')
    
    const updateData: UpdateProductInput = {
      standardCost: {
        amount: 92.75, // Price increase
        currency: 'USD'
      },
      lastPurchaseCost: {
        amount: 88.50,
        currency: 'USD'
      },
      averageCost: {
        amount: 90.25,
        currency: 'USD'
      },
      leadTimeDays: 10, // Improved lead time
      notes: 'Updated pricing as of Q1 2024. Supplier improved lead times.',
      updatedBy: 'user-purchasing-agent'
    }

    try {
      const result = await productService.updateProduct(productId, updateData)
      
      if (result.success) {
        console.log('✅ Product updated successfully')
        console.log('   New Standard Cost:', result.data?.standardCost)
        console.log('   New Lead Time:', result.data?.leadTimeDays, 'days')
        return result.data
      } else {
        console.error('❌ Failed to update product:', result.error)
        return null
      }
    } catch (error) {
      console.error('💥 Exception updating product:', error)
      return null
    }
  }

  /**
   * Example 4: Calculate inventory metrics for a product
   */
  async calculateInventoryMetrics(productId: string) {
    console.log('\n=== Calculating Inventory Metrics ===')
    
    try {
      const result = await productService.calculateProductInventoryMetrics(productId)
      
      if (result.success) {
        const metrics = result.data!
        console.log('✅ Inventory metrics calculated:')
        console.log(`   Current Stock: ${metrics.currentStock} units`)
        console.log(`   Average Cost: ${metrics.averageCost?.amount} ${metrics.averageCost?.currency}`)
        console.log(`   Total Value: ${metrics.totalValue?.amount} ${metrics.totalValue?.currency}`)
        console.log(`   Reorder Point: ${metrics.reorderPoint} units`)
        console.log(`   Stock Status: ${metrics.stockStatus}`)
        
        // Provide recommendations based on stock status
        switch (metrics.stockStatus) {
          case 'out_of_stock':
            console.log('⚠️  URGENT: Product is out of stock!')
            break
          case 'low_stock':
            console.log('⚠️  WARNING: Product stock is low. Consider reordering.')
            break
          case 'overstock':
            console.log('ℹ️  INFO: Product may be overstocked. Review ordering patterns.')
            break
          case 'in_stock':
            console.log('✅ Stock levels are healthy.')
            break
        }
        
        return metrics
      } else {
        console.error('❌ Failed to calculate inventory metrics:', result.error)
        return null
      }
    } catch (error) {
      console.error('💥 Exception calculating inventory metrics:', error)
      return null
    }
  }

  /**
   * Example 5: Get dashboard statistics
   */
  async getDashboardStatistics() {
    console.log('\n=== Getting Dashboard Statistics ===')
    
    try {
      const result = await productService.getProductStatistics()
      
      if (result.success) {
        const stats = result.data!
        console.log('✅ Product statistics:')
        console.log(`   Total Products: ${stats.total}`)
        console.log(`   Active: ${stats.active}`)
        console.log(`   Inactive: ${stats.inactive}`)
        console.log(`   Discontinued: ${stats.discontinued}`)
        
        console.log('\n   By Product Type:')
        Object.entries(stats.byType).forEach(([type, count]) => {
          console.log(`   - ${type}: ${count}`)
        })
        
        console.log('\n   By Category:')
        Object.entries(stats.byCategory).forEach(([categoryId, count]) => {
          console.log(`   - ${categoryId}: ${count}`)
        })
        
        if (stats.totalValue) {
          console.log(`\n   Total Inventory Value: ${stats.totalValue.amount} ${stats.totalValue.currency}`)
        }
        if (stats.averageValue) {
          console.log(`   Average Product Value: ${stats.averageValue.amount} ${stats.averageValue.currency}`)
        }
        
        return stats
      } else {
        console.error('❌ Failed to get statistics:', result.error)
        return null
      }
    } catch (error) {
      console.error('💥 Exception getting statistics:', error)
      return null
    }
  }

  /**
   * Example 6: Product lifecycle management
   */
  async manageProductLifecycle(productId: string) {
    console.log('\n=== Managing Product Lifecycle ===')
    
    // Get current product status
    const productResult = await productService.getProductById(productId)
    if (!productResult.success) {
      console.error('❌ Product not found')
      return
    }

    const product = productResult.data!
    console.log(`Current product status: ${product.status}`)

    // Example lifecycle transitions based on business rules
    let newStatus: ProductStatus | undefined
    let reason = ''

    switch (product.status) {
      case 'draft':
        newStatus = 'pending_approval'
        reason = 'Product specifications finalized, ready for approval'
        break
      
      case 'pending_approval':
        newStatus = 'active'
        reason = 'Product approved by quality assurance team'
        break
      
      case 'active':
        // Check if product should be discontinued (business logic)
        const metrics = await productService.calculateProductInventoryMetrics(productId)
        if (metrics.success && metrics.data?.currentStock === 0) {
          newStatus = 'inactive'
          reason = 'Product temporarily out of stock'
        }
        break
      
      case 'inactive':
        newStatus = 'active'
        reason = 'Stock replenished, product reactivated'
        break
    }

    if (newStatus) {
      const updateResult = await productService.updateProduct(productId, {
        status: newStatus,
        notes: `${product.notes || ''}\n[${new Date().toISOString()}] Status changed to ${newStatus}: ${reason}`,
        updatedBy: 'system-lifecycle-manager'
      })

      if (updateResult.success) {
        console.log(`✅ Product status updated from ${product.status} to ${newStatus}`)
        console.log(`   Reason: ${reason}`)
      } else {
        console.error('❌ Failed to update product status:', updateResult.error)
      }
    } else {
      console.log('ℹ️  No status change required')
    }
  }

  /**
   * Example 7: Bulk operations and error handling
   */
  async performBulkOperations() {
    console.log('\n=== Performing Bulk Operations ===')
    
    // Create multiple products with error handling
    const bulkProducts: CreateProductInput[] = [
      {
        productName: 'Aluminum Sheets',
        productType: 'raw_material',
        categoryId: 'cat-metals-001',
        baseUnit: 'sqm',
        standardCost: { amount: 65.00, currency: 'USD' },
        createdBy: 'bulk-import-system'
      },
      {
        productName: 'Copper Wire',
        productType: 'raw_material',
        categoryId: 'cat-metals-001',
        baseUnit: 'meters',
        standardCost: { amount: 12.50, currency: 'USD' },
        createdBy: 'bulk-import-system'
      },
      {
        productName: 'Invalid Product', // This might fail validation
        productType: 'raw_material',
        categoryId: 'non-existent-category', // Invalid category
        baseUnit: 'units',
        createdBy: 'bulk-import-system'
      }
    ]

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const [index, productData] of bulkProducts.entries()) {
      console.log(`\nCreating product ${index + 1}/${bulkProducts.length}: ${productData.productName}`)
      
      try {
        const result = await productService.createProduct(productData)
        
        if (result.success) {
          console.log(`✅ Success: ${result.data?.productCode}`)
          successCount++
        } else {
          console.log(`❌ Failed: ${result.error}`)
          errorCount++
        }
        
        results.push(result)
      } catch (error) {
        console.log(`💥 Exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
        errorCount++
        results.push({ success: false, error: 'Exception occurred' })
      }
    }

    console.log(`\n📊 Bulk operation summary:`)
    console.log(`   Successful: ${successCount}`)
    console.log(`   Failed: ${errorCount}`)
    console.log(`   Total: ${bulkProducts.length}`)

    return results
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🚀 Starting Product Service Integration Examples\n')
    
    try {
      // 1. Create a new product
      const newProduct = await this.createRawMaterialProduct()
      
      if (newProduct) {
        // 2. Search for products
        await this.searchProducts()
        
        // 3. Update the product we just created
        await this.updateProductCosts(newProduct.id)
        
        // 4. Calculate inventory metrics
        await this.calculateInventoryMetrics(newProduct.id)
        
        // 6. Manage product lifecycle
        await this.manageProductLifecycle(newProduct.id)
      }
      
      // 5. Get dashboard statistics (independent of created product)
      await this.getDashboardStatistics()
      
      // 7. Demonstrate bulk operations
      await this.performBulkOperations()
      
      console.log('\n✅ All examples completed successfully!')
      
    } catch (error) {
      console.error('\n💥 Error running examples:', error)
    }
  }
}

/**
 * Usage example
 */
export async function runProductServiceExamples() {
  const examples = new ProductManagementExample()
  await examples.runAllExamples()
}

/**
 * Quick start example - minimal product creation
 */
export async function quickStartExample() {
  console.log('🚀 Quick Start: Creating a simple product')
  
  const simpleProduct: CreateProductInput = {
    productName: 'Basic Component',
    productType: 'raw_material',
    categoryId: 'default-category', // You'll need a valid category ID
    baseUnit: 'pcs',
    createdBy: 'quick-start-user'
  }
  
  const result = await productService.createProduct(simpleProduct)
  
  if (result.success) {
    console.log('✅ Product created:', result.data?.productCode)
  } else {
    console.log('❌ Failed:', result.error)
  }
}

/**
 * Error handling patterns
 */
export async function errorHandlingExamples() {
  console.log('🚀 Error Handling Examples')
  
  // Example 1: Invalid product data
  console.log('\n1. Testing invalid product data...')
  const invalidProduct: CreateProductInput = {
    productName: '', // Invalid: empty name
    productType: 'raw_material',
    categoryId: 'invalid-category-id', // Invalid: non-existent category
    baseUnit: '',  // Invalid: empty unit
    createdBy: 'test-user'
  }
  
  const result1 = await productService.createProduct(invalidProduct)
  if (!result1.success) {
    console.log('✅ Correctly caught validation error:', result1.error)
  }
  
  // Example 2: Product not found
  console.log('\n2. Testing product not found...')
  const result2 = await productService.getProductById('non-existent-id')
  if (!result2.success) {
    console.log('✅ Correctly handled not found:', result2.error)
  }
  
  // Example 3: Duplicate product code
  console.log('\n3. Testing duplicate product code...')
  // First, create a product
  const firstProduct = await productService.createProduct({
    productCode: 'TEST-DUPLICATE',
    productName: 'First Product',
    productType: 'raw_material',
    categoryId: 'valid-category-id', // You'll need a valid category
    baseUnit: 'pcs',
    createdBy: 'test-user'
  })
  
  if (firstProduct.success) {
    // Try to create another with same code
    const duplicateResult = await productService.createProduct({
      productCode: 'TEST-DUPLICATE', // Same code
      productName: 'Second Product',
      productType: 'raw_material',
      categoryId: 'valid-category-id',
      baseUnit: 'pcs',
      createdBy: 'test-user'
    })
    
    if (!duplicateResult.success) {
      console.log('✅ Correctly prevented duplicate:', duplicateResult.error)
    }
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runProductServiceExamples().catch(console.error)
}