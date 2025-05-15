'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  ChevronLeft,
  Save,
  Lock,
  FileText,
  Printer,
  Plus,
  Trash2,
  Search,
  Edit
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Add these constants at the top of the file after imports

// Location Types and their allowed movements
const INVENTORY_LOCATIONS = [
  { id: 'WH-MAIN', name: 'Main Warehouse', type: 'inventory' },
  { id: 'WH-SUB1', name: 'Sub Warehouse 1', type: 'inventory' },
  { id: 'WH-SUB2', name: 'Sub Warehouse 2', type: 'inventory' }
] as const

const DIRECT_ISSUE_LOCATIONS = [
  { id: 'FB-MAIN', name: 'F&B - Main Kitchen', type: 'direct', department: 'F&B' },
  { id: 'FB-BAR', name: 'F&B - Pool Bar', type: 'direct', department: 'F&B' },
  { id: 'FB-BQT', name: 'F&B - Banquet', type: 'direct', department: 'F&B' },
  { id: 'FB-PST', name: 'F&B - Pastry Kitchen', type: 'direct', department: 'F&B' },
  { id: 'HK-SUP', name: 'Housekeeping - Supplies', type: 'direct', department: 'Housekeeping' }
] as const

// Transaction Types
const TRANSACTION_TYPES = {
  INVENTORY: {
    TRANSFER_IN: {
      id: 'TRANSFER_IN',
      name: 'Transfer In',
      description: 'Receive stock from another inventory location',
      requiresSource: true,
      requiresApproval: false
    },
    PURCHASE_RECEIVE: {
      id: 'PURCHASE_RECEIVE',
      name: 'Purchase Receive',
      description: 'Receive stock from vendor purchase',
      requiresVendor: true,
      requiresApproval: true
    }
  },
  DIRECT: {
    PURCHASE_RECEIVE: {
      id: 'PURCHASE_RECEIVE',
      name: 'Purchase Receive',
      description: 'Receive stock from vendor',
      requiresVendor: true,
      requiresApproval: true
    },
    TRANSFER_IN: {
      id: 'TRANSFER_IN',
      name: 'Transfer In',
      description: 'Receive stock from inventory location',
      requiresSource: true,
      requiresApproval: true
    }
  }
} as const

interface StockInDetailProps {
  mode: 'view' | 'edit' | 'add'
  onClose: () => void
  data: {
    id: number
    date: string
    refNo: string
    type: 'Good Receive Note' | 'Transfer' | 'Credit Note' | 'Issue Return' | 'Adjustment'
    relatedDoc: string
    store: string
    name: string
    description: string
    totalQty: number
    status: 'Committed' | 'Saved' | 'Void'
    createdBy: string
    createdDate: string
    modifiedBy: string
    modifiedDate: string
    commitDate?: string
    committedBy?: string
    items?: Array<{
      id: number
      store: string
      itemCode: string
      description: string
      unit: string
      qty: number
      unitCost: number
      category: string
      subCategory: string
      itemGroup: string
      barCode?: string
      comment?: string
      inventoryInfo: {
        onHand: number
        onOrdered: number
        reorder: number
        restock: number
        lastPrice: number
        lastVendor: string
      }
    }>
    movements?: Array<{
      commitDate: string
      location: string
      itemDescription: string
      inventoryUnit: string
      stockIn: number
      stockOut: number
      amount: number
      reference: string
    }>
    comments?: Array<{
      id: number
      date: string
      by: string
      comment: string
    }>
    attachments?: Array<{
      id: number
      fileName: string
      description: string
      isPublic: boolean
      date: string
      by: string
    }>
    activityLog?: Array<{
      date: string
      by: string
      action: string
      log: string
    }>
  } | null | undefined
}

// Add this helper function to determine the location type
const getLocationType = (storeId: string) => {
  if (INVENTORY_LOCATIONS.some(loc => loc.id === storeId)) return 'inventory'
  if (DIRECT_ISSUE_LOCATIONS.some(loc => loc.id === storeId)) return 'direct'
  return null
}

