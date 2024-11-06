'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
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
  Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Box } from 'lucide-react'

interface StoreRequisitionDetailProps {
  id: string
}

// This would come from your API/database
const mockRequisition = {
  refNo: 'SR-2024-001',
  date: '2024-01-15',
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
        itemName: 'Thai Milk Tea',
        category: 'Beverage',
        subCategory: 'Tea',
        itemGroup: 'Packaged Drinks',
        barCode: '8851234567890'
      }
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
        itemName: 'Premium Coffee Beans',
        category: 'Beverage',
        subCategory: 'Coffee',
        itemGroup: 'Raw Materials',
        barCode: '8851234567891'
      }
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
        itemName: 'Paper Cup 16oz',
        category: 'Packaging',
        subCategory: 'Cups',
        itemGroup: 'Disposables',
        barCode: '8851234567892'
      }
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
        itemName: 'Chocolate Syrup',
        category: 'Ingredients',
        subCategory: 'Syrups',
        itemGroup: 'Flavorings',
        barCode: '8851234567893'
      }
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
        itemName: 'Plastic Straw',
        category: 'Packaging',
        subCategory: 'Straws',
        itemGroup: 'Disposables',
        barCode: '8851234567894'
      }
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
        itemName: 'Green Tea Powder',
        category: 'Beverage',
        subCategory: 'Tea',
        itemGroup: 'Raw Materials',
        barCode: '8851234567895'
      }
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

export function StoreRequisitionDetailComponent({ id }: StoreRequisitionDetailProps) {
  const router = useRouter()
  const [items, setItems] = useState(mockRequisition.items)

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
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Store Requisition Details</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {mockRequisition.status}
            </span>
            <div className="flex items-center gap-2">
            <Button 
                className="flex items-center gap-2"
                onClick={() => console.log('Edit requisition')}
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
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
              <Tags className="h-4 w-4" />
              <span>Movement Type</span>
            </div>
            <p className="font-medium">{mockRequisition.movementType}</p>
          </div>

          {/* Column 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Building2 className="h-4 w-4" />
              <span>Department</span>
            </div>
            <p className="font-medium">{mockRequisition.department}</p>
          </div>
          
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
              Item Details
            </TabsTrigger>
            <TabsTrigger value="stock-movements" className="flex items-center gap-2 px-6">
              <Box className="h-4 w-4" />
              Stock Movements
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
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Items List</h3>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => console.log('Add new item')}
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Location</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Item Name</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Description</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Unit</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500">Required</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500">Approved</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500">Cost/Unit</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500">Total</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500 w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => (
                      <>
                        {/* Primary Information Row */}
                        <tr key={item.id} className="group hover:bg-gray-50">
                          <td className="p-4">
                            <p className="truncate max-w-[150px]">{item.itemInfo.location}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-gray-600">{item.itemInfo.itemName}</p>
                          </td>
                          <td className="p-4">
                            <p className="truncate max-w-[200px]">{item.description}</p>
                          </td>
                          <td className="p-4">
                            <p>{item.unit}</p>
                          </td>
                          <td className="p-4 text-right">
                            <p>{item.qtyRequired}</p>
                          </td>
                          <td className="p-4 text-right">
                            <p>{item.qtyApproved}</p>
                          </td>
                          <td className="p-4 text-right">
                            <p>{item.costPerUnit.toFixed(2)}</p>
                          </td>
                          <td className="p-4 text-right">
                            <p className="font-medium">{item.total.toFixed(2)}</p>
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
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Stock Movements</h3>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Lot Number</TableHead>
                      <TableHead>Inventory Unit</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-right">Net Amount</TableHead>
                      <TableHead className="text-right">Extra Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStockMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{movement.toLocation}</TableCell>
                        <TableCell>
                          <div>{movement.itemName}</div>
                          <div className="text-sm text-gray-500">{movement.itemDescription}</div>
                        </TableCell>
                        <TableCell>{movement.lotNumber}</TableCell>
                        <TableCell>{movement.unit}</TableCell>
                        <TableCell className="text-right">{movement.quantity}</TableCell>
                        <TableCell className="text-right">{movement.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{movement.totalCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{movement.netAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{movement.extraCost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
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
          <div className="grid grid-cols-4 gap-8">
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
              variant="outline"
              onClick={() => console.log('Cancel')}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log('Save Draft')}
            >
              Save Draft
            </Button>
            <Button
              onClick={() => console.log('Submit')}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
} 