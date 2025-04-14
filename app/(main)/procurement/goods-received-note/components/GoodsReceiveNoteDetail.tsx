'use client'
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { GoodsReceiveNoteItems } from './tabs/GoodsReceiveNoteItems'
import { GoodsReceiveNoteMode, GoodsReceiveNote, GoodsReceiveNoteItem, ExtraCost, FinancialSummary, GoodsReceiveNoteStatus } from '@/lib/types'
import { ExtraCostsTab } from './tabs/ExtraCostsTab'
import { GoodsReceiveNoteItemsBulkActions } from './tabs/GoodsReceiveNoteItemsBulkActions'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { StockMovementTab } from './tabs/StockMovementTab'
import { ArrowLeft, Edit, Trash, Printer, Send, Save, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FinancialSummaryTab } from './tabs/FinancialSummaryTab'
import { ActivityLogTab } from './tabs/ActivityLogTab'
import StockMovementContent from './tabs/stock-movement'

interface GoodsReceiveNoteDetailProps {
  id?: string
  mode?: GoodsReceiveNoteMode
  onModeChange?: (mode: GoodsReceiveNoteMode) => void
  initialData?: GoodsReceiveNote
}

// Define a default empty GoodsReceiveNote object
const emptyGoodsReceiveNote: GoodsReceiveNote = {
  id: '',
  ref: '',
  selectedItems: [],
  date: new Date(),
  invoiceDate: new Date(),
  invoiceNumber: '',
  description: '',
  receiver: '',
  vendor: '',
  vendorId: '',
  location: '',
  currency: '',
  status: 'Pending',
  cashBook: '',
  items: [],
  stockMovements: [],
  isConsignment: false,
  isCash: false,
  extraCosts: [],
  comments: [],
  attachments: [],
  activityLog: [],
  financialSummary: null,
  exchangeRate: 0,
  baseCurrency: '',
  baseSubTotalPrice: 0,
  subTotalPrice: 0,
  baseNetAmount: 0,
  netAmount: 0,
  baseDiscAmount: 0,
  discountAmount: 0,
  baseTaxAmount: 0,
  taxAmount: 0,
  baseTotalAmount: 0,
  totalAmount: 0,
};

