'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
  Printer, 
  Edit2, 
  XCircle,
  MessageSquarePlus,
  Calendar,
  Building2,
  Store,
  FileText,
  Tags,
  Hash,
  ListTodo,
  MessageSquare,
  Paperclip,
  History,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Split,
  X,
  Calculator,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Box } from 'lucide-react'
import StatusBadge from '@/components/ui/custom-status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { ApprovalLogDialog } from './approval-log-dialog'
import { JournalEntriesTab } from './tabs/journal-entries-tab'

interface StoreRequisitionDetailProps {
  id: string
}

// This would come from your API/database
const mockRequisition = {
  refNo: 'SR-2024-001',
  date: '2024-01-15',
  expectedDeliveryDate: '2024-01-20',
  movementType: 'Issue',
  description: 'Monthly supplies request',
  requestedFrom: 'M01 : Main Store',
  department: 'F&B Operations',
  jobCode: 'N/A : Not Available',
  process: '',
  status: 'In Process',
  items: [
    {
      id: 1,
      description: 'Thai Milk Tea (12 pack)',
      unit: 'Box',
      qtyRequired: 10,
      qtyApproved: 8,
      costPerUnit: 120.00,
      total: 960.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 50,
        onOrder: 100,
        lastPrice: 118.00,
        lastVendor: 'Thai Beverages Co.'
      },
      itemInfo: {
        location: 'Central Kitchen',
        locationCode: 'CK001',
        itemName: 'Thai Milk Tea',
        category: 'Beverage',
        subCategory: 'Tea',
        itemGroup: 'Packaged Drinks',
        barCode: '8851234567890',
        locationType: 'direct'
      },
      qtyIssued: 5,
      approvalStatus: 'Accept'
    },
    {
      id: 2,
      description: 'Coffee Beans (1kg)',
      unit: 'Bag',
      qtyRequired: 15,
      qtyApproved: 15,
      costPerUnit: 250.00,
      total: 3750.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 30,
        onOrder: 50,
        lastPrice: 245.00,
        lastVendor: 'Premium Coffee Supply'
      },
      itemInfo: {
        location: 'Roastery Store',
        locationCode: 'RS001',
        itemName: 'Premium Coffee Beans',
        category: 'Beverage',
        subCategory: 'Coffee',
        itemGroup: 'Raw Materials',
        barCode: '8851234567891',
        locationType: 'inventory'
      },
      qtyIssued: 10,
      approvalStatus: 'Reject'
    },
    {
      id: 3,
      description: 'Paper Cups (16oz)',
      unit: 'Pack',
      qtyRequired: 20,
      qtyApproved: 20,
      costPerUnit: 85.00,
      total: 1700.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 100,
        onOrder: 200,
        lastPrice: 82.00,
        lastVendor: 'Packaging Solutions'
      },
      itemInfo: {
        location: 'Main Warehouse',
        locationCode: 'MW001',
        itemName: 'Paper Cup 16oz',
        category: 'Packaging',
        subCategory: 'Cups',
        itemGroup: 'Disposables',
        barCode: '8851234567892',
        locationType: 'direct'
      },
      qtyIssued: 15,
      approvalStatus: 'Accept'
    },
    {
      id: 4,
      description: 'Chocolate Syrup',
      unit: 'Bottle',
      qtyRequired: 8,
      qtyApproved: 6,
      costPerUnit: 180.00,
      total: 1080.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 15,
        onOrder: 30,
        lastPrice: 175.00,
        lastVendor: 'Sweet Supplies Co.'
      },
      itemInfo: {
        location: 'Central Kitchen',
        locationCode: 'CK001',
        itemName: 'Chocolate Syrup',
        category: 'Ingredients',
        subCategory: 'Syrups',
        itemGroup: 'Flavorings',
        barCode: '8851234567893',
        locationType: 'direct'
      },
      qtyIssued: 4,
      approvalStatus: 'Review'
    },
    {
      id: 5,
      description: 'Plastic Straws',
      unit: 'Pack',
      qtyRequired: 25,
      qtyApproved: 25,
      costPerUnit: 45.00,
      total: 1125.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 200,
        onOrder: 300,
        lastPrice: 43.00,
        lastVendor: 'Packaging Solutions'
      },
      itemInfo: {
        location: 'Main Warehouse',
        locationCode: 'MW001',
        itemName: 'Plastic Straw',
        category: 'Packaging',
        subCategory: 'Straws',
        itemGroup: 'Disposables',
        barCode: '8851234567894',
        locationType: 'direct'
      },
      qtyIssued: 20,
      approvalStatus: 'Accept'
    },
    {
      id: 6,
      description: 'Green Tea Powder',
      unit: 'Kg',
      qtyRequired: 5,
      qtyApproved: 4,
      costPerUnit: 320.00,
      total: 1280.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 8,
        onOrder: 20,
        lastPrice: 315.00,
        lastVendor: 'Tea Suppliers Inc.'
      },
      itemInfo: {
        location: 'Central Kitchen',
        locationCode: 'CK001',
        itemName: 'Green Tea Powder',
        category: 'Beverage',
        subCategory: 'Tea',
        itemGroup: 'Raw Materials',
        barCode: '8851234567895',
        locationType: 'direct'
      },
      qtyIssued: 3,
      approvalStatus: 'Reject'
    }
  ],
  comments: [
    {
      id: 1,
      date: '2024-01-15',
      by: 'John Doe',
      comment: 'Approved quantities adjusted based on current stock levels'
    }
  ],
  attachments: [
    {
      id: 1,
      fileName: 'requisition_details.pdf',
      description: 'Detailed specifications',
      isPublic: true,
      date: '2024-01-15',
      by: 'John Doe'
    }
  ],
  activityLog: [
    {
      id: 1,
      date: '2024-01-15',
      by: 'John Doe',
      action: 'Created',
      log: 'Store requisition created'
    }
  ]
}

