"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CurrencyCode } from "@/types/types";
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

// This is a mock data structure. Replace with actual data fetching logic.
const purchaseOrders = [
  {
    id: 1,
    number: "PO-001",
    date: "2023-08-01",
    vendor: "Luxury Linens Co.",
    total: 1000.0,
    status: "Open",
    email: "orders@luxurylinens.com",
  },
  {
    id: 2,
    number: "PO-002",
    date: "2023-08-02",
    vendor: "Gourmet Kitchen Supplies",
    total: 1500.5,
    status: "Send",
    email: "sales@gourmetkitchen.com",
  },
  {
    id: 3,
    number: "PO-003",
    date: "2023-08-03",
    vendor: "Elegant Furniture Solutions",
    total: 2500.75,
    status: "Closed",
    email: "info@elegantfurniture.com",
  },
  {
    id: 4,
    number: "PO-004",
    date: "2023-08-04",
    vendor: "Eco-Friendly Cleaning Supplies",
    total: 750.25,
    status: "Open",
    email: "orders@ecoclean.com",
  },
  {
    id: 5,
    number: "PO-005",
    date: "2023-08-05",
    vendor: "Smart Room Technologies",
    total: 3000.0,
    status: "Send",
    email: "sales@smartroom.com",
  },
  {
    id: 6,
    number: "PO-006",
    date: "2023-08-06",
    vendor: "Hospitality Essentials Inc.",
    total: 500.5,
    status: "Partial Received",
    email: "orders@hospitalityessentials.com",
  },
  {
    id: 7,
    number: "PO-007",
    date: "2023-08-07",
    vendor: "Luxe Bedding & Bath",
    total: 4500.0,
    status: "Open",
    email: "sales@luxebedding.com",
  },
  {
    id: 8,
    number: "PO-008",
    date: "2023-08-08",
    vendor: "Hotel Maintenance Supplies",
    total: 2000.25,
    status: "Send",
    email: "orders@hotelmaintenance.com",
  },
  {
    id: 9,
    number: "PO-009",
    date: "2023-08-09",
    vendor: "Guest Amenities Co.",
    total: 1750.75,
    status: "Closed",
    email: "info@guestamenities.com",
  },
  {
    id: 10,
    number: "PO-010",
    date: "2023-08-10",
    vendor: "Premium Hotel Furnishings",
    total: 3500.0,
    status: "Partial Received",
    email: "sales@premiumhotelfurnishings.com",
  },
];

