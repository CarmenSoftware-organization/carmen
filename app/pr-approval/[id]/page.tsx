"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  CornerDownLeft,
  Clock,
  Building,
  FileText,
} from "lucide-react"
import { ArrowLeftIcon, PersonIcon, CalendarIcon } from "@radix-ui/react-icons"

export default function PRDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const prId = params.id

  const [action, setAction] = useState<"approve" | "reject" | "return" | null>(null)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data for PR details
  const prDetails = {
    id: prId,
    requester: "John Smith",
    department: "Main Kitchen",
    supplier: "Fresh Produce Inc.",
    date: "May 11, 2025",
    status: "Pending",
    value: "$845.50",
    urgent: true,
    justification: "Weekly stock replenishment for fresh produce. Urgent as current stock is running low.",
    items: [
      {
        id: "1",
        name: "Tomatoes, Roma",
        sku: "VEG-TOM-001",
        quantity: 25,
        uom: "KG",
        price: 3.99,
        tax: 0,
        onHand: 2,
        onOrder: 0,
      },
      {
        id: "2",
        name: "Lettuce, Iceberg",
        sku: "VEG-LET-002",
        quantity: 15,
        uom: "EA",
        price: 2.49,
        tax: 0,
        onHand: 1,
        onOrder: 0,
      },
      {
        id: "3",
        name: "Onions, Yellow",
        sku: "VEG-ONI-003",
        quantity: 20,
        uom: "KG",
        price: 1.99,
        tax: 0,
        onHand: 3,
        onOrder: 0,
      },
      {
        id: "4",
        name: "Peppers, Bell",
        sku: "VEG-PEP-004",
        quantity: 10,
        uom: "KG",
        price: 4.99,
        tax: 0,
        onHand: 0,
        onOrder: 0,
      },
      {
        id: "5",
        name: "Cucumbers",
        sku: "VEG-CUC-005",
        quantity: 12,
        uom: "KG",
        price: 2.99,
        tax: 0,
        onHand: 1,
        onOrder: 0,
      },
    ],
    approvalHistory: [
      {
        step: "Submitted",
        user: "John Smith",
        role: "Kitchen Manager",
        date: "May 11, 2025 09:15 AM",
        status: "Completed",
      },
      {
        step: "Department Approval",
        user: "Lisa Johnson",
        role: "F&B Director",
        date: "May 11, 2025 10:30 AM",
        status: "Completed",
      },
      {
        step: "Financial Approval",
        user: "Current User",
        role: "Financial Controller",
        date: "",
        status: "Pending",
      },
    ],
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      router.push(`/pr-approval/${prId}/confirm?action=${action}`)
    }, 1000)
  }

  const closeDialog = () => {
    setAction(null)
    setReason("")
  }

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/pr-approval">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Purchase Request Details</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xl font-bold">{prDetails.id}</div>
              <div className="flex gap-2">
                {prDetails.urgent && <Badge variant="destructive">Urgent</Badge>}
                <Badge>{prDetails.status}</Badge>
              </div>
            </div>

            <div className="grid gap-3 mb-4">
              <div className="flex items-center gap-2">
                <PersonIcon className="h-4 w-4 text-muted-foreground" />
                <span>Requester: {prDetails.requester}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Date: {prDetails.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>Department: {prDetails.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Supplier: {prDetails.supplier}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Total Value: {prDetails.value}</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Justification:</h3>
              <p className="text-sm bg-muted p-3 rounded-md">{prDetails.justification}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Approval History:</h3>
              <div className="space-y-2">
                {prDetails.approvalHistory.map((step, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded-md ${
                      step.status === "Completed"
                        ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
                        : "bg-muted"
                    }`}
                  >
                    <div className="font-medium">{step.step}</div>
                    <div>
                      {step.user} ({step.role})
                    </div>
                    <div>{step.date || "Pending"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Vendor Assignment:</h3>
              <Select defaultValue={prDetails.supplier}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fresh Produce Inc.">Fresh Produce Inc.</SelectItem>
                  <SelectItem value="Farm Direct">Farm Direct</SelectItem>
                  <SelectItem value="Organic Farms">Organic Farms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-lg font-medium mb-3">Line Items</h2>
        <div className="border rounded-md overflow-hidden mb-6">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 bg-muted text-sm font-medium">
            <div>Item</div>
            <div className="text-right">Qty</div>
            <div className="text-right">On Hand</div>
          </div>

          {prDetails.items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 border-t text-sm">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.sku} | {item.uom}
                </div>
              </div>
              <div className="text-right self-center">{item.quantity}</div>
              <div className="text-right self-center">{item.onHand}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="w-full" onClick={() => setAction("return")}>
            <CornerDownLeft className="h-4 w-4 mr-2" />
            Return
          </Button>
          <Button variant="destructive" className="w-full" onClick={() => setAction("reject")}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button className="w-full" onClick={() => setAction("approve")}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </div>
      </div>

      <Dialog open={action === "reject" || action === "return"} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "reject" ? "Reject Purchase Request" : "Return Purchase Request"}</DialogTitle>
            <DialogDescription>Please provide a reason for this action.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              variant={action === "reject" ? "destructive" : "default"}
              onClick={handleSubmit}
              disabled={!reason || isSubmitting}
            >
              {isSubmitting ? "Processing..." : action === "reject" ? "Reject" : "Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={action === "approve"} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Purchase Request</DialogTitle>
            <DialogDescription>Are you sure you want to approve this purchase request?</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Optional comments..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
