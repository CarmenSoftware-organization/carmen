'use client'

// Excel Template Generation Service
// Phase 2 Task 5 - Implement Excel template generation

import { PricelistTemplate, ProductSelection } from '../../types'

export interface ExcelTemplateConfig {
  includeInstructions: boolean
  includeProductHierarchy: boolean
  includeSampleData: boolean
  templateFormat: 'standard' | 'compact' | 'detailed'
  currency: string
  allowMultiMOQ: boolean
  requireLeadTime: boolean
}

export interface ExcelColumn {
  key: string
  header: string
  width?: number
  type: 'text' | 'number' | 'currency' | 'date' | 'select'
  required?: boolean
  validation?: {
    type: 'list' | 'decimal' | 'whole' | 'date' | 'textLength'
    formula?: string
    source?: string[]
    minimum?: number
    maximum?: number
  }
  format?: string
  comment?: string
}

export interface ExcelWorksheet {
  name: string
  columns: ExcelColumn[]
  data: Record<string, any>[]
  protectedCells?: string[]
  hiddenColumns?: string[]
}

export interface ExcelTemplateResult {
  workbook: ExcelWorksheet[]
  filename: string
  metadata: {
    templateId: string
    templateName: string
    generatedAt: Date
    currency: string
    validityDays: number
  }
}

// Mock product data for template generation
const mockProductData = [
  {
    id: 'beef-ribeye',
    code: 'BEEF-001',
    name: 'Beef Ribeye Steak',
    description: 'Premium beef ribeye steak, aged 21 days',
    category: 'Food & Beverage',
    subcategory: 'Meat & Poultry',
    itemGroup: 'Beef Cuts',
    unit: 'kg',
    specifications: 'Grade A, 250g-300g per piece'
  },
  {
    id: 'chicken-breast',
    code: 'CHKN-001',
    name: 'Chicken Breast',
    description: 'Fresh chicken breast, skinless and boneless',
    category: 'Food & Beverage',
    subcategory: 'Meat & Poultry',
    itemGroup: 'Fresh Poultry',
    unit: 'kg',
    specifications: 'Grade A, 150g-200g per piece'
  },
  {
    id: 'salmon-fillet',
    code: 'FISH-001',
    name: 'Atlantic Salmon Fillet',
    description: 'Fresh Atlantic salmon fillet, skin-on',
    category: 'Food & Beverage',
    subcategory: 'Seafood',
    itemGroup: 'Fresh Fish',
    unit: 'kg',
    specifications: 'Grade A, 180g-220g per piece'
  },
  {
    id: 'shrimp-jumbo',
    code: 'SHMP-001',
    name: 'Jumbo Shrimp',
    description: 'Fresh jumbo shrimp, peeled and deveined',
    category: 'Food & Beverage',
    subcategory: 'Seafood',
    itemGroup: 'Shellfish',
    unit: 'kg',
    specifications: '16/20 count per kg'
  },
  {
    id: 'tomatoes-vine',
    code: 'PROD-001',
    name: 'Vine Tomatoes',
    description: 'Fresh vine ripened tomatoes',
    category: 'Food & Beverage',
    subcategory: 'Fresh Produce',
    itemGroup: 'Vegetables',
    unit: 'kg',
    specifications: 'Grade A, medium size'
  }
]

export class ExcelTemplateGenerator {
  private template: PricelistTemplate
  private config: ExcelTemplateConfig

  constructor(template: PricelistTemplate, config: ExcelTemplateConfig) {
    this.template = template
    this.config = config
  }

  /**
   * Generate Excel template based on pricelist template configuration
   */
  async generateTemplate(): Promise<ExcelTemplateResult> {
    const workbook: ExcelWorksheet[] = []

    // Main pricing worksheet
    const pricingSheet = this.generatePricingSheet()
    workbook.push(pricingSheet)

    // Instructions worksheet
    if (this.config.includeInstructions) {
      const instructionsSheet = this.generateInstructionsSheet()
      workbook.push(instructionsSheet)
    }

    // Product reference worksheet
    if (this.config.includeProductHierarchy) {
      const productRefSheet = this.generateProductReferenceSheet()
      workbook.push(productRefSheet)
    }

    // Validation data worksheet (hidden)
    const validationSheet = this.generateValidationSheet()
    workbook.push(validationSheet)

    return {
      workbook,
      filename: this.generateFilename(),
      metadata: {
        templateId: this.template.id,
        templateName: this.template.name,
        generatedAt: new Date(),
        currency: this.config.currency,
        validityDays: this.template.validityPeriod
      }
    }
  }

