'use client'

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { StockCard } from "../types"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockData: StockCard[] = [
  {
    id: "1",
    itemId: "ITEM001",
    itemCode: "RICE001",
    itemName: "Rice",
    category: "Grains",
    uom: "kg",
    currentStock: {
      totalStock: 150,
      valueOnHand: 7500,
      averageCost: 50,
      lastPurchaseDate: "2024-03-15",
      lastMovementDate: "2024-03-20"
    },
    minStock: 50,
    maxStock: 300,
    locations: [
      {
        id: "L1",
        name: "Main Warehouse",
        stockOnHand: 100,
        availableStock: 80,
        reservedStock: 20
      },
      {
        id: "L2",
        name: "Store Room",
        stockOnHand: 50,
        availableStock: 50,
        reservedStock: 0
      }
    ],
    movements: []
  },
  {
    id: "2",
    itemId: "ITEM002",
    itemCode: "SUGAR001",
    itemName: "Sugar",
    category: "Sweeteners",
    uom: "kg",
    currentStock: {
      totalStock: 50,
      valueOnHand: 2500,
      averageCost: 50,
      lastPurchaseDate: "2024-03-10",
      lastMovementDate: "2024-03-18"
    },
    minStock: 25,
    maxStock: 200,
    locations: [
      {
        id: "L1",
        name: "Main Warehouse",
        stockOnHand: 30,
        availableStock: 20,
        reservedStock: 10
      },
      {
        id: "L2",
        name: "Store Room",
        stockOnHand: 20,
        availableStock: 20,
        reservedStock: 0
      }
    ],
    movements: []
  },
  {
    id: "3",
    itemId: "ITEM003",
    itemCode: "SALT001",
    itemName: "Salt",
    category: "Seasonings",
    uom: "kg",
    currentStock: {
      totalStock: 0,
      valueOnHand: 0,
      averageCost: 25,
      lastPurchaseDate: "2024-02-28",
      lastMovementDate: "2024-03-15"
    },
    minStock: 10,
    maxStock: 100,
    locations: [],
    movements: []
  }
]

interface StockCardListProps {
  data?: StockCard[]
  isLoading?: boolean
  onViewDetails?: (itemId: string) => void
}

export function StockCardList({ data = mockData, isLoading = false, onViewDetails }: StockCardListProps) {
  const [groupBy, setGroupBy] = useState<'category' | null>(null)

  const groupedData = groupBy && data
    ? data.reduce<Record<string, StockCard[]>>((acc, item) => {
        const key = item[groupBy] as string
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {})
    : { "": data || [] }

  const getStockStatus = (item: StockCard) => {
    if (item.currentStock.totalStock <= 0) return { label: "Out of Stock", variant: "destructive" as const, bgColor: "bg-red-50" }
    if (item.currentStock.totalStock <= item.minStock) return { label: "Low Stock", variant: "secondary" as const, bgColor: "bg-yellow-50" }
    if (item.currentStock.totalStock >= item.maxStock) return { label: "Excess Stock", variant: "default" as const, bgColor: "bg-blue-50" }
    return { label: "In Stock", variant: "default" as const, bgColor: "bg-green-50" }
  }

  const calculateGroupTotals = (items: StockCard[]) => {
    return items.reduce((acc, item) => ({
      stockOnHand: acc.stockOnHand + item.currentStock.totalStock,
      availableStock: acc.availableStock + item.locations.reduce((sum: number, loc) => sum + loc.availableStock, 0),
      reservedStock: acc.reservedStock + item.locations.reduce((sum: number, loc) => sum + loc.reservedStock, 0),
      valueOnHand: acc.valueOnHand + item.currentStock.valueOnHand
    }), {
      stockOnHand: 0,
      availableStock: 0,
      reservedStock: 0,
      valueOnHand: 0
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="h-full flex-1 flex flex-col gap-4 p-4 md:p-6">
      <Card className="bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <span className="font-medium">Group by:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white">
                  {groupBy ? groupBy.replace(/([A-Z])/g, " $1").toLowerCase() : "None"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setGroupBy(null)}>
                  None
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("category")}>
                  Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px]">Item Code</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="w-[100px]">UOM</TableHead>
                <TableHead className="text-right w-[130px]">
                  <div className="flex items-center justify-end">
                    Stock on Hand
                    <ArrowUpDown className="ml-1 h-4 w-4 shrink-0" />
                  </div>
                </TableHead>
                <TableHead className="text-right w-[130px]">
                  <div className="flex items-center justify-end">
                    Available
                    <ArrowUpDown className="ml-1 h-4 w-4 shrink-0" />
                  </div>
                </TableHead>
                <TableHead className="text-right w-[130px]">
                  <div className="flex items-center justify-end">
                    Reserved
                    <ArrowUpDown className="ml-1 h-4 w-4 shrink-0" />
                  </div>
                </TableHead>
                <TableHead className="text-right w-[130px]">
                  <div className="flex items-center justify-end">
                    Value
                    <ArrowUpDown className="ml-1 h-4 w-4 shrink-0" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedData).map(([group, items]) => (
                <>
                  {group && (
                    <TableRow key={`group-${group}`} className="hover:bg-transparent">
                      <TableCell colSpan={9} className="font-medium">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4" />
                          {group}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {(items as StockCard[]).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.itemCode}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.uom}</TableCell>
                      <TableCell className="text-right">{item.currentStock.totalStock}</TableCell>
                      <TableCell className="text-right">
                        {item.locations.reduce((sum: number, loc) => sum + loc.availableStock, 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.locations.reduce((sum: number, loc) => sum + loc.reservedStock, 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(item.currentStock.valueOnHand)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStockStatus(item).variant}>
                          {getStockStatus(item).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => onViewDetails?.(item.id)}>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails?.(item.id)}>
                              View details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {group && items && items.length > 0 && (
                    <TableRow className="hover:bg-transparent bg-muted/50">
                      <TableCell colSpan={3} className="font-medium">
                        Group Total
                      </TableCell>
                      {(() => {
                        const totals = calculateGroupTotals(items as StockCard[])
                        return (
                          <>
                            <TableCell className="text-right font-medium">
                              {totals.stockOnHand}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {totals.availableStock}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {totals.reservedStock}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(totals.valueOnHand)}
                            </TableCell>
                            <TableCell colSpan={2}></TableCell>
                          </>
                        )
                      })()}
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
} 