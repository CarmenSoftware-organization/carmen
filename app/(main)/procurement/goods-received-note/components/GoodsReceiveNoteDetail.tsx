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
import { ArrowLeft, Edit, Trash, Printer, Send, Save, PanelRightClose, PanelRightOpen, CheckCheck, PencilRuler } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FinancialSummaryTab } from './tabs/FinancialSummaryTab'
import { ActivityLogTab } from './tabs/ActivityLogTab'
import StockMovementContent from './tabs/stock-movement'
import { format } from 'date-fns'

// Extend GoodsReceiveNoteMode to include 'confirm'
export type GRNDetailMode = GoodsReceiveNoteMode | 'confirm';

interface GoodsReceiveNoteDetailProps {
  id?: string
  mode?: GRNDetailMode
  onModeChange?: (mode: GRNDetailMode) => void
  initialData: GoodsReceiveNote
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
  status: 'Received',
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
  const [formData, setFormData] = useState<GoodsReceiveNote>(initialData);
  const [currentMode, setCurrentMode] = useState<GRNDetailMode>(mode);
  const [extraCosts, setExtraCosts] = useState<ExtraCost[]>(initialData.extraCosts || [])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  useEffect(() => {
    setFormData(initialData);
    setExtraCosts(initialData.extraCosts || []);
    setSelectedItems([]);
    setExpandedItems([]);
    setCurrentMode(mode);
  }, [initialData, mode]);

  const isReadOnly = currentMode === 'view' || currentMode === 'confirm';

  const handleModeChange = (newMode: GRNDetailMode) => {
    setCurrentMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  }

  const handleEditClick = () => {
    handleModeChange('edit');
  };

