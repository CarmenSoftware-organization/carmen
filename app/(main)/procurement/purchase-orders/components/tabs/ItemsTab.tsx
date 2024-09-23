import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CurrencyCode, Item, PurchaseOrder, PurchaseOrderItem, PurchaseRequestItem } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, ChevronDown, ChevronRight, MoreHorizontal, Plus, Eye, Edit, MessageSquare, Split, X } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ScrollBar, ScrollArea } from "@/components/ui/scroll-area";
import { PurchaseOrderItemFormComponent } from './purchase-order-item-form'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
// Sample mock data

// interface Item {
//   id: string;
//   code: string;
//   description: string;
//   orderedQuantity: number;
//   orderUnit: string;
//   baseQuantity: number;
//   baseUnit: string;
//   baseReceivingQty: number;
//   receivedQuantity: number;
//   remainingQuantity: number;
//   unitPrice: number;
//   totalPrice: number;
//   status: 'Not Received' | 'Partially Received' | 'Fully Received';
//   isFOC: boolean;
// }

// const mockItems: PurchaseOrderItem[] = [
//   {
//     id: '1',
//     code: 'ITEM001',
//     description: 'Office Chair',
//     orderedQuantity: 10,
//     orderUnit: 'pcs',
//     baseQuantity: 10,
//     baseUnit: 'pcs',
//     baseReceivingQty: 5,
//     receivedQuantity: 5,
//     remainingQuantity: 5,
//     status: 'Partially Received',
//     isFOC: false,
//     taxRate: 0.07,
//     taxAmount: 0.00,
//     discountRate: 0.00,
//     discountAmount: 0.00,
//     totalPrice: {
//       amount: 0.00,
//       currency: CurrencyCode.USD,
//     },
//   },
//   {
//     id: '2',
//     code: 'ITEM002',
//     description: 'Desk Lamp',
//     orderedQuantity: 20,
//     orderUnit: 'pcs',
//     baseQuantity: 20,
//     baseUnit: 'pcs',
//     baseReceivingQty: 20,
//     receivedQuantity: 20,
//     remainingQuantity: 0,
//     status: 'Fully Received',
//     isFOC: false,
//     taxRate: 0.07,
//     taxAmount: 0.00,
//     discountRate: 0.00,
//     discountAmount: 0.00,
//     totalPrice: {
//       amount: 0.00,
//       currency: CurrencyCode.USD,
//     },
//   },
//   {
//     id: '3',
//     code: 'ITEM003',
//     description: 'Notebook',
//     orderedQuantity: 100,
//     orderUnit: 'pcs',
//     baseQuantity: 100,
//     baseUnit: 'pcs',
//     baseReceivingQty: 0,
//     receivedQuantity: 0,
//     remainingQuantity: 100,
//     status: 'Not Received',
//     isFOC: true,
//     taxRate: 0.07,
//     taxAmount: 0.00,
//     discountRate: 0.00,
//     discountAmount: 0.00,
//     totalPrice: {
//       amount: 0.00,
//       currency: CurrencyCode.USD,
//     },
//   },
//   {
//     id: '4',
//     code: 'ITEM004',
//     description: 'Whiteboard',
//     orderedQuantity: 5,
//     orderUnit: 'pcs',
//     baseQuantity: 5,
//     baseUnit: 'pcs',
//     baseReceivingQty: 3,
//     receivedQuantity: 3,
//     remainingQuantity: 2,
//     status: 'Partially Received',
//     isFOC: false,
//     taxRate: 0.07,
//     taxAmount: 0.00,
//     discountRate: 0.00,
//     discountAmount: 0.00,
//     totalPrice: {
//       amount: 0.00,
//       currency: CurrencyCode.USD,
//     },
//   },
// ];

interface ItemsTabProps {
   onUpdateItem: (updatedItem: PurchaseOrderItem) => void;
   onDeleteItem: (itemId: string) => void;
   onAddItem: (newItem: PurchaseOrderItem) => void;
  poData: PurchaseOrder;
}

