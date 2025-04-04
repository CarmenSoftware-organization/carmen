import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface RelatedDocument {
  type: string
  referenceNumber: string
  date: string
}

interface PurchaseOrderData {
  purchaseRequest?: {
    referenceNumber: string
  }
  goodsReceivedNote?: {
    referenceNumber: string
  }
  invoice?: {
    referenceNumber: string
  }
  relatedDocuments?: RelatedDocument[]
}

export default function RelatedDocumentsTab({ poData }: { poData: PurchaseOrderData }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Related Documents</h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <Label>Purchase Request</Label>
          <Input value={poData.purchaseRequest?.referenceNumber || 'N/A'} readOnly />
        </div>
        <div>
          <Label>Goods Received Note</Label>
          <Input value={poData.goodsReceivedNote?.referenceNumber || 'N/A'} readOnly />
        </div>
        <div>
          <Label>Invoice</Label>
          <Input value={poData.invoice?.referenceNumber || 'N/A'} readOnly />
        </div>
        <div>
          <Button className="mt-6">Add Related Document</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Type</TableHead>
            <TableHead>Reference Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {poData.relatedDocuments && poData.relatedDocuments.map((doc: RelatedDocument, index: number) => (
            <TableRow key={index}>
              <TableCell>{doc.type}</TableCell>
              <TableCell>{doc.referenceNumber}</TableCell>
              <TableCell>{doc.date}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