  /**
   * Generate main pricing worksheet
   */
  private generatePricingSheet(): ExcelWorksheet {
    const columns: ExcelColumn[] = [
      {
        key: 'productCode',
        header: 'Product Code',
        width: 15,
        type: 'text',
        required: true,
        validation: {
          type: 'list',
          source: this.getProductCodes()
        },
        comment: 'Select product code from dropdown'
      },
      {
        key: 'productName',
        header: 'Product Name',
        width: 25,
        type: 'text',
        required: true,
        comment: 'Auto-filled when product code is selected'
      },
      {
        key: 'category',
        header: 'Category',
        width: 20,
        type: 'text',
        comment: 'Auto-filled from product selection'
      },
      {
        key: 'subcategory',
        header: 'Subcategory',
        width: 20,
        type: 'text',
        comment: 'Auto-filled from product selection'
      }
    ]

    // Add item group column if enabled
    if (this.template.productSelection.itemGroups.length > 0) {
      columns.push({
        key: 'itemGroup',
        header: 'Item Group',
        width: 20,
        type: 'text',
        comment: 'Auto-filled from product selection'
      })
    }

    // Add pricing columns based on MOQ configuration
    if (this.config.allowMultiMOQ) {
      // Multi-MOQ pricing structure
      const moqLevels = [
        { level: 1, label: 'MOQ 1' },
        { level: 2, label: 'MOQ 2' },
        { level: 3, label: 'MOQ 3' }
      ]

      moqLevels.forEach(moq => {
        columns.push(
          {
            key: `moq${moq.level}Quantity`,
            header: `${moq.label} Quantity`,
            width: 15,
            type: 'number',
            validation: {
              type: 'whole',
              minimum: 1
            },
            comment: `Minimum order quantity for tier ${moq.level}`
          },
          {
            key: `moq${moq.level}Unit`,
            header: `${moq.label} Unit`,
            width: 10,
            type: 'select',
            validation: {
              type: 'list',
              source: ['kg', 'g', 'lb', 'oz', 'pieces', 'boxes', 'cases', 'liters', 'ml']
            },
            comment: 'Unit of measurement'
          },
          {
            key: `moq${moq.level}Price`,
            header: `${moq.label} Unit Price (${this.config.currency})`,
            width: 18,
            type: 'currency',
            required: moq.level === 1,
            validation: {
              type: 'decimal',
              minimum: 0.01
            },
            format: this.getCurrencyFormat(),
            comment: `Unit price in ${this.config.currency}`
          }
        )

        if (this.config.requireLeadTime) {
          columns.push({
            key: `moq${moq.level}LeadTime`,
            header: `${moq.label} Lead Time (Days)`,
            width: 15,
            type: 'number',
            validation: {
              type: 'whole',
              minimum: 1
            },
            comment: 'Delivery lead time in days'
          })
        }
      })
    } else {
      // Standard single-price structure
      columns.push(
        {
          key: 'moq',
          header: 'MOQ',
          width: 12,
          type: 'number',
          required: true,
          validation: {
            type: 'whole',
            minimum: 1
          },
          comment: 'Minimum order quantity'
        },
        {
          key: 'unit',
          header: 'Unit',
          width: 10,
          type: 'select',
          required: true,
          validation: {
            type: 'list',
            source: ['kg', 'g', 'lb', 'oz', 'pieces', 'boxes', 'cases', 'liters', 'ml']
          },
          comment: 'Unit of measurement'
        },
        {
          key: 'unitPrice',
          header: `Unit Price (${this.config.currency})`,
          width: 18,
          type: 'currency',
          required: true,
          validation: {
            type: 'decimal',
            minimum: 0.01
          },
          format: this.getCurrencyFormat(),
          comment: `Unit price in ${this.config.currency}`
        }
      )

      if (this.config.requireLeadTime) {
        columns.push({
          key: 'leadTime',
          header: 'Lead Time (Days)',
          width: 15,
          type: 'number',
          required: true,
          validation: {
            type: 'whole',
            minimum: 1
          },
          comment: 'Delivery lead time in days'
        })
      }
    }


    // Add standard columns
    columns.push(
      {
        key: 'availability',
        header: 'Availability',
        width: 15,
        type: 'select',
        validation: {
          type: 'list',
          source: ['In Stock', 'Out of Stock', 'Limited Stock', 'Pre-order']
        },
        comment: 'Product availability status'
      },
      {
        key: 'notes',
        header: 'Notes',
        width: 30,
        type: 'text',
        comment: 'Additional notes or comments'
      }
    )

    // Generate sample data if requested
    const data = this.config.includeSampleData ? this.generateSampleData() : []

    return {
      name: 'Pricing',
      columns,
      data,
      protectedCells: ['A1:Z1'], // Protect header row
      hiddenColumns: []
    }
  }