export default function ItemsTab({ poData  }: ItemsTabProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    name: '',
    description: '',
    orderedQuantity: 0,
    orderUnit: '',
    baseQuantity: 0,
    baseUnit: '',
    baseReceivingQty: 0,
    unitPrice: 0,
    isFOC: false,
    taxRate: 0.07,
    taxAmount: 0.00,
    discountRate: 0.00,
    discountAmount: 0.00,
  });

  const [editingItem, setEditingItem] = useState<PurchaseOrderItem | null>(null);
  const [viewingItem, setViewingItem] = useState<PurchaseOrderItem | null>(null);
  
  const handleExport = () => {
    // if (!poData) {
    //   console.error('No purchase order data available for export.');
    //   return
    // }
    // console.log('Exporting PO data:', poData);
  }
                                                                                                                        
  const selectedItemsCount = useMemo(() => selectedItems.length, [selectedItems])
  const toggleItemSelection = (itemId: string) => {                                                                     
    setSelectedItems(prev =>                                                                                            
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]                                      
    );                                                                                                                  
  };                                                                                                                    
                                                                                                                        
  // const toggleAllSelection = () => {                                                                                    
  //   if (selectedItems.length === poData.items.length) setSelectedItems([])                                                                                             
  //   else setSelectedItems(poData.items.map((item: PurchaseOrderItem) => item.id))                                                                     
  // }
  // };                                                                                                                    
                                                                                                                        
  // const toggleItemExpansion = (itemId: string) => {                                                                     
  //   setExpandedItems(prev =>                                                                                            
  //     prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]                                      
  //   );                                                                                                                  
                                                                                                                     
                                                                                                                        
  // const getStatusColor = (status: Item['status']) => {                                                                  
  //   switch (status) {                                                                                                   
  //     case 'Not Received': return 'bg-red-500';                                                                         
  //     case 'Partially Received': return 'bg-yellow-500';                                                                
  //     case 'Fully Received': return 'bg-green-500';                                                                     
  //   }                                                                                                                   
  // };                                                                                                                    
                                                                                                                        
  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'setFullyReceived':
        // updateItemsStatus('Fully Received');
        break;
      case 'cancel':
        // console.log('Bulk cancel items:', selectedItems);
        break;
      default:
        console.log(`Unknown bulk action: ${action}`);
    }
  };

  // const updateItemsStatus = (newStatus: PurchaseOrderItem['status']) => {
  //   const updatedItems = poData.items.map(item => 
  //     selectedItems.includes(item.id) 
  //       ? { ...item, status: newStatus } 
  //       : item
  //   );
  //   updatedItems.forEach(item => {
  //     if (selectedItems.includes(item.id)) {
  //       onUpdateItem(item);
  //     }
  //   });
  //   setSelectedItems([]);
  // };
                                                                                                                        
  // const handleViewDetails = (item: Item) => {
  //   setViewingItem(item);
  // };
                                                                                                                        
  // const handleEditItem = (item: Item) => {
  //   setEditingItem(item);
  // };
                                                                                                                        
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

  // interface PurchaseOrderItem {
  //   poId: string
  //   orderUnit: string
  // }

  interface Props {
    poData: { items: PurchaseOrderItem[] }
    onUpdateItem: (item: PurchaseOrderItem) => void
  }

  function handleUnitChange({ poData, onUpdateItem }: Props, itemId: string, newUnit: string) {
    const updatedItem = poData.items.find(item => item.id === itemId)
    if (!updatedItem) return

    updatedItem.orderUnit = newUnit
    onUpdateItem(updatedItem)
  }
                                                                                                                        
  const [isAddItemFormOpen, setIsAddItemFormOpen] = useState(false)

  const handleAddNewItem = (newItem: Item) => {
    onAddItem(newItem)
    setIsAddItemFormOpen(false)
  }
  function handleItemUpdate(updatedItem: Item) {
    // onUpdateItem(updatedItem)
    setEditingItem(null)
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 w-full">
        <div className="flex justify-between items-center w-full">
          <Button onClick={() => setIsAddItemFormOpen(true)}>
            <Plus className="mr-2 s h-4 w-4" /> Add Item
          </Button>
        </div>

        {isAddItemFormOpen && (     
              <PurchaseOrderItemFormComponent
                initialMode="add"
                onClose={() => setIsAddItemFormOpen(false)}
                // onSubmit={handleAddNewItem}
                isOpen={isAddItemFormOpen}
              />
        )}

        {editingItem && (
          <PurchaseOrderItemFormComponent
            initialMode="edit"
            onClose={() => setEditingItem(null)}
            // onSubmit={handleItemUpdate}
            isOpen={!!editingItem}
            // initialData={editingItem}
          />
        )}

        {viewingItem && (
          <PurchaseOrderItemFormComponent
            initialMode="view"
            onClose={() => setViewingItem(null)}
            isOpen={!!viewingItem}
            // initialData={viewingItem}
          />
        )}

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
                <TableRow className="h-8">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedItems.length === poData.items.length}
                      // onCheckedChange={toggleAllSelection}
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
                  <TableRow key={item.id} className="h-10">
                    <TableCell className="py-1">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                    </TableCell>
                    <TableCell className="py-1">
                      <div>{item.name}</div>
                      {item.isFOC && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Gift className="inline-block mt-0.5 text-blue-500" size={14} />
                          </TooltipTrigger>
                          <TooltipContent>Free of Charge</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="text-xs">{item.description}</div>
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="text-sm">{item.orderedQuantity} {item.orderUnit}</div>
                      <div className="text-xs text-gray-500">{item.baseQuantity} {item.baseUnit}</div>
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="text-sm">{item.receivedQuantity} {item.orderUnit}</div>
                      <div className="text-xs text-gray-500">{item.baseReceivingQty} {item.baseUnit}</div>
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="text-sm">{item.remainingQuantity} {item.orderUnit}</div>
                      <div className="text-xs text-gray-500">
                        {(item.remainingQuantity * (item.baseQuantity / item.orderedQuantity)).toFixed(2)} {item.baseUnit}
                      </div>
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="text-sm">{item.orderUnit}</div>
                      <div className="text-xs text-gray-500">{item.baseUnit}</div>
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="text-sm">${item.unitPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        ${(item.unitPrice * (item.baseQuantity / item.orderedQuantity)).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="text-sm">${item.totalPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        ${(item.totalPrice * (item.baseQuantity / item.orderedQuantity)).toFixed(2)}
                      </div>
                    </TableCell>
                    {/* <TableCell className="py-1">
                      <Badge className={`${getStatusColor(item.status)} text-xs px-1 py-0.5`}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleAddNote(item)}>
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleCancelItem(item)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell> */}
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
}; 


function onAddItem(newItem: Item) {
  throw new Error('Function not implemented.');
}

function setEditingItem(arg0: null) {
  throw new Error('Function not implemented.');
}

