import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from 'lucide-react';

interface GoodsReceiveNote {
  id: string;
  number: string;
  date: string;
  status: 'Draft' | 'Completed' | 'Cancelled';
  receivedBy: string;
}

interface GoodsReceiveNoteTabProps {
  poData: any; // Replace 'any' with your PurchaseOrder type
}

const mockGRNs: GoodsReceiveNote[] = [
  { id: '1', number: 'GRN-001', date: '2023-08-20', status: 'Completed', receivedBy: 'John Doe' },
  { id: '2', number: 'GRN-002', date: '2023-08-22', status: 'Draft', receivedBy: 'Jane Smith' },
  { id: '3', number: 'GRN-003', date: '2023-08-25', status: 'Cancelled', receivedBy: 'Bob Johnson' },
];

export default function GoodsReceiveNoteTab({ poData }: GoodsReceiveNoteTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Goods Receive Notes</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>GRN Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Received By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockGRNs.map((grn) => (
            <TableRow key={grn.id}>
              <TableCell>{grn.number}</TableCell>
              <TableCell>{grn.date}</TableCell>
              <TableCell>
                <Badge variant={
                  grn.status === 'Completed' ? 'default' :
                  grn.status === 'Draft' ? 'secondary' :
                  'destructive'
                }>
                  {grn.status}
                </Badge>
              </TableCell>
              <TableCell>{grn.receivedBy}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <FileText className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