  /**
   * Generate instructions worksheet
   */
  private generateInstructionsSheet(): ExcelWorksheet {
    const columns: ExcelColumn[] = [
      {
        key: 'section',
        header: 'Section',
        width: 20,
        type: 'text'
      },
      {
        key: 'instruction',
        header: 'Instructions',
        width: 80,
        type: 'text'
      }
    ]

    const data = [
      {
        section: 'Template Information',
        instruction: `Template: ${this.template.name}\nGenerated: ${new Date().toLocaleDateString()}\nValidity Period: ${this.template.validityPeriod} days\nCurrency: ${this.config.currency}`
      },
      {
        section: 'Getting Started',
        instruction: 'This template has been customized for your vendor profile. Please fill in the pricing information for all requested products.'
      },
      {
        section: 'Product Selection',
        instruction: 'Use the dropdown in the Product Code column to select products. Product Name, Category, and Subcategory will auto-populate.'
      },
      {
        section: 'Pricing Guidelines',
        instruction: this.config.allowMultiMOQ 
          ? 'You can provide up to 3 different MOQ levels with different pricing. At minimum, provide MOQ 1 pricing.'
          : 'Provide your minimum order quantity (MOQ) and unit price for each product.'
      },
      {
        section: 'Lead Time',
        instruction: this.config.requireLeadTime
          ? 'Lead time is required for all products. Please specify delivery time in days from order confirmation.'
          : 'Lead time is optional but recommended to help with planning.'
      },
      {
        section: 'Availability',
        instruction: 'Please indicate current availability status for each product to help us plan procurement.'
      },
      {
        section: 'Quality Requirements',
        instruction: 'All products must meet our quality standards. Please indicate any certifications or quality grades.'
      },
      {
        section: 'Submission',
        instruction: 'Once completed, save the file and upload it through the vendor portal or email it to your procurement contact.'
      }
    ]

    // Add custom instructions if provided
    if (this.template.instructions) {
      data.push({
        section: 'Additional Instructions',
        instruction: this.template.instructions
      })
    }

    return {
      name: 'Instructions',
      columns,
      data,
      protectedCells: ['A:B'], // Protect entire sheet
      hiddenColumns: []
    }
  }

  /**
   * Generate product reference worksheet
   */
  private generateProductReferenceSheet(): ExcelWorksheet {
    const columns: ExcelColumn[] = [
      {
        key: 'code',
        header: 'Product Code',
        width: 15,
        type: 'text'
      },
      {
        key: 'name',
        header: 'Product Name',
        width: 25,
        type: 'text'
      },
      {
        key: 'description',
        header: 'Description',
        width: 40,
        type: 'text'
      },
      {
        key: 'category',
        header: 'Category',
        width: 20,
        type: 'text'
      },
      {
        key: 'subcategory',
        header: 'Subcategory',
        width: 20,
        type: 'text'
      },
      {
        key: 'itemGroup',
        header: 'Item Group',
        width: 20,
        type: 'text'
      },
      {
        key: 'unit',
        header: 'Standard Unit',
        width: 12,
        type: 'text'
      },
      {
        key: 'specifications',
        header: 'Specifications',
        width: 30,
        type: 'text'
      }
    ]

    const data = this.getFilteredProducts()

    return {
      name: 'Product Reference',
      columns,
      data,
      protectedCells: ['A:H'], // Protect entire sheet
      hiddenColumns: []
    }
  }

  /**
   * Generate validation data worksheet (hidden)
   */
  private generateValidationSheet(): ExcelWorksheet {
    const columns: ExcelColumn[] = [
      {
        key: 'type',
        header: 'Validation Type',
        width: 20,
        type: 'text'
      },
      {
        key: 'values',
        header: 'Valid Values',
        width: 50,
        type: 'text'
      }
    ]

    const data = [
      {
        type: 'Product Codes',
        values: this.getProductCodes().join(', ')
      },
      {
        type: 'Units',
        values: 'kg, g, lb, oz, pieces, boxes, cases, liters, ml'
      },
      {
        type: 'Availability',
        values: 'In Stock, Out of Stock, Limited Stock, Pre-order'
      },
      {
        type: 'Currency',
        values: this.config.currency
      }
    ]

    return {
      name: 'Validation',
      columns,
      data,
      protectedCells: ['A:B'], // Protect entire sheet
      hiddenColumns: ['A:B'] // Hide the entire sheet
    }
  }

