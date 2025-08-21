// Product utility functions for resolving products based on selection criteria
import { ProductSelection } from '../types'
import { mockProducts, mockCategories, Product, ProductCategory } from './mock-data'

export interface ResolvedProductInfo {
  product: Product
  categoryName: string
  subcategoryName: string
  itemGroupName?: string
}

/**
 * Resolves products based on product selection criteria
 * @param productSelection - The product selection configuration
 * @returns Array of products that match the selection criteria
 */
export function resolveProducts(productSelection: ProductSelection): Product[] {
  // Include products based on selections
  const selectedProducts = new Set<string>()
  
  // Add products from selected categories
  productSelection.categories.forEach(categoryId => {
    mockProducts.filter(p => p.category === categoryId).forEach(p => selectedProducts.add(p.id))
  })
  
  // Add products from selected subcategories
  productSelection.subcategories.forEach(subcategoryId => {
    mockProducts.filter(p => p.subcategory === subcategoryId).forEach(p => selectedProducts.add(p.id))
  })
  
  // Add products from selected item groups
  productSelection.itemGroups.forEach(itemGroupId => {
    mockProducts.filter(p => p.itemGroup === itemGroupId).forEach(p => selectedProducts.add(p.id))
  })
  
  // Add specifically selected products
  productSelection.specificItems.forEach(productId => {
    selectedProducts.add(productId)
  })
  
  return mockProducts.filter(p => selectedProducts.has(p.id))
}

/**
 * Gets detailed information about resolved products including hierarchy names
 * @param productSelection - The product selection configuration
 * @returns Array of resolved product information with category/subcategory/item group names
 */
export function resolveProductsWithInfo(productSelection: ProductSelection): ResolvedProductInfo[] {
  const products = resolveProducts(productSelection)
  
  return products.map(product => {
    const category = mockCategories.find(cat => cat.id === product.category)
    const subcategory = category?.subcategories.find(sub => sub.id === product.subcategory)
    const itemGroup = subcategory?.itemGroups?.find(ig => ig.id === product.itemGroup)
    
    return {
      product,
      categoryName: category?.name || product.category,
      subcategoryName: subcategory?.name || product.subcategory,
      itemGroupName: itemGroup?.name
    }
  })
}

/**
 * Gets readable names for category, subcategory, and item group IDs
 */
export function getCategoryName(categoryId: string): string {
  return mockCategories.find(cat => cat.id === categoryId)?.name || categoryId
}

export function getSubcategoryName(subcategoryId: string): string {
  for (const category of mockCategories) {
    const subcategory = category.subcategories.find(sub => sub.id === subcategoryId)
    if (subcategory) return subcategory.name
  }
  return subcategoryId
}

export function getItemGroupName(itemGroupId: string): string {
  for (const category of mockCategories) {
    for (const subcategory of category.subcategories) {
      const itemGroup = subcategory.itemGroups?.find(ig => ig.id === itemGroupId)
      if (itemGroup) return itemGroup.name
    }
  }
  return itemGroupId
}

export function getProductName(productId: string): string {
  return mockProducts.find(prod => prod.id === productId)?.name || productId
}