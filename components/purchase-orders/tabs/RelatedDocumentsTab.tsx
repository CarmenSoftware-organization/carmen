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

interface RelatedDocumentsTabProps {
  poData?: PurchaseOrderData
}

// Mock data for when no props are provided
const mockPoData: PurchaseOrderData = {
  purchaseRequest: {
    referenceNumber: "PR-2023-001"
  },
  goodsReceivedNote: {
    referenceNumber: "GRN-2023-001"
  },
  invoice: {
    referenceNumber: "INV-2023-001"
  },
  relatedDocuments: [
    {
      type: "Purchase Request",
      referenceNumber: "PR-2023-001",
      date: "2023-06-15"
    },
    {
      type: "Goods Received Note",
      referenceNumber: "GRN-2023-001",
      date: "2023-06-25"
    },
    {
      type: "Invoice",
      referenceNumber: "INV-2023-001",
      date: "2023-07-05"
    }
  ]
}

export default function RelatedDocumentsTab({ poData }: RelatedDocumentsTabProps) {
  const data = poData || mockPoData;
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Related Documents</h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <Label>Purchase Request</Label>
          <Input value={data.purchaseRequest?.referenceNumber || 'N/A'} readOnly />
        </div>
        <div>
          <Label>Goods Received Note</Label>
          <Input value={data.goodsReceivedNote?.referenceNumber || 'N/A'} readOnly />
        </div>
        <div>
          <Label>Invoice</Label>
          <Input value={data.invoice?.referenceNumber || 'N/A'} readOnly />
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
          {data.relatedDocuments && data.relatedDocuments.map((doc: RelatedDocument, index: number) => (
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