// Add mock data for stock movements
const mockStockMovements = [
  {
    id: 1,
    toLocation: 'Central Kitchen',
    itemName: 'Thai Milk Tea',
    itemDescription: 'Thai Milk Tea (12 pack)',
    lotNumber: 'LOT-2024-001',
    unit: 'Box',
    quantity: 8,
    cost: 120.00,
    totalCost: 960.00,
    netAmount: 960.00,
    extraCost: 0
  },
  {
    id: 2,
    toLocation: 'Roastery Store',
    itemName: 'Premium Coffee Beans',
    itemDescription: 'Coffee Beans (1kg)',
    lotNumber: 'LOT-2024-002',
    unit: 'Bag',
    quantity: 15,
    cost: 250.00,
    totalCost: 3750.00,
    netAmount: 3750.00,
    extraCost: 0
  },
  {
    id: 3,
    toLocation: 'Main Warehouse',
    itemName: 'Paper Cup 16oz',
    itemDescription: 'Paper Cups (16oz)',
    lotNumber: 'LOT-2024-003',
    unit: 'Pack',
    quantity: 20,
    cost: 85.00,
    totalCost: 1700.00,
    netAmount: 1700.00,
    extraCost: 0
  }
]

// Add type for approval logs
interface ApprovalLogEntry {
  id: number
  date: string
  status: 'Accept' | 'Reject' | 'Review'
  by: string
  comments: string
}

interface ApprovalLogs {
  [key: number]: ApprovalLogEntry[]
}

