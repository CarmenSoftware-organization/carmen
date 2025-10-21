"use client"

import { formatCurrency, formatNumber } from './formatters'

export interface ExportColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'currency' | 'date' | 'badge'
  formatter?: (value: any) => string
}

export interface ExportGroup<T> {
  groupName: string
  items: T[]
  subtotals?: Record<string, number>
  keyMetrics?: { label: string; value: string | number; type: 'currency' | 'number' | 'text' }[]
}

export interface ExportData<T> {
  title: string
  subtitle?: string
  timestamp: string
  columns: ExportColumn[]
  groups?: ExportGroup<T>[]
  items?: T[]
  grandTotals?: Record<string, number>
  filters?: Record<string, any>
  summary?: Record<string, any>
}

// CSV Export with grouping preservation
export function exportToCSV<T>(data: ExportData<T>): void {
  const { title, columns, groups, items, grandTotals, filters } = data

  let csvContent = "data:text/csv;charset=utf-8,"

  // Add title and metadata
  csvContent += `"${title}"\n`
  csvContent += `"Generated: ${data.timestamp}"\n`

  // Add filters if present
  if (filters && Object.keys(filters).length > 0) {
    csvContent += `"Filters: ${Object.entries(filters)
      .filter(([_, value]) => value && value !== '' && value !== 'all')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')}"\n`
  }

  csvContent += "\n" // Empty line

  // Add headers
  const headers = columns.map(col => `"${col.label}"`).join(',')
  csvContent += headers + "\n"

  // Add data with grouping
  if (groups && groups.length > 0) {
    groups.forEach(group => {
      // Group header
      csvContent += `"=== ${group.groupName} ===",${",".repeat(columns.length - 1)}\n`

      // Group items
      group.items.forEach(item => {
        const row = columns.map(col => {
          const value = (item as any)[col.key]
          return formatValueForCSV(value, col)
        }).join(',')
        csvContent += row + "\n"
      })

      // Group subtotals
      if (group.subtotals) {
        const subtotalRow = columns.map(col => {
          if (col.key === columns[0].key) {
            return `"Subtotal - ${group.groupName}"`
          }
          const subtotalValue = group.subtotals![col.key]
          return subtotalValue ? formatValueForCSV(subtotalValue, col) : '""'
        }).join(',')
        csvContent += subtotalRow + "\n"
      }

      csvContent += "\n" // Empty line between groups
    })

    // Grand totals
    if (grandTotals) {
      const grandTotalRow = columns.map(col => {
        if (col.key === columns[0].key) {
          return '"Grand Total"'
        }
        const grandTotalValue = grandTotals[col.key]
        return grandTotalValue ? formatValueForCSV(grandTotalValue, col) : '""'
      }).join(',')
      csvContent += grandTotalRow + "\n"
    }
  } else if (items && items.length > 0) {
    // Flat data export
    items.forEach(item => {
      const row = columns.map(col => {
        const value = (item as any)[col.key]
        return formatValueForCSV(value, col)
      }).join(',')
      csvContent += row + "\n"
    })
  }

  // Download the file
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Excel-style export (CSV with better formatting)
export function exportToExcel<T>(data: ExportData<T>): void {
  const { title, columns, groups, items, grandTotals, filters, summary } = data

  let content = "data:text/csv;charset=utf-8,"

  // Title section
  content += `"${title}"\n`
  content += `"Generated: ${data.timestamp}"\n\n`

  // Summary section
  if (summary) {
    content += `"Summary"\n`
    Object.entries(summary).forEach(([key, value]) => {
      content += `"${key}","${value}"\n`
    })
    content += "\n"
  }

  // Filters section
  if (filters && Object.keys(filters).length > 0) {
    content += `"Applied Filters"\n`
    Object.entries(filters)
      .filter(([_, value]) => value && value !== '' && value !== 'all')
      .forEach(([key, value]) => {
        content += `"${key}","${value}"\n`
      })
    content += "\n"
  }

  // Data section
  content += `"Data"\n`
  const headers = columns.map(col => `"${col.label}"`).join(',')
  content += headers + "\n"

  // Export data (same logic as CSV but with better structure)
  if (groups && groups.length > 0) {
    groups.forEach(group => {
      // Group header with styling indication
      content += `"GROUP: ${group.groupName}",${",".repeat(columns.length - 1)}\n`

      // Group items
      group.items.forEach(item => {
        const row = columns.map(col => {
          const value = (item as any)[col.key]
          return formatValueForCSV(value, col)
        }).join(',')
        content += row + "\n"
      })

      // Group subtotals
      if (group.subtotals) {
        const subtotalRow = columns.map(col => {
          if (col.key === columns[0].key) {
            return `"SUBTOTAL"`
          }
          const subtotalValue = group.subtotals![col.key]
          return subtotalValue ? formatValueForCSV(subtotalValue, col) : '""'
        }).join(',')
        content += subtotalRow + "\n"
      }

      content += "\n"
    })

    // Grand totals
    if (grandTotals) {
      const grandTotalRow = columns.map(col => {
        if (col.key === columns[0].key) {
          return '"GRAND TOTAL"'
        }
        const grandTotalValue = grandTotals[col.key]
        return grandTotalValue ? formatValueForCSV(grandTotalValue, col) : '""'
      }).join(',')
      content += grandTotalRow + "\n"
    }
  } else if (items && items.length > 0) {
    items.forEach(item => {
      const row = columns.map(col => {
        const value = (item as any)[col.key]
        return formatValueForCSV(value, col)
      }).join(',')
      content += row + "\n"
    })
  }

  // Download
  const encodedUri = encodeURI(content)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `${title.replace(/\s+/g, '_').toLowerCase()}_detailed_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// PDF-ready text export
export function exportToPDF<T>(data: ExportData<T>): void {
  const { title, columns, groups, items, grandTotals, filters, summary } = data

  let content = `${title}\n`
  content += `Generated: ${data.timestamp}\n\n`

  // Summary
  if (summary) {
    content += `SUMMARY\n`
    content += `${'-'.repeat(50)}\n`
    Object.entries(summary).forEach(([key, value]) => {
      content += `${key}: ${value}\n`
    })
    content += "\n"
  }

  // Filters
  if (filters && Object.keys(filters).length > 0) {
    content += `APPLIED FILTERS\n`
    content += `${'-'.repeat(50)}\n`
    Object.entries(filters)
      .filter(([_, value]) => value && value !== '' && value !== 'all')
      .forEach(([key, value]) => {
        content += `${key}: ${value}\n`
      })
    content += "\n"
  }

  // Data
  content += `DATA\n`
  content += `${'='.repeat(80)}\n\n`

  if (groups && groups.length > 0) {
    groups.forEach(group => {
      content += `${group.groupName}\n`
      content += `${'-'.repeat(group.groupName.length)}\n`

      // Create a simple table format
      const headerRow = columns.map(col => col.label.padEnd(15)).join(' | ')
      content += headerRow + "\n"
      content += '-'.repeat(headerRow.length) + "\n"

      group.items.forEach(item => {
        const row = columns.map(col => {
          const value = (item as any)[col.key]
          const formatted = formatValueForText(value, col)
          return formatted.toString().padEnd(15)
        }).join(' | ')
        content += row + "\n"
      })

      // Subtotals
      if (group.subtotals) {
        content += '-'.repeat(headerRow.length) + "\n"
        const subtotalRow = columns.map(col => {
          if (col.key === columns[0].key) {
            return 'SUBTOTAL'.padEnd(15)
          }
          const subtotalValue = group.subtotals![col.key]
          const formatted = subtotalValue ? formatValueForText(subtotalValue, col) : ''
          return formatted.toString().padEnd(15)
        }).join(' | ')
        content += subtotalRow + "\n"
      }

      content += "\n\n"
    })

    // Grand totals
    if (grandTotals) {
      content += `GRAND TOTALS\n`
      content += `${'-'.repeat(50)}\n`
      columns.forEach(col => {
        const grandTotalValue = grandTotals[col.key]
        if (grandTotalValue) {
          const formatted = formatValueForText(grandTotalValue, col)
          content += `${col.label}: ${formatted}\n`
        }
      })
    }
  }

  // Create and download as text file (can be imported to PDF tools)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Helper functions
function formatValueForCSV(value: any, column: ExportColumn): string {
  if (value === null || value === undefined) return '""'

  // Use custom formatter if provided
  if (column.formatter) {
    return `"${column.formatter(value)}"`
  }

  switch (column.type) {
    case 'currency':
      return `"${formatCurrency(Number(value))}"`
    case 'number':
      return `"${formatNumber(Number(value))}"`
    case 'date':
      return `"${value instanceof Date ? value.toLocaleDateString() : value}"`
    case 'badge':
    case 'text':
    default:
      return `"${value.toString().replace(/"/g, '""')}"`
  }
}

function formatValueForText(value: any, column: ExportColumn): string {
  if (value === null || value === undefined) return ''

  if (column.formatter) {
    return column.formatter(value)
  }

  switch (column.type) {
    case 'currency':
      return formatCurrency(Number(value))
    case 'number':
      return formatNumber(Number(value))
    case 'date':
      return value instanceof Date ? value.toLocaleDateString() : value.toString()
    case 'badge':
    case 'text':
    default:
      return value.toString()
  }
}

// Utility to create export data from grouped table props
export function createExportData<T>(
  title: string,
  columns: ExportColumn[],
  groups?: Array<{
    locationId: string
    locationName: string
    items: T[]
    subtotals: Record<string, number>
    isExpanded: boolean
  }>,
  grandTotals?: Record<string, number>,
  filters?: Record<string, any>,
  summary?: Record<string, any>
): ExportData<T> {
  return {
    title,
    timestamp: new Date().toLocaleString(),
    columns,
    groups: groups?.map(group => ({
      groupName: group.locationName,
      items: group.items,
      subtotals: group.subtotals
    })),
    grandTotals,
    filters,
    summary
  }
}