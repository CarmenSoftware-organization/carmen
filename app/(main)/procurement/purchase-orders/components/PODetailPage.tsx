'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2, X, CheckSquare, FileDown, Mail, Printer } from "lucide-react"
import DetailPageTemplate from '@/components/templates/DetailPageTemplate'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {Textarea} from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import ItemsTab from './tabs/ItemsTab'
import FinancialDetailsTab from './tabs/FinancialDetailsTab'
import GoodsReceiveNoteTab from './tabs/GoodsReceiveNoteTab'
import RelatedDocumentsTab from './tabs/RelatedDocumentsTab'
import CommentsAttachmentsTab from './tabs/CommentsAttachmentsTab'
import ActivityLogTab from './tabs/ActivityLogTab'
import { PurchaseOrderItem, PurchaseOrderStatus } from '@/lib/types'

interface Item {
  id: string;
  code: string;
  description: string;
  orderedQuantity: number;
  orderUnit: string;
  baseQuantity: number;
  baseUnit: string;
  baseReceivingQty: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'Not Received' | 'Partially Received' | 'Fully Received';
  isFOC: boolean;
}

interface PurchaseOrder {
  id: string;
  number: string;
  date: string;
  vendor: string;
  vendorContact: string;
  vendorEmail: string;
  vendorPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  paymentTerms: string;
  total: number;
  status: string;
  email: string;
  currency: string;
  buyer:string;
  creditTerms: string;
  description:string;
  remarks: string;
  items: PurchaseOrderItem[];
}

// Sample data for items
const sampleItems: PurchaseOrderItem[] = [
  {
    id: '1',
    name: 'Office Chair',
    description: 'Office Chair',
    orderedQuantity: 10,
    orderUnit: 'pcs',
    baseQuantity: 10,
    baseUnit: 'pcs',
    baseReceivingQty: 5,
    receivedQuantity: 5,
    remainingQuantity: 5,
    unitPrice: 150.00,
    totalPrice: 1500.00,
    status: 'Partially Received',
    isFOC: false, 
    taxRate: 0.07,
    taxAmount: 105.00,
    discountRate: 0.1,
    discountAmount: 150.00,
    attachments: [],
    convRate: 1,
    baseTaxAmount: 105.00,
  },
  {
    id: '2',
    name: 'Desk Lamp',
    description: 'Desk Lamp',
    orderedQuantity: 20,
    orderUnit: 'pcs',
    baseQuantity: 20,
    baseUnit: 'pcs',
    baseReceivingQty: 20,
    receivedQuantity: 20,
    remainingQuantity: 0,
    unitPrice: 30.00,
    totalPrice: 600.00,
    status: 'Fully Received',
    isFOC: false,
    taxRate: 0.07,
    taxAmount: 105.00,
    discountRate: 0.1,
    discountAmount: 150.00,
    attachments: [],
    convRate: 1,
    baseTaxAmount: 105.00,
  },
  {
    id: '3',
    name: 'Notebook',
    description: 'Notebook',
    orderedQuantity: 100,
    orderUnit: 'pcs',
    baseQuantity: 100,
    baseUnit: 'pcs',
    baseReceivingQty: 0,
    receivedQuantity: 0,
    remainingQuantity: 100,
    unitPrice: 5.00,
    totalPrice: 500.00,
    status: "Not Received",
    isFOC: true,
    taxRate: 0.07,
    taxAmount: 105.00,
    discountRate: 0.1,
    discountAmount: 150.00,
    attachments: [],
    convRate: 1,
    baseTaxAmount: 105.00,
  },
];