// Update the mock data with proper typing
const mockApprovalLogs: ApprovalLogs = {
  1: [
    {
      id: 1,
      date: '2024-01-15 14:30',
      status: 'Accept',
      by: 'John Doe',
      comments: 'Quantity approved as requested'
    },
    {
      id: 2,
      date: '2024-01-15 10:15',
      status: 'Review',
      by: 'Jane Smith',
      comments: 'Please check stock availability'
    }
  ],
  2: [
    {
      id: 1,
      date: '2024-01-15 13:00',
      status: 'Reject',
      by: 'Mike Johnson',
      comments: 'Insufficient stock available'
    }
  ],
  3: [
    {
      id: 1,
      date: '2024-01-15 11:45',
      status: 'Accept',
      by: 'Sarah Wilson',
      comments: 'Approved as per request'
    }
  ]
} as const

// Add the ApprovalBadge component
function ApprovalBadge({ status }: { status: 'Accept' | 'Reject' | 'Review' }) {
  const styles = {
    Accept: 'bg-green-100 text-green-800',
    Reject: 'bg-red-100 text-red-800',
    Review: 'bg-yellow-100 text-yellow-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

// Add interface for movements
interface StockMovement {
  id: number
  movementType: string
  sourceDocument: string
  commitDate: string
  postingDate: string
  status: string
  movement: {
    source: string
    sourceName: string
    destination: string
    destinationName: string
    type: string
  }
  items: {
    id: number
    productName: string
    sku: string
    uom: string
    beforeQty: number
    inQty: number
    outQty: number
    afterQty: number
    unitCost: number
    totalCost: number
    location: {
      type: 'INV' | 'DIR'
      code: string
      name: string
      displayType: string
    }
    lots: {
      lotNo: string
      quantity: number
      uom: string
    }[]
  }[]
  totals: {
    inQty: number
    outQty: number
    totalCost: number
    lotCount: number
  }
}

// Update the mock movements data to reflect the requisition items
const movements: StockMovement[] = [
  {
    id: 1,
    movementType: 'STORE_REQUISITION',
    sourceDocument: mockRequisition.refNo,
    commitDate: mockRequisition.date,
    postingDate: mockRequisition.date,
    status: 'Posted',
    items: mockRequisition.items.map(item => ({
      id: item.id,
      productName: item.itemInfo.itemName,
      sku: item.description,
      uom: item.unit,
      beforeQty: item.inventory.onHand,
      inQty: 0,
      outQty: item.qtyIssued || 0,
      afterQty: item.inventory.onHand - (item.qtyIssued || 0),
      unitCost: item.costPerUnit,
      totalCost: (item.qtyIssued || 0) * item.costPerUnit,
      location: {
        type: item.itemInfo.locationType === 'inventory' ? 'INV' : 'DIR',
        code: item.itemInfo.locationCode,
        name: item.itemInfo.location,
        displayType: item.itemInfo.locationType === 'inventory' ? 'Inventory' : 'Direct'
      },
      lots: [
        {
          lotNo: `LOT-${mockRequisition.date}-${item.id.toString().padStart(3, '0')}`,
          quantity: -(item.qtyIssued || 0),
          uom: item.unit
        }
      ]
    })),
    movement: {
      source: 'Main Store',
      sourceName: 'Main Store',
      destination: mockRequisition.department,
      destinationName: mockRequisition.department,
      type: 'Store Requisition'
    },
    totals: {
      inQty: 0,
      outQty: mockRequisition.items.reduce((sum, item) => sum + (item.qtyIssued || 0), 0),
      totalCost: mockRequisition.items.reduce((sum, item) => sum + ((item.qtyIssued || 0) * item.costPerUnit), 0),
      lotCount: mockRequisition.items.length
    }
  }
]

export function StoreRequisitionDetailComponent({ id }: StoreRequisitionDetailProps) {
  const router = useRouter()
  const [items, setItems] = useState(mockRequisition.items)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isEditMode, setIsEditMode] = useState(false)

  const handleBulkAction = (action: 'Accept' | 'Reject' | 'Review' | 'Delete' | 'Split') => {
    if (!selectedItems.length) return

    switch (action) {
      case 'Accept':
      case 'Reject':
      case 'Review':
        setItems(items.map(item => 
          selectedItems.includes(item.id) 
            ? { ...item, approvalStatus: action }
            : item
        ))
        break
      case 'Delete':
        setItems(items.filter(item => !selectedItems.includes(item.id)))
        break
      case 'Split':
        console.log('Splitting items:', selectedItems)
        break
    }
    setSelectedItems([]) // Clear selection after action
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    }
  }

  const handleHeaderUpdate = (field: string, value: string) => {
    console.log('Updating header field:', field, value)
  }

  const handleQuantityUpdate = (itemId: number, field: 'qtyRequired' | 'qtyApproved' | 'qtyIssued', value: number) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, [field]: value }
        : item
    ))
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-6">
        {/* Top Actions */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <CardTitle>Store Requisition Details</CardTitle>
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {mockRequisition.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setIsEditMode(false)}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => {
                    // Save changes
                    setIsEditMode(false)
                  }}
                >
                  <Check className="h-4 w-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => console.log('Submit')}
                >
                  Submit
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => console.log('Print requisition')}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-red-600 hover:text-red-600"
              onClick={() => console.log('Void requisition')}
            >
              <XCircle className="h-4 w-4" />
              Void
            </Button>
          </div>
        </div>

        {/* Updated Header Information with 6 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {/* Column 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Hash className="h-4 w-4" />
              <span>Reference Number</span>
            </div>
            <p className="font-medium">{mockRequisition.refNo}</p>
          </div>
          
          {/* Column 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Date</span>
            </div>
            <p className="font-medium">{mockRequisition.date}</p>
          </div>
          
          {/* Column 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Expected Delivery</span>
            </div>
            {isEditMode ? (
              <Input
                type="date"
                value={mockRequisition.expectedDeliveryDate}
                onChange={(e) => handleHeaderUpdate('expectedDeliveryDate', e.target.value)}
                className="h-8"
              />
            ) : (
              <p className="font-medium">{mockRequisition.expectedDeliveryDate}</p>
            )}
          </div>
          
          {/* Column 4 */}
         
          {/* Column 5 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Store className="h-4 w-4" />
              <span>Requested From</span>
            </div>
            <p className="font-medium">{mockRequisition.requestedFrom}</p>
          </div>
          
          {/* Column 6 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>Job Code</span>
            </div>
            <p className="font-medium">{mockRequisition.jobCode}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Building2 className="h-4 w-4" />
              <span>Department</span>
            </div>
            <p className="font-medium">{mockRequisition.department}</p>
          </div>
          
          {/* Description - Spans full width */}
          <div className="xl:col-span-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>Description</span>
            </div>
            <p className="font-medium">{mockRequisition.description}</p>
          </div>
           
          
        </div>

        <Separator className="my-4" />
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="w-full justify-start border-b mb-4">
            <TabsTrigger value="items" className="flex items-center gap-2 px-6">
              <ListTodo className="h-4 w-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="stock-movements" className="flex items-center gap-2 px-6">
              <Box className="h-4 w-4" />
              Stock Movements
            </TabsTrigger>
            <TabsTrigger value="journal-entries" className="flex items-center gap-2 px-6">
              <Calculator className="h-4 w-4" />
              Journal Entries
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2 px-6">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex items-center gap-2 px-6">
              <Paperclip className="h-4 w-4" />
              Attachments
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2 px-6">
              <History className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Items Details</h3>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => console.log('Add new item')}
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {/* Add bulk actions buttons below the title */}
              {selectedItems.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    className="bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-2"
                    onClick={() => handleBulkAction('Accept')}
                  >
                    <Check className="h-4 w-4" />
                    Accept Selected ({selectedItems.length})
                  </Button>
                  <Button 
                    className="bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-2"
                    onClick={() => handleBulkAction('Reject')}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Selected ({selectedItems.length})
                  </Button>
                  <Button 
                    className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center gap-2"
                    onClick={() => handleBulkAction('Review')}
                  >
                    <AlertCircle className="h-4 w-4" />
                    Review Selected ({selectedItems.length})
                  </Button>
                  <Button 
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2"
                    onClick={() => handleBulkAction('Split')}
                  >
                    <Split className="h-4 w-4" />
                    Split Selected ({selectedItems.length})
                  </Button>
                </div>
              )}

              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 text-xs font-medium text-gray-500">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedItems.length === items.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Location</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Product</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Unit</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500">Required</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500">Approved</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500">Issued</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500">Total</th>
                      <th className="text-center p-4 text-xs font-medium text-gray-500">Status</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500 w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => (
                      <>
                        {/* Primary Information Row */}
                        <tr key={item.id} className="group hover:bg-gray-50">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <p className="font-medium">{item.itemInfo.location}</p>
                              <div className="flex flex-col gap-0.5">
                                <p className="text-sm text-gray-500">
                                  {item.itemInfo.locationCode} • {item.itemInfo.locationType === 'inventory' ? 'Inventory' : 'Direct'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-600">{item.itemInfo.itemName}</p>
                              <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p>{item.unit}</p>
                          </td>
                          <td className="p-4 text-right">
                            {isEditMode ? (
                              <Input
                                type="number"
                                value={item.qtyRequired}
                                onChange={(e) => handleQuantityUpdate(item.id, 'qtyRequired', parseInt(e.target.value))}
                                className="w-20 h-8 text-right"
                              />
                            ) : (
                              <p>{item.qtyRequired}</p>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {isEditMode ? (
                              <Input
                                type="number"
                                value={item.qtyApproved}
                                onChange={(e) => handleQuantityUpdate(item.id, 'qtyApproved', parseInt(e.target.value))}
                                className="w-20 h-8 text-right"
                              />
                            ) : (
                              <p>{item.qtyApproved}</p>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {isEditMode ? (
                              <Input
                                type="number"
                                value={item.qtyIssued || 0}
                                onChange={(e) => handleQuantityUpdate(item.id, 'qtyIssued', parseInt(e.target.value))}
                                className="w-20 h-8 text-right"
                              />
                            ) : (
                              <p>{item.qtyIssued || 0}</p>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <p className="font-medium">{item.total.toFixed(2)}</p>
                          </td>
                          <td className="p-4 text-center">
                            <ApprovalLogDialog 
                              itemId={item.id}
                              itemName={item.itemInfo.itemName}
                              logs={mockApprovalLogs[item.id] || []}
                            >
                              <div className="cursor-pointer">
                                <StatusBadge status={item.approvalStatus as 'Accept' | 'Reject' | 'Review'} />
                              </div>
                            </ApprovalLogDialog>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => console.log('Edit item', item.id)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-600"
                                onClick={() => {
                                  setItems(items.filter(i => i.id !== item.id))
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {/* Secondary Information Row */}
                        <tr className="bg-gray-50 border-b">
                          <td colSpan={9} className="px-4 py-2">
                            <div className="flex items-center gap-6 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">On Hand:</span>
                                <span className="text-gray-600">{item.inventory.onHand}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">On Order:</span>
                                <span className="text-gray-600">{item.inventory.onOrder}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">Last Price:</span>
                                <span className="text-gray-600">{item.inventory.lastPrice.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">Last Vendor:</span>
                                <span className="text-gray-600 truncate max-w-[300px]">{item.inventory.lastVendor}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stock-movements" className="mt-6">
            <div className="space-y-4 px-8">
              {/* Header with Add Item button on the right */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">Stock Movements</h1>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Filter</Button>
                    <Button variant="outline" size="sm">Print</Button>
                  </div>
                </div>
                <Button variant="default" size="sm">+ Add Item</Button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="w-1/2">
                  <Input
                    placeholder="Search by location, product name, or lot number..."
                    className="w-full"
                  />
                </div>
              </div>

              {/* Movements Table */}
              <Card>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot No.</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                          <th colSpan={2} className="px-6 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex flex-col items-center gap-1">
                              <span>STOCK</span>
                              <div className="flex justify-center gap-8 w-full border-t pt-1">
                                <div className="w-16 text-right">In</div>
                                <div className="w-16 text-right">Out</div>
                              </div>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {movements.map(movement => {
                          // Filter items to only show inventory transactions
                          const inventoryItems = movement.items.filter(item => item.location.type === 'INV');
                          
                          // Only render movement if it has inventory items
                          if (inventoryItems.length === 0) return null;

                          return (
                            <React.Fragment key={movement.id}>
                              {/* Movement Header */}
                              <tr className="bg-gray-50">
                                <td colSpan={8} className="px-6 py-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="text-blue-600">{movement.sourceDocument}</span>
                                      <span className="text-gray-400">|</span>
                                      <span className="text-gray-500">{movement.commitDate}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {movement.movement.source} → {movement.movement.destination}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              {/* Movement Items */}
                              {inventoryItems.map(item => 
                                item.lots.map((lot, lotIndex) => (
                                  <tr key={`${item.id}-${lot.lotNo}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {lotIndex === 0 ? (
                                        <div className="flex flex-col gap-1">
                                          <div className="text-sm font-medium text-gray-900">{item.location.name}</div>
                                          <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <span>{item.location.code}</span>
                                          </div>
                                        </div>
                                      ) : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {lotIndex === 0 ? (
                                        <div className="flex flex-col gap-1">
                                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                          <div className="text-sm text-gray-500">{item.sku}</div>
                                        </div>
                                      ) : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">{lot.lotNo}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {item.uom}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-800 text-right">
                                      {lot.quantity > 0 ? lot.quantity.toLocaleString() : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-800 text-right">
                                      {lot.quantity < 0 ? Math.abs(lot.quantity).toLocaleString() : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                      {item.unitCost.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-800 text-right">
                                      {(item.unitCost * Math.abs(lot.quantity)).toLocaleString()}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="journal-entries" className="mt-6">
            <JournalEntriesTab 
              refNo={mockRequisition.refNo}
              date={mockRequisition.date}
              department={mockRequisition.department}
              description={mockRequisition.description}
            />
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <div className="space-y-4">
              {mockRequisition.comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.by}</span>
                      <span className="text-gray-500 text-sm">{comment.date}</span>
                    </div>
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="mt-4">
            <div className="space-y-4">
              {mockRequisition.attachments.map((attachment) => (
                <div key={attachment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-semibold">{attachment.fileName}</p>
                        <p className="text-sm text-gray-500">{attachment.description}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>{attachment.date}</p>
                      <p>By: {attachment.by}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <div className="space-y-4">
              {mockRequisition.activityLog.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{activity.by}</span>
                      <span className="text-gray-500 text-sm">{activity.date}</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {activity.action}
                    </span>
                  </div>
                  <p className="text-sm">{activity.log}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Transaction Summary */}
      <div className="border-t">
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-4">Transaction Summary</h3>
          <div className="grid grid-cols-5 gap-8">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Items</div>
              <div className="text-lg font-medium">{items.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Quantity</div>
              <div className="text-lg font-medium">
                {items.reduce((sum, item) => sum + item.qtyRequired, 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Approved</div>
              <div className="text-lg font-medium">
                {items.reduce((sum, item) => sum + item.qtyApproved, 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Issued</div>
              <div className="text-lg font-medium">
                {items.reduce((sum, item) => sum + (item.qtyIssued || 0), 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Amount</div>
              <div className="text-lg font-medium">
                {items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Actions */}
      <div className="border-t bg-gray-50/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Last updated by John Doe on 15 Jan 2024 10:30 AM</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => console.log('Approve')}
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:bg-red-50"
              onClick={() => console.log('Reject')}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-orange-600 hover:bg-orange-50"
              onClick={() => console.log('Send Back')}
            >
              <ArrowLeft className="h-4 w-4" />
              Send Back
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
} 