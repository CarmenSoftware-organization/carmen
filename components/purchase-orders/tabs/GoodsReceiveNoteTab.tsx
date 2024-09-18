import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GRNItem {
  id: string;
  grnNumber: string;
  receiveDate: string;
  status: 'Pending' | 'Received' | 'Partially Received';
  receivedQuantity: number;
  remarks: string;
}

interface GoodsReceiveNoteTabProps {
  poData: any; // You might want to type this more specifically
}

const GoodsReceiveNoteTab: React.FC<GoodsReceiveNoteTabProps> = ({ poData }) => {
  // Mock GRN data - in a real application, this would come from your backend
  const grnItems: GRNItem[] = [
    {
      id: '1',
      grnNumber: 'GRN-001',
      receiveDate: '2023-08-20',
      status: 'Received',
      receivedQuantity: 5,
      remarks: 'All items received in good condition',
    },
    {
      id: '2',
      grnNumber: 'GRN-002',
      receiveDate: '2023-08-25',
      status: 'Partially Received',
      receivedQuantity: 3,
      remarks: 'Partial delivery, remaining items expected next week',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Goods Receive Notes</h2>
        <Button>Create New GRN</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>GRN Number</TableHead>
            <TableHead>Receive Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Received Quantity</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grnItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.grnNumber}</TableCell>
              <TableCell>{item.receiveDate}</TableCell>
              <TableCell>
                <Badge variant={item.status === 'Received' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>{item.receivedQuantity}</TableCell>
              <TableCell>{item.remarks}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GoodsReceiveNoteTab;
