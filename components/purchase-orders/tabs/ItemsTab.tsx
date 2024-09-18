import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, ChevronDown, ChevronRight, MoreHorizontal, Plus } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ScrollBar, ScrollArea } from "@/components/ui/scroll-area";
                                                                                                                        
// Sample mock data
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
                                                                                                                        
interface ItemsTabProps {                                                                                               
  items: Item[];                                                                                                        
  onUpdateItem: (updatedItem: Item) => void;                                                                            
  onDeleteItem: (itemId: string) => void;                                                                               
  onAddItem: (newItem: Item) => void;  
  poData: any;                                                                                 
}                                                                                                                       
                                                                                                                        
export default function ItemsTab({ items, onUpdateItem, onDeleteItem, onAddItem, poData }: ItemsTabProps) {                     
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
    if (selectedItems.length === items.length) {                                                                        
      setSelectedItems([]);                                                                                             
    } else {                                                                                                            
      setSelectedItems(items.map(item => item.id));                                                                     
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
      case 'setNotReceived':
      case 'setPartiallyReceived':
      case 'setFullyReceived':
        updateItemsStatus(action.replace('set', ''));
        break;
      case 'edit':
        console.log('Bulk edit items:', selectedItems);
        break;
      case 'cancel':
        console.log('Bulk cancel items:', selectedItems);
        break;
      case 'addNote':
        console.log('Bulk add note to items:', selectedItems);
        break;
      default:
        console.log(`Unknown bulk action: ${action}`);
    }
  };

  const updateItemsStatus = (newStatus: string) => {
    const updatedItems = items.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, status: newStatus as Item['status'] } 
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
    const updatedItem = items.find(item => item.id === itemId);
    if (updatedItem) {
      updatedItem.orderUnit = newUnit;
      onUpdateItem(updatedItem);
    }
  };
                                                                                                                        
  const [isAddItemSheetOpen, setIsAddItemSheetOpen] = useState(false);

  const handleAddNewItem = () => {
    if (newItem.code && newItem.description && newItem.orderedQuantity && newItem.orderUnit) {
      const itemToAdd: Item = {
        id: Date.now().toString(), // Generate a temporary ID
        ...newItem as Item,
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
      <div className="space-y-4">                                                                                         
        <div className="flex justify-between items-center">                                                               
          <h2 className="text-2xl font-bold">Purchase Order Items</h2>                                                    
          <div className="flex space-x-2">
            <DropdownMenu>                                                                                                  
              <DropdownMenuTrigger asChild>                                                                                 
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions
                </Button>                                                             
              </DropdownMenuTrigger>                                                                                        
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handleBulkAction('setNotReceived')}>Set Not Received</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleBulkAction('setPartiallyReceived')}>Set Partially Received</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleBulkAction('setFullyReceived')}>Set Fully Received</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleBulkAction('edit')}>Edit Selected Items</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleBulkAction('cancel')}>Cancel Selected Items</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleBulkAction('addNote')}>Add Note to Selected Items</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Export</Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[600px]">
                <SheetHeader>
                  <SheetTitle>Export Purchase Order</SheetTitle>
                  <SheetDescription>Choose your export options below.</SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-grow">
                  <div className="space-y-4 p-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="exportFormat" className="text-right">
                        Format
                      </Label>
                      <Select defaultValue="pdf">
                        <SelectTrigger id="exportFormat" className="col-span-3">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dateType" className="text-right">
                        Date Type
                      </Label>
                      <Select defaultValue="poDate">
                        <SelectTrigger id="dateType" className="col-span-3">
                          <SelectValue placeholder="Select date type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poDate">PO Date</SelectItem>
                          <SelectItem value="deliveryDate">Delivery Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Date</Label>
                      <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Input id="dateFrom" type="date" placeholder="From" />
                        <Input id="dateTo" type="date" placeholder="To" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Location</Label>
                      <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Input id="locationFrom" placeholder="From" />
                        <Input id="locationTo" placeholder="To" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Category</Label>
                      <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Input id="categoryFrom" placeholder="From" />
                        <Input id="categoryTo" placeholder="To" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Sub-category</Label>
                      <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Input id="subCategoryFrom" placeholder="From" />
                        <Input id="subCategoryTo" placeholder="To" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Item Group</Label>
                      <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Input id="itemGroupFrom" placeholder="From" />
                        <Input id="itemGroupTo" placeholder="To" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Product</Label>
                      <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Input id="productFrom" placeholder="From" />
                        <Input id="productTo" placeholder="To" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="poStatus" className="text-right">
                        PO Status
                      </Label>
                      <Select defaultValue="all">
                        <SelectTrigger id="poStatus" className="col-span-3">
                          <SelectValue placeholder="Select PO status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="orderBy" className="text-right">
                        Order By
                      </Label>
                      <Select defaultValue="poDatePoNo">
                        <SelectTrigger id="orderBy" className="col-span-3">
                          <SelectValue placeholder="Select order by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poDatePoNo">PO Date, PO No.</SelectItem>
                          <SelectItem value="poNo">PO No.</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="includeDetails" className="text-right">
                        Include Details
                      </Label>
                      <div className="col-span-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="includeComments" />
                          <Label htmlFor="includeComments">Comments</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="includeAttachments" />
                          <Label htmlFor="includeAttachments">Attachments</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <SheetFooter>
                  <Button type="submit" onClick={handleExport}>Export</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>                                                                                                 
        </div>    
                                                                                                              
      {items.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedItems.length === items.length}
                  onCheckedChange={toggleAllSelection}
                />
              </TableHead>
              <TableHead>Item Code/Description</TableHead>
              <TableHead>Ordered Qty / Base Qty</TableHead>
              <TableHead>Received Qty / Base Receiving Qty</TableHead>
              <TableHead>Remaining Qty</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Receiving Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="align-top">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleItemSelection(item.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>{item.code}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
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
                  <div>{item.orderedQuantity} {item.orderUnit} / {item.baseQuantity} {item.baseUnit}</div>
                  <div className="text-sm text-gray-500">Ordered Qty / Base Qty</div>
                </TableCell>
                <TableCell>
                  <div>{item.receivedQuantity} {item.orderUnit} / {item.baseReceivingQty} {item.baseUnit}</div>
                  <div className="text-sm text-gray-500">Received Qty / Base Receiving Qty</div>
                </TableCell>
                <TableCell>
                  <div>{item.remainingQuantity} {item.orderUnit}</div>
                  <div className="text-sm text-gray-500">Remaining Qty</div>
                </TableCell>
                <TableCell>
                  <div>${item.unitPrice.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Unit Price</div>
                </TableCell>
                <TableCell>
                  <div>${item.totalPrice.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Total Price</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress value={(item.receivedQuantity / item.orderedQuantity) * 100} className="w-[60px]" />
                    <Badge className={`${getStatusColor(item.status)} text-xs px-2 py-0.5`}>{item.status}</Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Receiving Status</div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => handleViewDetails(item)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleEditItem(item)}>Edit Item</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleAddNote(item)}>Add Note</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleSplitLine(item)}>Split Line</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleCancelItem(item)}>Cancel Item</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="text-sm text-gray-500 mt-1">Actions</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No items available.</p>
      )}                                                                                                          
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
    </TooltipProvider>
  );                                                                                                                    
}                     