export function GoodsReceiveNoteDetail({ id, mode = 'view', onModeChange, initialData }: GoodsReceiveNoteDetailProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<GoodsReceiveNote>(initialData || emptyGoodsReceiveNote);
  const [extraCosts, setExtraCosts] = useState<ExtraCost[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
const [expandedItems, setExpandedItems] = useState<string[]>([])
  // useEffect(() => {
  //   console.log('formData', initialData)
  // }, [initialData]);

  const handleEditClick = () => {
    if (onModeChange) {
      onModeChange('edit');
    }
  };

  const handleExtraCostsChange = (costs: ExtraCost[]) => {
    setExtraCosts(costs);
  };

  const handleItemSelection = (itemId: string, isSelected: boolean) => {
    if (itemId === "") { // -1 indicates select all/deselect all
      if (isSelected) {
        setSelectedItems(formData.items.map(item => item.id))
      } else {
        setSelectedItems([])
      }
    } else {
      setSelectedItems(prev => 
        isSelected 
          ? [...prev, itemId]
          : prev.filter(id => id !== itemId)
      )
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Applying ${action} to items:`, selectedItems)
    // Implement bulk action logic here
    // For example:
    if (action === 'delete') {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => !selectedItems.includes(item.id))
      }))
    }
    // Implement other actions (changeQuantity, changePrice) as needed
    setSelectedItems([])
  }

  const handleSave = () => {
    // Implement save logic here
    console.log('Saving GRN:', formData)
    if (onModeChange) {
      onModeChange('view')
    }
  }

  const handleCancel = () => {
    // Navigate back to the list page
    router.push('/procurement/goods-received-note')
  }

  const handleBack = () => {
    router.push('/procurement/goods-received-note')
  }

  const calculateFinancialSummary = (): FinancialSummary => {
    const netAmount = formData.items.reduce((sum, item) => sum + item.netAmount, 0);
    const taxAmount = formData.items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = netAmount + taxAmount;

    // For this example, we'll assume a fixed exchange rate. In a real application,
    // you'd probably want to fetch this from an API or store it in the formData.
    const exchangeRate = 1.2; // Example: 1 USD = 1.2 Base Currency

    return {
      id: '1',  
      netAmount,
      taxAmount,
      totalAmount,
      currency: formData.currency,
      baseNetAmount: netAmount * exchangeRate,
      baseTaxAmount: taxAmount * exchangeRate,
      baseTotalAmount: totalAmount * exchangeRate,
      baseCurrency: 'USD', // Assuming USD is the base currency
      jvType: 'GRN', // You might want to determine this based on some logic
      jvNumber: `JV-${formData.ref}`, // Generate based on GRN reference
      jvDate: formData.date, // Use the GRN date
      jvDescription: formData.description,
      jvStatus: 'Pending', // You might want to determine this based on some logic
      jvReference: formData.ref,
      jvDetail: [
        {
          department: { id: 'DEPT-001', name: 'Default Department' }, // You should replace this with actual data
          accountCode: { id: 'ACC-001', code: '1000', name: 'Inventory' }, // You should replace this with actual data
          accountName: 'Inventory',
          currency: formData.currency,
          debit: netAmount,
          credit: 0,
          baseCurrency: 'USD',
          baseDebit: netAmount * exchangeRate,
          baseCredit: 0
        },
        // Add more journal entries as needed
      ],
      jvTotal: {
        debit: totalAmount,
        credit: totalAmount,
        baseDebit: totalAmount * exchangeRate,
        baseCredit: totalAmount * exchangeRate,
        baseCurrency: 'USD'
      }
    };
  };

  const handleItemsChange = (newItems: GoodsReceiveNoteItem[]) => {
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleEditComment = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      comments: prev.comments.map(comment =>
        comment.id === id ? { ...comment, text } : comment
      )
    }));
  };

  const handleDeleteComment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      comments: prev.comments.filter(comment => comment.id !== id)
    }));
  };

  const handleEditAttachment = (id: string, description: string, publicAccess: boolean) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.map(attachment =>
        attachment.id === id ? { ...attachment, description, publicAccess } : attachment
      )
    }));
  };

  const handleDeleteAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(attachment => attachment.id !== id)
    }));
  };

  const handleDownloadAttachment = (id: string) => {
    // Implement download logic here
    console.log(`Downloading attachment with id: ${id}`);
  };

  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === 'add' ? 'New Goods Receive Note' : `Goods Receive Note`}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            {mode === 'view' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleEditClick}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                </TooltipTrigger>
                <TooltipContent>Edit this GRN</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline"><Trash className="h-4 w-4 mr-2" /> Delete</Button>
              </TooltipTrigger>
              <TooltipContent>Delete this GRN</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline"><Printer className="h-4 w-4 mr-2" /> Print</Button>
              </TooltipTrigger>
              <TooltipContent>Print this GRN</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline"><Send className="h-4 w-4 mr-2" /> Send</Button>
              </TooltipTrigger>
              <TooltipContent>Send this GRN</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-6 gap-6">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="ref">Ref#</Label>
              <Input id="ref" readOnly={mode === 'view'} value={formData.ref} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" readOnly={mode === 'view'} value={formData.date.toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input id="invoiceDate" type="date" readOnly={mode === 'view'} value={formData.invoiceDate.toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="invoiceNumber">Invoice#</Label>
              <Input id="invoiceNumber" readOnly={mode === 'view'} value={formData.invoiceNumber} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="taxInvoiceDate">Tax Invoice Date</Label>
              <Input id="taxInvoiceDate" type="date" readOnly={mode === 'view'} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="taxInvoiceNumber">Tax Invoice#</Label>
              <Input id="taxInvoiceNumber" readOnly={mode === 'view'} />
            </div>
            <div className="space-y-2 col-span-3">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" readOnly={mode === 'view'} value={formData.description} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="receiver">Receiver</Label>
              <Select disabled={mode === 'view'} value={formData.receiver} onValueChange={(value) => setFormData(prev => ({ ...prev, receiver: value }))}>
                <SelectTrigger id="receiver">
                  <SelectValue placeholder="Select receiver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john_doe">John Doe</SelectItem>
                  <SelectItem value="jane_smith">Jane Smith</SelectItem>
                  <SelectItem value="mike_johnson">Mike Johnson</SelectItem>
                  <SelectItem value="emily_brown">Emily Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="vendor">Vendor</Label>
              <Select disabled={mode === 'view'} value={formData.vendor} onValueChange={(value) => setFormData(prev => ({ ...prev, vendor: value }))}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global_fb">Global F&B Suppliers</SelectItem>
                  <SelectItem value="fresh_produce">Fresh Produce Co.</SelectItem>
                  <SelectItem value="quality_meats">Quality Meats Inc.</SelectItem>
                  <SelectItem value="beverage_world">Beverage World Ltd.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-1">
              <Label htmlFor="currency">Currency</Label>
              <Select disabled={mode === 'view'} value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                  <SelectItem value="jpy">JPY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="status">Status</Label>
              <Select 
                disabled={mode === 'view'} 
                value={formData.status} 
                onValueChange={(value: GoodsReceiveNoteStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="partially_received">Partially Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="cashBook">Cash Book</Label>
              <Select disabled={mode === 'view'} value={formData.cashBook} onValueChange={(value) => setFormData(prev => ({ ...prev, cashBook: value }))}>
                <SelectTrigger id="cashBook">
                  <SelectValue placeholder="Select cash book" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main_account">Main Account</SelectItem>
                  <SelectItem value="petty_cash">Petty Cash</SelectItem>
                  <SelectItem value="food_beverage">Food & Beverage Account</SelectItem>
                  <SelectItem value="operations">Operations Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 col-span-1">
              <Checkbox id="consignment" disabled={mode === 'view'} />
              <Label htmlFor="consignment">Consignment</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-1">
              <Checkbox id="cash" disabled={mode === 'view'} />
              <Label htmlFor="cash">Cash</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="extra-costs" className="bg bg-red-500">Extra Costs</TabsTrigger>
          <TabsTrigger value="stock-movement">Stock Movement</TabsTrigger>
          <TabsTrigger value="financial-summary">Financial Summary</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="activity-log">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          {mode !== 'view' && selectedItems.length > 0 && (
            <div className="mb-4">
              <GoodsReceiveNoteItemsBulkActions
                selectedItems={selectedItems}
                onBulkAction={handleBulkAction}
              />
            </div>
          )}
          <GoodsReceiveNoteItems 
            mode={mode} 
            items={formData.items}
            onItemsChange={handleItemsChange}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelection}
            exchangeRate={formData.exchangeRate}
            baseCurrency={formData.baseCurrency}
          />
        </TabsContent>
        <TabsContent value="extra-costs">
          <ExtraCostsTab 
            mode={mode} 
            initialCosts={formData.extraCosts}
            onCostsChange={(newCosts) => {
              setFormData(prev => ({
                ...prev,
                extraCosts: newCosts
              }))
            }}
          />
        </TabsContent>
        <TabsContent value="stock-movement">
          <StockMovementContent 
          />
        </TabsContent>
        <TabsContent value="financial-summary">
          <FinancialSummaryTab 
            mode={mode}
            summary={formData.financialSummary || calculateFinancialSummary()}
            currency={formData.currency}
            baseCurrency={formData.baseCurrency}
          />
        </TabsContent>
        <TabsContent value="comments">
          
        </TabsContent>
        <TabsContent value="attachments">
        
        </TabsContent>
        <TabsContent value="activity-log">
          <ActivityLogTab activityLog={formData.activityLog} />
        </TabsContent>
      </Tabs>

      {mode !== 'view' && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                >
                  {isRightPanelOpen ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <PanelRightOpen className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle right panel</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle right panel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}

export default GoodsReceiveNoteDetail;