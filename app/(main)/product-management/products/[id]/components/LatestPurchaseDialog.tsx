'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PurchaseOrder {
  id: string
  number: string
  deliveryDate: Date
  vendor: string
  location: string
  description: string
  status: string
  documentNumber: string
  quantity: number
  unit: string
  price: number
  currency: string
}

interface ReceivingRecord {
  id: string
  number: string
  receivingDate: Date
  vendor: string
  location: string
  description: string
  status: string
  documentNumber: string
  quantity: number
  unit: string
  price: number
  currency: string
}

interface LatestPurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrders: PurchaseOrder[]
  receivingRecords: ReceivingRecord[]
}

export function LatestPurchaseDialog({
  open,
  onOpenChange,
  purchaseOrders,
  receivingRecords
}: LatestPurchaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Latest Purchase History</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="purchase-orders" className="w-full">
          <TabsList>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="receiving">Receiving Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchase-orders">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Document#</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>{po.number}</TableCell>
                    <TableCell>{po.deliveryDate.toLocaleDateString()}</TableCell>
                    <TableCell>{po.vendor}</TableCell>
                    <TableCell>{po.location}</TableCell>
                    <TableCell>{po.description}</TableCell>
                    <TableCell>{po.status}</TableCell>
                    <TableCell>{po.documentNumber}</TableCell>
                    <TableCell className="text-right">{po.quantity}</TableCell>
                    <TableCell>{po.unit}</TableCell>
                    <TableCell className="text-right">{po.price.toFixed(2)}</TableCell>
                    <TableCell>{po.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="receiving">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Receiving Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Document#</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivingRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.number}</TableCell>
                    <TableCell>{record.receivingDate.toLocaleDateString()}</TableCell>
                    <TableCell>{record.vendor}</TableCell>
                    <TableCell>{record.location}</TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.documentNumber}</TableCell>
                    <TableCell className="text-right">{record.quantity}</TableCell>
                    <TableCell>{record.unit}</TableCell>
                    <TableCell className="text-right">{record.price.toFixed(2)}</TableCell>
                    <TableCell>{record.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 