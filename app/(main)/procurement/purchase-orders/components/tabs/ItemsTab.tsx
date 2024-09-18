import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, ChevronDown, ChevronRight, MoreHorizontal, Plus, Eye, Edit, MessageSquare, Split, X } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ScrollBar, ScrollArea } from "@/components/ui/scroll-area";

// Sample mock data

interface Item {
  id: string;
  code: string;
  description: string;
  orderedQuantity: number;
  orderUnit: string;
  baseQuantity: number;
  baseUnit: string;
  baseReceivingQty: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'Not Received' | 'Partially Received' | 'Fully Received';
  isFOC: boolean;
}

const mockItems: Item[] = [
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
    baseReceivingQty: 20,
    receivedQuantity: 20,
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
    baseUnit: 'pcs',
    baseReceivingQty: 0,
    receivedQuantity: 0,
    remainingQuantity: 100,
    unitPrice: 5.00,
    totalPrice: 500.00,
    status: 'Not Received',
    isFOC: true,
  },
  {
    id: '4',
    code: 'ITEM004',
    description: 'Whiteboard',
    orderedQuantity: 5,
    orderUnit: 'pcs',
    baseQuantity: 5,
    baseUnit: 'pcs',
    baseReceivingQty: 3,
    receivedQuantity: 3,
    remainingQuantity: 2,
    unitPrice: 80.00,
    totalPrice: 400.00,
    status: 'Partially Received',
    isFOC: false,
  },
];

interface ItemsTabProps {
  onUpdateItem: (updatedItem: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (newItem: Item) => void;
  poData: PurchaseOrder;
}

export default function ItemsTab({ onUpdateItem, onDeleteItem, onAddItem, poData }: ItemsTabProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<Partial<Item>>({
    code: '',
    description: '',
    orderedQuantity: 0,
    orderUnit: '',
    baseQuantity: 0,
    baseUnit: '',
    baseReceivingQty: 0,
    unitPrice: 0,
    isFOC: false,
  });
  
  const handleExport = () => {
    // Implement export logic here
    console.log('Exporting PO data:', poData);
  };
                                                                                                                        
  const selectedItemsCount = useMemo(() => selectedItems.length, [selectedItems]);                                      
                                                                                                                        
  const toggleItemSelection = (itemId: string) => {                                                                     
    setSelectedItems(prev =>                                                                                            
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]                                      
    );                                                                                                                  
  };                                                                                                                    
                                                                                                                        
  const toggleAllSelection = () => {                                                                                    
    if (selectedItems.length === poData.items.length) {                                                                        
      setSelectedItems([]);                                                                                             
    } else {                                                                                                            
      setSelectedItems(poData.items.map(item => item.id));                                                                     
    }                                                                                                                   
  };                                                                                                                    
                                                                                                                        
