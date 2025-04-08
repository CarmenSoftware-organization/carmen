import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";


export interface ColumnSelectionConfig {
  header: string;
  excludeHeaders: boolean;
  selectedColumns: string[];
}

const availableColumns = [
  'PO Date', 'Delivery Date', 'PO No.', 'PO Description', 'Vendor Code/Name',
  'Currency Code', 'Currency Rate', 'Net Amount', 'Tax Amount', 'Discount Amount', 'Total Amount',
  'Product Code', 'Product Description', 'Order Unit', 'Order Qty',
  'PO Status', 'Creator', 'PR No.', 'Receiving No.'
];

export interface ColumnSelectionScreenProps {
  onClose: () => void;
  onSave: (config: ColumnSelectionConfig) => void;
  isOpen: boolean;
}

export function ColumnSelectionScreen({ onSave, onClose, isOpen }: ColumnSelectionScreenProps) {
  const [header, setHeader] = useState('');
  const [excludeHeaders, setExcludeHeaders] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const handleColumnToggle = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const handleSave = () => {
    onSave({ header, excludeHeaders, selectedColumns });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Select Columns</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="header">Header</Label>
            <Input 
              id="header" 
              value={header} 
              onChange={(e) => setHeader(e.target.value)}
              placeholder="Enter custom header for export"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="excludeHeaders" 
              checked={excludeHeaders}
              onCheckedChange={(checked) => setExcludeHeaders(checked as boolean)}
            />
            <Label htmlFor="excludeHeaders">Exclude column headers</Label>
          </div>
          <div>
            <Label>Selected Columns</Label>
            <ScrollArea className="h-[200px] mt-2 border rounded-md p-2">
              <ul className="space-y-1">
                {selectedColumns.map(column => (
                  <li key={column}>{column}</li>
                ))}
              </ul>
            </ScrollArea>
          </div>
          <div>
            <Label>Available Columns</Label>
            <ScrollArea className="h-[200px] mt-2 border rounded-md p-2">
              <div className="space-y-2">
                {availableColumns.map(column => (
                  <div key={column} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`column-${column}`}
                      checked={selectedColumns.includes(column)}
                      onCheckedChange={() => handleColumnToggle(column)}
                    />
                    <Label htmlFor={`column-${column}`}>{column}</Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
