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
import { Mock_purchaseOrders } from "@/lib/mock/purchaseOrder";  
import StatusBadge from "@/components/ui/custom-status-badge";
import { randomUUID } from "crypto";

const PurchaseOrderList: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredPOs, setFilteredPOs] = useState(Mock_purchaseOrders);
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(
    CurrencyCode.USD
  );
  const [isCreateFromPROpen, setIsCreateFromPROpen] = useState(false);
  const [isCreateManuallyOpen, setIsCreateManuallyOpen] = useState(false);
  const [selectedPRs, setSelectedPRs] = useState<PurchaseRequest[]>([]);
  const [generatedPOs, setGeneratedPOs] = useState<typeof Mock_purchaseOrders>([]);
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
    const filtered = Mock_purchaseOrders.filter(
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
    poIds: string[] = selectedPOs
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
                  ? PurchaseOrderStatus.Deleted
                  : action === "void"
                  ? PurchaseOrderStatus.Voided
                  : PurchaseOrderStatus.Closed,
            }
          }
          return po
        })
      )
    }
  }

  const handleSelectPO = (id: string, checked: boolean) => {
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
        poId: randomUUID(), //  (...Mock_purchaseOrders.map((po) => po.poId)),
        number: `PO-${String(Math.random()).slice(2, 6)}`,
        orderDate: new Date(),
        DeliveryDate: pr.deliveryDate,
        vendorId: pr.vendorId,
        vendorName: "",
        totalAmount: 0 , // pr.totalAmount,
        status: PurchaseOrderStatus.Open,
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

  const handlePrintPO = (poId: string) => {
    console.log(`Printing PO: ${poId}`);
    // Implement print logic here
  };

  const handleSendEmail = (poId: string) => {
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
      <div className="space-y-4">
        {currentItems.map((po) => (
          <Card key={po.poId}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedPOs.includes(po.poId)}
                    onCheckedChange={(checked) => handleSelectPO(po.poId, checked as boolean)}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                    <StatusBadge status={po.status} />
                    <h3 className="text-lg font-semibold mt-2 sm:mt-0">
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handlePrintPO(po.poId)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Print purchase order</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleSendEmail(po.poId)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send email</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/procurement/purchase-orders/${po.poId}/edit`}>
                            <Edit2Icon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit purchase order</p>
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
                      {po.status === PurchaseOrderStatus.Open && (
                        <DropdownMenuItem
                          onSelect={() => handleBulkAction("delete", [po.poId])}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                      {["Send", "PartialReceived"].includes(po.status) && (
                        <DropdownMenuItem
                          onSelect={() => handleBulkAction("void", [po.poId])}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Void
                        </DropdownMenuItem>
                      )}
                      {["Open", "Send", "PartialReceived"].includes(po.status) && (
                        <DropdownMenuItem
                          onSelect={() => handleBulkAction("close", [po.poId])}
                        >
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Close
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Attachments
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquareIcon className="mr-2 h-4 w-4" />
                        Comments
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                  <p className="truncate">{po.email}</p>
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
                  poId: randomUUID(), // Math.max(...Mock_purchaseOrders.map((po) => po.poId)) + 1,
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
        disabled={!selectedPOs.some(id => currentItems.find(po => po.poId === id)?.status === PurchaseOrderStatus.Open)}
      >
        Delete Selected
      </Button>
      <Button
        variant="outline"
        onClick={() => handleBulkAction("void")}
        disabled={!selectedPOs.some(id => ["Send", "PartialReceived"].includes(currentItems.find(po => po.poId === id)?.status || ""))}
      >
        Void Selected
      </Button>
      <Button
        variant="outline"
        onClick={() => handleBulkAction("close")}
        disabled={!selectedPOs.some(id => ["Open", "Send", "PartialReceived"].includes(currentItems.find(po => po.poId === id)?.status || ""))}
      >
        Close Selected
      </Button>
    </div>
  ) : null;

  const actionButtons = (
    <div className="flex space-x-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default">New Purchase Order</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setIsCreateFromPROpen(true)}>Select Purchase Request</DropdownMenuItem>
          <DropdownMenuItem onSelect={handleCreateManually}>Manually</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" onClick={() => setIsExportOpen(true)}>
        <FileDown className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline" onClick={() => setIsPrintOpen(true)}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
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

  
