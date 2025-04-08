'use client'

import { useState, Fragment } from "react"
import { ChevronDown, ChevronRight, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { StockCard } from "../types"

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

type GroupKey = 'category' | null
type StockStatus = {
  label: string
  variant: 'default' | 'destructive' | 'secondary'
  bgColor: string
}

export function StockCardList({ data = mockData, isLoading = false, onViewDetails }: StockCardListProps) {
  const [groupBy, setGroupBy] = useState<GroupKey>(null)

  const groupedData = groupBy
    ? data.reduce<Record<string, StockCard[]>>((acc, item) => {
        const key = item[groupBy] as string
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {})
    : { "": data }

  const getStockStatus = (item: StockCard): StockStatus => {
    if (item.currentStock.totalStock <= 0) return { label: "Out of Stock", variant: "destructive", bgColor: "bg-red-50" }
    if (item.currentStock.totalStock <= item.minStock) return { label: "Low Stock", variant: "secondary", bgColor: "bg-yellow-50" }
    if (item.currentStock.totalStock >= item.maxStock) return { label: "Excess Stock", variant: "default", bgColor: "bg-blue-50" }
    return { label: "In Stock", variant: "default", bgColor: "bg-green-50" }
  }

  return (
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
              <Fragment key={`group-${group}`}>
                {group && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={9} className="bg-muted/50">
                      <div className="flex items-center gap-2 py-1">
                        <ChevronRight className="h-4 w-4" />
                        <span className="font-medium">{group}</span>
                        <span className="text-muted-foreground text-sm">({items.length} items)</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item) => {
                  const status = getStockStatus(item)
                  const totalAvailable = item.locations.reduce((sum, loc) => sum + loc.availableStock, 0)
                  const totalReserved = item.locations.reduce((sum, loc) => sum + loc.reservedStock, 0)
                  
                  return (
                    <TableRow key={item.itemId} className="hover:bg-muted/30">
                      <TableCell className="font-medium w-[120px]">{item.itemCode}</TableCell>
                      <TableCell className="min-w-[200px]">{item.itemName}</TableCell>
                      <TableCell className="w-[100px]">{item.uom}</TableCell>
                      <TableCell className="text-right w-[130px] font-medium">
                        {item.currentStock.totalStock}
                      </TableCell>
                      <TableCell className="text-right w-[130px] text-muted-foreground">
                        {totalAvailable}
                      </TableCell>
                      <TableCell className="text-right w-[130px] text-muted-foreground">
                        {totalReserved}
                      </TableCell>
                      <TableCell className="text-right w-[130px] font-medium">
                        {item.currentStock.valueOnHand.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <Badge variant={status.variant} className={status.bgColor}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[70px]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails?.(item.itemId)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Export</DropdownMenuItem>
                            <DropdownMenuItem>Print</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </Fragment>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p>No items found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
} 