"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/custom-dialog";
import {
  Edit2Icon,
  XIcon,
  SaveIcon,
} from "lucide-react";
import { PurchaseOrderItem } from "@/lib/types";
import { PrItemsTable } from "./pr-items-table";
import InventoryBreakdown from "./inventory-breakdown";
import { PendingPurchaseOrdersComponent } from "./pending-purchase-orders";
import { GoodsReceiveNoteTable } from "./goods-receive-note-table";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import SummaryTable from "./Summary";

type Mode = "view" | "edit" | "add";

interface ItemDetailsComponentProps {
  initialMode: Mode;
  onClose: () => void;
  isOpen: boolean;
  initialData?: PurchaseOrderItem;
  onSubmit?: (item: PurchaseOrderItem) => void;
}

export function ItemDetailsComponent({
  initialMode,
  onClose,
  isOpen,
  initialData,
  onSubmit,
}: ItemDetailsComponentProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [itemData, setItemData] = useState<Partial<PurchaseOrderItem>>(
    initialData || {}
  );
  const [isPrItemsTableOpen, setIsPrItemsTableOpen] = useState(false);
  const [isInventoryBreakdownOpen, setIsInventoryBreakdownOpen] =
    useState(false);
  const [isPendingPOsOpen, setIsPendingPOsOpen] = useState(false);
  const [isGRNDialogOpen, setIsGRNDialogOpen] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setItemData(initialData || {});
  }, [initialMode, initialData]);

  const isReadOnly = mode === "view";

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const handleSave = () => {
    if (onSubmit && (mode === "edit" || mode === "add")) {
      onSubmit(itemData as PurchaseOrderItem);
    }
    onClose();
  };

  const handleRequestNumberClick = () => {
    setIsPrItemsTableOpen(true);
  };

  const handleOnHandClick = () => {
    setIsInventoryBreakdownOpen(true);
  };

  const handleOnOrderClick = () => {
    setIsPendingPOsOpen(true);
  };

  const handleGoodsReceivedClick = () => {
    setIsGRNDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold">
                PO Item Details
              </DialogTitle>
              <div className="flex items-center space-x-2">
                {mode === "view" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModeChange("edit")}
                  >
                    <Edit2Icon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {mode === "edit" && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleSave}>
                      <SaveIcon className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModeChange("view")}
                    >
                      <XIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {mode === "add" && (
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                )}

                <DialogClose asChild>
                  <Button variant="ghost" size="sm">
                    <XIcon className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] w-full overflow-y-auto">
           <div className="space-y-2">
                <div>
                  <h3 className="text-md font-semibold mb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div className="space-y-1 col-span-1">
                      <Label htmlFor="name" className="text-xs">Name</Label>
                      <Input
                        id="name"
                        defaultValue="Organic Quinoa zzz"
                        readOnly={isReadOnly}
                        className="h-7 text-sm"
                      />
                    </div>
                    <div className="space-y-1 col-span-1 lg:col-span-3">
                      <Label htmlFor="description" className="text-xs">Description</Label>
                      <Input
                        id="description"
                        defaultValue="Premium organic white quinoa grains"
                        readOnly={isReadOnly}
                        className="h-7 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex flex-col md:flex-row justify-between gap-2">
                  <h3 className="text-md font-semibold mb-2">Quantity and Delivery</h3>
                  <div className="flex flex-wrap justify-end gap-2 py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestNumberClick}
              >
                Request #
              </Button>
              <Button variant="outline" size="sm" onClick={handleOnHandClick}>
                On Hand
              </Button>
              <Button variant="outline" size="sm" onClick={handleOnOrderClick}>
                On Order
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoodsReceivedClick}
              >
                G. Received
              </Button>
            </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-2">
                    <div className="lg:col-span-1 space-y-1">
                      <Label htmlFor="unit" className="text-xs">
                        Unit
                      </Label>
                      <Input
                        id="unit"
                        defaultValue="Kg"
                        readOnly={isReadOnly}
                        className="h-7 text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Base: Kg | 1 Bag = 0.5 Kg
                      </p>
                    </div>
                    <div className="lg:col-span-1 space-y-1 flex items-center">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="foc" disabled={isReadOnly} />
                        <Label htmlFor="foc" className="text-xs">
                          FOC
                        </Label>
                      </div>
                    </div>
                    <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="ordered-quantity" className="text-xs">
                          Ordered Quantity
                        </Label>
                        <Input
                          id="ordered-quantity"
                          defaultValue="500"
                          readOnly={isReadOnly}
                          className="h-7 text-sm"
                        />
                        <p className="text-xs text-gray-500">5 Kg</p>
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="received-quantity"
                          className="text-xs"
                        >
                          Received Quantity
                        </Label>
                        <Input
                          id="received-quantity"
                          defaultValue="450"
                          readOnly={isReadOnly}
                          className="h-7 text-sm"
                        />
                        <p className="text-xs text-gray-500">4.5 Kg</p>
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="remaining-quantity"
                          className="text-xs"
                        >
                          Remaining Quantity
                        </Label>
                        <Input
                          id="remaining-quantity"
                          defaultValue="50"
                          readOnly={isReadOnly}
                          className="h-7 text-sm"
                        />
                        <p className="text-xs text-gray-500">0.5 Kg</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500 bg-muted p-2">
                    <div>
                      <Label className="block text-xs">On Hand</Label>
                      <span>100 Kg</span>
                    </div>
                    <div>
                      <Label className="block text-xs">On Ordered</Label>
                      <span>200 Kg</span>
                    </div>
                    <div>
                      <Label className="block text-xs">Reorder Level</Label>
                      <span>50 Kg</span>
                    </div>
                    <div>
                      <Label className="block text-xs">Restock Level</Label>
                      <span>300 Kg</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-md font-semibold mb-2">Pricing</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="space-y-1 sm:col-span-1">
                          <Label htmlFor="currency" className="text-xs">
                            Currency
                          </Label>
                          <Input
                            id="currency"
                            defaultValue="USD"
                            readOnly={isReadOnly}
                            className="h-7 text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-1">
                          <Label htmlFor="exch-rate" className="text-xs">
                            Exch. Rate
                          </Label>
                          <Input
                            id="exch-rate"
                            defaultValue="1"
                            readOnly={isReadOnly}
                            className="h-7 text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-1">
                          <Label htmlFor="price" className="text-xs">
                            Price
                          </Label>
                          <Input
                            id="price"
                            defaultValue="3.99"
                            readOnly={isReadOnly}
                            className="h-7 text-sm"
                          />
                        </div>

                        <div className="flex flex-col pt-2">
                        <Label
                          htmlFor="enable-adjustment"
                          className="text-xs"
                        >
                           Tax Incl.
                        </Label>
                        <div className="flex items-center h-7">
                        <Checkbox
                          id="enable-adjustment"
                          disabled={isReadOnly}
                          className="text-sm"
                        />
                        </div>
                        
                      </div>

                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex gap-2 items-center w-full">
                          <div className="flex flex-col">
                            <Label
                              htmlFor="enable-disc-adjustment"
                              className="space-y-1 text-xs"
                            >
                              Adj.
                            </Label>
                            <div className="flex items-center h-7">
                              <Checkbox
                                id="enable-disc-adjustment"
                                disabled={isReadOnly}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-1 w-full">
                            <Label htmlFor="disc-rate" className="text-xs">
                              Disc. Rate (%)
                            </Label>
                            <Input
                              id="disc-rate"
                              defaultValue="5"
                              readOnly={isReadOnly}
                              className="h-7 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1 w-full">
                          <Label htmlFor="override-discount" className="text-xs">
                            Override Discount
                          </Label>
                          <Input
                            id="override-discount"
                            placeholder="Enter to override"
                            readOnly={isReadOnly}
                            className="h-7 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex gap-2 items-center w-full">
                          <div className="flex flex-col">
                            <Label
                              htmlFor="enable-tax-adjustment"
                              className="space-y-1 text-xs"
                            >
                              Adj.
                            </Label>
                            <div className="flex items-center h-7">
                              <Checkbox
                                id="enable-tax-adjustment"
                                disabled={isReadOnly}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-1 w-full">
                            <Label htmlFor="tax-rate" className="text-xs">
                              Tax Rate (%)
                            </Label>
                            <Input
                              id="tax-rate"
                              defaultValue="7"
                              readOnly={isReadOnly}
                              className="h-7 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="override-tax" className="text-xs">
                            Override Tax
                          </Label>
                          <Input
                            id="override-tax"
                            placeholder="Enter to override"
                            readOnly={isReadOnly}
                            className="h-7 text-sm"
                          />
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500 bg-muted p-2">
                        <div>
                          <Label className="block text-xs">Last Price</Label>
                          <span>$3.85 per Kg</span>
                        </div>
                        <div>
                          <Label className="block text-xs">
                            Last Order Date
                          </Label>
                          <span>2023-05-15</span>
                        </div>
                        <div>
                          <Label className="block text-xs">Last Vendor</Label>
                          <span>Organic Supplies Inc.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold mb-2">Calculated Amounts</h3>
                    <SummaryTable
                      item={itemData as PurchaseOrderItem}
                      currencyBase="THB"
                      currencyCurrent="USD"
                    />
                  </div>
                </div>
                </div>
          </ScrollArea>

        </DialogContent>
      </Dialog>

      <Dialog open={isPrItemsTableOpen} onOpenChange={setIsPrItemsTableOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center">
              <DialogTitle>Relate Purchase Requests</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  <XIcon className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <PrItemsTable />
        </DialogContent>
      </Dialog>

      <InventoryBreakdown
        isOpen={isInventoryBreakdownOpen}
        onClose={() => setIsInventoryBreakdownOpen(false)}
        itemData={{
          name: itemData.name || "",
          description: itemData.description || "",
          status: itemData.status || "Pending",
        }}
      />

      <Dialog open={isPendingPOsOpen} onOpenChange={setIsPendingPOsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center">
              <DialogTitle>Pending Purchase Orders</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  <XIcon className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <PendingPurchaseOrdersComponent />
        </DialogContent>
      </Dialog>

      <Dialog open={isGRNDialogOpen} onOpenChange={setIsGRNDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <div className="flex justify-between w-full items-center">
          <DialogTitle>Goods Receive Note</DialogTitle>
          <DialogClose asChild>
                  <Button variant="ghost" size="sm">
                    <XIcon className="h-4 w-4" />
                  </Button>
                </DialogClose>
                </div>
          </DialogHeader>
          <GoodsReceiveNoteTable />
        </DialogContent>
      </Dialog>
    </>
  );
}