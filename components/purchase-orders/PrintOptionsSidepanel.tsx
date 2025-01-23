import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrintOptionsSidepanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrintOptionsSidepanel({ isOpen, onClose }: PrintOptionsSidepanelProps) {
  const [dateType, setDateType] = useState('PO Date');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [vendorFrom, setVendorFrom] = useState('');
  const [vendorTo, setVendorTo] = useState('');
  const [documentStatus, setDocumentStatus] = useState<string[]>([]);

  const handlePrint = () => {
    console.log('Printing with current configuration', {
      dateType,
      fromDate,
      toDate,
      vendorFrom,
      vendorTo,
      documentStatus
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Print by date</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="dateType">Date Type</Label>
              <Select onValueChange={setDateType} value={dateType}>
                <SelectTrigger id="dateType">
                  <SelectValue placeholder="Select Date Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PO Date">PO Date</SelectItem>
                  <SelectItem value="Delivery Date">Delivery Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fromDate">Date from</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="toDate">to</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="vendorFrom">Vendor from</Label>
              <Input
                id="vendorFrom"
                value={vendorFrom}
                onChange={(e) => setVendorFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="vendorTo">to</Label>
              <Input
                id="vendorTo"
                value={vendorTo}
                onChange={(e) => setVendorTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Document Status</Label>
              <div className="space-y-2">
                {['Approved', 'Printed', 'Partial', 'Completed', 'Closed'].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={documentStatus.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setDocumentStatus([...documentStatus, status]);
                        } else {
                          setDocumentStatus(documentStatus.filter(s => s !== status));
                        }
                      }}
                    />
                    <Label htmlFor={`status-${status}`}>{status}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <SheetClose asChild>
            <Button onClick={handlePrint}>View</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
