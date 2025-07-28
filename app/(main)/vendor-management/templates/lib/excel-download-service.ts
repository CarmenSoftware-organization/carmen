'use client'

// Excel Download Service
// Phase 2 Task 5 - Template download functionality with proper Excel formatting

import { ExcelTemplateResult, ExcelWorksheet } from './excel-generator'

export interface DownloadOptions {
  format: 'excel' | 'csv' | 'json'
  filename?: string
  compression?: boolean
}

export interface DownloadResult {
  success: boolean
  filename: string
  size: number
  downloadUrl?: string
  error?: string
}

/**
 * Excel Download Service
 * Handles the actual file generation and download process
 */
export class ExcelDownloadService {
  private static instance: ExcelDownloadService

  public static getInstance(): ExcelDownloadService {
    if (!ExcelDownloadService.instance) {
      ExcelDownloadService.instance = new ExcelDownloadService()
    }
    return ExcelDownloadService.instance
  }

  /**
   * Download Excel template with proper formatting
   */
  async downloadExcelTemplate(
    templateResult: ExcelTemplateResult,
    options: DownloadOptions = { format: 'excel' }
  ): Promise<DownloadResult> {
    try {
      switch (options.format) {
        case 'excel':
          return await this.downloadAsExcel(templateResult, options)
        case 'csv':
          return await this.downloadAsCsv(templateResult, options)
        case 'json':
          return await this.downloadAsJson(templateResult, options)
        default:
          throw new Error(`Unsupported format: ${options.format}`)
      }
    } catch (error) {
      console.error('Download failed:', error)
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Download as Excel file (simulated - in real app would use a library like ExcelJS)
   */
  private async downloadAsExcel(
    templateResult: ExcelTemplateResult,
    options: DownloadOptions
  ): Promise<DownloadResult> {
    // In a real application, you would use a library like ExcelJS to create actual Excel files
    // For now, we'll simulate the Excel generation process
    
    const excelData = this.generateExcelStructure(templateResult)
    const filename = options.filename || templateResult.filename
    
    // Convert to blob and trigger download
    const blob = new Blob([JSON.stringify(excelData, null, 2)], {
      type: 'application/json' // In real app: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    const downloadUrl = URL.createObjectURL(blob)
    
    // Create download link
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename.replace('.xlsx', '_structure.json') // In real app: filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    
    return {
      success: true,
      filename: filename,
      size: blob.size,
      downloadUrl
    }
  }

  /**
   * Download as CSV file (main sheet only)
   */
  private async downloadAsCsv(
    templateResult: ExcelTemplateResult,
    options: DownloadOptions
  ): Promise<DownloadResult> {
    const mainSheet = templateResult.workbook.find(sheet => sheet.name === 'Pricing')
    if (!mainSheet) {
      throw new Error('No pricing sheet found')
    }

    const csvContent = this.convertToCsv(mainSheet)
    const filename = (options.filename || templateResult.filename).replace('.xlsx', '.csv')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    
    return {
      success: true,
      filename: filename,
      size: blob.size,
      downloadUrl
    }
  }

  /**
   * Download as JSON file
   */
  private async downloadAsJson(
    templateResult: ExcelTemplateResult,
    options: DownloadOptions
  ): Promise<DownloadResult> {
    const jsonContent = JSON.stringify(templateResult, null, 2)
    const filename = (options.filename || templateResult.filename).replace('.xlsx', '.json')
    
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const downloadUrl = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    
    return {
      success: true,
      filename: filename,
      size: blob.size,
      downloadUrl
    }
  }

  /**
   * Generate Excel structure for real Excel library integration
   */
  private generateExcelStructure(templateResult: ExcelTemplateResult): any {
    return {
      metadata: templateResult.metadata,
      sheets: templateResult.workbook.map(sheet => ({
        name: sheet.name,
        columns: sheet.columns.map(col => ({
          header: col.header,
          key: col.key,
          width: col.width,
          type: col.type,
          format: col.format,
          validation: col.validation,
          comment: col.comment
        })),
        rows: sheet.data.map(row => {
          const excelRow: any = {}
          sheet.columns.forEach(col => {
            excelRow[col.key] = row[col.key] || ''
          })
          return excelRow
        }),
        protection: {
          protectedCells: sheet.protectedCells || [],
          allowEditing: true,
          allowFormatting: false,
          allowColumnFormatting: false,
          allowRowFormatting: false,
          allowInsertingRows: true,
          allowDeletingRows: true
        },
        visibility: {
          hiddenColumns: sheet.hiddenColumns || []
        }
      })),
      // Excel-specific settings
      workbookSettings: {
        defaultFont: {
          name: 'Arial',
          size: 11
        },
        theme: 'Office',
        calculationMode: 'automatic',
        showGridlines: true,
        showRowColumnHeaders: true
      }
    }
  }

  /**
   * Convert worksheet to CSV format
   */
  private convertToCsv(sheet: ExcelWorksheet): string {
    const rows: string[] = []
    
    // Add header row
    const headers = sheet.columns.map(col => this.escapeCsvValue(col.header))
    rows.push(headers.join(','))
    
    // Add data rows
    sheet.data.forEach(row => {
      const csvRow = sheet.columns.map(col => {
        const value = row[col.key] || ''
        return this.escapeCsvValue(String(value))
      })
      rows.push(csvRow.join(','))
    })
    
    return rows.join('\n')
  }

  /**
   * Escape CSV values to handle commas, quotes, and newlines
   */
  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  /**
   * Generate multiple format downloads
   */
  async downloadMultipleFormats(
    templateResult: ExcelTemplateResult,
    formats: DownloadOptions['format'][] = ['excel', 'csv', 'json']
  ): Promise<DownloadResult[]> {
    const results: DownloadResult[] = []
    
    for (const format of formats) {
      const result = await this.downloadExcelTemplate(templateResult, { format })
      results.push(result)
    }
    
    return results
  }

  /**
   * Create zip file with multiple formats (simulated)
   */
  async downloadAsZip(
    templateResult: ExcelTemplateResult,
    formats: DownloadOptions['format'][] = ['excel', 'csv', 'json']
  ): Promise<DownloadResult> {
    // In a real application, you would use a library like JSZip
    const zipContent = {
      metadata: templateResult.metadata,
      formats: {} as Record<string, any>
    }
    
    // Add each format to the zip
    for (const format of formats) {
      if (format === 'excel') {
        zipContent.formats.excel = this.generateExcelStructure(templateResult)
      } else if (format === 'csv') {
        const mainSheet = templateResult.workbook.find(sheet => sheet.name === 'Pricing')
        zipContent.formats.csv = mainSheet ? this.convertToCsv(mainSheet) : ''
      } else if (format === 'json') {
        zipContent.formats.json = templateResult
      }
    }
    
    const filename = templateResult.filename.replace('.xlsx', '_package.zip')
    const blob = new Blob([JSON.stringify(zipContent, null, 2)], {
      type: 'application/zip'
    })
    
    const downloadUrl = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    
    return {
      success: true,
      filename: filename,
      size: blob.size,
      downloadUrl
    }
  }

  /**
   * Validate template before download
   */
  validateTemplate(templateResult: ExcelTemplateResult): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Check if workbook has sheets
    if (!templateResult.workbook || templateResult.workbook.length === 0) {
      errors.push('Template must have at least one worksheet')
    }
    
    // Check main pricing sheet
    const pricingSheet = templateResult.workbook.find(sheet => sheet.name === 'Pricing')
    if (!pricingSheet) {
      errors.push('Template must have a "Pricing" worksheet')
    } else {
      // Check if pricing sheet has required columns
      const requiredColumns = ['productCode', 'productName', 'unitPrice']
      const columnKeys = pricingSheet.columns.map(col => col.key)
      
      requiredColumns.forEach(required => {
        if (!columnKeys.includes(required)) {
          errors.push(`Pricing sheet missing required column: ${required}`)
        }
      })
      
      // Check for potential issues
      if (pricingSheet.columns.length > 20) {
        warnings.push('Pricing sheet has many columns - consider simplifying for better vendor experience')
      }
      
      if (pricingSheet.data.length === 0) {
        warnings.push('Pricing sheet has no data rows - consider adding sample data')
      }
    }
    
    // Check metadata
    if (!templateResult.metadata.templateId) {
      errors.push('Template metadata missing ID')
    }
    
    if (!templateResult.metadata.templateName) {
      errors.push('Template metadata missing name')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Get download statistics
   */
  getDownloadStats(templateResult: ExcelTemplateResult): {
    totalColumns: number
    totalRows: number
    estimatedSize: string
    complexity: 'simple' | 'moderate' | 'complex'
  } {
    const totalColumns = templateResult.workbook.reduce((sum, sheet) => sum + sheet.columns.length, 0)
    const totalRows = templateResult.workbook.reduce((sum, sheet) => sum + sheet.data.length, 0)
    
    // Estimate file size (very rough approximation)
    const estimatedBytes = (totalColumns * totalRows * 50) + (totalColumns * 100) + 10000
    const estimatedSize = this.formatFileSize(estimatedBytes)
    
    // Determine complexity
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple'
    if (totalColumns > 12 || totalRows > 100) {
      complexity = 'moderate'
    }
    if (totalColumns > 20 || totalRows > 500) {
      complexity = 'complex'
    }
    
    return {
      totalColumns,
      totalRows,
      estimatedSize,
      complexity
    }
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}

// Export singleton instance
export const excelDownloadService = ExcelDownloadService.getInstance()

// Utility functions for easy use
export async function downloadExcelTemplate(
  templateResult: ExcelTemplateResult,
  options?: DownloadOptions
): Promise<DownloadResult> {
  return excelDownloadService.downloadExcelTemplate(templateResult, options)
}

export async function downloadMultipleFormats(
  templateResult: ExcelTemplateResult,
  formats?: DownloadOptions['format'][]
): Promise<DownloadResult[]> {
  return excelDownloadService.downloadMultipleFormats(templateResult, formats)
}

export function validateTemplate(templateResult: ExcelTemplateResult) {
  return excelDownloadService.validateTemplate(templateResult)
}

export function getDownloadStats(templateResult: ExcelTemplateResult) {
  return excelDownloadService.getDownloadStats(templateResult)
}