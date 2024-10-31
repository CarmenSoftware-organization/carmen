"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom-dialog";
import {
  Edit,
  Info,
  Package,
  Plus,
  Printer,
  Send,
  Trash2,
  XIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { CnLotApplication } from "./cn-lot-application";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import Inventory from "./inventory"
import JournalEntries  from "./journal-entries"
import TaxEntries  from "./tax-entries"
import { StockMovementTab } from "./StockMovementTab"

type CreditNoteType = "QUANTITY_RETURN" | "AMOUNT_DISCOUNT";
type CreditNoteStatus = "DRAFT" | "POSTED" | "VOID";
type CreditNoteReason =
  | "PRICING_ERROR"
  | "DAMAGED_GOODS"
  | "RETURN"
  | "DISCOUNT_AGREEMENT"
  | "OTHER";

interface CreditNoteHeaderProps {
  creditNoteNumber: string;
  date: string;
  type: CreditNoteType;
  status: CreditNoteStatus;
  vendorName: string;
  vendorCode: string;
  currency: string;
  invoiceReference: string;
  invoiceDate: string;
  taxInvoiceReference: string;
  taxDate: string;
  grnReference: string;
  grnDate: string;
  reason: CreditNoteReason;
  description: string;
  onHeaderChange: (field: string, value: string) => void;
}

function CreditNoteHeader({
  creditNoteNumber,
  date,
  type,
  status,
  vendorName,
  vendorCode,
  currency,
  invoiceReference,
  invoiceDate,
  taxInvoiceReference,
  taxDate,
  grnReference,
  grnDate,
  reason,
  description,
  onHeaderChange,
}: CreditNoteHeaderProps) {
  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
        <CardTitle>Credit Note Header</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="creditNoteNumber">Credit Note Number</Label>
            <Input
              id="creditNoteNumber"
              value={creditNoteNumber}
              onChange={(e) =>
                onHeaderChange("creditNoteNumber", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onHeaderChange("date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => onHeaderChange("type", value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QUANTITY_RETURN">Quantity Return</SelectItem>
                <SelectItem value="AMOUNT_DISCOUNT">Amount Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => onHeaderChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
                <SelectItem value="VOID">Void</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select
              value={reason}
              onValueChange={(value) => onHeaderChange("reason", value)}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRICING_ERROR">Pricing Error</SelectItem>
                <SelectItem value="DAMAGED_GOODS">Damaged Goods</SelectItem>
                <SelectItem value="RETURN">Return</SelectItem>
                <SelectItem value="DISCOUNT_AGREEMENT">
                  Discount Agreement
                </SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendorName">Vendor Name</Label>
            <Input
              id="vendorName"
              value={vendorName}
              onChange={(e) => onHeaderChange("vendorName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendorCode">Vendor Code</Label>
            <Input
              id="vendorCode"
              value={vendorCode}
              onChange={(e) => onHeaderChange("vendorCode", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => onHeaderChange("currency", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceReference">Invoice Reference</Label>
            <Input
              id="invoiceReference"
              value={invoiceReference}
              onChange={(e) =>
                onHeaderChange("invoiceReference", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={invoiceDate}
              onChange={(e) => onHeaderChange("invoiceDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxInvoiceReference">Tax Invoice Reference</Label>
            <Input
              id="taxInvoiceReference"
              value={taxInvoiceReference}
              onChange={(e) =>
                onHeaderChange("taxInvoiceReference", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxDate">Tax Date</Label>
            <Input
              id="taxDate"
              type="date"
              value={taxDate}
              onChange={(e) => onHeaderChange("taxDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grnReference">GRN Reference</Label>
            <Input
              id="grnReference"
              value={grnReference}
              onChange={(e) => onHeaderChange("grnReference", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grnDate">GRN Date</Label>
            <Input
              id="grnDate"
              type="date"
              value={grnDate}
              onChange={(e) => onHeaderChange("grnDate", e.target.value)}
            />
          </div>
          <div className="space-y-2 col-span-full">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => onHeaderChange("description", e.target.value)}
              placeholder="Enter a detailed description..."
              className="min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CreditNoteComponent() {
  const [headerData, setHeaderData] = useState({
    creditNoteNumber: "",
    date: "",
    type: "PRICE_DIFFERENCE" as CreditNoteType,
    status: "DRAFT" as CreditNoteStatus,
    vendorName: "",
    vendorCode: "",
    currency: "",
    invoiceReference: "",
    invoiceDate: "",
    taxInvoiceReference: "",
    taxDate: "",
    grnReference: "",
    grnDate: "",
    reason: "PRICING_ERROR" as CreditNoteReason,
    description: "",
  });

  const handleHeaderChange = (field: string, value: string) => {
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const [openInfo, setOpenInfo] = useState(Boolean);

  const handleOpeninfo = () => {
    setOpenInfo(!openInfo);
  };

  const mockStockMovements = [
    {
      id: "1",
      documentNo: "CN-001",
      documentType: "CREDIT_NOTE",
      date: "2024-03-20",
      itemCode: "PROD-001",
      itemName: "Sample Product",
      itemDescription: "High-quality widget",
      location: {
        id: "LOC-001",
        code: "WH-001",
        name: "Main Warehouse",
        type: "WAREHOUSE"
      },
      fromLocation: "Main Warehouse",
      toLocation: "Main Warehouse",
      quantity: -10,
      unit: "Box",
      lotNumber: "LOT-001",
      baseQuantity: -100,
      baseUom: "Piece",
      inventoryUnit: "Box",
      cost: 100.00,
      totalCost: 1000.00,
      netAmount: 1000.00,
      totalAmount: 1100.00,
      currency: "USD",
      extraCost: 100.00,
      status: "POSTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "system",
      updatedBy: "system"
    },
    {
      id: "2",
      documentNo: "CN-001",
      documentType: "CREDIT_NOTE",
      date: "2024-03-20",
      itemCode: "PROD-002",
      itemName: "Another Product",
      itemDescription: "Durable gadget",
      location: {
        id: "LOC-001",
        code: "WH-001",
        name: "Main Warehouse",
        type: "WAREHOUSE"
      },
      fromLocation: "Main Warehouse",
      toLocation: "Main Warehouse",
      quantity: -5,
      unit: "Case",
      lotNumber: "LOT-002",
      baseQuantity: -50,
      baseUom: "Unit",
      inventoryUnit: "Case",
      cost: 200.00,
      totalCost: 1000.00,
      netAmount: 1000.00,
      totalAmount: 1100.00,
      currency: "USD",
      extraCost: 100.00,
      status: "POSTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "system",
      updatedBy: "system"
    }
  ]

  return (
    <div className="space-y-4">
      <CreditNoteHeader {...headerData} onHeaderChange={handleHeaderChange} />
      <Tabs defaultValue="itemDetails" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="itemDetails">Item Details</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="stockMovement">Stock Movement</TabsTrigger>
          <TabsTrigger value="journalEntries">Journal Entries</TabsTrigger>
          <TabsTrigger value="taxEntries">Tax Entries</TabsTrigger>
        </TabsList>
        <TabsContent value="itemDetails">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Item Details</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Location</TableHead>
                    <TableHead className="w-[200px]">Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>Location 1</div>
                    </TableCell>

                    <TableCell className="font-medium">
                      <div>Sample Product</div>
                      <div className="text-sm text-muted-foreground">
                        High-quality widget
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>10</div>
                      <div className="text-sm text-muted-foreground">100</div>
                    </TableCell>
                    <TableCell>
                      <div>Box</div>
                      <div className="text-sm text-muted-foreground">Piece</div>
                    </TableCell>
                    <TableCell>
                      <div>100.00</div>
                      <div className="text-sm text-muted-foreground">
                        5,000.00
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>1,000.00</div>
                      <div className="text-sm text-muted-foreground">
                        50,000.00
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>100.00</div>
                      <div className="text-sm text-muted-foreground">
                        5,000.00
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>1,100.00</div>
                      <div className="text-sm text-muted-foreground">
                        55,000.00
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpeninfo()}
                      >
                        <Info className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>Location 1</div>
                    </TableCell>

                    <TableCell className="font-medium">
                      <div>Another Product</div>
                      <div className="text-sm text-muted-foreground">
                        Durable gadget
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>5</div>
                      <div className="text-sm text-muted-foreground">50</div>
                    </TableCell>
                    <TableCell>
                      <div>Case</div>
                      <div className="text-sm text-muted-foreground">Unit</div>
                    </TableCell>
                    <TableCell>
                      <div>200.00</div>
                      <div className="text-sm text-muted-foreground">
                        10,000.00
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>1,000.00</div>
                      <div className="text-sm text-muted-foreground">
                        50,000.00
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>100.00</div>
                      <div className="text-sm text-muted-foreground">
                        5,000.00
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>1,100.00</div>
                      <div className="text-sm text-muted-foreground">
                        55,000.00
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory">
          <Inventory />
        </TabsContent>
        <TabsContent value="stockMovement">
          <StockMovementTab 
            mode="view" 
            movements={mockStockMovements}
          />
        </TabsContent>
        <TabsContent value="journalEntries">
          <JournalEntries />
        </TabsContent>
        <TabsContent value="taxEntries">
          <TaxEntries />
        </TabsContent>
      </Tabs>
      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount (USD)</TableHead>
                  <TableHead className="text-right">
                    Base Amount (PHP)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Net Amount</TableCell>
                  <TableCell className="text-right">2,000.00</TableCell>
                  <TableCell className="text-right">100,000.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tax Amount</TableCell>
                  <TableCell className="text-right">200.00</TableCell>
                  <TableCell className="text-right">10,000.00</TableCell>
                </TableRow>
                
                <TableRow className="font-bold">
                  <TableCell>Total Amount</TableCell>
                  <TableCell className="text-right">2,100.00</TableCell>
                  <TableCell className="text-right">105,000.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={openInfo} onOpenChange={setOpenInfo}>
        <DialogContent className="sm:max-w-[80vw] bg-white [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center border-b pb-4">
              <DialogTitle>
                {" "}
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-gray-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Product Information
                  </h2>
                </div>
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  <XIcon className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <CnLotApplication />
        </DialogContent>
      </Dialog>
    </div>
  );
}
