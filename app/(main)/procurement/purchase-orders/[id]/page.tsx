'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import GeneralInfoTab from '@/components/purchase-orders/GeneralInfoTab'
import ItemsTab from '@/components/purchase-orders/ItemsTab'
import FinancialDetailsTab from '@/components/purchase-orders/FinancialDetailsTab'
import RelatedDocumentsTab from '@/components/purchase-orders/RelatedDocumentsTab'
import InventoryStatusTab from '@/components/purchase-orders/InventoryStatusTab'
import CommentsAttachmentsTab from '@/components/purchase-orders/CommentsAttachmentsTab'
import ActivityLogTab from '@/components/purchase-orders/ActivityLogTab'
import GoodsReceiveNoteTab from '@/components/purchase-orders/GoodsReceiveNoteTab'
import { useToast } from "@/components/ui/use-toast"
import DetailPageTemplate from '@/components/templates/DetailPageTemplate'

interface Item {
  id: string;
  code: string;
  description: string;
  orderedQuantity: number;
  baseQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'Not Received' | 'Partially Received' | 'Fully Received';
  isFOC: boolean;
  orderUnit: string;
  baseUnit: string;
  baseReceivingQty: number;
}

interface POData {
  id: string;
  status: string;
  vendor: string;
  date: string;
  total: number;
  currency: string;
  items: Item[];
}

