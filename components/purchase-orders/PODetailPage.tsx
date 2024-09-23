'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Edit, Trash2, X, CheckSquare, FileDown, Mail, Printer } from "lucide-react"
import DetailPageTemplate from '@/components/templates/DetailPageTemplate'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import ItemsTab from './tabs/ItemsTab'
import GeneralInfoTab from './tabs/GeneralInfoTab'
import GoodsReceiveNoteTab from './tabs/GoodsReceiveNoteTab'
import FinancialDetailsTab from './tabs/FinancialDetailsTab'
import RelatedDocumentsTab from './tabs/RelatedDocumentsTab'
import CommentsAttachmentsTab from './tabs/CommentsAttachmentsTab'
import ActivityLogTab from './tabs/ActivityLogTab'

// Import other necessary components and types

interface PurchaseOrder {
  id: string;
  number: string;
  date: string;
  vendor: string;
  total: number;
  status: string;
  email: string;
  items?: any[]; // Add this line to include items in the interface
  // Add other fields as necessary
}

export function PODetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [poData, setPOData] = useState<PurchaseOrder | null>(null)

  useEffect(() => {
    // Fetch PO data here
    // For now, we'll use mock data
    setPOData({
      id: params.id,
      number: `PO-${params.id}`,
      date: '2023-08-15',
      vendor: 'Acme Supplies',
      total: 10000.00,
      status: 'Open',
      email: 'vendor@acme.com',
      items: [ ], // Add an empty array for items
      // Add other mock data as necessary
    })
  }, [params.id])

  const handleEdit = () => {
    // Implement edit functionality
    console.log('Edit PO:', params.id)
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

  const handleUpdateItem = (updatedItem: any) => {
    // Implement item update logic
    console.log('Update item:', updatedItem);
  };

  const handleDeleteItem = (itemId: string) => {
    // Implement item delete logic
    console.log('Delete item:', itemId);
  };

  const handleAddItem = (newItem: any) => {
    // Implement add item logic
    console.log('Add item:', newItem);
  };

  if (!poData) {
    return <div>Loading...</div>
  }

  const title = `Purchase Order: ${poData.number}`

  const actionButtons = (
    <>
      <Button onClick={handleEdit}>Edit</Button>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
      <Button variant="outline" onClick={handlePrint}>Print</Button>
      <Button variant="outline" onClick={handleEmail}>Email</Button>
    </>
  )

  const content = (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Purchase Order: {poData.number}</CardTitle>
              <p className="text-muted-foreground">Vendor: {poData.vendor}</p>
            </div>
            <Badge variant={poData.status === 'Open' ? 'default' : 'secondary'}>
              {poData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p><span className="font-semibold">Date:</span> {poData.date}</p>
              <p><span className="font-semibold">Total:</span> ${poData.total.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="GeneralInfoTab">Details</TabsTrigger>
          <TabsTrigger value="FinancialDetailsTab">Financials</TabsTrigger>
          <TabsTrigger value="GoodsReceiveNoteTab">Goods Receive</TabsTrigger>
          <TabsTrigger value="RelatedDocumentsTab">Documents</TabsTrigger>
          <TabsTrigger value="CommentsAttachmentsTab">Comments & Attachments</TabsTrigger>
          <TabsTrigger value="ActivityLogsTab">Activity Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <ItemsTab 
            items={poData.items || [] }
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            poData={poData}
          />
        </TabsContent>
        <TabsContent value="GeneralInfoTab">
          <GeneralInfoTab poData={poData} />
        </TabsContent>
        <TabsContent value="FinancialDetailsTab">
          <FinancialDetailsTab poData={poData} />
        </TabsContent>
        <TabsContent value="GoodsReceiveNoteTab">
          <GoodsReceiveNoteTab poData={poData} />
        </TabsContent>
        <TabsContent value="RelatedDocumentsTab">
          <RelatedDocumentsTab poData={poData} />
        </TabsContent>
        <TabsContent value="CommentsAttachmentsTab">
          <CommentsAttachmentsTab poData={poData} />
        </TabsContent>
        <TabsContent value="ActivityLogsTab">
          <ActivityLogTab poData={poData} />
        </TabsContent>
      </Tabs>
    </>
  )

  const backLink = (
    <Button variant="ghost" asChild>
      <Link href="/procurement/purchase-orders">Back to Purchase Orders</Link>
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