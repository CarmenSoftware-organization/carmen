"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CurrencyCode, PurchaseOrder, PurchaseRequest,PurchaseOrderStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Eye,
  Trash2,
  X,
  CheckSquare,
  FileDown,
  Mail,
  Printer,
  Edit2Icon,
  ImageIcon,
  MessageSquareIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ExportSidepanel } from "./ExportSidepanel";
import { ExportProvider } from "./ExportContext";
import { PrintOptionsSidepanel } from "./PrintOptionsSidepanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ListPageTemplate from "@/components/templates/ListPageTemplate";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreatePOFromPR from "./createpofrompr";

// This is a mock data structure. Replace with actual data fetching logic.
const purchaseOrders : PurchaseOrder[] = [
  {
    poId: 1,
    number: "PO-001",
    orderDate: new Date("2023-08-01"),
    DeliveryDate: new Date("2023-08-15"),
    vendorId: 1,
    totalAmount: 1000.0,
    status: PurchaseOrderStatus.OPEN,
    email: "orders@luxurylinens.com",
    currencyCode: "USD",
    exchangeRate: 1.0,
    createdBy: 1,
    vendorName: "Luxury Linens",
    items: [],
  },
  {
    poId: 2,
    number: "PO-002",
    orderDate: new Date("2023-08-02"),
    DeliveryDate: new Date("2023-08-20"),
    vendorId: 2,
    totalAmount: 1500.5,
    status: PurchaseOrderStatus.SENT,
    email: "sales@gourmetkitchen.com",
    currencyCode: "USD",
    exchangeRate: 1.0,
    createdBy: 2,
    vendorName: "Gourmet Kitchen",
    items: [],
  },
  {
    poId: 3,
    number: "PO-003",
    orderDate: new Date("2023-08-03"),
    DeliveryDate: new Date("2023-08-25"),
    vendorId: 3,
    totalAmount: 2500.75,
    status: PurchaseOrderStatus.FULLY_RECEIVED,
    email: "info@elegantfurniture.com",
    currencyCode: "USD",
    exchangeRate: 1.0,
    createdBy: 3,
    vendorName: "Elegant Furniture",
    items: [],
  },
  {
    poId: 4,
    number: "PO-004",
    orderDate: new Date("2023-08-04"),
    DeliveryDate: new Date("2023-08-30"),
    vendorId: 4,
    totalAmount: 750.25,
    status: PurchaseOrderStatus.OPEN,
    email: "orders@ecoclean.com",
    currencyCode: "USD",
    exchangeRate: 1.0,
    createdBy: 4,
    vendorName: "Eco Clean",
    items: [],
  },
  {
    poId: 5,
    number: "PO-005",
    orderDate: new Date("2023-08-05"),
    DeliveryDate: new Date("2023-09-05"),
    vendorId: 5,
    totalAmount : 3000.0,
    status: PurchaseOrderStatus.SENT,
    email: "sales@smartroom.com",
    currencyCode: "USD",
    exchangeRate: 1.0,
    createdBy: 5,
    vendorName: "Smart Room",
    items: [],
  },
  {
    poId: 6,
    number: "PO-006",
    orderDate: new Date("2023-08-06"),
    DeliveryDate: new Date("2023-08-10"),
    vendorId: 6,
    totalAmount: 500.5,
    status: PurchaseOrderStatus.PARTIALLY_RECEIVED,
    email: "orders@hospitalityessentials.com",
    currencyCode: "USD",
    exchangeRate: 1.0,
    createdBy: 6,
    vendorName: "Hospitality Essentials",
    items: [],
  },
  {
    poId: 7,
    number: "PO-007",
    orderDate: new Date("2023-08-07"),
    DeliveryDate: new Date("2023-08-15"),
    vendorId: 7,
    totalAmount: 4500.0,
    status: PurchaseOrderStatus.OPEN,
    email: "sales@luxebedding.com",
    currencyCode: "USD",
    exchangeRate: 1.0,
    createdBy: 7,
    vendorName: "Luxury Bedding",
    items: [],
  },
  {
    poId: 8,
    number: "PO-008",
    orderDate: new Date("2023-08-08"),
    DeliveryDate: new Date("2023-08-18"),
    vendorId: 8,
    totalAmount: 2000.25,
    status: PurchaseOrderStatus.SENT,
    email: "orders@hotelmaintenance.com",
    currencyCode: "USD",
    exchangeRate: 1.0,
    createdBy: 8,
    vendorName: "Hotel Maintenance",
    items: [],
  },
  {
    poId: 9,
    number: "PO-009",
    orderDate: new Date("2023-08-09"),
    DeliveryDate: new Date("2023-08-20"),
    vendorId: 9,
    totalAmount: 1750.75,
    status: PurchaseOrderStatus.CANCELLED,
    email: "info@guestamenities.com",
    currencyCode: "USD",
    exchangeRate: 1.0,
    createdBy: 9,
    vendorName: "Guest Amenities",
    items: [],
  },
  {
    poId: 10,
    number: "PO-010",
    orderDate: new Date("2023-08-10"),
    DeliveryDate: new Date("2023-08-22"),
    vendorId: 10,
    totalAmount: 3500.0,
    status: PurchaseOrderStatus.PARTIALLY_RECEIVED,
    email: "sales@premiumhotelfurnishings.com", 
    currencyCode: "USD",
    exchangeRate: 1.0,
    createdBy: 10,
    vendorName: "Premium Hotel Furnishings",
    items: [],
  },
];

