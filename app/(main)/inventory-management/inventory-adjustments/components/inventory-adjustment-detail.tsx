'use client'

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from "@/components/ui/checkbox"
import {
  FileText,
  X,
  Calculator,
  Package,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'

import { HeaderInformation } from "./header-information"
import { HeaderActions } from "./header-actions"
import { StockMovementTable } from "./stock-movement/stock-movement-table"
import { JournalHeader } from "./journal-entries/journal-header"
import { JournalTable } from "./journal-entries/journal-table"
import StatusBadge from "@/components/ui/custom-status-badge"
import { StockMovementItem, JournalEntry, JournalHeader as JournalHeaderType } from "./types"

interface InventoryAdjustmentDetailProps {
  id: string
}

interface AdjustmentItem {
  id: string
  productName: string
  sku: string
  description?: string
  location: string
  locationCode: string
  uom: string
  requiredQuantity: number
  approvedQuantity: number
  issuedQuantity: number
  price: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  onHand: number
  onOrder: number
  lastPrice?: number
  lastVendor?: string
  lots: {
    id: string
    lotNumber: string
    quantity: number
    uom: string
  }[]
  unitCost: number
  totalCost: number
}

interface InventoryAdjustment {
  id: string
  date: string
  type: string
  status: string
  location: string
  locationCode: string
  department: string
  reason: string
  description: string
  items: AdjustmentItem[]
  totals: {
    inQty: number
    outQty: number
    totalCost: number
  }
}

interface Item {
  id: string
  code: string
  name: string
  description?: string
  unit: string
  quantity: number
  currentStock: number
  adjustedStock: number
  status: 'good' | 'damaged' | 'expired'
}

const mockAdjustment: InventoryAdjustment = {
  id: "ADJ-2024-001",
  date: "2024-01-15",
  type: "IN",
  status: "Posted",
  location: "Main Warehouse",
  locationCode: "WH-001",
  department: "Warehouse",
  reason: "Physical Count Variance",
  description: "Adjustment based on monthly physical inventory count",
  items: [
    {
      id: "ITEM-001",
      productName: "Organic Quinoa",
      sku: "GRN-QNA-001",
      description: "Premium organic white quinoa, high in protein and gluten-free",
      location: "Main Warehouse",
      locationCode: "WH-001",
      uom: "KG",
      requiredQuantity: 25,
      approvedQuantity: 25,
      issuedQuantity: 25,
      price: 45.50,
      status: 'pending',
      onHand: 50,
      onOrder: 20,
      lastPrice: 45.50,
      lastVendor: 'Vendor A',
      lots: [
        {
          id: "LOT-001",
          lotNumber: "L240115-001",
          quantity: 25,
          uom: "KG"
        },
        {
          id: "LOT-002",
          lotNumber: "L240115-002",
          quantity: -8,
          uom: "KG"
        }
      ],
      unitCost: 45.50,
      totalCost: 772.50,
    },
    {
      id: "ITEM-002",
      productName: "Brown Rice",
      sku: "GRN-RCE-002",
      description: "Whole grain brown rice, rich in fiber and nutrients",
      location: "Main Warehouse",
      locationCode: "WH-001",
      uom: "KG",
      requiredQuantity: 50,
      approvedQuantity: 50,
      issuedQuantity: 50,
      price: 28.75,
      status: 'pending',
      onHand: 70,
      onOrder: 30,
      lastPrice: 28.75,
      lastVendor: 'Vendor B',
      lots: [
        {
          id: "LOT-003",
          lotNumber: "L240115-003",
          quantity: 50,
          uom: "KG"
        },
        {
          id: "LOT-004",
          lotNumber: "L240115-004",
          quantity: -15,
          uom: "KG"
        }
      ],
      unitCost: 28.75,
      totalCost: 1006.25,
    },
    {
      id: "ITEM-003",
      productName: "Chia Seeds",
      sku: "GRN-CHA-003",
      description: "Organic black chia seeds, high in omega-3 fatty acids",
      location: "Main Warehouse",
      locationCode: "WH-001",
      uom: "KG",
      requiredQuantity: 30,
      approvedQuantity: 30,
      issuedQuantity: 30,
      price: 53.35,
      status: 'pending',
      onHand: 40,
      onOrder: 10,
      lastPrice: 53.35,
      lastVendor: 'Vendor C',
      lots: [
        {
          id: "LOT-005",
          lotNumber: "L240115-005",
          quantity: 30,
          uom: "KG"
        },
        {
          id: "LOT-006",
          lotNumber: "L240115-006",
          quantity: -10,
          uom: "KG"
        }
      ],
      unitCost: 53.35,
      totalCost: 1066.75,
    }
  ],
  totals: {
    inQty: 105,
    outQty: 33,
    totalCost: 2845.50
  }
}

const mockJournalEntries: {
  header: JournalHeaderType
  entries: JournalEntry[]
} = {
  header: {
    status: "Posted",
    journalNo: "JE-2024-001",
    postingDate: "2024-01-15",
    postingPeriod: "2024-01",
    description: "Inventory Adjustment - Physical Count Variance",
    reference: "ADJ-2024-001",
    createdBy: "John Smith",
    createdAt: "2024-01-15 09:30:00",
    postedBy: "Sarah Johnson",
    postedAt: "2024-01-15 14:45:00"
  },
  entries: [
    {
      id: "JE-001",
      account: "1310",
      accountName: "Raw Materials Inventory",
      debit: 2845.50,
      credit: 0,
      department: "Warehouse",
      reference: "ADJ-2024-001"
    },
    {
      id: "JE-002",
      account: "5110",
      accountName: "Inventory Variance",
      debit: 0,
      credit: 2845.50,
      department: "Warehouse",
      reference: "ADJ-2024-001"
    }
  ]
}

export function InventoryAdjustmentDetail({ id }: InventoryAdjustmentDetailProps) {
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState("stock")

  const handleHeaderUpdate = (field: string, value: string) => {
    console.log('Updating header field:', field, value)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      good: "default",
      damaged: "destructive",
      expired: "warning",
    }
    return variants[status as keyof typeof variants] || "secondary"
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-6">
          <HeaderActions
            status={mockAdjustment.status}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
          />

          <HeaderInformation
            data={mockAdjustment}
            isEditMode={isEditMode}
            onUpdate={handleHeaderUpdate}
          />

          <Tabs defaultValue="stock" className="w-full">
            <TabsList>
            <TabsTrigger value="items" className="flex items-center gap-2">
                <FileText className="h-4 w-4 mr-2" />
                Items
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Stock Movement
              </TabsTrigger>
              <TabsTrigger value="journal" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Journal Entries
              </TabsTrigger>
              
            </TabsList>

            <TabsContent value="stock" className="mt-4">
              <StockMovementTable 
                items={mockAdjustment.items.map(item => ({
                  id: item.id,
                  productName: item.productName,
                  sku: item.sku,
                  location: {
                    type: "INV",
                    code: item.locationCode,
                    name: item.location
                  },
                  lots: item.lots.map(lot => ({
                    lotNo: lot.lotNumber,
                    quantity: lot.quantity,
                    uom: lot.uom
                  })),
                  uom: item.uom,
                  unitCost: item.unitCost,
                  totalCost: item.totalCost
                }))} 
              />
            </TabsContent>

            <TabsContent value="journal" className="mt-4">
              <JournalHeader header={mockJournalEntries.header} />
              <JournalTable entries={mockJournalEntries.entries} />
            </TabsContent>

            <TabsContent value="items" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Items Details</h3>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[80px]">Unit</TableHead>
                    <TableHead className="text-right">On Hand</TableHead>
                    <TableHead className="text-right">Adjustment</TableHead>
                    <TableHead className="text-right">Closing</TableHead>
                    <TableHead className="text-right">Total Price</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAdjustment.items.map((item) => (
                    <>
                      <TableRow key={item.id} className="group">
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.location}</div>
                          <div className="text-sm text-muted-foreground">{item.locationCode}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {item.productName}
                            <span className="ml-2 text-sm text-muted-foreground">
                              [{item.sku}]
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.description || 'No description available'}
                          </div>
                        </TableCell>
                        <TableCell>{item.uom}</TableCell>
                        <TableCell className="text-right">{item.onHand}</TableCell>
                        <TableCell className="text-right">{item.approvedQuantity}</TableCell>
                        <TableCell className="text-right">{item.issuedQuantity}</TableCell>
                        <TableCell className="text-right">
                          {(item.price * item.requiredQuantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={10} className="py-2">
                          <div className="flex gap-6 text-sm text-muted-foreground">
                            <span>On Order: {item.onOrder} {item.uom}</span>
                            <span>Last Price: {item.lastPrice?.toFixed(2)}</span>
                            <span>Last Vendor: {item.lastVendor || 'N/A'}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}
