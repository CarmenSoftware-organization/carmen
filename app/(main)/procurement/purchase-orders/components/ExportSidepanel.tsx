import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExport } from './ExportContext';
import { Columns, Filter } from 'lucide-react';
import { ColumnSelectionScreen, ColumnSelectionConfig } from './ColumnSelectionScreen';
import { FilterBuilder, FilterGroup } from './FilterBuilder';


interface ExportSidepanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportSidepanel({ isOpen, onClose }: ExportSidepanelProps) {
  const exportContext = useExport();
  const [isColumnSelectionOpen, setIsColumnSelectionOpen] = useState(false);
  const [isFilterBuilderOpen, setIsFilterBuilderOpen] = useState(false);

  const handleExport = () => {
    console.log('Exporting with options:', exportContext);
    // Implement the actual export logic here
    onClose();
  };

  const handleColumnSelection = () => {
    setIsColumnSelectionOpen(true);
  };

  const handleFilterBuilder = () => {
    setIsFilterBuilderOpen(true);
  };

  const handleColumnSelectionSave = (config: ColumnSelectionConfig) => {
    console.log('Column Selection saved:', config);
    // Implement logic to save column selection
    setIsColumnSelectionOpen(false);
  };

  const handleFilterSave = (filters: FilterGroup[]) => {
    console.log('Filters saved:', filters);
    // Implement logic to save filters
    setIsFilterBuilderOpen(false);
  };

  const renderField = (label: string, id: string, value: string, onChange: (value: string) => void, options?: string[]) => (
    <div className="mb-4">
      <Label htmlFor={id} className="block mb-2">{label}</Label>
      {options ? (
        <Select onValueChange={onChange} value={value}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={id.includes('date') ? 'date' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      )}
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[600px] md:w-[800px] p-0">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>PO Export</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow">
            {renderField('Date Type', 'dateType', exportContext.dateType, 
              (value) => exportContext.setExportOption('dateType', value), 
              ['PO Date', 'Delivery Date'])}
             <div className="grid grid-cols-2 gap-4">   
              <div>
            {renderField('From Date', 'fromDate', exportContext.fromDate, 
              (value) => exportContext.setExportOption('fromDate', value))}
              </div>
              <div>
            {renderField('To', 'toDate', exportContext.toDate, 
              (value) => exportContext.setExportOption('toDate', value))}
              </div>
           </div>
          
        <div className="grid grid-cols-2 gap-4">          
          <div>
              {renderField('Location From', 'locationFrom', exportContext.locationFrom, 
                (value) => exportContext.setExportOption('locationFrom', value))}
          </div>
          <div>
              {renderField('To', 'locationTo', exportContext.locationTo, 
                (value) => exportContext.setExportOption('locationTo', value))}
          </div>
         </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
            {renderField('Category From', 'categoryFrom', exportContext.categoryFrom, 
              (value) => exportContext.setExportOption('categoryFrom', value))}
             </div>
             <div> 
            {renderField('To', 'categoryTo', exportContext.categoryTo, 
              (value) => exportContext.setExportOption('categoryTo', value))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
          <div>
            {renderField('Sub-Category From', 'subCategoryFrom', exportContext.subCategoryFrom, 
              (value) => exportContext.setExportOption('subCategoryFrom', value))}
           </div>
           <div>
            {renderField('Sub-Category To', 'subCategoryTo', exportContext.subCategoryTo, 
              (value) => exportContext.setExportOption('subCategoryTo', value))}
           </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
            {renderField('Item Group From', 'itemGroupFrom', exportContext.itemGroupFrom, 
              (value) => exportContext.setExportOption('itemGroupFrom', value))}
            </div>
            <div>
            {renderField('Item Group To', 'itemGroupTo', exportContext.itemGroupTo, 
              (value) => exportContext.setExportOption('itemGroupTo', value))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
            {renderField('Product From', 'productFrom', exportContext.productFrom, 
              (value) => exportContext.setExportOption('productFrom', value))}
              </div>
              <div>
            {renderField('Product To', 'productTo', exportContext.productTo, 
              (value) => exportContext.setExportOption('productTo', value))}
              </div>
              </div>
             <div>
            {renderField('PO Status', 'poStatus', exportContext.poStatus, 
              (value) => exportContext.setExportOption('poStatus', value), 
              ['All', 'Open', 'Closed', 'Cancelled'])}
            {renderField('Order By', 'orderBy', exportContext.orderBy, 
              (value) => exportContext.setExportOption('orderBy', value), 
              ['PO Date, PO No.', 'PO No.', 'Vendor'])}
          </div>
        </ScrollArea>
        <div className="flex justify-between space-x-2 mt-4 pt-4 border-t">
          <div className="space-x-2">
            <Button variant="outline" onClick={handleColumnSelection}>
              <Columns className="mr-2 h-4 w-4" />
              Columns
            </Button>
            <Button variant="outline" onClick={handleFilterBuilder}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
          <SheetClose asChild>
            <Button onClick={handleExport}>Export</Button>
          </SheetClose>
        </div>
        
        {isColumnSelectionOpen && (
          <ColumnSelectionScreen
            onClose={() => setIsColumnSelectionOpen(false)}
            onSave={handleColumnSelectionSave}
            isOpen={isColumnSelectionOpen}
          />
        )}
        
        {isFilterBuilderOpen && (
          <FilterBuilder
            onSave={handleFilterSave}
            initialFilters={[]}
            fields={[
              'PO Date', 'Delivery Date', 'PO No.', 'PO Description', 'Vendor Code/Name',
              'Currency Code', 'Currency Rate', 'Net Amount', 'Tax Amount', 'Discount Amount', 'Total Amount',
              'Product Code', 'Product Description', 'Order Unit', 'Order Qty',
              'PO Status', 'Creator', 'PR No.', 'Receiving No.'
            ]}
            isOpen={isFilterBuilderOpen}
            onClose={() => setIsFilterBuilderOpen(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
