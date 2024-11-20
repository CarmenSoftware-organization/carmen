'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Printer, 
  Edit2, 
  XCircle,
  Calendar,
  Building2,
  Store,
  FileText,
  Hash,
  Check,
  X,
  Calculator,
  Package
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import StatusBadge from '@/components/ui/custom-status-badge'
import { HeaderActions } from './header-actions'
import { HeaderInformation } from './header-information'
import { StockMovementTable } from './stock-movement/stock-movement-table'
import { JournalHeader } from './journal-entries/journal-header'
import { JournalTable } from './journal-entries/journal-table'
import { InventoryAdjustment, JournalEntry, JournalHeader as JournalHeaderType } from './types'

interface InventoryAdjustmentDetailProps {
  id: string
}

// Mock data with corrected types
const mockAdjustment: InventoryAdjustment = {
  id: "ADJ-2024-0001",
  date: "2024-01-15",
  type: "IN",
  status: "Draft",
  location: "Main Warehouse",
  locationCode: "WH-001",
  reason: "Stock Count Adjustment",
  description: "Adjustment based on physical inventory count",
  department: "Warehouse",
  items: [
    {
      id: "ITEM-001",
      productName: "Product A",
      sku: "SKU-001",
      location: {
        type: "INV",
        code: "WH-001",
        name: "Main Warehouse"
      },
      lots: [
        {
          lotNo: "LOT-001",
          quantity: 10,
          uom: "PCS"
        },
        {
          lotNo: "LOT-002",
          quantity: -5,
          uom: "PCS"
        }
      ],
      uom: "PCS",
      unitCost: 100,
      totalCost: 500
    }
  ],
  totals: {
    inQty: 10,
    outQty: 5,
    totalCost: 500
  }
}

const mockJournalEntries: {
  header: JournalHeaderType
  entries: JournalEntry[]
} = {
  header: {
    status: "Draft",
    journalNo: "JE-2024-0001",
    postingDate: "2024-01-15",
    postingPeriod: "2024-01",
    description: "Inventory Adjustment Entry",
    reference: "ADJ-2024-0001",
    createdBy: "John Doe",
    createdAt: "2024-01-15 10:00:00",
    postedBy: "",
    postedAt: ""
  },
  entries: [
    {
      id: "JE-001",
      account: "Inventory",
      accountCode: "1100",
      department: "Warehouse",
      description: "Stock adjustment - Product A",
      debit: 500,
      credit: 0
    },
    {
      id: "JE-002",
      account: "Inventory Adjustment",
      accountCode: "5100",
      department: "Warehouse",
      description: "Stock adjustment - Product A",
      debit: 0,
      credit: 500
    }
  ]
}

export function InventoryAdjustmentDetail({ id }: InventoryAdjustmentDetailProps) {
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)

  const handleHeaderUpdate = (field: string, value: string) => {
    console.log('Updating header field:', field, value)
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
              <TabsTrigger value="stock" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Stock Movement
              </TabsTrigger>
              <TabsTrigger value="journal" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Journal Entries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stock">
              <StockMovementTable items={mockAdjustment.items} />
            </TabsContent>

            <TabsContent value="journal">
              <JournalHeader header={mockJournalEntries.header} />
              <JournalTable entries={mockJournalEntries.entries} />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}