export function PODetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [poData, setPOData] = useState<PurchaseOrder | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Fetch PO data here
    // For now, we'll use mock data
    setPOData({
      id: params.id,
      number: `PO-${params.id}`,
      date: '2023-08-15',
      vendor: 'Acme Supplies',
      vendorContact: 'John Doe',
      vendorEmail: 'john@acmesupplies.com',
      vendorPhone: '+1 (555) 123-4567',
      deliveryAddress: '123 Main St, Anytown, AN 12345',
      deliveryDate: '2023-08-30',
      paymentTerms: 'Net 30',
      total: 10000.00,
      status: 'Open',
      email: 'vendor@acme.com',
      buyer: "Jane Smith",
      currency: "THB",
      description: "Office supplies order",
      creditTerms:"30",
      remarks: "Please deliver to the main office",
      
      items: sampleItems, // Assign the sample items here
    })
  }, [params.id])
  
  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    // Implement save functionality
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleDelete = () => {
    // Implement delete functionality
    console.log('Delete PO:', params.id)
  }

  const handlePrint = () => {
    // Implement print functionality
    console.log('Print PO:', params.id)
  }

  const handleEmail = () => {
    // Implement email functionality
    console.log('Email PO:', params.id)
  }

  const handleUpdateItem = (updatedItem: Item) => {
    if (poData) {
      const updatedItems = poData.items.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      );
      setPOData({ ...poData, items: updatedItems as PurchaseOrderItem[] });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (poData) {
      const updatedItems = poData.items.filter(item => item.id !== itemId);
      setPOData({ ...poData, items: updatedItems });
    }
  };

  const handleAddItem = (newItem: Item) => {
    if (poData) {
      setPOData({ ...poData, items: [...poData.items, newItem as unknown as PurchaseOrderItem] });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (poData) {
      setPOData({ ...poData, [name]: value });
    }
  };

  if (!poData) {
    return <div>Loading...</div>
  }

  const title = (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" asChild className="mr-1">
        <Link href="/procurement/purchase-orders">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Purchase Order: {poData.number}</h1>
    </div>
  )

  const actionButtons = (
    <>
      {isEditing ? (
        <>
          <Button onClick={handleSave}>
            <Edit className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </>
      )}
    </>
  )

  const content = (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <Label className="text-xs text-muted-foreground">PO Number</Label>
                <div className="font-semibold">{poData.number}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    name="date"
                    value={poData.date}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                ) : (
                  <div className="font-semibold">{poData.date}</div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Vendor</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="vendor"
                    value={poData.vendor}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                ) : (
                  <div className="font-semibold">{poData.vendor}</div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    name="email"
                    value={poData.email}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                ) : (
                  <div className="font-semibold">{poData.email}</div>
                )}
              </div>
            </div>
            <Badge variant={poData.status === 'Open' ? 'default' : 'secondary'}>
              {poData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-4">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Delivery Date</Label>
              <Input type="date" value={poData.deliveryDate || ''} readOnly />
            </div>
            <div className="col-span-1">
              <Label className="text-xs text-muted-foreground">Currency</Label>
              <Input value={poData.currency || ''} readOnly />
            </div>
            <div className="col-span-1">
              <Label className="text-xs text-muted-foreground">Credit Terms</Label>
              <Input value={poData.creditTerms || ''} readOnly />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Total</Label>
              <Input value={`$${poData.total.toFixed(2)}`} readOnly />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Buyer</Label>
              <Input value={poData.buyer || ''} readOnly />
            </div>
            <div className="col-span-4">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea value={poData.description || ''} readOnly />
            </div>
            <div className="col-span-4">
              <Label className="text-xs text-muted-foreground">Remarks</Label>
              <Textarea value={poData.remarks || ''} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="FinancialDetailsTab">Financials</TabsTrigger>
          <TabsTrigger value="GoodsReceiveNoteTab">Goods Receive</TabsTrigger>
          <TabsTrigger value="RelatedDocumentsTab">Documents</TabsTrigger>
          <TabsTrigger value="CommentsAttachmentsTab">Comments</TabsTrigger>
          <TabsTrigger value="ActivityLogsTab">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="bg-white p-4 rounded-md shadow">
          {/* <ItemsTab 
            // onUpdateItem={handleUpdateItem}
            // onDeleteItem={handleDeleteItem}
            // onAddItem={handleAddItem}
            // poData={poData as PurchaseOrder}
          /> */}
        </TabsContent>
        <TabsContent value="FinancialDetailsTab" className="bg-white p-4 rounded-md shadow">
          <FinancialDetailsTab poData={poData} />
        </TabsContent>
        <TabsContent value="GoodsReceiveNoteTab" className="bg-white p-4 rounded-md shadow">
          <GoodsReceiveNoteTab poData={poData} />
        </TabsContent>
        <TabsContent value="RelatedDocumentsTab" className="bg-white p-4 rounded-md shadow">
          <RelatedDocumentsTab poData={poData} />
        </TabsContent>
        <TabsContent value="CommentsAttachmentsTab" className="bg-white p-4 rounded-md shadow">
          <CommentsAttachmentsTab poData={poData} />
        </TabsContent>
        <TabsContent value="ActivityLogsTab" className="bg-white p-4 rounded-md shadow">
          <ActivityLogTab poData={poData} />
        </TabsContent>
      </Tabs>
    </>
  )

  const backLink = (
    <Button variant="ghost" size="icon" asChild className="mr-1">
      <Link href="/procurement/purchase-orders">
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </Button>
  )

  return (
    <DetailPageTemplate
      title={title}
      actionButtons={actionButtons}
      content={content}
      backLink={backLink}
    />
  )
}

