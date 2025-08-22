"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeftIcon, ExclamationTriangleIcon, PaperPlaneIcon } from "@radix-ui/react-icons"

export default function ReceivingEntryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const poId = params.id

  // Mock data for PO details
  const poDetails = {
    id: poId,
    vendor: "Fresh Produce Inc.",
    expectedDelivery: "Today, 10:00 AM",
    status: "Open",
    location: "Main Kitchen",
    value: "$1,245.50",
    items: [
      {
        id: "1",
        name: "Tomatoes, Roma",
        sku: "VEG-TOM-001",
        uom: "KG",
        orderedQty: 25,
        outstandingQty: 25,
        price: 3.99,
        tax: 0,
      },
      {
        id: "2",
        name: "Lettuce, Iceberg",
        sku: "VEG-LET-002",
        uom: "EA",
        orderedQty: 15,
        outstandingQty: 15,
        price: 2.49,
        tax: 0,
      },
      {
        id: "3",
        name: "Onions, Yellow",
        sku: "VEG-ONI-003",
        uom: "KG",
        orderedQty: 20,
        outstandingQty: 20,
        price: 1.99,
        tax: 0,
      },
      {
        id: "4",
        name: "Peppers, Bell",
        sku: "VEG-PEP-004",
        uom: "KG",
        orderedQty: 10,
        outstandingQty: 10,
        price: 4.99,
        tax: 0,
      },
      {
        id: "5",
        name: "Cucumbers",
        sku: "VEG-CUC-005",
        uom: "KG",
        orderedQty: 12,
        outstandingQty: 12,
        price: 2.99,
        tax: 0,
      },
    ],
  }

  // State for received quantities
  const [receivedItems, setReceivedItems] = useState(
    poDetails.items.map((item) => ({
      id: item.id,
      receivedQty: item.outstandingQty.toString(),
      foc: false,
      comment: "",
      hasPhoto: false,
      hasVariance: false,
    })),
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuantityChange = (id: string, value: string) => {
    setReceivedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const originalItem = poDetails.items.find((i) => i.id === id)
          return {
            ...item,
            receivedQty: value,
            hasVariance: !!(originalItem && Number(value) !== Number(originalItem.outstandingQty)),
          }
        }
        return item
      }),
    )
  }

  const handleFocChange = (id: string, checked: boolean) => {
    setReceivedItems((prev) => prev.map((item) => (item.id === id ? { ...item, foc: checked } : item)))
  }

  const handleCommentChange = (id: string, value: string) => {
    setReceivedItems((prev) => prev.map((item) => (item.id === id ? { ...item, comment: value } : item)))
  }

  const handlePhotoAttach = (id: string) => {
    setReceivedItems((prev) => prev.map((item) => (item.id === id ? { ...item, hasPhoto: true } : item)))
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      router.push(`/receiving/${poId}/confirm`)
    }, 1000)
  }

  const handleSaveDraft = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/receiving")
    }, 1000)
  }

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Link href={`/receiving/${poId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Receiving Entry</h1>
        </div>

        <div className="bg-muted p-3 rounded-md mb-6">
          <div className="text-sm mb-1">
            <span className="font-medium">GRN Reference:</span> GRN-{poId}-DRAFT
          </div>
          <div className="text-sm mb-1">
            <span className="font-medium">Vendor:</span> {poDetails.vendor}
          </div>
          <div className="text-sm">
            <span className="font-medium">Delivery Point:</span> {poDetails.location}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {poDetails.items.map((item, index) => {
            const receivedItem = receivedItems.find((i) => i.id === item.id)

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-3 bg-background">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.sku} | {item.uom}
                    </div>
                  </div>

                  <div className="p-3 border-t">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Ordered</div>
                        <div className="text-sm font-medium">{item.orderedQty}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
                        <div className="text-sm font-medium">{item.outstandingQty}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Received</div>
                        <Input
                          type="number"
                          value={receivedItem?.receivedQty || "0"}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>

                    {receivedItem?.hasVariance && (
                      <Alert variant="destructive" className="mb-3">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertDescription>Quantity variance detected. Please add a comment.</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <Checkbox
                        id={`foc-${item.id}`}
                        checked={receivedItem?.foc || false}
                        onCheckedChange={(checked) => handleFocChange(item.id, checked as boolean)}
                      />
                      <label
                        htmlFor={`foc-${item.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Free of Charge
                      </label>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Textarea
                        placeholder="Add comment (required for variances)"
                        value={receivedItem?.comment || ""}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-full aspect-square"
                        onClick={() => handlePhotoAttach(item.id)}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>

                    {receivedItem?.hasPhoto && <div className="mt-2 text-xs text-muted-foreground">Photo attached</div>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleSaveDraft} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
            <PaperPlaneIcon className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </div>
      </div>
    </>
  )
}