  /**
   * Get filtered products based on template selection
   */
  private getFilteredProducts() {
    const selection = this.template.productSelection
    let filteredProducts = [...mockProductData]

    // Filter products based on selection criteria
    // If any selection criteria are specified, include only matching products
    const hasSelection = selection.specificItems.length > 0 ||
                        selection.categories.length > 0 ||
                        selection.subcategories.length > 0 ||
                        selection.itemGroups.length > 0
    
    if (hasSelection) {
      filteredProducts = filteredProducts.filter(product => {
        return selection.specificItems.includes(product.id) ||
               selection.categories.includes(product.category) ||
               selection.subcategories.includes(product.subcategory) ||
               selection.itemGroups.includes(product.itemGroup)
      })
    }

    return filteredProducts
  }

  /**
   * Get product codes for validation
   */
  private getProductCodes(): string[] {
    return this.getFilteredProducts().map(product => product.code)
  }

  /**
   * Generate sample data for demonstration
   */
  private generateSampleData(): Record<string, any>[] {
    if (!this.config.includeSampleData) return []

    const products = this.getFilteredProducts().slice(0, 3)
    
    return products.map(product => {
      const sampleData: Record<string, any> = {
        productCode: product.code,
        productName: product.name,
        category: product.category,
        subcategory: product.subcategory,
        itemGroup: product.itemGroup,
        availability: 'In Stock',
        notes: 'Sample data - please replace with actual values'
      }

      if (this.config.allowMultiMOQ) {
        sampleData.moq1Quantity = 100
        sampleData.moq1Unit = product.unit
        sampleData.moq1Price = this.getSamplePrice(product.id, 1)
        if (this.config.requireLeadTime) {
          sampleData.moq1LeadTime = 7
        }
      } else {
        sampleData.moq = 50
        sampleData.unit = product.unit
        sampleData.unitPrice = this.getSamplePrice(product.id, 1)
        if (this.config.requireLeadTime) {
          sampleData.leadTime = 5
        }
      }

      return sampleData
    })
  }

  /**
   * Get sample price for demonstration
   */
  private getSamplePrice(productId: string, tier: number): number {
    const basePrices: Record<string, number> = {
      'beef-ribeye': 450,
      'chicken-breast': 120,
      'salmon-fillet': 280,
      'shrimp-jumbo': 380,
      'tomatoes-vine': 45
    }

    const basePrice = basePrices[productId] || 100
    return basePrice * (1 - (tier - 1) * 0.1) // 10% discount per tier
  }

  /**
   * Get currency format for Excel
   */
  private getCurrencyFormat(): string {
    const formats: Record<string, string> = {
      'BHT': '฿#,##0.00',
      'USD': '$#,##0.00',
      'CNY': '¥#,##0.00',
      'SGD': 'S$#,##0.00'
    }

    return formats[this.config.currency] || '#,##0.00'
  }


  /**
   * Generate filename for the Excel template
   */
  private generateFilename(): string {
    const templateName = this.template.name.replace(/[^a-zA-Z0-9]/g, '_')
    const timestamp = new Date().toISOString().split('T')[0]
    return `${templateName}_Template_${timestamp}.xlsx`
  }

  /**
   * Export template configuration for external tools
   */
  exportConfiguration(): any {
    return {
      template: this.template,
      config: this.config,
      products: this.getFilteredProducts(),
      currency: this.config.currency,
      validityPeriod: this.template.validityPeriod,
      generatedAt: new Date().toISOString()
    }
  }
}

/**
 * Utility function to create Excel template generator
 */
export function createExcelTemplateGenerator(
  template: PricelistTemplate,
  config: Partial<ExcelTemplateConfig> = {}
): ExcelTemplateGenerator {
  const defaultConfig: ExcelTemplateConfig = {
    includeInstructions: true,
    includeProductHierarchy: true,
    includeSampleData: false,
    templateFormat: 'standard',
    currency: template.defaultCurrency || 'BHT',
    allowMultiMOQ: template.allowMultiMOQ || false,
    requireLeadTime: template.requireLeadTime || false
  }

  return new ExcelTemplateGenerator(template, { ...defaultConfig, ...config })
}

/**
 * Generate Excel template and return download URL
 */
export async function generateExcelTemplate(
  template: PricelistTemplate,
  config?: Partial<ExcelTemplateConfig>
): Promise<ExcelTemplateResult> {
  const generator = createExcelTemplateGenerator(template, config)
  return await generator.generateTemplate()
}