// Mock data for Purchase Requests
const purchaseRequests = [
  {
    id: 1,
    refNumber: "PR-001",
    date: "2023-08-01",
    description: "Bed Linens",
    deliveryDate: "2023-08-15",
    status: "Approved",
  },
  {
    id: 2,
    refNumber: "PR-002",
    date: "2023-08-02",
    description: "Toiletries",
    deliveryDate: "2023-08-20",
    status: "Pending",
  },
  {
    id: 3,
    refNumber: "PR-003",
    date: "2023-08-03",
    description: "Room Furniture",
    deliveryDate: "2023-08-25",
    status: "Approved",
  },
  {
    id: 4,
    refNumber: "PR-004",
    date: "2023-08-04",
    description: "Cleaning Supplies",
    deliveryDate: "2023-08-18",
    status: "Approved",
  },
  {
    id: 5,
    refNumber: "PR-005",
    date: "2023-08-05",
    description: "Restaurant Equipment",
    deliveryDate: "2023-08-30",
    status: "Pending",
  },
  {
    id: 6,
    refNumber: "PR-006",
    date: "2023-08-06",
    description: "Pool Maintenance Supplies",
    deliveryDate: "2023-08-22",
    status: "Approved",
  },
  {
    id: 7,
    refNumber: "PR-007",
    date: "2023-08-07",
    description: "In-room Electronics",
    deliveryDate: "2023-09-01",
    status: "Pending",
  },
  {
    id: 8,
    refNumber: "PR-008",
    date: "2023-08-08",
    description: "Spa Products",
    deliveryDate: "2023-08-28",
    status: "Approved",
  },
  {
    id: 9,
    refNumber: "PR-009",
    date: "2023-08-09",
    description: "Gym Equipment",
    deliveryDate: "2023-09-05",
    status: "Pending",
  },
  {
    id: 10,
    refNumber: "PR-010",
    date: "2023-08-10",
    description: "Conference Room Supplies",
    deliveryDate: "2023-08-24",
    status: "Approved",
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
  const [selectedPRs, setSelectedPRs] = useState<number[]>([]);
  const [generatedPOs, setGeneratedPOs] = useState<typeof purchaseOrders>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [newManualPO, setNewManualPO] = useState({
    number: "",
    date: "",
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
          po.vendor.toLowerCase().includes(searchTerm.toLowerCase())) &&
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
        prevPOs.map((po) =>
          poIds.includes(po.id)
            ? {
                ...po,
                status:
                  action === "delete"
                    ? "Deleted"
                    : action === "void"
                    ? "Voided"
                    : "Closed",
              }
            : po
        )
      );
    }
  };

  const handleSelectPO = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedPOs([...selectedPOs, id]);
    } else {
      setSelectedPOs(selectedPOs.filter((poId) => poId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPOs(currentItems.map((po) => po.id));
    } else {
      setSelectedPOs([]);
    }
  };

  const handleGeneratePOs = () => {
    // Here you would implement the logic to generate POs from the selected PRs
    // For this example, we'll just create dummy POs
    const newPOs = selectedPRs.map((prId) => {
      const pr = purchaseRequests.find((pr) => pr.id === prId);
      return {
        id: Math.max(...purchaseOrders.map((po) => po.id)) + 1,
        number: `PO-${String(Math.random()).slice(2, 6)}`,
        date: new Date().toISOString().split("T")[0],
        vendor: "Auto Generated Vendor",
        total: Math.random() * 10000,
        status: "Open",
        email: "autogenerated@vendor.com",
      };
    });

    setGeneratedPOs(newPOs);
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
          <Card key={po.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedPOs.includes(po.id)}
                    onCheckedChange={(checked) => handleSelectPO(po.id, checked as boolean)}
                  />
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        po.status === "Open"
                          ? "default"
                          : po.status === "Send"
                          ? "secondary"
                          : po.status === "Partial Received"
                          ? "secondary"
                          : po.status === "Closed"
                          ? "outline"
                          : "destructive"
                      }
                    >
                      {po.status}
                    </Badge>
                    <h3 className="text-lg font-semibold">
                      {po.vendor} <span className="text-sm font-normal text-muted-foreground">({po.number})</span>
                    </h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/procurement/purchase-orders/${po.id}`}>
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
                      {po.status === "Open" && (
                        <DropdownMenuItem
                          onSelect={() => handleBulkAction("delete", [po.id])}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                      {["Send", "Partial Received"].includes(po.status) && (
                        <DropdownMenuItem
                          onSelect={() => handleBulkAction("void", [po.id])}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Void
                        </DropdownMenuItem>
                      )}
                      {["Open", "Send", "Partial Received"].includes(
                        po.status
                      ) && (
                        <DropdownMenuItem
                          onSelect={() => handleBulkAction("close", [po.id])}
                        >
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Close
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={() => handlePrintPO(po.id)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleSendEmail(po.id)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p>{po.date}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total</Label>
                  <p>${po.total.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p>{po.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintPO(po.id)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendEmail(po.id)}
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

            <Select
              value={selectedCurrency}
              onValueChange={(value) =>
                setSelectedCurrency(value as CurrencyCode)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CurrencyCode).map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Select</TableHead>
                  <TableHead>Ref#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Delivery Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseRequests.map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPRs.includes(pr.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPRs([...selectedPRs, pr.id]);
                          } else {
                            setSelectedPRs(
                              selectedPRs.filter((id) => id !== pr.id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{pr.refNumber}</TableCell>
                    <TableCell>{pr.date}</TableCell>
                    <TableCell>{pr.description}</TableCell>
                    <TableCell>{pr.deliveryDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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
        <DialogContent className="sm:max-w-[800px]">
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
                  <TableRow key={po.id}>
                    <TableCell>{po.number}</TableCell>
                    <TableCell>{po.vendor}</TableCell>
                    <TableCell>{po.email}</TableCell>
                    <TableCell>${po.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintPO(po.id)}
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
                value={newManualPO.date}
                onChange={(e) =>
                  setNewManualPO({ ...newManualPO, date: e.target.value })
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
                  id: Math.max(...purchaseOrders.map((po) => po.id)) + 1,
                  ...newManualPO,
                };
                setFilteredPOs([...filteredPOs, newPO]);
                setIsCreateManuallyOpen(false);
                setNewManualPO({
                  number: "",
                  date: "",
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
        disabled={!selectedPOs.some(id => currentItems.find(po => po.id === id)?.status === "Open")}
      >
        Delete Selected
      </Button>
      <Button
        variant="outline"
        onClick={() => handleBulkAction("void")}
        disabled={!selectedPOs.some(id => ["Send", "Partial Received"].includes(currentItems.find(po => po.id === id)?.status || ""))}
      >
        Void Selected
      </Button>
      <Button
        variant="outline"
        onClick={() => handleBulkAction("close")}
        disabled={!selectedPOs.some(id => ["Open", "Send", "Partial Received"].includes(currentItems.find(po => po.id === id)?.status || ""))}
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

  
