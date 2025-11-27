"use client"

/**
 * Import Button Component
 *
 * Button with dialog for importing CSV/Excel files
 * Allows user to select file format before importing
 *
 * Updated: 2025-11-17 - Added file format selection dialog
 */

import * as React from "react"
import { Upload, FileSpreadsheet, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

interface ImportButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  disabled?: boolean
  showIcon?: boolean
  text?: string
  tooltipText?: string
  onFileSelect?: (file: File, format: 'csv' | 'xlsx') => void
}

export function ImportButton({
  variant = "outline",
  size = "default",
  className,
  disabled = false,
  showIcon = true,
  text = "Import",
  tooltipText = "Import price list items from CSV or Excel file",
  onFileSelect
}: ImportButtonProps) {
  const [showDialog, setShowDialog] = React.useState(false)
  const [selectedFormat, setSelectedFormat] = React.useState<'csv' | 'xlsx' | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    setShowDialog(true)
  }

  const handleFormatSelect = (format: 'csv' | 'xlsx') => {
    setSelectedFormat(format)
    setShowDialog(false)

    // Trigger file input with appropriate accept attribute
    if (fileInputRef.current) {
      fileInputRef.current.accept = format === 'csv' ? '.csv' : '.xlsx,.xls'
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedFormat) {
      if (onFileSelect) {
        onFileSelect(file, selectedFormat)
      } else {
        // Placeholder - show coming soon message
        toast.info('Import Feature Coming Soon', {
          description: 'CSV and Excel import functionality will be available in the backend implementation phase.'
        })
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setSelectedFormat(null)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={handleClick}
              disabled={disabled}
              className={cn(className)}
            >
              {showIcon && <Upload className="h-4 w-4 mr-2" />}
              {text}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* File Format Selection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Import Format</DialogTitle>
            <DialogDescription>
              Choose the file format for importing price list items
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* CSV Option */}
            <button
              onClick={() => handleFormatSelect('csv')}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer group"
            >
              <FileText className="h-12 w-12 text-gray-400 group-hover:text-blue-600 mb-3" />
              <span className="font-medium text-gray-900">CSV File</span>
              <span className="text-xs text-gray-500 mt-1">.csv format</span>
            </button>

            {/* Excel Option */}
            <button
              onClick={() => handleFormatSelect('xlsx')}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer group"
            >
              <FileSpreadsheet className="h-12 w-12 text-gray-400 group-hover:text-green-600 mb-3" />
              <span className="font-medium text-gray-900">Excel File</span>
              <span className="text-xs text-gray-500 mt-1">.xlsx, .xls format</span>
            </button>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Import button with file input (for future implementation)
 */
export function ImportButtonWithInput({
  onFileSelect,
  acceptedFormats = ".csv,.xlsx,.xls",
  disabled = false,
  className
}: {
  onFileSelect?: (file: File) => void
  acceptedFormats?: string
  disabled?: boolean
  className?: string
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    // Currently just shows placeholder message
    // In future, will trigger file input
    if (onFileSelect) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onFileSelect) {
      onFileSelect(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <ImportButton
        className={className}
        disabled={disabled}
      />
    </>
  )
}

/**
 * Import helper text component
 */
export function ImportHelperText({ className }: { className?: string }) {
  return (
    <div className={cn("text-sm text-muted-foreground space-y-1", className)}>
      <p className="font-medium">Import Requirements:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>CSV or Excel format (.csv, .xlsx, .xls)</li>
        <li>Required columns: Item Code, Item Name, Unit Price, Unit</li>
        <li>Optional columns: Description, Lead Time, Tax Rate, FOC</li>
        <li>Product Identifier format: "CODE - NAME"</li>
      </ul>
    </div>
  )
}
