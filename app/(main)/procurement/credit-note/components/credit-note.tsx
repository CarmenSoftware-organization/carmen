"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CnLotApplication } from "./cn-lot-application";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import JournalEntries  from "./journal-entries"
import TaxEntries  from "./tax-entries"
import StockMovementContent from "./stock-movement";
import StatusBadge from "@/components/ui/custom-status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom-dialog";
import {
  Edit,
  Save,
  Trash2,
  Send,
  Printer,
  PanelRightOpen,
  PanelRightClose,
  History,
  ArrowLeft,
  XIcon,
  Paperclip,
  Plus,
  Info,
  Package,
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


type CreditNoteType = "QUANTITY_RETURN" | "AMOUNT_DISCOUNT";
type CreditNoteStatus = "DRAFT" | "POSTED" | "VOID";

interface CreditNoteHeaderProps {
  creditNoteNumber: string;
  date: string;
  type: CreditNoteType;
  status: CreditNoteStatus;
  vendorName: string;
  vendorCode: string;
  currency: string;
  exchangeRate: string;
  invoiceReference: string;
  invoiceDate: string;
  taxInvoiceReference: string;
  taxDate: string;
  grnReference: string;
  grnDate: string;
  reason: string;
  description: string;
  onHeaderChange: (field: string, value: string) => void;
  showPanel: boolean;
  setShowPanel: (show: boolean) => void;
}

function CreditNoteHeader({
  creditNoteNumber,
  date,
  type,
  status,
  vendorName,
  vendorCode,
  currency,
  exchangeRate,
  invoiceReference,
  invoiceDate,
  taxInvoiceReference,
  taxDate,
  grnReference,
  grnDate,
  reason,
  description,
  onHeaderChange,
  showPanel,
  setShowPanel,
}: CreditNoteHeaderProps) {
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold">Credit Note</h2>
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="default" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Commit
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPanel(!showPanel)}
            >
              {showPanel ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-6">
          <div className="space-y-2">
            <Label htmlFor="creditNoteNumber">Credit Note #</Label>
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
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="vendorName">Vendor</Label>
            <Input
              id="vendorName"
              value={`${vendorName} (${vendorCode})`}
              onChange={(e) => {
                const value = e.target.value;
                const match = value.match(/(.*?)\s*\((.*?)\)/);
                if (match) {
                  onHeaderChange("vendorName", match[1].trim());
                  onHeaderChange("vendorCode", match[2].trim());
                } else {
                  onHeaderChange("vendorName", value);
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={`${currency} (${exchangeRate})`}
              onChange={(e) => {
                const value = e.target.value;
                const match = value.match(/(.*?)\s*\((.*?)\)/);
                if (match) {
                  onHeaderChange("currency", match[1].trim());
                  onHeaderChange("exchangeRate", match[2].trim());
                } else {
                  onHeaderChange("currency", value);
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grnReference">GRN #</Label>
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
              value={grnDate}
              onChange={(e) => onHeaderChange("grnDate", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="reason">Reason</Label>
            <Select
              value={reason}
              onValueChange={(value) => onHeaderChange("reason", value)}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="WRONG_DELIVERY">Wrong Delivery</SelectItem>
                <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                <SelectItem value="PRICE_ADJUSTMENT">Price Adjustment</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceReference">Invoice #</Label>
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
            <Label htmlFor="taxInvoiceReference">Tax Invoice #</Label>
            <Input
              id="taxInvoiceReference"
              value={taxInvoiceReference}
              onChange={(e) =>
                onHeaderChange("taxInvoiceReference", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxDate">Tax Invoice Date</Label>
            <Input
              id="taxDate"
              value={taxDate}
              onChange={(e) => onHeaderChange("taxDate", e.target.value)}
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

interface CreditNoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export function CreditNoteComponent() {
  const [showPanel, setShowPanel] = useState(false);
  const [headerData, setHeaderData] = useState({
    creditNoteNumber: "CN-2024-001",
    date: "2024-03-20",
    type: "QUANTITY_RETURN" as CreditNoteType,
    status: "DRAFT" as CreditNoteStatus,
    vendorName: "Thai Beverage Co.",
    vendorCode: "VEN-001",
    currency: "THB",
    exchangeRate: "1.0000",
    invoiceReference: "INV-2024-0123",
    invoiceDate: "2024-03-15",
    taxInvoiceReference: "TAX-2024-0123",
    taxDate: "2024-03-15",
    grnReference: "GRN-2024-0089",
    grnDate: "2024-03-10",
    reason: "",
    description: "Credit note for damaged beverage products received in last shipment. Items show signs of mishandling during transport.",
  });

  const handleHeaderChange = (field: string, value: string) => {
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const [openInfo, setOpenInfo] = useState(Boolean);

  const handleOpeninfo = () => {
    setOpenInfo(!openInfo);
  };

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      user: 'John Doe',
      avatar: '/avatars/john-doe.png',
      content: 'Vendor confirmed the return details.',
      timestamp: '2024-03-20 09:30 AM',
      attachments: ['return_confirmation.pdf'],
    },
    {
      id: '2',
      user: 'Jane Smith',
      avatar: '/avatars/jane-smith.png',
      content: 'Quality inspection completed on returned items.',
      timestamp: '2024-03-20 02:15 PM',
      attachments: ['inspection_report.pdf', 'damage_photos.zip'],
    },
  ]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now().toString(),
        user: 'Current User',
        avatar: '/avatars/current-user.png',
        content: newComment,
        timestamp: new Date().toLocaleString(),
        attachments: [], // Initialize with empty attachments array
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
    }
  };

  const mockItems: CreditNoteItem[] = [
    {
      id: '1',
      description: 'Coffee mate 450 g.',
      quantity: 10,
      unitPrice: 1250.00,
      total: 12500.00
    },
    {
      id: '2',
      description: 'Heineken Beer 330ml',
      quantity: 5,
      unitPrice: 2040.00,
      total: 10200.00
    }
  ]

  const auditLogs = [
    {
      id: '1',
      user: 'John Doe',
      action: 'Created',
      details: 'Credit Note #CN-2024-001',
      timestamp: '2024-03-20 09:00 AM'
    },
    {
      id: '2',
      user: 'Jane Smith',
      action: 'Updated',
      details: 'Changed amount from $1,000 to $2,000',
      timestamp: '2024-03-20 09:30 AM'
    },
    {
      id: '3',
      user: 'Mike Johnson',
      action: 'Added Item',
      details: 'Added product XYZ-123',
      timestamp: '2024-03-20 10:15 AM'
    }
  ];

  const [activeTab, setActiveTab] = useState("details")
  const [items, setItems] = useState<CreditNoteItem[]>([])

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Select>
                  <option value="">Select Vendor</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input type="date" id="date" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={4} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="items">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitPrice}</TableCell>
                    <TableCell>{item.total}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="attachments">
            {/* Attachments upload will go here */}
          </TabsContent>
        </Tabs>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Credit Note</Button>
      </div>

      <div className={`flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4`}>
        <div className={`flex-grow space-y-4 ${showPanel ? 'lg:w-3/4' : 'w-full'}`}>
          <CreditNoteHeader 
            {...headerData}
            onHeaderChange={handleHeaderChange} 
            showPanel={showPanel} 
            setShowPanel={setShowPanel} 
          />
          <Tabs defaultValue="itemDetails" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="itemDetails">Item Details</TabsTrigger>
              <TabsTrigger value="stockMovement">Stock Movement</TabsTrigger>
              <TabsTrigger value="journalEntries">Journal Entries</TabsTrigger>
              <TabsTrigger value="taxEntries">Tax Entries</TabsTrigger>
            </TabsList>
            <TabsContent value="itemDetails">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Item Details</CardTitle>
                  <Button variant="default" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px] font-bold">Location</TableHead>
                        <TableHead className="w-[200px] font-bold">Product</TableHead>
                        <TableHead className="font-bold">Quantity</TableHead>
                        <TableHead className="font-bold">Unit</TableHead>
                        <TableHead className="font-bold">Price</TableHead>
                        <TableHead className="font-bold">Net Amount</TableHead>
                        <TableHead className="font-bold">Tax Amount</TableHead>
                        <TableHead className="font-bold">Total Amount</TableHead>
                        <TableHead className="text-right font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>{item.description}</div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>{item.description}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.quantity}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.description}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.unitPrice.toFixed(2)}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.total.toFixed(2)}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.total.toFixed(2)}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.total.toFixed(2)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpeninfo()}
                                className="h-8 w-8"
                              >
                                <Info className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Item</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Item</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="stockMovement">
              <StockMovementContent />
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
                      <TableHead className="font-bold">Description</TableHead>
                      <TableHead className="text-right font-bold">Amount (USD)</TableHead>
                      <TableHead className="text-right font-bold">Base Amount (PHP)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Sub Total Amount</TableCell>
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
        </div>
        
        {showPanel && (
          <div className="lg:w-1/4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Comments & Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar>
                        <AvatarImage src={comment.avatar} alt={comment.user} />
                        <AvatarFallback>{comment.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{comment.user}</div>
                          <div className="text-xs text-muted-foreground">{comment.timestamp}</div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm text-muted-foreground">
                              {comment.attachments.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2 mt-4">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Paperclip className="h-4 w-4" />
                      <span className="sr-only">Attach File</span>
                    </Button>
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="default" size="sm" onClick={handleAddComment}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <History className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{log.user}</div>
                          <div className="text-xs text-muted-foreground">{log.timestamp}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.action} - {log.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Dialog open={openInfo} onOpenChange={setOpenInfo}>
        <DialogContent className="sm:max-w-[80vw] bg-white [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center border-b pb-4">
              <DialogTitle>
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