  const handleConfirmAndSave = () => {
    console.log('Confirming and Saving GRN:', formData);
    const realId = `GRN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    alert(`GRN Saved! Real ID: ${realId}`);
    router.push(`/procurement/goods-received-note/${realId}?mode=view`);
  };

  const handleEditFurther = () => {
    handleModeChange('edit');
  }

  const handleExtraCostsChange = (costs: ExtraCost[]) => {
    setExtraCosts(costs);
    setFormData(prev => ({ ...prev, extraCosts: costs }));
  };

  const handleItemSelection = (itemId: string, isSelected: boolean) => {
    if (itemId === "") {
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
    if (action === 'delete') {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => !selectedItems.includes(item.id))
      }))
    }
    setSelectedItems([])
  }

  const handleSave = () => {
    console.log('Saving GRN (edit mode):', formData)
    handleModeChange('view');
  }

  const handleCancelEdit = () => {
    setFormData(initialData);
    handleModeChange('view');
  }

  const handleBack = () => {
    if (currentMode === 'confirm' || currentMode === 'add') {
      router.back();
    } else {
      router.push('/procurement/goods-received-note');
    }
  }

  const calculateFinancialSummary = (): FinancialSummary => {
    const netAmount = formData.items.reduce((sum, item) => sum + item.netAmount, 0);
    const taxAmount = formData.items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = netAmount + taxAmount;
    const exchangeRate = formData.exchangeRate || 1.2;
    const baseCurrency = formData.baseCurrency || 'USD';

    return {
      id: formData.financialSummary?.id || 'temp-summary-1',
      netAmount,
      taxAmount,
      totalAmount,
      currency: formData.currency,
      baseNetAmount: netAmount * exchangeRate,
      baseTaxAmount: taxAmount * exchangeRate,
      baseTotalAmount: totalAmount * exchangeRate,
      baseCurrency: baseCurrency,
      jvType: 'GRN',
      jvNumber: `JV-${formData.ref}`,
      jvDate: formData.date,
      jvDescription: formData.description,
      jvStatus: 'Pending',
      jvReference: formData.ref,
      jvDetail: [],
      jvTotal: {
        debit: totalAmount,
        credit: totalAmount,
        baseDebit: totalAmount * exchangeRate,
        baseCredit: totalAmount * exchangeRate,
        baseCurrency: baseCurrency
      }
    };
  };

  const handleItemsChange = (newItems: GoodsReceiveNoteItem[]) => {
    if (!isReadOnly) {
      setFormData(prev => ({ ...prev, items: newItems }));
    }
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
            {currentMode === 'confirm' ? `Confirm New GRN (${formData.ref})` : 
              currentMode === 'add' ? 'New Goods Receive Note' : 
              `Goods Receive Note (${formData.ref})`}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            {currentMode === 'view' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleEditClick}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                </TooltipTrigger>
                <TooltipContent>Edit this GRN</TooltipContent>
              </Tooltip>
            )}
            {currentMode === 'confirm' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" onClick={handleEditFurther}><PencilRuler className="h-4 w-4 mr-2" /> Edit Further</Button>
                  </TooltipTrigger>
                  <TooltipContent>Make changes before saving</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleConfirmAndSave}><CheckCheck className="h-4 w-4 mr-2" /> Confirm & Save GRN</Button>
                  </TooltipTrigger>
                  <TooltipContent>Confirm and save this new GRN</TooltipContent>
                </Tooltip>
              </>
            )}
            {currentMode === 'edit' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleCancelEdit}><ArrowLeft className="h-4 w-4 mr-2" /> Cancel</Button>
                  </TooltipTrigger>
                  <TooltipContent>Discard changes</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
                  </TooltipTrigger>
                  <TooltipContent>Save changes to this GRN</TooltipContent>
                </Tooltip>
              </>
            )}
            {currentMode !== 'confirm' && currentMode !== 'edit' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline"><Trash className="h-4 w-4 mr-2" /> Delete</Button>
                </TooltipTrigger>
                <TooltipContent>Delete this GRN</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline"><Printer className="h-4 w-4 mr-2" /> Print</Button>
              </TooltipTrigger>
              <TooltipContent>Print this GRN</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-6 gap-6">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="ref">Ref#</Label>
              <Input id="ref" readOnly value={formData.ref} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" readOnly={isReadOnly} value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ''} onChange={e => setFormData({...formData, date: new Date(e.target.value)})} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input id="invoiceDate" type="date" readOnly={isReadOnly} value={formData.invoiceDate ? format(new Date(formData.invoiceDate), 'yyyy-MM-dd') : ''} onChange={e => setFormData({...formData, invoiceDate: new Date(e.target.value)})} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="invoiceNumber">Invoice#</Label>
              <Input id="invoiceNumber" readOnly={isReadOnly} value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="taxInvoiceDate">Tax Invoice Date</Label>
              <Input id="taxInvoiceDate" type="date" readOnly={isReadOnly} value={formData.taxInvoiceDate ? format(new Date(formData.taxInvoiceDate), 'yyyy-MM-dd') : ''} onChange={e => setFormData({...formData, taxInvoiceDate: new Date(e.target.value)})}/>
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="taxInvoiceNumber">Tax Invoice#</Label>
              <Input id="taxInvoiceNumber" readOnly={isReadOnly} value={formData.taxInvoiceNumber || ''} onChange={e => setFormData({...formData, taxInvoiceNumber: e.target.value})} />
            </div>
            <div className="space-y-2 col-span-3">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" readOnly={isReadOnly} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="receiver">Receiver</Label>
              <Select disabled={isReadOnly} value={formData.receiver} onValueChange={(value) => setFormData(prev => ({ ...prev, receiver: value }))}>
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
              {isReadOnly ? (
                <Input readOnly value={formData.vendor} />
              ) : (
                <Select value={formData.vendor} onValueChange={(value) => setFormData(prev => ({ ...prev, vendor: value }))}>
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
              )}
            </div>
            
            <div className="space-y-2 col-span-1">
              <Label htmlFor="currency">Currency</Label>
              {isReadOnly ? (
                <Input readOnly value={formData.currency} />
              ) : (
                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
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
              )}
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="status">Status</Label>
              <Input readOnly value={formData.status} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="cashBook">Cash Book</Label>
              <Select disabled={isReadOnly} value={formData.cashBook} onValueChange={(value) => setFormData(prev => ({ ...prev, cashBook: value }))}>
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
              <Checkbox id="consignment" disabled={isReadOnly} checked={formData.isConsignment} onCheckedChange={(checked) => setFormData({...formData, isConsignment: !!checked})} />
              <Label htmlFor="consignment">Consignment</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-1">
              <Checkbox id="cash" disabled={isReadOnly} checked={formData.isCash} onCheckedChange={(checked) => setFormData({...formData, isCash: !!checked})}/>
              <Label htmlFor="cash">Cash</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="extra-costs">Extra Costs</TabsTrigger>
          <TabsTrigger value="stock-movement">Stock Movement</TabsTrigger>
          <TabsTrigger value="financial-summary">Financial Summary</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="activity-log">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          {!isReadOnly && selectedItems.length > 0 && (
            <div className="mb-4">
              <GoodsReceiveNoteItemsBulkActions
                selectedItems={selectedItems}
                onBulkAction={handleBulkAction}
              />
            </div>
          )}
          <GoodsReceiveNoteItems
            mode={currentMode === 'confirm' ? 'view' : currentMode}
            items={formData.items}
            onItemsChange={handleItemsChange}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelection}
            exchangeRate={formData.exchangeRate}
            baseCurrency={formData.baseCurrency}
            currency={formData.currency}
          />
        </TabsContent>
        <TabsContent value="extra-costs">
          <ExtraCostsTab
            mode={currentMode === 'confirm' ? 'view' : currentMode}
            initialCosts={formData.extraCosts}
            onCostsChange={handleExtraCostsChange}
          />
        </TabsContent>
        <TabsContent value="stock-movement">
          <StockMovementContent
          />
        </TabsContent>
        <TabsContent value="financial-summary">
          <FinancialSummaryTab
            mode={currentMode === 'confirm' ? 'view' : currentMode}
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
    </div>
  )
}

export default GoodsReceiveNoteDetail;