export default function PurchaseOrderDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [poData, setPOData] = useState<POData | null>(null)

  useEffect(() => {
    // Fetch PO data here
    // For now, we'll use mock data
    setPOData({
      id: params.id,
      status: 'Partial',
      vendor: 'Acme Supplies',
      date: '2023-08-15',
      total: 10000.00,
      currency: 'USD',
      items: [
        {
          id: '1',
          code: 'ITEM001',
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
        },
        {
          id: '2',
          code: 'ITEM002',
          description: 'Desk Lamp',
          orderedQuantity: 20,
          orderUnit: 'pcs',
          baseQuantity: 20,
          baseUnit: 'pcs',
          receivedQuantity: 20,
          baseReceivingQty: 20,
          remainingQuantity: 0,
          unitPrice: 30.00,
          totalPrice: 600.00,
          status: 'Fully Received',
          isFOC: false,
        },
        {
          id: '3',
          code: 'ITEM003',
          description: 'Notebook',
          orderedQuantity: 100,
          orderUnit: 'pcs',
          baseQuantity: 100,
          baseReceivingQty: 20,
          baseUnit: 'pcs',
          receivedQuantity: 0,
          remainingQuantity: 100,
          unitPrice: 5.00,
          totalPrice: 500.00,
          status: 'Not Received',
          isFOC: true,
        },
      ],
      // ... other PO data
    })
  }, [params.id])

  const handleEdit = () => {
    // Implement edit functionality
    toast({
      title: "Edit PO",
      description: "Editing functionality to be implemented.",
    })
  }

  const handleVoid = () => {
    // Implement void functionality
    toast({
      title: "Void PO",
      description: "Voiding functionality to be implemented.",
    })
  }

  const handleClose = () => {
    // Implement close functionality
    toast({
      title: "Close PO",
      description: "Closing functionality to be implemented.",
    })
  }

  const handlePrint = () => {
    // Implement print functionality
    toast({
      title: "Print PO",
      description: "Printing functionality to be implemented.",
    })
  }

  const handleEmail = () => {
    // Implement email functionality
    toast({
      title: "Email PO",
      description: "Email functionality to be implemented.",
    })
  }

  if (!poData) {
    return <div>Loading...</div>
  }

  const title = (<>
  Purchase Order Details {params.id}
  </>)
  
  const actionButtons = (<>
  <div className="space-x-2">
              <Button onClick={handleEdit}>Edit</Button>
              <Button onClick={handleVoid} disabled={poData.status !== 'Partial'}>Void</Button>
              <Button onClick={handleClose}>Close PO</Button>
              <Button onClick={handlePrint}>Print</Button>
              <Button onClick={handleEmail}>Email</Button>
            </div></>);
  const backLink = (<>
              <Button onClick={() => router.back()} variant="outline">Back</Button></>);
  const content = (<>
  
  <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Purchase Order: {poData.id}</CardTitle>
              <p className="text-muted-foreground">Vendor: {poData.vendor}</p>
            </div>
            <Badge variant={poData.status === 'Partial' ? 'default' : 'secondary'}>
              {poData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p><span className="font-semibold">Date:</span> {poData.date}</p>
              <p><span className="font-semibold">Total:</span> {poData.currency} {poData.total.toFixed(2)}</p>
            </div>
            
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="financial">Financial Details</TabsTrigger>
          <TabsTrigger value="related">Related Documents</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
          <TabsTrigger value="comments">Comments & Attachments</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="grn">Goods Receive Note</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
         <ItemsTab
           items={poData?.items || []}
           onUpdateItem={(updatedItem) => {
             setPOData((prevData) => {
               if (!prevData) return null;
               return {
                 ...prevData,
                 items: prevData.items.map(item => 
                   item.id === updatedItem.id ? updatedItem : item
                 )
               };
             });
           }}
           onDeleteItem={(itemId) => {
             setPOData((prevData) => {
               if (!prevData) return null;
               return {
                 ...prevData,
                 items: prevData.items.filter(item => item.id !== itemId)
               };
             });
           }}
           onAddItem={(newItem) => {
             setPOData((prevData) => {
               if (!prevData) return null;
               return {
                 ...prevData,
                 items: [...prevData.items, newItem]
               };
             });
           }}
           poData={poData}
         />
        </TabsContent>
        <TabsContent value="general">
          <GeneralInfoTab poData={poData} />
        </TabsContent>
        <TabsContent value="financial">
          <FinancialDetailsTab poData={poData} />
        </TabsContent>
        <TabsContent value="related">
          <RelatedDocumentsTab poData={poData} />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryStatusTab poData={poData} />
        </TabsContent>
        <TabsContent value="comments">
          <CommentsAttachmentsTab poData={poData} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityLogTab poData={poData} />
        </TabsContent>
        <TabsContent value="grn">
          <GoodsReceiveNoteTab poData={poData} />
        </TabsContent>
      </Tabs>

  </>);

  return (

    <DetailPageTemplate title={title} actionButtons={actionButtons} content={content} backLink={backLink} />

    /*
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Purchase Order: {poData.id}</CardTitle>
              <p className="text-muted-foreground">Vendor: {poData.vendor}</p>
            </div>
            <Badge variant={poData.status === 'Partial' ? 'default' : 'secondary'}>
              {poData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p><span className="font-semibold">Date:</span> {poData.date}</p>
              <p><span className="font-semibold">Total:</span> {poData.currency} {poData.total.toFixed(2)}</p>
            </div>
            <div className="space-x-2">
              <Button onClick={handleEdit}>Edit</Button>
              <Button onClick={handleVoid} disabled={poData.status !== 'Partial'}>Void</Button>
              <Button onClick={handleClose}>Close PO</Button>
              <Button onClick={handlePrint}>Print</Button>
              <Button onClick={handleEmail}>Email</Button>
              <Button onClick={() => router.back()} variant="outline">Back</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="financial">Financial Details</TabsTrigger>
          <TabsTrigger value="related">Related Documents</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
          <TabsTrigger value="comments">Comments & Attachments</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="grn">Goods Receive Note</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
         <ItemsTab
           items={poData?.items || []}
           onUpdateItem={(updatedItem) => {
             setPOData((prevData) => {
               if (!prevData) return null;
               return {
                 ...prevData,
                 items: prevData.items.map(item => 
                   item.id === updatedItem.id ? updatedItem : item
                 )
               };
             });
           }}
           onDeleteItem={(itemId) => {
             setPOData((prevData) => {
               if (!prevData) return null;
               return {
                 ...prevData,
                 items: prevData.items.filter(item => item.id !== itemId)
               };
             });
           }}
           onAddItem={(newItem) => {
             setPOData((prevData) => {
               if (!prevData) return null;
               return {
                 ...prevData,
                 items: [...prevData.items, newItem]
               };
             });
           }}
           poData={poData}
         />
        </TabsContent>
        <TabsContent value="general">
          <GeneralInfoTab poData={poData} />
        </TabsContent>
        <TabsContent value="financial">
          <FinancialDetailsTab poData={poData} />
        </TabsContent>
        <TabsContent value="related">
          <RelatedDocumentsTab poData={poData} />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryStatusTab poData={poData} />
        </TabsContent>
        <TabsContent value="comments">
          <CommentsAttachmentsTab poData={poData} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityLogTab poData={poData} />
        </TabsContent>
        <TabsContent value="grn">
          <GoodsReceiveNoteTab poData={poData} />
        </TabsContent>
      </Tabs>
    </div>
    */
  )
}
