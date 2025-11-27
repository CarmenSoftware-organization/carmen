"use client"

/**
 * Product Search Combobox Component
 *
 * Searchable dropdown for selecting products from a list
 * Displays products in "CODE - NAME" format
 * Auto-populates category, subcategory, and tax rate
 *
 * Created: 2025-11-17
 */

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import type { Product } from "@/lib/types"

interface ProductSearchComboboxProps {
  products: Product[]
  value?: Product | null
  onChange: (product: Product | null) => void
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function ProductSearchCombobox({
  products,
  value,
  onChange,
  label = "Product",
  placeholder = "Search products...",
  required = false,
  disabled = false,
  className
}: ProductSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Format product for display: "CODE - NAME"
  const formatProduct = (product: Product) => {
    return `${product.productCode} - ${product.productName}`
  }

  // Filter products based on search
  const filteredProducts = React.useMemo(() => {
    if (!searchValue) return products

    const search = searchValue.toLowerCase()
    return products.filter(product =>
      product.productCode.toLowerCase().includes(search) ||
      product.productName.toLowerCase().includes(search)
    )
  }, [products, searchValue])

  // Get display value
  const displayValue = value ? formatProduct(value) : ""

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <input
              type="text"
              value={displayValue || searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
                if (!open) setOpen(true)
                if (value) onChange(null) // Clear selection when typing
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
              )}
            />
            <ChevronsUpDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0 z-[200]" align="start">
          <div className="max-h-[300px] overflow-auto">
            {filteredProducts.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No product found.
              </div>
            ) : (
              <div className="p-1">
                {filteredProducts.map((product) => {
                  const isSelected = value?.id === product.id
                  const displayText = formatProduct(product)

                  return (
                    <div
                      key={product.id}
                      onMouseDown={(e) => {
                        e.preventDefault() // Prevent input blur
                        onChange(product)
                        setSearchValue("")
                        setOpen(false)
                      }}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{displayText}</span>
                        {product.description && (
                          <span className="text-xs text-muted-foreground">
                            {product.description}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