export function StockInDetail({ mode, onClose, data }: StockInDetailProps) {
  const isViewMode = mode === 'view'
  const isEditMode = mode === 'edit'
  const isAddMode = mode === 'add'

  // Fix the state initialization
  const [selectedMovementType, setSelectedMovementType] = React.useState(
    data?.store ? 
      getLocationType(data.store) === 'inventory' ? 
        TRANSACTION_TYPES.INVENTORY.TRANSFER_IN.id : 
        TRANSACTION_TYPES.DIRECT.PURCHASE_RECEIVE.id
      : ''
  )

  // Get location type based on store
  const locationType = data?.store ? getLocationType(data.store) : null

  const handleSave = () => {
    // Handle save logic
    console.log('Saving...')
  }

  const handleCommit = () => {
    // Handle commit logic
    console.log('Committing...')
  }

  return (
    <div className="px-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {isAddMode ? 'New Stock In' : `Stock In - ${data?.refNo || ''}`}
            </h1>
          </div>
          <div className="flex gap-2">
            {!isViewMode && (
              <>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCommit}>
                  <Lock className="h-4 w-4 mr-2" />
                  Commit
                </Button>
              </>
            )}
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference No</label>
                  <Input 
                    value={data?.refNo || ''} 
                    disabled={isViewMode}
                    placeholder="Auto-generated"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input 
                    type="date" 
                    value={data?.date || ''} 
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    disabled={isViewMode} 
                    value={data?.type || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good Receive Note">Good Receive Note</SelectItem>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                      <SelectItem value="Credit Note">Credit Note</SelectItem>
                      <SelectItem value="Issue Return">Issue Return</SelectItem>
                      <SelectItem value="Adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Related Document #</label>
                  <Input 
                    value={data?.relatedDoc || ''} 
                    disabled={isViewMode}
                    placeholder="Enter related document number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select 
                  disabled={isViewMode} 
                  value={data?.store || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location">
                      {data?.name || 'Select location'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WH-001">Main Warehouse</SelectItem>
                    <SelectItem value="WH-002">Branch Store A</SelectItem>
                    <SelectItem value="WH-003">Branch Store B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={data?.description || ''} 
                  disabled={isViewMode}
                  placeholder="Enter description"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Input value={data?.status || ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Quantity</label>
                  <Input value={data?.totalQty?.toLocaleString() || ''} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Created By</label>
                  <Input value={data?.createdBy || ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Created Date</label>
                  <Input value={data?.createdDate || ''} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modified By</label>
                  <Input value={data?.modifiedBy || ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modified Date</label>
                  <Input value={data?.modifiedDate || ''} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="w-full flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger 
              value="items"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Items
            </TabsTrigger>
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="direct">Direct</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items</CardTitle>
                {!isViewMode && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search items..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          {!isViewMode && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data?.items?.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.itemCode}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{item.description}</div>
                              <div className="text-xs text-gray-500">
                                {item.category} / {item.subCategory} / {item.itemGroup}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.unit}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.qty.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.unitCost.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'THB'
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {(item.qty * item.unitCost).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'THB'
                              })}
                            </td>
                            {!isViewMode && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8"
                                    title="Edit Item"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete Item"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      {data?.items && data.items.length > 0 && (
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                              Total:
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {data?.items?.reduce((sum, item) => sum + item.qty, 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {(data?.items?.reduce((sum, item) => sum + item.unitCost, 0) / (data?.items?.length || 1)).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'THB'
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {data?.items?.reduce((sum, item) => sum + (item.qty * item.unitCost), 0).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'THB'
                              })}
                            </td>
                            {!isViewMode && <td></td>}
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transaction">
            <div className="space-y-4">
              {/* Header Information */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Journal Entry Details</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Reference: {data?.refNo} | Document: {data?.relatedDoc}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Export Journal
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Transaction Total Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col">
                    <span className="text-lg font-medium">Total Transaction Value</span>
                    <span className="text-3xl font-bold mt-2">
                      {data?.items?.reduce((sum, item) => sum + (item.qty * item.unitCost), 0)
                        .toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'THB'
                        })}
                    </span>
                    <div className="mt-2 text-sm text-gray-500">
                      Total Items: {data?.items?.length || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Journal Entries Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Journal Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data?.items && [
                          // Debit Entry
                          {
                            accountCode: '1140',
                            accountName: 'Inventory',
                            department: 'Inventory Control',
                            debit: data.items.reduce((sum, item) => sum + (item.qty * item.unitCost), 0),
                            credit: 0,
                            description: `Inventory receipt - ${data.relatedDoc}`,
                            items: data.items
                          },
                          // Credit Entry
                          {
                            accountCode: '2100',
                            accountName: 'Accounts Payable',
                            department: 'Finance',
                            debit: 0,
                            credit: data.items.reduce((sum, item) => sum + (item.qty * item.unitCost), 0),
                            description: `Supplier payable - ${data.items[0]?.inventoryInfo.lastVendor || 'Unknown Vendor'}`,
                            items: []
                          }
                        ].map((entry, index) => (
                          <React.Fragment key={index}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {entry.accountCode}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {entry.accountName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {entry.department}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {entry.debit > 0 ? entry.debit.toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'THB'
                                }) : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {entry.credit > 0 ? entry.credit.toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'THB'
                                }) : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {entry.description}
                              </td>
                            </tr>
                            {entry.items && entry.items.length > 0 && (
                              <tr className="bg-gray-50">
                                <td colSpan={6} className="px-6 py-2">
                                  <div className="text-xs text-gray-500">
                                    <div className="grid grid-cols-4 gap-4">
                                      {entry.items.map((item, idx) => (
                                        <div key={idx} className="border-l pl-2">
                                          <div className="font-medium">{item.description}</div>
                                          <div className="flex justify-between mt-1">
                                            <span>{item.qty} {item.unit} × {item.unitCost.toLocaleString('en-US', {
                                              style: 'currency',
                                              currency: 'THB'
                                            })}</span>
                                            <span className="font-medium">{(item.qty * item.unitCost).toLocaleString('en-US', {
                                              style: 'currency',
                                              currency: 'THB'
                                            })}</span>
                                          </div>
                                          <div className="text-gray-400 mt-1">
                                            Store: {item.store}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                        <tr className="bg-gray-100 font-medium">
                          <td colSpan={3} className="px-6 py-4 text-sm text-right">Total</td>
                          <td className="px-6 py-4 text-sm text-right">
                            {data?.items?.reduce((sum, item) => sum + (item.qty * item.unitCost), 0)
                              .toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'THB'
                              })}
                          </td>
                          <td className="px-6 py-4 text-sm text-right">
                            {data?.items?.reduce((sum, item) => sum + (item.qty * item.unitCost), 0)
                              .toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'THB'
                              })}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertDescription>
                  Stock In transactions are recorded under the Inventory Control department.
                  All items are debited to the Inventory account regardless of their destination store.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Movement Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document Info</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movement Info</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Impact</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data?.movements?.filter(movement => 
                          INVENTORY_LOCATIONS.some(loc => loc.id === movement.location)
                        ).map((movement, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {movement.itemDescription}
                              </div>
                              <div className="text-sm text-gray-500">
                                Unit: {movement.inventoryUnit}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {data?.type}
                              </div>
                              <div className="text-sm text-gray-500">
                                Ref: {movement.reference}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                Type: {TRANSACTION_TYPES.INVENTORY.TRANSFER_IN.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                From: {movement.location}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                In: {movement.stockIn}
                              </div>
                              <div className="text-sm text-gray-500">
                                Out: {movement.stockOut}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                DR: Inventory (1140)
                              </div>
                              <div className="text-sm text-gray-500">
                                Amount: {movement.amount.toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'THB'
                                })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="direct">
            <Card>
              <CardHeader>
                <CardTitle>Direct Issue Movement Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document Info</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Impact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data?.movements?.filter(movement => 
                          DIRECT_ISSUE_LOCATIONS.some(loc => loc.id === movement.location)
                        ).map((movement, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {movement.commitDate}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {data?.type}
                              </div>
                              <div className="text-sm text-gray-500">
                                Ref: {movement.reference}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {movement.location}
                              </div>
                              <div className="text-sm text-gray-500">
                                Type: {TRANSACTION_TYPES.DIRECT.PURCHASE_RECEIVE.name}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {movement.itemDescription}
                              </div>
                              <div className="text-sm text-gray-500">
                                Qty: {movement.stockIn} {movement.inventoryUnit}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                DR: Department Expense
                              </div>
                              <div className="text-sm text-gray-500">
                                Amount: {movement.amount.toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'THB'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {TRANSACTION_TYPES.DIRECT.PURCHASE_RECEIVE.requiresApproval ? (
                                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                    Pending Approval
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                    Approved
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardContent>
                {/* Add comments section here */}
                <div className="text-sm text-gray-500">Comments section will go here</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments">
            <Card>
              <CardContent>
                {/* Add attachments section here */}
                <div className="text-sm text-gray-500">Attachments section will go here</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 