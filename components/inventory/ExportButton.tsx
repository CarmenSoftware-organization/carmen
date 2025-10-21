"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet, FileDown } from 'lucide-react'
import { exportToCSV, exportToExcel, exportToPDF, ExportData } from '@/lib/utils/export-utils'
import { toast } from 'sonner'

interface ExportButtonProps<T> {
  data: ExportData<T>
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  className?: string
}

export function ExportButton<T>({
  data,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  className
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (disabled) return

    setIsExporting(true)

    try {
      switch (format) {
        case 'csv':
          exportToCSV(data)
          toast.success('CSV export completed successfully')
          break
        case 'excel':
          exportToExcel(data)
          toast.success('Excel export completed successfully')
          break
        case 'pdf':
          exportToPDF(data)
          toast.success('PDF export completed successfully')
          break
      }
    } catch (error) {
      console.error(`Export failed:`, error)
      toast.error(`Export failed. Please try again.`)
    } finally {
      setTimeout(() => setIsExporting(false), 1000) // Small delay for UX
    }
  }

  const itemCount = data.groups
    ? data.groups.reduce((total, group) => total + group.items.length, 0)
    : data.items?.length || 0

  const groupCount = data.groups?.length || 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isExporting}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          Export Options
          <div className="text-xs text-muted-foreground font-normal mt-1">
            {itemCount} items{groupCount > 0 && ` in ${groupCount} groups`}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          <div>
            <div>CSV Format</div>
            <div className="text-xs text-muted-foreground">
              Comma-separated values with grouping
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          <div>
            <div>Excel Format</div>
            <div className="text-xs text-muted-foreground">
              Enhanced CSV with summary & filters
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileDown className="h-4 w-4 mr-2" />
          <div>
            <div>PDF-Ready Format</div>
            <div className="text-xs text-muted-foreground">
              Text format for PDF conversion
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">
          {data.filters && Object.keys(data.filters).filter(key =>
            data.filters![key] && data.filters![key] !== '' && data.filters![key] !== 'all'
          ).length > 0
            ? 'Current filters will be included'
            : 'No filters applied'
          }
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}