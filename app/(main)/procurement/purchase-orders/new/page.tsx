'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRType, DocumentStatus, WorkflowStatus, PaymentMethod, CurrencyCode } from '@/prisma/enums'
import { useToast } from "@/components/ui/use-toast"
import FinancialDetailsTab from '@/components/purchase-orders/FinancialDetailsTab'
import CommentsAttachmentsTab from '@/components/purchase-orders/CommentsAttachmentsTab'
import RelatedDocumentsTab from '@/components/purchase-orders/RelatedDocumentsTab'
import InventoryStatusTab from '@/components/purchase-orders/InventoryStatusTab'
import ItemsTab from '@/components/purchase-orders/ItemsTab'
import { v4 as uuidv4 } from 'uuid'

interface Item {
  id: string;
  code: string;
  description: string;
  orderedQuantity: number;
  orderUnit: string;
  baseQuantity: number;
  baseUnit: string;
  receivedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'Not Received' | 'Partially Received' | 'Fully Received';
  isFOC: boolean;
}

export default function NewPurchaseOrder() {
  const router = useRouter()
  const { toast } = useToast()
  const [poData, setPOData] = useState({
    // Initialize with default values or empty strings
    poNumber: '',
    poDate: '',
    vendor: '',
    status: '',
    totalAmount: '',
    currency: '',
    deliveryDate: '',
    paymentTerms: '',
    items: [],
    comments: [],
    attachments: [],
    relatedDocuments: [],
    // Add other necessary fields
  })

  const [items, setItems] = useState<Item[]>([])

  const onUpdateItem = (updatedItem: Item) => {
    setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item))
  }

  const onDeleteItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }

  const onAddItem = (newItem: Item) => {
    setItems(prevItems => [...prevItems, { ...newItem, id: uuidv4() }])
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Here you would typically handle the form submission,
    // including validation and sending data to your API
    console.log('Form submitted', poData)
    // After successful submission, redirect to the PO list
    router.push('/purchase-orders')
  }

  const handleSaveAsDraft = () => {
    // Implement save as draft functionality
    console.log('Saving as draft', poData)
    toast({
      title: "Purchase Order Saved as Draft",
      description: "Your PO has been saved as a draft.",
    })
  }

  const handlePreview = () => {
    // Implement preview functionality
    console.log('Previewing', poData)
    toast({
      title: "Preview",
      description: "Previewing the Purchase Order.",
    })
  }

  const handlePrint = () => {
    // Implement print functionality
    console.log('Printing', poData)
    toast({
      title: "Print",
      description: "Printing the Purchase Order.",
    })
  }

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting', poData)
    toast({
      title: "Export",
      description: "Exporting the Purchase Order.",
    })
  }

  const handleEmail = () => {
    // Implement email functionality
    console.log('Emailing', poData)
    toast({
      title: "Email",
      description: "Preparing to email the Purchase Order.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Purchase Order</h1>
      <div className="mb-6 flex justify-end space-x-2">
        <Button variant="outline" onClick={handleSaveAsDraft}>Save as Draft</Button>
        <Button variant="outline" onClick={handlePreview}>Preview</Button>
        <Button variant="outline" onClick={handlePrint}>Print</Button>
        <Button variant="outline" onClick={handleExport}>Export</Button>
        <Button variant="outline" onClick={handleEmail}>Email</Button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <Label>PO Reference Number</Label>
          <Input value={poData.poNumber || ''} readOnly />
        </div>
        <div>
          <Label>PO Date</Label>
          <Input value={poData.poDate || ''} readOnly />
        </div>
        <div>
          <Label>Vendor</Label>
          <Input value={poData.vendor || ''} readOnly />
        </div>
        <div>
          <Label>Status</Label>
          <Input value={poData.status || ''} readOnly />
        </div>
        <div>
          <Label>Total Amount</Label>
          <Input value={poData.totalAmount || '0.00'} readOnly />
        </div>
        <div>
          <Label>Currency</Label>
          <Input value={poData.currency || ''} readOnly />
        </div>
        <div>
          <Label>Delivery Date</Label>
          <Input value={poData.deliveryDate || ''} readOnly />
        </div>
        <div>
          <Label>Payment Terms</Label>
          <Input value={poData.paymentTerms || ''} readOnly />
        </div>
      </div>
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="financial">Financial Details</TabsTrigger>
          <TabsTrigger value="comments">Comments & Attachments</TabsTrigger>
          <TabsTrigger value="related">Related Documents</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
        </TabsList>
        <form onSubmit={handleSubmit}>
          <TabsContent value="items">
            <ItemsTab
              items={items}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onAddItem={onAddItem}
              poData={poData}
            />
          </TabsContent>
          <TabsContent value="financial">
            <FinancialDetailsTab poData={poData} />
          </TabsContent>
          <TabsContent value="comments">
            <CommentsAttachmentsTab poData={poData} />
          </TabsContent>
          <TabsContent value="related">
            <RelatedDocumentsTab poData={poData} />
          </TabsContent>
          <TabsContent value="inventory">
            <InventoryStatusTab poData={poData} />
          </TabsContent>
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Create Purchase Order</Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