  const toggleItemExpansion = (itemId: string) => {                                                                     
    setExpandedItems(prev =>                                                                                            
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]                                      
    );                                                                                                                  
  };                                                                                                                    
                                                                                                                        
  const getStatusColor = (status: Item['status']) => {                                                                  
    switch (status) {                                                                                                   
      case 'Not Received': return 'bg-red-500';                                                                         
      case 'Partially Received': return 'bg-yellow-500';                                                                
      case 'Fully Received': return 'bg-green-500';                                                                     
    }                                                                                                                   
  };                                                                                                                    
                                                                                                                        
  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'setFullyReceived':
        updateItemsStatus('Fully Received');
        break;
      case 'cancel':
        console.log('Bulk cancel items:', selectedItems);
        break;
      default:
        console.log(`Unknown bulk action: ${action}`);
    }
  };

  const updateItemsStatus = (newStatus: Item['status']) => {
    const updatedItems = poData.items.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, status: newStatus } 
        : item
    );
    updatedItems.forEach(item => {
      if (selectedItems.includes(item.id)) {
        onUpdateItem(item);
      }
    });
    setSelectedItems([]);
  };
                                                                                                                        
  const handleViewDetails = (item: Item) => {                                                                           
    // Implement view details logic                                                                                     
    console.log('View details for item:', item);                                                                        
  };                                                                                                                    
                                                                                                                        
  const handleEditItem = (item: Item) => {                                                                              
    // Implement edit item logic                                                                                        
    console.log('Edit item:', item);                                                                                    
  };                                                                                                                    
                                                                                                                        
  const handleAddNote = (item: Item) => {                                                                               
    // Implement add note logic                                                                                         
    console.log('Add note to item:', item);                                                                             
  };                                                                                                                    
                                                                                                                        
  const handleSplitLine = (item: Item) => {                                                                             
    // Implement split line logic                                                                                       
    console.log('Split line for item:', item);                                                                          
  };                                                                                                                    
                                                                                                                        
  const handleCancelItem = (item: Item) => {
    // Implement cancel item logic
    console.log('Cancel item:', item);
  };

  const handleUnitChange = (itemId: string, newUnit: string) => {
    const updatedItem = poData.items.find(item => item.id === itemId);
    if (updatedItem) {
      updatedItem.orderUnit = newUnit;
      onUpdateItem(updatedItem);
    }
  };
                                                                                                                        
  const [isAddItemSheetOpen, setIsAddItemSheetOpen] = useState(false);

  const handleAddNewItem = () => {
    if (newItem.code && newItem.description && newItem.orderedQuantity && newItem.orderUnit) {
      const itemToAdd: Item = {
        ...newItem as Item,
        id: Date.now().toString(), // Generate a temporary ID
        baseQuantity: newItem.baseQuantity || newItem.orderedQuantity,
        baseUnit: newItem.baseUnit || newItem.orderUnit,
        receivedQuantity: 0,
        remainingQuantity: newItem.orderedQuantity as number,
        totalPrice: (newItem.orderedQuantity as number) * (newItem.unitPrice as number),
        status: 'Not Received',
      };
      onAddItem(itemToAdd);
      setNewItem({
        code: '',
        description: '',
        orderedQuantity: 0,
        orderUnit: '',
        baseQuantity: 0,
        baseUnit: '',
        baseReceivingQty: 0,
        unitPrice: 0,
        isFOC: false,
      });
      setIsAddItemSheetOpen(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 w-full">
        <div className="flex justify-between items-center w-full">
          <Sheet open={isAddItemSheetOpen} onOpenChange={setIsAddItemSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Add New Item</SheetTitle>
                <SheetDescription>Fill in the details to add a new item to the purchase order.</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newItemCode" className="text-right">
                      Item Code
                    </Label>
                    <Input
                      id="newItemCode"
                      value={newItem.code}
                      onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newItemDescription" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="newItemDescription"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newItemOrderedQuantity" className="text-right">
                      Ordered Quantity
                    </Label>
                    <Input
                      id="newItemOrderedQuantity"
                      type="number"
                      value={newItem.orderedQuantity}
                      onChange={(e) => setNewItem({ ...newItem, orderedQuantity: Number(e.target.value) })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newItemOrderUnit" className="text-right">
                      Order Unit
                    </Label>
                    <Select
                      value={newItem.orderUnit}
                      onValueChange={(value) => setNewItem({ ...newItem, orderUnit: value })}
                    >
                      <SelectTrigger id="newItemOrderUnit" className="col-span-3">
                        <SelectValue placeholder="Select Order Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Piece (pcs)</SelectItem>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="ltr">Liter (ltr)</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newItemBaseUnit" className="text-right">
                      Base Unit
                    </Label>
                    <Select
                      value={newItem.baseUnit}
                      onValueChange={(value) => setNewItem({ ...newItem, baseUnit: value })}
                    >
                      <SelectTrigger id="newItemBaseUnit" className="col-span-3">
                        <SelectValue placeholder="Select Base Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Piece (pcs)</SelectItem>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="ltr">Liter (ltr)</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newItemUnitPrice" className="text-right">
                      Unit Price
                    </Label>
                    <Input
                      id="newItemUnitPrice"
                      type="number"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newItemIsFOC" className="text-right">
                      Free of Charge
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Checkbox
                        id="newItemIsFOC"
                        checked={newItem.isFOC}
                        onCheckedChange={(checked) => setNewItem({ ...newItem, isFOC: checked as boolean })}
                      />
                      <Label htmlFor="newItemIsFOC">Free of Charge (FOC)</Label>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit" onClick={handleAddNewItem}>Add Item</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex space-x-2 mb-4">
            <Button onClick={() => handleBulkAction('setFullyReceived')}>Set Fully Received</Button>
            <Button onClick={() => handleBulkAction('cancel')}>Cancel Selected</Button>
          </div>
        )}

        <div className="w-full overflow-auto">
          {poData.items.length > 0 ? (
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedItems.length === poData.items.length}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px]">Item</TableHead>
                  <TableHead className="min-w-[200px]">Description</TableHead>
                  <TableHead className="min-w-[120px]">Approved Qty</TableHead>
                  <TableHead className="min-w-[120px]">Received Qty</TableHead>
                  <TableHead className="min-w-[120px]">Remaining Qty</TableHead>
                  <TableHead className="min-w-[80px]">Unit</TableHead>
                  <TableHead className="min-w-[100px]">Price</TableHead>
                  <TableHead className="min-w-[120px]">Total Amount</TableHead>
                  <TableHead className="min-w-[150px]">Receiving Status</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>{item.code}</div>
                      {item.isFOC && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Gift className="inline-block mt-1 text-blue-500" size={16} />
                          </TooltipTrigger>
                          <TooltipContent>Free of Charge</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{item.description}</div>
                    </TableCell>
                    <TableCell>
                      <div>{item.orderedQuantity} {item.orderUnit}</div>
                      <div className="text-xs text-gray-500">{item.baseQuantity} {item.baseUnit}</div>
                    </TableCell>
                    <TableCell>
                      <div>{item.receivedQuantity} {item.orderUnit}</div>
                      <div className="text-xs text-gray-500">{item.baseReceivingQty} {item.baseUnit}</div>
                    </TableCell>
                    <TableCell>
                      <div>{item.remainingQuantity} {item.orderUnit}</div>
                      <div className="text-xs text-gray-500">
                        {(item.remainingQuantity * (item.baseQuantity / item.orderedQuantity)).toFixed(2)} {item.baseUnit}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{item.orderUnit}</div>
                      <div className="text-xs text-gray-500">{item.baseUnit}</div>
                    </TableCell>
                    <TableCell>
                      <div>${item.unitPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        ${(item.unitPrice * (item.baseQuantity / item.orderedQuantity)).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>${item.totalPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        ${(item.totalPrice * (item.baseQuantity / item.orderedQuantity)).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(item.status)} text-xs px-2 py-0.5`}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAddNote(item)}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleSplitLine(item)}>
                          <Split className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleCancelItem(item)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No items available.</p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