const PurchaseOrderList: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredPOs, setFilteredPOs] = useState(purchaseOrders);
  const [selectedPOs, setSelectedPOs] = useState<number[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(
    CurrencyCode.USD
  );
  const [isCreateFromPROpen, setIsCreateFromPROpen] = useState(false);
  const [isCreateManuallyOpen, setIsCreateManuallyOpen] = useState(false);
  const [selectedPRs, setSelectedPRs] = useState<PurchaseRequest[]>([]);
  const [generatedPOs, setGeneratedPOs] = useState<typeof purchaseOrders>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [newManualPO, setNewManualPO] = useState({
    number: "",
    date: new Date(),
    vendor: "",
    total: 0,
    status: "Open",
    email: "",
  });
  const itemsPerPage = 6;

  const handleCreateManually = () => {
    router.push("/procurement/purchase-orders/${0}");
  };

  useEffect(() => {
    const filtered = purchaseOrders.filter(
      (po) =>
        (po.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          po.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "" || po.status === statusFilter)
    );
    setFilteredPOs(filtered);
    setCurrentPage(1);
    setSelectedPOs([]);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPOs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleBulkAction = (
    action: "delete" | "void" | "close",
    poIds: number[] = selectedPOs
  ) => {
    // Implement the bulk action logic here
    console.log(`Action: ${action} for POs:`, poIds);
    // You would typically make an API call here to perform the action
    // Then update the local state accordingly
    // For now, we'll just log the action and clear the selection if it's a bulk action
    if (poIds === selectedPOs) {
      setSelectedPOs([]);
    } else {
      // If it's a single PO action, update the PO status in the local state
      setFilteredPOs((prevPOs) =>
        prevPOs.map((po) => {
          if (poIds.includes(po.poId)) {
            return {
              ...po,
              status:
                action === "delete"
                  ? PurchaseOrderStatus.DELETED
                  : action === "void"
                  ? PurchaseOrderStatus.VOIDED
                  : PurchaseOrderStatus.CLOSED,
            }
          }
          return po
        })
      )
    }
  }

  const handleSelectPO = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedPOs([...selectedPOs, id]);
    } else {
      setSelectedPOs(selectedPOs.filter((poId) => poId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPOs(currentItems.map((po) => po.poId));
    } else {
      setSelectedPOs([]);
    }
  };

  const handleGeneratePOs = () => {
    const newPOs = selectedPRs.map((pr) => {
      return {
        poId: Math.max(...purchaseOrders.map((po) => po.poId)) + 1,
        number: `PO-${String(Math.random()).slice(2, 6)}`,
        orderDate: new Date(),
        DeliveryDate: pr.deliveryDate,
        vendorId: pr.vendorId,
        vendorName: "",
        totalAmount: 0 , // pr.totalAmount,
        status: PurchaseOrderStatus.OPEN,
        email: "autogenerated@vendor.com",
      };
    });

    setGeneratedPOs(newPOs as unknown as PurchaseOrder[]);
    setIsCreateFromPROpen(false);
    setIsConfirmationOpen(true);
  };

  const handleConfirmPOs = () => {
    // Here you would implement the logic to confirm and save the generated POs
    setFilteredPOs([...filteredPOs, ...generatedPOs]);
    setIsConfirmationOpen(false);
  };

  const handlePrintPO = (poId: number) => {
    console.log(`Printing PO: ${poId}`);
    // Implement print logic here
  };

  const handleSendEmail = (poId: number) => {
    console.log(`Sending email for PO: ${poId}`);
    // Implement email sending logic here
  };

  const filters = (
    <>
      <div className="flex w-full justify-between space-x-2">
        <Input
          type="text"
          placeholder="Search POs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {statusFilter || "All Statuses"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[180px]">
            <DropdownMenuItem onSelect={() => setStatusFilter("")}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatusFilter("Open")}>
              Open
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatusFilter("Send")}>
              Send
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setStatusFilter("Partial Received")}
            >
              Partial Received
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatusFilter("Closed")}>
              Closed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  const content = (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          checked={currentItems.length > 0 && selectedPOs.length === currentItems.length}
          onCheckedChange={handleSelectAll}
          id="select-all"
        />
        <Label htmlFor="select-all">Select All</Label>
      </div>
      <div className="space-y-2">
        {currentItems.map((po) => (
          <Card key={po.poId}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedPOs.includes(po.poId)}
                    onCheckedChange={(checked) => handleSelectPO(po.poId, checked as boolean)}
                  />
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        po.status === PurchaseOrderStatus.OPEN
                          ? "default"
                          : po.status === PurchaseOrderStatus.SENT
                          ? "secondary"
                          : po.status === PurchaseOrderStatus.PARTIALLY_RECEIVED
                          ? "secondary"
                          : po.status === PurchaseOrderStatus.CLOSED
                          ? "outline"
                          : "destructive"
                      }
                    >
                      {po.status}
                    </Badge>
                    <h3 className="text-lg font-semibold">
                      {po.vendorName} <span className="text-sm font-normal text-muted-foreground">({po.number})</span>
                    </h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/procurement/purchase-orders/${po.poId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View purchase order details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        ...
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {po.status === PurchaseOrderStatus.OPEN && (
                        <DropdownMenuItem
                          onSelect={() => handleBulkAction("delete", [po.poId])}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                      {["Send", "Partial Received"].includes(po.status) && (
                        <DropdownMenuItem
                          onSelect={() => handleBulkAction("void", [po.poId])}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Void
                        </DropdownMenuItem>
                      )}
                      {["Open", "Send", "Partial Received"].includes(
                        po.status
                      ) && (
                        <DropdownMenuItem
                          onSelect={() => handleBulkAction("close", [po.poId])}
                        >
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Close
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={() => handlePrintPO(po.poId)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleSendEmail(po.poId)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p>{po.orderDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Delivery Date</Label>
                  <p>{po.DeliveryDate ? po.DeliveryDate.toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total</Label>
                  <p>${po.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p>{po.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintPO(po.poId)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendEmail(po.poId)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            variant={currentPage === i + 1 ? "default" : "outline"}
            className="mx-1"
          >
            {i + 1}
          </Button>
        ))}
      </div>

      {/* Create from PR Dialog */}
      <Dialog open={isCreateFromPROpen} onOpenChange={setIsCreateFromPROpen}>
        <DialogContent className="sm:max-w-[800px] bg-white p-6">
          <DialogHeader>
            <DialogTitle>Create PO from Purchase Request</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
          <Card>

          <CardContent className="py-4">
            <CreatePOFromPR onSelectPRs={setSelectedPRs} />
          </CardContent>

          </Card>
          </ScrollArea>

          <DialogFooter>
            <Button
              onClick={handleGeneratePOs}
              disabled={selectedPRs.length === 0}
            >
              Generate PO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="sm:max-w-[800px] bg-white p-6">
          <DialogHeader>
            <DialogTitle>Confirm Generated Purchase Orders</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref#</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedPOs.map((po) => (
                  <TableRow key={po.poId}>
                    <TableCell>{po.number}</TableCell>
                    <TableCell>{po.vendorName}</TableCell>
                    <TableCell>{po.email}</TableCell>
                    <TableCell>${po.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintPO(po.poId)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmPOs}>Confirm</Button>
            <Button
              variant="outline"
              onClick={() => setIsConfirmationOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Manually Dialog */}
      <Dialog
        open={isCreateManuallyOpen}
        onOpenChange={setIsCreateManuallyOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Purchase Order Manually</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="po-number" className="text-right">
                PO Number
              </Label>
              <Input
                id="po-number"
                value={newManualPO.number}
                onChange={(e) =>
                  setNewManualPO({ ...newManualPO, number: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="po-date" className="text-right">
                Date
              </Label>
              <Input
                id="po-date"
                type="date"
                value={newManualPO.date.toISOString().split('T')[0]}
                onChange={(e) =>
                  setNewManualPO({ ...newManualPO, date: new Date(e.target.value) })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="po-vendor" className="text-right">
                Vendor
              </Label>
              <Input
                id="po-vendor"
                value={newManualPO.vendor}
                onChange={(e) =>
                  setNewManualPO({ ...newManualPO, vendor: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="po-total" className="text-right">
                Total
              </Label>
              <Input
                id="po-total"
                type="number"
                value={newManualPO.total}
                onChange={(e) =>
                  setNewManualPO({
                    ...newManualPO,
                    total: parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="po-email" className="text-right">
                Email
              </Label>
              <Input
                id="po-email"
                type="email"
                value={newManualPO.email}
                onChange={(e) =>
                  setNewManualPO({ ...newManualPO, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                const newPO = {
                  poId: Math.max(...purchaseOrders.map((po) => po.poId)) + 1,
                  ...newManualPO,
                };
                setFilteredPOs([...filteredPOs, newPO as unknown as PurchaseOrder]);
                setIsCreateManuallyOpen(false);
                setNewManualPO({
                  number: "",
                  date: new Date(),
                  vendor: "",
                  total: 0,
                  status: "Open",
                  email: "",
                });
              }}
            >
              Create PO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  const bulkActions = selectedPOs.length > 0 ? (
    <div className="flex space-x-2 mb-4">
      <Button
        variant="outline"
        onClick={() => handleBulkAction("delete")}
        disabled={!selectedPOs.some(id => currentItems.find(po => po.poId === id)?.status === PurchaseOrderStatus.OPEN)}
      >
        Delete Selected
      </Button>
      <Button
        variant="outline"
        onClick={() => handleBulkAction("void")}
        disabled={!selectedPOs.some(id => ["Send", "Partial Received"].includes(currentItems.find(po => po.poId === id)?.status || ""))}
      >
        Void Selected
      </Button>
      <Button
        variant="outline"
        onClick={() => handleBulkAction("close")}
        disabled={!selectedPOs.some(id => ["Open", "Send", "Partial Received"].includes(currentItems.find(po => po.poId === id)?.status || ""))}
      >
        Close Selected
      </Button>
    </div>
  ) : null;

  const actionButtons = (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={() => setIsExportOpen(true)}>
        <FileDown className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline" onClick={() => setIsPrintOpen(true)}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Create PO</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setIsCreateFromPROpen(true)}>Create from PR</DropdownMenuItem>
          <DropdownMenuItem onSelect={handleCreateManually}>Create Manually</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <ListPageTemplate
      title="Purchase Orders"
      actionButtons={actionButtons}
      filters={filters}
      content={content}
      bulkActions={bulkActions}
    />
  );
};

export default PurchaseOrderList;

  
