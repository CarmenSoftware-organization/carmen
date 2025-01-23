import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, MessageSquare, Paperclip } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RelatedDocument {
  id: string;
  type: 'Purchase Order' | 'Goods Receive Note' | 'Credit Note';
  number: string;
  date: string;
  status: 'Draft' | 'Completed' | 'Cancelled';
  amount: number;
  comments?: string[];
  attachments?: string[];
}

interface RelatedDocumentsTabProps {
  poData: any; // Replace 'any' with your PurchaseOrder type
}

const mockDocuments: RelatedDocument[] = [
  { 
    id: '1', 
    type: 'Purchase Order', 
    number: 'PO-001', 
    date: '2023-08-15', 
    status: 'Completed', 
    amount: 10000.00,
    comments: ['Initial order placed', 'Vendor confirmed order'],
    attachments: ['PO-001.pdf', 'Vendor_Quote.pdf']
  },
  { 
    id: '2', 
    type: 'Goods Receive Note', 
    number: 'GRN-001', 
    date: '2023-08-20', 
    status: 'Completed', 
    amount: 9500.00,
    comments: ['Partial delivery received', 'Quality check passed'],
    attachments: ['GRN-001.pdf', 'Delivery_Note.pdf']
  },
  { 
    id: '3', 
    type: 'Goods Receive Note', 
    number: 'GRN-002', 
    date: '2023-08-22', 
    status: 'Draft', 
    amount: 500.00,
    comments: ['Remaining items received'],
    attachments: ['GRN-002_draft.pdf']
  },
  { 
    id: '4', 
    type: 'Credit Note', 
    number: 'CN-001', 
    date: '2023-08-25', 
    status: 'Completed', 
    amount: 250.00,
    comments: ['Credit for damaged items', 'Approved by finance'],
    attachments: ['CN-001.pdf', 'Damage_Report.jpg']
  },
  { 
    id: '5', 
    type: 'Credit Note', 
    number: 'CN-002', 
    date: '2023-08-27', 
    status: 'Draft', 
    amount: 100.00,
    comments: ['Pending approval for price adjustment'],
    attachments: ['CN-002_draft.pdf', 'Price_Adjustment_Request.docx']
  },
];

export default function RelatedDocumentsTab({ poData }: RelatedDocumentsTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Related Documents</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Type</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Attachments</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockDocuments.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.type}</TableCell>
              <TableCell>{doc.number}</TableCell>
              <TableCell>{doc.date}</TableCell>
              <TableCell>
                <Badge variant={
                  doc.status === 'Completed' ? 'default' :
                  doc.status === 'Draft' ? 'secondary' :
                  'destructive'
                }>
                  {doc.status}
                </Badge>
              </TableCell>
              <TableCell>${doc.amount.toFixed(2)}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="h-4 w-4" />
                        {doc.comments && <span className="ml-1">{doc.comments.length}</span>}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <ul>
                        {doc.comments?.map((comment, index) => (
                          <li key={index}>{comment}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-4 w-4" />
                        {doc.attachments && <span className="ml-1">{doc.attachments.length}</span>}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <ul>
                        {doc.attachments?.map((attachment, index) => (
                          <li key={index}>{attachment}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
